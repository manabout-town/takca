import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"

export const metadata = {
  title: "개인정보처리방침 | 탁카",
  description: "탁카 카 캐리어 탁송 플랫폼 개인정보처리방침",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <div className="max-w-3xl mx-auto px-4 py-12 pt-28">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-10">시행일: 2026년 1월 1일 | 최종 개정: 2026년 7월 1일</p>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          {/* 서문 */}
          <section>
            <p>
              탁카(TakCa, 이하 "회사")는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「위치정보의 보호 및 이용 등에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」을 준수하며, 이용자의 개인정보를 안전하게 보호하기 위해 최선을 다합니다. 본 방침은 회사가 이용자의 개인정보를 어떻게 수집·이용·보관·파기하는지를 안내합니다.
            </p>
          </section>

          {/* 1. 수집하는 개인정보 항목 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. 수집하는 개인정보 항목</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">구분</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">수집 항목</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">수집 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium whitespace-nowrap">필수 (공통)</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">이름, 이메일 주소, 휴대전화번호, 비밀번호(암호화)</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">회원 가입, 본인 확인, 서비스 제공</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium whitespace-nowrap">기사 추가 필수</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">운전면허번호, 차량번호, 카 캐리어 차량 정보, 계좌번호</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">기사 자격 확인, 운임 정산</td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium whitespace-nowrap">위치정보</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">실시간 GPS 위치 (운송 진행 중 기사 단말기)</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">탁송 차량 실시간 추적, 화주 배송 현황 제공</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium whitespace-nowrap">결제정보</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">결제 수단 정보 (토스페이먼츠 위탁 처리, 회사 미저장)</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">운임 에스크로 결제 및 기사 정산</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">자동 수집</td>
                    <td className="px-4 py-2.5">접속 IP, 기기 식별정보, 브라우저/앱 버전, 서비스 이용 기록, 쿠키</td>
                    <td className="px-4 py-2.5">서비스 개선, 부정 이용 방지, 오류 진단</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">※ 결제 카드 번호 등 민감한 결제 정보는 회사 서버에 저장되지 않으며, 모두 토스페이먼츠를 통해 안전하게 처리됩니다.</p>
          </section>

          {/* 2. 개인정보 수집 방법 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. 개인정보 수집 방법</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
              <li>카카오·구글·Apple 소셜 로그인 (해당 플랫폼에서 제공에 동의한 정보에 한함)</li>
              <li>SMS OTP 인증 과정에서 휴대전화번호 수집</li>
              <li>서비스 이용 중 자동 수집 (접속 로그, 기기 정보 등)</li>
              <li>기사 검증 과정에서 관계 기관 확인 (면허 유효성 등)</li>
            </ul>
          </section>

          {/* 3. 개인정보 이용 목적 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. 개인정보 이용 목적</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>카 캐리어 차량 탁송 중개 서비스 제공 (화주-기사 매칭)</li>
              <li>회원 가입, 본인 인증, 계정 관리</li>
              <li>운임 에스크로 결제 및 기사 정산 처리</li>
              <li>실시간 위치 공유 (운송 진행 중 한정)</li>
              <li>탁송 완료 확인 및 거래 기록 보관</li>
              <li>고객 문의 응대 및 분쟁 처리</li>
              <li>서비스 품질 개선 및 신규 기능 개발</li>
              <li>마케팅·이벤트 안내 (별도 동의한 경우에 한함)</li>
              <li>법령상 의무 이행 (세금계산서 발행 등)</li>
            </ul>
          </section>

          {/* 4. 개인정보 보유 및 이용 기간 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. 개인정보 보유 및 이용 기간</h2>
            <p className="mb-3">원칙적으로 개인정보 수집·이용 목적이 달성된 후 지체 없이 파기합니다. 단, 관련 법령에 의해 아래와 같이 보관합니다.</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">항목</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">보유 기간</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">근거 법령</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5">회원 정보 (탈퇴 후)</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">30일 후 파기</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">부정 이용 방지 (회사 정책)</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-4 py-2.5">계약·청약 철회 기록</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">5년</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">전자상거래법 제6조</td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5">대금 결제·공급 기록</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">5년</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">전자상거래법 제6조</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-4 py-2.5">소비자 불만·분쟁 처리 기록</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">3년</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">전자상거래법 제6조</td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5">전자금융거래 기록</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">5년</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">전자금융거래법 제22조</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-4 py-2.5">위치정보 기록</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">운송 완료 후 1년</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">분쟁 처리 (회사 정책)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">접속 로그</td>
                    <td className="px-4 py-2.5">3개월</td>
                    <td className="px-4 py-2.5">통신비밀보호법 제15조의2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. 개인정보 제3자 제공 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. 개인정보 제3자 제공</h2>
            <p className="mb-3">회사는 원칙적으로 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다.</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">제공 대상</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">제공 항목</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">제공 목적</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium">탁송 매칭 상대방<br/>(화주 ↔ 기사)</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">이름, 연락처, 차량 정보, 위치</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">탁송 계약 이행</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">거래 완료 후 파기</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium">수사기관·행정기관</td>
                    <td className="px-4 py-2.5">법령에서 정한 범위 내 정보</td>
                    <td className="px-4 py-2.5">법령 의무 이행</td>
                    <td className="px-4 py-2.5">해당 법령에 따름</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. 개인정보 처리 위탁 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">6. 개인정보 처리 위탁</h2>
            <p className="mb-3">회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 외부 전문 업체에 위탁합니다. 위탁 업체는 개인정보를 위탁 업무 수행 목적 외에 이용할 수 없습니다.</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">수탁 업체</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">위탁 업무 내용</th>
                    <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-600">보유 및 이용 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium">토스페이먼츠</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">에스크로 결제 처리, 카드 결제 및 기사 정산</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">서비스 종료 또는 위탁 계약 종료 시</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium">Supabase Inc.</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">데이터베이스 운영, 회원 인증 서비스</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">서비스 종료 또는 위탁 계약 종료 시</td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-100 px-4 py-2.5 font-medium">Vercel Inc.</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">서비스 서버 운영 및 배포</td>
                    <td className="border-b border-gray-100 px-4 py-2.5">서비스 종료 또는 위탁 계약 종료 시</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium">SMS 발송 업체</td>
                    <td className="px-4 py-2.5">OTP 문자 발송</td>
                    <td className="px-4 py-2.5">발송 완료 후 즉시 파기</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. 토스페이먼츠 에스크로 결제 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">7. 토스페이먼츠 에스크로 결제와 개인정보</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>결제 처리는 전자금융업자인 토스페이먼츠(주)를 통해 이루어지며, 카드 번호 등 결제 민감 정보는 회사 서버에 저장되지 않습니다.</li>
              <li>에스크로 거래 시 화주의 성명, 연락처, 결제 금액 정보가 토스페이먼츠에 제공됩니다.</li>
              <li>기사 정산을 위해 기사의 성명, 계좌번호, 주민등록번호 앞 7자리(세금계산서 발행 목적)가 처리될 수 있습니다.</li>
              <li>토스페이먼츠의 개인정보처리방침: <a href="https://www.tosspayments.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">https://www.tosspayments.com/privacy</a></li>
            </ul>
          </section>

          {/* 8. 위치정보 수집 및 이용 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">8. 위치정보 수집 및 이용</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>기사의 실시간 위치는 탁송 운행이 시작된 후부터 완료될 때까지만 수집됩니다.</li>
              <li>수집된 위치정보는 화주에게 탁송 차량 현황을 표시하는 목적으로만 이용되며, 마케팅 등 다른 목적으로 활용하지 않습니다.</li>
              <li>운송 완료 후 실시간 위치 수집은 즉시 중단되며, 위치 이력은 분쟁 처리를 위해 1년간 보관 후 파기됩니다.</li>
              <li>「위치정보의 보호 및 이용 등에 관한 법률」 제15조에 따라 이용자의 사전 동의를 받으며, 동의를 철회할 경우 위치정보 수집이 즉시 중단됩니다.</li>
            </ul>
          </section>

          {/* 9. 이용자의 권리 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">9. 이용자의 권리 및 행사 방법</h2>
            <p className="mb-3">이용자는 언제든지 다음의 개인정보 권리를 행사할 수 있습니다.</p>
            <ul className="space-y-1.5 list-disc list-inside mb-3">
              <li><span className="font-medium">열람 요청:</span> 회사가 처리 중인 본인의 개인정보 확인</li>
              <li><span className="font-medium">정정 요청:</span> 부정확하거나 오류가 있는 개인정보 수정</li>
              <li><span className="font-medium">삭제 요청:</span> 법령상 보존 의무가 없는 개인정보 삭제</li>
              <li><span className="font-medium">처리 정지 요청:</span> 개인정보 처리의 일시 중단</li>
              <li><span className="font-medium">이의 제기:</span> 자동화된 의사결정(알고리즘 매칭 등)에 대한 이의</li>
            </ul>
            <div className="bg-orange-50 rounded-lg p-4 text-xs text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">권리 행사 방법</p>
              <p>앱 내 [내 정보 → 개인정보 관리] 메뉴 또는 <a href="mailto:privacy@takca.kr" className="text-orange-600 underline">privacy@takca.kr</a>로 요청하시면 영업일 기준 10일 이내에 처리합니다.</p>
            </div>
          </section>

          {/* 10. 개인정보 보호 조치 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">10. 개인정보 안전성 확보 조치</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><span className="font-medium">암호화:</span> 비밀번호 bcrypt 해시 저장, 통신 구간 SSL/TLS 암호화 적용</li>
              <li><span className="font-medium">접근 통제:</span> 데이터베이스 Row Level Security(RLS) 적용, 최소 권한 원칙</li>
              <li><span className="font-medium">접속 기록 관리:</span> 관리자 시스템 접속 기록 보관 및 모니터링</li>
              <li><span className="font-medium">보안 업데이트:</span> 정기적인 취약점 점검 및 보안 패치 적용</li>
            </ul>
          </section>

          {/* 11. 개인정보 보호책임자 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">11. 개인정보 보호책임자 및 연락처</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <ul className="space-y-1.5 text-xs">
                <li><span className="font-semibold">성명:</span> 탁카 개인정보보호 담당자</li>
                <li><span className="font-semibold">이메일:</span> <a href="mailto:privacy@takca.kr" className="text-orange-600 underline">privacy@takca.kr</a></li>
                <li><span className="font-semibold">처리 기간:</span> 영업일 기준 10일 이내</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">개인정보 침해 신고 기관</p>
              <ul className="space-y-1">
                <li>• 개인정보보호위원회: <a href="https://www.privacy.go.kr" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">privacy.go.kr</a> / 국번없이 <strong>182</strong></li>
                <li>• 한국인터넷진흥원 개인정보침해신고센터: <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">privacy.kisa.or.kr</a> / 국번없이 <strong>118</strong></li>
                <li>• 대검찰청 사이버수사과: <a href="https://www.spo.go.kr" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">www.spo.go.kr</a> / 국번없이 <strong>1301</strong></li>
                <li>• 경찰청 사이버수사국: <a href="https://ecrm.cyber.go.kr" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">ecrm.cyber.go.kr</a> / 국번없이 <strong>182</strong></li>
              </ul>
            </div>
          </section>

          {/* 12. 개정 이력 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">12. 개인정보처리방침 개정 이력</h2>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>• 2026년 7월 1일 — 토스페이먼츠 에스크로 관련 조항 추가, 위탁 업체 목록 최신화</li>
              <li>• 2026년 1월 1일 — 최초 시행</li>
            </ul>
          </section>

          {/* 부칙 */}
          <div className="pt-6 border-t border-gray-200 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-500">부칙</p>
            <p>이 방침은 2026년 1월 1일부터 시행됩니다.</p>
            <p>개인정보 문의: <a href="mailto:privacy@takca.kr" className="underline hover:text-gray-600">privacy@takca.kr</a></p>
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
