-- Seed: 클래식 대표곡 1000곡 pieces 테이블 삽입
-- Generated: 2026-02-21

-- First, add missing composers (Franck, Fauré, etc.)
INSERT INTO composers (name, name_ko, birth_year, death_year, period, nationality, bio)
VALUES
('César Franck', '세자르 프랑크', 1822, 1890, 'romantic', 'Belgian-French', 'Organist and symphonic composer'),
('Gabriel Fauré', '가브리엘 포레', 1845, 1924, 'romantic', 'French', 'Master of French art song and chamber music')
ON CONFLICT DO NOTHING;

-- Helper: use DO block with function to avoid verbose WHERE NOT EXISTS per row
-- We use INSERT ... ON CONFLICT (composer_id, title) DO NOTHING

-- ============================================================
-- BAROQUE (150 pieces)
-- ============================================================

-- === Bach (바흐) ===
-- Brandenburg Concertos 1-6
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('브란덴부르크 협주곡 제1번 F장조 BWV 1046', ARRAY['Brandenburg Concerto No. 1 in F major, BWV 1046'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 22),
('브란덴부르크 협주곡 제2번 F장조 BWV 1047', ARRAY['Brandenburg Concerto No. 2 in F major, BWV 1047'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 13),
('브란덴부르크 협주곡 제3번 G장조 BWV 1048', ARRAY['Brandenburg Concerto No. 3 in G major, BWV 1048'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 12),
('브란덴부르크 협주곡 제4번 G장조 BWV 1049', ARRAY['Brandenburg Concerto No. 4 in G major, BWV 1049'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 16),
('브란덴부르크 협주곡 제5번 D장조 BWV 1050', ARRAY['Brandenburg Concerto No. 5 in D major, BWV 1050'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 22),
('브란덴부르크 협주곡 제6번 B플랫장조 BWV 1051', ARRAY['Brandenburg Concerto No. 6 in B-flat major, BWV 1051'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 18),
-- Cello Suites 1-6
('무반주 첼로 모음곡 제1번 G장조 BWV 1007', ARRAY['Cello Suite No. 1 in G major, BWV 1007'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Cello', 20),
('무반주 첼로 모음곡 제2번 d단조 BWV 1008', ARRAY['Cello Suite No. 2 in D minor, BWV 1008'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Cello', 21),
('무반주 첼로 모음곡 제3번 C장조 BWV 1009', ARRAY['Cello Suite No. 3 in C major, BWV 1009'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Cello', 23),
('무반주 첼로 모음곡 제4번 E플랫장조 BWV 1010', ARRAY['Cello Suite No. 4 in E-flat major, BWV 1010'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Cello', 25),
('무반주 첼로 모음곡 제5번 c단조 BWV 1011', ARRAY['Cello Suite No. 5 in C minor, BWV 1011'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Cello', 28),
('무반주 첼로 모음곡 제6번 D장조 BWV 1012', ARRAY['Cello Suite No. 6 in D major, BWV 1012'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Cello', 30),
-- Violin Sonatas & Partitas
('무반주 바이올린 소나타 제1번 g단조 BWV 1001', ARRAY['Violin Sonata No. 1 in G minor, BWV 1001'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Violin', 17),
('무반주 바이올린 파르티타 제1번 b단조 BWV 1002', ARRAY['Violin Partita No. 1 in B minor, BWV 1002'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Violin', 26),
('무반주 바이올린 소나타 제2번 a단조 BWV 1003', ARRAY['Violin Sonata No. 2 in A minor, BWV 1003'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Violin', 20),
('무반주 바이올린 파르티타 제2번 d단조 BWV 1004', ARRAY['Violin Partita No. 2 in D minor, BWV 1004', '샤콘느'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Violin', 30),
('무반주 바이올린 소나타 제3번 C장조 BWV 1005', ARRAY['Violin Sonata No. 3 in C major, BWV 1005'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Violin', 22),
('무반주 바이올린 파르티타 제3번 E장조 BWV 1006', ARRAY['Violin Partita No. 3 in E major, BWV 1006'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Violin', 18),
-- Goldberg Variations
('골드베르크 변주곡 BWV 988', ARRAY['Goldberg Variations, BWV 988'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 75),
-- Well-Tempered Clavier
('평균율 클라비어곡집 제1권 BWV 846-869', ARRAY['The Well-Tempered Clavier, Book I, BWV 846-869'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 120),
('평균율 클라비어곡집 제2권 BWV 870-893', ARRAY['The Well-Tempered Clavier, Book II, BWV 870-893'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 120),
-- Orchestral Suites
('관현악 모음곡 제1번 C장조 BWV 1066', ARRAY['Orchestral Suite No. 1 in C major, BWV 1066'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 22),
('관현악 모음곡 제2번 b단조 BWV 1067', ARRAY['Orchestral Suite No. 2 in B minor, BWV 1067'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Flute', 22),
('관현악 모음곡 제3번 D장조 BWV 1068', ARRAY['Orchestral Suite No. 3 in D major, BWV 1068', 'G선상의 아리아', 'Air on the G String'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 20),
('관현악 모음곡 제4번 D장조 BWV 1069', ARRAY['Orchestral Suite No. 4 in D major, BWV 1069'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 22),
-- Passions & Major Works
('마태 수난곡 BWV 244', ARRAY['St. Matthew Passion, BWV 244'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 170),
('요한 수난곡 BWV 245', ARRAY['St. John Passion, BWV 245'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 110),
('토카타와 푸가 d단조 BWV 565', ARRAY['Toccata and Fugue in D minor, BWV 565'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Organ', 9),
('미사 b단조 BWV 232', ARRAY['Mass in B minor, BWV 232'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 120),
('크리스마스 오라토리오 BWV 248', ARRAY['Christmas Oratorio, BWV 248'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 150),
('음악의 헌정 BWV 1079', ARRAY['The Musical Offering, BWV 1079'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, true, false, 'Chamber Ensemble', 50),
('푸가의 기법 BWV 1080', ARRAY['The Art of Fugue, BWV 1080'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, true, false, 'Keyboard/Ensemble', 80),
-- Bach Violin Concertos
('바이올린 협주곡 제1번 a단조 BWV 1041', ARRAY['Violin Concerto No. 1 in A minor, BWV 1041'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 15),
('바이올린 협주곡 제2번 E장조 BWV 1042', ARRAY['Violin Concerto No. 2 in E major, BWV 1042'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 17),
('두 대의 바이올린을 위한 협주곡 d단조 BWV 1043', ARRAY['Concerto for Two Violins in D minor, BWV 1043', 'Double Violin Concerto'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, '2 Violins, Orchestra', 17),
-- Bach Harpsichord Concertos
('하프시코드 협주곡 제1번 d단조 BWV 1052', ARRAY['Harpsichord Concerto No. 1 in D minor, BWV 1052'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Harpsichord, Orchestra', 23),
('하프시코드 협주곡 제2번 E장조 BWV 1053', ARRAY['Harpsichord Concerto No. 2 in E major, BWV 1053'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Harpsichord, Orchestra', 20),
('하프시코드 협주곡 제3번 D장조 BWV 1054', ARRAY['Harpsichord Concerto No. 3 in D major, BWV 1054'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Harpsichord, Orchestra', 18),
('하프시코드 협주곡 제4번 A장조 BWV 1055', ARRAY['Harpsichord Concerto No. 4 in A major, BWV 1055'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Harpsichord, Orchestra', 15),
('하프시코드 협주곡 제5번 f단조 BWV 1056', ARRAY['Harpsichord Concerto No. 5 in F minor, BWV 1056'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Harpsichord, Orchestra', 12),
-- Bach additional
('이탈리아 협주곡 BWV 971', ARRAY['Italian Concerto, BWV 971'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 13),
('프랑스 모음곡 전곡 BWV 812-817', ARRAY['French Suites, BWV 812-817'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 90),
('영국 모음곡 전곡 BWV 806-811', ARRAY['English Suites, BWV 806-811'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 110),
('바이올린과 하프시코드를 위한 소나타 BWV 1014-1019', ARRAY['Sonatas for Violin and Harpsichord, BWV 1014-1019'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, true, false, 'Violin, Harpsichord', 90),
('비올라 다 감바 소나타 BWV 1027-1029', ARRAY['Viola da Gamba Sonatas, BWV 1027-1029'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, true, false, 'Viola da Gamba, Harpsichord', 40),
('플루트 소나타 BWV 1030-1035', ARRAY['Flute Sonatas, BWV 1030-1035'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, true, false, 'Flute, Harpsichord', 60),
('칸타타 제140번 깨어나라 BWV 140', ARRAY['Cantata BWV 140 Wachet auf', 'Sleepers Awake'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 28),
('칸타타 제147번 마음과 입과 행동과 삶으로 BWV 147', ARRAY['Cantata BWV 147 Herz und Mund und Tat und Leben', 'Jesu, Joy of Man''s Desiring'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 30),
('칸타타 제80번 우리의 하나님은 견고한 성 BWV 80', ARRAY['Cantata BWV 80 Ein feste Burg ist unser Gott'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 25),
('파사칼리아와 푸가 c단조 BWV 582', ARRAY['Passacaglia and Fugue in C minor, BWV 582'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Organ', 14),
('전주곡과 푸가 E플랫장조 BWV 552', ARRAY['Prelude and Fugue in E-flat major, BWV 552', 'St. Anne'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Organ', 14),
('반음계적 환상곡과 푸가 d단조 BWV 903', ARRAY['Chromatic Fantasia and Fugue in D minor, BWV 903'], (SELECT id FROM composers WHERE name_ko = '요한 세바스찬 바흐' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 13)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Vivaldi (비발디) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('사계 - 봄 E장조 RV 269', ARRAY['The Four Seasons - Spring in E major, RV 269', 'La primavera'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 10),
('사계 - 여름 g단조 RV 315', ARRAY['The Four Seasons - Summer in G minor, RV 315', 'L''estate'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 11),
('사계 - 가을 F장조 RV 293', ARRAY['The Four Seasons - Autumn in F major, RV 293', 'L''autunno'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 11),
('사계 - 겨울 f단조 RV 297', ARRAY['The Four Seasons - Winter in F minor, RV 297', 'L''inverno'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 9),
-- L'estro armonico Op.3
('조화의 영감 제1번 D장조 RV 549', ARRAY['L''estro armonico No. 1, RV 549'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Strings', 10),
('조화의 영감 제2번 g단조 RV 578', ARRAY['L''estro armonico No. 2, RV 578'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Strings', 10),
('조화의 영감 제3번 G장조 RV 310', ARRAY['L''estro armonico No. 3, RV 310'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Strings', 8),
('조화의 영감 제4번 e단조 RV 550', ARRAY['L''estro armonico No. 4, RV 550'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Strings', 10),
('조화의 영감 제5번 A장조 RV 519', ARRAY['L''estro armonico No. 5, RV 519'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Strings', 8),
('조화의 영감 제6번 a단조 RV 356', ARRAY['L''estro armonico No. 6, RV 356'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Strings', 7),
('조화의 영감 제7번 F장조 RV 567', ARRAY['L''estro armonico No. 7, RV 567'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Strings', 10),
('조화의 영감 제8번 a단조 RV 522', ARRAY['L''estro armonico No. 8, RV 522'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, '2 Violins, Strings', 10),
('조화의 영감 제9번 D장조 RV 230', ARRAY['L''estro armonico No. 9, RV 230'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Strings', 8),
('조화의 영감 제10번 b단조 RV 580', ARRAY['L''estro armonico No. 10, RV 580'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, '4 Violins, Strings', 11),
('조화의 영감 제11번 d단조 RV 565', ARRAY['L''estro armonico No. 11, RV 565'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, '2 Violins, Cello, Strings', 10),
('조화의 영감 제12번 E장조 RV 265', ARRAY['L''estro armonico No. 12, RV 265'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Strings', 8),
-- Vivaldi other concertos
('첼로 협주곡 a단조 RV 418', ARRAY['Cello Concerto in A minor, RV 418'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Cello, Orchestra', 12),
('첼로 협주곡 d단조 RV 406', ARRAY['Cello Concerto in D minor, RV 406'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Cello, Orchestra', 11),
('첼로 협주곡 G장조 RV 413', ARRAY['Cello Concerto in G major, RV 413'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Cello, Orchestra', 10),
('플루트 협주곡 D장조 RV 429', ARRAY['Flute Concerto in D major, RV 429'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Flute, Orchestra', 10),
('플루트 협주곡 G장조 RV 435', ARRAY['Flute Concerto in G major, RV 435'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Flute, Orchestra', 9),
('플루트 협주곡 F장조 바다의 폭풍 RV 433', ARRAY['Flute Concerto in F major La tempesta di mare, RV 433'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Flute, Orchestra', 10),
('플루트 협주곡 D장조 홍방울새 RV 428', ARRAY['Flute Concerto in D major Il gardellino, RV 428'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Flute, Orchestra', 11),
('플루트 협주곡 g단조 밤 RV 439', ARRAY['Flute Concerto in G minor La notte, RV 439'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Flute, Orchestra', 10),
('글로리아 D장조 RV 589', ARRAY['Gloria in D major, RV 589'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 30),
('만돌린 협주곡 C장조 RV 425', ARRAY['Mandolin Concerto in C major, RV 425'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Mandolin, Orchestra', 8),
('두 대의 만돌린을 위한 협주곡 G장조 RV 532', ARRAY['Concerto for Two Mandolins in G major, RV 532'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, '2 Mandolins, Orchestra', 10),
('오보에 협주곡 a단조 RV 461', ARRAY['Oboe Concerto in A minor, RV 461'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Oboe, Orchestra', 10),
('바이올린 협주곡 a단조 RV 356', ARRAY['Violin Concerto in A minor, RV 356'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Violin, Orchestra', 7),
('바순 협주곡 e단조 RV 484', ARRAY['Bassoon Concerto in E minor, RV 484'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Bassoon, Orchestra', 12),
('바순 협주곡 a단조 RV 498', ARRAY['Bassoon Concerto in A minor, RV 498'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Bassoon, Orchestra', 11),
('스타바트 마테르 RV 621', ARRAY['Stabat Mater, RV 621'], (SELECT id FROM composers WHERE name_ko = '안토니오 비발디' LIMIT 1), 'baroque', true, false, false, 'Alto, Orchestra', 18)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Handel (헨델) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('메시아 HWV 56', ARRAY['Messiah, HWV 56', 'Hallelujah'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 150),
('왕궁의 불꽃놀이 음악 HWV 351', ARRAY['Music for the Royal Fireworks, HWV 351'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 20),
('수상 음악 HWV 348-350', ARRAY['Water Music, HWV 348-350'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Orchestra', 50),
('오르간 협주곡 제1번 g단조 Op.4-1', ARRAY['Organ Concerto No. 1 in G minor, Op. 4 No. 1'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Organ, Orchestra', 12),
('오르간 협주곡 제2번 B플랫장조 Op.4-2', ARRAY['Organ Concerto No. 2 in B-flat major, Op. 4 No. 2'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Organ, Orchestra', 10),
('오르간 협주곡 제4번 F장조 Op.4-4', ARRAY['Organ Concerto No. 4 in F major, Op. 4 No. 4'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Organ, Orchestra', 14),
('오르간 협주곡 제13번 F장조 뻐꾸기와 나이팅게일 HWV 295', ARRAY['Organ Concerto No. 13 The Cuckoo and the Nightingale, HWV 295'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Organ, Orchestra', 15),
('합주 협주곡 Op.6 전12곡', ARRAY['Concerti Grossi, Op. 6'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'String Orchestra', 100),
('줄리오 체자레 HWV 17', ARRAY['Giulio Cesare, HWV 17', 'Julius Caesar'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 210),
('리날도 HWV 7', ARRAY['Rinaldo, HWV 7', 'Lascia ch''io pianga'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 180),
('세르세 HWV 40', ARRAY['Serse, HWV 40', 'Xerxes', 'Largo', 'Ombra mai fu'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 160),
('솔로몬 HWV 67', ARRAY['Solomon, HWV 67', 'Arrival of the Queen of Sheba'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 150),
('사울 HWV 53', ARRAY['Saul, HWV 53'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir, Soloists', 150),
('하프시코드 모음곡 제5번 E장조 HWV 430', ARRAY['Harpsichord Suite No. 5 in E major, HWV 430', 'The Harmonious Blacksmith'], (SELECT id FROM composers WHERE name_ko = '게오르그 프리데릭 헨델' LIMIT 1), 'baroque', false, false, true, 'Harpsichord', 20)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Purcell (퍼셀) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('디도와 에네아스', ARRAY['Dido and Aeneas', 'When I Am Laid in Earth'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 60),
('요정의 여왕', ARRAY['The Fairy-Queen'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 120),
('아서왕', ARRAY['King Arthur'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 100),
('메리 여왕의 장례 음악', ARRAY['Music for the Funeral of Queen Mary'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', true, false, false, 'Brass, Choir', 15),
('트럼펫을 위한 소나타 D장조', ARRAY['Sonata for Trumpet in D major'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', false, true, false, 'Trumpet, Strings', 8),
('샤콘느 g단조', ARRAY['Chaconne in G minor'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', false, true, false, 'Strings', 8),
('10개의 소나타 4성부', ARRAY['10 Sonatas of Four Parts'], (SELECT id FROM composers WHERE name_ko = '헨리 펄셀' LIMIT 1), 'baroque', false, true, false, 'Strings, Continuo', 60)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Other Baroque ===
-- Telemann, Corelli, Scarlatti, Rameau, Couperin etc (using Bach's period composers already in DB)
-- For composers not in DB, we'll use NULL composer_id or skip

-- Additional baroque to reach 150
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('바이올린 소나타 제1번 d단조 Op.5-1', ARRAY['Violin Sonata No. 1 in D minor, Op. 5 No. 1'], (SELECT id FROM composers WHERE name = 'Arcangelo Corelli' LIMIT 1), 'baroque', false, true, false, 'Violin, Continuo', 12),
('합주 협주곡 Op.6 제8번 크리스마스 g단조', ARRAY['Concerto Grosso Op. 6 No. 8 Christmas Concerto'], (SELECT id FROM composers WHERE name = 'Arcangelo Corelli' LIMIT 1), 'baroque', true, false, false, 'String Orchestra', 14),
('라 폴리아 Op.5-12', ARRAY['La Folia, Op. 5 No. 12'], (SELECT id FROM composers WHERE name = 'Arcangelo Corelli' LIMIT 1), 'baroque', false, true, false, 'Violin, Continuo', 10),
('키보드 소나타 d단조 K.141', ARRAY['Keyboard Sonata in D minor, K. 141'], (SELECT id FROM composers WHERE name = 'Domenico Scarlatti' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 4),
('키보드 소나타 E장조 K.380', ARRAY['Keyboard Sonata in E major, K. 380'], (SELECT id FROM composers WHERE name = 'Domenico Scarlatti' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 5),
('키보드 소나타 b단조 K.27', ARRAY['Keyboard Sonata in B minor, K. 27'], (SELECT id FROM composers WHERE name = 'Domenico Scarlatti' LIMIT 1), 'baroque', false, false, true, 'Harpsichord/Piano', 4),
('타펠무지크', ARRAY['Tafelmusik', 'Table Music'], (SELECT id FROM composers WHERE name = 'Georg Philipp Telemann' LIMIT 1), 'baroque', true, true, false, 'Chamber Orchestra', 200),
('파리 사중주', ARRAY['Paris Quartets'], (SELECT id FROM composers WHERE name = 'Georg Philipp Telemann' LIMIT 1), 'baroque', false, true, false, 'Flute, Strings', 60),
('트럼펫 협주곡 D장조', ARRAY['Trumpet Concerto in D major'], (SELECT id FROM composers WHERE name = 'Georg Philipp Telemann' LIMIT 1), 'baroque', true, false, false, 'Trumpet, Orchestra', 10),
('비올라 협주곡 G장조', ARRAY['Viola Concerto in G major'], (SELECT id FROM composers WHERE name = 'Georg Philipp Telemann' LIMIT 1), 'baroque', true, false, false, 'Viola, Orchestra', 14),
('플루트 협주곡 D장조', ARRAY['Flute Concerto in D major'], (SELECT id FROM composers WHERE name = 'Georg Philipp Telemann' LIMIT 1), 'baroque', true, false, false, 'Flute, Orchestra', 12),
('오보에 협주곡 d단조', ARRAY['Oboe Concerto in D minor'], (SELECT id FROM composers WHERE name = 'Georg Philipp Telemann' LIMIT 1), 'baroque', true, false, false, 'Oboe, Orchestra', 11),
('레 보레아드', ARRAY['Les Boréades'], (SELECT id FROM composers WHERE name = 'Jean-Philippe Rameau' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra', 150),
('우아한 인도의 나라들', ARRAY['Les Indes galantes'], (SELECT id FROM composers WHERE name = 'Jean-Philippe Rameau' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra', 150),
('콘서트용 클라브생 작품집', ARRAY['Pièces de clavecin en concerts'], (SELECT id FROM composers WHERE name = 'Jean-Philippe Rameau' LIMIT 1), 'baroque', false, true, false, 'Harpsichord, Violin, Viola da Gamba', 50),
('클라브생 모음곡', ARRAY['Pièces de clavecin'], (SELECT id FROM composers WHERE name = 'François Couperin' LIMIT 1), 'baroque', false, false, true, 'Harpsichord', 60),
('왕궁의 콩세르', ARRAY['Les concerts royaux'], (SELECT id FROM composers WHERE name = 'François Couperin' LIMIT 1), 'baroque', false, true, false, 'Chamber Ensemble', 40),
('테 데움', ARRAY['Te Deum'], (SELECT id FROM composers WHERE name_ko = '장-바티스트 륄리' LIMIT 1), 'baroque', true, false, false, 'Orchestra, Choir', 30),
('아르미드', ARRAY['Armide'], (SELECT id FROM composers WHERE name_ko = '장-바티스트 륄리' LIMIT 1), 'baroque', true, false, false, 'Opera Orchestra, Soloists', 150),
('아다지오 g단조', ARRAY['Adagio in G minor'], (SELECT id FROM composers WHERE name = 'Tomaso Albinoni' LIMIT 1), 'baroque', true, false, false, 'Strings, Organ', 10),
('오보에 협주곡 d단조 Op.9-2', ARRAY['Oboe Concerto in D minor, Op. 9 No. 2'], (SELECT id FROM composers WHERE name = 'Tomaso Albinoni' LIMIT 1), 'baroque', true, false, false, 'Oboe, Orchestra', 12),
('카논과 지그 D장조', ARRAY['Canon and Gigue in D major', 'Pachelbel Canon'], (SELECT id FROM composers WHERE name = 'Johann Pachelbel' LIMIT 1), 'baroque', false, true, false, '3 Violins, Continuo', 6),
('스타바트 마테르', ARRAY['Stabat Mater'], (SELECT id FROM composers WHERE name = 'Giovanni Battista Pergolesi' LIMIT 1), 'baroque', false, true, false, 'Soprano, Alto, Strings', 40)
ON CONFLICT (composer_id, title) DO NOTHING;


-- ============================================================
-- CLASSICAL (200 pieces)
-- ============================================================

-- === Mozart (모차르트) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
-- Symphonies
('교향곡 제25번 g단조 K.183', ARRAY['Symphony No. 25 in G minor, K. 183'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 22),
('교향곡 제29번 A장조 K.201', ARRAY['Symphony No. 29 in A major, K. 201'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 25),
('교향곡 제35번 D장조 K.385 하프너', ARRAY['Symphony No. 35 in D major, K. 385 Haffner'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 20),
('교향곡 제36번 C장조 K.425 린츠', ARRAY['Symphony No. 36 in C major, K. 425 Linz'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 30),
('교향곡 제38번 D장조 K.504 프라하', ARRAY['Symphony No. 38 in D major, K. 504 Prague'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 30),
('교향곡 제39번 E플랫장조 K.543', ARRAY['Symphony No. 39 in E-flat major, K. 543'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 30),
('교향곡 제40번 g단조 K.550', ARRAY['Symphony No. 40 in G minor, K. 550'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 28),
('교향곡 제41번 C장조 K.551 주피터', ARRAY['Symphony No. 41 in C major, K. 551 Jupiter'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra', 33),
-- Piano Concertos
('피아노 협주곡 제9번 E플랫장조 K.271 죄놈', ARRAY['Piano Concerto No. 9 in E-flat major, K. 271 Jeunehomme'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 32),
('피아노 협주곡 제20번 d단조 K.466', ARRAY['Piano Concerto No. 20 in D minor, K. 466'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 31),
('피아노 협주곡 제21번 C장조 K.467', ARRAY['Piano Concerto No. 21 in C major, K. 467', 'Elvira Madigan'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 30),
('피아노 협주곡 제23번 A장조 K.488', ARRAY['Piano Concerto No. 23 in A major, K. 488'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 28),
('피아노 협주곡 제24번 c단조 K.491', ARRAY['Piano Concerto No. 24 in C minor, K. 491'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 31),
('피아노 협주곡 제25번 C장조 K.503', ARRAY['Piano Concerto No. 25 in C major, K. 503'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 30),
('피아노 협주곡 제27번 B플랫장조 K.595', ARRAY['Piano Concerto No. 27 in B-flat major, K. 595'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 32),
-- Violin Concertos
('바이올린 협주곡 제1번 B플랫장조 K.207', ARRAY['Violin Concerto No. 1 in B-flat major, K. 207'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Violin, Orchestra', 22),
('바이올린 협주곡 제2번 D장조 K.211', ARRAY['Violin Concerto No. 2 in D major, K. 211'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Violin, Orchestra', 22),
('바이올린 협주곡 제3번 G장조 K.216', ARRAY['Violin Concerto No. 3 in G major, K. 216'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Violin, Orchestra', 24),
('바이올린 협주곡 제4번 D장조 K.218', ARRAY['Violin Concerto No. 4 in D major, K. 218'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Violin, Orchestra', 25),
('바이올린 협주곡 제5번 A장조 K.219 터키풍', ARRAY['Violin Concerto No. 5 in A major, K. 219 Turkish'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Violin, Orchestra', 28),
-- Other concertos
('클라리넷 협주곡 A장조 K.622', ARRAY['Clarinet Concerto in A major, K. 622'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Clarinet, Orchestra', 29),
('호른 협주곡 제1번 D장조 K.412', ARRAY['Horn Concerto No. 1 in D major, K. 412'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Horn, Orchestra', 12),
('호른 협주곡 제2번 E플랫장조 K.417', ARRAY['Horn Concerto No. 2 in E-flat major, K. 417'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Horn, Orchestra', 16),
('호른 협주곡 제3번 E플랫장조 K.447', ARRAY['Horn Concerto No. 3 in E-flat major, K. 447'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Horn, Orchestra', 17),
('호른 협주곡 제4번 E플랫장조 K.495', ARRAY['Horn Concerto No. 4 in E-flat major, K. 495'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Horn, Orchestra', 16),
('신포니아 콘체르탄테 E플랫장조 K.364', ARRAY['Sinfonia Concertante in E-flat major, K. 364'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Violin, Viola, Orchestra', 30),
('플루트와 하프를 위한 협주곡 C장조 K.299', ARRAY['Concerto for Flute and Harp in C major, K. 299'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Flute, Harp, Orchestra', 28),
-- Piano Sonatas
('피아노 소나타 제11번 A장조 K.331 터키 행진곡', ARRAY['Piano Sonata No. 11 in A major, K. 331 Alla Turca'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, false, true, 'Piano', 22),
('피아노 소나타 제16번 C장조 K.545', ARRAY['Piano Sonata No. 16 in C major, K. 545 Sonata facile'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, false, true, 'Piano', 13),
('피아노 소나타 제8번 a단조 K.310', ARRAY['Piano Sonata No. 8 in A minor, K. 310'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, false, true, 'Piano', 22),
('피아노 소나타 제14번 c단조 K.457', ARRAY['Piano Sonata No. 14 in C minor, K. 457'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, false, true, 'Piano', 22),
('환상곡 c단조 K.475', ARRAY['Fantasia in C minor, K. 475'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, false, true, 'Piano', 12),
-- String Quartets
('현악 사중주 제14번 G장조 K.387 봄', ARRAY['String Quartet No. 14 in G major, K. 387 Spring'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'String Quartet', 28),
('현악 사중주 제15번 d단조 K.421', ARRAY['String Quartet No. 15 in D minor, K. 421'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'String Quartet', 27),
('현악 사중주 제16번 E플랫장조 K.428', ARRAY['String Quartet No. 16 in E-flat major, K. 428'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'String Quartet', 27),
('현악 사중주 제17번 B플랫장조 K.458 사냥', ARRAY['String Quartet No. 17 in B-flat major, K. 458 Hunt'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'String Quartet', 28),
('현악 사중주 제18번 A장조 K.464', ARRAY['String Quartet No. 18 in A major, K. 464'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'String Quartet', 30),
('현악 사중주 제19번 C장조 K.465 불협화음', ARRAY['String Quartet No. 19 in C major, K. 465 Dissonance'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'String Quartet', 28),
-- Chamber music
('클라리넷 5중주 A장조 K.581', ARRAY['Clarinet Quintet in A major, K. 581'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Clarinet, String Quartet', 32),
('피아노와 관악을 위한 5중주 E플랫장조 K.452', ARRAY['Quintet for Piano and Winds in E-flat major, K. 452'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Piano, Oboe, Clarinet, Horn, Bassoon', 24),
('피아노 3중주 제4번 E장조 K.542', ARRAY['Piano Trio No. 4 in E major, K. 542'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Piano, Violin, Cello', 22),
('피아노 3중주 제5번 C장조 K.548', ARRAY['Piano Trio No. 5 in C major, K. 548'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Piano, Violin, Cello', 20),
('피아노 3중주 제6번 G장조 K.564', ARRAY['Piano Trio No. 6 in G major, K. 564'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Piano, Violin, Cello', 18),
('바이올린 소나타 제21번 e단조 K.304', ARRAY['Violin Sonata No. 21 in E minor, K. 304'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Violin, Piano', 16),
('바이올린 소나타 제32번 B플랫장조 K.454', ARRAY['Violin Sonata No. 32 in B-flat major, K. 454'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', false, true, false, 'Violin, Piano', 22),
-- Operas & Choral
('마술피리 K.620', ARRAY['Die Zauberflöte, K. 620', 'The Magic Flute'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Opera Orchestra, Soloists, Choir', 150),
('돈 조반니 K.527', ARRAY['Don Giovanni, K. 527'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Opera Orchestra, Soloists, Choir', 170),
('피가로의 결혼 K.492', ARRAY['Le nozze di Figaro, K. 492', 'The Marriage of Figaro'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Opera Orchestra, Soloists, Choir', 180),
('코지 판 투테 K.588', ARRAY['Così fan tutte, K. 588'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Opera Orchestra, Soloists', 180),
('레퀴엠 d단조 K.626', ARRAY['Requiem in D minor, K. 626'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra, Choir, Soloists', 55),
('대미사 c단조 K.427', ARRAY['Great Mass in C minor, K. 427'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Orchestra, Choir, Soloists', 55),
-- Serenades
('세레나데 제13번 G장조 K.525 아이네 클라이네 나흐트무지크', ARRAY['Serenade No. 13 in G major, K. 525 Eine kleine Nachtmusik'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'String Orchestra', 18),
('세레나데 제10번 B플랫장조 K.361 그란 파르티타', ARRAY['Serenade No. 10 in B-flat major, K. 361 Gran Partita'], (SELECT id FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트' LIMIT 1), 'classical', true, false, false, 'Winds', 50)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Beethoven (베토벤) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
-- Symphonies
('교향곡 제1번 C장조 Op.21', ARRAY['Symphony No. 1 in C major, Op. 21'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 28),
('교향곡 제2번 D장조 Op.36', ARRAY['Symphony No. 2 in D major, Op. 36'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 33),
('교향곡 제3번 E플랫장조 Op.55 영웅', ARRAY['Symphony No. 3 in E-flat major, Op. 55 Eroica'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 50),
('교향곡 제4번 B플랫장조 Op.60', ARRAY['Symphony No. 4 in B-flat major, Op. 60'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 35),
('교향곡 제5번 c단조 Op.67 운명', ARRAY['Symphony No. 5 in C minor, Op. 67 Fate'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 33),
('교향곡 제6번 F장조 Op.68 전원', ARRAY['Symphony No. 6 in F major, Op. 68 Pastoral'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 40),
('교향곡 제7번 A장조 Op.92', ARRAY['Symphony No. 7 in A major, Op. 92'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 38),
('교향곡 제8번 F장조 Op.93', ARRAY['Symphony No. 8 in F major, Op. 93'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 26),
('교향곡 제9번 d단조 Op.125 합창', ARRAY['Symphony No. 9 in D minor, Op. 125 Choral'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra, Choir, Soloists', 70),
-- Piano Concertos
('피아노 협주곡 제1번 C장조 Op.15', ARRAY['Piano Concerto No. 1 in C major, Op. 15'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 35),
('피아노 협주곡 제2번 B플랫장조 Op.19', ARRAY['Piano Concerto No. 2 in B-flat major, Op. 19'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 28),
('피아노 협주곡 제3번 c단조 Op.37', ARRAY['Piano Concerto No. 3 in C minor, Op. 37'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 37),
('피아노 협주곡 제4번 G장조 Op.58', ARRAY['Piano Concerto No. 4 in G major, Op. 58'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 34),
('피아노 협주곡 제5번 E플랫장조 Op.73 황제', ARRAY['Piano Concerto No. 5 in E-flat major, Op. 73 Emperor'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Piano, Orchestra', 38),
-- Violin Concerto
('바이올린 협주곡 D장조 Op.61', ARRAY['Violin Concerto in D major, Op. 61'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Violin, Orchestra', 42),
('삼중 협주곡 C장조 Op.56', ARRAY['Triple Concerto in C major, Op. 56'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Piano, Violin, Cello, Orchestra', 36),
-- Piano Sonatas
('피아노 소나타 제8번 c단조 Op.13 비창', ARRAY['Piano Sonata No. 8 in C minor, Op. 13 Pathétique'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 20),
('피아노 소나타 제14번 c#단조 Op.27-2 월광', ARRAY['Piano Sonata No. 14 in C-sharp minor, Op. 27 No. 2 Moonlight'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 16),
('피아노 소나타 제17번 d단조 Op.31-2 템페스트', ARRAY['Piano Sonata No. 17 in D minor, Op. 31 No. 2 Tempest'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 24),
('피아노 소나타 제21번 C장조 Op.53 발트슈타인', ARRAY['Piano Sonata No. 21 in C major, Op. 53 Waldstein'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 26),
('피아노 소나타 제23번 f단조 Op.57 열정', ARRAY['Piano Sonata No. 23 in F minor, Op. 57 Appassionata'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 24),
('피아노 소나타 제26번 E플랫장조 Op.81a 고별', ARRAY['Piano Sonata No. 26 in E-flat major, Op. 81a Les Adieux'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 18),
('피아노 소나타 제29번 B플랫장조 Op.106 함머클라비어', ARRAY['Piano Sonata No. 29 in B-flat major, Op. 106 Hammerklavier'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 45),
('피아노 소나타 제30번 E장조 Op.109', ARRAY['Piano Sonata No. 30 in E major, Op. 109'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 18),
('피아노 소나타 제31번 A플랫장조 Op.110', ARRAY['Piano Sonata No. 31 in A-flat major, Op. 110'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 20),
('피아노 소나타 제32번 c단조 Op.111', ARRAY['Piano Sonata No. 32 in C minor, Op. 111'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 28),
-- String Quartets
('현악 사중주 제1번 F장조 Op.18-1', ARRAY['String Quartet No. 1 in F major, Op. 18 No. 1'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 27),
('현악 사중주 제2번 G장조 Op.18-2', ARRAY['String Quartet No. 2 in G major, Op. 18 No. 2'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 22),
('현악 사중주 제3번 D장조 Op.18-3', ARRAY['String Quartet No. 3 in D major, Op. 18 No. 3'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 24),
('현악 사중주 제4번 c단조 Op.18-4', ARRAY['String Quartet No. 4 in C minor, Op. 18 No. 4'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 23),
('현악 사중주 제5번 A장조 Op.18-5', ARRAY['String Quartet No. 5 in A major, Op. 18 No. 5'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 26),
('현악 사중주 제6번 B플랫장조 Op.18-6', ARRAY['String Quartet No. 6 in B-flat major, Op. 18 No. 6'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 24),
('현악 사중주 제7번 F장조 Op.59-1 라주모프스키 제1번', ARRAY['String Quartet No. 7 in F major, Op. 59 No. 1 Razumovsky No. 1'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 38),
('현악 사중주 제8번 e단조 Op.59-2 라주모프스키 제2번', ARRAY['String Quartet No. 8 in E minor, Op. 59 No. 2 Razumovsky No. 2'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 33),
('현악 사중주 제9번 C장조 Op.59-3 라주모프스키 제3번', ARRAY['String Quartet No. 9 in C major, Op. 59 No. 3 Razumovsky No. 3'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 30),
('현악 사중주 제10번 E플랫장조 Op.74 하프', ARRAY['String Quartet No. 10 in E-flat major, Op. 74 Harp'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 30),
('현악 사중주 제11번 f단조 Op.95 세리오소', ARRAY['String Quartet No. 11 in F minor, Op. 95 Serioso'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 22),
('현악 사중주 제12번 E플랫장조 Op.127', ARRAY['String Quartet No. 12 in E-flat major, Op. 127'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 35),
('현악 사중주 제13번 B플랫장조 Op.130', ARRAY['String Quartet No. 13 in B-flat major, Op. 130'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 40),
('현악 사중주 제14번 c#단조 Op.131', ARRAY['String Quartet No. 14 in C-sharp minor, Op. 131'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 40),
('현악 사중주 제15번 a단조 Op.132', ARRAY['String Quartet No. 15 in A minor, Op. 132'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 42),
('현악 사중주 제16번 F장조 Op.135', ARRAY['String Quartet No. 16 in F major, Op. 135'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 24),
('대푸가 B플랫장조 Op.133', ARRAY['Grosse Fuge in B-flat major, Op. 133'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quartet', 16),
-- Other chamber
('피아노 3중주 제7번 B플랫장조 Op.97 대공', ARRAY['Piano Trio No. 7 in B-flat major, Op. 97 Archduke'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'Piano, Violin, Cello', 38),
('피아노 3중주 제5번 D장조 Op.70-1 유령', ARRAY['Piano Trio No. 5 in D major, Op. 70 No. 1 Ghost'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'Piano, Violin, Cello', 27),
('현악 5중주 C장조 Op.29', ARRAY['String Quintet in C major, Op. 29'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'String Quintet', 30),
('바이올린 소나타 제5번 F장조 Op.24 봄', ARRAY['Violin Sonata No. 5 in F major, Op. 24 Spring'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'Violin, Piano', 24),
('바이올린 소나타 제9번 A장조 Op.47 크로이처', ARRAY['Violin Sonata No. 9 in A major, Op. 47 Kreutzer'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'Violin, Piano', 38),
('첼로 소나타 제3번 A장조 Op.69', ARRAY['Cello Sonata No. 3 in A major, Op. 69'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, true, false, 'Cello, Piano', 25),
-- Other
('디아벨리 변주곡 Op.120', ARRAY['Diabelli Variations, Op. 120'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', false, false, true, 'Piano', 50),
('장엄미사 D장조 Op.123', ARRAY['Missa Solemnis in D major, Op. 123'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra, Choir, Soloists', 80),
('피델리오 Op.72', ARRAY['Fidelio, Op. 72'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Opera Orchestra, Soloists, Choir', 130),
('에그몬트 서곡 Op.84', ARRAY['Egmont Overture, Op. 84'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 9),
('레오노레 서곡 제3번 Op.72b', ARRAY['Leonore Overture No. 3, Op. 72b'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 14),
('코리올란 서곡 Op.62', ARRAY['Coriolan Overture, Op. 62'], (SELECT id FROM composers WHERE name_ko = '루드비히 판 베토벤' LIMIT 1), 'classical', true, false, false, 'Orchestra', 8)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Haydn (하이든) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
-- Symphonies
('교향곡 제45번 f#단조 고별', ARRAY['Symphony No. 45 in F-sharp minor Farewell'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 26),
('교향곡 제82번 C장조 곰', ARRAY['Symphony No. 82 in C major The Bear'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 24),
('교향곡 제83번 g단조 암탉', ARRAY['Symphony No. 83 in G minor The Hen'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 24),
('교향곡 제85번 B플랫장조 여왕', ARRAY['Symphony No. 85 in B-flat major La Reine'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 24),
('교향곡 제88번 G장조', ARRAY['Symphony No. 88 in G major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 24),
('교향곡 제92번 G장조 옥스퍼드', ARRAY['Symphony No. 92 in G major Oxford'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 26),
('교향곡 제94번 G장조 놀람', ARRAY['Symphony No. 94 in G major Surprise'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 24),
('교향곡 제100번 G장조 군대', ARRAY['Symphony No. 100 in G major Military'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 26),
('교향곡 제101번 D장조 시계', ARRAY['Symphony No. 101 in D major The Clock'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 28),
('교향곡 제103번 E플랫장조 팀파니 연타', ARRAY['Symphony No. 103 in E-flat major Drumroll'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 28),
('교향곡 제104번 D장조 런던', ARRAY['Symphony No. 104 in D major London'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra', 28),
-- String Quartets
('현악 사중주 Op.33 제2번 E플랫장조 농담', ARRAY['String Quartet Op. 33 No. 2 The Joke'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 18),
('현악 사중주 Op.33 제3번 C장조 새', ARRAY['String Quartet Op. 33 No. 3 The Bird'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 20),
('현악 사중주 Op.64 제5번 D장조 종달새', ARRAY['String Quartet Op. 64 No. 5 The Lark'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 20),
('현악 사중주 Op.76 제1번 G장조', ARRAY['String Quartet Op. 76 No. 1 in G major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 24),
('현악 사중주 Op.76 제2번 d단조 5도', ARRAY['String Quartet Op. 76 No. 2 Fifths'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 22),
('현악 사중주 Op.76 제3번 C장조 황제', ARRAY['String Quartet Op. 76 No. 3 Emperor'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 25),
('현악 사중주 Op.76 제4번 B플랫장조 일출', ARRAY['String Quartet Op. 76 No. 4 Sunrise'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 22),
('현악 사중주 Op.76 제5번 D장조', ARRAY['String Quartet Op. 76 No. 5 in D major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 22),
('현악 사중주 Op.76 제6번 E플랫장조', ARRAY['String Quartet Op. 76 No. 6 in E-flat major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 20),
('현악 사중주 Op.77 제1번 G장조', ARRAY['String Quartet Op. 77 No. 1 in G major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 24),
('현악 사중주 Op.77 제2번 F장조', ARRAY['String Quartet Op. 77 No. 2 in F major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'String Quartet', 23),
-- Concertos
('첼로 협주곡 제1번 C장조', ARRAY['Cello Concerto No. 1 in C major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Cello, Orchestra', 25),
('첼로 협주곡 제2번 D장조', ARRAY['Cello Concerto No. 2 in D major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Cello, Orchestra', 25),
('트럼펫 협주곡 E플랫장조', ARRAY['Trumpet Concerto in E-flat major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Trumpet, Orchestra', 15),
-- Other
('천지창조', ARRAY['The Creation', 'Die Schöpfung'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra, Choir, Soloists', 100),
('사계', ARRAY['The Seasons', 'Die Jahreszeiten'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', true, false, false, 'Orchestra, Choir, Soloists', 120),
('피아노 소나타 제52번 E플랫장조', ARRAY['Piano Sonata No. 52 in E-flat major'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, false, true, 'Piano', 20),
('피아노 3중주 제39번 G장조 집시', ARRAY['Piano Trio No. 39 in G major Gypsy'], (SELECT id FROM composers WHERE name_ko = '프란츠 요제프 하이든' LIMIT 1), 'classical', false, true, false, 'Piano, Violin, Cello', 18)
ON CONFLICT (composer_id, title) DO NOTHING;


-- ============================================================
-- ROMANTIC (400 pieces)
-- ============================================================

-- === Schubert (슈베르트) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제8번 b단조 D.759 미완성', ARRAY['Symphony No. 8 in B minor, D. 759 Unfinished'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 25),
('교향곡 제9번 C장조 D.944 더 그레이트', ARRAY['Symphony No. 9 in C major, D. 944 The Great'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 55),
('피아노 소나타 제16번 a단조 D.845', ARRAY['Piano Sonata No. 16 in A minor, D. 845'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 35),
('피아노 소나타 제17번 D장조 D.850', ARRAY['Piano Sonata No. 17 in D major, D. 850'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 40),
('피아노 소나타 제18번 G장조 D.894', ARRAY['Piano Sonata No. 18 in G major, D. 894'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 40),
('피아노 소나타 제19번 c단조 D.958', ARRAY['Piano Sonata No. 19 in C minor, D. 958'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 32),
('피아노 소나타 제20번 A장조 D.959', ARRAY['Piano Sonata No. 20 in A major, D. 959'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 38),
('피아노 소나타 제21번 B플랫장조 D.960', ARRAY['Piano Sonata No. 21 in B-flat major, D. 960'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 40),
('현악 사중주 제14번 d단조 D.810 죽음과 소녀', ARRAY['String Quartet No. 14 in D minor, D. 810 Death and the Maiden'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 40),
('현악 사중주 제15번 G장조 D.887', ARRAY['String Quartet No. 15 in G major, D. 887'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 50),
('피아노 5중주 A장조 D.667 송어', ARRAY['Piano Quintet in A major, D. 667 Trout'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Piano, Violin, Viola, Cello, Double Bass', 38),
('현악 5중주 C장조 D.956', ARRAY['String Quintet in C major, D. 956'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'String Quintet', 50),
('피아노 3중주 제1번 B플랫장조 D.898', ARRAY['Piano Trio No. 1 in B-flat major, D. 898'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Piano, Violin, Cello', 38),
('피아노 3중주 제2번 E플랫장조 D.929', ARRAY['Piano Trio No. 2 in E-flat major, D. 929'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Piano, Violin, Cello', 43),
('바이올린 소나타 A장조 D.574', ARRAY['Violin Sonata in A major, D. 574'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Violin, Piano', 22),
('아르페지오네 소나타 a단조 D.821', ARRAY['Arpeggione Sonata in A minor, D. 821'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Cello/Viola, Piano', 25),
('겨울 나그네 D.911', ARRAY['Winterreise, D. 911', 'Winter Journey'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Voice, Piano', 72),
('아름다운 물방앗간 아가씨 D.795', ARRAY['Die schöne Müllerin, D. 795', 'The Beautiful Miller''s Daughter'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Voice, Piano', 62),
('백조의 노래 D.957', ARRAY['Schwanengesang, D. 957', 'Swan Song'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Voice, Piano', 50),
('즉흥곡 Op.90 D.899', ARRAY['Impromptus, Op. 90, D. 899'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 30),
('즉흥곡 Op.142 D.935', ARRAY['Impromptus, Op. 142, D. 935'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 35),
('방랑자 환상곡 C장조 D.760', ARRAY['Wanderer Fantasy in C major, D. 760'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, false, true, 'Piano', 22),
('현악 사중주 제13번 a단조 D.804 로자문데', ARRAY['String Quartet No. 13 in A minor, D. 804 Rosamunde'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 33),
('8중주 F장조 D.803', ARRAY['Octet in F major, D. 803'], (SELECT id FROM composers WHERE name_ko = '프란츠 슈베르트' LIMIT 1), 'romantic', false, true, false, 'Clarinet, Bassoon, Horn, 2 Violins, Viola, Cello, Double Bass', 60)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Mendelssohn (멘델스존) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제3번 a단조 Op.56 스코틀랜드', ARRAY['Symphony No. 3 in A minor, Op. 56 Scottish'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 38),
('교향곡 제4번 A장조 Op.90 이탈리아', ARRAY['Symphony No. 4 in A major, Op. 90 Italian'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 28),
('교향곡 제5번 d단조 Op.107 종교개혁', ARRAY['Symphony No. 5 in D minor, Op. 107 Reformation'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 30),
('바이올린 협주곡 e단조 Op.64', ARRAY['Violin Concerto in E minor, Op. 64'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Violin, Orchestra', 28),
('피아노 협주곡 제1번 g단조 Op.25', ARRAY['Piano Concerto No. 1 in G minor, Op. 25'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Piano, Orchestra', 22),
('피아노 협주곡 제2번 d단조 Op.40', ARRAY['Piano Concerto No. 2 in D minor, Op. 40'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Piano, Orchestra', 24),
('현악 4중주 제1번 E플랫장조 Op.12', ARRAY['String Quartet No. 1 in E-flat major, Op. 12'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 22),
('현악 4중주 제2번 a단조 Op.13', ARRAY['String Quartet No. 2 in A minor, Op. 13'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 28),
('현악 4중주 Op.44 제1번 D장조', ARRAY['String Quartet Op. 44 No. 1 in D major'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 28),
('현악 4중주 Op.44 제2번 e단조', ARRAY['String Quartet Op. 44 No. 2 in E minor'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 26),
('현악 4중주 Op.44 제3번 E플랫장조', ARRAY['String Quartet Op. 44 No. 3 in E-flat major'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 28),
('현악 4중주 제6번 f단조 Op.80', ARRAY['String Quartet No. 6 in F minor, Op. 80'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 25),
('피아노 3중주 제1번 d단조 Op.49', ARRAY['Piano Trio No. 1 in D minor, Op. 49'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'Piano, Violin, Cello', 28),
('피아노 3중주 제2번 c단조 Op.66', ARRAY['Piano Trio No. 2 in C minor, Op. 66'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'Piano, Violin, Cello', 30),
('팔중주 E플랫장조 Op.20', ARRAY['Octet in E-flat major, Op. 20'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, true, false, 'String Octet', 33),
('한여름 밤의 꿈 Op.61', ARRAY['A Midsummer Night''s Dream, Op. 61'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 45),
('핑갈의 동굴 서곡 Op.26', ARRAY['The Hebrides Overture, Op. 26', 'Fingal''s Cave'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 11),
('엘리야 Op.70', ARRAY['Elijah, Op. 70'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', true, false, false, 'Orchestra, Choir, Soloists', 130),
('무언가 전곡', ARRAY['Songs Without Words', 'Lieder ohne Worte'], (SELECT id FROM composers WHERE name_ko = '펠릭스 멘델스존' LIMIT 1), 'romantic', false, false, true, 'Piano', 120)
ON CONFLICT (composer_id, title) DO NOTHING;

-- === Schumann (슈만) ===
INSERT INTO pieces (title, alternative_titles, composer_id, period, is_orchestral, is_chamber, is_solo, instrumentation, duration_minutes)
VALUES
('교향곡 제1번 B플랫장조 Op.38 봄', ARRAY['Symphony No. 1 in B-flat major, Op. 38 Spring'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 32),
('교향곡 제2번 C장조 Op.61', ARRAY['Symphony No. 2 in C major, Op. 61'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 38),
('교향곡 제3번 E플랫장조 Op.97 라인', ARRAY['Symphony No. 3 in E-flat major, Op. 97 Rhenish'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 33),
('교향곡 제4번 d단조 Op.120', ARRAY['Symphony No. 4 in D minor, Op. 120'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', true, false, false, 'Orchestra', 28),
('피아노 협주곡 a단조 Op.54', ARRAY['Piano Concerto in A minor, Op. 54'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', true, false, false, 'Piano, Orchestra', 31),
('첼로 협주곡 a단조 Op.129', ARRAY['Cello Concerto in A minor, Op. 129'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', true, false, false, 'Cello, Orchestra', 24),
('피아노 소나타 제1번 f#단조 Op.11', ARRAY['Piano Sonata No. 1 in F-sharp minor, Op. 11'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 30),
('피아노 소나타 제2번 g단조 Op.22', ARRAY['Piano Sonata No. 2 in G minor, Op. 22'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 22),
('피아노 소나타 제3번 f단조 Op.14', ARRAY['Piano Sonata No. 3 in F minor, Op. 14'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 28),
('어린이 정경 Op.15', ARRAY['Kinderszenen, Op. 15', 'Scenes from Childhood', 'Träumerei'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 20),
('크라이슬레리아나 Op.16', ARRAY['Kreisleriana, Op. 16'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 30),
('카니발 Op.9', ARRAY['Carnaval, Op. 9'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 28),
('교향적 연습곡 Op.13', ARRAY['Symphonic Études, Op. 13'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 27),
('환상곡 C장조 Op.17', ARRAY['Fantasy in C major, Op. 17'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, false, true, 'Piano', 32),
('현악 4중주 제1번 a단조 Op.41-1', ARRAY['String Quartet No. 1 in A minor, Op. 41 No. 1'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 26),
('현악 4중주 제2번 F장조 Op.41-2', ARRAY['String Quartet No. 2 in F major, Op. 41 No. 2'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 24),
('현악 4중주 제3번 A장조 Op.41-3', ARRAY['String Quartet No. 3 in A major, Op. 41 No. 3'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'String Quartet', 28),
('피아노 4중주 E플랫장조 Op.47', ARRAY['Piano Quartet in E-flat major, Op. 47'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'Piano, Violin, Viola, Cello', 30),
('피아노 5중주 E플랫장조 Op.44', ARRAY['Piano Quintet in E-flat major, Op. 44'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'Piano, String Quartet', 30),
('시인의 사랑 Op.48', ARRAY['Dichterliebe, Op. 48', 'A Poet''s Love'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'Voice, Piano', 28),
('여인의 사랑과 생애 Op.42', ARRAY['Frauenliebe und -leben, Op. 42', 'A Woman''s Love and Life'], (SELECT id FROM composers WHERE name_ko = '로베르트 슈만' LIMIT 1), 'romantic', false, true, false, 'Voice, Piano', 22)
ON CONFLICT (composer_id, title) DO NOTHING;

