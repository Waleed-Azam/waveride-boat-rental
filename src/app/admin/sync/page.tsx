import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SyncButton } from "@/components/sync-button"
import { WebhookTester } from "@/components/webhook-tester"
import { formatDate } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminSyncPage() {
  const [pendingBoats, pendingBookings, syncLogs, failedLogs] = await Promise.all([
    prisma.boat.findMany({ where: { syncStatus: { in: ["pending", "error"] } } }),
    prisma.booking.findMany({ where: { syncStatus: { in: ["pending", "error"] } }, include: { boat: true } }),
    prisma.syncLog.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.syncLog.findMany({ where: { status: "failed" }, orderBy: { createdAt: "desc" }, take: 10 }),
  ])

  return (
    <div>
      <PageHeader
        title="Sync Monitor"
        description="Platform-wide two-way API integration health and activity logs."
        actions={<SyncButton />}
      />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${pendingBoats.length + pendingBookings.length === 0 ? "bg-green-100" : "bg-orange-100"}`}>
                <RefreshCw className={`h-6 w-6 ${pendingBoats.length + pendingBookings.length === 0 ? "text-green-700" : "text-orange-700"}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingBoats.length + pendingBookings.length}</div>
                <div className="text-sm text-gray-500">Items waiting to sync</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">{syncLogs.filter((l) => l.status === "success").length}</div>
                <div className="text-sm text-gray-500">Successful syncs (recent)</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${failedLogs.length === 0 ? "bg-green-100" : "bg-red-100"}`}>
                <XCircle className={`h-6 w-6 ${failedLogs.length === 0 ? "text-green-700" : "text-red-700"}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{failedLogs.length}</div>
                <div className="text-sm text-gray-500">Failed operations</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingBoats.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Pending boats</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingBoats.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="font-medium text-sm">{b.name}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-0.5 rounded">{b.externalId}</code>
                      <Badge variant="secondary" className={b.syncStatus === "error" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{b.syncStatus}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {pendingBookings.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Pending bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="font-medium text-sm">{b.boat.name} · {new Date(b.startDate).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-0.5 rounded">{b.externalId}</code>
                      <Badge variant="secondary" className={b.syncStatus === "error" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{b.syncStatus}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Sync Activity Log (last 80)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-sm">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${log.status === "success" ? "bg-green-100" : "bg-red-100"}`}>
                    {log.direction === "outbound" ? (
                      <ArrowUpRight className={`h-3.5 w-3.5 ${log.status === "success" ? "text-green-700" : "text-red-700"}`} />
                    ) : (
                      <ArrowDownLeft className={`h-3.5 w-3.5 ${log.status === "success" ? "text-green-700" : "text-red-700"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium">{log.action}</span>
                      <Badge variant="secondary" className="text-xs">{log.entityType}</Badge>
                      <span className="text-xs text-gray-500">{log.direction}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {formatDate(log.createdAt)} · {log.externalId || "—"}{log.error ? ` · Error: ${log.error}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <WebhookTester />
      </div>
    </div>
  )
}
