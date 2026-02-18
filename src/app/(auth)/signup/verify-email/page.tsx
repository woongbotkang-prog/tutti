export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">📬</div>
      <h1 className="text-2xl font-black text-gray-900">이메일을 확인해 주세요</h1>
      <p className="text-gray-500 text-sm leading-relaxed">
        <strong className="text-gray-900">{searchParams.email}</strong>으로<br />
        인증 링크를 보냈어요.<br />
        링크를 클릭하면 가입이 완료됩니다.
      </p>
      <div className="bg-indigo-50 rounded-2xl p-4 text-sm text-indigo-700">
        📌 이메일이 보이지 않으면 스팸함을 확인해 주세요
      </div>
    </div>
  )
}
