# 소셜 로그인 설정 가이드 (카카오 + 구글)

코드는 이미 구현 완료. Supabase 대시보드 설정만 하면 됨.

## 카카오 로그인

### 1. Kakao Developers 앱 등록
1. https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
2. 앱 이름: TUTTI
3. 앱 키 → **REST API 키** 복사

### 2. 카카오 로그인 활성화
1. 제품 설정 → 카카오 로그인 → 활성화 설정 → **ON**
2. Redirect URI 추가: `https://krotxjppdiyxvfuoqdqp.supabase.co/auth/v1/callback`
3. 동의항목 → **account_email** 필수 동의로 설정
4. ⚠️ 이메일 수집하려면 **비즈 앱 전환** 필요 (앱 설정 → 비즈 앱 전환)

### 3. Client Secret 생성
1. 제품 설정 → 카카오 로그인 → 보안 → Client Secret 코드 생성 → **활성화**

### 4. Supabase 설정
1. Supabase Dashboard → Authentication → Providers → **Kakao**
2. **Client ID**: REST API 키
3. **Client Secret**: 위에서 생성한 코드
4. **Enabled** 체크
5. Save

---

## 구글 로그인

### 1. Google Cloud Console
1. https://console.cloud.google.com → 새 프로젝트 (또는 기존 프로젝트)
2. API 및 서비스 → OAuth 동의 화면 → 외부 → 생성
3. 앱 이름: TUTTI, 지원 이메일 입력

### 2. OAuth 2.0 Client ID 생성
1. API 및 서비스 → 사용자 인증 정보 → + 사용자 인증 정보 → OAuth 클라이언트 ID
2. 애플리케이션 유형: **웹 애플리케이션**
3. 승인된 리디렉션 URI: `https://krotxjppdiyxvfuoqdqp.supabase.co/auth/v1/callback`
4. **Client ID**와 **Client Secret** 복사

### 3. Supabase 설정
1. Supabase Dashboard → Authentication → Providers → **Google**
2. **Client ID**: 위에서 복사
3. **Client Secret**: 위에서 복사
4. **Enabled** 체크
5. Save

---

## 테스트
설정 후 https://tutti-kohl.vercel.app/signup 에서 카카오/구글 버튼 클릭하여 테스트
