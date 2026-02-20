#!/bin/bash
# Vercel Frontend Deploy
vercel login
vercel --cwd frontend --prod
echo "Frontend URL: $(vercel ls | tail -1 | awk '{print $2}')"