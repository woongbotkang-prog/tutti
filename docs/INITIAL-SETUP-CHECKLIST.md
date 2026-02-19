# 🚀 TUTTI 초기 설정 체크리스트

**귀국 후 3일간의 상세 가이드**

---

## 📅 Day 1 (2026-02-18, 귀국일)

### ⏰ **09:00 - 환경 설정 (30분)**

#### 1️⃣ 저장소 클론 & 초기화
```bash
# 저장소 클론
git clone https://github.com/tutti/tutti.git
cd tutti

# 의존성 설치
npm install

# 버전 확인
npm --version    # 10.x 이상
node --version   # 18.x 이상
```

**체크리스트:**
- [ ] npm install 완료 (오류 없음)
- [ ] node_modules/ 생성됨
- [ ] package-lock.json 생성됨

#### 2️⃣ Supabase 프로젝트 생성
```bash
# https://supabase.com → 로그인
# New Project 클릭
# - 프로젝트명: tutti-prod
# - 리전: Seoul (또는 가장 가까운 곳)
# - 비밀번호: 강력한 비밀번호
```

**받을 정보:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 3️⃣ 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.local.example .env.local

# .env.local 파일 수정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**체크리스트:**
- [ ] .env.local 파일 생성됨
- [ ] 키 값 2개 입력됨
- [ ] 따옴표 제거 (bare keys)

### ⏰ **10:00 - 데이터베이스 마이그레이션 (45분)**

#### 4️⃣ DB 스키마 실행
```bash
# Supabase 대시보드 → SQL Editor

# 1단계: migrations/001_initial_schema.sql 전체 복사
# 파일 열기: cat migrations/001_initial_schema.sql
# Supabase SQL Editor에 붙여넣기
# "Run" 클릭

# 2단계: seed.sql 실행
# 파일 열기: cat seed.sql
# Supabase SQL Editor에 붙여넣기
# "Run" 클릭
```

**기다려야 할 시간:**
- 마이그레이션 실행: 2-3분
- Seed 데이터 삽입: 1-2분

**검증:**
```sql
-- SQL Editor에서 실행
SELECT COUNT(*) FROM regions;        -- 17개
SELECT COUNT(*) FROM instruments;    -- 21개
SELECT COUNT(*) FROM composers;      -- 33개
SELECT COUNT(*) FROM user_profiles;  -- 0개 (아직 사용자 없음)
```

**체크리스트:**
- [ ] 마이그레이션 완료 (에러 없음)
- [ ] Seed 데이터 완료
- [ ] 테이블 18개 생성됨
- [ ] 인덱스 21개 생성됨

### ⏰ **11:00 - GitHub 저장소 연동 (30분)**

#### 5️⃣ GitHub 저장소 초기화
```bash
# 새 저장소 생성 (github.com → New)
# 저장소명: tutti
# 설명: Classical Musicians Matching Platform
# Public 선택
# "Create repository" 클릭

# 로컬에서 푸시
git remote add origin https://github.com/[username]/tutti.git
git branch -M main
git add .
git commit -m "chore: initial project setup"
git push -u origin main
```

**체크리스트:**
- [ ] GitHub 저장소 생성됨
- [ ] 로컬 커밋 완료
- [ ] GitHub에 푸시 완료

#### 6️⃣ Vercel 연동
```bash
# https://vercel.com → 로그인
# "Import Project" → GitHub 선택
# tutti 저장소 선택
# 환경 변수 입력:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
# "Deploy" 클릭
```

**배포 대기 시간:** 3-5분

**체크리스트:**
- [ ] Vercel 프로젝트 생성됨
- [ ] 환경 변수 설정됨
- [ ] 배포 완료 (상태: Ready)

### ⏰ **12:00 - 로컬 테스트 (30분)**

#### 7️⃣ 개발 서버 실행
```bash
npm run dev

# 터미널 출력:
# > tutti@0.1.0 dev
# > next dev
# 
# ▲ Next.js 14.x.x
# Local:        http://localhost:3000
```

**체크리스트:**
- [ ] 개발 서버 실행 (포트 3000)
- [ ] http://localhost:3000 접속 가능

#### 8️⃣ 주요 페이지 확인
```bash
# 브라우저에서:
1. http://localhost:3000
   - 홈페이지 로드 (에러 없음)
   
2. http://localhost:3000/api/health
   - 응답: { "status": "ok" }
   
3. Chrome DevTools → Network
   - 모든 요청 성공 (200 OK)
   - 콘솔에 에러 없음
```

