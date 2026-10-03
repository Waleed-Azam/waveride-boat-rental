import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, getStatusColor } from "@/lib/utils"
import { Ship, BookOpen, Users, Euro, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AgencyDashboard() {
  const session = await auth()
  if (!session) return null

  const [bookings, activeBoats, totalSpend, customerSet] = await Promise.all([
    prisma.booking.findMany({
      where: { agencyId: session.user.id },
      include: { boat: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.boat.count({ where: { status: "active" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { booking: { agencyId: session.user.id }, status: "paid" },
    }),
    prisma.booking.findMany({
      where: { agencyId: session.user.id },
      select: { customerId: true },
      distinct: ["customerId"],
    }),
  ])

  return (
    <div>
      <PageHeader
        title={`${session.user.companyName || "Agency Dashboard"}`}
        description="Browse the fleet, book for clients, and manage your agency reservations."
        actions={<Link href="/boats"><Button className="bg-blue-600 hover:bg-blue-700">Browse Boats <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>}
      />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center"><BookOpen className="h-6 w-6 text-blue-700" /></div><div><div className="text-2xl font-bold">{bookings.length}</div><div className="text-sm text-gray-500">Total bookings</div></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center"><Ship className="h-6 w-6 text-cyan-700" /></div><div><div className="text-2xl font-bold">{activeBoats}</div><div className="text-sm text-gray-500">Boats in fleet</div></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center"><Users className="h-6 w-6 text-green-700" /></div><div><div className="text-2xl font-bold">{customerSet.length}</div><div className="text-sm text-gray-500">Active clients</div></div></CardContent></Card>
          <Card><CardContent className="p-5 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center"><Euro className="h-6 w-6 text-yellow-700" /></div><div><div className="text-2xl font-bold">{formatPrice(totalSpend._sum.amount || 0)}</div><div className="text-sm text-gray-500">Total booked value</div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Agency Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No bookings yet. Browse boats to make your first client reservation.
              </div>
            ) : (
              <div className="divide-y">
                {bookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center gap-4">
                    <img src={JSON.parse(b.boat.images)[0]} className="h-12 w-16 rounded object-cover" alt="" />
                    <div className="flex-1">
                      <div className="font-semibold">{b.boat.name}</div>
                      <div className="text-sm text-gray-500">Client: {b.customer.name} · {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-700">{formatPrice(b.totalPrice)}</div>
                      <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
