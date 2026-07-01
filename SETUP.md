# 탁카 플랫폼 설정 가이드

## 현재 상태 (2026-07-01)

빌드: 통과  
DB 마이그레이션: 013개 파일  
역할: 화주 / 기사 / 어드민  
결제: Toss Payments (에스크로)  
KYC: Claude Vision AI + 선택적 Clova OCR + 선택적 국세청 API  

---

## Step 1 — 패키지 설치

```bash
npm install --legacy-peer-deps
```

---

## Step 2 — 환경변수 설정

### Vercel 대시보드 → Settings → Environment Variables

| 키 | 값 | 없을 때 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ahtziazykzmoxrjzmwmh.supabase.co` | 앱 전체 불가 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 대시보드에서 복사 | 앱 전체 불가 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings > API > service_role | 결제·KYC 불가 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 테스트: `test_ck_...` / 라이브: `live_ck_...` | 결제 불가 |
| `TOSS_SECRET_KEY` | 테스트: `test_sk_...` / 라이브: `live_sk_...` | 결제 승인 불가 |
| `ANTHROPIC_API_KEY` | Anthropic Console에서 발급 | KYC AI 분석 불가 (전체 실패) |
| `NEXT_PUBLIC_APP_URL` | `https://takca.vercel.app` | Toss 결제 후 리다이렉트 오류 |
| `CRON_SECRET` | 랜덤 문자열 (예: openssl rand -hex 32) | 에스크로 자동 해제 불가 |
| `NAVER_CLOVA_APIGW_URL` | Naver Cloud Console | 없으면 자동 스킵 (선택) |
| `NAVER_CLOVA_SECRET_KEY` | Naver Cloud Console | 없으면 자동 스킵 (선택) |
| `NTS_API_KEY` | 공공데이터포털 (data.go.kr) | 없으면 자동 스킵 (선택) |

> CRON_SECRET 생성: `openssl rand -hex 32`

---

## Step 3 — Supabase 마이그레이션 실행

Supabase 대시보드 → SQL Editor에서 순서대로 실행:

```
001_initial_schema.sql
002_wallet.sql
003_profile.sql
004_notifications.sql
005_phone_otp.sql
006_driver_locations.sql
007_completion_requested.sql
008_cargo_photos_rank.sql
009_orders_bids_fix.sql
010_kyc.sql
011_condition_report.sql
012_vehicle_fields.sql
013_missing_tables_and_fixes.sql   ← 필수 (driver_schedules + notification 타입 수정)
20260627000001_atomic_rpcs.sql
```

또는 Supabase CLI:

```bash
supabase db push
```

---

## Step 4 — Supabase Auth 설정

https://supabase.com/dashboard/project/ahtziazykzmoxrjzmwmh/auth/url-configuration

- **Site URL**: `https://takca.vercel.app`
- **Redirect URLs**: `https://takca.vercel.app/**`

이메일 인증 활성화: Authentication → Providers → Email → "Confirm email" ON

---

## Step 5 — Vercel 배포

```bash
vercel --prod
```

Vercel 프로젝트에서 cron이 자동 등록됨 (`vercel.json` 설정):
- 매일 자정 `/api/admin/escrow/auto-release` 실행 → 72시간 경과 에스크로 자동 해제

---

## Step 6 — 어드민 계정 생성

1. `/signup`에서 계정 생성
2. Supabase SQL Editor에서:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Step 7 — Toss Payments 라이브 전환

출시 전:
1. Toss Developers 콘솔에서 라이브 키 발급 (사업자등록 필요)
2. Vercel 환경변수 교체:
   - `NEXT_PUBLIC_TOSS_CLIENT_KEY` → `live_ck_...`
   - `TOSS_SECRET_KEY` → `live_sk_...`

---

## 알려진 버그 없음 (수정 완료된 항목)

| 항목 | 수정 내용 |
|------|---------|
| `driver_schedules` 테이블 누락 | migration 013에 추가 |
| `notifications.type` CHECK 오류 (`match_cancelled`) | migration 013에 제약 수정 |
| `kyc-documents` private 버킷 + 어드민 접근 불가 | `/api/admin/kyc-signed-url` 프록시 추가, migration 013에 버킷 사전 생성 |
| KYC 어드민 페이지 문서 링크 깨짐 | signed URL 프록시로 교체 |

---

## 운영 체크리스트 (출시 전)

### 필수
- [ ] 환경변수 전체 설정 (위 표 참조)
- [ ] Supabase 마이그레이션 013개 전부 실행
- [ ] Toss 라이브 키 전환 (테스트 키로 출시 불가)
- [ ] Supabase Auth redirect URL 설정
- [ ] 어드민 계정 생성
- [ ] `CRON_SECRET` 설정 (에스크로 자동 해제)
- [ ] `ANTHROPIC_API_KEY` 설정 (KYC AI 분석)