**체크리스트:**
- [ ] 홈페이지 로드 성공
- [ ] Health check 통과
- [ ] 콘솔 에러 없음

#### 9️⃣ 린트 & 빌드 테스트
```bash
# 터미널에서 (Ctrl+C로 개발 서버 중지)

npm run lint
# 출력: ✔ No ESLint errors

npm run build
# 출력: ✔ Compiled successfully

npm run type-check
# 출력: ✔ No TypeScript errors
```

**체크리스트:**
- [ ] ESLint 통과 (에러 없음)
- [ ] 빌드 성공
- [ ] TypeScript 타입 체크 통과

### ⏰ **13:00 - 종합 검증 (15분)**

#### 🔍 **최종 체크리스트**
- [ ] npm install 완료
- [ ] .env.local 설정됨
- [ ] DB 마이그레이션 완료
- [ ] GitHub 저장소 연동됨
- [ ] Vercel 배포 완료
- [ ] 로컬 개발 서버 실행 가능
- [ ] 빌드 성공
- [ ] 린트 통과

**Day 1 완료 상태:** ✅ **100%**

---

## 📅 Day 2 (2026-02-19, 개발 준비)

### ⏰ **10:00 - 인증 시스템 검증 (1시간)**

#### 1️⃣ 회원가입 페이지 확인
```bash
npm run dev

# 브라우저: http://localhost:3000/auth/signup
# 폼 입력 테스트:
# 1. 이메일: test@example.com
# 2. 비밀번호: TestPassword123!
# 3. "가입하기" 클릭
```

**예상 동작:**
- [ ] 폼 입력 필드 표시됨
- [ ] 유효성 검사 작동 (짧은 비밀번호 거절)
- [ ] 가입 성공 시 프로필 설정 페이지로 이동

#### 2️⃣ 로그인 페이지 확인
```bash
# 브라우저: http://localhost:3000/auth/login
# 테스트:
# 1. 이메일: test@example.com
# 2. 비밀번호: TestPassword123!
# 3. "로그인" 클릭
```

**예상 동작:**
- [ ] 로그인 성공 시 홈으로 리다이렉트
- [ ] 토큰 저장됨 (localStorage)
- [ ] 보호된 페이지 접근 가능

#### 3️⃣ 인증 상태 확인
```bash
# Chrome DevTools → Application → Local Storage
# tutti_token 키 확인:
# - 존재 여부
# - JWT 형식 (xxx.yyy.zzz)
```

**체크리스트:**
- [ ] 회원가입 폼 작동
- [ ] 로그인 폼 작동
- [ ] 토큰 저장됨
- [ ] 인증 상태 유지됨

### ⏰ **11:15 - 데이터 조회 테스트 (45분)**

#### 4️⃣ 마스터 데이터 확인
```bash
# 브라우저 Console에서:
fetch('/api/master/regions')
  .then(r => r.json())
  .then(console.log)

# 기대 결과:
# {
#   "success": true,
#   "data": [
#     { "code": "SEL", "name": "서울", "name_en": "Seoul" },
#     ...
#   ]
# }
```

**테스트 엔드포인트:**
- [ ] `/api/master/regions` (17개)
- [ ] `/api/master/instruments` (21개)
- [ ] `/api/master/composers` (33개)

#### 5️⃣ Supabase 연결 확인
```bash
# lib/supabase.ts 테스트:
const { data } = await supabase.from('regions').select('*')
console.log(data)  // 17개 행

const { data } = await supabase.from('instruments').select('*')
console.log(data)  // 21개 행
```

**체크리스트:**
- [ ] Supabase 쿼리 작동
- [ ] 데이터 반환됨
- [ ] 응답 포맷 정상

### ⏰ **12:15 - 환경 설정 정리 (30분)**

#### 6️⃣ 환경 변수 정리
```bash
# 필수 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# .env.local.example 검토
cat .env.local.example

# 모든 필수 변수가 .env.local에 설정되어 있는지 확인
```

**체크리스트:**
- [ ] 필수 환경 변수 모두 설정됨
- [ ] Supabase 연결 테스트 완료
- [ ] API 호출 성공

### ⏰ **13:00 - 종합 검증 (30분)**

#### 🔍 **Day 2 체크리스트**
- [ ] 회원가입 테스트 완료
- [ ] 로그인 테스트 완료
- [ ] 토큰 저장 확인
- [ ] 마스터 데이터 조회 성공
- [ ] Supabase 연결 정상
- [ ] API 엔드포인트 테스트 완료

