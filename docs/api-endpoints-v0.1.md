# TUTTI API 엔드포인트 스펙 v0.1
> 클래식 연주자 매칭 플랫폼 - RESTful API 설계
> 작성일: 2026-02-14 | 버전: v0.1

---

## 📋 목차
1. [API 개요](#api-개요)
2. [표준 응답 포맷](#표준-응답-포맷)
3. [표준 에러 코드](#표준-에러-코드)
4. [권한 매트릭스](#권한-매트릭스)
5. [페이지네이션](#페이지네이션)
6. [인증 엔드포인트](#인증-엔드포인트)
7. [프로필 엔드포인트](#프로필-엔드포인트)
8. [공고 엔드포인트](#공고-엔드포인트)
9. [지원 엔드포인트](#지원-엔드포인트)
10. [채팅 엔드포인트](#채팅-엔드포인트)
11. [리뷰 엔드포인트](#리뷰-엔드포인트)
12. [마스터 데이터 엔드포인트](#마스터-데이터-엔드포인트)

---

## API 개요

### 기본 정보
- **Base URL**: `https://api.tutti.kr/api`
- **API Version**: v1
- **인증**: Bearer Token (Supabase JWT)
- **응답 형식**: JSON (charset: utf-8)
- **타임존**: ISO 8601 (UTC)

### HTTP 상태 코드
| 코드 | 의미 | 사용 사례 |
|------|------|---------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 (응답 본문 없음) |
| 400 | Bad Request | 요청 파라미터 오류 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 (예: 이미 지원함) |
| 422 | Unprocessable Entity | 요청 데이터 유효성 오류 |
| 429 | Too Many Requests | 속도 제한 |
| 500 | Internal Server Error | 서버 오류 |

---

## 표준 응답 포맷

### 성공 응답 (2xx)
```json
{
  "success": true,
  "data": {
    // 리소스 데이터
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

### 실패 응답 (4xx, 5xx)
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "사용자 친화적 에러 메시지",
  "details": {
    // 추가 디버깅 정보 (선택사항)
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

### 페이지네이션 응답
```json
{
  "success": true,
  "data": [
    // 리스트 아이템
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

## 표준 에러 코드

### 인증 & 권한 (AUTH_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| AUTH_REQUIRED | 401 | 인증이 필요합니다 |
| AUTH_INVALID_TOKEN | 401 | 유효하지 않은 토큰 |
| AUTH_TOKEN_EXPIRED | 401 | 토큰이 만료되었습니다 |
| AUTH_INVALID_CREDENTIALS | 401 | 이메일 또는 비밀번호가 올바르지 않습니다 |
| AUTH_EMAIL_ALREADY_EXISTS | 409 | 이미 가입된 이메일입니다 |
| AUTH_WEAK_PASSWORD | 422 | 비밀번호가 너무 약합니다 (8자 이상, 숫자/문자 포함) |
| AUTH_PERMISSION_DENIED | 403 | 권한이 없습니다 |
| AUTH_PROFILE_REQUIRED | 400 | 프로필이 필요합니다 |
| AUTH_ORG_ADMIN_ONLY | 403 | 단체 관리자만 가능합니다 |

### 프로필 & 사용자 (PROFILE_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| PROFILE_NOT_FOUND | 404 | 프로필을 찾을 수 없습니다 |
| PROFILE_ALREADY_EXISTS | 409 | 프로필이 이미 존재합니다 |
| PROFILE_INCOMPLETE | 400 | 프로필이 불완전합니다 |
| USER_NOT_FOUND | 404 | 사용자를 찾을 수 없습니다 |
| USER_INACTIVE | 403 | 비활성 사용자입니다 |

### 공고 & 검색 (LISTING_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| LISTING_NOT_FOUND | 404 | 공고를 찾을 수 없습니다 |
| LISTING_CLOSED | 400 | 종료된 공고입니다 |
| LISTING_EXPIRED | 400 | 만료된 공고입니다 |
| LISTING_FILLED | 400 | 이미 모집이 완료된 공고입니다 |
| LISTING_INVALID_TYPE | 422 | 유효하지 않은 공고 타입 (recruiting/seeking) |
| LISTING_INVALID_DEADLINE | 422 | 유효하지 않은 마감일 (현재 시간 이후여야 함) |
| LISTING_INVALID_INSTRUMENTS | 422 | 유효하지 않은 악기 목록 |
| LISTING_CREATION_FAILED | 500 | 공고 생성 실패 |
| LISTING_NO_APPLICATIONS | 404 | 지원자가 없습니다 |

### 지원 (APPLICATION_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| APPLICATION_NOT_FOUND | 404 | 지원을 찾을 수 없습니다 |
| APPLICATION_ALREADY_EXISTS | 409 | 이미 지원했습니다 |
| APPLICATION_INVALID_STATUS | 422 | 유효하지 않은 상태 변경 |
| APPLICATION_PERMISSION_DENIED | 403 | 지원을 수정할 권한이 없습니다 |
| APPLICATION_CLOSED_LISTING | 400 | 종료된 공고에 지원할 수 없습니다 |
| APPLICATION_MISSING_PROFILE | 400 | 프로필이 필요합니다 (개인용) |
| APPLICATION_CANNOT_SELF_APPLY | 400 | 자신의 공고에 지원할 수 없습니다 |

### 채팅 (CHAT_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| CHAT_ROOM_NOT_FOUND | 404 | 채팅방을 찾을 수 없습니다 |
| CHAT_PERMISSION_DENIED | 403 | 채팅방 접근 권한이 없습니다 |
| CHAT_MESSAGE_NOT_FOUND | 404 | 메시지를 찾을 수 없습니다 |
| CHAT_CANNOT_DELETE_OLD | 400 | 24시간 이상 된 메시지는 삭제할 수 없습니다 |
| CHAT_INVALID_MESSAGE | 422 | 메시지 내용이 비어있거나 너무 깁니다 (1-2000자) |

### 리뷰 (REVIEW_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| REVIEW_NOT_FOUND | 404 | 리뷰를 찾을 수 없습니다 |
| REVIEW_ALREADY_EXISTS | 409 | 이미 작성한 리뷰입니다 |
| REVIEW_PERMISSION_DENIED | 403 | 리뷰를 수정할 권한이 없습니다 |
| REVIEW_INVALID_SCORES | 422 | 점수는 1-5 범위여야 합니다 |
| REVIEW_NO_CHAT_ROOM | 400 | 해당 채팅방이 없어 리뷰를 작성할 수 없습니다 |
| REVIEW_SELF_REVIEW | 400 | 자신에게 리뷰를 남길 수 없습니다 |

### 기술 & 시스템 (SYSTEM_*)
| 코드 | HTTP | 설명 |
|------|------|------|
| SYSTEM_INVALID_REGION | 422 | 유효하지 않은 지역입니다 |
| SYSTEM_INVALID_INSTRUMENT | 422 | 유효하지 않은 악기입니다 |
| SYSTEM_INVALID_SKILL_LEVEL | 422 | 유효하지 않은 실력 수준입니다 |
| SYSTEM_INVALID_PARAMETERS | 422 | 유효하지 않은 파라미터입니다 |
| SYSTEM_RATE_LIMIT_EXCEEDED | 429 | 요청 한도를 초과했습니다 (1분에 60회) |
| SYSTEM_MAINTENANCE | 503 | 서버 점검 중입니다 |

---

## 권한 매트릭스

### 사용자 상태별 권한

| 액션 | 비회원 | 회원(프로필 없음) | 개인 회원 | 단체 회원 | 단체 관리자 |
|------|--------|------------------|---------|---------|-----------|
| 공고 목록 조회 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 공고 상세 조회 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 공고 생성 (구인) | ❌ | ❌ | ❌ | ✅ | ✅ |
| 공고 생성 (구직) | ❌ | ❌ | ✅ | ❌ | ❌ |
| 공고 수정/삭제 | ❌ | ❌ | 본인만 | 본인만 | 본인만 |
| 지원하기 | ❌ | ❌ | ✅ | ❌ | ❌ |
| 지원자 관리 | ❌ | ❌ | 본인의 공고 | 본인의 공고 | 본인의 공고 |
| 채팅 | ❌ | ❌ | ✅* | ✅* | ✅* |
| 리뷰 작성 | ❌ | ❌ | ✅* | ✅* | ✅* |
| 개인 프로필 조회 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 개인 프로필 수정 | ❌ | 본인 | 본인 | ❌ | ❌ |
| 단체 프로필 조회 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 단체 프로필 수정 | ❌ | ❌ | ❌ | 본인 | 본인 |
| 마이페이지 | ❌ | ✅ | ✅ | ✅ | ✅ |

**주석:**
- `*`: 해당 채팅방/협연의 참여자만 가능
- 단체 관리자: 단체 프로필을 생성할 때 지정된 개인 사용자
- 비회원이 프로필 조회 가능 → 서비스 트러스트 구축 목표

---

## 페이지네이션

### 쿼리 파라미터
| 파라미터 | 타입 | 기본값 | 범위 | 설명 |
|---------|------|-------|------|------|
| `limit` | integer | 20 | 1-100 | 한 페이지당 항목 수 |
| `offset` | integer | 0 | 0+ | 건너뛸 항목 수 |

### 예시
```
GET /api/listings?limit=20&offset=0   # 첫 번째 페이지
GET /api/listings?limit=20&offset=20  # 두 번째 페이지
GET /api/listings?limit=50&offset=100 # 세 번째 페이지 (50개 단위)
```

### 응답 구조
```json
{
  "success": true,
  "data": [ /* 20개 항목 */ ],
  "pagination": {
    "total": 150,        // 전체 항목 수
    "limit": 20,         // 페이지당 항목 수
    "offset": 0,         // 현재 오프셋
    "has_next": true,    // 다음 페이지 존재 여부
    "has_prev": false,   // 이전 페이지 존재 여부
    "total_pages": 8     // 전체 페이지 수
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

### 권장사항
- **기본값으로 `limit=20` 사용** → 모바일 성능
- **`limit`은 100 초과 불가** → DOS 방지
- **`offset`이 총 항목 수를 초과하면 빈 배열 반환** (에러 아님)
- **정렬 기본값: 최신순 (`created_at DESC`)**

---

## 인증 엔드포인트

### 1. 회원가입
```
POST /auth/signup
```

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "user_type": "individual"  // 또는 "organization"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-user-id",
    "email": "user@example.com",
    "user_type": "individual",
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 중복된 이메일 | `AUTH_EMAIL_ALREADY_EXISTS` | 409 |
| 약한 비밀번호 | `AUTH_WEAK_PASSWORD` | 422 |
| 유효하지 않은 이메일 | `SYSTEM_INVALID_PARAMETERS` | 422 |
| 유효하지 않은 user_type | `SYSTEM_INVALID_PARAMETERS` | 422 |

#### 비고
- 비밀번호: 최소 8자, 숫자와 문자 포함 필수
- 회원가입 직후 프로필 작성 페이지로 리다이렉트
- 이메일 인증 선택사항 (MVP에서는 생략 가능)

---

### 2. 로그인
```
POST /auth/login
```

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-user-id",
    "email": "user@example.com",
    "user_type": "individual",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 잘못된 이메일/비밀번호 | `AUTH_INVALID_CREDENTIALS` | 401 |
| 사용자 없음 | `USER_NOT_FOUND` | 404 |
| 비활성 사용자 | `USER_INACTIVE` | 403 |

#### 비고
- `access_token`: JWT, 1시간 유효
- `refresh_token`: 2주 유효, 새 access_token 발급용
- Supabase Auth와 직접 연동

---

### 3. 로그아웃
```
POST /auth/logout
```

#### Request
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (204 No Content)
```
(응답 본문 없음)
```

#### 비고
- 클라이언트 측에서 `access_token`, `refresh_token` 모두 삭제
- 선택사항: refresh_token을 블랙리스트에 등록 (상태비저장 JWT 사용 시)

---

### 4. 프로필 확인 (내 정보)
```
GET /auth/me
Authorization: Bearer {access_token}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-user-id",
    "email": "user@example.com",
    "user_type": "individual",
    "profile": {
      "id": "uuid-profile-id",
      "nickname": "김연주",
      "primary_instrument_id": "uuid-instrument",
      "skill_level": "intermediate",
      "region_id": "uuid-region",
      "photo_url": "https://storage.tutti.kr/...",
      "manner_temperature": 38.5,
      "is_active": true,
      "created_at": "2026-02-13T15:20:00.000Z"
    },
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 인증 필요 | `AUTH_REQUIRED` | 401 |
| 유효하지 않은 토큰 | `AUTH_INVALID_TOKEN` | 401 |
| 토큰 만료 | `AUTH_TOKEN_EXPIRED` | 401 |

#### 비고
- 프로필이 없을 수도 있음 → `profile: null`
- 단체 회원인 경우 `profile`은 조직 프로필

---

### 5. 토큰 갱신
```
POST /auth/refresh
```

#### Request
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 유효하지 않은 토큰 | `AUTH_INVALID_TOKEN` | 401 |
| 토큰 만료 | `AUTH_TOKEN_EXPIRED` | 401 |

---

## 프로필 엔드포인트

### 개인 프로필

#### 1. 개인 프로필 조회
```
GET /profiles/individual/{user_id}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-profile-id",
    "user_id": "uuid-user-id",
    "nickname": "김연주",
    "primary_instrument": {
      "id": "uuid-instrument",
      "name": "바이올린",
      "category": "현악기"
    },
    "skill_level": "intermediate",  // beginner, elementary, intermediate, advanced, professional
    "region": {
      "id": "uuid-region",
      "name": "서울",
      "code": "seoul"
    },
    "photo_url": "https://storage.tutti.kr/profiles/user123/photo.jpg",
    "career_description": "음악대학 재학중, 실내악 경험 3년",
    "practice_frequency": "주 2-3회",
    "video_link": "https://youtube.com/watch?v=...",
    "manner_temperature": 38.5,
    "is_verified": false,
    "is_active": true,
    "repertoires": [
      {
        "id": "uuid-repertoire",
        "composer_id": "uuid-composer",
        "composer_name": "모차르트",
        "piece_name": "바이올린 협주곡 제5번",
        "notes": "콩쿠르 준비곡"
      }
    ],
    "created_at": "2026-02-13T15:20:00.000Z",
    "updated_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 누구나 조회 가능 (비회원도 포함)
- `manner_temperature`: 0~100°C, 기본값 36.5°C
- `is_verified`: 음악대 졸업증/상장 등으로 인증된 경우

---

#### 2. 개인 프로필 생성
```
POST /profiles/individual
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "nickname": "김연주",
  "primary_instrument_id": "uuid-instrument",
  "skill_level": "intermediate",
  "region_id": "uuid-region",
  "photo_url": "https://storage.tutti.kr/profiles/user123/photo.jpg",
  "career_description": "음악대학 재학중, 실내악 경험 3년",
  "practice_frequency": "주 2-3회",
  "video_link": "https://youtube.com/watch?v=..."
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-profile-id",
    "user_id": "uuid-user-id",
    "nickname": "김연주",
    "primary_instrument_id": "uuid-instrument",
    "skill_level": "intermediate",
    "region_id": "uuid-region",
    "manner_temperature": 36.5,
    "is_active": true,
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 프로필 이미 존재 | `PROFILE_ALREADY_EXISTS` | 409 |
| 유효하지 않은 악기 | `SYSTEM_INVALID_INSTRUMENT` | 422 |
| 유효하지 않은 지역 | `SYSTEM_INVALID_REGION` | 422 |
| 유효하지 않은 실력 | `SYSTEM_INVALID_SKILL_LEVEL` | 422 |
| 중복된 닉네임 | `SYSTEM_INVALID_PARAMETERS` | 422 |

#### 비고
- 필수: `nickname`, `primary_instrument_id`, `skill_level`, `region_id`
- 선택: `photo_url`, `career_description`, `practice_frequency`, `video_link`
- 프로필 생성 후 공고 지원 가능

---

#### 3. 개인 프로필 수정
```
PATCH /profiles/individual/{user_id}
Authorization: Bearer {access_token}
```

#### Request (업데이트할 필드만 포함)
```json
{
  "nickname": "김연주 (변경)",
  "skill_level": "advanced",
  "practice_frequency": "주 4회 이상",
  "manner_temperature": 40.0
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-profile-id",
    "nickname": "김연주 (변경)",
    "skill_level": "advanced",
    "practice_frequency": "주 4회 이상",
    "manner_temperature": 40.0,
    "updated_at": "2026-02-14T11:00:00.123Z"
  },
  "timestamp": "2026-02-14T11:00:00.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 본인 프로필 아님 | `AUTH_PERMISSION_DENIED` | 403 |
| 프로필 없음 | `PROFILE_NOT_FOUND` | 404 |

#### 비고
- 본인의 프로필만 수정 가능
- `manner_temperature`는 시스템이 조정 (사용자 수정 불가)

---

#### 4. 개인 프로필 삭제
```
DELETE /profiles/individual/{user_id}
Authorization: Bearer {access_token}
```

#### Response (204 No Content)
```
(응답 본문 없음)
```

#### 비고
- 본인의 프로필만 삭제 가능
- 관련 공고/지원/채팅은 연쇄 삭제 (soft delete 권장)

---

### 단체 프로필

#### 1. 단체 프로필 조회
```
GET /profiles/organization/{user_id}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-org-profile-id",
    "user_id": "uuid-user-id",
    "name": "뮤직 앙상블",
    "organization_type": "chamber_music",  // orchestra, chamber_music, youth_orchestra, other
    "region": {
      "id": "uuid-region",
      "name": "서울",
      "code": "seoul"
    },
    "admin_user_id": "uuid-admin-user",
    "logo_url": "https://storage.tutti.kr/orgs/org123/logo.png",
    "description": "서울을 기반으로 하는 현악 앙상블입니다",
    "practice_schedule": "매주 토요일 2-5pm",
    "current_lineup": {
      "violin_1": 2,
      "violin_2": 1,
      "viola": 1,
      "cello": 1,
      "bass": 0
    },
    "manner_temperature": 42.0,
    "is_verified": false,
    "is_active": true,
    "member_count": 6,
    "created_at": "2026-02-13T15:20:00.000Z",
    "updated_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 누구나 조회 가능
- `admin_user_id`: 단체 관리자의 user_id

---

#### 2. 단체 프로필 생성
```
POST /profiles/organization
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "name": "뮤직 앙상블",
  "organization_type": "chamber_music",
  "region_id": "uuid-region",
  "logo_url": "https://storage.tutti.kr/orgs/org123/logo.png",
  "description": "서울을 기반으로 하는 현악 앙상블입니다",
  "practice_schedule": "매주 토요일 2-5pm",
  "current_lineup": {
    "violin_1": 2,
    "violin_2": 1,
    "viola": 1,
    "cello": 1,
    "bass": 0
  }
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-org-profile-id",
    "user_id": "uuid-user-id",
    "name": "뮤직 앙상블",
    "organization_type": "chamber_music",
    "admin_user_id": "uuid-user-id",
    "manner_temperature": 36.5,
    "is_active": true,
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 프로필 이미 존재 | `PROFILE_ALREADY_EXISTS` | 409 |
| 유효하지 않은 단체 유형 | `SYSTEM_INVALID_PARAMETERS` | 422 |
| 유효하지 않은 지역 | `SYSTEM_INVALID_REGION` | 422 |

#### 비고
- 필수: `name`, `organization_type`, `region_id`
- 선택: `logo_url`, `description`, `practice_schedule`, `current_lineup`
- 생성 시 현재 사용자가 자동으로 `admin_user_id` 지정

---

#### 3. 단체 프로필 수정
```
PATCH /profiles/organization/{user_id}
Authorization: Bearer {access_token}
```

#### Request (업데이트할 필드만 포함)
```json
{
  "description": "현악 앙상블 (업데이트됨)",
  "practice_schedule": "매주 일요일 2-5pm",
  "current_lineup": {
    "violin_1": 3,
    "violin_2": 2,
    "viola": 1,
    "cello": 1,
    "bass": 1
  }
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-org-profile-id",
    "description": "현악 앙상블 (업데이트됨)",
    "practice_schedule": "매주 일요일 2-5pm",
    "current_lineup": {
      "violin_1": 3,
      "violin_2": 2,
      "viola": 1,
      "cello": 1,
      "bass": 1
    },
    "updated_at": "2026-02-14T11:00:00.123Z"
  },
  "timestamp": "2026-02-14T11:00:00.123Z"
}
```

#### 비고
- 단체 관리자만 수정 가능
- `current_lineup`은 악기별 인원 수 (정수)

---

### 레퍼토리

#### 1. 레퍼토리 추가 (개인용)
```
POST /profiles/individual/{user_id}/repertoires
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "composer_id": "uuid-composer",
  "piece_name": "바이올린 협주곡 제5번",
  "notes": "콩쿠르 준비곡"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-repertoire",
    "individual_profile_id": "uuid-profile",
    "composer_id": "uuid-composer",
    "piece_name": "바이올린 협주곡 제5번",
    "notes": "콩쿠르 준비곡",
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- `composer_id`는 사전에 생성된 작곡가 데이터 참조
- 중복 방지: `(individual_profile_id, composer_id, piece_name)` unique

---

#### 2. 레퍼토리 목록 조회
```
GET /profiles/individual/{user_id}/repertoires
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `limit` | integer | 페이지당 항목 수 (기본: 20) |
| `offset` | integer | 오프셋 (기본: 0) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-repertoire",
      "composer": {
        "id": "uuid-composer",
        "name": "모차르트",
        "period": "classical"
      },
      "piece_name": "바이올린 협주곡 제5번",
      "notes": "콩쿠르 준비곡",
      "created_at": "2026-02-14T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

#### 3. 레퍼토리 삭제
```
DELETE /profiles/individual/{user_id}/repertoires/{repertoire_id}
Authorization: Bearer {access_token}
```

#### Response (204 No Content)
```
(응답 본문 없음)
```

---

## 공고 엔드포인트

### 1. 공고 생성
```
POST /listings
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "title": "봄 협주회 바이올린 모집",
  "description": "2026년 봄을 맞아 뮤직앙상블에서는 함께할 바이올린 연주자를 모집합니다...",
  "listing_type": "recruiting",  // recruiting (단체→개인) or seeking (개인→팀)
  "region_id": "uuid-region",
  "required_skill_level": "intermediate",  // nullable
  "practice_frequency": "월 2회",
  "required_instruments": ["uuid-instrument-1"],
  "genre_tags": ["classical", "romantic"],
  "repertoire_tags": ["mozart", "brahms", "schubert"],
  "deadline": "2026-03-15T23:59:59Z"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-listing-id",
    "created_by_user_id": "uuid-user-id",
    "title": "봄 협주회 바이올린 모집",
    "description": "2026년 봄을 맞아...",
    "listing_type": "recruiting",
    "region": {
      "id": "uuid-region",
      "name": "서울"
    },
    "required_skill_level": "intermediate",
    "practice_frequency": "월 2회",
    "required_instruments": [
      {
        "id": "uuid-instrument-1",
        "name": "바이올린"
      }
    ],
    "genre_tags": ["classical", "romantic"],
    "repertoire_tags": ["mozart", "brahms", "schubert"],
    "status": "active",
    "application_count": 0,
    "deadline": "2026-03-15T23:59:59Z",
    "created_at": "2026-02-14T10:30:45.123Z",
    "updated_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 프로필 없음 | `AUTH_PROFILE_REQUIRED` | 400 |
| 유효하지 않은 마감일 | `LISTING_INVALID_DEADLINE` | 422 |
| 유효하지 않은 악기 | `LISTING_INVALID_INSTRUMENTS` | 422 |
| 유효하지 않은 공고 타입 | `LISTING_INVALID_TYPE` | 422 |

#### 비고
- `listing_type = "recruiting"`: 단체만 가능 (organization 타입)
- `listing_type = "seeking"`: 개인만 가능 (individual 타입)
- `deadline`은 현재 시간보다 뒤여야 함
- `status` 초기값: "active"
- 90일 뒤 자동 만료 (또는 수동 종료)

---

### 2. 공고 목록 조회 (필터 & 검색)
```
GET /listings
```

#### Query Parameters
| 파라미터 | 타입 | 예시 | 설명 |
|---------|------|-----|------|
| `listing_type` | string | `recruiting` | 구인/구직 필터 |
| `region_id` | string | `uuid-region` | 지역 필터 |
| `skill_level` | string | `intermediate` | 실력 필터 |
| `instrument_id` | string | `uuid-instrument` | 악기 필터 |
| `genre` | string | `romantic` | 장르 필터 |
| `status` | string | `active` | 상태 필터 |
| `search` | string | `바이올린` | 제목/설명 검색 |
| `sort_by` | string | `latest` | 정렬 기준 (latest, deadline, popularity) |
| `limit` | integer | 20 | 페이지 크기 |
| `offset` | integer | 0 | 오프셋 |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-listing-id",
      "title": "봄 협주회 바이올린 모집",
      "listing_type": "recruiting",
      "region": { "id": "uuid-region", "name": "서울" },
      "required_skill_level": "intermediate",
      "required_instruments": [
        { "id": "uuid-instrument-1", "name": "바이올린" }
      ],
      "status": "active",
      "application_count": 3,
      "deadline": "2026-03-15T23:59:59Z",
      "created_at": "2026-02-14T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 비회원도 조회 가능
- 기본 정렬: `latest` (최신순)
- `status = active` 공고만 기본 반환 (특수 요청 시 다른 상태도 포함)
- 상태가 "active"이고 `deadline` 지난 공고는 자동으로 "expired"로 변경

---

### 3. 공고 상세 조회
```
GET /listings/{listing_id}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-listing-id",
    "created_by_user_id": "uuid-user-id",
    "title": "봄 협주회 바이올린 모집",
    "description": "2026년 봄을 맞아...",
    "listing_type": "recruiting",
    "region": { "id": "uuid-region", "name": "서울" },
    "required_skill_level": "intermediate",
    "practice_frequency": "월 2회",
    "required_instruments": [
      { "id": "uuid-instrument-1", "name": "바이올린", "category": "현악기" }
    ],
    "genre_tags": ["classical", "romantic"],
    "repertoire_tags": ["mozart", "brahms", "schubert"],
    "status": "active",
    "application_count": 3,
    "accepted_count": 1,
    "deadline": "2026-03-15T23:59:59Z",
    "creator": {
      "id": "uuid-user-id",
      "profile": {
        "id": "uuid-org-profile",
        "name": "뮤직 앙상블",
        "manner_temperature": 42.0,
        "is_verified": false
      }
    },
    "created_at": "2026-02-14T10:30:45.123Z",
    "updated_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 공고 생성자의 프로필 정보 포함 (신뢰도 표시)

---

### 4. 공고 수정
```
PATCH /listings/{listing_id}
Authorization: Bearer {access_token}
```

#### Request (업데이트할 필드만)
```json
{
  "title": "봄 협주회 바이올린 모집 (마감 연장)",
  "description": "기한을 연장합니다...",
  "deadline": "2026-03-22T23:59:59Z",
  "status": "active"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-listing-id",
    "title": "봄 협주회 바이올린 모집 (마감 연장)",
    "deadline": "2026-03-22T23:59:59Z",
    "updated_at": "2026-02-14T11:00:00.123Z"
  },
  "timestamp": "2026-02-14T11:00:00.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 본인 공고 아님 | `AUTH_PERMISSION_DENIED` | 403 |
| 공고 없음 | `LISTING_NOT_FOUND` | 404 |
| 이미 종료된 공고 | `LISTING_CLOSED` | 400 |

#### 비고
- 공고 생성자만 수정 가능
- 상태가 "closed", "filled" 상태는 재오픈 불가 (재등록 권장)

---

### 5. 공고 삭제
```
DELETE /listings/{listing_id}
Authorization: Bearer {access_token}
```

#### Response (204 No Content)
```
(응답 본문 없음)
```

#### 비고
- 공고 생성자만 삭제 가능
- 관련 지원 기록은 soft delete

---

## 지원 엔드포인트

### 1. 공고에 지원하기
```
POST /listings/{listing_id}/applications
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "application_message": "안녕하세요. 저는 바이올린을 5년간 연주해온 연주자입니다..."
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-application-id",
    "listing_id": "uuid-listing-id",
    "applicant_user_id": "uuid-user-id",
    "status": "pending",
    "application_message": "안녕하세요. 저는...",
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 프로필 없음 | `APPLICATION_MISSING_PROFILE` | 400 |
| 이미 지원함 | `APPLICATION_ALREADY_EXISTS` | 409 |
| 자신의 공고 지원 | `APPLICATION_CANNOT_SELF_APPLY` | 400 |
| 공고 종료됨 | `APPLICATION_CLOSED_LISTING` | 400 |
| 공고 없음 | `LISTING_NOT_FOUND` | 404 |

#### 비고
- 개인 회원만 지원 가능
- 프로필이 필요함
- 중복 방지: `(listing_id, applicant_user_id)` unique constraint
- 상태 초기값: "pending"

---

### 2. 지원자 목록 조회 (공고별)
```
GET /listings/{listing_id}/applications
Authorization: Bearer {access_token}
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `status` | string | pending, accepted, rejected 필터 |
| `limit` | integer | 페이지 크기 (기본: 20) |
| `offset` | integer | 오프셋 (기본: 0) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-application-id",
      "applicant": {
        "user_id": "uuid-user-id",
        "profile": {
          "id": "uuid-profile",
          "nickname": "김연주",
          "primary_instrument": { "id": "uuid", "name": "바이올린" },
          "skill_level": "intermediate",
          "manner_temperature": 38.5
        }
      },
      "status": "pending",
      "application_message": "안녕하세요...",
      "created_at": "2026-02-14T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 공고 생성자만 조회 가능
- 지원자의 프로필 정보 포함 (신뢰도 표시)

---

### 3. 지원 상태 변경 (수락/거절)
```
PATCH /listings/{listing_id}/applications/{application_id}
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "status": "accepted"  // 또는 "rejected"
}
```

#### 수락 시 Request
```json
{
  "status": "accepted"
}
```

#### 거절 시 Request
```json
{
  "status": "rejected",
  "rejection_reason": "skill_mismatch",  // skill_mismatch, location_mismatch, schedule_mismatch, repertoire_mismatch, already_filled, other
  "rejection_note": "더 높은 실력의 연주자를 찾고 있습니다"
}
```

#### Response (200) - 수락 시
```json
{
  "success": true,
  "data": {
    "id": "uuid-application-id",
    "status": "accepted",
    "chat_room_id": "uuid-chat-room-id",  // 자동 생성됨
    "created_at": "2026-02-14T10:30:45.123Z",
    "updated_at": "2026-02-14T10:45:00.123Z"
  },
  "timestamp": "2026-02-14T10:45:00.123Z"
}
```

#### Response (200) - 거절 시
```json
{
  "success": true,
  "data": {
    "id": "uuid-application-id",
    "status": "rejected",
    "rejection_reason": "skill_mismatch",
    "rejection_note": "더 높은 실력의 연주자를 찾고 있습니다",
    "updated_at": "2026-02-14T10:45:00.123Z"
  },
  "timestamp": "2026-02-14T10:45:00.123Z"
}
```

#### 비고
- 공고 생성자만 상태 변경 가능
- 수락 시 자동으로 `chat_rooms` 레코드 생성 (양쪽이 참여)
- 거절 시 `rejection_reason`은 선택사항이지만 권장

---

### 4. 내 지원 현황 조회
```
GET /applications?user_id=current
Authorization: Bearer {access_token}
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `status` | string | pending, accepted, rejected 필터 |
| `limit` | integer | 페이지 크기 (기본: 20) |
| `offset` | integer | 오프셋 (기본: 0) |
| `sort_by` | string | latest, oldest (기본: latest) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-application-id",
      "listing": {
        "id": "uuid-listing-id",
        "title": "봄 협주회 바이올린 모집",
        "listing_type": "recruiting",
        "status": "active",
        "deadline": "2026-03-15T23:59:59Z"
      },
      "status": "pending",
      "created_at": "2026-02-14T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

### 5. 지원 취소
```
DELETE /applications/{application_id}
Authorization: Bearer {access_token}
```

#### Response (204 No Content)
```
(응답 본문 없음)
```

#### 비고
- 지원자만 취소 가능 (상태: pending → cancelled)

---

## 채팅 엔드포인트

### 1. 채팅방 목록 조회
```
GET /chats
Authorization: Bearer {access_token}
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `limit` | integer | 페이지 크기 (기본: 20) |
| `offset` | integer | 오프셋 (기본: 0) |
| `sort_by` | string | recent, oldest (기본: recent) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-chat-room-id",
      "application_id": "uuid-application-id",
      "user_id_1": "uuid-user-1",
      "user_id_2": "uuid-user-2",
      "other_user": {
        "user_id": "uuid-user-2",
        "profile": {
          "id": "uuid-profile",
          "nickname": "이연주",
          "photo_url": "https://storage.tutti.kr/..."
        }
      },
      "last_message": {
        "id": "uuid-message-id",
        "message_text": "안녕하세요!",
        "sender_user_id": "uuid-user-1",
        "created_at": "2026-02-14T10:30:45.123Z"
      },
      "unread_count": 2,
      "created_at": "2026-02-13T15:20:00.000Z",
      "updated_at": "2026-02-14T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 현재 사용자가 참여한 채팅방만 조회 가능
- `unread_count`: 읽지 않은 메시지 수
- `last_message`: 마지막 메시지 미리보기

---

### 2. 채팅방 상세 조회
```
GET /chats/{chat_room_id}
Authorization: Bearer {access_token}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-chat-room-id",
    "application_id": "uuid-application-id",
    "participant_1": {
      "user_id": "uuid-user-1",
      "profile": {
        "id": "uuid-profile-1",
        "nickname": "김연주"
      }
    },
    "participant_2": {
      "user_id": "uuid-user-2",
      "profile": {
        "id": "uuid-profile-2",
        "nickname": "이연주"
      }
    },
    "created_at": "2026-02-13T15:20:00.000Z",
    "updated_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

### 3. 메시지 목록 조회 (채팅방별)
```
GET /chats/{chat_room_id}/messages
Authorization: Bearer {access_token}
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `limit` | integer | 페이지 크기 (기본: 50) |
| `offset` | integer | 오프셋 (기본: 0) |
| `order` | string | asc (오래순), desc (최신순, 기본) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-message-id",
      "chat_room_id": "uuid-chat-room-id",
      "sender": {
        "user_id": "uuid-user-id",
        "profile": {
          "nickname": "김연주"
        }
      },
      "message_text": "안녕하세요! 협주 일정이 언제쯤 되나요?",
      "is_edited": false,
      "created_at": "2026-02-14T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 채팅방 참여자만 조회 가능
- 기본 정렬: 최신순 (역순)
- 페이지네이션으로 대량 메시지 처리

---

### 4. 메시지 전송
```
POST /chats/{chat_room_id}/messages
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "message_text": "안녕하세요! 협주 일정이 언제쯤 되나요?"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-message-id",
    "chat_room_id": "uuid-chat-room-id",
    "sender_user_id": "uuid-user-id",
    "message_text": "안녕하세요! 협주 일정이 언제쯤 되나요?",
    "is_edited": false,
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 채팅방 없음 | `CHAT_ROOM_NOT_FOUND` | 404 |
| 접근 권한 없음 | `CHAT_PERMISSION_DENIED` | 403 |
| 메시지 내용 비어있음 | `CHAT_INVALID_MESSAGE` | 422 |
| 메시지 너무 김 | `CHAT_INVALID_MESSAGE` | 422 |

#### 비고
- 채팅방 참여자만 전송 가능
- 메시지 길이: 1~2000자
- 실시간 업데이트는 Supabase Realtime 구독으로 처리

---

### 5. 메시지 수정
```
PATCH /chats/{chat_room_id}/messages/{message_id}
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "message_text": "안녕하세요! 협주 일정이 언제쯤 되나요? (수정됨)"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-message-id",
    "message_text": "안녕하세요! 협주 일정이 언제쯤 되나요? (수정됨)",
    "is_edited": true,
    "edited_at": "2026-02-14T10:35:00.123Z",
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:35:00.123Z"
}
```

#### 비고
- 메시지 발신자만 수정 가능
- `is_edited = true` 표시

---

### 6. 메시지 삭제
```
DELETE /chats/{chat_room_id}/messages/{message_id}
Authorization: Bearer {access_token}
```

#### Response (204 No Content)
```
(응답 본문 없음)
```

#### 비고
- 메시지 발신자만 삭제 가능
- 24시간 이내 메시지만 삭제 가능 (보안)
- Soft delete (메시지는 DB에 보관, 사용자에게만 숨김)

---

## 리뷰 엔드포인트

### 1. 리뷰 작성
```
POST /chats/{chat_room_id}/reviews
Authorization: Bearer {access_token}
```

#### Request
```json
{
  "reviewed_user_id": "uuid-reviewed-user",
  "promise_keeping_score": 5,
  "skill_match_score": 4,
  "attitude_manner_score": 5,
  "willing_collaborate_score": 5,
  "comment": "정말 좋은 연주자입니다. 약속을 잘 지키고 매너도 좋습니다."
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid-review-id",
    "chat_room_id": "uuid-chat-room-id",
    "reviewer_user_id": "uuid-reviewer-id",
    "reviewed_user_id": "uuid-reviewed-user",
    "promise_keeping_score": 5,
    "skill_match_score": 4,
    "attitude_manner_score": 5,
    "willing_collaborate_score": 5,
    "comment": "정말 좋은 연주자입니다...",
    "is_submitted": true,
    "is_visible": false,  // 양쪽이 모두 제출해야 공개
    "created_at": "2026-02-14T10:30:45.123Z"
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 에러 응답
| 상황 | 에러 코드 | HTTP |
|------|----------|------|
| 이미 작성함 | `REVIEW_ALREADY_EXISTS` | 409 |
| 점수가 범위 밖 | `REVIEW_INVALID_SCORES` | 422 |
| 자신에게 리뷰 | `REVIEW_SELF_REVIEW` | 400 |
| 채팅방 없음 | `CHAT_ROOM_NOT_FOUND` | 404 |

#### 비고
- 채팅방 참여자만 작성 가능
- 점수 범위: 1~5 (정수)
- 블라인드 방식: 양쪽이 모두 제출해야 공개 (`is_visible = true`)
- 협연 완료 후 30일 이내 리뷰 작성 권장

---

### 2. 리뷰 목록 조회 (사용자별)
```
GET /profiles/{user_id}/reviews
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `limit` | integer | 페이지 크기 (기본: 20) |
| `offset` | integer | 오프셋 (기본: 0) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-review-id",
      "reviewer": {
        "user_id": "uuid-reviewer-id",
        "profile": {
          "nickname": "김연주",
          "manner_temperature": 40.0
        }
      },
      "promise_keeping_score": 5,
      "skill_match_score": 4,
      "attitude_manner_score": 5,
      "willing_collaborate_score": 5,
      "average_score": 4.75,
      "comment": "정말 좋은 연주자입니다...",
      "is_visible": true,
      "created_at": "2026-02-13T15:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- `is_visible = true`인 리뷰만 공개 (비회원도 조회 가능)
- `average_score`: 4개 점수의 평균
- 단체는 "단체" 이름으로 표시 (닉네임 대신)

---

### 3. 리뷰 수정
```
PATCH /chats/{chat_room_id}/reviews/{review_id}
Authorization: Bearer {access_token}
```

#### Request (업데이트할 필드만)
```json
{
  "promise_keeping_score": 4,
  "comment": "재고해보니 조금 수정하고 싶습니다..."
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid-review-id",
    "promise_keeping_score": 4,
    "comment": "재고해보니 조금 수정하고 싶습니다...",
    "updated_at": "2026-02-14T11:00:00.123Z"
  },
  "timestamp": "2026-02-14T11:00:00.123Z"
}
```

#### 비고
- 리뷰 작성자만 수정 가능
- `is_visible = true`인 경우만 수정 가능

---

## 마스터 데이터 엔드포인트

### 1. 지역 목록
```
GET /master/regions
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-region-1",
      "name": "서울",
      "code": "seoul"
    },
    {
      "id": "uuid-region-2",
      "name": "경기",
      "code": "gyeonggi"
    }
  ],
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

#### 비고
- 캐싱 권장 (자주 변경되지 않음)
- 한국 17개 시/도

---

### 2. 악기 목록
```
GET /master/instruments
```

#### Query Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `category_id` | string | 카테고리 필터 (선택) |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-instrument-1",
      "category": {
        "id": "uuid-category-1",
        "name": "현악기"
      },
      "name": "바이올린",
      "display_order": 1
    },
    {
      "id": "uuid-instrument-2",
      "category": {
        "id": "uuid-category-1",
        "name": "현악기"
      },
      "name": "비올라",
      "display_order": 2
    }
  ],
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

### 3. 악기 카테고리 목록
```
GET /master/instrument-categories
```

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-category-1",
      "name": "현악기",
      "display_order": 1
    },
    {
      "id": "uuid-category-2",
      "name": "목관악기",
      "display_order": 2
    }
  ],
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

### 4. 작곡가 검색
```
GET /master/composers
```

#### Query Parameters
| 파라미터 | 타입 | 예시 | 설명 |
|---------|------|-----|------|
| `search` | string | `모차르트` | 작곡가명 검색 |
| `period` | string | `romantic` | 시대 필터 (baroque, classical, romantic, modern, contemporary) |
| `limit` | integer | 20 | 페이지 크기 |
| `offset` | integer | 0 | 오프셋 |

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-composer-1",
      "name": "Wolfgang Amadeus Mozart",
      "name_ko": "볼프강 아마데우스 모차르트",
      "birth_year": 1756,
      "death_year": 1791,
      "period": "classical",
      "nationality": "Austrian",
      "bio": "Master of symphonies..."
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "has_next": false,
    "has_prev": false
  },
  "timestamp": "2026-02-14T10:30:45.123Z"
}
```

---

## 추가 엔드포인트 (Phase 2)

### 마이페이지 & 설정
```
GET /me/dashboard                  # 대시보드
GET /me/listings                   # 내 공고 목록
GET /me/applications               # 내 지원 현황
PATCH /me/settings                 # 설정 변경
DELETE /me/account                 # 계정 삭제
```

### 찜하기 (Wishlist)
```
POST /listings/{listing_id}/bookmark           # 공고 찜하기
DELETE /listings/{listing_id}/bookmark         # 찜 취소
GET /me/bookmarks                              # 찜한 공고 목록
```

### 차단 & 신고 (Phase 2+)
```
POST /users/{user_id}/block                    # 사용자 차단
DELETE /users/{user_id}/block                  # 차단 해제
POST /listings/{listing_id}/report             # 공고 신고
POST /reviews/{review_id}/report               # 리뷰 신고
```

---

## 성능 & 보안 가이드

### Rate Limiting
| 엔드포인트 | 제한 | 기간 |
|-----------|------|------|
| 회원가입 | 5회 | 시간 |
| 로그인 | 10회 실패 시 차단 | 시간 |
| 공고 등록 | 20회 | 일 |
| 메시지 전송 | 100회 | 분 |
| 일반 조회 | 60회 | 분 |

### CORS & 보안
- CORS: 프론트엔드 도메인만 허용
- HTTPS 필수
- JWT 토큰 Bearer 인증
- Supabase RLS 정책 활성화

### 캐싱 전략
```
Master Data (Regions, Instruments): 1시간 캐시
Listings: 5분 캐시 (동적 데이터)
User Profiles: 1분 캐시
```

---

## 요청/응답 예시

### 전체 플로우 예시: 공고 지원

#### 1. 공고 목록 조회
```bash
curl -X GET "https://api.tutti.kr/api/listings?region_id=uuid-seoul&listing_type=recruiting&limit=20"
```

#### 2. 공고 상세 조회
```bash
curl -X GET "https://api.tutti.kr/api/listings/uuid-listing-1"
```

#### 3. 지원
```bash
curl -X POST "https://api.tutti.kr/api/listings/uuid-listing-1/applications" \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "application_message": "안녕하세요, 지원합니다"
  }'
```

#### 4. 지원 상태 확인
```bash
curl -X GET "https://api.tutti.kr/api/applications?user_id=current" \
  -H "Authorization: Bearer eyJhbGciOi..."
```

#### 5. 채팅
```bash
curl -X POST "https://api.tutti.kr/api/chats/uuid-chat-room-1/messages" \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "협주 일정을 논의하고 싶습니다"
  }'
```

#### 6. 리뷰 작성
```bash
curl -X POST "https://api.tutti.kr/api/chats/uuid-chat-room-1/reviews" \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "reviewed_user_id": "uuid-other-user",
    "promise_keeping_score": 5,
    "skill_match_score": 4,
    "attitude_manner_score": 5,
    "willing_collaborate_score": 5,
    "comment": "좋은 연주자입니다"
  }'
```

---

## 버전 관리

### v0.1 (현재)
- 기본 CRUD 엔드포인트
- 인증, 프로필, 공고, 지원, 채팅, 리뷰
- 마스터 데이터 API

### v0.2 (예정)
- 찜하기 기능
- 고급 검색/필터
- 알림 API
- 사진/파일 업로드 API

### v1.0 (정식 출시)
- 모든 기능 안정화
- 차단/신고 기능
- 분석/통계 API
- 일본 지역화

---

## 문의 & 피드백

- 이슈 등록: support@tutti.kr
- API 문서 업데이트: api-docs@tutti.kr
- 보안 취약점: security@tutti.kr

---

*마지막 업데이트: 2026-02-14 | 작성자: API Architecture Team*
