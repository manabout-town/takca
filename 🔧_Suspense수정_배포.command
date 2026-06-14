#!/bin/bash
echo "🔧 Suspense 수정 후 배포..."
cd ~/Desktop/화물로

# Remove lock files if exist
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null

# Git commit
git add app/\(auth\)/signup/page.tsx components/driver/FeedFilter.tsx
git commit -m "fix: wrap useSearchParams in Suspense boundaries for static generation"

echo ""
echo "🚀 Vercel 배포 중..."
rm -f /tmp/hwamulro
ln -sf ~/Desktop/화물로 /tmp/hwamulro
cd /tmp/hwamulro
vercel deploy --prod --yes 2>&1

echo ""
echo "✅ 배포 완료!"
read -p "엔터 종료..."