**Day 2 완료 상태:** ✅ **100%**

---

## 📅 Day 3 (2026-02-20, Sprint 1 준비)

### ⏰ **10:00 - 컴포넌트 검증 (1시간)**

#### 1️⃣ 회원가입 폼 컴포넌트 확인
```bash
# components-auth-forms.tsx 검토
# - SignUpForm 사용 가능
# - LoginForm 사용 가능
# - ProfileCard 사용 가능
# - ListingCard 사용 가능
```

#### 2️⃣ 실제 렌더링 테스트
```bash
# 페이지에서 컴포넌트 import
import { SignUpForm } from '@/components-auth-forms'

# 폼 입력 테스트
# - 필드 초점 이동 가능
# - 버튼 상태 변경 (로딩 중)
# - 에러 메시지 표시
```

**체크리스트:**
- [ ] SignUpForm 컴포넌트 렌더링 성공
- [ ] LoginForm 컴포넌트 렌더링 성공
- [ ] ProfileCard 컴포넌트 렌더링 성공
- [ ] ListingCard 컴포넌트 렌더링 성공

### ⏰ **11:15 - 인증 훅 테스트 (45분)**

#### 3️⃣ useAuth 훅 테스트
```bash
# 페이지에서:
import { useAuth } from '@/lib/supabase-auth'

function MyComponent() {
  const { user, session, isLoading } = useAuth()
  return <div>{user?.email}</div>
}

# 동작 확인:
# - 초기 로딩 상태
# - 사용자 정보 로드
# - 로그아웃 시 상태 초기화
```

**체크리스트:**
- [ ] useAuth 훅 작동
- [ ] 사용자 정보 로드됨
- [ ] 로그인/로그아웃 상태 변경 감지

### ⏰ **12:15 - Sprint 1 계획 (1시간)**

#### 4️⃣ Sprint 1 태스크 정리
```
Sprint 1 (2026-02-21 ~ 2026-03-07, 3주)

Week 1:
- [ ] Auth 화면 (회원가입, 로그인) - 3일
- [ ] 프로필 작성 화면 - 2일

Week 2:
- [ ] 공고 목록/상세 화면 - 3일
- [ ] 공고 작성 화면 - 2일

Week 3:
- [ ] 지원 기능 - 2일
- [ ] 채팅 기초 - 2일
- [ ] 버그 수정 & 최적화 - 1일
```

#### 5️⃣ 개발 환경 최종 확인
```bash
# 모든 도구 준비 완료 확인

# 1. TypeScript
npm run type-check ✅

# 2. ESLint
npm run lint ✅

# 3. 빌드
npm run build ✅

# 4. 개발 서버
npm run dev ✅
```

**체크리스트:**
- [ ] 모든 검증 도구 작동
- [ ] 빌드 성공
- [ ] 개발 서버 안정적
- [ ] Sprint 1 태스크 정리됨

### ⏰ **14:00 - 최종 체크리스트 (30분)**

#### 🔍 **Day 1-3 최종 체크리스트**

**환경 설정:**
- [ ] npm, node 버전 확인
- [ ] Supabase 프로젝트 생성
- [ ] .env.local 설정
- [ ] DB 마이그레이션 완료

**깃 & 배포:**
- [ ] GitHub 저장소 연동
- [ ] Vercel 배포 성공
- [ ] CI/CD 파이프라인 준비

**기술 검증:**
- [ ] 인증 시스템 테스트
- [ ] API 엔드포인트 테스트
- [ ] 컴포넌트 렌더링 테스트
- [ ] 데이터베이스 쿼리 테스트

**준비 완료:**
- [ ] 개발 환경 안정적
- [ ] Sprint 1 태스크 정리
- [ ] 모든 도구 사용 가능

---

## 🚨 문제 해결

### Q: npm install에서 에러 발생
```bash
# 캐시 삭제 후 재시도
npm cache clean --force
npm install
```

### Q: Supabase 연결 오류
```bash
# 환경 변수 재확인
cat .env.local

# Supabase 대시보드에서 키 재발급
```

### Q: 개발 서버 포트 충돌
```bash
# 다른 포트 사용
npm run dev -- -p 3001
```

---

## 📞 연락처

- 기술 문제: GitHub Issues
- 긴급: [Slack/Discord 채널]

---

**Day 3 완료 시, Sprint 1 개발 시작 가능!** 🚀
