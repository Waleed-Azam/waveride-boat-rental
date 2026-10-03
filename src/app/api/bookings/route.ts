import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calculateDays } from "@/lib/utils"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const role = session.user.role
  const where: any = {}

  if (role === "customer") where.customerId = session.user.id
  else if (role === "owner") {
    where.boat = { ownerId: session.user.id }
  } else if (role === "agency") where.agencyId = session.user.id
  // admin sees all

  const status = searchParams.get("status")
  if (status) where.status = status

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      boat: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
      agency: { select: { id: true, name: true, companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ bookings })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

  try {
    const body = await req.json()
    const { boatId, startDate, endDate, guestCount, specialRequests } = body

    const boat = await prisma.boat.findUnique({ where: { id: boatId } })
    if (!boat) return NextResponse.json({ error: "Boat not found" }, { status: 404 })
    if (boat.status !== "active") return NextResponse.json({ error: "Boat not available" }, { status: 400 })

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) return NextResponse.json({ error: "Invalid dates" }, { status: 400 })

    // Check for conflicting bookings
    const days = calculateDays(start, end)
    const conflict = await prisma.availability.findFirst({
      where: {
        boatId,
        date: { gte: start, lt: end },
        status: { in: ["booked", "blocked"] },
      },
    })
    if (conflict) {
      return NextResponse.json(
        { error: "Selected dates are no longer available. Please choose different dates." },
        { status: 409 }
      )
    }

    const totalPrice = Math.round(boat.pricePerDay * days)
    const externalId = `EXT-BKG-${Math.floor(Math.random() * 900000) + 100000}`

    const booking = await prisma.booking.create({
      data: {
        boatId,
        customerId: session.user.id,
        agencyId: session.user.role === "agency" ? session.user.id : null,
        startDate: start,
        endDate: end,
        guestCount: Number(guestCount),
        totalPrice,
        currency: boat.currency,
        specialRequests,
        externalId,
        syncStatus: "pending",
        status: "pending",
      },
    })

    // Mark dates as booked
    const currentDate = new Date(start)
    while (currentDate < end) {
      await prisma.availability.upsert({
        where: { boatId_date: { boatId, date: new Date(currentDate) } },
        update: { status: "booked", bookingId: booking.id, source: "local" },
        create: { boatId, date: new Date(currentDate), status: "booked", bookingId: booking.id, source: "local" },
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Log sync
    await prisma.syncLog.create({
      data: {
        entityType: "booking",
        entityId: booking.id,
        externalId: booking.externalId,
        action: "create",
        status: "pending",
        direction: "outbound",
        payload: JSON.stringify(booking),
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Booking failed" }, { status: 500 })
  }
}
