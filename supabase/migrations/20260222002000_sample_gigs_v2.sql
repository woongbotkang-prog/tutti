-- TUTTI v2 — 샘플 공고 10개 시드
-- 오케스트라 4개 + 실내악 6개
-- 2026-02-22

-- ============================================================
-- 공고 1: 베토벤 교향곡 5번 (오케스트라)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    'c121e653-fc33-4c47-a6a3-fb97218a6e07',
    '베토벤 교향곡 5번 운명 — 4월 정기 연주회 단원 모집',
    '서울시민오케스트라',
    'orchestra',
    NULL,
    '베토벤 교향곡 5번 운명을 함께 연주할 단원을 모집합니다. 4월 정기 연주회 준비. 열정과 실력을 갖춘 분들의 지원을 기다립니다.',
    (SELECT id FROM regions WHERE name = '서울' LIMIT 1),
    'intermediate',
    false,
    true,
    18,
    '2026-04-20',
    'active',
    '주 1회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  -- 악기 편성
  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 4),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '더블베이스' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '플루트' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '오보에' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '클라리넷' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바순' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '호른' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트럼펫' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트롬본' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '타악기 기타' LIMIT 1), 1);

  -- 연주 곡목
  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '교향곡 제5번 c단조 Op.67 운명' LIMIT 1), NULL, 0);
END;
$$;

-- ============================================================
-- 공고 2: 차이콥스키 교향곡 6번 비창 (오케스트라)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    'cdc7527f-2186-425d-b7ce-b603dbe8832b',
    '차이콥스키 교향곡 6번 비창 — 강남필하모닉 단원 모집',
    '강남필하모닉',
    'orchestra',
    NULL,
    '차이콥스키 비창 교향곡을 함께 연주할 수준 높은 단원을 모집합니다. 주 2~3회 연습 가능하신 분만 지원 부탁드립니다.',
    (SELECT id FROM regions WHERE name = '서울' LIMIT 1),
    'advanced',
    false,
    true,
    29,
    '2026-05-15',
    'active',
    '주 2~3회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 6),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 3),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 3),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '더블베이스' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '플루트' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '오보에' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '클라리넷' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바순' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '호른' LIMIT 1), 3),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트럼펫' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트롬본' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '타악기 기타' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '교향곡 제6번 b단조 Op.74 비창' LIMIT 1), NULL, 0);
END;
$$;

-- ============================================================
-- 공고 3: 드보르자크 신세계 교향곡 (오케스트라)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    'e4afa2a5-fa7d-44f2-9119-61565cf34d5a',
    '드보르자크 신세계 교향곡 — 경기청년오케스트라 단원 모집',
    '경기청년오케스트라',
    'orchestra',
    NULL,
    '드보르자크 교향곡 제9번 신세계로부터를 함께 연주할 청년 단원을 모집합니다. 청년 오케스트라로 20~35세 연주자 우대.',
    (SELECT id FROM regions WHERE name = '경기' LIMIT 1),
    'intermediate',
    false,
    true,
    22,
    '2026-06-07',
    'active',
    '주 1회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 5),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '더블베이스' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '플루트' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '오보에' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '클라리넷' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바순' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '호른' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트럼펫' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트롬본' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '타악기 기타' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '교향곡 제9번 e단조 Op.95 신세계로부터' LIMIT 1), NULL, 0);
END;
$$;

-- ============================================================
-- 공고 4: 말러 교향곡 5번 (오케스트라) — text_input 사용
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    '8dce49a5-cbd1-4078-bc13-ed0a4d876ba7',
    '말러 교향곡 5번 — 인천심포니에타 단원 모집',
    '인천심포니에타',
    'orchestra',
    NULL,
    '말러 교향곡 제5번 c샵단조를 함께 연주할 실력 있는 단원을 모집합니다. 대규모 편성으로 다양한 악기 파트를 모집합니다.',
    (SELECT id FROM regions WHERE name = '인천' LIMIT 1),
    'advanced',
    false,
    true,
    39,
    '2026-07-12',
    'active',
    '주 2~3회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 8),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 4),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 4),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '더블베이스' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '플루트' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '오보에' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '클라리넷' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바순' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '호른' LIMIT 1), 4),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트럼펫' LIMIT 1), 3),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '트롬본' LIMIT 1), 3),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '타악기 기타' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '하프' LIMIT 1), 1);

  -- 말러 교향곡 5번은 pieces 테이블에 없을 수 있으므로 text_input 사용
  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, NULL, '말러 교향곡 제5번 c샵단조', 0);
END;
$$;

-- ============================================================
-- 공고 5: 브람스 피아노 3중주 1번 (실내악)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    '7fd7dc7d-bf5f-4277-984f-5657e3d471ad',
    '브람스 피아노 3중주 1번 — 트리오 파트너 모집',
    '목요트리오',
    'chamber',
    NULL,
    '브람스 피아노 3중주 제1번 B장조 Op.8을 함께 연주할 바이올리니스트와 피아니스트를 모집합니다. 목요일 저녁 정기 연습.',
    (SELECT id FROM regions WHERE name = '서울' LIMIT 1),
    'advanced',
    false,
    true,
    2,
    '2026-05-01',
    'active',
    '주 1회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '피아노' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '피아노 3중주 제1번 B장조 Op.8' LIMIT 1), NULL, 0);