### 권장
- [ ] `support@takca.kr` 이메일 계정 활성화
- [ ] `/terms`, `/privacy` 페이지에 법인명·사업자번호·대표자명 삽입
- [ ] Naver Clova OCR 키 설정 (KYC 정확도 향상)
- [ ] 국세청 API 키 설정 (사업자번호 실시간 검증)

### 법적 (비개발)
- [ ] 화물자동차운수사업법 — 화물자동차운송주선사업 허가 또는 플랫폼 특례 신고 ([국토교통부](https://www.molit.go.kr))
- [ ] 사업자등록 — Toss Payments 라이브 계약 필수 조건
- [ ] 개인정보처리방침 — KYC 서류 (운전면허증·사업자등록증) 수집·보관 명시 필요
- [ ] KYC 서류 동의 UI — 회원가입 또는 인증 단계에서 개인정보 수집 동의 받아야 함

---

## 역할별 핵심 흐름

```
화주
  /signup → /verification → /shipper/dashboard
  /shipper/orders/new → 입찰 수신 → /shipper/orders/[id]
  입찰 승인 → /shipper/orders/[id]/pay (Toss 에스크로)
  운송 완료 확인 → 에스크로 자동 해제 → 기사 정산
  /review/[matchId]

기사
  /signup → /verification (사업자+면허) → /driver/feed
  피드에서 입찰 → 매칭 수락 알림
  /driver/matches/[matchId]/condition-report (픽업·배송)
  운송 완료 요청 → 화주 확인 대기 (72h 초과 시 자동 해제)
  /driver/wallet → 출금 신청

어드민
  /admin/dashboard
  /admin/kyc — KYC 수동 심사 (manual_review 상태)
  /admin/disputes — 분쟁 처리
  /admin/settlements — 정산 내역
  /admin/withdrawals — 출금 승인
```

---

## 매칭 방식 (두 가지 병행)

| 방식 | 라우트 | 동작 |
|------|--------|------|
| 입찰 방식 | `(driver)/driver/feed` | 기사가 입찰 → 화주가 승인 |
| 즉시 수락 | `(driver-call)/driver/dashboard` | 기사가 주문 바로 수락 (배민커넥트 방식) |

두 방식 모두 활성화. 입찰 방식은 화주가 기사를 선택, 즉시 수락은 선착순.

---

## 프로젝트 구조

```
탁카/
├── app/
│   ├── (auth)/                   # 로그인 / 회원가입 / 이메일 인증
│   ├── (shipper)/shipper/        # 화주 전용
│   │   ├── orders/new            # 주문 생성
│   │   ├── orders/[id]           # 주문 상세 + 입찰 관리
│   │   ├── orders/[id]/pay       # Toss 에스크로 결제
│   │   ├── dashboard             # 대시보드
│   │   └── wallet                # 지갑
│   ├── (driver)/driver/          # 기사 전용
│   │   ├── feed                  # 주문 피드 + 입찰
│   │   ├── matches/[id]/condition-report  # 차량 상태 리포트
│   │   ├── schedule              # 일정 등록
│   │   └── wallet                # 지갑 + 출금
│   ├── (driver-call)/driver/     # 기사 즉시 수락 대시보드
│   ├── admin/                    # 어드민
│   │   ├── kyc                   # KYC 심사
│   │   ├── disputes              # 분쟁 처리
│   │   ├── settlements           # 정산
│   │   └── withdrawals           # 출금 승인
│   ├── chat/[matchId]            # 실시간 채팅 + 위치 추적
│   ├── review/[matchId]          # 양방향 리뷰
│   ├── verification              # KYC 서류 제출 (3단계)
│   └── api/
│       ├── payments/toss/        # 결제 승인 (GET: redirect, POST: confirm)
│       ├── kyc/verify            # KYC AI 분석 + 저장
│       ├── admin/kyc-signed-url  # KYC 문서 signed URL 프록시
│       └── admin/escrow/auto-release  # 72h 에스크로 자동 해제 (cron)
├── supabase/migrations/          # 001~013 + atomic RPCs
└── vercel.json                   # cron 스케줄 설정 포함
```

---

## 수수료 구조

`lib/utils/format.ts`의 `calculateFee()` 함수:
- 플랫폼 수수료: 4% (변경 시 해당 함수 수정)
- 기사 수령액: 96%

에스크로 해제 시 payouts 테이블에 기사 정산 금액 기록 → 어드민이 /admin/withdrawals에서 승인 후 실제 송금.
