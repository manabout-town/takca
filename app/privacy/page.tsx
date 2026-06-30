import Link from "next/link"

export const metadata = {
  title: "개인정보처리방침 | 탁카",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">← 돌아가기</Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-8">시행일: 2024년 1월 1일</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">

          <p>
            탁카(이하 "회사")는 개인정보 보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 위치정보의 보호 및 이용 등에 관한 법률을 준수하며, 이용자의 개인정보를 안전하게 보호합니다.
          </p>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">구분</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">수집 항목</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">수집 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium">필수</td>
                    <td className="border border-gray-200 px-3 py-2">이름, 이메일, 전화번호, 비밀번호</td>
                    <td className="border border-gray-200 px-3 py-2">회원 가입 및 본인 확인</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 font-medium">차주 추가</td>
                    <td className="border border-gray-200 px-3 py-2">운전면허번호, 차량번호, 차량 정보</td>
                    <td className="border border-gray-200 px-3 py-2">차주 자격 확인</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium">위치정보</td>
                    <td className="border border-gray-200 px-3 py-2">실시간 GPS 위치 (운송 중)</td>
                    <td className="border border-gray-200 px-3 py-2">탁송 차량 추적, 경로 안내</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 font-medium">결제</td>
                    <td className="border border-gray-200 px-3 py-2">결제 수단 정보 (PG사 위탁)</td>
                    <td className="border border-gray-200 px-3 py-2">운임 결제 및 정산</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 font-medium">자동 수집</td>
                    <td className="border border-gray-200 px-3 py-2">접속 IP, 기기 정보, 서비스 이용 기록</td>
                    <td className="border border-gray-200 px-3 py-2">서비스 개선, 부정 이용 방지</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. 개인정보 수집 방법</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>회원가입 및 서비스 이용 과정에서 직접 입력</li>
              <li>카카오·구글·Apple 소셜 로그인 (제공 동의한 정보에 한함)</li>
              <li>SMS OTP 인증 과정에서 전화번호 수집</li>
              <li>서비스 이용 중 자동 수집</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. 개인정보 이용 목적</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>차량 탁송 중개 서비스 제공</li>
              <li>회원 가입, 인증, 관리</li>
              <li>운임 결제 및 정산</li>
              <li>실시간 위치 공유 (운송 진행 중)</li>
              <li>고객 문의 및 분쟁 처리</li>
              <li>서비스 개선 및 신규 기능 개발</li>
              <li>법령상 의무 이행</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. 개인정보 보유 및 이용 기간</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">항목</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">보유 기간</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">근거</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">회원 정보</td>
                    <td className="border border-gray-200 px-3 py-2">탈퇴 후 30일</td>
                    <td className="border border-gray-200 px-3 py-2">부정 이용 방지</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">거래 기록</td>
                    <td className="border border-gray-200 px-3 py-2">5년</td>
                    <td className="border border-gray-200 px-3 py-2">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">결제 기록</td>
                    <td className="border border-gray-200 px-3 py-2">5년</td>
                    <td className="border border-gray-200 px-3 py-2">전자금융거래법</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">위치 기록</td>
                    <td className="border border-gray-200 px-3 py-2">운송 완료 후 1년</td>
                    <td className="border border-gray-200 px-3 py-2">분쟁 처리</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">접속 로그</td>
                    <td className="border border-gray-200 px-3 py-2">3개월</td>
                    <td className="border border-gray-200 px-3 py-2">통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. 개인정보 제3자 제공</h2>
            <p className="mb-3">회사는 원칙적으로 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외입니다.</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>차량 탁송 매칭 시: 화주 ↔ 기사 간 연락처·위치 정보 상호 제공 (서비스 목적)</li>
              <li>법령에 의해 수사기관 등이 요구하는 경우</li>
              <li>이용자가 사전에 동의한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. 개인정보 처리 위탁</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">수탁 업체</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Supabase</td>
                    <td className="border border-gray-200 px-3 py-2">데이터베이스, 인증 서비스 운영</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">PG사 (토스페이먼츠 등)</td>
                    <td className="border border-gray-200 px-3 py-2">결제 처리 및 에스크로</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">SMS 발송 업체</td>
                    <td className="border border-gray-200 px-3 py-2">OTP 문자 발송</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">Vercel</td>
                    <td className="border border-gray-200 px-3 py-2">서버 운영 및 배포</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. 위치정보 수집 및 이용</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>차주의 실시간 위치는 운송 진행 중에만 수집됩니다.</li>
              <li>수집된 위치정보는 화주에게 배송 현황 표시 목적으로만 이용됩니다.</li>
              <li>운송 완료 후 실시간 위치 수집은 즉시 중단됩니다.</li>
              <li>위치정보의 보호 및 이용 등에 관한 법률 제15조에 따라 이용자의 사전 동의를 받습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">8. 이용자의 권리</h2>
            <p className="mb-3">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>개인정보 열람 요청</li>
              <li>오류 정정 요청</li>
              <li>삭제 요청 (법령상 보존 의무가 없는 경우)</li>
              <li>처리 정지 요청</li>
            </ul>
            <p className="mt-3">권리 행사는 앱 내 설정 또는 <a href="mailto:privacy@takca.kr" className="text-orange-600 underline">privacy@takca.kr</a>로 요청하시면 10일 이내에 처리합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">9. 개인정보 보호 조치</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>비밀번호 암호화 저장 (bcrypt)</li>
              <li>데이터베이스 Row Level Security (RLS) 적용</li>
              <li>SSL/TLS 암호화 통신</li>
              <li>접근 권한 최소화 원칙 적용</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">10. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <ul className="space-y-1 text-xs">
                <li><span className="font-semibold">성명:</span> 탁카 개인정보보호팀</li>
                <li><span className="font-semibold">이메일:</span> <a href="mailto:privacy@takca.kr" className="text-orange-600 underline">privacy@takca.kr</a></li>
                <li><span className="font-semibold">처리 시간:</span> 영업일 기준 10일 이내</li>
              </ul>
            </div>
            <p className="mt-3 text-xs">
              개인정보 침해 신고는 개인정보보호위원회 (privacy.go.kr / 국번없이 182) 또는 한국인터넷진흥원 개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)에 문의하실 수 있습니다.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
            <p>본 방침은 2024년 1월 1일부터 시행됩니다.</p>
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
