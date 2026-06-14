# 🚛 화물로 플랫폼 설정 가이드

## ✅ 완료된 작업
- Next.js 14 + TypeScript + Tailwind CSS 프로젝트 구성
- Supabase DB 스키마 생성 (ddalkak 프로젝트, ap-northeast-2)
- RLS 보안 정책 적용
- 화주/기사/관리자 전체 페이지 구현
- 실시간 채팅 (Supabase Realtime)
- 에스크로 결제 흐름 구현
- 토스페이먼츠 연동 코드
- 분쟁 중재 시스템
- 리뷰/평점 시스템
- 72시간 자동 에스크로 해제 API

---

## 🔧 지금 당장 할 일 (터미널에서 실행)

### Step 1: 패키지 설치
```bash
cd ~/Desktop/화물로
npm install --legacy-peer-deps
```

### Step 2: Supabase 서비스 롤 키 가져오기
1. https://supabase.com/dashboard/project/ahtziazykzmoxrjzmwmh/settings/api 접속
2. **service_role** key 복사
3. `.env.local` 파일에서 `REPLACE_WITH_SERVICE_ROLE_KEY` 부분을 교체

### Step 3: 로컬 테스트
```bash
npm run dev
# http://localhost:3000 에서 확인
```

### Step 4: GitHub 레포 생성 & 푸시
```bash
# GitHub CLI 설치 (없으면)
brew install gh
gh auth login

# 레포 생성 & 푸시
cd ~/Desktop/화물로
git add -A
git commit -m "feat: 화물로 플랫폼 완성"
gh repo create hwamulro --public --source=. --remote=origin --push
```

### Step 5: Vercel 배포
```bash
npx vercel --prod
```

### Step 6: Vercel 환경변수 설정
Vercel 대시보드 > 프로젝트 > Settings > Environment Variables:

| 키 | 값 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | https://ahtziazykzmoxrjzmwmh.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHppYXp5a3ptb3hyanptd21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTUyMjcsImV4cCI6MjA5NTM5MTIyN30.RrF05mb7zqUSbY0vu1T75l9nRnL6wbSzyzt-KPid9OU |
| SUPABASE_SERVICE_ROLE_KEY | (supabase에서 복사) |
| NEXT_PUBLIC_TOSS_CLIENT_KEY | test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq |
| TOSS_SECRET_KEY | test_sk_D5GePWvyJnrK0W0k6q8gLzN97Eoq |
| NEXT_PUBLIC_APP_URL | https://hwamulro.vercel.app |
| CRON_SECRET | (랜덤 문자열, 자동 에스크로 해제용) |

### Step 7: Supabase Auth 리다이렉트 설정
https://supabase.com/dashboard/project/ahtziazykzmoxrjzmwmh/auth/url-configuration
- Site URL: `https://hwamulro.vercel.app`
- Redirect URLs: `https://hwamulro.vercel.app/**`

---

## 💡 수익화 체크리스트

### 긴급 부스팅 (즉시 수익)
- [ ] 토스페이먼츠 실제 키로 교체
- [ ] 긴급 부스팅 결제 테스트

### 거래 수수료 (거래 완료 시)
- [ ] 에스크로 정산 자동화 확인
- [ ] 정산 내역 관리자 대시보드 확인

### 실제 서비스 준비
- [ ] 사업자등록 (PG사 계약 필요)
- [ ] 토스페이먼츠 실계정 신청
- [ ] 기사 인증 프로세스 설계
- [ ] 고객센터 채널 준비

---

## 🗂 프로젝트 구조

```
화물로/
├── app/
│   ├── (auth)/         # 로그인/회원가입
│   ├── (shipper)/      # 화주 전용 페이지
│   ├── (driver)/       # 기사 전용 페이지
│   ├── admin/          # 관리자 대시보드
│   ├── chat/           # 실시간 채팅
│   ├── review/         # 리뷰 작성
│   └── api/            # API 라우트 (결제, 자동화)
├── components/         # 공통 컴포넌트
├── lib/                # 유틸리티, 타입, Supabase 클라이언트
└── supabase/           # DB 마이그레이션 SQL
```

## 🔑 관리자 계정 생성 방법

회원가입 후 Supabase SQL 에디터에서:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@gmail.com';
```
