import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"

// Simulates receiving webhook events from the external booking platform
// In production, this would be a secure, authenticated endpoint

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, data } = body // event: booking.created, booking.cancelled, availability.changed, booking.updated

    await prisma.syncLog.create({
      data: {
        entityType: data.type || "booking",
        entityId: data.entityId || data.id || "unknown",
        externalId: data.externalId,
        action: event.replace(".", "_"),
        status: "success",
        direction: "inbound",
        payload: JSON.stringify(body),
      },
    })

    switch (event) {
      case "booking.created": {
        // External platform created a booking - sync availability
        const start = startOfDay(new Date(data.startDate))
        const end = startOfDay(new Date(data.endDate))
        const current = new Date(start)
        while (current < end) {
          await prisma.availability.upsert({
            where: { boatId_date: { boatId: data.boatId, date: new Date(current) } },
            update: { status: "booked", source: "external" },
            create: { boatId: data.boatId, date: new Date(current), status: "booked", source: "external" },
          })
          current.setDate(current.getDate() + 1)
        }
        break
      }
      case "booking.cancelled": {
        const start = startOfDay(new Date(data.startDate))
        const end = startOfDay(new Date(data.endDate))
        await prisma.availability.updateMany({
          where: {
            boatId: data.boatId,
            date: { gte: start, lt: end },
            source: "external",
          },
          data: { status: "available" },
        })
        break
      }
      case "availability.changed": {
        for (const item of data.dates || []) {
          const date = startOfDay(new Date(item.date))
          await prisma.availability.upsert({
            where: { boatId_date: { boatId: data.boatId, date } },
            update: { status: item.status, source: "external" },
            create: { boatId: data.boatId, date, status: item.status, source: "external" },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
