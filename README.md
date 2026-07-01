# 🚗 탁카 — 차량 탁송 매칭 플랫폼

> **화주가 탁송 의뢰를 올리면 기사들이 입찰하는 역제안(reverse-bidding) 방식의 차량 탁송 플랫폼**
> 안전한 거래를 위한 **에스크로 결제**, **실시간 채팅·GPS 추적**, **AI KYC 인증**까지 갖춘 풀스택 웹 서비스입니다.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Toss_Payments-에스크로-0064FF?logoColor=white" alt="Toss Payments"/>
  <img src="https://img.shields.io/badge/Claude_AI-KYC_인증-CC785C?logo=anthropic&logoColor=white" alt="Claude AI"/>
  <img src="https://img.shields.io/badge/Vercel-배포-000000?logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
</p>

---

## 📌 프로젝트 개요

차량 탁송 시장은 화주가 일일이 기사를 찾아 연락해야 했습니다.
**탁카**는 이 흐름을 뒤집어, **화주가 의뢰를 올리면 기사들이 직접 입찰하거나 즉시 수락하는 구조**를 채택했습니다.
거래 신뢰 문제는 **플랫폼이 결제금을 보관했다가 탁송 완료 시 정산하는 에스크로**로 해결합니다.

| 항목 | 내용 |
|---|---|
| **프로젝트 유형** | 개인 프로젝트 (풀스택) |
| **개발 기간** | 2026.06 ~ 2026.07 |
| **핵심 가치** | 역제안 입찰 · 에스크로 안전거래 · 실시간 소통 · AI KYC 인증 |
| **아키텍처** | Next.js App Router (Server Actions) + Supabase |

### 👥 사용자 유형
- **화주(Shipper)** — 의뢰 등록 → 입찰 수신 → 기사 선택 → 에스크로 결제 → 탁송 완료 확인 → 리뷰
- **기사(Driver)** — KYC 인증 → 피드에서 입찰 또는 즉시 수락 → 차량 상태 리포트 → 탁송 → 정산금 수령
- **어드민(Admin)** — KYC 심사, 분쟁 처리, 정산·출금 승인, 사용자 관리

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| **Language** | TypeScript 5 |
| **Framework** | Next.js 15 (App Router, Server Actions, Server Components) |
| **Database** | Supabase (PostgreSQL 15 + Row Level Security) |
| **인증/인가** | Supabase Auth (이메일 인증) + Middleware 역할 기반 라우팅 |
| **실시간** | Supabase Realtime (채팅·알림·기사 GPS 위치) |
| **스토리지** | Supabase Storage (KYC 서류, 차량 사진) |
| **결제** | Toss Payments (에스크로 결제 + 긴급 부스팅) |
| **AI** | Anthropic Claude Vision — KYC 서류 진위 분석 |
| **외부 API** | 네이버 Clova OCR (선택), 국세청 사업자번호 검증 (선택) |
| **Cron** | Vercel Cron (72h 에스크로 자동 해제) |
| **배포** | Vercel |
| **스타일링** | Tailwind CSS 4 |

---

## ✨ 주요 기능

### 🎯 역제안 입찰 + 즉시 수락 (핵심)
- 화주가 출발지·목적지·차량 정보·가격을 등록 → 기사들이 **가격과 메시지를 담아 입찰**
- 화주는 입찰 목록을 비교 후 **승인** → 매칭 생성
- **즉시 수락 모드** — 배민커넥트 방식으로 기사가 콜을 바로 수락 (선착순)
- 원자적 RPC(`accept_order_atomic`)로 **동시 수락 경쟁 조건** 방지

### 💰 에스크로 결제 & 정산
- **Toss Payments**로 에스크로 결제 (GET 리다이렉트 + POST confirm 이중 처리, 멱등성 보장)
- 결제 완료 시 `escrow` 테이블에 보관(HELD), 화주 완료 확인 시 기사에게 정산(RELEASED)
- **플랫폼 수수료 4%** 자동 차감, 기사 96% 수령
- **72시간 자동 해제** — 기사 완료 요청 후 화주가 72h 내 미확인 시 Vercel Cron으로 자동 정산
- 긴급 부스팅(Urgent) 별도 결제로 의뢰 상단 노출

