import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { boat: true },
    })
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isOwner = booking.boat.ownerId === session.user.id
    const isCustomer = booking.customerId === session.user.id
    const isAdmin = session.user.role === "admin"
    if (!isOwner && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status, ...rest } = body
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...rest,
        status,
        syncStatus: "pending",
        cancelledAt: status === "cancelled" ? new Date() : booking.cancelledAt,
      },
    })

    // If cancelled, free up availability
    if (status === "cancelled") {
      await prisma.availability.updateMany({
        where: { bookingId: id },
        data: { status: "available", bookingId: null },
      })
    }

    // If confirmed, create payment record
    if (status === "confirmed" && booking.status !== "confirmed") {
      await prisma.payment.create({
        data: {
          bookingId: id,
          amount: booking.totalPrice,
          status: "paid",
          method: "Credit Card",
          transactionId: `TXN-${Math.floor(Math.random() * 900000) + 100000}`,
          paidAt: new Date(),
        },
      })
    }

    await prisma.syncLog.create({
      data: {
        entityType: "booking",
        entityId: id,
        externalId: booking.externalId,
        action: status === "cancelled" ? "cancel" : "update",
        status: "pending",
        direction: "outbound",
        payload: JSON.stringify(body),
      },
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
