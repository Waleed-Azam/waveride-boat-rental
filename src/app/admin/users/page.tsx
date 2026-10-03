import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { ownedBoats: true, bookings: true } } },
    orderBy: { createdAt: "desc" },
  })

  const roleColor: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    owner: "bg-blue-100 text-blue-800",
    agency: "bg-purple-100 text-purple-800",
    customer: "bg-gray-100 text-gray-800",
  }

  return (
    <div>
      <PageHeader title="All Users" description={`${users.length} registered users`} />
      <div className="p-8">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">User</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Phone</th>
                  <th className="text-left p-4 font-semibold">Boats</th>
                  <th className="text-left p-4 font-semibold">Bookings</th>
                  <th className="text-left p-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{u.name?.charAt(0) || "U"}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}{u.companyName ? ` · ${u.companyName}` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><Badge className={roleColor[u.role]}>{u.role}</Badge></td>
                    <td className="p-4 text-gray-600">{u.phone || "—"}</td>
                    <td className="p-4">{u._count.ownedBoats}</td>
                    <td className="p-4">{u._count.bookings}</td>
                    <td className="p-4 text-gray-600">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
