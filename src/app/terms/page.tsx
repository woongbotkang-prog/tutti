import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TUTTI - 이용약관',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-black text-accent">TUTTI</Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-medium text-gray-600">이용약관</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 text-sm text-gray-700 leading-relaxed">
          <div>
            <p className="text-xs text-gray-400 mb-4">시행일: 2026년 2월 19일</p>
            <p>
              본 약관은 TUTTI(이하 &ldquo;서비스&rdquo;)의 이용 조건과 운영에 관한 제반 사항을 규정합니다.
              서비스를 이용함으로써 본 약관에 동의하는 것으로 간주합니다.
            </p>
          </div>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">1. 서비스 목적</h2>
            <p>
              TUTTI는 클래식 연주자 간의 매칭(구인·구직)을 지원하는 플랫폼입니다.
              개인 연주자와 단체가 서로를 찾고 연결될 수 있도록 돕습니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">2. 이용 자격</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>만 14세 이상의 개인 또는 적법하게 설립된 단체</li>
              <li>회원가입 시 정확한 정보를 제공해야 합니다</li>
              <li>1인 1계정 원칙</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">3. 금지 행위</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>허위 정보 등록 또는 타인의 정보를 도용하는 행위</li>
              <li>서비스를 이용한 영리 목적의 스팸, 광고 행위</li>
              <li>다른 이용자에 대한 욕설, 비방, 괴롭힘</li>
              <li>서비스의 정상적 운영을 방해하는 행위</li>
              <li>관련 법령을 위반하는 일체의 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">4. 지적재산권</h2>
            <p>
              서비스에 포함된 디자인, 로고, 기술 등은 운영자에게 귀속됩니다.
              이용자가 작성한 공고, 프로필 등의 콘텐츠에 대한 권리는 해당 이용자에게 있으며,
              서비스 운영 목적으로 플랫폼 내 노출에 동의하는 것으로 간주합니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">5. 책임 제한</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스는 이용자 간 연결을 중개하며, 연주 활동 자체에 대한 책임을 지지 않습니다.</li>
              <li>이용자 간 분쟁에 대해 서비스는 개입 의무가 없으나, 원활한 해결을 위해 협조할 수 있습니다.</li>
              <li>천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">6. 서비스 변경 및 종료</h2>
            <p>
              운영자는 서비스를 변경하거나 종료할 수 있으며,
              중요한 변경 사항은 서비스 내 공지를 통해 사전에 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제7조 (사진 업로드 및 콘텐츠 관리)</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                이용자가 서비스에 업로드하는 사진, 이미지 및 기타 콘텐츠에 대한 저작권, 초상권 등 모든 법적 책임은 해당 콘텐츠를 게시한 이용자에게 있습니다.
              </li>
              <li>
                이용자는 타인의 초상, 저작물, 악보 등 권리가 포함된 콘텐츠를 권리자의 사전 동의 없이 업로드할 수 없습니다.
              </li>
              <li>
                회사는 이용자가 게시한 콘텐츠를 사전에 심사할 의무를 지지 않으며, 이용자가 게시한 콘텐츠로 인해 발생하는 법적 분쟁에 대해 책임을 지지 않습니다.
              </li>
              <li>
                정보통신망 이용촉진 및 정보보호 등에 관한 법률 제44조의2에 따라, 권리를 침해당한 자는 해당 콘텐츠의 삭제 또는 임시조치를 요청할 수 있습니다.
                <p className="mt-1 font-medium text-gray-900">신고 접수: report@tutti.kr</p>
              </li>
              <li>
                회사는 삭제 또는 임시조치 요청을 접수한 경우, 지체 없이 해당 콘텐츠에 대한 접근을 차단하거나 삭제하는 등 필요한 조치를 취합니다.
              </li>
              <li>
                임시조치 기간은 최대 30일로 하며, 해당 기간 내에 당사자 간 합의가 이루어지지 않는 경우 관련 법령에 따라 처리합니다.
              </li>
              <li>
                <p className="text-red-700 font-medium bg-red-50 rounded-lg px-3 py-2">
                  특히 악보, 음원 등 음악 저작물은 저작권법에 의해 강력히 보호되므로, 권리자의 허락 없는 업로드는 민·형사상 책임을 수반할 수 있습니다.
                </p>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">8. 약관의 변경</h2>
            <p>
              본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지합니다.
              변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 회원 탈퇴할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">9. 분쟁 해결</h2>
            <p>
              본 약관과 관련된 분쟁은 대한민국 법률을 따르며,
              관할 법원은 민사소송법에 따른 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">10. 연락처</h2>
            <p>문의: tutti.app.contact@gmail.com</p>
          </section>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              본 약관은 MVP 단계의 초안이며, 서비스 정식 출시 전 법률 전문가의 검토를 거칠 예정입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
