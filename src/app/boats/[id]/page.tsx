import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { prisma } from "@/lib/prisma"
import { BookingForm } from "@/components/booking-form"
import { formatPrice, getBoatTypeLabel, getStatusColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  MapPin, Users, Ruler, Bed, Bath, Star, Check, Calendar, Shield,
  RefreshCw, Anchor, ChevronLeft, Phone, Mail,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BoatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const boat = await prisma.boat.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, companyName: true, phone: true, email: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  })

  if (!boat || boat.status !== "active") notFound()

  const images = JSON.parse(boat.images) as string[]
  const amenities = JSON.parse(boat.amenities) as string[]

  // Get 3 months availability
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in3Months = new Date(today)
  in3Months.setMonth(in3Months.getMonth() + 3)

  const availability = await prisma.availability.findMany({
    where: { boatId: id, date: { gte: today, lte: in3Months } },
  })
  const bookedDates = availability.filter((a) => a.status !== "available").map((a) => a.date)
  const externalBlocked = availability.filter((a) => a.source === "external" && a.status !== "available").length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Link href="/boats" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to boats
        </Link>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 rounded-xl overflow-hidden h-80 md:h-96">
          <div className="md:col-span-2 md:row-span-2 relative">
            <img src={images[0]} alt={boat.name} className="w-full h-full object-cover" />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="hidden md:block relative overflow-hidden">
              <img src={img} alt={`${boat.name} ${i+2}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{getBoatTypeLabel(boat.type)}</Badge>
                  {boat.syncStatus === "synced" ? (
                    <Badge className="bg-green-100 text-green-800">
                      <RefreshCw className="h-3 w-3 mr-1" /> Synced with partner platforms
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">Sync pending</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{boat.name}</h1>
                <div className="flex items-center gap-1 mt-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{boat.location}{boat.marina ? ` · ${boat.marina}` : ""}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-xl">{boat.rating}</span>
                </div>
                <div className="text-sm text-gray-500">{boat.reviewCount} reviews</div>
              </div>
            </div>

            {/* Quick specs */}
            <Card className="my-6">
              <CardContent className="p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <div className="font-semibold">{boat.capacity}</div>
                  <div className="text-xs text-gray-500">Guests</div>
                </div>
                <div className="text-center">
                  <Ruler className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <div className="font-semibold">{boat.length}m</div>
                  <div className="text-xs text-gray-500">Length</div>
                </div>
                {boat.cabins ? (
                  <div className="text-center">
                    <Bed className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                    <div className="font-semibold">{boat.cabins}</div>
                    <div className="text-xs text-gray-500">Cabins</div>
                  </div>
                ) : null}
                {boat.bathrooms ? (
                  <div className="text-center">
                    <Bath className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                    <div className="font-semibold">{boat.bathrooms}</div>
                    <div className="text-xs text-gray-500">Bathrooms</div>
                  </div>
                ) : null}
                <div className="text-center">
                  <Calendar className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <div className="font-semibold">{boat.year || "—"}</div>
                  <div className="text-xs text-gray-500">Year</div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-3">About this boat</h2>
              <p className="text-gray-700 leading-relaxed">{boat.description}</p>
              {boat.make && (
                <p className="text-sm text-gray-500 mt-2">
                  {boat.make} {boat.model}
                </p>
              )}
            </section>

            {/* Amenities */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" /> {a}
                  </div>
                ))}
              </div>
            </section>

            {/* Sync notice */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex gap-3">
                <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Double-booking protection</h3>
                  <p className="text-sm text-blue-700">
                    Our two-way API syncs this boat's calendar with {externalBlocked > 0 ? `${externalBlocked} externally-blocked days and ` : ""}
                    partner platforms in real time. When you book here, all external channels are updated instantly — and vice versa.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Owner */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-3">Charter Company</h2>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <Anchor className="h-7 w-7 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{boat.owner.companyName || boat.owner.name}</div>
                    <div className="text-sm text-gray-500">Owner · Verified · ⭐ 4.9</div>
                  </div>
                  <div className="flex gap-2">
                    {boat.owner.phone && (
                      <a href={`tel:${boat.owner.phone}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white h-8 w-8 hover:bg-gray-50">
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    <a href={`mailto:${boat.owner.email}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white h-8 w-8 hover:bg-gray-50">
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Reviews */}
            {boat.reviews.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3">Guest reviews</h2>
                <div className="space-y-4">
                  {boat.reviews.slice(0, 5).map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold">{r.user.name}</div>
                          <div className="flex">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{r.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-700">
                    {formatPrice(boat.pricePerDay, boat.currency)}
                    <span className="text-base font-normal text-gray-500">/day</span>
                  </div>
                </div>
                <Separator className="mb-5" />
                <BookingForm
                  boatId={boat.id}
                  pricePerDay={boat.pricePerDay}
                  currency={boat.currency}
                  capacity={boat.capacity}
                  bookedDates={bookedDates}
                />
                <div className="mt-4 text-xs text-gray-500 text-center">
                  You won't be charged yet — booking request will be sent for confirmation.
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
