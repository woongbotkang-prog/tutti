# TUTTI Platform Database Schema Documentation

## Overview

TUTTI는 클래식 음악 연주자 ↔ 앙상블/오케스트라를 연결하는 매칭 플랫폼의 데이터베이스 스키마입니다.

**주요 특징:**
- Supabase (PostgreSQL) 기반
- Row Level Security (RLS)를 통한 데이터 보안
- 블라인드 평가 시스템 지원
- 자동 채팅방 생성 (매칭 성사 시)
- 마스터 데이터 포함 (악기 ~30개, 작곡가 ~200명, 지역 17개)

---

## 1. 스키마 아키텍처 (Entity-Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Auth (auth.users)                  │
│                    (Email + OAuth Integration)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Maps to
                             ▼
                    ┌────────────────┐
                    │ user_profiles  │◄─── 1 user can be both individual & org
                    │ (user_type)    │
                    └────────┬───────┘
                             │
                ┌────────────┴───────────┐
                ▼                        ▼
        ┌──────────────────┐    ┌──────────────────────┐
        │individual_profiles│    │organization_profiles│
        │- nickname        │    │- name                │
        │- skill_level     │    │- organization_type   │
        │- manner_temp     │    │- admin_user_id ──────┼────┐
        │- primary_instr   │    │- current_lineup      │    │ (refs individual_profiles)
        └────────┬─────────┘    └─────────────────────┘    │
                 │                                          │
                 ▼                                          │
        ┌──────────────────┐                               │
        │ repertoires      │                               │
        │- composer_id     │                               │
        │- piece_name      │                               │
        └──────────────────┘                               │
                                                           │
    ┌───────────────────────────────────────────────────────┘
    │
    │ creates
    ▼
┌─────────────┐
│ listings    │
│- listing_type (recruiting/seeking)
│- required_instruments (UUID[])
│- deadline
│- status
└──────┬──────┘
       │
       │ has
       ▼
┌──────────────────┐
│ applications     │
│- status (pending/accepted/rejected)
│- rejection_reason
└──────┬───────────┘
       │ when accepted
       ▼
┌─────────────────┐
│ chat_rooms      │◄────── Auto-created on application acceptance
│- application_id │
│- user_id_1      │
│- user_id_2      │
└────────┬────────┘
         │ contains
         ▼
    ┌──────────────┐
    │ messages     │
    │- message_text
    │- created_at
    └──────────────┘
         │
         │ after N days (default 30)
         ▼
    ┌──────────────────────┐
    │ reviews              │
    │- blind_mode         │
    │- 4 rating items     │
    │- is_visible         │
    └──────────────────────┘

