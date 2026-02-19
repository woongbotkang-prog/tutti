# TUTTI 버전 히스토리

각 버전은 Git 태그로 관리됩니다. 아침에 특정 버전이 더 좋다 싶으면 아래 명령어로 롤백하세요.

---

## 버전 목록

| 버전 | 날짜 | 설명 |
|------|------|------|
| `v1` | 2026-02-19 | Sprint 1~4 완료 + UX 개선 기준점 (소셜 로그인 에러 처리, 아이콘 교체) |
| `v2` | 2026-02-19 | 타입 안전성 개선, 지원 성공 배너 추가 |
| `v3` | 2026-02-19 | 공고 작성자 패널 신설, 지원자 수락/거절/마감 버튼 |
| `v4` | 2026-02-19 | 지원 수락 시 채팅방 자동 생성 |
| `v5` | 2026-02-19 | 공고 수정 페이지(/gigs/[id]/edit), 채팅 바로가기, 미들웨어 보호 |
| `v6` | 2026-02-19 | 프로필 내 공고 목록, 알림 페이지(/notifications) 신설 |
| `v7` | 2026-02-19 | 알림 트리거 연결 (지원/수락/거절 시 알림 생성) |
| `v8` | 2026-02-19 | 마감 공고 만료(expires_at) 처리, 더블클릭 가드 |
| `v9` | 2026-02-19 | 홈 최신 공고 실데이터, 마감 뱃지 시각 구분 |
| `v10` | 2026-02-19 | fetchGigs includeExpired 옵션, 홈 빈 상태 처리 |
| `v11` | 2026-02-19 | 에러 경계(error.tsx), 커스텀 404(not-found.tsx) |
| `v12` | 2026-02-19 | GigListItem 타입 동기화, SEO 메타데이터, 로딩 스켈레톤 |
| `v13` | 2026-02-19 | 깨진 링크 수정(/gigs/create→/gigs/new), status 이중 체크, 채팅방 직접 이동 |
| `v14` | 2026-02-19 | 채팅방 ID 조회 버그, 마감 공고 배너 추가 |
| `v15` | 2026-02-19 | 개인정보처리방침(/privacy), 회원탈퇴, PIPA 준수 |
| `v16` | 2026-02-19 | 이용약관(/terms), 서버사이드 회원탈퇴 API |
| `v17` | 2026-02-19 | Cycle 17 최종 — 법적 준수 완료 |
| `v18` | 2026-02-19 | 🎼 곡 기반 프로젝트 모집 기능 (is_project 탭, piece_name) |
| `v19` | 2026-02-19 | 회원가입 오류 수정, 온보딩 플로우 추가, 워딩 변경 |
| `v20` | 2026-02-19 | **로그인/회원가입 에러 처리 강화** (이메일 미인증 감지, 비밀번호 검증, 구체적 메시지) |
| `v21` | 2026-02-19 | Fix fetch error - window.location.origin 안전 처리, 디버그 엔드포인트 추가 |
| `v22` | 2026-02-19 | **🔧 회원가입 수정 완료** (user_profiles 트리거, RLS INSERT 정책, emailRedirectTo 제거) |

---

## 롤백 방법

### 방법 1: 특정 버전 확인만 하기 (코드 안 바꿈)
```bash
cd ~/Projects/tutti
git checkout v1          # v1 코드로 이동 (브랜치 아님, detached HEAD)
npm run dev              # v1 상태로 실행해서 확인
git checkout main        # 다시 최신으로 돌아오기
```

### 방법 2: 완전 롤백 (특정 버전으로 되돌리기)
```bash
cd ~/Projects/tutti
git checkout main
git reset --hard v1      # 로컬을 v1으로 완전 되돌리기
git push --force-with-lease origin main   # 원격도 되돌리기
```

### 방법 3: 특정 버전 기반으로 새 브랜치 만들기 (안전한 방법)
```bash
cd ~/Projects/tutti
git checkout -b rollback-v1 v1   # v1에서 새 브랜치 생성
npm run dev                       # 테스트
# 마음에 들면: git checkout main && git reset --hard rollback-v1
```

---

## 버전 태그 규칙

- 각 Cycle (회의체 검토 후 수정 완료) 마다 태그 생성
- 네이밍: `v1`, `v2`, `v3`, ...

```bash
# 태그 목록 보기
git tag -l

# 특정 태그 상세 보기
git show v14
```
