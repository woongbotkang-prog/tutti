# TUTTI 버전 히스토리

각 버전은 Git 태그로 관리됩니다. 아침에 특정 버전이 더 좋다 싶으면 아래 명령어로 롤백하세요.

---

## 버전 목록

| 버전 | 날짜 | 설명 |
|------|------|------|
| `v1` | 2026-02-19 | Sprint 1~4 완료 + UX 개선 (소셜 로그인 에러 처리, 아이콘 교체, 빈 상태 안내) |

---

## 롤백 방법

### 방법 1: 특정 버전 확인만 하기 (코드 안 바꿈)
```bash
cd ~/Projects/tutti
git checkout v1          # v1 코드로 이동 (브랜치 아님, detached HEAD)
npm run dev              # v1 상태로 실행해서 확인
git checkout main        # 다시 최신으로 돌아오기
```

### 방법 2: 완전 롤백 (v1으로 되돌리기)
```bash
cd ~/Projects/tutti
git checkout main
git reset --hard v1      # 로컬을 v1으로 완전 되돌리기
git push --force-with-lease origin main   # 원격도 되돌리기
```

### 방법 3: v1 기반으로 새 브랜치 만들기 (안전한 방법)
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
- 큰 변화(스프린트 완료 등)는 별도 설명 포함

```bash
# 태그 목록 보기
git tag -l

# 특정 태그 상세 보기
git show v1
```
