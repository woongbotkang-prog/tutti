# TUTTI Phase 2 기획서: 곡 기반 프로젝트 그룹 결성

> **문서 버전:** v1.0  
> **작성일:** 2026-02-19  
> **상태:** 초안 — 의사결정 필요 사항 포함

---

## 목차

1. [컨셉 재정의](#1-컨셉-재정의)
2. [통합 설계 원칙](#2-통합-설계-원칙)
3. [프로젝트 공고 구조 설계](#3-프로젝트-공고-구조-설계)
4. [사용자 여정](#4-사용자-여정)
5. [기존 구조와의 통합 방안](#5-기존-구조와의-통합-방안)
6. [DB 스키마 변경안](#6-db-스키마-변경안)
7. [화면 구성](#7-화면-구성)
8. [기존 listings 시스템과의 공존 전략](#8-기존-listings-시스템과의-공존-전략)
9. [개발 우선순위](#9-개발-우선순위-phase-2-sprint-계획)
10. [미결 의사결정 사항](#10-미결-의사결정-사항)

---

## 1. 컨셉 재정의

### 현재 (Phase 1) vs 새 방향 (Phase 2)

| | Phase 1 (현재) | Phase 2 (새 방향) |
|---|---|---|
| **모집 단위** | 포지션 (악기 + 역할) | **곡/프로젝트** (작곡가 + 곡명 + 파트) |
| **모집 주체** | 단체가 개인을 모집 or 개인이 팀을 찾음 | 누구든 곡을 중심으로 사람을 모음 |
| **비유** | 인력시장 — "바이올리니스트 구합니다" | 프로젝트 보드 — "베토벤 9번 같이 할 사람!" |
| **그룹 형성** | 매칭 후 1:1 채팅 | 파트별 모집 → 그룹 자동 형성 |
| **탐색 기준** | 악기, 지역, 수준 | **곡명, 작곡가, 편성**, 악기, 지역 |

### 핵심 가치 제안 (UVP) 재설정

**이전:** "클래식 연주자를 위한 구인/구직 플랫폼"

**새로운:** **"같은 곡을 연주하고 싶은 사람들의 연결 — TUTTI"**

핵심 변화: 사람이 아니라 **곡**이 모집의 중심이 된다. 개인 연주자가 실내악 파트너를 찾든, 아마추어 오케스트라가 시즌 멤버를 충원하든, 모두 "이 곡을 함께 연주할 사람"을 모집하는 동일한 구조로 동작한다.

---

## 2. 통합 설계 원칙

다음 두 케이스가 **동일한 데이터 구조와 UI**로 동작해야 한다:

### 케이스 A: 개인 주도 프로젝트
> 첼리스트 홍길동이 "드보르작 첼로 협주곡 — 피아노 반주자 + 페이지 터너 구함" 프로젝트를 올림

### 케이스 B: 단체 충원 프로젝트
> 아마추어 오케스트라 "서울 심포니 클럽"이 "이번 시즌 베토벤 9번 — 바이올린 4석, 비올라 2석 충원" 프로젝트를 올림

### 공통 구조

두 케이스 모두 다음을 포함한다:

- **곡 정보**: 작곡가 + 곡명
- **편성**: 오케스트라 / 실내악 / 독주+반주 등
- **모집 파트**: 악기별 필요 인원
- **연주 일정**: 예정일, 장소
- **리더**: 개인 연주자 또는 단체 (현재 `user_profiles.user_type`으로 구분 가능)
- **모집 완료 시**: 그룹이 형성됨

이 원칙에 따라, "프로젝트"는 개인이든 단체든 동일한 테이블, 동일한 API, 동일한 UI로 처리한다.

---

## 3. 프로젝트 공고 구조 설계

```
프로젝트(Project) = {
  // 곡 정보
  작곡가: composers 테이블 참조 (기존 DB 활용)
  곡명: 자유 텍스트
  편성: orchestra | chamber | solo_accompaniment | ensemble | duo | trio | quartet

  // 모집 파트 (1:N)
  파트[]: [{
    악기: instruments 테이블 참조
    필요 인원: 정수
    현재 수락 인원: 정수 (자동 계산)
    파트 메모: 선택
  }]

  // 프로젝트 정보
  제목: 텍스트
  설명: 텍스트
  지역: regions 테이블 참조
  연주 예정일: 날짜
  연습 일정: 자유 텍스트
  유급 여부: boolean
  최소 수준: beginner ~ professional
  상태: recruiting → filled → completed | cancelled
  만료일: 타임스탬프

  // 메타
  생성자: user_profiles 참조 (개인 or 단체)
  생성일: 타임스탬프
}
```

### 기존 `listings` 테이블과의 차이점

| 항목 | listings (현재) | projects (신규) |
|------|----------------|-----------------|
| 곡 정보 | 없음 (태그로만 언급) | **1급 필드** (composer_id + piece_name) |
| 편성 | 없음 | arrangement_type 필드 |
| 파트별 모집 | required_instruments (배열) — 인원수 없음 | **project_parts 테이블** — 파트별 인원 추적 |
| 지원 | 1:1 매칭 | 파트별 다:1 지원 + 그룹 형성 |
| 채팅 | 매칭 후 1:1 | 프로젝트 그룹 채팅 |

---

## 4. 사용자 여정

### A. 프로젝트 생성자 (개인 or 단체)

```
1. 홈 → "프로젝트 만들기" 버튼
2. 곡 선택
   - 작곡가 검색 (기존 composers 테이블, ~200명)
   - 곡명 입력 (자유 텍스트)
   - 편성 선택: 솔로 / 듀오 / 트리오 / 콰르텟 / 앙상블 / 오케스트라
3. 파트별 모집 설정
   - 악기 선택 (기존 instruments 테이블)
   - 인원 수 입력
   - [+] 파트 추가
   예: 바이올린 4명, 비올라 2명, 첼로 2명...
4. 프로젝트 정보
   - 제목 (자동 생성 제안: "[작곡가] [곡명] 함께 연주할 분")
   - 설명 (자유 텍스트)
   - 연주 예정일
   - 연습 장소/지역
   - 연습 일정 (자유 텍스트)
   - 최소 수준 / 유급 여부
5. 공개 → 모집 시작
```

### B. 지원자 (개인 연주자)

```
1. 홈에서 프로젝트 카드 탐색
   - 곡명/작곡가 검색
   - "내 악기로 참여 가능" 필터 (프로필의 primary_instrument 기반)
   - 편성/지역/수준 필터
2. 프로젝트 카드 터치 → 상세 페이지
   - 곡 정보, 파트별 모집 현황 확인
   - "지원하기" 버튼
3. 지원
   - 내 파트 선택 (내 악기에 해당하는 파트만 표시)
   - 지원 메시지 작성 (선택)
4. 리더가 수락 → 프로젝트 그룹 채팅방 입장
5. 모든 파트 충원 완료 → 프로젝트 상태 "filled"로 변경
```

### C. 프로젝트 리더의 관리 플로우

```
1. 지원자 알림 수신
2. 지원자 프로필 확인 (악기, 수준, 레퍼토리, 매너 온도)
3. 수락/거절
   - 수락 시: 해당 파트 seats_filled +1, 지원자 그룹 채팅 입장
   - 거절 시: 거절 사유 선택
4. 모든 파트 충원 → "모집 완료" 알림
```

---

## 5. 기존 구조와의 통합 방안

### 옵션 비교

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A. listings에 프로젝트 모드 추가** | is_project 플래그 + composer_id 등 컬럼 추가 | 기존 코드 재활용, 마이그레이션 최소 | 테이블 혼잡, NULL 컬럼 다수 |
| **B. 별도 projects 테이블 (신규)** | listings와 독립 운영 | 깔끔한 분리, 각자 최적화 가능 | 코드 일부 중복 (목록, 검색 등) |
| **C. listings를 projects로 완전 교체** | 기존 공고도 project 구조로 마이그레이션 | 장기적 일관성 | 마이그레이션 비용, 기존 데이터 변환 필요 |

### 추천: **옵션 B → 장기적으로 C**

**이유:**

1. 현재 `listings` 테이블은 1:1 매칭 구조 (지원 → 수락 → 1:1 채팅). 프로젝트는 N:1 구조 (파트별 다수 지원 → 그룹 형성). 근본적으로 다른 데이터 모델이므로 별도 테이블이 자연스럽다.
2. Phase 2에서 `projects` 테이블을 별도로 만들고, 기존 `listings`는 그대로 유지한다.
3. 사용자가 프로젝트 방식에 익숙해지면, Phase 3에서 listings를 projects로 흡수하는 마이그레이션을 진행한다.

> ⚠️ **결정 필요:** 이 방향에 동의하는지, 아니면 처음부터 통합(옵션 A 또는 C)을 원하는지 확인 필요.

---

## 6. DB 스키마 변경안

### 신규 테이블

기존 테이블(`regions`, `instruments`, `composers`, `user_profiles` 등)을 그대로 활용하고, 다음 테이블을 추가한다.

```sql
-- ============================================================================
-- PHASE 2: PROJECT TABLES
-- ============================================================================

-- 편성 타입 enum
CREATE TYPE arrangement_type AS ENUM (
  'solo_accompaniment',  -- 독주 + 반주
  'duo',
  'trio',
  'quartet',
  'quintet',
  'ensemble',            -- 소규모 앙상블 (6~15명)
  'chamber_orchestra',   -- 실내 오케스트라
  'orchestra'            -- 풀 오케스트라
);

-- 프로젝트 상태 enum
CREATE TYPE project_status AS ENUM (
  'draft',        -- 작성 중
  'recruiting',   -- 모집 중
  'filled',       -- 모집 완료
  'in_progress',  -- 진행 중 (연습 등)
  'completed',    -- 연주 완료
  'cancelled'     -- 취소
);

-- 지원 상태 enum
CREATE TYPE project_application_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'    -- 지원자가 취소
);

-- ============================================================================
-- projects (프로젝트 공고)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- 곡 정보
  composer_id UUID REFERENCES composers(id) ON DELETE SET NULL,
  piece_name TEXT NOT NULL,
  arrangement arrangement_type NOT NULL,

  -- 프로젝트 정보
  title TEXT NOT NULL,
  description TEXT,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  event_date DATE,                          -- 연주 예정일
  rehearsal_schedule TEXT,                   -- 연습 일정 (자유 텍스트)
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  min_skill_level VARCHAR(50) CHECK (min_skill_level IN (
    'beginner', 'elementary', 'intermediate', 'advanced', 'professional'
  )),

  -- 상태 & 메타
  status project_status NOT NULL DEFAULT 'recruiting',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_composer ON projects(composer_id);
CREATE INDEX idx_projects_region ON projects(region_id);
CREATE INDEX idx_projects_arrangement ON projects(arrangement);
CREATE INDEX idx_projects_created_by ON projects(created_by_user_id);

-- ============================================================================
-- project_parts (파트별 모집)
-- ============================================================================
CREATE TABLE project_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
  seats_needed SMALLINT NOT NULL CHECK (seats_needed > 0),
  seats_filled SMALLINT NOT NULL DEFAULT 0 CHECK (seats_filled >= 0),
  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 프로젝트에서 같은 악기 파트 중복 방지
  UNIQUE(project_id, instrument_id)
);

CREATE INDEX idx_project_parts_project ON project_parts(project_id);
CREATE INDEX idx_project_parts_instrument ON project_parts(instrument_id);

-- ============================================================================
-- project_applications (프로젝트 지원)
-- ============================================================================
CREATE TABLE project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES project_parts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  status project_application_status NOT NULL DEFAULT 'pending',
  message TEXT,                              -- 지원 메시지
  rejection_reason TEXT,                     -- 거절 사유

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 프로젝트 같은 파트에 중복 지원 방지
  UNIQUE(part_id, applicant_id)
);

CREATE INDEX idx_project_apps_project ON project_applications(project_id);
CREATE INDEX idx_project_apps_applicant ON project_applications(applicant_id);
CREATE INDEX idx_project_apps_status ON project_applications(status);

-- ============================================================================
-- project_members (확정 멤버 — 수락된 지원자)
-- ============================================================================
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES project_parts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES project_applications(id) ON DELETE SET NULL,

  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(project_id, user_id)
);

-- ============================================================================
-- project_chat_rooms (프로젝트 그룹 채팅)
-- ============================================================================
-- 기존 chat_rooms는 1:1 구조 (user_id_1, user_id_2).
-- 프로젝트 채팅은 그룹 채팅이므로 별도 테이블 필요.
CREATE TABLE project_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES project_chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_chat_msgs_room ON project_chat_messages(room_id, created_at);

-- ============================================================================
-- RLS (Row Level Security) 정책
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_messages ENABLE ROW LEVEL SECURITY;

-- projects: 누구나 recruiting 상태 조회 가능, 생성자만 수정/삭제
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (status = 'recruiting' OR created_by_user_id = auth.uid());

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (created_by_user_id = auth.uid());

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (created_by_user_id = auth.uid());

-- project_parts: 프로젝트 조회 가능하면 파트도 조회 가능
CREATE POLICY "project_parts_select" ON project_parts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND (status = 'recruiting' OR created_by_user_id = auth.uid()))
  );

CREATE POLICY "project_parts_manage" ON project_parts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND created_by_user_id = auth.uid())
  );

-- project_applications: 본인 지원 내역 + 프로젝트 생성자가 지원 목록 조회
CREATE POLICY "project_apps_select" ON project_applications
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND created_by_user_id = auth.uid())
  );

CREATE POLICY "project_apps_insert" ON project_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "project_apps_update" ON project_applications
  FOR UPDATE USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND created_by_user_id = auth.uid())
  );

-- project_members: 프로젝트 멤버 + 생성자 조회
CREATE POLICY "project_members_select" ON project_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND created_by_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
  );

-- project_chat: 멤버만 접근
CREATE POLICY "project_chat_select" ON project_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_chat_rooms r
      JOIN project_members m ON m.project_id = r.project_id
      WHERE r.id = room_id AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_chat_rooms r
      JOIN projects p ON p.id = r.project_id
      WHERE r.id = room_id AND p.created_by_user_id = auth.uid()
    )
  );

CREATE POLICY "project_chat_insert" ON project_chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM project_chat_rooms r
        JOIN project_members m ON m.project_id = r.project_id
        WHERE r.id = room_id AND m.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM project_chat_rooms r
        JOIN projects p ON p.id = r.project_id
        WHERE r.id = room_id AND p.created_by_user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 트리거: seats_filled 자동 업데이트
-- ============================================================================
CREATE OR REPLACE FUNCTION update_seats_filled()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE project_parts
    SET seats_filled = seats_filled + 1
    WHERE id = NEW.part_id;

    -- project_members에 추가
    INSERT INTO project_members (project_id, part_id, user_id, application_id)
    VALUES (NEW.project_id, NEW.part_id, NEW.applicant_id, NEW.id);

    -- 모든 파트가 채워졌는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM project_parts
      WHERE project_id = NEW.project_id AND seats_filled < seats_needed
    ) THEN
      UPDATE projects SET status = 'filled', updated_at = NOW()
      WHERE id = NEW.project_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE project_parts
    SET seats_filled = GREATEST(seats_filled - 1, 0)
    WHERE id = NEW.part_id;

    DELETE FROM project_members
    WHERE application_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_application_status_change
  AFTER UPDATE OF status ON project_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_seats_filled();

-- ============================================================================
-- 트리거: 프로젝트 채팅방 자동 생성
-- ============================================================================
CREATE OR REPLACE FUNCTION create_project_chat_room()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'recruiting' THEN
    INSERT INTO project_chat_rooms (project_id)
    VALUES (NEW.id)
    ON CONFLICT (project_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_project_chat_room
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_project_chat_room();
```

### ER 다이어그램 (텍스트)

```
composers ──┐
             ├──→ projects ──→ project_parts ──→ project_applications
regions ────┘        │              │
                     │              └──→ project_members
instruments ─────────┘
                     │
user_profiles ───────┤
                     │
                     └──→ project_chat_rooms ──→ project_chat_messages
```

### 기존 코드베이스 연결점

| 기존 테이블 | 프로젝트에서의 활용 |
|---|---|
| `composers` (~200명) | 프로젝트 곡 선택 시 작곡가 검색 |
| `instruments` | 파트별 모집 악기 선택 |
| `regions` | 프로젝트 지역 설정 |
| `user_profiles` | 프로젝트 생성자 (individual / organization 모두) |
| `individual_profiles` | 지원자 프로필 조회 (악기, 수준, 매너 온도) |
| `organization_profiles` | 단체가 프로젝트 생성 시 단체 정보 표시 |
| `repertoires` | 지원자의 레퍼토리에 해당 곡이 있는지 표시 (가산점/뱃지) |

---

## 7. 화면 구성

### 7-1. 홈 화면 변화

**현재:** 공고(listings) 리스트 — 텍스트 중심

**새:** 프로젝트 카드 그리드 — 곡 중심 시각화

```
┌─────────────────────────────────────┐
│  🎵 지금 모집 중인 프로젝트          │
│                                     │
│  ┌───────────────┐ ┌──────────────┐ │
│  │ 베토벤         │ │ 드보르작      │ │
│  │ 교향곡 9번     │ │ 첼로 협주곡   │ │
│  │               │ │              │ │
│  │ 서울 심포니 클럽│ │ 홍길동        │ │
│  │ 서울           │ │ 부산          │ │
│  │               │ │              │ │
│  │ Vn ●●●○○ 3/5  │ │ Pf ○ 0/1     │ │
│  │ Va ○○   0/2   │ │              │ │
│  │               │ │              │ │
│  │ 📅 2026.04.15 │ │ 📅 2026.03.20│ │
│  └───────────────┘ └──────────────┘ │
│                                     │
│  [+ 프로젝트 만들기]                  │
└─────────────────────────────────────┘
```

### 7-2. 프로젝트 카드 구성요소

```
[ 작곡가 이름 ]
[ 곡명 (큰 글씨) ]
[ 리더 이름 or 단체명 ] · [ 지역 ]
[ 파트 모집 현황 바 — ●=채워짐, ○=빈자리 ]
[ 연주 예정일 ]
```

### 7-3. 탐색/필터

- **곡 검색**: 작곡가명 또는 곡명으로 검색 (composers 테이블 + piece_name full-text)
- **편성 필터**: 듀오 / 트리오 / 콰르텟 / 앙상블 / 오케스트라
- **내 악기 필터**: "내가 참여할 수 있는 프로젝트만" (프로필의 primary_instrument 기준으로 seats_filled < seats_needed인 파트 존재)
- **지역 필터**: regions 기반
- **수준 필터**: min_skill_level 기반

### 7-4. 프로젝트 상세 페이지

```
┌─────────────────────────────────────┐
│  ← 뒤로                             │
│                                     │
│  베토벤                              │
│  교향곡 9번 "합창"                    │
│  오케스트라                           │
│                                     │
│  서울 심포니 클럽 · 서울              │
│  "이번 시즌 정기 연주회용 충원입니다"   │
│                                     │
│  ── 모집 현황 ──                     │
│                                     │
│  🎻 바이올린    ●●●○○  3/5          │
│  🎻 비올라      ○○     0/2          │
│  🎻 첼로        ●●     2/2  ✅ 완료  │
│  🎺 트럼펫      ○      0/1          │
│                                     │
│  ── 일정 ──                         │
│  📅 연주 예정: 2026년 4월 15일        │
│  🗓 연습: 매주 토요일 14:00~17:00    │
│  📍 서울 마포구                       │
│                                     │
│  수준: 중급 이상 · 무급               │
│                                     │
│  [비올라로 지원하기]  ← 내 악기 기반   │
│                                     │
└─────────────────────────────────────┘
```

### 7-5. 프로젝트 생성 화면

```
단계 1: 곡 선택
  [작곡가 검색...] → 자동완성 (composers DB)
  [곡명 입력...]
  [편성 선택 ▾]  듀오/트리오/콰르텟/앙상블/오케스트라

단계 2: 파트 설정
  바이올린   [5] 명
  비올라     [2] 명
  [+ 파트 추가]

단계 3: 프로젝트 정보
  [제목...]  자동 제안: "베토벤 교향곡 9번 함께 연주할 분"
  [설명...]
  [지역 ▾]  [연주 예정일 📅]
  [연습 일정...]
  [최소 수준 ▾]  [□ 유급]

  [프로젝트 공개하기]
```

### 7-6. 내비게이션 변화

**현재 탭 구조:** 홈 | 공고 | 채팅 | 프로필

**Phase 2 탭 구조:**

```
홈 | 프로젝트 | 채팅 | 프로필
       ↑
  기존 "공고" 탭을 "프로젝트"로 교체 or
  "공고" + "프로젝트" 두 탭 공존 (점진적 전환)
```

> ⚠️ **결정 필요:** 기존 "공고" 탭을 바로 교체할 것인지, 병행 운영할 것인지.

---

## 8. 기존 listings 시스템과의 공존 전략

### 단기 (Phase 2)

- `listings`(공고)와 `projects`(프로젝트) **병행 운영**
- 홈 화면에서 프로젝트를 상단에 노출, 기존 공고는 하단 또는 별도 탭
- 새 사용자는 자연스럽게 프로젝트 방식으로 유도
- 기존 활성 listings는 만료까지 유지

### 중기 (Phase 3)

- 기존 listings 신규 생성 중단
- 기존 공고를 프로젝트로 변환하는 마이그레이션 스크립트 작성
  - `listings.required_instruments` → `project_parts`로 분해
  - `listings.repertoire_tags` → `projects.composer_id` + `piece_name` 매핑

### 장기

- `listings` 테이블 완전 폐기
- 모든 모집이 프로젝트 구조로 통일

---

## 9. 개발 우선순위 (Phase 2 Sprint 계획)

| Sprint | 기간 (예상) | 내용 | 산출물 |
|--------|------------|------|--------|
| **Sprint 1** | 1주 | DB 스키마 + Supabase 마이그레이션 + 기본 CRUD API | `projects`, `project_parts`, `project_applications` 테이블 + RLS |
| **Sprint 2** | 1.5주 | 프로젝트 생성 UI | 곡 선택 → 파트 설정 → 정보 입력 → 공개 플로우 |
| **Sprint 3** | 1.5주 | 프로젝트 탐색/발견 화면 | 프로젝트 카드 리스트 + 곡 검색 + 필터링 |
| **Sprint 4** | 1.5주 | 지원 + 파트별 수락 + 알림 | 지원하기 → 리더 수락/거절 → seats_filled 자동 업데이트 |
| **Sprint 5** | 1주 | 그룹 채팅 | 프로젝트별 그룹 채팅방 + 멤버 입장 |
| **Sprint 6** | 1주 | 프로젝트 라이프사이클 | 모집완료 → 진행중 → 완료 상태 전환 + 히스토리 |

**총 예상:** 약 7.5주 (1인 개발 기준)

### Sprint 1 상세 (착수 가능 수준)

```
1. 마이그레이션 파일 생성
   경로: supabase/migrations/20260220_phase2_projects.sql
   내용: 위 6장의 SQL 전체

2. Supabase 타입 생성
   npx supabase gen types typescript --local > src/types/supabase.ts

3. API 레이어 (src/lib/api/projects.ts)
   - createProject(data) → INSERT projects + project_parts
   - getProjects(filters) → SELECT with joins
   - getProjectById(id) → 상세 조회
   - applyToProject(projectId, partId, message)
   - updateApplicationStatus(applicationId, status)

4. 테스트 데이터 시드
   supabase/seed-projects.sql
```

---

## 10. 미결 의사결정 사항

아래 항목은 개발 착수 전 결정이 필요합니다.

### ⚠️ 결정 필요 #1: 기존 listings와 별도 vs 통합

- **옵션 B (별도 테이블)** 를 추천하지만, 확인 필요
- 통합(옵션 A)을 선택하면 스키마 설계가 크게 달라짐

### ⚠️ 결정 필요 #2: 기존 "일반 모집 공고" Phase 2에서 유지 여부

- 유지 시: 홈 화면에 프로젝트 + 공고 두 섹션 공존
- 폐지 시: 새 공고 생성 비활성화, 기존 공고만 만료까지 노출

### ⚠️ 결정 필요 #3: 단체 계정 강화 필요 여부

- 현재 `organization_profiles`는 존재하지만, 단체 내 복수 관리자 개념은 없음
- 프로젝트 리더가 단체일 때: 누가 지원자를 수락하는가? admin_user_id 1명만?
- Phase 2 범위에서 "단체 내 다중 관리자"까지 갈 것인지

### ⚠️ 결정 필요 #4: 그룹 관리 기능 범위

프로젝트 모집 완료 후:
- **최소:** 그룹 채팅만 제공
- **중간:** 채팅 + 일정 공유 + 출석 체크
- **최대:** 채팅 + 일정 + 파트보 공유 + 연습 기록

Phase 2에서 어디까지?

### ⚠️ 결정 필요 #5: 곡 DB 확장

- 현재 `composers` 테이블만 존재 (~200명)
- `pieces` (곡 목록) 테이블은 없음 — 곡명은 자유 텍스트
- 정규화된 곡 DB(`pieces` 테이블)를 만들 것인지, 자유 텍스트로 갈 것인지
- 정규화 시 장점: 같은 곡 프로젝트끼리 연결, "이 곡이 인기 있어요" 통계
- 자유 텍스트 시 장점: 개발 빠름, 사용자 자유도 높음

### ⚠️ 결정 필요 #6: 프로젝트 리더도 파트에 포함되는가?

- 예: 첼리스트가 "드보르작 첼로 협주곡" 프로젝트를 만들면, 본인이 첼로 파트에 자동 등록?
- 아니면 리더는 파트 외 별도 존재?

---

## 부록: 코드베이스 현황 참고

```
~/Projects/tutti/
├── src/app/
│   ├── (auth)/          -- 인증 관련 페이지
│   ├── (main)/          -- 메인 레이아웃
│   ├── api/             -- API 라우트
│   └── page.tsx         -- 홈
├── supabase/
│   └── migrations/
│       ├── 20260219001500_initial_schema.sql
│       ├── 20260219002000_updated_schema.sql
│       ├── 20260219003000_notifications_insert_policy.sql
│       └── 20260219010800_fix_chat_rls.sql
└── docs/
    ├── db-schema.sql
    ├── user-stories-v0.1.md
    ├── wireframes.md
    └── phase2-project-spec.md  ← 이 문서
```
