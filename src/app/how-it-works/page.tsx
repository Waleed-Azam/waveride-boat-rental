import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, CheckCircle, Ship, Anchor, RefreshCw } from "lucide-react"

const steps = [
  { icon: Search, title: "1. Browse & Filter", desc: "Search our fleet by destination, dates, boat type, and guest count. All listings show real-time availability." },
  { icon: Calendar, title: "2. Select your dates", desc: "Pick your dates on the live calendar. You'll only see dates that are actually available across all platforms." },
  { icon: CheckCircle, title: "3. Request to book", desc: "Send your booking request with any special requirements. The owner confirms quickly, usually within hours." },
  { icon: Ship, title: "4. Set sail!", desc: "Pay securely, receive your boarding details, and get ready for an unforgettable Aegean adventure." },
]

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Anchor className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-3">How WaveRide Works</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">From first click to first cast-off — a simple, transparent process.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {steps.map((s) => (
            <Card key={s.title} className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-4">
                  <s.icon className="h-7 w-7 text-blue-700" />
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1 text-sm font-medium text-blue-700 mb-4">
                <RefreshCw className="h-4 w-4" /> Two-Way API Sync
              </div>
              <h2 className="text-3xl font-bold mb-3">No double bookings. Ever.</h2>
              <p className="text-gray-700 mb-4">
                Our platform integrates bi-directionally with major external booking platforms. When a boat is booked here,
                it's automatically blocked on those channels — and when it's booked externally, our calendar updates in real time.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-600 shrink-0" /> Live availability sync across all channels</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-600 shrink-0" /> Automatic cancellation & change propagation</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-600 shrink-0" /> Audit trail & sync logs for transparency</li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-600 shrink-0" /> Conflict resolution alerts for owners</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-3">For Owners & Agencies</h3>
              <p className="text-gray-600 text-sm mb-4">
                We provide dedicated dashboards with the tools you need to run your charter business at scale.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-sm">O</div>
                  <div><div className="font-semibold text-sm">Boat Owner Dashboard</div><div className="text-xs text-gray-500">Fleet management, calendar, bookings, sync</div></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center shrink-0 text-purple-700 font-bold text-sm">A</div>
                  <div><div className="font-semibold text-sm">Travel Agency Portal</div><div className="text-xs text-gray-500">Client bookings across the entire fleet</div></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center shrink-0 text-red-700 font-bold text-sm">!</div>
                  <div><div className="font-semibold text-sm">Admin Control Panel</div><div className="text-xs text-gray-500">Platform oversight, analytics, user mgmt</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/boats"><Button size="lg" className="bg-blue-600 hover:bg-blue-700">Start exploring boats</Button></Link>
        </div>
      </div>
    </div>
  )
}
