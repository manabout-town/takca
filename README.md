# 탁카 (Takca)

> 화주와 카 캐리어 기사를 실시간으로 연결하는 차량 탁송 중개 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## 개요

탁카는 화주(차량 탁송 의뢰인)와 카 캐리어 기사를 실시간으로 매칭하는 **차량 탁송 중개 플랫폼**이다. 화주는 탁송 의뢰를 등록하고, 기사는 인근 탁송 의뢰를 확인하여 수락한다. 실시간 채팅, 지도 기반 위치 추적, 에스크로 결제, 운행 완료 후 리뷰까지 운송 전 과정을 플랫폼 내에서 처리한다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database / Auth | Supabase (PostgreSQL + RLS) |
| Map | React Leaflet + Leaflet.js |
| Forms | React Hook Form + Zod |
| Utilities | date-fns, clsx, tailwind-merge |

---

## 주요 기능

### 화주 (Shipper)
- 차량 탁송 의뢰 등록 (출발지/목적지 지도 선택)
- 실시간 차주 위치 추적
- 에스크로 결제 — 운송 완료 확인 후 차주에게 정산
- 운행 완료 후 차주 리뷰 작성

### 차주 (Driver)
- 인근 탁송 의뢰 목록 조회 및 지도 확인
- 운송 수락 → 운행 시작 → 완료 처리
- 실시간 위치 공유 (driver_locations 테이블)
- 화주 채팅 / 운임 확인 / 정산 수령

### 공통
- SMS OTP 기반 전화번호 인증
- 실시간 알림 (notifications)
- 관리자 대시보드 (`/admin`)
- 온보딩 플로우 (신규 가입 시 역할 선택)

---

## 데이터베이스 스키마

Supabase 마이그레이션 8단계:

| 마이그레이션 | 내용 |
|-------------|------|
| `001_initial_schema` | 기본 테이블 (users, cargos, matches) |
| `002_wallet` | 지갑 / 잔액 관리 |
| `003_profile` | 프로필 확장 |
| `004_notifications` | 알림 시스템 |
| `005_phone_otp` | 전화번호 OTP 인증 |
| `006_driver_locations` | 실시간 차주 위치 추적 |
| `007_completion_requested` | 운송 완료 요청 상태 |
| `008_cargo_photos_rank` | 화물 사진 + 노출 순위 |

---

## 라우트 구조

```
app/
├── (shipper)/          # 화주 전용 라우트 그룹
│   └── shipper/
├── (driver)/           # 차주 전용 라우트 그룹
│   └── driver/
├── admin/              # 관리자 대시보드
├── auth/               # 인증 (로그인/회원가입/OTP)
├── chat/               # 실시간 채팅
├── onboarding/         # 신규 가입 온보딩
├── payment/            # 결제 (에스크로)
│   └── fail/
├── review/             # 리뷰
└── intro/              # 랜딩 페이지
```

---

## 로컬 개발 환경 설정

### 요구 사항

- Node.js 18+
- pnpm (권장) 또는 npm
- Supabase 프로젝트 (또는 로컬 Supabase CLI)

### 설치

```bash
git clone https://github.com/manabout-town/takca.git
cd takca

npm install
```

### 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 다음 값을 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 데이터베이스 마이그레이션

```bash
# Supabase CLI 설치 후
supabase db push
```

또는 `supabase/migrations/` 디렉터리의 SQL 파일을 순서대로 실행한다.

### 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:3000

---

## 디렉터리 구조

```
takca/
├── app/                # Next.js App Router 페이지
├── components/
│   ├── chat/           # 채팅 컴포넌트
│   ├── driver/         # 차주 전용 컴포넌트
│   ├── shared/         # 공통 컴포넌트
│   └── ui/             # UI 프리미티브
├── lib/                # 유틸리티, Supabase 클라이언트
├── supabase/
│   └── migrations/     # 데이터베이스 마이그레이션 SQL
├── public/             # 정적 파일
└── middleware.ts        # 인증 미들웨어 (Supabase SSR)
```

---

## 라이선스

MIT
