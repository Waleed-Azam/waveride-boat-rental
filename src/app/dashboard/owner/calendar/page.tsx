import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { CalendarView } from "@/components/calendar-view"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function OwnerCalendarPage({ searchParams }: { searchParams: Promise<{ boatId?: string }> }) {
  const session = await auth()
  if (!session) return null
  const sp = await searchParams
  const boats = await prisma.boat.findMany({ where: { ownerId: session.user.id } })
  const selectedBoatId = sp.boatId || boats[0]?.id
  const selectedBoat = boats.find((b) => b.id === selectedBoatId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in3Months = new Date(today)
  in3Months.setMonth(in3Months.getMonth() + 3)

  const availability = selectedBoat ? await prisma.availability.findMany({
    where: { boatId: selectedBoat.id, date: { gte: today, lte: in3Months } },
    orderBy: { date: "asc" },
  }) : []

  const stats = {
    available: availability.filter((a) => a.status === "available").length,
    booked: availability.filter((a) => a.status === "booked").length,
    blocked: availability.filter((a) => a.status === "blocked").length,
    external: availability.filter((a) => a.source === "external" && a.status !== "available").length,
  }

  return (
    <div>
      <PageHeader
        title="Availability Calendar"
        description="Manage availability across your fleet. Block dates or view bookings. Changes sync to external platforms."
      />
      <div className="p-8 space-y-6">
        {boats.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-500">Add a boat to manage its calendar.</CardContent></Card>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {boats.map((b) => (
                <Link key={b.id} href={`/dashboard/owner/calendar?boatId=${b.id}`}>
                  <Badge
                    variant={b.id === selectedBoatId ? "default" : "outline"}
                    className={b.id === selectedBoatId ? "bg-blue-600" : "cursor-pointer"}
                  >
                    {b.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {selectedBoat && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card><CardContent className="p-4">
                    <div className="text-xs text-gray-500">Available days</div>
                    <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                  </CardContent></Card>
                  <Card><CardContent className="p-4">
                    <div className="text-xs text-gray-500">Booked (local)</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.booked - stats.external}</div>
                  </CardContent></Card>
                  <Card><CardContent className="p-4">
                    <div className="text-xs text-gray-500">Booked (external)</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.external}</div>
                  </CardContent></Card>
                  <Card><CardContent className="p-4">
                    <div className="text-xs text-gray-500">Blocked</div>
                    <div className="text-2xl font-bold text-gray-600">{stats.blocked}</div>
                  </CardContent></Card>
                </div>
                <CalendarView boatId={selectedBoat.id} initialAvailability={availability.map((a) => ({
                  date: a.date.toISOString(),
                  status: a.status,
                  source: a.source,
                }))} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
