"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Check, X } from "lucide-react"

export function BookingActions({ bookingId, currentStatus, isOwner }: {
  bookingId: string
  currentStatus: string
  isOwner: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success(status === "confirmed" ? "Booking confirmed" : status === "cancelled" ? "Booking cancelled" : "Booking updated")
      router.refresh()
    } catch (e) {
      toast.error("Action failed")
    } finally {
      setLoading(false)
      setAlertOpen(false)
    }
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") return null

  return (
    <div className="flex gap-2 ml-auto">
      {isOwner && currentStatus === "pending" && (
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus("confirmed")} disabled={loading}>
          <Check className="h-4 w-4 mr-1" /> Confirm
        </Button>
      )}
      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={loading} onClick={() => setAlertOpen(true)}>
        <X className="h-4 w-4 mr-1" /> Cancel
      </Button>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will release the dates back to the calendar and notify the external sync system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateStatus("cancelled")} className="bg-red-600 hover:bg-red-700">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
