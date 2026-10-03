import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { AdminCharts } from "@/components/admin-charts"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminAnalytics() {
  const [bookingsByMonth, bookingsByLocation, bookingsByType, allBoats] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 180 * 86400000) } },
      select: { createdAt: true, totalPrice: true, status: true, boat: true },
    }),
    prisma.booking.findMany({ include: { boat: true } }),
    prisma.booking.findMany({ include: { boat: true } }),
    prisma.boat.findMany(),
  ])

  const locationMap = new Map<string, number>()
  bookingsByLocation.forEach((b) => {
    const loc = b.boat.location.split(",")[0].trim()
    locationMap.set(loc, (locationMap.get(loc) || 0) + 1)
  })
  const locationData = Array.from(locationMap.entries()).map(([name, value]) => ({ name, value })).slice(0, 8)

  const typeMap = new Map<string, number>()
  bookingsByType.forEach((b) => typeMap.set(b.boat.type, (typeMap.get(b.boat.type) || 0) + 1))
  const typeData = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }))

  const confirmedBookings = bookingsByMonth.filter(b => b.status !== "cancelled")
  const avgBookingValue = confirmedBookings.length > 0
    ? Math.round(confirmedBookings.reduce((s, b) => s + b.totalPrice, 0) / Math.max(confirmedBookings.length, 1))
    : 0
  const totalRev = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0)
  const occupancy = Math.round(
    (bookingsByLocation.filter(b => b.status !== "cancelled").length / Math.max(allBoats.length * 30 * 3, 1)) * 100
  )

  return (
    <div>
      <PageHeader title="Analytics" description="Platform performance and insights" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-6">
            <div className="text-sm text-gray-500">Revenue (6 months)</div>
            <div className="text-3xl font-bold mt-1">{formatPrice(totalRev)}</div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="text-sm text-gray-500">Avg booking value</div>
            <div className="text-3xl font-bold mt-1">{formatPrice(avgBookingValue)}</div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="text-sm text-gray-500">Estimated occupancy</div>
            <div className="text-3xl font-bold mt-1">{occupancy}%</div>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-6 h-80">
            <div className="font-semibold mb-2">Revenue & Booking Trends</div>
            <div className="h-full"><AdminCharts data={bookingsByMonth} /></div>
          </CardContent>
        </Card>

        <AnalyticsCharts locationData={locationData} typeData={typeData} />
      </div>
    </div>
  )
}