END;
$$;

-- ============================================================
-- 공고 6: 베토벤 현악 4중주 14번 (실내악) — text_input 사용
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    '8dce49a5-cbd1-4078-bc13-ed0a4d876ba7',
    '베토벤 현악 4중주 Op.131 — 아마데우스콰르텟 파트너 모집',
    '아마데우스콰르텟',
    'chamber',
    NULL,
    '베토벤 현악 4중주 제14번 c샵단조 Op.131을 함께 연주할 앙상블 파트너를 모집합니다. 프로 수준의 경험자 우대.',
    (SELECT id FROM regions WHERE name = '서울' LIMIT 1),
    'professional',
    false,
    true,
    3,
    '2026-04-25',
    'active',
    '주 2~3회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, NULL, '베토벤 현악 4중주 제14번 c샵단조 Op.131', 0);
END;
$$;

-- ============================================================
-- 공고 7: 모차르트 클라리넷 5중주 (실내악)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    'cdc7527f-2186-425d-b7ce-b603dbe8832b',
    '모차르트 클라리넷 5중주 K.581 — 현악 파트너 모집',
    '클래식프렌즈',
    'chamber',
    NULL,
    '모차르트 클라리넷 5중주 A장조 K.581을 함께 연주할 현악 파트너를 모집합니다. 격주 토요일 오후 연습.',
    (SELECT id FROM regions WHERE name = '서울' LIMIT 1),
    'intermediate',
    false,
    true,
    4,
    '2026-05-30',
    'active',
    '격주',
    false,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '클라리넷' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '클라리넷 5중주 A장조 K.581' LIMIT 1), NULL, 0);
END;
$$;

-- ============================================================
-- 공고 8: 슈베르트 송어 5중주 (실내악) — text_input 사용
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    'e4afa2a5-fa7d-44f2-9119-61565cf34d5a',
    '슈베르트 송어 5중주 — 앙상블 파트너 모집',
    '주말앙상블',
    'chamber',
    NULL,
    '슈베르트 피아노 5중주 A장조 D.667 송어를 함께 연주할 파트너를 모집합니다. 주말 오전 편안한 분위기로 진행합니다.',
    (SELECT id FROM regions WHERE name = '경기' LIMIT 1),
    'intermediate',
    false,
    true,
    4,
    '2026-06-21',
    'active',
    '월 1~2회',
    false,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '더블베이스' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '피아노' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, NULL, '슈베르트 피아노 5중주 A장조 D.667 송어', 0);
END;
$$;

-- ============================================================
-- 공고 9: 드뷔시 현악 4중주 (실내악)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    '7fd7dc7d-bf5f-4277-984f-5657e3d471ad',
    '드뷔시 현악 4중주 Op.10 — 콰르텟 파트너 모집',
    '뉘앙스콰르텟',
    'chamber',
    NULL,
    '드뷔시 현악 4중주 g단조 Op.10을 함께 연주할 파트너를 모집합니다. 인상주의 음악의 색채를 함께 탐구해 보실 분을 환영합니다.',
    (SELECT id FROM regions WHERE name = '대전' LIMIT 1),
    'advanced',
    false,
    true,
    3,
    '2026-07-05',
    'active',
    '주 1회',
    true,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '현악 4중주 g단조 Op.10' LIMIT 1), NULL, 0);
END;
$$;

-- ============================================================
-- 공고 10: 쇼스타코비치 피아노 5중주 (실내악)
-- ============================================================
DO $$
DECLARE
  v_gig_id UUID;
BEGIN
  INSERT INTO gigs (
    user_id, title, ensemble_name, gig_category, gig_type, description,
    region_id, min_skill_level, is_paid, is_project, max_applicants,
    event_date, status, rehearsal_frequency, sheet_music_provided, expires_at
  ) VALUES (
    '8dce49a5-cbd1-4078-bc13-ed0a4d876ba7',
    '쇼스타코비치 피아노 5중주 Op.57 — 앙상블 파트너 모집',
    '부산챔버앙상블',
    'chamber',
    NULL,
    '쇼스타코비치 피아노 5중주 g단조 Op.57을 함께 연주할 파트너를 모집합니다. 부산 지역 기반 앙상블로 현대 음악에 관심 있는 분 환영.',
    (SELECT id FROM regions WHERE name = '부산' LIMIT 1),
    'advanced',
    false,
    true,
    4,
    '2026-06-14',
    'active',
    '주 1회',
    false,
    NOW() + INTERVAL '90 days'
  ) RETURNING id INTO v_gig_id;

  INSERT INTO gig_instruments (gig_id, instrument_id, count_needed) VALUES
    (v_gig_id, (SELECT id FROM instruments WHERE name = '바이올린' LIMIT 1), 2),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '비올라' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '첼로' LIMIT 1), 1),
    (v_gig_id, (SELECT id FROM instruments WHERE name = '피아노' LIMIT 1), 1);

  INSERT INTO gig_pieces (gig_id, piece_id, text_input, order_index) VALUES
    (v_gig_id, (SELECT id FROM pieces WHERE title = '피아노 5중주 g단조 Op.57' LIMIT 1), NULL, 0);
END;
$$;
