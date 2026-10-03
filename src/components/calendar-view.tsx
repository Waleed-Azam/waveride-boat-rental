"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  addMonths, format, isBefore, startOfDay, isSameDay, startOfMonth,
  endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
} from "date-fns"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

type AvailItem = { date: string; status: string; source: string }

export function CalendarView({ boatId, initialAvailability }: { boatId: string; initialAvailability: AvailItem[] }) {
  const router = useRouter()
  const [baseMonth] = useState<Date>(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [bulkAction, setBulkAction] = useState<string>("blocked")
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState<AvailItem[]>(initialAvailability)

  const getStatus = (date: Date): AvailItem | undefined => {
    return availability.find((a) => isSameDay(new Date(a.date), date))
  }

  const toggleDate = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return
    const av = getStatus(date)
    if (av?.source === "external") {
      toast.error("Externally-booked dates are managed by the partner platform")
      return
    }
    const idx = selectedDates.findIndex((d) => isSameDay(d, date))
    if (idx >= 0) setSelectedDates(selectedDates.filter((_, i) => i !== idx))
    else setSelectedDates([...selectedDates, date])
  }

  const applyBulk = async () => {
    if (selectedDates.length === 0) {
      toast.error("Select dates first")
      return
    }
    setSaving(true)
    try {
      await fetch(`/api/boats/${boatId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: selectedDates.map((d) => d.toISOString()), status: bulkAction }),
      })
      toast.success(`${selectedDates.length} date(s) updated. Sync queued.`)
      const newAvail = [...availability]
      selectedDates.forEach((d) => {
        const existing = newAvail.findIndex((a) => isSameDay(new Date(a.date), d))
        if (existing >= 0) newAvail[existing] = { date: d.toISOString(), status: bulkAction, source: "local" }
        else newAvail.push({ date: d.toISOString(), status: bulkAction, source: "local" })
      })
      setAvailability(newAvail)
      setSelectedDates([])
      router.refresh()
    } catch (e) {
      toast.error("Update failed")
    } finally {
      setSaving(false)
    }
  }

  const renderMonth = (offset: number) => {
    const monthStart = startOfMonth(addMonths(baseMonth, offset))
    const monthEnd = endOfMonth(monthStart)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calStart, end: calEnd })
    return (
      <div key={offset} className="border rounded-lg p-3">
        <div className="text-center font-semibold mb-2">{format(monthStart, "MMMM yyyy")}</div>
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center py-1 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const av = getStatus(day)
            const inMonth = isSameMonth(day, monthStart)
            const isPast = isBefore(day, startOfDay(new Date()))
            const isExternal = av?.source === "external" && av?.status !== "available"
            const isSelected = selectedDates.some((d) => isSameDay(d, day))
            let bg = ""
            if (inMonth && av) {
              if (av.status === "booked") bg = isExternal ? "bg-purple-200 text-purple-900" : "bg-blue-200 text-blue-900"
              else if (av.status === "blocked") bg = "bg-gray-300 text-gray-700"
              else if (av.status === "maintenance") bg = "bg-yellow-200 text-yellow-900"
            }
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => toggleDate(day)}
                disabled={isPast || !inMonth}
                className={`
                  aspect-square text-sm rounded transition-colors
                  ${!inMonth ? "text-gray-300" : ""}
                  ${isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50"}
                  ${bg}
                  ${isSelected ? "ring-2 ring-blue-600 ring-offset-1" : ""}
                  ${isExternal ? "cursor-not-allowed" : ""}
                `}
                title={isExternal ? "External booking — synced" : av?.status}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Availability Calendar · Next 3 months</CardTitle>
          <div className="flex gap-2 flex-wrap items-center">
            <Badge variant="secondary"><span className="inline-block w-3 h-3 rounded bg-white border mr-1.5" /> Available</Badge>
            <Badge variant="secondary"><span className="inline-block w-3 h-3 rounded bg-blue-200 mr-1.5" /> Booked (local)</Badge>
            <Badge variant="secondary"><span className="inline-block w-3 h-3 rounded bg-purple-200 mr-1.5" /> External</Badge>
            <Badge variant="secondary"><span className="inline-block w-3 h-3 rounded bg-gray-300 mr-1.5" /> Blocked</Badge>
            <Badge variant="secondary"><span className="inline-block w-3 h-3 rounded bg-yellow-200 mr-1.5" /> Maint.</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-blue-700 shrink-0" />
          <p className="text-sm text-blue-800 flex-1">
            Click dates to select them, then apply an action. Purple dates are booked via external partner platforms — they are synced automatically and cannot be modified here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={bulkAction} onValueChange={(v) => v && setBulkAction(v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Mark as Available</SelectItem>
              <SelectItem value="blocked">Block (owner hold)</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={applyBulk} disabled={saving || selectedDates.length === 0} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Saving..." : `Apply to ${selectedDates.length} date${selectedDates.length !== 1 ? "s" : ""}`}
          </Button>
          <Button variant="ghost" onClick={() => setSelectedDates([])} disabled={selectedDates.length === 0}>Clear selection</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(renderMonth)}
        </div>
      </CardContent>
    </Card>
  )
}