### 🛡️ AI KYC 인증 (Claude Vision)
- 기사: 사업자등록증 + 운전면허증 / 화주: 사업자등록증 (선택)
- **Claude claude-opus-4-8**이 문서 진위, 관인 유무, 조작 흔적 분석 → 신뢰도 점수 산출
- 신뢰도 ≥ 72% → 즉시 승인, < 35% → 거절, 중간 → 수동 검토(`manual_review`)
- 네이버 Clova OCR + 국세청 사업자번호 실시간 검증으로 정확도 향상 (선택 연동)
- KYC 서류는 private 스토리지 보관, 어드민 조회 시 서버 사이드 signed URL 발급

### 🚗 탁송 실행 & 차량 상태 관리
- 픽업·배송 단계에서 **차량 상태 리포트** 제출 (사진 + 체크리스트 + 메모)
- 실시간 채팅 + **기사 GPS 위치 추적** (Supabase Realtime)
- 취소 시 시간별 **위약금 자동 계산** (취소 시점에 따라 단계별 차등 적용)

### 💬 실시간 알림
- DB 트리거 기반 알림 — 입찰 수신, 매칭 완료, 운송 시작·완료, 취소, 채팅 메시지
- Supabase Realtime으로 앱 내 실시간 푸시

### 🏦 지갑 & 출금
- 기사 정산금 지갑 관리
- 은행 계좌 입력 후 출금 신청 → 어드민 승인 후 지급
- 출금 신청 원자적 처리 (`request_withdrawal_atomic` RPC) — 잔액 확인·차감·신청·거래내역이 단일 트랜잭션

---

## 🧩 기술적 하이라이트

<details open>
<summary><b>1. 에스크로 — 이중 결제 방지 + 원자적 상태 전환</b></summary>

<br>

Toss 결제 후 리다이렉트(GET)와 클라이언트 confirm(POST) 두 경로 모두 존재합니다.
`pg_transaction_id`(paymentKey)로 **멱등성 체크**를 먼저 수행해 이중 에스크로 생성을 방지합니다.

```typescript
// /api/payments/toss/success/route.ts
const { data: existingEscrow } = await service
  .from("escrow")
  .select("id")
  .eq("match_id", activeMatch.id)
  .maybeSingle()

if (!existingEscrow) {
  await service.from("escrow").insert({ ..., status: "held", pg_transaction_id: paymentKey })
  await service.from("orders").update({ status: "in_progress" }).eq("id", dbOrderId)
}
```
</details>

<details>
<summary><b>2. 즉시 수락 — 동시성 경쟁 조건 방지 (PostgreSQL FOR UPDATE)</b></summary>

<br>

여러 기사가 동시에 같은 의뢰를 수락하려 할 때, 서버 사이드 RPC가 **FOR UPDATE 락**으로 의뢰 상태를 선점합니다.
`UNIQUE INDEX (order_id) WHERE status NOT IN ('cancelled')` 제약으로 이중 매칭을 DB 레벨에서 차단합니다.

```sql
-- 20260627000001_atomic_rpcs.sql
CREATE OR REPLACE FUNCTION accept_order_atomic(p_order_id UUID, p_driver_id UUID)
RETURNS JSON AS $$
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.status != 'pending' THEN
    RETURN json_build_object('error', 'already_matched');
  END IF;
  INSERT INTO matches (order_id, driver_id, status) VALUES (p_order_id, p_driver_id, 'accepted');
  UPDATE orders SET status = 'matched' WHERE id = p_order_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
```
</details>

<details>
<summary><b>3. Claude Vision KYC — 신뢰도 기반 3단계 자동 판정</b></summary>

<br>

`claude-opus-4-8` 모델이 문서 진위·조작 여부를 분석 → 점수 합산 후 자동 판정합니다.
국세청 API 검증 성공 시 +15%, 실패 시 -35%로 가중치를 적용해 정확도를 높입니다.

```typescript
// /api/kyc/verify/route.ts
function computeConfidence(biz, lic, gov, role): number {
  let score = biz.confidence
  if (!biz.is_authentic) score -= 0.35
  if (role === 'driver' && lic) {
    score = (score + lic.confidence) / 2
    if (!lic.is_authentic) score -= 0.25
  }
  if (gov?.valid === true)  score = Math.min(1.0, score + 0.15)
  if (gov?.valid === false) score -= 0.35
  return Math.max(0, Math.min(1, score))
}
// score >= 0.72 → approved / < 0.35 → rejected / else → manual_review
```
</details>

