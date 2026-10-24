Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting SYNAPSE FastAPI Backend + LangGraph Engine      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
