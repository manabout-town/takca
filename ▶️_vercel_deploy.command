#!/bin/bash
echo "🚀 Vercel 배포 재시작..."

# symlink로 한글 경로 우회
rm -f /tmp/hwamulro
ln -sf ~/Desktop/화물로 /tmp/hwamulro
cd /tmp/hwamulro

echo "→ vercel 배포 중..."
vercel deploy --prod --yes 2>&1

echo ""
echo "✅ 완료! 아래 URL에서 확인:"
echo "   https://vercel.com/manabouttowns-projects/hwamulro"
echo ""
read -p "엔터를 누르면 종료..."
