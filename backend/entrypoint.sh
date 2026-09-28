#!/bin/sh
set -e

echo "[SUMP] Synchronizing backend application code..."
mkdir -p /app/app
rm -rf /app/app/*
cp -r /app_code/app/* /app/app/

cd /app
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
