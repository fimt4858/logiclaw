#!/usr/bin/env bash
# 맥·리눅스용 받아쓰기 엔진 설치. 한 번만 실행하면 된다.
set -euo pipefail
VENV="${LEGAL_TRANSCRIBE_VENV:-$HOME/.legal-transcribe-venv}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then brew install ffmpeg
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get install -y ffmpeg
  else echo "ffmpeg를 설치해 주세요." >&2; exit 1; fi
fi

python3 -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q faster-whisper
if [[ "$(uname -s)" == "Darwin" && "$(uname -m)" == "arm64" ]]; then
  # 애플 실리콘(M1~M4): GPU를 쓰는 mlx-whisper가 가장 빠르다
  "$VENV/bin/pip" install -q mlx-whisper
fi

echo "설치 완료: $VENV"
"$VENV/bin/python" "$(dirname "$0")/transcribe.py" --check
