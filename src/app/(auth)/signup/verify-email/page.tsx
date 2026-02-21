import Link from 'next/link'

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  return (
    <div className="text-center space-y-6">
      {/* 아이콘 */}
      <div className="mx-auto w-16 h-16 rounded-full bg-cream flex items-center justify-center">
        <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      {/* 제목 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-gray-900">이메일을 확인해 주세요</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          {searchParams.email ? (
            <>
              <strong className="text-gray-900">{searchParams.email}</strong>으로<br />
            </>
          ) : null}
          인증 링크를 보냈어요.<br />
          링크를 클릭하면 가입이 완료됩니다.
        </p>
      </div>

      {/* 안내 카드 */}
      <div className="bg-gray-50 rounded-2xl p-4 text-sm text-left space-y-3">
        <div className="flex items-start gap-2.5">
          <span className="text-base leading-5 shrink-0">1.</span>
          <p className="text-gray-600">
            이메일 앱에서 <strong className="text-gray-900">TUTTI 인증 메일</strong>을 찾아 주세요
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="text-base leading-5 shrink-0">2.</span>
          <p className="text-gray-600">
            메일 안의 <strong className="text-gray-900">인증 링크</strong>를 클릭해 주세요
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="text-base leading-5 shrink-0">3.</span>
          <p className="text-gray-600">
            자동으로 로그인되며 서비스를 이용할 수 있어요
          </p>
        </div>
      </div>

      {/* 스팸함 안내 */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">메일이 안 보이나요?</p>
        <ul className="text-left space-y-1 text-amber-700">
          <li>- <strong>스팸함</strong> 또는 <strong>프로모션 탭</strong>을 확인해 주세요</li>
          <li>- 발신자가 <strong>noreply@mail.app.supabase.io</strong>일 수 있어요</li>
          <li>- 몇 분 정도 걸릴 수 있으니 잠시 기다려 주세요</li>
        </ul>
      </div>

      {/* 이동 버튼 */}
      <div className="space-y-3 pt-2">
        <Link
          href="/login"
          className="block w-full h-12 rounded-xl bg-ink text-white font-semibold text-base flex items-center justify-center hover:bg-ink-light transition-colors"
        >
          로그인 페이지로 이동
        </Link>
        <Link
          href="/"
          className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
