import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      boat: true,
      customer: { select: { name: true, email: true } },
      agency: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <PageHeader title="All Bookings" description={`${bookings.length} bookings across the platform`} />
      <div className="p-8">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">ID</th>
                  <th className="text-left p-4 font-semibold">Boat</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Dates</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                  <th className="text-left p-4 font-semibold">Sync</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs text-gray-500">{b.id.slice(0, 8)}</td>
                    <td className="p-4 font-medium">{b.boat.name}</td>
                    <td className="p-4">
                      <div>{b.customer.name}</div>
                      {b.agency && <Badge variant="secondary" className="text-xs mt-1">via {b.agency.companyName}</Badge>}
                    </td>
                    <td className="p-4 text-gray-600">{formatDate(b.startDate)} – {formatDate(b.endDate)}</td>
                    <td className="p-4 font-semibold text-blue-700">{formatPrice(b.totalPrice)}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className={b.syncStatus === "synced" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {b.syncStatus}
                      </Badge>
                    </td>
                    <td className="p-4"><Badge className={getStatusColor(b.status)}>{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
