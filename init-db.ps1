# Automated Database Initializer for Blockchain Intelligence DB
# Target: Microsoft SQL Server 2019 / 2022 / 2025

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Initializing BlockchainIntelligenceDB on SQL Server..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Create database if it does not exist
Write-Host "[1/3] Ensuring database exists..." -ForegroundColor Green
sqlcmd -S localhost -E -C -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BlockchainIntelligenceDB') CREATE DATABASE BlockchainIntelligenceDB;"

# 2. Apply schema
Write-Host "[2/3] Applying schema (tables, views, indexes)..." -ForegroundColor Green
sqlcmd -S localhost -E -C -i "$PSScriptRoot\database\schema.sql"

# 3. Apply seed data
Write-Host "[3/3] Populating initial seed data..." -ForegroundColor Green
sqlcmd -S localhost -E -C -i "$PSScriptRoot\database\seed.sql"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Database initialization completed successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
