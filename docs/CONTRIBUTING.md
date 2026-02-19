# CONTRIBUTING.md - TUTTI 기여 가이드

TUTTI 프로젝트에 기여해주셔서 감사합니다! 이 문서는 개발 프로세스, 코드 스타일, 커밋 컨벤션을 설명합니다.

---

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/tutti/tutti.git
cd tutti
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.local.example .env.local
# .env.local에 Supabase 키 입력
```

### 4. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000
```

---

## 📋 브랜치 전략

### 메인 브랜치
- **`main`** — 프로덕션 브랜치. 항상 배포 가능한 상태
- **`staging`** — 스테이징 브랜치. QA 전 최종 테스트
- **`develop`** — 개발 브랜치. 기본 작업 대상

### 작업 브랜치
```bash
# 기능 추가
git checkout -b feature/auth-login

# 버그 수정
git checkout -b bugfix/profile-form-error

# 성능 개선
git checkout -b perf/optimize-listings-query

# 문서 작성
git checkout -b docs/api-guide
```

---

## 📝 커밋 메시지 컨벤션

### 포맷
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 스타일 (포맷, 세미콜론 등)
- **refactor**: 코드 리팩토링 (기능 변화 없음)
- **perf**: 성능 개선
- **test**: 테스트 추가/수정
- **chore**: 빌드, 패키지 설정 등

### Scope
- `auth` — 인증
- `profile` — 프로필
- `listing` — 공고
- `application` — 지원
- `chat` — 채팅
- `review` — 리뷰
- `ui` — UI 컴포넌트
- `db` — 데이터베이스
- `api` — API 엔드포인트
- `config` — 설정

### 예시
```bash
git commit -m "feat(auth): implement email login"
git commit -m "fix(profile): fix missing validation on repertoire"
git commit -m "perf(listings): add index on region_id"
git commit -m "docs(api): update endpoint documentation"
```

---

## ✅ Pull Request 프로세스

### 1. PR 제목
- 커밋 메시지 포맷 동일
- 예: `feat(chat): implement real-time messaging`

### 2. PR 설명
```markdown
## 설명
이 PR은 [기능/버그 수정] 관련입니다.

## 변경사항
- 항목 1
- 항목 2

## 테스트 방법
1. 단계 1
2. 단계 2
3. 단계 3

## 스크린샷 (해당 시 첨부)
![image](url)

## 체크리스트
- [ ] 코드 린팅 통과
- [ ] 테스트 작성/통과
- [ ] 문서 업데이트
- [ ] 스스로 검토
```

### 3. 리뷰 & 승인
- 최소 1명 이상의 리뷰 필수
- 모든 CI 체크 통과 필수
- 변경사항이 있으면 다시 리뷰

### 4. 병합
```bash
git merge --squash feature/my-feature
```

---

## 💻 개발 환경

### 코드 스타일
- **ESLint** — `npm run lint`
- **Prettier** — `npm run format`

### 빌드 & 테스트
```bash
npm run build          # 프로덕션 빌드
npm run test           # 단위 테스트
npm run test:e2e       # E2E 테스트
npm run type-check     # TypeScript 타입 체크
```

### 로컬 개발 팁
```bash
# 개발 서버 (hot reload)
npm run dev

# 생산 빌드 테스트
npm run build
npm run start

# 린트 자동 수정
npm run lint:fix
```

---

## 🧪 테스트 작성

### 단위 테스트
```typescript
// __tests__/utils/date.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate(new Date('2026-02-14'));
    expect(result).toBe('2026년 2월 14일');
  });
});
```

### 컴포넌트 테스트
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## 📚 문서 작성

### API 문서
```markdown
## POST /api/auth/login

사용자 로그인

### Request
- `email` (string): 이메일
- `password` (string): 비밀번호

### Response
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {...}
  }
}
```

### TypeScript 주석
```typescript
/**
 * 사용자 정보 조회
 * @param userId - 사용자 ID
 * @returns 사용자 정보
 * @throws 사용자를 찾을 수 없음
 */
async function getUser(userId: string): Promise<User> {
  // ...
}
```

---

## 🐛 버그 리포팅

### 이슈 템플릿
```markdown
## 버그 설명
어떤 문제가 발생했는지 설명하세요.

## 재현 단계
1. ...
2. ...
3. ...

## 예상 결과
어떻게 되어야 하는지

## 실제 결과
실제로 어떻게 되었는지

## 환경
- OS: (예: macOS 12.0)
- 브라우저: (예: Chrome 108)
- 버전: (예: v0.1.0)
```

---

## 🚀 배포 프로세스

### 1. Version 업데이트
```bash
npm version patch    # 0.1.0 → 0.1.1
npm version minor    # 0.1.0 → 0.2.0
npm version major    # 0.1.0 → 1.0.0
```

### 2. 릴리스 생성
```bash
git tag v0.1.0
git push origin v0.1.0
```

### 3. 변경 로그 작성
```markdown
# v0.1.0 (2026-02-18)

## 새로운 기능
- 이메일 로그인 구현
- 프로필 CRUD

## 버그 수정
- 공고 필터 오류 수정

## 성능 개선
- 공고 조회 쿼리 최적화
```

---

## 📞 커뮤니케이션

- **Discord**: [Link TBD]
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 📚 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs)

---

감사합니다! 👋
