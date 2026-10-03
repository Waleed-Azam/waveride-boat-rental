import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Simulates pushing pending changes to external booking platform
export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Simulate API delay
  await new Promise((r) => setTimeout(r, 800))

  // Find pending sync items
  const pendingBoats = await prisma.boat.findMany({ where: { syncStatus: "pending" } })
  const pendingBookings = await prisma.booking.findMany({ where: { syncStatus: "pending" } })

  let successCount = 0
  let failCount = 0

  for (const boat of pendingBoats) {
    const willFail = Math.random() < 0.05 // 5% simulated failure
    await prisma.boat.update({
      where: { id: boat.id },
      data: {
        syncStatus: willFail ? "error" : "synced",
        lastSyncedAt: willFail ? boat.lastSyncedAt : new Date(),
      },
    })
    await prisma.syncLog.create({
      data: {
        entityType: "boat",
        entityId: boat.id,
        externalId: boat.externalId,
        action: "push",
        status: willFail ? "failed" : "success",
        direction: "outbound",
        error: willFail ? "External API returned 503" : null,
      },
    })
    willFail ? failCount++ : successCount++
  }

  for (const booking of pendingBookings) {
    const willFail = Math.random() < 0.05
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        syncStatus: willFail ? "error" : "synced",
        lastSyncedAt: willFail ? booking.lastSyncedAt : new Date(),
      },
    })
    await prisma.syncLog.create({
      data: {
        entityType: "booking",
        entityId: booking.id,
        externalId: booking.externalId,
        action: "push",
        status: willFail ? "failed" : "success",
        direction: "outbound",
        error: willFail ? "Connection timeout" : null,
      },
    })
    willFail ? failCount++ : successCount++
  }

  return NextResponse.json({
    pushed: successCount + failCount,
    succeeded: successCount,
    failed: failCount,
  })
}
