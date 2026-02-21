import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TUTTI - 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-black text-accent">TUTTI</Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-medium text-gray-600">개인정보처리방침</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <p className="text-xs text-gray-400 mb-4">시행일: 2026년 2월 19일</p>
            <p>
              TUTTI(이하 &ldquo;서비스&rdquo;)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를
              보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여
              다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
          </div>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">1. 수집하는 개인정보 항목</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>필수:</strong> 이메일 주소, 비밀번호(암호화 저장)</li>
              <li><strong>선택:</strong> 닉네임(활동명), 연주 악기, 실력 수준, 활동 지역, 자기소개, 공고 관련 이미지 (사진 파일)</li>
              <li><strong>자동 수집:</strong> 서비스 이용 기록, 접속 로그</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">2. 개인정보의 수집·이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 가입 및 관리 (본인 확인, 계정 운영)</li>
              <li>서비스 제공 (연주자 매칭, 공고 등록·지원, 채팅, 공고 이미지 게시)</li>
              <li>서비스 개선 및 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              회원 탈퇴 시까지 보유하며, 탈퇴 즉시 지체 없이 파기합니다.
              단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">이미지 데이터 처리</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>이용자가 공고에 업로드하는 이미지는 서비스 제공 목적으로만 사용되며, 회원 탈퇴 또는 공고 삭제 시 함께 파기됩니다.</li>
              <li>이미지 파일에 포함될 수 있는 EXIF 메타데이터(촬영 위치, 기기 정보 등)는 현재 자동으로 제거되지 않습니다. 민감한 위치 정보가 포함된 사진 업로드 시 이용자의 주의가 필요합니다.</li>
              <li>향후 EXIF 메타데이터 자동 제거 기능을 도입할 예정입니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">4. 개인정보의 제3자 제공</h2>
            <p>원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">5. 개인정보 처리 위탁</h2>
            <table className="w-full border border-gray-200 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left">수탁업체</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Supabase Inc.</td>
                  <td className="border border-gray-200 px-3 py-2">데이터 저장 및 인증 처리</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">6. 정보주체의 권리·의무 및 행사 방법</h2>
            <p>
              이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며,
              회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.
              프로필 페이지에서 직접 처리하거나, 아래 연락처로 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">7. 개인정보의 안전성 확보 조치</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>비밀번호 암호화 저장</li>
              <li>HTTPS를 통한 데이터 전송 암호화</li>
              <li>Row Level Security(RLS)를 통한 데이터 접근 제어</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">8. 개인정보 보호책임자</h2>
            <p>문의: tutti.app.contact@gmail.com</p>
          </section>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              본 방침은 MVP 단계의 초안이며, 서비스 정식 출시 전 법률 전문가의 검토를 거칠 예정입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
