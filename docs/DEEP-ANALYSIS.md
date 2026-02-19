# TUTTI 프로젝트 - 깊이 있는 분석 & 재검토

작성일: 2026-02-14 02:36 (웅 수면 중)

---

## 1️⃣ DB 성능 & 최적화 심화 분석

### 1.1 공고 검색 쿼리 성능 최적화

**현재 문제점:**
```sql
SELECT * FROM listings
WHERE region_id = ? 
  AND skill_level = ?
  AND instrument_id IN (...)
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

이 쿼리에서 예상되는 문제:
- listings 테이블이 시간이 지날수록 커짐 (공고는 저장됨)
- region_id, skill_level, status, created_at에 모두 인덱싱 필요
- 다중 필터 시 인덱스 활용도 떨어질 수 있음

**해결책:**
1. **복합 인덱스 설계**
   ```sql
   CREATE INDEX idx_listings_search 
   ON listings(status, region_id, skill_level, created_at DESC)
   WHERE status = 'active';
   ```
   - active 공고만 빠르게 검색
   - 부분 인덱스로 크기 절감

2. **요구사항 재검토**
   - 공고 정렬 기준: `latest` (기본), `deadline`, `popularity`?
   - `popularity`는 어떻게 계산? (지원자 수? 클릭수?)
   - 만약 실시간 지원자 수 정렬이라면, 캐싱 필수

3. **쿼리 최적화 전략**
   - 필터 없이 전체 공고 조회 시 캐싱 (Redis, 5분)
   - 필터 있을 시 DB 직접 조회 (인덱스 활용)
   - Supabase Realtime 대신 폴링 (효율적)

### 1.2 매너온도 계산 시 N+1 문제

**현재 구조:**
```sql
-- 사용자 조회
SELECT * FROM individual_profiles WHERE id = ?;

-- 각 사용자별 리뷰 조회 (N+1!)
SELECT * FROM reviews WHERE reviewee_id = ? AND is_visible = true;

-- 각 리뷰별 평균 계산
-- 애플리케이션 레벨에서 처리
```

**문제:** 리뷰 여러 개 있을 시 쿼리 N+1 발생

**해결책:**
```sql
-- 한 쿼리로 해결
SELECT 
  ip.id,
  ROUND(AVG((r.score_reliability + r.score_skill_match + r.score_manner) / 3), 1) AS manner_temperature
