"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

const boatImages = [
  "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
  "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800",
  "https://images.unsplash.com/photo-1621277101888-ddc5b64f9c79?w=800",
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800",
  "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800",
]

export function AddBoatDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "", type: "yacht", location: "", length: "12", capacity: "8",
    cabins: "2", bathrooms: "1", pricePerDay: "800", description: "",
    amenities: "WiFi,Air Conditioning,Snorkeling Gear",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      length: Number(form.length),
      capacity: Number(form.capacity),
      cabins: Number(form.cabins),
      bathrooms: Number(form.bathrooms),
      pricePerDay: Number(form.pricePerDay),
      images: [boatImages[Math.floor(Math.random() * boatImages.length)], boatImages[Math.floor(Math.random() * boatImages.length)], boatImages[Math.floor(Math.random() * boatImages.length)]],
      amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    }
    try {
      const res = await fetch("/api/boats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success("Boat created! Syncing with external platform...")
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast.error("Failed to create boat")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" /> Add Boat
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Boat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label>Boat Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sea Breeze II" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yacht">Motor Yacht</SelectItem>
                    <SelectItem value="sailboat">Sailboat</SelectItem>
                    <SelectItem value="catamaran">Catamaran</SelectItem>
                    <SelectItem value="motorboat">Motorboat</SelectItem>
                    <SelectItem value="rib">RIB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mykonos, Greece" />
              </div>
              <div className="space-y-2">
                <Label>Length (m)</Label>
                <Input type="number" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Capacity (guests)</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cabins</Label>
                <Input type="number" value={form.cabins} onChange={(e) => setForm({ ...form, cabins: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Price per day (€)</Label>
                <Input type="number" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Amenities (comma separated)</Label>
                <Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your boat..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Creating..." : "Create Boat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
