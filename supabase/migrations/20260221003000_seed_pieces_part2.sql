-- seed: pieces 파트2 — 쇼팽/브람스/차이콥스키 등 추가
-- ⚠️ 큰따옴표 사용 금지, 최대 20개 VALUES per block

-- ========================
-- 쇼팽 (1/2)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('피아노 협주곡 제1번 e단조 Op.11', ARRAY['Piano Concerto No. 1 in E minor Op. 11'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 40),
('피아노 협주곡 제2번 f단조 Op.21', ARRAY['Piano Concerto No. 2 in F minor Op. 21'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 32),
('피아노 소나타 제2번 b플랫단조 Op.35 장송행진곡', ARRAY['Piano Sonata No. 2 Funeral March'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 24),
('피아노 소나타 제3번 b단조 Op.58', ARRAY['Piano Sonata No. 3 in B minor Op. 58'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 26),
('발라드 제1번 g단조 Op.23', ARRAY['Ballade No. 1 in G minor Op. 23'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 10),
('발라드 제2번 F장조 Op.38', ARRAY['Ballade No. 2 in F major Op. 38'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 8),
('발라드 제3번 A플랫장조 Op.47', ARRAY['Ballade No. 3 in A-flat major Op. 47'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 8),
('발라드 제4번 f단조 Op.52', ARRAY['Ballade No. 4 in F minor Op. 52'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 12),
('스케르초 제1번 b단조 Op.20', ARRAY['Scherzo No. 1 in B minor Op. 20'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 9),
('스케르초 제2번 b플랫단조 Op.31', ARRAY['Scherzo No. 2 in B-flat minor Op. 31'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 10),
('스케르초 제3번 c샵단조 Op.39', ARRAY['Scherzo No. 3 in C-sharp minor Op. 39'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 9),
('스케르초 제4번 E장조 Op.54', ARRAY['Scherzo No. 4 in E major Op. 54'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 12),
('피아노 소나타 제1번 c단조 Op.4', ARRAY['Piano Sonata No. 1 in C minor Op. 4'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 20),
('에튀드 Op.10 제3번 E장조 이별의 곡', ARRAY['Etude Op. 10 No. 3 in E major'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 4),
('에튀드 Op.10 제12번 c단조 혁명', ARRAY['Etude Op. 10 No. 12 Revolutionary'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 3),
('폴로네이즈 제6번 A플랫장조 Op.53 영웅', ARRAY['Polonaise No. 6 in A-flat major Heroic'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 6),
('녹턴 Op.9 제2번 E플랫장조', ARRAY['Nocturne Op. 9 No. 2 in E-flat major'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 5),
('즉흥곡 제4번 c샵단조 Op.66 환상즉흥곡', ARRAY['Fantasie Impromptu Op. 66'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, false, true, '피아노', 5)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 쇼팽 (2/2)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('피아노 3중주 g단조 Op.8', ARRAY['Piano Trio in G minor Op. 8'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 25),
('첼로 소나타 g단조 Op.65', ARRAY['Cello Sonata in G minor Op. 65'], (SELECT id FROM composers WHERE name_ko = '프레데리크 쇼팽' LIMIT 1), 'romantic', false, true, false, '첼로, 피아노', 28)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 브람스 (1/2)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제1번 c단조 Op.68', ARRAY['Symphony No. 1 in C minor Op. 68'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 45),
('교향곡 제2번 D장조 Op.73', ARRAY['Symphony No. 2 in D major Op. 73'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 43),
('교향곡 제3번 F장조 Op.90', ARRAY['Symphony No. 3 in F major Op. 90'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 38),
('교향곡 제4번 e단조 Op.98', ARRAY['Symphony No. 4 in E minor Op. 98'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 40),
('피아노 협주곡 제1번 d단조 Op.15', ARRAY['Piano Concerto No. 1 in D minor Op. 15'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 43),
('피아노 협주곡 제2번 B플랫장조 Op.83', ARRAY['Piano Concerto No. 2 in B-flat major Op. 83'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 50),
('바이올린 협주곡 D장조 Op.77', ARRAY['Violin Concerto in D major Op. 77'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '바이올린, 오케스트라', 40),
('이중 협주곡 a단조 Op.102', ARRAY['Double Concerto in A minor Op. 102'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', true, false, false, '바이올린, 첼로, 오케스트라', 35),
('현악 4중주 제1번 c단조 Op.51-1', ARRAY['String Quartet No. 1 in C minor Op. 51 No. 1'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 32),
('현악 4중주 제2번 a단조 Op.51-2', ARRAY['String Quartet No. 2 in A minor Op. 51 No. 2'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 30),
('현악 4중주 제3번 B플랫장조 Op.67', ARRAY['String Quartet No. 3 in B-flat major Op. 67'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 30),
('피아노 3중주 제1번 B장조 Op.8', ARRAY['Piano Trio No. 1 in B major Op. 8'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 35),
('피아노 3중주 제2번 C장조 Op.87', ARRAY['Piano Trio No. 2 in C major Op. 87'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 30),
('피아노 3중주 제3번 c단조 Op.101', ARRAY['Piano Trio No. 3 in C minor Op. 101'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 23),
('피아노 4중주 제1번 g단조 Op.25', ARRAY['Piano Quartet No. 1 in G minor Op. 25'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 비올라, 첼로', 38),
('클라리넷 5중주 b단조 Op.115', ARRAY['Clarinet Quintet in B minor Op. 115'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '클라리넷, 현악 4중주', 35),
('클라리넷 소나타 제1번 f단조 Op.120-1', ARRAY['Clarinet Sonata No. 1 in F minor Op. 120 No. 1'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '클라리넷, 피아노', 24),
('클라리넷 소나타 제2번 E플랫장조 Op.120-2', ARRAY['Clarinet Sonata No. 2 in E-flat major Op. 120 No. 2'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '클라리넷, 피아노', 20)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 브람스 (2/2)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('바이올린 소나타 제1번 G장조 Op.78 빗소리', ARRAY['Violin Sonata No. 1 in G major Rain Op. 78'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '바이올린, 피아노', 27),
('첼로 소나타 제1번 e단조 Op.38', ARRAY['Cello Sonata No. 1 in E minor Op. 38'], (SELECT id FROM composers WHERE name_ko = '요하네스 브람스' LIMIT 1), 'romantic', false, true, false, '첼로, 피아노', 25)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 차이콥스키 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제4번 f단조 Op.36', ARRAY['Symphony No. 4 in F minor Op. 36'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 42),
('교향곡 제5번 e단조 Op.64', ARRAY['Symphony No. 5 in E minor Op. 64'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 47),
('교향곡 제6번 b단조 Op.74 비창', ARRAY['Symphony No. 6 in B minor Pathetique Op. 74'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 45),
('피아노 협주곡 제1번 b플랫단조 Op.23', ARRAY['Piano Concerto No. 1 in B-flat minor Op. 23'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 35),
('바이올린 협주곡 D장조 Op.35', ARRAY['Violin Concerto in D major Op. 35'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '바이올린, 오케스트라', 34),
('로코코 변주곡 A장조 Op.33', ARRAY['Rococo Variations in A major Op. 33'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '첼로, 오케스트라', 18),
('현악 4중주 제1번 D장조 Op.11', ARRAY['String Quartet No. 1 in D major Op. 11'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 30),
('피아노 3중주 a단조 Op.50 위대한 예술가의 추억', ARRAY['Piano Trio in A minor Op. 50'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 44),
('백조의 호수 Op.20 발레', ARRAY['Swan Lake Ballet Op. 20'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 140),
('호두까기인형 Op.71 발레', ARRAY['The Nutcracker Ballet Op. 71'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 85),
('잠자는 숲속의 미녀 Op.66 발레', ARRAY['Sleeping Beauty Ballet Op. 66'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 180),
('세레나데 C장조 Op.48', ARRAY['Serenade for Strings in C major Op. 48'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '현악 오케스트라', 30),
('교향적 환상곡 프란체스카 다 리미니 Op.32', ARRAY['Francesca da Rimini Op. 32'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 25),
('1812년 서곡 Op.49', ARRAY['1812 Overture Op. 49'], (SELECT id FROM composers WHERE name_ko = '표트르 차이콥스키' LIMIT 1), 'romantic', true, false, false, '오케스트라', 15)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 드보르자크 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제7번 d단조 Op.70', ARRAY['Symphony No. 7 in D minor Op. 70'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '오케스트라', 38),
('교향곡 제8번 G장조 Op.88', ARRAY['Symphony No. 8 in G major Op. 88'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '오케스트라', 37),
('교향곡 제9번 e단조 Op.95 신세계로부터', ARRAY['Symphony No. 9 From the New World in E minor Op. 95'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '오케스트라', 42),
('첼로 협주곡 b단조 Op.104', ARRAY['Cello Concerto in B minor Op. 104'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '첼로, 오케스트라', 40),
('바이올린 협주곡 a단조 Op.53', ARRAY['Violin Concerto in A minor Op. 53'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '바이올린, 오케스트라', 30),
('현악 4중주 제12번 F장조 Op.96 아메리카', ARRAY['String Quartet No. 12 American in F major Op. 96'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 26),
('현악 4중주 제13번 G장조 Op.106', ARRAY['String Quartet No. 13 in G major Op. 106'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 34),
('피아노 5중주 제2번 A장조 Op.81', ARRAY['Piano Quintet No. 2 in A major Op. 81'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', false, true, false, '피아노, 현악 4중주', 36),
('피아노 3중주 제4번 e단조 Op.90 둠키', ARRAY['Piano Trio No. 4 Dumky in E minor Op. 90'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 32),
('현악 세레나데 E장조 Op.22', ARRAY['Serenade for Strings in E major Op. 22'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '현악 오케스트라', 28),
('목관 세레나데 d단조 Op.44', ARRAY['Serenade for Wind in D minor Op. 44'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '목관 오케스트라', 25),
('슬라브 무곡 Op.46 & Op.72', ARRAY['Slavonic Dances Op. 46 and Op. 72'], (SELECT id FROM composers WHERE name_ko = '안토닌 드보르자크' LIMIT 1), 'romantic', true, false, false, '오케스트라', 60)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 그리그 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('피아노 협주곡 a단조 Op.16', ARRAY['Piano Concerto in A minor Op. 16'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 29),
('페르 귄트 모음곡 제1번 Op.46', ARRAY['Peer Gynt Suite No. 1 Op. 46'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', true, false, false, '오케스트라', 22),
('페르 귄트 모음곡 제2번 Op.55', ARRAY['Peer Gynt Suite No. 2 Op. 55'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', true, false, false, '오케스트라', 20),
('현악 4중주 g단조 Op.27', ARRAY['String Quartet in G minor Op. 27'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 27),
('바이올린 소나타 제1번 F장조 Op.8', ARRAY['Violin Sonata No. 1 in F major Op. 8'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', false, true, false, '바이올린, 피아노', 22),
('바이올린 소나타 제2번 G장조 Op.13', ARRAY['Violin Sonata No. 2 in G major Op. 13'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', false, true, false, '바이올린, 피아노', 24),
('바이올린 소나타 제3번 c단조 Op.45', ARRAY['Violin Sonata No. 3 in C minor Op. 45'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', false, true, false, '바이올린, 피아노', 27),
('첼로 소나타 a단조 Op.36', ARRAY['Cello Sonata in A minor Op. 36'], (SELECT id FROM composers WHERE name_ko = '에드바르 그리그' LIMIT 1), 'romantic', false, true, false, '첼로, 피아노', 28)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 시벨리우스 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제2번 D장조 Op.43', ARRAY['Symphony No. 2 in D major Op. 43'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 43),
('교향곡 제5번 E플랫장조 Op.82', ARRAY['Symphony No. 5 in E-flat major Op. 82'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 30),
('교향곡 제7번 C장조 Op.105', ARRAY['Symphony No. 7 in C major Op. 105'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 20),
('바이올린 협주곡 d단조 Op.47', ARRAY['Violin Concerto in D minor Op. 47'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', true, false, false, '바이올린, 오케스트라', 32),
('핀란디아 Op.26', ARRAY['Finlandia Op. 26'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 8),
('현악 4중주 d단조 Op.56 목소리 가까이', ARRAY['String Quartet in D minor Voces intimae Op. 56'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', false, true, false, '현악 4중주', 25),
('교향시 타피올라 Op.112', ARRAY['Tapiola Op. 112'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', true, false, false, '오케스트라', 19),
('바이올린과 피아노를 위한 소나티나', ARRAY['Sonatina for Violin and Piano'], (SELECT id FROM composers WHERE name_ko = '장 시벨리우스' LIMIT 1), 'romantic', false, true, false, '바이올린, 피아노', 10)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 라흐마니노프 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제2번 e단조 Op.27', ARRAY['Symphony No. 2 in E minor Op. 27'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '오케스트라', 58),
('피아노 협주곡 제2번 c단조 Op.18', ARRAY['Piano Concerto No. 2 in C minor Op. 18'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 35),
('피아노 협주곡 제3번 d단조 Op.30', ARRAY['Piano Concerto No. 3 in D minor Op. 30'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 40),
('파가니니 주제에 의한 광시곡 Op.43', ARRAY['Rhapsody on a Theme of Paganini Op. 43'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 24),
('피아노 소나타 제2번 b플랫단조 Op.36', ARRAY['Piano Sonata No. 2 in B-flat minor Op. 36'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', false, false, true, '피아노', 20),
('피아노 3중주 g단조 Op.posth 비가', ARRAY['Elegiac Trio in G minor'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', false, true, false, '피아노, 바이올린, 첼로', 22),
('첼로 소나타 g단조 Op.19', ARRAY['Cello Sonata in G minor Op. 19'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', false, true, false, '첼로, 피아노', 38),
('교향적 무곡 Op.45', ARRAY['Symphonic Dances Op. 45'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '오케스트라', 35),
('피아노 협주곡 제1번 f샵단조 Op.1', ARRAY['Piano Concerto No. 1 in F-sharp minor Op. 1'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 26),
('피아노 협주곡 제4번 g단조 Op.40', ARRAY['Piano Concerto No. 4 in G minor Op. 40'], (SELECT id FROM composers WHERE name_ko = '세르게이 라흐마니노프' LIMIT 1), 'romantic', true, false, false, '피아노, 오케스트라', 26)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 드뷔시 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('현악 4중주 g단조 Op.10', ARRAY['String Quartet in G minor Op. 10'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, true, false, '현악 4중주', 26),
('바이올린 소나타 g단조', ARRAY['Violin Sonata in G minor'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, true, false, '바이올린, 피아노', 12),
('첼로 소나타 d단조', ARRAY['Cello Sonata in D minor'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, true, false, '첼로, 피아노', 11),
('플루트 비올라 하프를 위한 소나타', ARRAY['Sonata for Flute Viola and Harp'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, true, false, '플루트, 비올라, 하프', 18),
('목신의 오후 전주곡', ARRAY['Prelude to the Afternoon of a Faun'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', true, false, false, '오케스트라', 10),
('바다', ARRAY['La Mer'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', true, false, false, '오케스트라', 25),
('야상곡', ARRAY['Nocturnes'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', true, false, false, '오케스트라', 26),
('피아노 전주곡집 제1권', ARRAY['Preludes Book 1'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, false, true, '피아노', 38),
('피아노 전주곡집 제2권', ARRAY['Preludes Book 2'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, false, true, '피아노', 42),
('어린이 차지', ARRAY['Childrens Corner'], (SELECT id FROM composers WHERE name_ko = '클로드 드뷔시' LIMIT 1), 'modern', false, false, true, '피아노', 17)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 라벨 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('현악 4중주 F장조', ARRAY['String Quartet in F major'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', false, true, false, '현악 4중주', 27),
('피아노 3중주 a단조', ARRAY['Piano Trio in A minor'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', false, true, false, '피아노, 바이올린, 첼로', 26),
('바이올린 소나타 G장조', ARRAY['Violin Sonata in G major'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', false, true, false, '바이올린, 피아노', 21),
('첼로 소나타', ARRAY['Cello Sonata'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', false, true, false, '첼로, 피아노', 13),
('볼레로', ARRAY['Bolero'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', true, false, false, '오케스트라', 15),
('라 발스', ARRAY['La Valse'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', true, false, false, '오케스트라', 12),
('피아노 협주곡 G장조', ARRAY['Piano Concerto in G major'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', true, false, false, '피아노, 오케스트라', 22),
('왼손을 위한 협주곡 D장조', ARRAY['Piano Concerto for Left Hand in D major'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', true, false, false, '피아노(왼손), 오케스트라', 18),
('다프니스와 클로에', ARRAY['Daphnis et Chloe'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', true, false, false, '오케스트라', 50),
('스페인 광시곡', ARRAY['Rapsodie espagnole'], (SELECT id FROM composers WHERE name_ko = '모리스 라벨' LIMIT 1), 'modern', true, false, false, '오케스트라', 16)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 쇼스타코비치 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제5번 d단조 Op.47', ARRAY['Symphony No. 5 in D minor Op. 47'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', true, false, false, '오케스트라', 46),
('교향곡 제7번 C장조 Op.60 레닌그라드', ARRAY['Symphony No. 7 Leningrad in C major Op. 60'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', true, false, false, '오케스트라', 75),
('교향곡 제10번 e단조 Op.93', ARRAY['Symphony No. 10 in E minor Op. 93'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', true, false, false, '오케스트라', 55),
('첼로 협주곡 제1번 E플랫장조 Op.107', ARRAY['Cello Concerto No. 1 in E-flat major Op. 107'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', true, false, false, '첼로, 오케스트라', 30),
('바이올린 협주곡 제1번 a단조 Op.77', ARRAY['Violin Concerto No. 1 in A minor Op. 77'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', true, false, false, '바이올린, 오케스트라', 36),
('현악 4중주 제8번 c단조 Op.110', ARRAY['String Quartet No. 8 in C minor Op. 110'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', false, true, false, '현악 4중주', 21),
('피아노 5중주 g단조 Op.57', ARRAY['Piano Quintet in G minor Op. 57'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', false, true, false, '피아노, 현악 4중주', 35),
('피아노 3중주 제2번 e단조 Op.67', ARRAY['Piano Trio No. 2 in E minor Op. 67'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', false, true, false, '피아노, 바이올린, 첼로', 25),
('현악 4중주 제3번 F장조 Op.73', ARRAY['String Quartet No. 3 in F major Op. 73'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', false, true, false, '현악 4중주', 32),
('피아노 협주곡 제2번 F장조 Op.102', ARRAY['Piano Concerto No. 2 in F major Op. 102'], (SELECT id FROM composers WHERE name_ko = '드미트리 쇼스타코비치' LIMIT 1), 'modern', true, false, false, '피아노, 오케스트라', 22)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 프로코피에프 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제1번 D장조 Op.25 고전', ARRAY['Symphony No. 1 Classical in D major Op. 25'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', true, false, false, '오케스트라', 15),
('교향곡 제5번 B플랫장조 Op.100', ARRAY['Symphony No. 5 in B-flat major Op. 100'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', true, false, false, '오케스트라', 42),
('피아노 협주곡 제3번 C장조 Op.26', ARRAY['Piano Concerto No. 3 in C major Op. 26'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', true, false, false, '피아노, 오케스트라', 26),
('바이올린 협주곡 제1번 D장조 Op.19', ARRAY['Violin Concerto No. 1 in D major Op. 19'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', true, false, false, '바이올린, 오케스트라', 22),
('바이올린 협주곡 제2번 g단조 Op.63', ARRAY['Violin Concerto No. 2 in G minor Op. 63'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', true, false, false, '바이올린, 오케스트라', 27),
('피아노 소나타 제7번 B플랫장조 Op.83 전쟁', ARRAY['Piano Sonata No. 7 in B-flat major War Op. 83'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', false, false, true, '피아노', 16),
('첼로 소나타 C장조 Op.119', ARRAY['Cello Sonata in C major Op. 119'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', false, true, false, '첼로, 피아노', 28),
('로미오와 줄리엣 모음곡 Op.64', ARRAY['Romeo and Juliet Suite Op. 64'], (SELECT id FROM composers WHERE name_ko = '세르게이 프로코피에프' LIMIT 1), 'modern', true, false, false, '오케스트라', 50)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 바르톡 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('오케스트라를 위한 협주곡', ARRAY['Concerto for Orchestra'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', true, false, false, '오케스트라', 37),
('바이올린 협주곡 제2번', ARRAY['Violin Concerto No. 2'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', true, false, false, '바이올린, 오케스트라', 38),
('피아노 협주곡 제2번', ARRAY['Piano Concerto No. 2'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', true, false, false, '피아노, 오케스트라', 27),
('피아노 협주곡 제3번', ARRAY['Piano Concerto No. 3'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', true, false, false, '피아노, 오케스트라', 26),
('현악 4중주 제4번', ARRAY['String Quartet No. 4'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', false, true, false, '현악 4중주', 27),
('현악 4중주 제5번', ARRAY['String Quartet No. 5'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', false, true, false, '현악 4중주', 30),
('현악 4중주 제6번', ARRAY['String Quartet No. 6'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', false, true, false, '현악 4중주', 29),
('피아노 소나타', ARRAY['Piano Sonata'], (SELECT id FROM composers WHERE name_ko = '벨라 바르톡' LIMIT 1), 'modern', false, false, true, '피아노', 15)
ON CONFLICT (composer_id, title) DO NOTHING;

-- ========================
-- 엘가 (1/1)
-- ========================
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('첼로 협주곡 e단조 Op.85', ARRAY['Cello Concerto in E minor Op. 85'], (SELECT id FROM composers WHERE name_ko = '에드워드 엘가' LIMIT 1), 'romantic', true, false, false, '첼로, 오케스트라', 28),
('수수께끼 변주곡 Op.36', ARRAY['Enigma Variations Op. 36'], (SELECT id FROM composers WHERE name_ko = '에드워드 엘가' LIMIT 1), 'romantic', true, false, false, '오케스트라', 30),
('바이올린 협주곡 b단조 Op.61', ARRAY['Violin Concerto in B minor Op. 61'], (SELECT id FROM composers WHERE name_ko = '에드워드 엘가' LIMIT 1), 'romantic', true, false, false, '바이올린, 오케스트라', 50),
('현악 세레나데 e단조 Op.20', ARRAY['Serenade for Strings in E minor Op. 20'], (SELECT id FROM composers WHERE name_ko = '에드워드 엘가' LIMIT 1), 'romantic', true, false, false, '현악 오케스트라', 12),
('피아노 5중주 a단조 Op.84', ARRAY['Piano Quintet in A minor Op. 84'], (SELECT id FROM composers WHERE name_ko = '에드워드 엘가' LIMIT 1), 'romantic', false, true, false, '피아노, 현악 4중주', 38)
ON CONFLICT (composer_id, title) DO NOTHING;
