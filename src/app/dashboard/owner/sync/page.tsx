import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SyncButton } from "@/components/sync-button"
import { WebhookTester } from "@/components/webhook-tester"
import { formatDate } from "@/lib/utils"
import { RefreshCw, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OwnerSyncPage() {
  const session = await auth()
  if (!session) return null

  const [pendingBoats, pendingBookings, syncLogs, externalIds] = await Promise.all([
    prisma.boat.count({ where: { ownerId: session.user.id, syncStatus: { in: ["pending", "error"] } } }),
    prisma.booking.count({ where: { boat: { ownerId: session.user.id }, syncStatus: { in: ["pending", "error"] } } }),
    prisma.syncLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.boat.findMany({ where: { ownerId: session.user.id }, select: { id: true, name: true, externalId: true, syncStatus: true } }),
  ])

  return (
    <div>
      <PageHeader
        title="Sync Center"
        description="Two-way API integration with external booking platforms. Push your changes and receive inbound updates automatically."
        actions={<SyncButton />}
      />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Queue status</div>
                <div className="font-semibold">
                  {pendingBoats + pendingBookings === 0 ? "All synced" : `${pendingBoats + pendingBookings} pending`}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Outbound (pushed)</div>
                <div className="font-semibold">{syncLogs.filter((l) => l.direction === "outbound" && l.status === "success").length} today</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-cyan-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Inbound (received)</div>
                <div className="font-semibold">{syncLogs.filter((l) => l.direction === "inbound").length} webhooks</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500">API latency</div>
                <div className="font-semibold">~280ms avg</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Sync Activity Log</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sync activity yet.</p>
                ) : syncLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.status === "success" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {log.direction === "outbound" ? (
                        <ArrowUpRight className={`h-4 w-4 ${log.status === "success" ? "text-green-700" : "text-red-700"}`} />
                      ) : (
                        <ArrowDownLeft className={`h-4 w-4 ${log.status === "success" ? "text-green-700" : "text-red-700"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm capitalize">{log.action}</span>
                        <Badge variant="secondary" className="text-xs">{log.entityType}</Badge>
                        {log.status === "success" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.direction} · {formatDate(log.createdAt)}
                        {log.externalId ? ` · ${log.externalId}` : ""}
                        {log.error ? ` · ${log.error}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>External IDs</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">Each boat is mapped to an external platform listing.</p>
              <div className="space-y-2">
                {externalIds.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <span className="truncate font-medium">{b.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{b.externalId?.slice(0, 12)}</code>
                      <Badge variant="secondary" className={b.syncStatus === "synced" ? "bg-green-100 text-green-800 text-xs" : "bg-yellow-100 text-yellow-800 text-xs"}>
                        {b.syncStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <WebhookTester />
      </div>
    </div>
  )
}
