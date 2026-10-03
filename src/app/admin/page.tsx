import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Ship, Users, BookOpen, Euro, RefreshCw, AlertTriangle, TrendingUp } from "lucide-react"
import { AdminCharts } from "@/components/admin-charts"

export const dynamic = "force-dynamic"

export default async function AdminOverview() {
  const [userCount, boatCount, bookingCount, revenue, pb, pboat, syncErrors, recentBookings, syncLogs] = await Promise.all([
    prisma.user.count(),
    prisma.boat.count({ where: { status: "active" } }),
    prisma.booking.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    prisma.booking.count({ where: { syncStatus: "pending" } }),
    prisma.boat.count({ where: { syncStatus: "pending" } }),
    prisma.syncLog.count({ where: { status: "failed" } }),
    prisma.booking.findMany({
      include: { boat: true, customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.syncLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ])
  const pendingSync = pb + pboat

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const bookingsByMonth = await prisma.booking.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, totalPrice: true, status: true },
  })

  const topBoats = await prisma.boat.findMany({
    where: { status: "active" },
    include: { _count: { select: { bookings: true } } },
    orderBy: { bookings: { _count: "desc" } },
    take: 5,
  })

  const usersByRole = {
    customers: await prisma.user.count({ where: { role: "customer" } }),
    owners: await prisma.user.count({ where: { role: "owner" } }),
    agencies: await prisma.user.count({ where: { role: "agency" } }),
  }

  return (
    <div>
      <PageHeader
        title="Platform Administration"
        description="Monitor the WaveRide platform health, bookings, users, and two-way sync."
      />
      <div className="p-8 space-y-6">
        {syncErrors > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-700" />
              <div className="flex-1">
                <div className="font-semibold text-red-900">{syncErrors} sync errors detected</div>
                <div className="text-sm text-red-700">Some items failed to sync with external platforms. Review the Sync Monitor.</div>
              </div>
              <Link href="/admin/sync"><Badge className="bg-red-600">View Sync</Badge></Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="h-5 w-5 text-blue-700" /></div><div><div className="text-xl font-bold">{userCount}</div><div className="text-xs text-gray-500">Users</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center"><Ship className="h-5 w-5 text-cyan-700" /></div><div><div className="text-xl font-bold">{boatCount}</div><div className="text-xs text-gray-500">Active Boats</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><BookOpen className="h-5 w-5 text-green-700" /></div><div><div className="text-xl font-bold">{bookingCount}</div><div className="text-xs text-gray-500">Bookings</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Euro className="h-5 w-5 text-yellow-700" /></div><div><div className="text-xl font-bold">{(revenue._sum.amount || 0 / 1000).toFixed(0)}K</div><div className="text-xs text-gray-500">Revenue</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center"><RefreshCw className="h-5 w-5 text-orange-700" /></div><div><div className="text-xl font-bold">{pendingSync}</div><div className="text-xs text-gray-500">Pending Sync</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-purple-700" /></div><div><div className="text-xl font-bold">+24%</div><div className="text-xs text-gray-500">MoM Growth</div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Booking Volume & Revenue</CardTitle></CardHeader>
            <CardContent className="h-72">
              <AdminCharts data={bookingsByMonth} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>User Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Customers", value: usersByRole.customers, color: "bg-blue-500" },
                { label: "Boat Owners", value: usersByRole.owners, color: "bg-cyan-500" },
                { label: "Travel Agencies", value: usersByRole.agencies, color: "bg-purple-500" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{r.label}</span><span className="font-semibold">{r.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color}`} style={{ width: `${(r.value / Math.max(userCount, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <h4 className="font-semibold text-sm mb-2">Top Performing Boats</h4>
                <div className="space-y-2">
                  {topBoats.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{b.name}</span>
                      <Badge variant="secondary">{b._count.bookings} bookings</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <img src={JSON.parse(b.boat.images)[0]} className="h-9 w-9 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{b.boat.name}</div>
                      <div className="text-xs text-gray-500">{b.customer.name} · {new Date(b.startDate).toLocaleDateString()}</div>
                    </div>
                    <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>{b.status}</Badge>
                    <span className="text-sm font-semibold text-blue-700">{formatPrice(b.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Sync Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncLogs.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className={l.status === "success" ? "bg-green-100 text-green-800 text-xs" : "bg-red-100 text-red-800 text-xs"}>
                      {l.status}
                    </Badge>
                    <Badge className="text-xs">{l.direction}</Badge>
                    <span className="capitalize flex-1 truncate">{l.action} {l.entityType}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