FROM individual_profiles ip
LEFT JOIN reviews r ON ip.id = r.reviewee_id AND r.is_visible = true
WHERE ip.id = ?
GROUP BY ip.id;
```

**더 나은 방법:** DB 트리거로 자동 계산
```sql
-- DB 레벨에서 매너온도 자동 계산
-- 리뷰 INSERT/UPDATE 시 individual_profiles.manner_temperature 자동 갱신
CREATE OR REPLACE FUNCTION update_manner_temperature()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE individual_profiles
  SET manner_temperature = (
    SELECT ROUND(AVG((score_reliability + score_skill_match + score_manner) / 3), 1)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id AND is_visible = true
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_manner_temp
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_manner_temperature();
```

**장점:**
- 애플리케이션 로직 단순화
- 항상 최신 값 유지
- DB 레벨 캐싱 (manner_temperature는 비정규화 필드)

### 1.3 채팅 메시지 대량 증가 시 파티셔닝

**예상 시나리오 (1년 후):**
- 월 1,000 매칭
- 매칭당 평균 50개 메시지
- 월 50,000개 메시지 저장

**문제:** messages 테이블이 해마다 수백만 행으로 증가 → 조회 느려짐

**해결책: 시간 기반 파티셔닝**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (YEAR(created_at), MONTH(created_at));

-- 월별 파티션
CREATE TABLE messages_2026_01 PARTITION OF messages
  FOR VALUES FROM (2026, 1) TO (2026, 2);

CREATE TABLE messages_2026_02 PARTITION OF messages
  FOR VALUES FROM (2026, 2) TO (2026, 3);
-- ... etc
```

**Supabase에서의 대안:**
- PostgreSQL 파티셔닝 지원 불명확 (Supabase에서 충분히 테스트 필요)
- 대안: 아카이빙 (1년 이상 메시지는 별도 테이블로 이동)

### 1.4 인덱스 설계 전략

**필수 인덱스:**
```sql
-- 프로필 검색
CREATE INDEX idx_individual_profiles_region_skill 
ON individual_profiles(region_id, skill_level) 
WHERE is_active = true;

CREATE INDEX idx_individual_profiles_manner_temp 
ON individual_profiles(manner_temperature DESC) 
WHERE is_active = true;

-- 공고 검색
CREATE INDEX idx_listings_search 
ON listings(status, region_id, created_at DESC) 
WHERE status = 'active';

CREATE INDEX idx_listings_deadline 
ON listings(deadline) 
WHERE status = 'active';

-- 지원 상태 조회
CREATE INDEX idx_applications_user_status 
ON applications(applicant_id, status) 
WHERE status != 'rejected';

-- 채팅 조회
CREATE INDEX idx_chats_participants 
ON chat_rooms(participant_ids);

-- 리뷰 조회
CREATE INDEX idx_reviews_reviewee 
ON reviews(reviewee_id, is_visible) 
WHERE is_visible = true;
```

---

## 2️⃣ 보안 & 데이터 프라이버시 심화

### 2.1 RLS (Row Level Security) 정책 재검토

**현재 설계의 문제점:**

1. **individual_profiles RLS**
   ```sql
   -- 현재: 다른 사용자도 조회 가능 (괜찮음, 공개 프로필)
   -- 하지만 민감 정보는?
   ```
   
   **개선책:**
   ```sql
   CREATE POLICY "Users can view own profile or public profiles"
   ON individual_profiles FOR SELECT
   USING (
     auth.uid() = user_id  -- 자신의 프로필은 항상
     OR is_verified = true -- 또는 인증된 공개 프로필만
   );
   ```

2. **레퍼토리 데이터 보안**
   - 사용자가 입력한 레퍼토리 목록이 노출되면?
   - 실력 레벨을 유추할 수 있으므로 민감 정보
   
   **해결:** RLS 정책 추가
   ```sql
   CREATE POLICY "Users can view repertoires of public profiles"
   ON repertoires FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM individual_profiles
       WHERE id = repertoires.individual_profile_id
       AND auth.uid() = user_id
       OR is_verified = true
     )
   );
   ```

3. **리뷰 블라인드 처리 재검토**
   - 블라인드인가? → reviewer_id가 보이면 블라인드 아님!
   
   **현재 schema 확인:**
   ```sql
   CREATE TABLE reviews (
     id UUID,
     reviewer_id UUID,  -- 이게 노출되면 안됨!
     reviewee_id UUID,
     ...
     is_visible BOOLEAN
   );
   ```
   
   **문제:** `is_visible = false`라도 내부적으로 reviewer_id는 알려짐
   
   **해결책:**
   ```sql
   CREATE POLICY "Reviewer can see own review"
   ON reviews FOR SELECT
   USING (
     auth.uid() = reviewer_id  -- 자신의 리뷰만
     OR is_visible = true AND reviewer_id IS NULL  -- 익명 공개 리뷰
   );
   ```
   
   **더 나은 방법:** 리뷰 작성자를 항상 익명으로 표시
   ```sql
   -- API 응답에서 reviewer_id 제거
   SELECT id, reviewee_id, score_*, comment, created_at
   FROM reviews
   WHERE is_visible = true;
   ```

### 2.2 파일 업로드 보안

**현재 우려사항:**
- 프로필 이미지, 단체 로고, 연주 영상 링크 등
- Supabase Storage 사용 시 보안?

**해결책:**

1. **파일 타입 검증** (API 레벨)
   ```typescript
   const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
   const MAX_SIZE = 5 * 1024 * 1024; // 5MB
   
   if (!ALLOWED_TYPES.includes(file.type)) {
     throw new Error('INVALID_FILE_TYPE');
   }
   if (file.size > MAX_SIZE) {
     throw new Error('FILE_TOO_LARGE');
   }
   ```

2. **바이러스 스캔** (ClamAV)
   - Supabase Storage → 바이러스 스캔 (ClamAV 연동)
   - 또는 AWS S3 + Malwarebytes
   - MVP에선 생략, Phase 2에서 고려

3. **파일명 무작위화**
   ```typescript
   const storagePath = `profiles/${userId}/${uuid()}.jpg`;
   // 사용자가 입력한 파일명 무시
   ```

4. **접근 제어**
   ```sql
   CREATE POLICY "Users can view own profile images"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'profiles' 
     AND auth.uid() = (path[1])::uuid
   );
   ```

### 2.3 GDPR/한국 개인정보보호법 준수

**필수 항목:**

1. **데이터 수집 동의**
   - 회원가입 시 명시적 동의 (체크박스)
   - 개인정보처리방침 링크 제시

2. **개인정보 요청권**
   - 사용자가 자신의 데이터 다운로드 (GDPR 권리)
   - API: `GET /api/users/me/export` → JSON 다운로드

3. **삭제권 (Right to be Forgotten)**
   - 탈퇴 시 개인정보 완전 삭제 (논리적 삭제 후 30일 뒤 물리 삭제)
   ```sql
   UPDATE individual_profiles
   SET 
     nickname = 'Deleted User',
     bio = NULL,
     photo_url = NULL,
     deleted_at = NOW()
   WHERE user_id = ?;
   ```

4. **데이터 최소화**
   - 필요한 정보만 수집
   - 레퍼토리, 경력 등은 선택사항

5. **보관 기한**
   - 회원: 활동 중 또는 탈퇴 후 30일
   - 리뷰: 영구 보관 (신뢰도 시스템 필요)
   - 채팅: 1년 뒤 아카이빙

---

## 3️⃣ 비즈니스 로직 재검토 & 결정사항 정리

### 3.1 미결정 사항 분석

#### Q1: 프로필 없이 공고 올릴 수 있는가?

**현재 상태:** 미결정

**3가지 옵션:**

| 옵션 | 장점 | 단점 |
|------|------|------|
| **A. 프로필 필수** | 신뢰도 높음, 스팸 방지 | 진입장벽 높음, 가입 후 바로 공고 불가 |
| **B. 프로필 선택** | 유입 많음, UX 간단 | 저품질 공고, 신뢰도 낮음 |
| **C. 임시 프로필** | 중간 선택, 먼저 공고 → 나중 상세 | 복잡함 |

**추천:** **A. 프로필 필수**
- 이유: 클래식 연주자 매칭 = 신뢰도가 매우 중요
- 대신, 최소 프로필 (악기 + 지역만) 만들고 나중에 상세 작성 가능하게 함

#### Q2: 매너온도 0°C 이하 시 처리 방식

**현재 문제:** DB에서 0°C 이상만 가능하게 제약 → 0°C 이하 불가능

**개선안:**
```sql
-- 타입 변경: NUMERIC(4,1) CHECK (...) → INT (단계적 신뢰도)
ALTER TABLE individual_profiles
ADD manner_level SMALLINT DEFAULT 3; -- 1~5 단계

-- 1단계 (최악): 리뷰 1-2개 중복 거절
-- 2단계 (나쁨): 매너 평점 평균 < 2.0
-- 3단계 (보통): 기본값
-- 4단계 (좋음): 매너 평점 평균 >= 4.0
-- 5단계 (최고): 1년 이상 0 거절
```

**자동 제한 정책:**
```sql
-- manner_level = 1이면 공고 올리기 불가
-- manner_level = 2이면 공고 올리기 가능 but 시스템 알림
-- manner_level = 1 & 적어도 1달 경과 시 자동으로 2로 상향
```

#### Q3: 거절 사유 "주관식 필수"의 필요성

**현재 설계:** 객관식 + 주관식(옵션)

**재검토:**
- 객관식 선택지: "실력 미치지 못함", "일정 안맞음", "다른 이유"
- 주관식: 선택사항 (최대 500자)

**문제점:** 주관식을 쓰지 않는 사용자 많을 수 있음 → 거절 받은 사람이 이유를 모름

**개선안:**
```
객관식 선택지:
1. 실력이 요구 사항과 맞지 않습니다
2. 일정이 맞지 않습니다
3. 팀 편성이 이미 완료되었습니다
4. 다른 이유

선택한 항목에 따라:
- (1) 선택 시: "요구 수준 상향" 또는 "다른 공고 도전" 팁 제시
- (2) 선택 시: 다음 공고 알림 설정 제안
- (3) 선택 시: 자동 응답 (감사 메시지)
- (4) 선택 시: 주관식 필수 (의견 청취)
```

### 3.2 신고 시스템

**현재:** MVP에서 미결정

**분석:**

**신고 대상:**
- 허위 프로필 (사진 없음, 실력과 다름)
- 성희롱/괴롭힘
- 스팸/광고
- 거래 중단 후 불응

**신고 프로세스:**
```
사용자 신고 → 자동 기록
  ↓
관리자 검토 (24시간 내)
  ↓
경고 → 일시 중단 → 영구 차단
  ↓
신고자 & 피신고자에 알림
```

**권장사항:** MVP에선 생략, Phase 1.5에 추가
- 이유: 초기 사용자 규모 작으면 직접 관리 가능
- 단, 신고 데이터 저장 테이블만 미리 만들기

---

## 4️⃣ 초기 데이터 설계

### 4.1 작곡가 데이터 (200명)

**구조:**
```typescript
interface Composer {
  id: UUID;
  name: string;              // 영문 (Bach)
  name_ko: string;           // 한글 (바흐)
  birth_year: number;        // 1685
  death_year?: number;       // 1750 (현대 작곡가는 NULL)
  period: 'baroque' | 'classical' | 'romantic' | 'modern' | 'contemporary';
  nationality: string;       // German
  bio: string;              // 간단 설명
  difficulty_level?: 1-5;   // 난이도 (선택)
}
```

**시대별 분류:**
| 시대 | 수 | 예시 |
|------|----|----|
| 바로크 (1600-1750) | 40 | Bach, Vivaldi, Handel, Corelli |
| 고전 (1750-1820) | 35 | Mozart, Beethoven, Haydn |
| 낭만 (1820-1900) | 60 | Brahms, Tchaikovsky, Chopin, Liszt |
| 근현대 (1900-1950) | 40 | Debussy, Ravel, Stravinsky, Shostakovich |
| 현대 (1950+) | 25 | Schnittke, Glass, Reich, 현대 작곡가 |

**MVP 시작점:** 가장 유명한 50명 우선, 점진적 확대

### 4.2 악기 데이터 (30개)

**오케스트라 악기 표준:**

```
현악기 (Strings)
├─ 바이올린 1 (Violin I)
├─ 바이올린 2 (Violin II)
├─ 비올라 (Viola)
├─ 첼로 (Cello)
└─ 더블베이스 (Double Bass)

목관악기 (Woodwinds)
├─ 플루트 (Flute)
├─ 오보에 (Oboe)
├─ 클라리넷 (Clarinet)
└─ 파곳 (Bassoon)

금관악기 (Brass)
├─ 프렌치호른 (Horn)
├─ 트럼펫 (Trumpet)
├─ 트롬본 (Trombone)
└─ 튜바 (Tuba)

타악기 (Percussion)
├─ 팀파니 (Timpani)
├─ 말렛 악기 (Mallets)
├─ 드럼 (Drum)
└─ 기타 타악기

기타
├─ 피아노 (Piano)
├─ 하프 (Harp)
└─ 기타 (Guitar)
```

### 4.3 지역 데이터 (17개 시/도)

```json
[
  { "code": "SEL", "name": "서울" },
  { "code": "INC", "name": "인천" },
  { "code": "GYG", "name": "경기" },
  { "code": "GWN", "name": "강원" },
  { "code": "CBN", "name": "충북" },
  { "code": "CBG", "name": "충남" },
  { "code": "JBN", "name": "전북" },
  { "code": "JBG", "name": "전남" },
  { "code": "GBN", "name": "경북" },
  { "code": "GBG", "name": "경남" },
  { "code": "ULN", "name": "울산" },
  { "code": "PUS", "name": "부산" },
  { "code": "DGU", "name": "대구" },
  { "code": "DAE", "name": "대전" },
  { "code": "GWJ", "name": "광주" },
  { "code": "JEJ", "name": "제주" },
  { "code": "SJG", "name": "세종" }
]
```

### 4.4 테스트 데이터 (더미 데이터)

**필요성:**
- 개발 중 UI/UX 테스트
- 성능 테스트 (1000개 공고 검색)
- E2E 테스트

**생성 전략:**
```sql
-- 100명의 테스트 개인 연주자
INSERT INTO individual_profiles ...

-- 20개의 테스트 단체
INSERT INTO organization_profiles ...

-- 500개의 테스트 공고
INSERT INTO listings ...

-- 200개의 테스트 지원
INSERT INTO applications ...

-- 100개의 테스트 리뷰
INSERT INTO reviews ...
```

---

## 5️⃣ 사용자 여정 재분석

### 5.1 와이어프레임 19개 화면 검토

**기존 화면 목록** (wireframes.md에서 추출):
1. 랜딩 페이지
2. 회원가입 (이메일)
3. 회원가입 (카카오)
4. 프로필 생성 (개인)
5. 프로필 생성 (단체)
6. 홈 (공고 피드)
7. 공고 목록 (필터)
8. 공고 상세
9. 공고 등록 (구인)
10. 공고 등록 (구직)
11. 내 지원 현황
12. 채팅방 목록
13. 채팅방 (1:1)
14. 리뷰 작성
15. 마이페이지
16. 프로필 수정
17. 설정
18. 공고 편집
19. 단체 관리 (멤버 목록)

**누락 가능성:**

| 화면 | 필요성 | 우선순위 |
|------|--------|--------|
| 로그아웃 | ✅ | 높음 |
| 비밀번호 변경 | ✅ | 높음 |
| 탈퇴 | ✅ | 중간 |
| 지원 취소 | ✅ | 높음 |
| 공고 마감 | ✅ | 높음 |
| 실패/에러 화면 | ✅ | 높음 |
| 검색 결과 (공고 없음) | ✅ | 중간 |
| 404/500 에러 | ✅ | 높음 |

**추천:** 19개 유지 + 에러 화면 3-4개 추가 → 총 22-23개

### 5.2 각 화면 간 Transition 검토

**주요 Flow:**

```
비회원
├─ 랜딩 → 회원가입 → 프로필 생성 → 홈
└─ 랜딩 → 로그인 → 홈

회원
├─ 홈 → 공고 목록 (필터) → 공고 상세 → 지원
├─ 홈 → 공고 등록 → 저장
├─ 홈 → 채팅 → 리뷰 작성
└─ 마이페이지 → 프로필 수정 or 설정
```

**누락된 Flow:**

| Flow | 화면 | 상태 |
|------|------|------|
| 지원 수락 → 채팅 자동 생성 | ❓ | 자동화 필요 |
| 채팅 → 리뷰 작성 가능? | ❓ | 권한 확인 필요 |
| 프로필 없이 공고 탐색 → 지원 클릭 시 프로필 요구 | ✅ | 좋음 |

---

## 6️⃣ 기술 선택 재검토

### 6.1 Next.js 14 App Router 선택 정당성

**선택 이유:**
- ✅ SSR + SSG 혼합 가능
- ✅ API Routes 내장
- ✅ 파일 기반 라우팅
- ✅ Vercel 최적화

**다른 선택지와 비교:**

| 기술 | 장점 | 단점 | 선택 |
|------|------|------|------|
| Next.js 14 (App) | SSR/SSG, API, 빠름 | 학습곡선 | ✅ 선택 |
| Next.js 14 (Pages) | 안정적 | 레거시 | ❌ |
| SvelteKit | 작음, 빠름 | 생태계 작음 | ❌ |
| Nuxt 3 | Vue 기반 | Vercel 최적화 약함 | ❌ |
| Remix | 형식 엄격 | 학습곡선 높음 | ❌ |

**결론:** ✅ **Next.js 14 App Router 최적**

### 6.2 Supabase Realtime vs Socket.io for 채팅

**비교:**

| 항목 | Supabase Realtime | Socket.io |
|------|-------------------|----------|
| 설정 복잡도 | 낮음 | 높음 (별도 서버) |
| 실시간 성능 | 우수 (<100ms) | 우수 (< 50ms) |
| 확장성 | 중간 (Supabase 제약) | 높음 (Redis) |
| 비용 | 포함됨 | 서버 비용 |
| 개발 속도 | 빠름 | 느림 |

**권장:** ✅ **Supabase Realtime (MVP)**
- 이유: 초기 사용자 규모 작으므로 충분
- 향후: 사용자 1만 명 이상 시 Socket.io로 마이그레이션 고려

### 6.3 이미지 CDN 전략

**선택지:**

| CDN | 비용 | 특징 | 권장 |
|-----|------|------|------|
| Supabase Storage | 무료 (5GB) | 통합, 간편 | ✅ MVP |
| Cloudflare Image | $0.20/1000 | 압축, 최적화 | ⏳ Phase 2 |
| AWS S3 + CloudFront | $0.025/GB | 안정적, 비쌈 | ⏳ 대규모 |
| Vercel Blob | - | Vercel 통합 | ⏳ 검토 |

**추천:** 
1. MVP: Supabase Storage
2. 1만 명 도달 시: Cloudflare Image (자동 압축 + CDN)

---

## 7️⃣ 성능 벤치마크 & 예상 부하

### 7.1 예상 사용자 & 데이터

**1년 후 (realistic) 시나리오:**
- 월간 활성 사용자 (MAU): 2,000명
- 월간 공고: 300개
- 월간 지원: 1,500건
- 월간 채팅: 60,000개 메시지

**DB 크기 예상:**
```
individual_profiles: 5,000행 × 2KB ≈ 10MB
organization_profiles: 500행 × 1KB ≈ 0.5MB
listings: 5,000행 × 1KB ≈ 5MB
applications: 15,000행 × 0.5KB ≈ 7.5MB
messages: 600,000행 × 1KB ≈ 600MB
reviews: 5,000행 × 0.5KB ≈ 2.5MB

총계: ≈ 625MB (1GB 이내, Supabase 무료 10GB 충분)
```

### 7.2 API 요청 부하

**일일 요청 추정** (2,000 MAU 기준):
```
공고 조회: 2,000 × 5회/일 = 10,000회
공고 검색: 2,000 × 2회/일 = 4,000회
채팅: 60,000회/일 ÷ 30일 = 2,000회/일
지원: 1,500회/월 ÷ 30일 = 50회/일

총계: ≈ 16,000회/일 API 요청
분당: ≈ 11회/분
```

**Supabase 무료 티어 한계:**
- 무료: 50,000 요청/일 (충분함 ✅)
- 유료: $25/월 + 사용량

---

## 8️⃣ 배포 & 모니터링 전략

### 8.1 환경 분리

**3단계 배포:**

```
개발 (Development)
├─ URL: dev.tutti.local
├─ DB: Supabase dev 프로젝트
├─ Vercel: Preview
└─ 용도: 개발자 로컬 테스트

스테이징 (Staging)
├─ URL: staging.tutti.kr
├─ DB: Supabase staging 프로젝트
├─ Vercel: Staging branch (main 제외 모든 PR)
└─ 용도: QA, 성능 테스트, 배포 전 최종 확인

프로덕션 (Production)
├─ URL: tutti.kr
├─ DB: Supabase production 프로젝트 (백업 자동화)
├─ Vercel: main branch
└─ 용도: 사용자 서비스
```

### 8.2 CI/CD 파이프라인

**GitHub Actions 워크플로우:**

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main, staging, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test        # 단위 테스트
      - run: npm run lint        # ESLint
      - run: npm run build       # 빌드 테스트

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Staging)
        run: |
          npm install -g vercel
          vercel --token ${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Production)
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### 8.3 모니터링 & 로깅