MASTER DATA:
├── regions (17개 시/도)
├── instrument_categories (5개 카테고리)
├── instruments (각 카테고리별 악기들)
├── composers (~200명, 시대별)
└── system_config (설정값들)
```

---

## 2. 테이블별 상세 설명

### 2.1 Master Data Tables

#### `regions` (지역)
- **목적**: 한국의 17개 시/도 저장
- **주요 필드**:
  - `id` (UUID): 지역 ID
  - `name` (VARCHAR): 시/도 이름 (e.g., '서울')
  - `code` (VARCHAR): 지역 코드 (e.g., 'seoul')
- **특징**: 정적 데이터, 자주 변경 없음
- **인덱스**: UNIQUE constraint on (name, code)

#### `instrument_categories` (악기 카테고리)
- **목적**: 악기 분류 (5개)
  - 현악기 (Strings)
  - 목관악기 (Woodwinds)
  - 금관악기 (Brass)
  - 타악기 (Percussion)
  - 건판 (Keyboards)
- **주요 필드**:
  - `id` (UUID)
  - `name` (VARCHAR)
  - `display_order` (SMALLINT): UI 표시 순서

#### `instruments` (악기)
- **목적**: 전체 ~30개 악기 저장
- **주요 필드**:
  - `category_id` (UUID): 악기 카테고리 참조
  - `name` (VARCHAR): 악기명 (e.g., '바이올린')
  - `display_order` (SMALLINT)
- **특징**: 
  - `UNIQUE(category_id, name)`: 같은 카테고리 내에서 악기명 중복 방지
  - ON DELETE RESTRICT: 악기가 사용 중일 때 삭제 방지

#### `composers` (작곡가)
- **목적**: ~200명의 클래식 작곡가 저장
- **주요 필드**:
  - `name` (VARCHAR): 영문명
  - `name_ko` (VARCHAR): 한글명
  - `birth_year`, `death_year` (SMALLINT)
  - `period` (VARCHAR): baroque/classical/romantic/modern/contemporary
  - `nationality` (VARCHAR): 국적
  - `bio` (TEXT): 약력
- **특징**:
  - 시대별 필터링 가능
  - 인덱스: period로 검색 최적화

#### `system_config` (시스템 설정)
- **목적**: 동적으로 변경 가능한 설정값 저장
- **저장 데이터**:
  - `review_request_days`: 평가 요청 시점 (기본 30일)
  - `listing_max_days`: 공고 최대 지속 기간 (90일)
  - `default_manner_temperature`: 기본 매너온도 (36.5)
  - `app_version`: 앱 버전

---

### 2.2 User & Profile Tables

#### `user_profiles` (사용자 기본 정보)
- **목적**: Supabase auth.users와 연동된 확장 프로필
- **주요 필드**:
  - `id` (UUID): auth.users.id와 동일 (ForeignKey)
  - `user_type` (VARCHAR): 'individual' 또는 'organization'
  - `email` (VARCHAR): 고유 이메일
  - `created_at`, `updated_at` (TIMESTAMP)
- **특징**:
  - RLS: 자신의 프로필만 조회 가능
  - 하나의 계정이 개인으로도, 단체로도 활동 가능
  - 인덱스: user_type, email

**흐름:**
```
1. 사용자 가입 → Supabase Auth 생성
2. auth.users.id 획득
3. user_profiles 삽입 (id = auth.users.id)
4. 프로필 유형 선택 (개인/단체) → individual_profiles 또는 organization_profiles 삽입
```

#### `individual_profiles` (개인 연주자 프로필)
- **목적**: 개인 음악가의 상세 정보
- **필수 필드**:
  - `user_id` (UUID): user_profiles 참조
  - `nickname` (VARCHAR): 고유 닉네임
  - `primary_instrument_id` (UUID): 주 악기 (Foreign Key)
  - `skill_level` (VARCHAR): beginner/elementary/intermediate/advanced/professional
  - `region_id` (UUID): 지역 (Foreign Key)
- **선택 필드**:
  - `photo_url` (VARCHAR): 프로필 사진 (Supabase Storage 경로)
  - `career_description` (TEXT): 경력 설명
  - `practice_frequency` (VARCHAR): 연습 빈도 (e.g., '주 3회')
  - `video_link` (VARCHAR): 유튜브/비메오 링크
  - `manner_temperature` (NUMERIC 4.1): 0~100점, 기본 36.5
- **메타데이터**:
  - `is_verified` (BOOLEAN): 인증 여부 (향후 확장)
  - `is_active` (BOOLEAN): 활동 여부
  - `last_profile_update` (TIMESTAMP): 마지막 수정 시각
- **인덱스**:
  - user_id, region_id, skill_level, is_active 등으로 검색 최적화
- **RLS**:
  - SELECT: 모두 가능 (공개 프로필)
  - UPDATE/DELETE: 본인만 가능

#### `organization_profiles` (단체/조직 프로필)
- **목적**: 앙상블, 오케스트라 등 단체의 정보
- **필수 필드**:
  - `user_id` (UUID): 단체 계정 (user_profiles 참조)
  - `name` (VARCHAR): 단체명 (고유)
  - `organization_type` (VARCHAR): orchestra/chamber_music/youth_orchestra/other
  - `region_id` (UUID): 활동 지역
  - `admin_user_id` (UUID): 관리자 (개인 프로필 참조)
  - `current_lineup` (TEXT): 현재 편성 (JSON 또는 텍스트)
- **선택 필드**:
  - `logo_url` (VARCHAR): 단체 로고
  - `description` (TEXT): 단체 설명
  - `practice_schedule` (TEXT): 연습 일정
- **특징**:
  - `admin_user_id`는 individual_profiles 참조 → 관리자는 개인이어야 함
  - 하나의 단체는 1명의 관리자만 가능
- **RLS**:
  - SELECT: 모두 가능 (공개 프로필)
  - UPDATE/DELETE: 단체 소유자만 가능

#### `repertoires` (개인 레퍼토리)
- **목적**: 개인 연주자가 연주 가능한 곡목 저장
- **주요 필드**:
  - `individual_profile_id` (UUID): 연주자 (Foreign Key)
  - `composer_id` (UUID): 작곡가 (Foreign Key)
  - `piece_name` (VARCHAR): 곡명
  - `notes` (TEXT): 추가 노트
- **특징**:
  - `UNIQUE(individual_profile_id, composer_id, piece_name)`: 같은 곡을 여러 번 등록 방지
  - 프로필 삭제 시 자동 삭제 (ON DELETE CASCADE)
- **RLS**:
  - 자신의 레퍼토리만 조회/수정 가능

---

### 2.3 Listing & Application Tables

#### `listings` (공고)
- **목적**: 개인이 팀 찾기 또는 단체가 인원 모집하는 공고
- **주요 필드**:
  - `id` (UUID): 공고 ID
  - `created_by_user_id` (UUID): 공고 작성자 (Foreign Key)
  - `title` (VARCHAR): 공고 제목
  - `description` (TEXT): 상세 설명
  - `listing_type` (VARCHAR): 'recruiting' (단체→개인 모집) 또는 'seeking' (개인→팀 찾기)
  - `region_id` (UUID): 활동 지역
  - `required_skill_level` (VARCHAR): 최소 요구 실력 (NULL = 제한 없음)
  - `practice_frequency` (VARCHAR): 요구 연습 빈도
  - `required_instruments` (UUID[]): 필요한 악기 목록 (배열)
  - `genre_tags` (VARCHAR[]): 장르 태그 (e.g., ['classical', 'contemporary'])
  - `repertoire_tags` (VARCHAR[]): 레퍼토리 태그
  - `deadline` (TIMESTAMP): 공고 마감일
  - `status` (VARCHAR): active/closed/filled/expired
  - `expires_at` (TIMESTAMP): 자동 만료일 (기본 90일)
  - `is_auto_expired` (BOOLEAN): 자동 만료 여부
- **특징**:
  - `required_instruments`는 배열 → GIN 인덱스로 검색 최적화
  - 자동 만료: 90일 후 자동으로 status = 'expired'로 변경 (스케줄러)
  - deadline이 과거면 자동으로 'expired' 처리
- **RLS**:
  - SELECT: active/closed만 조회 가능 (작성자는 모두 가능)
  - INSERT/UPDATE/DELETE: 본인만 가능
- **인덱스**:
  - status, type, deadline, required_instruments 등으로 다중 필터링 최적화

#### `applications` (지원/신청)
- **목적**: 공고에 지원하는 신청서
- **주요 필드**:
  - `id` (UUID): 지원 ID
  - `listing_id` (UUID): 지원 공고 (Foreign Key)
  - `applicant_user_id` (UUID): 지원자 (Foreign Key)
  - `status` (VARCHAR): pending/accepted/rejected
  - `rejection_reason` (VARCHAR): 거절 사유
    - skill_mismatch: 실력 부족
    - location_mismatch: 지역 불일치
    - schedule_mismatch: 일정 불일치
    - repertoire_mismatch: 곡목 불일치
    - already_filled: 이미 충원됨
    - other: 기타
  - `rejection_note` (TEXT): 거절 상세 설명
  - `application_message` (TEXT): 지원 메시지
- **특징**:
  - `UNIQUE(listing_id, applicant_user_id)`: 중복 지원 방지
  - **중요**: 지원 인원 수 제한 없음 (조직에서 선택)
  - status = 'accepted'일 때 → chat_rooms 자동 생성
  - 거절 시 rejection_reason 필수
- **RLS**:
  - SELECT: 자신의 지원 또는 공고 작성자만 가능
  - UPDATE: 공고 작성자는 status/reason 수정, 지원자는 application_message만 수정

---

### 2.4 Chat & Messaging Tables

#### `chat_rooms` (채팅방)
- **목적**: 매칭 성사(지원 수락) 후 자동 생성되는 1:1 채팅방
- **주요 필드**:
  - `id` (UUID): 채팅방 ID
  - `application_id` (UUID): 지원 (Foreign Key) - UNIQUE
  - `user_id_1`, `user_id_2` (UUID): 두 참여자
  - `created_at` (TIMESTAMP): 생성일
  - `updated_at` (TIMESTAMP): 마지막 메시지 시간
- **특징**:
  - `UNIQUE(user_id_1, user_id_2)`: 같은 쌍의 중복 채팅방 방지
  - `UNIQUE(application_id)`: 각 지원마다 1개 채팅방
  - 자동 생성: application.status = 'accepted'일 때 트리거로 생성 (또는 API)
- **흐름**:
  ```
  1. 지원(application) 생성 (status = pending)
  2. 공고 작성자가 지원 수락 (status = accepted)
  3. chat_rooms 자동 생성
  4. 양쪽이 메시지 주고받음
  5. 30일 후 review 요청 자동 발송
  ```
- **RLS**:
  - SELECT/INSERT: 양쪽 당사자만 가능
  - system만 INSERT 가능

#### `messages` (메시지)
- **목적**: 채팅방 내 텍스트 메시지 (MVP는 텍스트만)
- **주요 필드**:
  - `id` (UUID): 메시지 ID
  - `chat_room_id` (UUID): 채팅방 (Foreign Key)
  - `sender_user_id` (UUID): 발신자 (Foreign Key)
  - `message_text` (TEXT): 메시지 내용
  - `is_edited` (BOOLEAN): 편집 여부
  - `edited_at` (TIMESTAMP): 편집 시간
  - `created_at` (TIMESTAMP): 발송 시간
- **특징**:
  - 텍스트만 지원 (이미지/파일 불가, MVP)
  - 메시지 삭제 기능 없음 (soft delete 고려 가능)
  - 편집 가능하지만 편집 시간 기록
- **RLS**:
  - SELECT: 해당 채팅방 참여자만 가능
  - INSERT: 자신의 메시지만 발송 가능
  - UPDATE: 자신의 메시지만 편집 가능
- **인덱스**:
  - chat_room_id, sender_user_id, created_at DESC (시간순 정렬)

---

### 2.5 Review Tables (평가)

#### `reviews` (평가 시스템)
- **목적**: 매칭 후 상호 평가 (블라인드 방식)
- **주요 필드**:
  - `id` (UUID): 평가 ID
  - `chat_room_id` (UUID): 채팅방 (Foreign Key)
  - `reviewer_user_id` (UUID): 평가자 (Foreign Key)
  - `reviewed_user_id` (UUID): 피평가자 (Foreign Key)
  - **평가 항목 (1-5점 척도)**:
    - `promise_keeping_score`: 약속이행
    - `skill_match_score`: 실력 일치도
    - `attitude_manner_score`: 태도·매너
    - `willing_collaborate_score`: 재협연 의향
  - `comment` (TEXT): 자유 의견
  - `is_submitted` (BOOLEAN): 제출 여부
  - `is_visible` (BOOLEAN): 공개 여부
- **특징**:
  - **블라인드 방식**:
    - 한 사람이 제출해도 `is_visible = FALSE`
    - 양쪽이 모두 제출하면 `is_visible = TRUE`
  - `UNIQUE(chat_room_id, reviewer_user_id, reviewed_user_id)`: 같은 쌍의 중복 평가 방지
  - 매너온도 업데이트 트리거 (평가 제출 시 개인 프로필의 manner_temperature 갱신)
- **워크플로우**:
  ```
  Day 1:  Application accepted → Chat room created
  Day 30: Review request 발송 (notification)
  Day 30-45: User A가 User B를 평가 제출 (is_visible=FALSE)
  Day 30-45: User B가 User A를 평가 제출 (is_visible=FALSE → TRUE)
  Day 45+:  양쪽 평가 공개 (is_visible=TRUE)
  ```
- **RLS**:
  - SELECT: is_visible=TRUE 또는 본인의 평가만
  - INSERT: 자신의 평가만 작성 가능
  - UPDATE: 자신의 평가만 수정 가능

---

## 3. 설계 결정 사항 및 이유

### 3.1 사용자 인증
**결정**: Supabase Auth (Email + OAuth)
**이유**:
- Supabase 기본 제공 기능 활용
- 프로덕션 보안 수준
- Row Level Security와 통합
- JWT 기반 세션 관리

**구현**:
- `user_profiles.id` = `auth.users.id` (FK)
- OAuth providers: Google, Kakao (추가 가능)

---

### 3.2 개인/단체 프로필 분리
**결정**: `user_profiles` (기본) + `individual_profiles` / `organization_profiles` (선택적)
**이유**:
- 한 계정이 여러 역할 수행 가능 (e.g., 연주자이면서 아마추어 오케스트라 관리자)
- 유연한 확장성
- 불필요한 NULL 필드 최소화

**RLS 전략**:
```sql
-- 개인 프로필 선택적 조회
SELECT * FROM individual_profiles WHERE user_id = auth.uid();
-- 단체 프로필 선택적 조회
SELECT * FROM organization_profiles WHERE user_id = auth.uid();
```

---

### 3.3 악기 저장 방식
**결정**: 카테고리 테이블 분리 + 악기 테이블
**이유**:
- UI에서 카테고리 드롭다운 구성 용이
- 향후 악기 추가/삭제 쉬움
- 카테고리별 검색 최적화

**대안 검토**:
- ❌ Enum type: 수정 시 migration 필요
- ✅ Separate tables: 더 유연함

---

### 3.4 공고(Listing) 설계
**결정**: 단일 `listings` 테이블, `listing_type` 구분
**이유**:
- recruiting (단체→개인): 조직이 연주자 찾기
- seeking (개인→팀): 개인이 팀 찾기

**required_instruments의 배열 사용**:
```json
// Example
required_instruments: [
  "바이올린-uuid",
  "첼로-uuid"
]
```
- GIN 인덱스로 빠른 검색
- 다중 악기 요구사항 지원
- JSON은 JSONB를 사용하지 않음 (VARCHAR[] 더 간단)

**자동 만료**:
```sql
-- 스케줄러에서 주기적으로 실행
UPDATE listings SET status = 'expired' WHERE deadline < NOW() AND status = 'active';
```

---

### 3.5 지원(Application) 거절 사유
**결정**: 객관식 enum + 주관식 텍스트 조합
**이유**:
```
rejection_reason: skill_mismatch | location_mismatch | ... | other
rejection_note: "구체적인 이유"
```
- 통계 분석 가능 (어떤 이유로 거절이 많은가)
- 사용자에게 명확한 피드백 제공
- 기타 사유는 자유 텍스트로 작성

---

### 3.6 채팅방 자동 생성
**결정**: Application accepted 시 자동 생성
**이유**:
- 매칭 성사 시 즉시 소통 가능
- 일관된 workflow
- 평가와 연결 용이

**구현 방식**:
```sql
-- Option 1: Trigger (DB 수준)
CREATE TRIGGER create_chat_room_on_acceptance
AFTER UPDATE ON applications
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
BEGIN
  INSERT INTO chat_rooms (application_id, user_id_1, user_id_2, created_at)
  VALUES (NEW.id, <user1>, <user2>, NOW());
