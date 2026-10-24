Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running SYNAPSE Backend End-to-End Test Suite            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

python -m unittest backend/tests/test_backend.py -v
