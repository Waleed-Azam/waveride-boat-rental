import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Anchor, Calendar, Shield, MapPin, Waves, Users, Star, ArrowRight,
  CheckCircle, Zap, RefreshCw, Building2, UserCog, LayoutDashboard,
} from "lucide-react"

const features = [
  { icon: Calendar, title: "Real-time Availability", desc: "Live calendars updated instantly — no double bookings, ever." },
  { icon: Shield, title: "Secure Bookings", desc: "Verified owners, insured vessels, and secure payments." },
  { icon: RefreshCw, title: "Two-Way Sync", desc: "API integration syncs bookings across external platforms." },
  { icon: MapPin, title: "Top Destinations", desc: "Mykonos, Santorini, Paros, Crete — discover the Greek islands." },
  { icon: Zap, title: "Instant Confirmation", desc: "Get confirmed within minutes of your booking request." },
  { icon: Users, title: "For Everyone", desc: "Private charters, travel agencies, and boat owners welcome." },
]

const boatTypes = [
  { name: "Motor Yachts", icon: Anchor, count: "45+" },
  { name: "Sailboats", icon: Waves, count: "30+" },
  { name: "Catamarans", icon: Users, count: "25+" },
  { name: "RIBs & Speedboats", icon: Zap, count: "40+" },
]

const stats = [
  { value: "140+", label: "Boats Available" },
  { value: "12", label: "Greek Destinations" },
  { value: "8K+", label: "Happy Sailors" },
  { value: "4.9", label: "Average Rating" },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-6">
              ⚓ Greece's Premier Boat Rental Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
              Set Sail for the{" "}
              <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                Greek Islands
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto text-balance">
              Discover and book the perfect yacht, sailboat, or catamaran for your Aegean adventure.
              Real-time availability, secure bookings, and seamless two-way sync with global charter platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/boats">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 w-full sm:w-auto font-semibold">
                  Browse Boats <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                  How it Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-2">
            <form action="/boats" method="get" className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="p-3">
                <label className="text-xs font-semibold text-gray-500 uppercase">Destination</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <input
                    name="location"
                    type="text"
                    placeholder="Mykonos, Santorini..."
                    className="w-full text-sm text-gray-900 outline-none bg-transparent"
                  />
                </div>
              </div>
              <div className="p-3 md:border-l">
                <label className="text-xs font-semibold text-gray-500 uppercase">Boat Type</label>
                <select name="type" className="w-full text-sm text-gray-900 outline-none bg-transparent mt-1">
                  <option value="">All types</option>
                  <option value="yacht">Motor Yacht</option>
                  <option value="sailboat">Sailboat</option>
                  <option value="catamaran">Catamaran</option>
                  <option value="motorboat">Motorboat</option>
                  <option value="rib">RIB</option>
                </select>
              </div>
              <div className="p-3 md:border-l">
                <label className="text-xs font-semibold text-gray-500 uppercase">Guests</label>
                <select name="guests" className="w-full text-sm text-gray-900 outline-none bg-transparent mt-1">
                  <option value="">Any</option>
                  <option value="2">2+ guests</option>
                  <option value="4">4+ guests</option>
                  <option value="6">6+ guests</option>
                  <option value="8">8+ guests</option>
                  <option value="10">10+ guests</option>
                </select>
              </div>
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 h-full">
                Search Boats
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-700">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">Why WaveRide</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              The smarter way to rent a boat in Greece
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with modern tech for reliability, featuring two-way API synchronization with major booking platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Boat types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge className="mb-3 bg-cyan-100 text-cyan-700 hover:bg-cyan-100">Our Fleet</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Browse by boat type</h2>
            </div>
            <Link href="/boats" className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {boatTypes.map((t) => (
              <Link key={t.name} href={`/boats?type=${t.name.toLowerCase().includes("motor") ? "yacht" : t.name.toLowerCase().split(" ")[0]}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-8 text-center">
                    <t.icon className="h-12 w-12 mx-auto text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.count} available</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* For owners & agencies */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-white/10 text-white hover:bg-white/10">For Partners</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Grow your charter business</h2>
            <p className="text-gray-300 mt-3 max-w-2xl mx-auto">
              Dedicated dashboards for boat owners and travel agencies with powerful tools.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 border-white/10 backdrop-blur">
              <CardContent className="p-6">
                <UserCog className="h-10 w-10 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Boat Owners</h3>
                <p className="text-gray-300 text-sm mb-4">
                  List your boats, manage availability calendars, track bookings, and sync automatically with external charter platforms.
                </p>
                <ul className="space-y-2 text-sm">
                  {["Availability calendar", "Booking management", "Performance analytics", "Two-way API sync"].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" /> {i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/10 backdrop-blur">
              <CardContent className="p-6">
                <Building2 className="h-10 w-10 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Travel Agencies</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Browse the entire fleet, make bookings for clients, manage reservations in one unified agency dashboard.
                </p>
                <ul className="space-y-2 text-sm">
                  {["Multi-booking support", "Client management", "Agency rates", "Centralized dashboard"].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" /> {i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/10 backdrop-blur">
              <CardContent className="p-6">
                <LayoutDashboard className="h-10 w-10 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Full platform administration with user management, sync monitoring, revenue tracking, and audit logs.
                </p>
                <ul className="space-y-2 text-sm">
                  {["Platform analytics", "Sync health dashboard", "User role management", "Booking oversight"].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" /> {i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                Create your partner account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed mb-6 text-balance">
            "WaveRide transformed our charter business. The two-way sync means we never worry about double bookings,
            and the owner dashboard gives us everything we need to manage our fleet of 8 boats."
          </blockquote>
          <div>
            <div className="font-semibold">Nikos Papadopoulos</div>
            <div className="text-sm text-gray-500">Aegean Yachting Co. · Mykonos, Greece</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for your next adventure?</h2>
          <p className="text-blue-50 mb-8 max-w-xl mx-auto">
            Join thousands of sailors discovering the Greek islands with WaveRide.
          </p>
          <Link href="/boats">
            <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
              Explore Boats Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
                <Anchor className="h-6 w-6 text-cyan-400" /> WaveRide
              </div>
              <p className="text-sm">
                Greece's modern boat rental platform. Sailing the Aegean, made simple.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/boats" className="hover:text-white">All Boats</Link></li>
                <li><Link href="/destinations" className="hover:text-white">Destinations</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Partners</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register?role=owner" className="hover:text-white">List Your Boat</Link></li>
                <li><Link href="/register?role=agency" className="hover:text-white">Travel Agencies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Demo</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><span className="text-xs">Demo password: <code className="text-cyan-400">demo1234</code></span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm flex flex-col md:flex-row justify-between gap-2">
            <p>© {new Date().getFullYear()} WaveRide. Demo boat rental platform.</p>
            <p>Built for Greek charter excellence ⚓</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