END;

-- Option 2: API (Application layer)
-- Accept application → DB update + API call to create chat_room
```

---

### 3.7 블라인드 평가 방식
**결정**: `is_submitted` + `is_visible` 이중 플래그
**이유**:
```
상태 변화:
1. User A 제출 → is_submitted=TRUE, is_visible=FALSE
2. User B 제출 → is_submitted=TRUE, is_visible=FALSE → TRUE
   (트리거로 두 평가 모두 is_visible 업데이트)
```

**대안**:
- ❌ CASE WHEN: 매번 계산 비용
- ✅ Flag columns: 쿼리 간단, 빠름

---

### 3.8 매너온도 관리
**결정**: `individual_profiles.manner_temperature` (NUMERIC 4.1)
**초기값**: 36.5 (절대온도 처럼 중립값)
**범위**: 0~100

**업데이트 로직**:
```sql
-- Review 제출 후 개인의 매너온도 갱신
-- Weighted average: (attitude_manner_score를 주로 참고)
UPDATE individual_profiles SET 
  manner_temperature = (
    SELECT AVG(attitude_manner_score) * 20  -- 5점 만점을 100점으로 변환
    FROM reviews 
    WHERE reviewed_user_id IN (SELECT id FROM individual_profiles WHERE id = <target_id>)
    AND is_visible = TRUE
  )
