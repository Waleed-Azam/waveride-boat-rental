import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Anchor } from "lucide-react"

const destinations = [
  { name: "Mykonos", desc: "Cosmopolitan island with vibrant nightlife and iconic windmills.", img: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800" },
  { name: "Santorini", desc: "Spectacular caldera views, white-washed villages, and sunsets.", img: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800" },
  { name: "Paros", desc: "Crystal waters, traditional villages, and relaxed atmosphere.", img: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800" },
  { name: "Crete", desc: "Greece's largest island with ancient history and diverse coastlines.", img: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800" },
  { name: "Corfu", desc: "Lush Ionian island with Venetian charm and turquoise bays.", img: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800" },
  { name: "Athens Riviera", desc: "Gateway to the islands — sail from the ancient capital.", img: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800" },
]

export default function Destinations() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Greek Island Destinations</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">Discover the most beautiful sailing grounds in the Aegean and Ionian seas.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => (
            <Link key={d.name} href={`/boats?location=${d.name}`}>
              <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition h-full">
                <div className="h-56 overflow-hidden">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-xl">{d.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{d.desc}</p>
                  <Button variant="ghost" size="sm" className="px-0 text-blue-600">Explore boats →</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
