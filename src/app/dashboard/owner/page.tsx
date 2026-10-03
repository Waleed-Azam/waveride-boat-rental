import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils"
import { Ship, Calendar, Euro, RefreshCw, AlertTriangle, Plus, ArrowRight } from "lucide-react"
import { SyncButton } from "@/components/sync-button"

export const dynamic = "force-dynamic"

export default async function OwnerDashboard() {
  const session = await auth()
  if (!session) return null

  const [boats, bookings, revenue, pb, pbc, syncErrors] = await Promise.all([
    prisma.boat.findMany({
      where: { ownerId: session.user.id },
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.booking.findMany({
      where: { boat: { ownerId: session.user.id } },
      include: { boat: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { booking: { boat: { ownerId: session.user.id } }, status: "paid" },
    }),
    prisma.boat.count({ where: { ownerId: session.user.id, syncStatus: { in: ["pending", "error"] } } }),
    prisma.booking.count({ where: { boat: { ownerId: session.user.id }, syncStatus: { in: ["pending", "error"] } } }),
    prisma.syncLog.count({ where: { status: "failed" } }),
  ])
  const pendingSync = pb + pbc

  const activeBoats = boats.filter((b) => b.status === "active").length
  const pendingBookings = bookings.filter((b) => b.status === "pending").length

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session.user.companyName || session.user.name}`}
        description="Manage your fleet, bookings, and synchronization with partner platforms."
        actions={
          <>
            <SyncButton />
            <Link href="/dashboard/owner/boats?new=1"><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-1" /> Add Boat</Button></Link>
          </>
        }
      />
      <div className="p-8 space-y-8">
        {(pendingSync > 0 || syncErrors > 0) && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-700 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-900">Sync Status Alert</div>
                <div className="text-sm text-yellow-700">
                  {pendingSync} item{pendingSync !== 1 ? "s" : ""} waiting to sync with partner platforms. {syncErrors} recent sync {syncErrors === 1 ? "error" : "errors"}.
                </div>
              </div>
              <Link href="/dashboard/owner/sync"><Button size="sm" variant="outline">View Sync Center</Button></Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Ship className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeBoats}</div>
                <div className="text-sm text-gray-500">Active boats ({boats.length} total)</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingBookings}</div>
                <div className="text-sm text-gray-500">Pending requests</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatPrice(revenue._sum.amount || 0)}</div>
                <div className="text-sm text-gray-500">Confirmed revenue</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${pendingSync > 0 ? "bg-orange-100" : "bg-cyan-100"}`}>
                <RefreshCw className={`h-6 w-6 ${pendingSync > 0 ? "text-orange-700" : "text-cyan-700"}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingSync}</div>
                <div className="text-sm text-gray-500">Items to sync</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
                <Link href="/dashboard/owner/bookings" className="text-sm text-blue-600 hover:underline inline-flex items-center">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <img src={JSON.parse(b.boat.images)[0]} className="h-10 w-10 rounded object-cover" alt="" />
                        <div>
                          <div className="font-medium text-sm">{b.boat.name}</div>
                          <div className="text-xs text-gray-500">{b.customer.name} · {formatDate(b.startDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-blue-700">{formatPrice(b.totalPrice)}</div>
                        <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Fleet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {boats.map((b) => (
                <Link key={b.id} href={`/dashboard/owner/calendar?boatId=${b.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <img src={JSON.parse(b.images)[0]} className="h-10 w-10 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{b.name}</div>
                      <div className="text-xs text-gray-500">{b._count.bookings} bookings</div>
                    </div>
                    <Badge variant="secondary" className={b.syncStatus === "synced" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {b.syncStatus}
                    </Badge>
                  </div>
                </Link>
              ))}
              <Link href="/dashboard/owner/boats?new=1">
                <Button variant="ghost" size="sm" className="w-full mt-2"><Plus className="h-4 w-4 mr-1" /> Add new boat</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
