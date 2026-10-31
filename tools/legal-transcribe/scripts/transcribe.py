#!/usr/bin/env python3
"""녹음파일 병렬 받아쓰기 (로컬 전용, 외부 전송 없음).

긴 녹음은 무음 구간에서 여러 조각으로 자르고, 조각을 여러 작업자가 동시에 받아쓴 뒤
시간순으로 다시 합친다. 여러 파일을 한꺼번에 넣으면 모든 조각을 한 대기열에서 처리한다.

사용 예:
    python3 transcribe.py 녹음1.m4a 녹음2.mp3 --out-dir ./녹취록
    python3 transcribe.py ./의뢰인자료 --prompt "갑, 을, 역삼로, 근저당"
    python3 transcribe.py --check          # 이 컴퓨터에서 쓸 엔진·작업자 수만 확인

결과:
    <파일명>.녹취록.txt   [00:12:34] 발언 형식 (서면 인용용 시각 포함)
    <파일명>.녹취록.json  구간별 시작·끝 시각, 원본 해시, 엔진 정보
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import hashlib
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

AUDIO_EXTS = {
    ".mp3", ".m4a", ".wav", ".aac", ".ogg", ".oga", ".opus", ".flac", ".wma",
    ".amr", ".3gp", ".3ga", ".webm", ".mp4", ".mov", ".mkv", ".m4v", ".caf",
}
DEFAULT_MODEL = "large-v3-turbo"
MLX_REPOS = {
    "large-v3-turbo": "mlx-community/whisper-large-v3-turbo",
    "large-v3": "mlx-community/whisper-large-v3-mlx",
    "medium": "mlx-community/whisper-medium-mlx",
    "small": "mlx-community/whisper-small-mlx",
}
CACHE_ROOT = Path(os.environ.get("LEGAL_TRANSCRIBE_CACHE",
                                 Path.home() / ".cache" / "legal-transcribe"))


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


# ---------------------------------------------------------------- 환경 판단

def has_module(name: str) -> bool:
    import importlib.util
    return importlib.util.find_spec(name) is not None


def cuda_available() -> bool:
    try:
        import ctranslate2
        return ctranslate2.get_cuda_device_count() > 0
    except Exception:
        return False


def total_mem_gb() -> float:
    try:
        if sys.platform == "darwin":
            out = subprocess.run(["sysctl", "-n", "hw.memsize"], capture_output=True, text=True)
            return int(out.stdout.strip()) / 1024 ** 3
        if hasattr(os, "sysconf"):
            return os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES") / 1024 ** 3
    except Exception:
        pass
    return 8.0


def pick_engine(requested: str) -> str:
    if requested != "auto":
        return requested
    apple_silicon = sys.platform == "darwin" and platform.machine() == "arm64"
    if apple_silicon and has_module("mlx_whisper"):
        return "mlx"
    if has_module("faster_whisper"):
        return "faster-whisper"
    raise SystemExit("받아쓰기 엔진이 없습니다. setup.sh(맥·리눅스) 또는 setup.ps1(윈도)을 먼저 실행하세요.")


def plan_workers(engine: str, requested: int | None, n_tasks: int) -> tuple[int, int, str]:
    """(작업자 수, 작업자당 CPU 스레드, 장치) 반환."""
    cores = os.cpu_count() or 4
    if engine == "mlx":
        # 애플 GPU 하나를 여러 프로세스가 나눠 쓰면 오히려 느려진다. 조각 단위로 순서대로 처리.
        return 1, cores, "mlx-gpu"
    if cuda_available():
        # GPU는 한 프로세스가 묶음(batch) 추론으로 내부에서 병렬 처리한다.
        return (requested or 1), cores, "cuda"
    # CPU: 스레드 4개짜리 작업자 여러 개가 스레드 많은 작업자 1개보다 처리량이 높다.
    # 작업자 1개당 메모리 약 2~3GB(turbo, int8, 묶음 추론) 기준으로 상한을 둔다.
    by_cpu = max(1, cores // 4)
    by_mem = max(1, int(total_mem_gb() // 3))
    n = requested or min(by_cpu, by_mem)
    n = max(1, min(n, n_tasks))
    threads = max(1, cores // n)
    return n, threads, "cpu"


# ---------------------------------------------------------------- 오디오 준비

def require_ffmpeg() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise SystemExit(f"{tool}가 없습니다. setup 스크립트를 먼저 실행하세요.")


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def duration_of(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        raise SystemExit(f"길이를 읽지 못했습니다(손상 파일일 수 있음): {path.name}")


def to_wav16k(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(src),
         "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(dst)],
        check=True)


def silence_midpoints(wav: Path) -> list[float]:
    out = subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "info", "-i", str(wav),
         "-af", "silencedetect=noise=-35dB:d=0.4", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out.stderr)]
    return [(s + e) / 2 for s, e in zip(starts, ends)]


def cut_points(duration: float, chunk_sec: float, silences: list[float]) -> list[float]:
    """목표 길이마다 가장 가까운 무음 지점에서 자른다(앞뒤 25% 범위 안). 없으면 그냥 자른다."""
    if duration <= chunk_sec * 1.3:
        return [0.0, duration]
    points = [0.0]
    target = chunk_sec
    window = chunk_sec * 0.25
    while target < duration - chunk_sec * 0.3:
        near = [s for s in silences if abs(s - target) <= window and s > points[-1] + 30]
        cut = min(near, key=lambda s: abs(s - target)) if near else target
        points.append(cut)
        target = cut + chunk_sec
    points.append(duration)
    return points


def split_wav(wav: Path, points: list[float], out_dir: Path) -> list[tuple[Path, float]]:
    chunks = []
    for i, (a, b) in enumerate(zip(points, points[1:])):
        dst = out_dir / f"chunk_{i:03d}.wav"
        subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
             "-i", str(wav), "-c", "copy", str(dst)],
            check=True)
        chunks.append((dst, a))
    return chunks


# ---------------------------------------------------------------- 작업자

_MODEL = None
_CFG: dict = {}


def worker_init(cfg: dict) -> None:
    global _MODEL, _CFG
    _CFG = cfg
    if cfg["engine"] == "faster-whisper":
        from faster_whisper import WhisperModel, BatchedInferencePipeline
        # 묶음(batch) 추론: 조각 안의 발화 구간 여러 개를 한 번에 계산한다(CPU에서도 빨라짐)
        if cfg["device"] == "cuda":
            base = WhisperModel(cfg["model"], device="cuda", compute_type="float16")
        else:
            base = WhisperModel(cfg["model"], device="cpu", compute_type="int8",
                                cpu_threads=cfg["threads"], num_workers=1)
        _MODEL = BatchedInferencePipeline(model=base)
    elif cfg["engine"] == "mlx":
        import mlx_whisper  # noqa: F401  모델은 첫 호출 때 받아서 캐시에 둔다
        _MODEL = MLX_REPOS.get(cfg["model"], cfg["model"])


def transcribe_chunk(path: str) -> list[dict]:
    cfg = _CFG
    lang = cfg["language"] or None
    prompt = cfg["prompt"] or None
    segs: list[dict] = []
    if cfg["engine"] == "faster-whisper":
        kwargs = dict(language=lang, initial_prompt=prompt, vad_filter=True,
                      condition_on_previous_text=False, beam_size=5)
        it, _ = _MODEL.transcribe(path, batch_size=16 if cfg["device"] == "cuda" else 8, **kwargs)
        for s in it:
            segs.append({"start": s.start, "end": s.end, "text": s.text.strip()})
    elif cfg["engine"] == "mlx":
        import mlx_whisper
        r = mlx_whisper.transcribe(path, path_or_hf_repo=_MODEL, language=lang,
                                   initial_prompt=prompt, condition_on_previous_text=False)
        for s in r["segments"]:
            segs.append({"start": s["start"], "end": s["end"], "text": s["text"].strip()})
    return [s for s in segs if s["text"]]


def run_task(task: dict) -> tuple[dict, list[dict], float]:
    t0 = time.time()
    segs = transcribe_chunk(task["path"])
    return task, segs, time.time() - t0


# ---------------------------------------------------------------- 출력

def hms(sec: float) -> str:
    sec = int(sec)
    return f"{sec // 3600:02d}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


def write_outputs(job: dict, segments: list[dict], out_dir: Path, meta: dict) -> tuple[Path, Path]:
    stem = job["src"].stem
    txt = out_dir / f"{stem}.녹취록.txt"
    js = out_dir / f"{stem}.녹취록.json"
    lines = [
        f"원본 파일: {job['src'].name}",
        f"녹음 길이: {hms(job['duration'])}",
        f"원본 SHA-256: {job['sha']}",
        f"변환: {meta['engine']} / {meta['model']} / {meta['created']}",
        "자동 받아쓰기 결과입니다. 서면에 인용할 부분은 원음과 대조해야 합니다.",
        "",
    ]
    lines += [f"[{hms(s['start'])}] {s['text']}" for s in segments]
    txt.write_text("\n".join(lines) + "\n", encoding="utf-8")
    js.write_text(json.dumps({
        "source": job["src"].name, "sha256": job["sha"], "duration": job["duration"],
        **meta, "segments": segments,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    return txt, js


# ---------------------------------------------------------------- 본체

def collect(inputs: list[str]) -> list[Path]:
    files: list[Path] = []
    for raw in inputs:
        p = Path(raw).expanduser()
        if p.is_dir():
            files += sorted(q for q in p.rglob("*")
                            if q.suffix.lower() in AUDIO_EXTS and ".녹취록" not in q.name)
        elif p.is_file():
            files.append(p)
        else:
            log(f"찾을 수 없음, 건너뜀: {raw}")
    seen, uniq = set(), []
    for f in files:
        r = f.resolve()
        if r not in seen:
            seen.add(r)
            uniq.append(f)
    return uniq


def main() -> None:
    ap = argparse.ArgumentParser(description="녹음파일 병렬 받아쓰기(로컬 전용)")
    ap.add_argument("inputs", nargs="*", help="녹음파일 또는 폴더")
    ap.add_argument("--out-dir", help="결과 폴더(기본: 원본과 같은 폴더)")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--language", default="ko", help="빈 문자열이면 자동 감지")
    ap.add_argument("--prompt", default="", help="고유명사·용어 힌트(인명은 갑·을로 비식별화 권장)")
    ap.add_argument("--engine", default="auto", choices=["auto", "faster-whisper", "mlx"])
    ap.add_argument("--workers", type=int, help="동시 작업자 수(기본: 자동)")
    ap.add_argument("--chunk-min", type=float, default=8.0, help="조각 목표 길이(분)")
    ap.add_argument("--force", action="store_true", help="저장된 결과 무시하고 다시 변환")
    ap.add_argument("--check", action="store_true", help="엔진·작업자 계획만 출력")
    args = ap.parse_args()

    require_ffmpeg()
    engine = pick_engine(args.engine)

    if args.check:
        n, th, dev = plan_workers(engine, args.workers, 999)
        print(json.dumps({"engine": engine, "device": dev, "workers": n, "threads_per_worker": th,
                          "cpu_cores": os.cpu_count(), "mem_gb": round(total_mem_gb(), 1),
                          "model": args.model, "cache": str(CACHE_ROOT)}, ensure_ascii=False))
        return

    files = collect(args.inputs)
    if not files:
        raise SystemExit("변환할 녹음파일이 없습니다.")

    t_start = time.time()
    tmp_root = Path(tempfile.mkdtemp(prefix="legal-transcribe-"))
    cache_key = f"{engine}-{args.model}-{args.language or 'auto'}-{hashlib.sha1(args.prompt.encode()).hexdigest()[:8]}"
    jobs, tasks = [], []

    try:
        # 1) 준비: 파일별 변환·분할을 동시에(ffmpeg는 가볍고 독립적이라 스레드로 충분)
        def prepare(src: Path) -> dict:
            sha = sha256_of(src)
            cdir = CACHE_ROOT / sha[:16] / cache_key
            cdir.mkdir(parents=True, exist_ok=True)
            plan = cdir / "plan.json"
            if plan.exists() and not args.force:
                p = json.loads(plan.read_text(encoding="utf-8"))
                if all((cdir / f"chunk_{i:03d}.json").exists() for i in range(len(p["offsets"]))):
                    # 이미 끝까지 변환된 파일: 오디오 재처리 없이 저장본만 합친다
                    return {"src": src, "sha": sha, "duration": p["duration"], "cache": cdir,
                            "chunks": [(None, o) for o in p["offsets"]]}
            work = tmp_root / sha[:16]
            work.mkdir(exist_ok=True)
            wav = work / "full.wav"
            to_wav16k(src, wav)
            dur = duration_of(wav)
            pts = cut_points(dur, args.chunk_min * 60, silence_midpoints(wav))
            chunks = split_wav(wav, pts, work)
            wav.unlink()
            prev = json.loads(plan.read_text(encoding="utf-8")) if plan.exists() else None
            if prev and prev["offsets"] != [o for _, o in chunks]:
                # 조각 길이 설정이 바뀌면 이전 조각 결과와 맞지 않으므로 지운다
                for old in cdir.glob("chunk_*.json"):
                    old.unlink()
            plan.write_text(json.dumps({"duration": dur, "offsets": [o for _, o in chunks]}),
                            encoding="utf-8")
            return {"src": src, "sha": sha, "duration": dur, "cache": cdir, "chunks": chunks}

        log(f"[준비] 녹음 {len(files)}개 변환·분할 중")
        with cf.ThreadPoolExecutor(max_workers=min(4, len(files))) as ex:
            jobs = list(ex.map(prepare, files))

        for ji, job in enumerate(jobs):
            for ci, (path, offset) in enumerate(job["chunks"]):
                cfile = job["cache"] / f"chunk_{ci:03d}.json"
                if cfile.exists() and not args.force:
                    continue
                tasks.append({"job": ji, "idx": ci, "path": str(path), "offset": offset,
                              "cache": str(cfile), "len": 0.0})
        total_audio = sum(j["duration"] for j in jobs)
        for t in tasks:
            chunks = jobs[t["job"]]["chunks"]
            nxt = chunks[t["idx"] + 1][1] if t["idx"] + 1 < len(chunks) else jobs[t["job"]]["duration"]
            t["len"] = nxt - t["offset"]
        tasks.sort(key=lambda t: -t["len"])  # 긴 조각 먼저 → 끝물에 작업자가 놀지 않게

        n_chunks = sum(len(j["chunks"]) for j in jobs)
        log(f"[준비] 총 {hms(total_audio)} 분량, 조각 {n_chunks}개 중 {len(tasks)}개 변환 필요"
            f" ({n_chunks - len(tasks)}개는 저장된 결과 재사용)")

        # 2) 받아쓰기: 프로세스 여러 개가 조각을 나눠 처리
        if tasks:
            n, threads, device = plan_workers(engine, args.workers, len(tasks))
            log(f"[변환] 엔진 {engine}({device}), 모델 {args.model}, 작업자 {n}개 x 스레드 {threads}")
            cfg = {"engine": engine, "device": device, "model": args.model, "threads": threads,
                   "language": args.language, "prompt": args.prompt}
            done_sec, done_n = 0.0, 0
            if n == 1:
                worker_init(cfg)
                results = (run_task(t) for t in tasks)
                ex = None
            else:
                ex = cf.ProcessPoolExecutor(max_workers=n, initializer=worker_init, initargs=(cfg,))
                results = (f.result() for f in cf.as_completed([ex.submit(run_task, t) for t in tasks]))
            try:
                for task, segs, took in results:
                    for s in segs:
                        s["start"] = round(s["start"] + task["offset"], 2)
                        s["end"] = round(s["end"] + task["offset"], 2)
                    Path(task["cache"]).write_text(json.dumps(segs, ensure_ascii=False), encoding="utf-8")
                    done_n += 1
                    done_sec += task["len"]
                    el = time.time() - t_start
                    log(f"[변환] {done_n}/{len(tasks)} {jobs[task['job']]['src'].name} 조각{task['idx'] + 1}"
                        f" ({hms(task['len'])} → {took:.0f}초) 경과 {hms(el)}")
            finally:
                if ex:
                    ex.shutdown(cancel_futures=True)

        # 3) 합치기
        meta = {"engine": engine, "model": args.model, "language": args.language,
                "created": time.strftime("%Y-%m-%d %H:%M")}
        summary = []
        for job in jobs:
            segs: list[dict] = []
            for ci in range(len(job["chunks"])):
                segs += json.loads((job["cache"] / f"chunk_{ci:03d}.json").read_text(encoding="utf-8"))
            segs.sort(key=lambda s: s["start"])
            out_dir = Path(args.out_dir).expanduser() if args.out_dir else job["src"].parent
            out_dir.mkdir(parents=True, exist_ok=True)
            txt, js = write_outputs(job, segs, out_dir, meta)
            summary.append({"source": str(job["src"]), "txt": str(txt), "json": str(js),
                            "duration": hms(job["duration"]), "segments": len(segs)})
        el = time.time() - t_start
        log(f"[완료] {hms(total_audio)} 분량을 {hms(el)}에 처리"
            f" (실시간 대비 {total_audio / max(el, 1):.1f}배)")
        print(json.dumps(summary, ensure_ascii=False, indent=1))
    finally:
        shutil.rmtree(tmp_root, ignore_errors=True)


if __name__ == "__main__":
    main()
