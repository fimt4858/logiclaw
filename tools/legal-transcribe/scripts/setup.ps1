# 윈도용 받아쓰기 엔진 설치. PowerShell에서 한 번만 실행한다.
$ErrorActionPreference = "Stop"
$venv = if ($env:LEGAL_TRANSCRIBE_VENV) { $env:LEGAL_TRANSCRIBE_VENV } else { "$HOME\.legal-transcribe-venv" }

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
  Write-Host "ffmpeg 설치 후 PowerShell 창을 새로 열고 다시 실행하세요."
  exit 0
}

python -m venv $venv
& "$venv\Scripts\python.exe" -m pip install -q --upgrade pip
& "$venv\Scripts\python.exe" -m pip install -q faster-whisper
Write-Host "설치 완료: $venv"
& "$venv\Scripts\python.exe" "$PSScriptRoot\transcribe.py" --check
