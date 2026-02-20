# Supabase 이메일 템플릿 한국어

설정 위치: Supabase Dashboard → Authentication → Email Templates

---

## 1. Confirm signup (회원가입 인증)

**Subject:**
```
TUTTI - 이메일 인증을 완료해주세요
```

**Body (HTML):**
```html
<h2>TUTTI에 오신 것을 환영합니다! 🎵</h2>
<p>아래 버튼을 눌러 이메일 인증을 완료해주세요.</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display:inline-block; padding:12px 32px; background:#4f46e5; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">
    이메일 인증하기
  </a>
</p>
<p style="color:#999; font-size:13px; margin-top:24px;">
  본인이 가입하지 않았다면 이 메일을 무시하셔도 됩니다.
</p>
```

---

## 2. Magic Link (매직 링크)

**Subject:**
```
TUTTI - 로그인 링크
```

**Body (HTML):**
```html
<h2>TUTTI 로그인 🎶</h2>
<p>아래 버튼을 눌러 로그인하세요.</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display:inline-block; padding:12px 32px; background:#4f46e5; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">
    로그인하기
  </a>
</p>
<p style="color:#999; font-size:13px; margin-top:24px;">
  본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.
</p>
```

---

## 3. Reset Password (비밀번호 재설정)

**Subject:**
```
TUTTI - 비밀번호 재설정
```

**Body (HTML):**
```html
<h2>비밀번호 재설정 🔑</h2>
<p>아래 버튼을 눌러 새 비밀번호를 설정해주세요.</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display:inline-block; padding:12px 32px; background:#4f46e5; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">
    비밀번호 재설정하기
  </a>
</p>
<p style="color:#999; font-size:13px; margin-top:24px;">
  본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.<br/>
  이 링크는 24시간 후 만료됩니다.
</p>
```

---

## 4. Change Email (이메일 변경)

**Subject:**
```
TUTTI - 이메일 변경 확인
```

**Body (HTML):**
```html
<h2>이메일 변경 확인 ✉️</h2>
<p>아래 버튼을 눌러 새 이메일 주소를 확인해주세요.</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display:inline-block; padding:12px 32px; background:#4f46e5; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">
    이메일 변경 확인하기
  </a>
</p>
<p style="color:#999; font-size:13px; margin-top:24px;">
  본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.
</p>
```

---

## 적용 방법
1. https://supabase.com/dashboard → 프로젝트 선택
2. Authentication → Email Templates
3. 각 템플릿의 Subject와 Body를 위 내용으로 교체
4. Save
