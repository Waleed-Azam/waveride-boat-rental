import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { BoatCard } from "@/components/boat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { prisma } from "@/lib/prisma"
import { getBoatTypeLabel } from "@/lib/utils"
import { Anchor, Filter, Search } from "lucide-react"

export const dynamic = "force-dynamic"

type SearchParams = {
  location?: string
  type?: string
  guests?: string
  minPrice?: string
  maxPrice?: string
}

export default async function BoatsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const location = sp.location
  const type = sp.type
  const guests = sp.guests
  const minPrice = sp.minPrice
  const maxPrice = sp.maxPrice

  const where: any = { status: "active" }
  if (location) where.location = { contains: location, mode: "insensitive" }
  if (type) where.type = type
  if (guests) where.capacity = { gte: Number(guests) }
  if (minPrice) where.pricePerDay = { ...where.pricePerDay, gte: Number(minPrice) }
  if (maxPrice) where.pricePerDay = { ...where.pricePerDay, lte: Number(maxPrice) }

  const boats = await prisma.boat.findMany({
    where,
    include: { owner: { select: { name: true, companyName: true } } },
    orderBy: { rating: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover our fleet</h1>
          <p className="text-blue-100">{boats.length} boats available across the Greek islands</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <form className="bg-white rounded-xl border p-5 space-y-5">
              <div className="flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" /> Filters
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Destination</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input id="location" name="location" defaultValue={location || ""} placeholder="Mykonos, Santorini..." className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Boat Type</Label>
                <Select name="type" defaultValue={type || ""}>
                  <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="yacht">Motor Yacht</SelectItem>
                    <SelectItem value="sailboat">Sailboat</SelectItem>
                    <SelectItem value="catamaran">Catamaran</SelectItem>
                    <SelectItem value="motorboat">Motorboat</SelectItem>
                    <SelectItem value="rib">RIB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests">Minimum Guests</Label>
                <Select name="guests" defaultValue={guests || ""}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="2">2+ guests</SelectItem>
                    <SelectItem value="4">4+ guests</SelectItem>
                    <SelectItem value="6">6+ guests</SelectItem>
                    <SelectItem value="8">8+ guests</SelectItem>
                    <SelectItem value="10">10+ guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Min €</Label>
                  <Input name="minPrice" type="number" defaultValue={minPrice || ""} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Max €</Label>
                  <Input name="maxPrice" type="number" defaultValue={maxPrice || ""} placeholder="5000" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Apply Filters</Button>
              <Link href="/boats">
                <Button type="button" variant="ghost" className="w-full text-sm">Clear filters</Button>
              </Link>
            </form>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
              <div className="font-semibold text-blue-900 mb-1 flex items-center gap-1">
                <Anchor className="h-4 w-4" /> Two-Way Sync Active
              </div>
              <p className="text-blue-700">Availability is synced in real-time with our partner platforms to prevent double bookings.</p>
            </div>
          </aside>

          {/* Boats grid */}
          <div>
            {location && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Filtered by:</span>
                {location && <Badge variant="secondary">{location}</Badge>}
                {type && <Badge variant="secondary">{getBoatTypeLabel(type)}</Badge>}
                {guests && <Badge variant="secondary">{guests}+ guests</Badge>}
              </div>
            )}
            {boats.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <Anchor className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-semibold text-lg mb-1">No boats match your filters</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search criteria.</p>
                <Link href="/boats"><Button>Clear filters</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {boats.map((boat) => (
                  <BoatCard key={boat.id} boat={{
                    ...boat,
                    images: JSON.parse(boat.images),
                    amenities: JSON.parse(boat.amenities),
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
