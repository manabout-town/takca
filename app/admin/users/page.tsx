import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils/format"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <PageHeader title="회원 관리" description={`총 ${users?.length || 0}명`} />
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["이름","이메일","연락처","역할","상태","가입일"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${
                    u.role === "admin" ? "bg-purple-100 text-purple-700" :
                    u.role === "driver" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {u.role === "shipper" ? "화주" : u.role === "driver" ? "기사" : "관리자"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${
                    u.status === "active" ? "bg-green-100 text-green-700" :
                    u.status === "suspended" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {u.status === "active" ? "활성" : u.status === "suspended" ? "정지" : "대기"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
