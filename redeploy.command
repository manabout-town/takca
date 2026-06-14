#!/bin/bash
cd ~/Desktop/화물로
echo 'Redeploy (env vars 적용)...'
vercel deploy --prod --yes
echo ''
echo '완료!'
read -p '엔터 종료...'
