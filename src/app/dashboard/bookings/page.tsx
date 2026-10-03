import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils"
import { MapPin, Calendar, Users, RefreshCw, ExternalLink } from "lucide-react"
import { BookingActions } from "@/components/booking-actions"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage() {
  const session = await auth()
  if (!session) return null

  const isOwner = session.user.role === "owner"
  const isAgency = session.user.role === "agency"

  const where: any = isOwner
    ? { boat: { ownerId: session.user.id } }
    : isAgency
    ? { agencyId: session.user.id }
    : { customerId: session.user.id }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      boat: true,
      customer: { select: { name: true, email: true, phone: true } },
      agency: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status) && new Date(b.endDate) >= new Date())
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status) || new Date(b.endDate) < new Date())

  return (
    <div>
      <PageHeader
        title={isOwner ? "Boat Bookings" : isAgency ? "Agency Bookings" : "My Bookings"}
        description={isOwner ? "Manage all incoming booking requests for your fleet." : isAgency ? "Manage client bookings across all boats." : "View and manage your boat charters."}
      />
      <div className="p-8">
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcoming.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">No upcoming bookings.</CardContent></Card>
            ) : upcoming.map((b) => <BookingRow key={b.id} booking={b} isOwner={isOwner} />)}
          </TabsContent>
          <TabsContent value="past" className="mt-4 space-y-4">
            {past.length === 0 ? (
              <Card><CardContent className="p-12 text-center text-gray-500">No past bookings.</CardContent></Card>
            ) : past.map((b) => <BookingRow key={b.id} booking={b} isOwner={isOwner} />)}
          </TabsContent>
          <TabsContent value="all" className="mt-4 space-y-4">
            {bookings.map((b) => <BookingRow key={b.id} booking={b} isOwner={isOwner} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function BookingRow({ booking, isOwner }: { booking: any; isOwner: boolean }) {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col md:flex-row gap-4">
        <img
          src={JSON.parse(booking.boat.images)[0]}
          alt={booking.boat.name}
          className="h-36 w-full md:w-52 object-cover rounded-lg shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-bold text-lg">{booking.boat.name}</h3>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {booking.boat.location}
              </div>
            </div>
            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Dates</div>
                <div>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Guests</div>
                <div>{booking.guestCount}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className="font-semibold text-blue-700">{formatPrice(booking.totalPrice, booking.currency)}</div>
            </div>
          </div>
          {isOwner && booking.customer && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="text-xs text-gray-400 mr-2">Customer:</span>
              {booking.customer.name} · {booking.customer.email}
            </div>
          )}
          {booking.specialRequests && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="text-xs text-gray-400 block">Special requests:</span>
              {booking.specialRequests}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {booking.syncStatus === "synced" ? (
              <Badge variant="secondary" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Synced {booking.externalId ? `· ${booking.externalId}` : ""}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Sync pending
              </Badge>
            )}
            <Link href={`/boats/${booking.boatId}`}>
              <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4 mr-1" /> View boat</Button>
            </Link>
            <BookingActions bookingId={booking.id} currentStatus={booking.status} isOwner={isOwner} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