**필수 도구:**

1. **Sentry** (에러 모니터링)
   ```typescript
   // pages/_app.tsx
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

2. **Vercel Analytics** (성능 모니터링)
   - 자동 포함 (무료)
   - Core Web Vitals 추적

3. **Supabase Logs** (API 로깅)
   - Supabase 대시보드에서 직접 확인

4. **커스텀 로깅** (중요 이벤트)
   ```typescript
   // lib/logger.ts
   const logEvent = async (event: string, data: any) => {
     await supabase
       .from('event_logs')
       .insert({ event, data, timestamp: new Date() });
   };
   ```

### 8.4 데이터베이스 백업

**자동 백업 (Supabase 제공):**
- 일일 자동 백업 (무료 1회)
- 주간 저장 (1주일)

**추가 전략:**
- 월간 수동 다운로드 (Google Drive 저장)
- 프로덕션 이벤트 로그 별도 저장

---

## 9️⃣ 비용 분석 (연간)

### 9.1 예상 비용 (1년 후)

| 서비스 | 무료 | 추정 비용/월 | 연간 |
|--------|------|------------|------|
| Supabase | $0 (무료 티어) | $0 | $0 |
| Vercel | $0 (무료 ティア + Pro) | $20 | $240 |
| 도메인 (tutti.kr) | - | $10 | $120 |
| 이메일 (SendGrid) | 100/일 | $0 | $0 |
| Sentry | Free (5,000 이벤트) | $0 | $0 |
| **총계** | | **$30** | **$360** |

**매출 가정** (무료 → 부스팅):
- 월간 부스팅 판매: 50건 × $3,000원 = $150,000원 ≈ $115/월
- 월간 수익: $115 - $30 = $85/월 (유지)
- 연간 수익: $1,020 (진입 비용 회수 가능)

**1년 뒤 스케일링 시:**
- 사용자 10,000명 → Supabase Pro ($50/월) 필요
- 저장소 증가 → Vercel Pro ($20/월)

---

## 🔟 최종 권장사항 및 의사결정 매트릭스

### 10.1 즉시 결정 필요 항목

| 항목 | 옵션 | 추천 | 근거 |
|------|------|------|------|
| **프로필 필수** | A/B/C | **A (필수)** | 신뢰도 중요, 최소 프로필 OK |
| **매너온도 처리** | 0°C vs 단계 | **단계 (1-5)** | 더 명확, 자동 제한 가능 |
| **신고 시스템** | MVP 포함? | **제외** | Phase 1.5에 추가 권장 |
| **API 타입** | REST vs GraphQL | **REST** | 빠른 개발, 단순함 |
| **채팅 기술** | Realtime vs Socket | **Realtime** | MVP 충분, 비용 절감 |

### 10.2 구현 우선순위 (Phase별)

**MVP (6~8주):**
- ✅ 가입/로그인
- ✅ 프로필 (최소: 악기, 지역)
- ✅ 공고 등록/조회/검색
- ✅ 지원/수락/거절
- ✅ 채팅 (텍스트)
- ✅ 리뷰 (블라인드)

**Phase 1.5 (8~10주):**
- 신고 시스템
- 찜하기/차단
- 알림 (이메일)
- 고급 필터

**Phase 2 (3개월+):**
- 이미지 CDN (Cloudflare)
- 웹푸시 알림
- 카카오 알림톡
- 일본 진출 준비

---

## 📝 결론

현재 TUTTI 프로젝트는:
- ✅ 기획: 탄탄함 (8.5/10)
- ✅ DB 설계: 우수 (9/10)
- ✅ API 설계: 완벽 (9/10)
- ⚠️ 비즈니스 정책: 80% 결정됨 (20% 추가 결정 필요)
- ⏳ 개발 준비: 80% 완료 (기술 컨벤션, 초기 데이터 남음)

**귀국 후 일정:**
1. **Day 1** (2/18): 최종 비즈니스 정책 확정
2. **Day 2-3** (2/19-20): GitHub 세팅, Supabase 마이그레이션
3. **Day 4-7** (2/21-24): Next.js 보일러플레이트 + 개발 환경 구축
4. **Week 2+** (2/25+): Sprint 1 개발 시작 (회원가입, 프로필, 공고)

**예상 출시:** 2026년 4월 (8주)

---

*작성: 2026-02-14 02:36* (웅 수면 중 깊이 있는 분석 완료)