WHERE id = <target_id>;
```

---

### 3.9 RLS(Row Level Security) 정책
**원칙**:
- 자신의 정보: 자신만 수정 가능
- 타인의 프로필: 모두 조회 가능 (공개)
- 자신의 지원/채팅: 관련자만 접근

**예시**:
```sql
-- individual_profiles: 모두 조회, 본인만 수정
CREATE POLICY "individuals_view_all" ON individual_profiles
  FOR SELECT USING (true);

CREATE POLICY "individuals_update_own" ON individual_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**문제 처리**:
- Admin 역할 추가 필요 시 JWT claims 활용
- `role == 'admin'` in custom claims

---

### 3.10 인덱스 전략
**분석 기반 인덱스 설계**:

| 테이블 | 인덱스 | 이유 |
|---------|---------|------|
| individual_profiles | user_id, region, skill_level, is_active | 프로필 검색, 필터링 |
| listings | type, status, deadline, required_instruments | 공고 검색/필터 |
| applications | listing_id, applicant_id, status | 지원 상태 조회 |
| messages | chat_room_id, created_at DESC | 메시지 시간순 정렬 |
| repertoires | individual_id, composer_id | 곡목 검색 |

**GIN 인덱스**:
```sql
-- required_instruments 배열 검색
CREATE INDEX idx_listings_instruments ON listings USING GIN(required_instruments);
```

