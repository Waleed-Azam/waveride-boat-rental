import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Ruler, Star, MapPin, Bed, Bath } from "lucide-react"
import { formatPrice, getBoatTypeLabel } from "@/lib/utils"

type BoatForCard = {
  id: string
  name: string
  type: string
  images: string[]
  amenities?: string[]
  location: string
  pricePerDay: number
  currency: string
  length: number
  capacity: number
  cabins?: number | null
  bathrooms?: number | null
  rating: number
  reviewCount: number
  syncStatus: string
}

export function BoatCard({ boat }: { boat: BoatForCard }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      <div className="relative h-52 overflow-hidden">
        <img
          src={boat.images[0]}
          alt={boat.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white">{getBoatTypeLabel(boat.type)}</Badge>
          {boat.syncStatus === "synced" ? (
            <Badge className="bg-green-500/90 text-white hover:bg-green-500">● Live</Badge>
          ) : (
            <Badge className="bg-yellow-500/90 text-white hover:bg-yellow-500">Syncing</Badge>
          )}
        </div>
      </div>
      <CardContent className="flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-lg leading-tight">{boat.name}</h3>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{boat.rating}</span>
            <span className="text-gray-400 text-xs">({boat.reviewCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5" /> {boat.location}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {boat.capacity}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-4 w-4" /> {boat.length}m
          </span>
          {boat.cabins ? (
            <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {boat.cabins}</span>
          ) : null}
          {boat.bathrooms ? (
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {boat.bathrooms}</span>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between border-t mt-auto">
        <div>
          <div className="text-2xl font-bold text-blue-700">
            {formatPrice(boat.pricePerDay, boat.currency)}
            <span className="text-sm font-normal text-gray-500">/day</span>
          </div>
        </div>
        <Link href={`/boats/${boat.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
