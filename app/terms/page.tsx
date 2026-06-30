import Link from "next/link"

export const metadata = {
  title: "이용약관 | 탁카",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">← 돌아가기</Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-sm text-gray-500 mb-8">시행일: 2024년 1월 1일</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 탁카(이하 "회사")가 운영하는 차량 탁송 중개 플랫폼 탁카(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제2조 (정의)</h2>
            <ul className="space-y-2 list-none">
              <li>① "서비스"란 화주와 카 캐리어 기사를 실시간으로 연결하는 차량 탁송 중개 플랫폼을 말합니다.</li>
              <li>② "이용자"란 이 약관에 동의하고 서비스를 이용하는 화주 및 기사를 말합니다.</li>
              <li>③ "화주"란 차량 탁송을 의뢰하는 이용자를 말합니다.</li>
              <li>④ "기사(차주)"란 카 캐리어를 운행하여 차량을 탁송하는 이용자를 말합니다.</li>
              <li>⑤ "에스크로"란 화주가 결제한 운임을 회사가 일시 보관하다가 탁송 완료 확인 후 기사에게 정산하는 결제 방식을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ul className="space-y-2 list-none">
              <li>① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>② 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 최소 7일 전에 공지합니다. 중요한 변경의 경우 30일 전에 공지합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제4조 (서비스의 성격 및 책임 제한)</h2>
            <ul className="space-y-2 list-none">
              <li>① 회사는 화주와 카 캐리어 기사 간의 거래를 중개하는 플랫폼 사업자로, 차량 탁송 계약의 직접 당사자가 아닙니다.</li>
              <li>② 탁송 차량의 파손, 사고, 지연 등 운송 과정에서 발생하는 분쟁은 화주와 기사 간의 책임이며, 회사는 이에 대한 법적 책임을 지지 않습니다.</li>
              <li>③ 회사는 차주의 면허, 자격, 차량 상태 등을 보증하지 않습니다. 이용자는 자신의 책임 하에 거래 상대방을 선택합니다.</li>
              <li>④ 단, 회사의 귀책사유로 인한 서비스 오류 및 에스크로 정산 실패에 대해서는 회사가 책임을 집니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제5조 (회원가입 및 자격)</h2>
            <ul className="space-y-2 list-none">
              <li>① 서비스 이용을 위해 회원가입이 필요합니다.</li>
              <li>② 만 14세 미만은 회원가입이 불가합니다.</li>
              <li>③ 기사로 등록하려면 유효한 운전면허 및 카 캐리어 운행에 필요한 자격을 보유해야 합니다.</li>
              <li>④ 허위 정보로 가입한 경우 회사는 계정을 즉시 정지 또는 삭제할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제6조 (결제 및 에스크로)</h2>
            <ul className="space-y-2 list-none">
              <li>① 화주는 운송 의뢰 시 운임을 에스크로 방식으로 선결제합니다.</li>
              <li>② 운송 완료 확인 후 차주에게 운임이 정산됩니다.</li>
              <li>③ 운송이 시작되기 전 취소 시 전액 환불됩니다. 운송 시작 후 취소의 경우 취소 정책에 따라 환불 금액이 결정됩니다.</li>
              <li>④ 정산은 영업일 기준 3일 이내에 처리됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제7조 (이용자 의무)</h2>
            <ul className="space-y-2 list-none">
              <li>① 이용자는 타인의 개인정보를 무단으로 수집·이용해서는 안 됩니다.</li>
              <li>② 이용자는 서비스를 이용하여 불법 차량(도난차량, 압류 중인 차량 등)을 탁송해서는 안 됩니다.</li>
              <li>③ 이용자는 허위 리뷰 작성, 서비스 조작 등 부정 행위를 해서는 안 됩니다.</li>
              <li>④ 위반 시 회사는 서비스 이용을 제한하거나 계정을 삭제할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제8조 (위치정보 이용)</h2>
            <p>
              차주는 운송 진행 중 실시간 위치 정보가 화주와 공유됩니다. 위치정보 수집 및 이용에 관한 세부 사항은 위치정보 이용약관에 따릅니다. 위치정보의 보호 및 이용 등에 관한 법률에 의거하여 이용자의 사전 동의 없이 위치정보를 제3자에게 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제9조 (서비스 중단)</h2>
            <p>
              회사는 시스템 점검, 천재지변, 기술적 문제 등으로 인해 서비스를 일시적으로 중단할 수 있습니다. 사전에 공지하는 것을 원칙으로 하되, 긴급한 경우 사후 공지할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">제10조 (분쟁 해결)</h2>
            <ul className="space-y-2 list-none">
              <li>① 서비스 이용과 관련하여 분쟁이 발생할 경우, 회사는 신속하게 해결하기 위해 노력합니다.</li>
              <li>② 이 약관에 관한 분쟁은 대한민국 법률에 따르며, 관할 법원은 회사 소재지를 관할하는 법원으로 합니다.</li>
            </ul>
          </section>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
            <p>본 약관은 2024년 1월 1일부터 시행됩니다.</p>
            <p className="mt-1">문의: <a href="mailto:support@takca.kr" className="underline">support@takca.kr</a></p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          <Link href="/terms" className="hover:underline">이용약관</Link>
          {" · "}
          <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
        </p>
      </div>
    </div>
  )
}
