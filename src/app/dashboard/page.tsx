import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils"
import { Ship, Calendar, MapPin, ArrowRight } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CustomerDashboard() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role === "owner") redirect("/dashboard/owner")
  if (session.user.role === "agency") redirect("/dashboard/agency")

  const [upcoming, past, boats] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: session.user.id, status: { in: ["pending", "confirmed"] }, endDate: { gte: new Date() } },
      include: { boat: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.booking.findMany({
      where: { customerId: session.user.id, OR: [{ status: { in: ["completed", "cancelled"] } }, { endDate: { lt: new Date() } }] },
      include: { boat: true },
      orderBy: { startDate: "desc" },
      take: 3,
    }),
    prisma.boat.findMany({ where: { status: "active" }, take: 4, orderBy: { rating: "desc" } }),
  ])

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session.user.name?.split(" ")[0] || "Sailor"}! ⚓`}
        description="Manage your bookings and plan your next adventure on the Aegean."
        actions={<Link href="/boats"><Button className="bg-blue-600 hover:bg-blue-700">Browse Boats <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>}
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{upcoming.length}</div>
                <div className="text-sm text-gray-500">Upcoming trips</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Ship className="h-6 w-6 text-cyan-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{past.length}</div>
                <div className="text-sm text-gray-500">Past trips</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-500">Destinations</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming Trips</h2>
            <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline">View all bookings</Link>
          </div>
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Ship className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-semibold mb-1">No upcoming trips</h3>
                <p className="text-gray-500 mb-4">Start exploring the Greek islands!</p>
                <Link href="/boats"><Button>Browse boats</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((b) => (
                <Card key={b.id}>
                  <CardContent className="p-5 flex gap-4">
                    <img src={JSON.parse(b.boat.images)[0]} alt={b.boat.name} className="h-24 w-32 object-cover rounded-lg" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{b.boat.name}</h3>
                        <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.boat.location}</div>
                      <div className="text-sm">{formatDate(b.startDate)} – {formatDate(b.endDate)}</div>
                      <div className="text-sm font-semibold text-blue-700 mt-1">{formatPrice(b.totalPrice, b.currency)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Recommended for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {boats.map((b) => (
              <Link key={b.id} href={`/boats/${b.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition h-full">
                  <img src={JSON.parse(b.images)[0]} alt={b.name} className="h-32 w-full object-cover" />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm">{b.name}</h3>
                    <div className="text-xs text-gray-500">{b.location}</div>
                    <div className="text-sm font-bold text-blue-700 mt-2">{formatPrice(b.pricePerDay)}/day</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
