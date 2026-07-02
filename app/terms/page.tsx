import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"

export const metadata = {
  title: "이용약관 | 탁카",
  description: "탁카 카 캐리어 탁송 플랫폼 이용약관",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <div className="max-w-3xl mx-auto px-4 py-12 pt-28">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-sm text-gray-500 mb-10">시행일: 2026년 1월 1일 | 최종 개정: 2026년 7월 1일</p>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          {/* 제1조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제1조 (목적)</h2>
            <p>
              이 약관은 탁카(TakCa, 이하 "회사")가 운영하는 카 캐리어 차량 탁송 중개 플랫폼 탁카(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제2조 (정의)</h2>
            <ul className="space-y-2 list-none">
              <li>① "서비스"란 화주와 카 캐리어 기사를 실시간으로 연결하는 차량 탁송 중개 플랫폼을 말합니다.</li>
              <li>② "이용자"란 이 약관에 동의하고 서비스를 이용하는 모든 회원을 말합니다.</li>
              <li>③ "화주"란 카 캐리어를 통한 차량 탁송을 의뢰하는 이용자를 말합니다.</li>
              <li>④ "기사(차주)"란 카 캐리어를 운행하여 차량을 탁송하는 이용자를 말합니다.</li>
              <li>⑤ "에스크로"란 화주가 결제한 운임을 결제대행사(토스페이먼츠)가 일시 보관하다가 탁송 완료 확인 후 기사에게 정산하는 안전결제 방식을 말합니다.</li>
              <li>⑥ "플랫폼 수수료"란 회사가 중개 서비스 제공의 대가로 기사에게 부과하는 수수료(정산 금액의 4%)를 말합니다.</li>
            </ul>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제3조 (약관의 효력 및 변경)</h2>
            <ul className="space-y-2 list-none">
              <li>① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>② 회사는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
              <li>③ 약관을 변경할 경우 최소 7일 전에 공지합니다. 다만 이용자에게 불리한 변경의 경우 최소 30일 전에 공지하고 이메일 또는 앱 내 알림으로 개별 통지합니다.</li>
              <li>④ 변경 약관 시행일 이후 서비스를 계속 이용하면 변경 약관에 동의한 것으로 간주합니다.</li>
            </ul>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제4조 (서비스 이용)</h2>
            <ul className="space-y-2 list-none">
              <li>① 회사는 화주와 카 캐리어 기사 간의 거래를 중개하는 플랫폼 사업자로, 탁송 계약의 직접 당사자가 아닙니다.</li>
              <li>② 화주는 탁송 의뢰 시 출발지·도착지·차량 정보·희망 탁송일 등 정확한 정보를 입력해야 합니다.</li>
              <li>③ 기사는 운송 의뢰를 수락하기 전 차량 상태, 일정 등을 충분히 확인해야 합니다.</li>
              <li>④ 서비스 이용 시간은 연중무휴 24시간을 원칙으로 하되, 시스템 점검 등 필요한 경우 일시 중단될 수 있습니다.</li>
              <li>⑤ 서비스는 만 14세 이상 이용 가능합니다. 기사로 등록하려면 유효한 운전면허 및 카 캐리어 운행에 필요한 법적 자격을 보유해야 합니다.</li>
            </ul>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제5조 (회원가입 및 계정 관리)</h2>
            <ul className="space-y-2 list-none">
              <li>① 서비스 이용을 위해 회원가입이 필요하며, 이용자는 정확한 정보를 제공해야 합니다.</li>
              <li>② 이용자는 계정의 아이디·비밀번호를 제3자에게 공개하거나 양도할 수 없습니다.</li>
              <li>③ 허위 정보로 가입하거나 타인의 정보를 도용한 경우 회사는 계정을 즉시 정지 또는 삭제할 수 있습니다.</li>
              <li>④ 이용자가 계정 정보를 변경하고자 할 경우 앱 내 설정을 통해 수정할 수 있습니다.</li>
            </ul>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제6조 (에스크로 결제 및 정산)</h2>
            <ul className="space-y-2 list-none">
              <li>① 화주는 탁송 의뢰 확정 시 운임을 토스페이먼츠 에스크로로 선결제합니다. 결제가 완료된 이후에 기사와의 매칭이 활성화됩니다.</li>
              <li>② 에스크로로 보관된 운임은 탁송 완료 확인 후 영업일 기준 3일 이내에 기사에게 정산됩니다.</li>
              <li>③ 플랫폼 수수료(4%)는 기사에게 정산되는 금액에서 공제됩니다. 화주는 별도의 수수료를 부담하지 않습니다.</li>
              <li>④ 탁송 시작 전 취소 시 결제 금액 전액이 환불됩니다. 탁송 시작 후 취소의 경우 진행 단계에 따라 취소 정책이 적용됩니다.</li>
              <li>⑤ 기사의 귀책사유로 인한 취소(배정 후 미이행 등)의 경우 화주에게 전액 환불됩니다.</li>
              <li>⑥ 화주의 귀책사유로 인한 취소는 취소 시점에 따라 위약금이 발생할 수 있습니다.</li>
              <li>⑦ 환불은 원결제 수단으로 영업일 기준 5~10일 이내에 처리됩니다(카드사 사정에 따라 상이).</li>
            </ul>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제7조 (플랫폼 수수료)</h2>
            <ul className="space-y-2 list-none">
              <li>① 회사는 탁송 완료 건에 한해 기사 정산 금액의 4%를 플랫폼 수수료로 공제합니다.</li>
              <li>② 취소 또는 환불된 거래에는 플랫폼 수수료가 부과되지 않습니다.</li>
              <li>③ 수수료율 변경 시 최소 30일 전에 공지합니다.</li>
            </ul>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제8조 (책임 제한)</h2>
            <ul className="space-y-2 list-none">
              <li>① 회사는 화주와 기사 간의 탁송 계약에 직접 개입하지 않으며, 운송 과정에서 발생하는 차량 파손, 사고, 지연 등에 대한 법적 책임을 지지 않습니다.</li>
              <li>② 회사는 기사의 면허 유효성, 차량 보험 가입 여부, 운송 자격 등을 보증하지 않습니다. 이용자는 자신의 책임하에 거래 상대방을 선택합니다.</li>
              <li>③ 회사는 천재지변, 국가 비상사태, 해킹·사이버 공격 등 불가항력적 사유로 인한 서비스 장애에 대해 책임을 지지 않습니다.</li>
              <li>④ 단, 회사의 고의 또는 중과실로 인한 서비스 오류 및 에스크로 정산 실패에 대해서는 회사가 책임을 집니다.</li>
              <li>⑤ 이용자가 서비스 이용과 관련하여 부적절한 행위로 타인에게 피해를 입힌 경우, 해당 이용자가 모든 법적 책임을 집니다.</li>
            </ul>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제9조 (이용자 의무)</h2>
            <ul className="space-y-2 list-none">
              <li>① 이용자는 타인의 개인정보를 무단으로 수집·이용해서는 안 됩니다.</li>
              <li>② 이용자는 도난 차량, 압류 차량, 불법 개조 차량 등 탁송이 금지된 차량을 의뢰·수락해서는 안 됩니다.</li>
              <li>③ 이용자는 허위 리뷰 작성, 부정 입찰, 서비스 조작 등 부정 행위를 해서는 안 됩니다.</li>
              <li>④ 이용자는 서비스를 통해 알게 된 거래 상대방의 연락처를 이용하여 플랫폼 외부 직거래를 유도해서는 안 됩니다.</li>
              <li>⑤ 위반 시 회사는 경고 없이 서비스 이용을 제한하거나 계정을 삭제할 수 있으며, 필요한 경우 법적 조치를 취할 수 있습니다.</li>
            </ul>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제10조 (위치정보 이용)</h2>
            <p>
              기사는 운송 진행 중 실시간 위치 정보가 화주에게 공유됩니다. 위치정보 수집 및 이용에 관한 세부 사항은 개인정보처리방침 및 위치정보 이용약관에 따릅니다. 「위치정보의 보호 및 이용 등에 관한 법률」에 의거하여 이용자의 사전 동의 없이 위치정보를 제3자에게 제공하지 않습니다.
            </p>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제11조 (서비스 중단)</h2>
            <p>
              회사는 시스템 점검, 설비 보수, 천재지변, 기술적 문제 등으로 인해 서비스를 일시적으로 중단할 수 있습니다. 사전에 앱 내 공지하는 것을 원칙으로 하되, 긴급한 경우 사후 공지할 수 있습니다. 계획된 점검으로 인한 서비스 중단이 4시간을 초과하는 경우 최소 24시간 전에 공지합니다.
            </p>
          </section>

          {/* 제12조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제12조 (분쟁 해결)</h2>
            <ul className="space-y-2 list-none">
              <li>① 서비스 이용과 관련하여 화주와 기사 간 분쟁이 발생한 경우, 당사자 간 협의를 우선으로 합니다. 회사는 분쟁 조정을 위한 기록(탁송 기록, 위치 이력, 사진 등)을 제공할 수 있습니다.</li>
              <li>② 회사와 이용자 간 분쟁이 발생한 경우, 회사는 신속하게 해결하기 위해 최선을 다합니다. 고객센터(<a href="mailto:support@takca.kr" className="text-orange-600 underline">support@takca.kr</a>)를 통해 접수 후 영업일 기준 3일 이내에 답변합니다.</li>
              <li>③ 분쟁이 조정되지 않는 경우 「전자상거래 등에서의 소비자보호에 관한 법률」에 따른 소비자분쟁조정위원회에 조정을 신청할 수 있습니다.</li>
              <li>④ 이 약관에 관한 소송은 대한민국 법률에 따르며, 관할 법원은 회사 소재지를 관할하는 법원으로 합니다.</li>
            </ul>
          </section>

          {/* 제13조 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">제13조 (준거법)</h2>
            <p>
              이 약관은 대한민국 법률에 따라 해석 및 적용됩니다. 약관에 규정되지 않은 사항은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령 및 상관례에 따릅니다.
            </p>
          </section>

          {/* 부칙 */}
          <div className="pt-6 border-t border-gray-200 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-500">부칙</p>
            <p>이 약관은 2026년 1월 1일부터 시행됩니다.</p>
            <p>고객센터: <a href="mailto:support@takca.kr" className="underline hover:text-gray-600">support@takca.kr</a></p>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
          <p className="text-xs text-gray-400">
            <Link href="/terms" className="hover:underline">이용약관</Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
