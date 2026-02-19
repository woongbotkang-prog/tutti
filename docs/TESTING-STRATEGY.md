# 🧪 TUTTI 테스트 전략

**버전**: 1.0  
**작성일**: 2026-02-14  
**상태**: MVP (단위 테스트 중심)

---

## 📊 테스트 전략 개요

```
테스트 피라미드:

        ▲
       / \
      /E2E\       5-10%  (Playwright/Cypress)
     /─────\
    /Integr\      15-20% (API Route + DB)
   /────────\
  /Unit Test \   70-75% (유틸, 컴포넌트, 훅)
 /____________\

목표: 80% 이상의 코드 커버리지
```

---

## 🎯 테스트 범위

### 1️⃣ **Unit Tests (70-75%)**

각 함수, 컴포넌트를 독립적으로 테스트

```typescript
// ✅ 테스트해야 할 것
- 유틸 함수 (lib/utils.ts)
- React 컴포넌트 (components/*)
- React 훅 (lib/hooks/*)
- 폼 검증 로직

// ❌ 테스트 제외
- 외부 API (Supabase)
- 라우팅 로직
```

### 2️⃣ **Integration Tests (15-20%)**

API Route + 데이터베이스 통합 테스트

```typescript
// ✅ 테스트해야 할 것
- API Route: POST /api/auth/signup
- API Route: GET /api/profiles/{id}
- API Route: POST /api/listings
- DB 쿼리 (RLS 포함)
- 인증 미들웨어

// ❌ 테스트 제외
- 외부 서비스 (이메일 발송)
- 결제 시스템
```

### 3️⃣ **E2E Tests (5-10%)**

전체 사용자 여정 테스트 (UI 포함)

```typescript
// ✅ 테스트해야 할 것
- 회원가입 → 로그인 → 프로필 작성
- 공고 작성 → 검색 → 상세 조회
- 지원 → 수락 → 채팅
- 리뷰 작성 → 매너온도 업데이트

// ❌ 테스트 제외
- 성능 테스트 (Lighthouse)
- 보안 감시
```

---

## 🛠️ 도구 설정

### Jest (단위 + 통합 테스트)

```bash
# package.json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@types/jest": "^29.0.0"
  }
}

# jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

### React Testing Library

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

---

## 📝 테스트 작성 예제

### 1️⃣ **유틸 함수 테스트**

```typescript
// lib/utils.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// __tests__/lib/utils.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date to Korean format', () => {
    const date = new Date('2026-02-14');
    const result = formatDate(date);
    expect(result).toBe('2026년 2월 14일');
  });

  it('should handle invalid dates', () => {
    const date = new Date('invalid');
    expect(() => formatDate(date)).toThrow();
  });
});
```

### 2️⃣ **React 컴포넌트 테스트**

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3️⃣ **폼 컴포넌트 테스트**

```typescript
// __tests__/components/SignUpForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '@/components-auth-forms';

describe('SignUpForm', () => {
  it('should render form fields', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument();
  });

  it('should show error when password is too short', async () => {
    render(<SignUpForm />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호$/i);
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'short');
    await userEvent.click(submitButton);

    expect(screen.getByText(/비밀번호는 8자 이상/i)).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    render(<SignUpForm />);
    
    const passwordInput = screen.getByLabelText(/^비밀번호$/i);
    const confirmInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    await userEvent.type(passwordInput, 'ValidPassword123');
    await userEvent.type(confirmInput, 'DifferentPassword123');
    await userEvent.click(submitButton);

    expect(screen.getByText(/비밀번호가 일치하지 않습니다/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<SignUpForm />);
    
    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^비밀번호$/i), 'ValidPassword123');
    await userEvent.type(screen.getByLabelText(/비밀번호 확인/i), 'ValidPassword123');
    await userEvent.click(screen.getByRole('button', { name: /가입하기/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/signup',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'ValidPassword123',
          userType: 'individual',
        }),
      })
    );
  });
});
```

### 4️⃣ **React 훅 테스트**

```typescript
// __tests__/lib/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/lib/supabase-auth';

describe('useAuth', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should update user state when auth changes', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Supabase 모킹 필요
    // mock supabase.auth.getSession()
  });
});
```

### 5️⃣ **API Route 테스트**

```typescript
// __tests__/api/auth/signup.test.ts
import { POST } from '@/app/api/auth/signup/route';

describe('POST /api/auth/signup', () => {
  it('should return 400 when email is missing', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('AUTH_INVALID_EMAIL');
  });

  it('should return 400 when password is too short', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should create user on valid input', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPassword123',
        userType: 'individual',
      }),
    });

    // Supabase 모킹 필요
    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.user).toBeDefined();
  });
});
```

---

## 🚀 테스트 실행

### 모든 테스트 실행
```bash
npm test
```

### 특정 파일만 테스트
```bash
npm test -- utils.test.ts
```

### 커버리지 확인
```bash
npm test -- --coverage

# 출력:
# ────────────────────────────────────────
# File      | % Stmts | % Branch | % Funcs
# ────────────────────────────────────────
# utils.ts  |   100   |   100    |   100
# Button.tsx|    95   |    92    |    98
# ────────────────────────────────────────
```

### 감시 모드 (개발 중)
```bash
npm test -- --watch
```

---

## 📈 커버리지 목표

```
Sprint 1: 60% 커버리지 (필수 기능)
└─ 인증, 프로필, 공고 기본 CRUD

Sprint 2: 75% 커버리지
└─ 지원, 채팅, 리뷰 추가

Sprint 3+: 85%+ 커버리지
└─ 엣지 케이스, 에러 시나리오
```

---

## 🔄 CI/CD 통합

### GitHub Actions에서 자동 테스트

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run coverage
      - uses: codecov/codecov-action@v3
```

---

## 🧩 Mocking 전략

### Supabase 모킹

```typescript
// __mocks__/supabase.ts
export const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({ data: [] }),
    insert: jest.fn().mockResolvedValue({ data: [] }),
    update: jest.fn().mockResolvedValue({ data: [] }),
    delete: jest.fn().mockResolvedValue({ data: [] }),
  })),
};
```

### 테스트에서 사용

```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));
```

---

## 📋 테스트 체크리스트 (Sprint 1)

- [ ] 유틸 함수 테스트 (lib/utils.ts)
- [ ] 버튼, 입력 필드 컴포넌트 테스트
- [ ] SignUpForm, LoginForm 테스트
- [ ] useAuth 훅 테스트
- [ ] POST /api/auth/signup 테스트
- [ ] POST /api/auth/login 테스트
- [ ] GET /api/profiles/{id} 테스트
- [ ] 전체 커버리지 60% 이상

---

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Supabase](https://supabase.com/docs/guides/testing)

---

**목표: 안정적이고 테스트 가능한 코드베이스 구축** 🎯
