import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, getBoatTypeLabel, getStatusColor } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminBoats() {
  const boats = await prisma.boat.findMany({
    include: { owner: { select: { name: true, companyName: true } }, _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <PageHeader title="All Boats" description={`${boats.length} boats on the platform`} />
      <div className="p-8">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Boat</th>
                  <th className="text-left p-4 font-semibold">Owner</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Location</th>
                  <th className="text-left p-4 font-semibold">Price/day</th>
                  <th className="text-left p-4 font-semibold">Bookings</th>
                  <th className="text-left p-4 font-semibold">Sync</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {boats.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={JSON.parse(b.images)[0]} className="h-10 w-14 rounded object-cover" alt="" />
                        <div>
                          <div className="font-semibold">{b.name}</div>
                          <div className="text-xs text-gray-500">{b.length}m · ⭐ {b.rating}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{b.owner.companyName || b.owner.name}</td>
                    <td className="p-4">{getBoatTypeLabel(b.type)}</td>
                    <td className="p-4 text-gray-600">{b.location}</td>
                    <td className="p-4 font-semibold text-blue-700">{formatPrice(b.pricePerDay)}</td>
                    <td className="p-4">{b._count.bookings}</td>
                    <td className="p-4"><Badge variant="secondary" className={b.syncStatus === "synced" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{b.syncStatus}</Badge></td>
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
