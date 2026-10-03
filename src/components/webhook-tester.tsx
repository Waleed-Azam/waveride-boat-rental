"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Zap } from "lucide-react"

// Simulates an external platform sending a webhook to our system
export function WebhookTester() {
  const router = useRouter()
  const [event, setEvent] = useState("booking.cancelled")
  const [boatId, setBoatId] = useState("")
  const [sending, setSending] = useState(false)

  const simulate = async () => {
    if (!boatId) { toast.error("Enter a boat ID"); return }
    setSending(true)
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() + 10)
    const end = new Date(start)
    end.setDate(end.getDate() + 3)
    try {
      const payload = event === "availability.changed" ? {
        event,
        data: {
          boatId,
          dates: [{ date: start.toISOString(), status: "blocked" }],
        },
      } : {
        event,
        data: {
          boatId,
          externalId: `EXT-IN-${Date.now()}`,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      }
      const res = await fetch("/api/sync/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(`Inbound webhook "${event}" processed`)
        router.refresh()
      } else {
        toast.error("Webhook failed")
      }
    } catch (e) {
      toast.error("Webhook error")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="border-purple-300 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Zap className="h-5 w-5" /> Simulate Inbound Webhook
        </CardTitle>
        <CardDescription className="text-purple-700">
          Test the two-way sync by simulating an event pushed from the external booking platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-purple-900">Event Type</Label>
            <Select value={event} onValueChange={(v) => v && setEvent(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking.created">Booking created externally</SelectItem>
                <SelectItem value="booking.cancelled">Booking cancelled externally</SelectItem>
                <SelectItem value="availability.changed">Availability changed externally</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-purple-900">Boat ID</Label>
            <Input value={boatId} onChange={(e) => setBoatId(e.target.value)} placeholder="Boat ID" className="bg-white" />
          </div>
          <Button onClick={simulate} disabled={sending} className="bg-purple-600 hover:bg-purple-700">
            {sending ? "Sending..." : "Send Webhook"}
          </Button>
        </div>
        <p className="text-xs text-purple-700 mt-3">
          In production, this endpoint is secured with API keys and HMAC signatures. The calendar will reflect the change instantly.
        </p>
      </CardContent>
    </Card>
  )
}