---

### 3.11 시드 데이터
**포함 항목**:
1. **Regions** (17개): 서울, 경기, 인천, 부산 등
2. **Instrument Categories** (5개): 현악기, 목관악기, 금관악기, 타악기, 건판
3. **Instruments** (~30개): 각 악기명
4. **Composers** (~200명):
   - Baroque (20명)
   - Classical (20명)
   - Romantic (35명)
   - Modern (30명)
   - Contemporary (30명)
5. **System Config** (6개): 설정값

---

## 4. 데이터 흐름 예시

### 4.1 개인 연주자 → 팀 찾기
```
1. 사용자 가입
   user_profiles (individual_type)
   → individual_profiles 작성 (닉네임, 악기, 실력, 지역)

2. "seeking" 공고 작성
   listings (listing_type='seeking', 찾는 팀 특성)

3. 팀 관리자가 지원 수락
   applications.status = 'pending' → 'accepted'
   → chat_rooms 자동 생성

4. 1:1 대화
   messages 기록

5. 30일 후 평가 요청
   reviews.is_visible = FALSE (블라인드)
   → 양쪽 제출 시 is_visible = TRUE

6. 매너온도 업데이트
   individual_profiles.manner_temperature 갱신
```

### 4.2 단체 → 연주자 모집
```
1. 단체 계정 생성
   user_profiles (organization_type)
   → organization_profiles 작성 (단체명, 유형, 관리자)

2. "recruiting" 공고 작성
   listings (listing_type='recruiting', 필요 악기 3개)

3. 개인들이 지원
   applications 다수 생성

4. 필요 인원만 수락
   3명 선택 → 3개 chat_rooms 생성

5. 각각 대화 및 평가
   messages + reviews
```

