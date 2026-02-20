#!/bin/bash
# Railway Backend Deploy
railway login
railway init network-inspector-backend --cwd backend
railway up --cwd backend
echo "Backend URL: $(railway url)"