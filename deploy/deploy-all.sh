#!/bin/bash
echo "🚀 DEPLOYING NETWORK INSPECTOR (5 minutes)"

# 1. Backend (Railway)
echo "📡 Deploying Backend..."
railway up --cwd backend

# 2. Frontend (Vercel)
echo "🎨 Deploying Frontend..."
vercel --cwd frontend --prod

echo "✅ COMPLETE! Check README for URLs"