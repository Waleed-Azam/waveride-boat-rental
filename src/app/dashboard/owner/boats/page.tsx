import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, getBoatTypeLabel, getStatusColor } from "@/lib/utils"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { AddBoatDialog } from "@/components/add-boat-dialog"

export const dynamic = "force-dynamic"

export default async function OwnerBoatsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const session = await auth()
  if (!session) return null
  const sp = await searchParams
  const showNew = sp.new === "1"

  const boats = await prisma.boat.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <PageHeader
        title="My Boats"
        description="List and manage all boats in your fleet."
        actions={<AddBoatDialog defaultOpen={showNew} />}
      />
      <div className="p-8">
        {boats.length === 0 ? (
          <Card>
            <CardContent className="p-16 text-center">
              <h3 className="font-semibold mb-2">No boats yet</h3>
              <p className="text-gray-500 mb-4">Add your first boat to start accepting bookings.</p>
              <AddBoatDialog />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Boat</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Location</th>
                    <th className="text-left p-4 font-semibold">Price/day</th>
                    <th className="text-left p-4 font-semibold">Bookings</th>
                    <th className="text-left p-4 font-semibold">Sync</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="p-4"></th>
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
                            <div className="text-xs text-gray-500">{b.length}m · {b.capacity} guests</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getBoatTypeLabel(b.type)}</td>
                      <td className="p-4 text-gray-600">{b.location}</td>
                      <td className="p-4 font-semibold text-blue-700">{formatPrice(b.pricePerDay)}</td>
                      <td className="p-4">{b._count.bookings}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className={b.syncStatus === "synced" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {b.syncStatus}
                        </Badge>
                      </td>
                      <td className="p-4"><Badge className={getStatusColor(b.status)}>{b.status}</Badge></td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Link href={`/boats/${b.id}`}><Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
