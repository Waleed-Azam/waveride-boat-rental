import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AgencyClients() {
  const session = await auth()
  if (!session) return null

  const clients = await prisma.booking.findMany({
    where: { agencyId: session.user.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })

  // Group by customer
  const grouped = new Map<string, { user: any; bookings: number; total: number }>()
  clients.forEach((c) => {
    const existing = grouped.get(c.customerId)
    if (existing) {
      existing.bookings++
      existing.total += c.totalPrice
    } else {
      grouped.set(c.customerId, { user: c.customer, bookings: 1, total: c.totalPrice })
    }
  })
  const clientList = Array.from(grouped.values())

  return (
    <div>
      <PageHeader title="Clients" description="Clients who booked through your agency." />
      <div className="p-8">
        <Card>
          <CardContent className="p-0">
            {clientList.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No clients yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Client</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Phone</th>
                    <th className="text-left p-4 font-semibold">Bookings</th>
                    <th className="text-left p-4 font-semibold">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {clientList.map((c) => (
                    <tr key={c.user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{c.user.name?.charAt(0) || "U"}</AvatarFallback></Avatar>
                          <span className="font-semibold">{c.user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{c.user.email}</td>
                      <td className="p-4 text-gray-600">{c.user.phone || "—"}</td>
                      <td className="p-4">{c.bookings}</td>
                      <td className="p-4 font-semibold text-blue-700">{formatPrice(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