<details>
<summary><b>4. 출금 원자적 처리 — 잔액 부족·이중 출금 방지</b></summary>

<br>

잔액 확인, 차감, 출금 신청 생성, 거래내역 기록을 **단일 PostgreSQL 트랜잭션 RPC**로 처리합니다.

```sql
SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
IF v_balance < p_amount THEN RETURN json_build_object('error', 'insufficient_balance'); END IF;
UPDATE wallets SET balance = v_balance - p_amount WHERE user_id = p_user_id;
INSERT INTO withdrawal_requests (...) RETURNING id INTO v_withdrawal_id;
INSERT INTO wallet_transactions (...);
```
</details>

<details>
<summary><b>5. 알림 — DB 트리거로 애플리케이션 레이어 분리</b></summary>

<br>

매칭 생성, 의뢰 상태 변경, 채팅 메시지 발생 시 **PostgreSQL 트리거**가 notifications 테이블에 자동 삽입합니다.
앱 레이어에서 알림을 명시적으로 생성하는 경우(취소 알림)와 혼용해 best-effort 방식으로 동작합니다.

```sql
CREATE TRIGGER on_match_created_notify AFTER INSERT ON matches
  FOR EACH ROW EXECUTE FUNCTION notify_shipper_on_match();
```
</details>

---

## 🔄 핵심 흐름 — 탁송 의뢰 & 에스크로

```
화주                          플랫폼                          기사
 │                               │                               │
 ├─ 의뢰 등록 (pending) ─────────>│                               │
 │                               │<── 입찰 제출 ─────────────────┤
 ├─ 입찰 승인 / 기사 즉시 수락 ──>│── match 생성 (accepted) ──────>│
 ├─ Toss 에스크로 결제 ──────────>│── escrow held ────────────────│
 │                               │<── 픽업 상태 리포트 ───────────┤
 │<── 실시간 채팅·GPS 추적 ───────>│<── 배송 진행 ──────────────────┤
 │                               │<── 완료 요청 ──────────────────┤
 ├─ 완료 확인 ───────────────────>│── escrow released ────────────>│
 │                               │── payout 생성 ────────────────>│
 ├─ 리뷰 작성 ───────────────────>│<── 리뷰 작성 ──────────────────┤
 │                               │                     출금 신청 ─┤
```

---

## 📁 프로젝트 구조

```
탁카/
├── app/
│   ├── (auth)/                       # 로그인 / 회원가입 / 이메일 인증
│   ├── (shipper)/shipper/            # 화주 전용
│   │   ├── orders/new                # 의뢰 생성
│   │   ├── orders/[id]               # 의뢰 상세 + 입찰 관리
│   │   ├── orders/[id]/pay           # Toss 에스크로 결제
│   │   ├── orders/[id]/dispute       # 분쟁 신청
│   │   ├── dashboard                 # 대시보드
│   │   └── wallet                    # 지갑
│   ├── (driver)/driver/              # 기사 전용 (입찰 방식)
│   │   ├── feed                      # 의뢰 피드 + 입찰
│   │   ├── matches/[id]/condition-report  # 차량 상태 리포트
│   │   ├── schedule                  # 운행 일정 등록
│   │   └── wallet                    # 지갑 + 출금
│   ├── (driver-call)/driver/         # 기사 즉시 수락 대시보드
│   ├── admin/                        # 어드민
│   │   ├── kyc                       # KYC 심사
│   │   ├── disputes                  # 분쟁 처리
│   │   ├── settlements               # 정산 내역
│   │   └── withdrawals               # 출금 승인
│   ├── chat/[matchId]                # 실시간 채팅 + GPS 위치 추적
│   ├── review/[matchId]              # 양방향 리뷰
│   ├── verification/                 # KYC 서류 제출 (3단계)
│   └── api/
│       ├── payments/toss/            # 결제 승인 (GET redirect + POST confirm)
│       ├── kyc/verify                # Claude AI KYC 분석 + 저장
│       ├── admin/kyc-signed-url      # KYC 문서 signed URL 프록시
│       └── admin/escrow/auto-release # 72h 에스크로 자동 해제 (Vercel Cron)
├── app/actions/                      # Server Actions
│   ├── orders.ts                     # 의뢰 CRUD + 상태 전환
│   ├── bids.ts                       # 입찰 제출·승인·거절
│   ├── matches.ts                    # 매칭 취소·위약금
│   ├── wallet.ts                     # 지갑·출금
│   ├── conditionReport.ts            # 차량 상태 리포트
│   └── auth.ts                       # 로그인·회원가입·온보딩
├── components/                       # 공통 컴포넌트
├── lib/                              # Supabase 클라이언트, 타입, 유틸
└── supabase/migrations/              # 001 ~ 013 + atomic RPCs
```

