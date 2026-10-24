Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Seeding Deterministic SYNAPSE Demo Organization          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

python -m backend.services.seed_data