---

## 5. 확장 계획 (Future Enhancements)

### 5.1 Realtime 기능
```javascript
// Supabase realtime 구독
supabase
  .channel('messages')
  .on('postgres_changes', 
       { event: '*', schema: 'public', table: 'messages' },
       payload => console.log(payload))
  .subscribe();
```

### 5.2 Full-Text Search
```sql
-- 공고 검색 최적화
CREATE INDEX listings_search ON listings USING gin(to_tsvector('korean', title || ' ' || description));

SELECT * FROM listings 
WHERE to_tsvector('korean', title) @@ plainto_tsquery('korean', '바이올린');
```

### 5.3 File Storage (이미지/영상)
```
Supabase Storage bucket 구조:
profiles/
├── {user_id}/photo.jpg
├── {user_id}/video_thumbnail.jpg

organizations/
└── {org_id}/logo.png
```

### 5.4 추가 기능
- **Blocking**: user_blocks 테이블로 사용자 차단
- **Reporting**: abuse_reports 테이블로 신고 기능
- **Notifications**: notifications 테이블로 알림 시스템
- **Recommendations**: 유사 스킬/지역/곡목 사용자 추천
- **Analytics**: 통계 대시보드 (가장 인기 있는 악기, 지역 등)

---

## 6. 성능 고려사항

