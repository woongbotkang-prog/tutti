# TUTTI 프로젝트 세팅 체크리스트

## ✅ 완료된 작업

### 1️⃣ Supabase 마이그레이션
- ✅ 마이그레이션 파일 생성: `migrations/001_initial_schema.sql`
  - 모든 테이블 정의
  - 인덱스 설정
  - Row Level Security (RLS) 정책 포함
- ✅ Seed 데이터 파일: `seed.sql`
  - 지역 데이터 (17개 시/도)
  - 악기 카테고리 및 악기 (~30개)
  - 작곡가 데이터 (~200명)

### 2️⃣ Next.js 설정
- ✅ `next.config.js` - Next.js 설정 (이미지 최적화, 환경 변수 등)
- ✅ `tsconfig.json` - TypeScript strict 모드
- ✅ `tailwind.config.ts` - Tailwind + shadcn/ui 호환 설정
- ✅ `postcss.config.js` - PostCSS 설정
- ✅ `.eslintrc.json` - ESLint 규칙
- ✅ `.prettierrc.json` - Prettier 포맷 설정
- ✅ `package.json` - 초기 의존성 정의
- ✅ `.env.local.example` - 환경 변수 템플릿
- ✅ `.gitignore` - Git 무시 파일

### 3️⃣ 기본 구조
- ✅ `app/layout.tsx` - Root layout
- ✅ `app/page.tsx` - 홈페이지 (스켈레톤)
- ✅ `app/api/health/route.ts` - Health check endpoint
- ✅ `lib/supabase.ts` - Supabase 클라이언트 초기화
- ✅ `lib/api.ts` - API 헬퍼 함수
- ✅ `lib/utils.ts` - 유틸리티 함수
- ✅ `types/index.ts` - TypeScript 타입 정의
- ✅ `styles/globals.css` - 전역 스타일

### 4️⃣ 문서
- ✅ `README.md` - 프로젝트 가이드
- ✅ `SETUP_CHECKLIST.md` - 이 파일

---

## 🚀 귀국 후 실행 단계

### Step 1: 의존성 설치
```bash
cd ~/path/to/tutti
npm install
```

### Step 2: 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.local.example .env.local

# 다음 정보 입력:
# NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Step 3: 데이터베이스 마이그레이션

#### Option A: Supabase 대시보드 (권장)
1. Supabase 대시보드 접속
2. 프로젝트 선택
3. SQL Editor 클릭
4. `migrations/001_initial_schema.sql` 파일 내용 전체 복사
5. SQL Editor에 붙여넣기
6. "RUN" 버튼 클릭

#### Option B: Supabase CLI
```bash
npx supabase db push
```

### Step 4: Seed 데이터 입력

#### Option A: Supabase 대시보드
1. SQL Editor 다시 열기
2. `seed.sql` 파일 내용 복사
3. 붙여넣기 및 실행

#### Option B: PostgreSQL 클라이언트
```bash
psql $DATABASE_URL < seed.sql
```

### Step 5: 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 📊 프로젝트 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 기본 구조 | ✅ 완료 | App Router, TypeScript 설정 |
| 데이터베이스 스키마 | ✅ 준비됨 | 마이그레이션 파일 작성 완료 |
| Seed 데이터 | ✅ 준비됨 | 지역, 악기, 작곡가 데이터 포함 |
| Supabase 클라이언트 | ✅ 초기화됨 | Auth, DB 연동 준비 |
| API 헬퍼 | ✅ 기본 함수 | CRUD 기본 함수 구현 |
| 스타일링 | ✅ 완료 | Tailwind + 커스텀 CSS |
| 타입 정의 | ✅ 완료 | 모든 엔티티 타입 정의 |
| 문서 | ✅ 완료 | README + 체크리스트 |

---

## 📁 파일 구조 확인

프로젝트 디렉토리:
```
tutti/
├── app/                    # Next.js App Router
│   ├── api/health/        # Health endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # 홈페이지
├── lib/
│   ├── supabase.ts        # Supabase 클라이언트
│   ├── api.ts             # API 헬퍼
│   └── utils.ts           # 유틸 함수
├── types/
│   └── index.ts           # 타입 정의
├── styles/
│   └── globals.css        # 글로벌 스타일
├── migrations/
│   └── 001_initial_schema.sql  # DB 마이그레이션
├── public/                # 정적 파일
├── .env.local.example     # 환경 변수 템플릿
├── .eslintrc.json         # ESLint
├── .prettierrc.json       # Prettier
├── .gitignore             # Git 무시
├── next.config.js         # Next.js 설정
├── package.json           # 의존성
├── postcss.config.js      # PostCSS
├── seed.sql               # Seed 데이터
├── tailwind.config.ts     # Tailwind 설정
├── tsconfig.json          # TypeScript
├── README.md              # 프로젝트 가이드
└── SETUP_CHECKLIST.md     # 이 파일
```

---

## 🔄 다음 단계 (향후 개발)

### Phase 1: 사용자 인증
- [ ] Supabase Auth 통합
- [ ] 회원가입 페이지
- [ ] 로그인 페이지
- [ ] 프로필 셋업 플로우

### Phase 2: 기본 기능
- [ ] 공고 조회/생성/수정
- [ ] 프로필 관리
- [ ] 지원 기능
- [ ] 검색 필터링

### Phase 3: 채팅 & 리뷰
- [ ] 실시간 채팅
- [ ] 블라인드 리뷰 시스템
- [ ] 알림 기능

### Phase 4: 최적화
- [ ] SEO 최적화
- [ ] 성능 최적화
- [ ] 모바일 반응형
- [ ] 다국어 지원

---

## 💡 유용한 명령어

```bash
# 개발 서버
npm run dev

# 빌드 & 시작
npm run build
npm start

# 린팅 & 포맷팅
npm run lint
npm run lint:fix
npm run format
npm run format:check

# 타입 체크
npm run type-check

# 데이터베이스
npm run db:seed
npm run db:reset
```

---

## 🐛 문제 해결

### 환경 변수 오류
```
Error: Missing Supabase environment variables
```
**해결책**: `.env.local` 파일을 확인하고 Supabase 정보를 입력하세요.

### 포트 3000 사용 중
```bash
npm run dev -- -p 3001
```

### 마이그레이션 오류
- Supabase 대시보드의 SQL Editor에서 직접 실행
- PostgreSQL 버전 호환성 확인 (13+)

---

## 📞 지원

문제가 발생하면:
1. README.md 의 "트러블슈팅" 섹션 확인
2. Supabase 공식 문서 확인
3. Next.js 공식 문서 확인

---

**준비 완료! 행운을 빕니다! 🎵**

---

마지막 확인: 2026-02-14 02:34 UTC+9
