"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, addDays, differenceInDays, isBefore, startOfDay } from "date-fns"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

export function BookingForm({
  boatId, pricePerDay, currency, capacity, bookedDates,
}: {
  boatId: string
  pricePerDay: number
  currency: string
  capacity: number
  bookedDates: Date[]
}) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState("2")
  const [requests, setRequests] = useState("")
  const [loading, setLoading] = useState(false)

  const disabledDays = useMemo(() => {
    const before = startOfDay(new Date())
    return [
      { before },
      ...bookedDates.map((d) => new Date(d)),
    ]
  }, [bookedDates])

  const nights = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0
    return Math.max(1, differenceInDays(dateRange.to, dateRange.from))
  }, [dateRange])

  const total = nights * pricePerDay
  const serviceFee = Math.round(total * 0.08)
  const grandTotal = total + serviceFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select your dates")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boatId,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          guestCount: Number(guests),
          specialRequests: requests,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Booking failed")
        setLoading(false)
        return
      }
      toast.success("Booking request submitted!")
      router.push("/dashboard/bookings?booked=1")
      router.refresh()
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger>
            <Button type="button" variant="outline" className="col-span-2 justify-start text-left font-normal w-full">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                <span className="text-gray-500">Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={disabledDays}
              numberOfMonths={2}
              defaultMonth={new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guests">Guests</Label>
        <Select value={guests} onValueChange={(v) => v && setGuests(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: capacity }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={String(n)}>{n} guest{n > 1 ? "s" : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requests">Special requests (optional)</Label>
        <Textarea
          id="requests"
          value={requests}
          onChange={(e) => setRequests(e.target.value)}
          placeholder="Champagne on arrival? Skipper needed?"
          rows={2}
        />
      </div>

      {nights > 0 && (
        <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{formatPrice(pricePerDay, currency)} × {nights} night{nights > 1 ? "s" : ""}</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Service fee (8%)</span>
            <span>{formatPrice(serviceFee, currency)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{formatPrice(grandTotal, currency)}</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6" disabled={loading || nights === 0}>
        {loading ? "Submitting..." : "Request to Book"}
      </Button>
    </form>
  )
}