---

## 🗂️ 주요 데이터 모델

| 테이블 | 설명 | 핵심 상태 |
|---|---|---|
| `users` | 회원 | `role(shipper/driver/admin)`, `verification_status(unverified/pending/verified/rejected)` |
| `driver_profiles` | 기사 프로필 | `is_verified`, `rating_avg`, `completed_count`, `home_region`, `route_regions` |
| `orders` | 탁송 의뢰 | `status(pending/matched/in_progress/completed/cancelled/disputed)`, `vehicle_count`, `is_urgent` |
| `bids` | 입찰 | `status(pending/accepted/rejected)`, `price`, `message` |
| `matches` | 매칭 | `status(accepted/in_progress/completed/cancelled)`, `penalty_amount` |
| `escrow` | 에스크로 | `status(held/released/refunded/disputed)`, `platform_fee`, `driver_payout` |
| `condition_reports` | 차량 상태 리포트 | `type(pickup/delivery)`, `photos`, `checklist` |
| `kyc_submissions` | KYC 제출 | `status(pending/approved/rejected/manual_review)`, `confidence_score` |
| `notifications` | 알림 | `type`, `is_read` — DB 트리거 자동 생성 |
| `driver_locations` | 기사 GPS 위치 | `lat`, `lng`, `heading` — Realtime 스트리밍 |
| `wallets` | 지갑 | `balance`, `points` |
| `withdrawal_requests` | 출금 신청 | `status(pending/processing/completed/rejected)` |

---

## ⚙️ 로컬 환경 세팅

### 1. 사전 요구사항
- Node.js 20+
- Supabase 프로젝트 (free tier 가능)
- Toss Payments 계정 (테스트 키)
- Anthropic API Key

### 2. 레포 클론 & 패키지 설치
```bash
git clone https://github.com/manabout-town/takca.git
cd takca
npm install --legacy-peer-deps
```

### 3. `.env.local` 작성
```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# AI (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-random-secret

# 선택 (없으면 자동 스킵)
NAVER_CLOVA_APIGW_URL=
NAVER_CLOVA_SECRET_KEY=
NTS_API_KEY=
```

### 4. Supabase 마이그레이션 실행
Supabase 대시보드 SQL Editor에서 `supabase/migrations/` 내 파일을 001 ~ 013 순서대로 실행합니다.

### 5. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000
```

### 6. 어드민 계정 설정
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 🌿 주요 URL

| 경로 | 설명 | 역할 |
|---|---|---|
| `/signup`, `/login` | 회원가입·로그인 | 전체 |
| `/verification` | KYC 서류 제출 (3단계) | 로그인 후 |
| `/shipper/orders/new` | 탁송 의뢰 등록 | 화주 |
| `/shipper/orders/[id]/pay` | Toss 에스크로 결제 | 화주 |
| `/driver/feed` | 의뢰 피드 + 입찰 | 기사 |
| `/driver/dashboard` | 즉시 수락 콜 대시보드 | 기사 |
| `/driver/matches/[id]/condition-report` | 차량 상태 리포트 | 기사 |
| `/chat/[matchId]` | 실시간 채팅 + GPS 추적 | 화주·기사 |
| `/review/[matchId]` | 리뷰 작성 | 화주·기사 |
| `/admin/kyc` | KYC 수동 심사 | 어드민 |
| `/admin/disputes` | 분쟁 처리 | 어드민 |
| `/admin/withdrawals` | 출금 승인 | 어드민 |

---

<p align="center">
  <sub>Repository: <a href="https://github.com/manabout-town/takca">github.com/manabout-town/takca</a></sub>
</p>
