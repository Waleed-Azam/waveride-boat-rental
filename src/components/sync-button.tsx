"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const sync = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sync/push", { method: "POST" })
      const data = await res.json()
      toast.success(`Sync complete: ${data.succeeded} pushed${data.failed > 0 ? `, ${data.failed} failed` : ""}`)
      router.refresh()
    } catch (e) {
      toast.error("Sync failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={sync} disabled={loading}>
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Syncing..." : "Push to External API"}
    </Button>
  )
}
