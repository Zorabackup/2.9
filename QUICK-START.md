# 🚀 3-MINUTE DEPLOY

## Option 1: Railway + Vercel (Recommended)
```bash
# Backend (2 min)
npm install -g @railway/cli
railway login
cd backend && railway up

# Frontend (1 min)  
cd ../frontend && vercel --prod