### 6.1 대용량 데이터 쿼리
**문제**: 공개 프로필 수백만 개 조회
**해결**:
- 페이지네이션 (offset/limit)
- 인덱스 활용
- Materialized Views (주간/월간 통계)

### 6.2 RLS 오버헤드
**문제**: 모든 쿼리에 RLS 체크
**최적화**:
- Index-only scans
- 자주 필터링되는 컬럼에 인덱스

### 6.3 메시지 테이블 증가
**문제**: 메시지 수가 많아질 수 있음
**해결**:
- 파티셔닝: `messages` 테이블을 월별로 파티션
- 아카이빙: 오래된 메시지 separate storage로 이동

---

## 7. 보안 고려사항

### 7.1 RLS 우회 방지
✅ 모든 쿼리에 RLS 적용
✅ Service role 사용 제한 (Admin만)

### 7.2 민감 정보 보호
- 이메일: 부분 마스킹 (후 검색은 가능하도록)
- 전화번호: 저장 안 함 (카카오톡/이메일로 대체)
- 거절 사유: is_visible 플래그로 제어

### 7.3 SQL Injection
✅ Parameterized queries (Supabase client 기본)
✅ ORM 사용 권장

---

## 8. 마이그레이션 전략

### 초기 배포
```sql
-- 1단계: Master data
INSERT INTO regions ...;
INSERT INTO instrument_categories ...;
INSERT INTO instruments ...;
INSERT INTO composers ...;

-- 2단계: 프로덕션 환경 테스트
SELECT COUNT(*) FROM composers; -- 200 행 확인
SELECT COUNT(*) FROM instruments; -- 30 행 확인

-- 3단계: RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
... (모든 테이블)

-- 4단계: 인덱스 생성 (대용량 데이터 있을 시 CONCURRENTLY)
CREATE INDEX CONCURRENTLY idx_listings_status ON listings(status);
```

### 버전 업그레이드
- 스키마 변경은 migration 파일로 관리 (Flyway/Alembic)
- RLS 정책 변경 시 rollback 계획 필요

---

## 9. 모니터링 & 운영

### 메트릭
- 평균 공고 열람 시간
- 지원 수락률
- 매칭 성공률 (수락→채팅 발송)
- 평가 완료율

### 쿼리 최적화 팁
```sql
-- 느린 쿼리 찾기
SELECT * FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- 인덱스 사용 확인
EXPLAIN ANALYZE SELECT * FROM listings WHERE status = 'active' AND region_id = $1;
```

---

## 10. 참고 자료

- Supabase 공식 문서: https://supabase.com/docs
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Realtime: https://supabase.com/docs/guides/realtime
- Storage: https://supabase.com/docs/guides/storage

