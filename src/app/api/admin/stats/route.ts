import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }

  const [userCount, boatCount, bookingCount, revenue, pb, pboat, syncErrors] = await Promise.all([
    prisma.user.count(),
    prisma.boat.count({ where: { status: "active" } }),
    prisma.booking.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "paid" },
    }),
    prisma.booking.count({ where: { syncStatus: "pending" } }),
    prisma.boat.count({ where: { syncStatus: "pending" } }),
    prisma.syncLog.count({ where: { status: "failed" } }),
  ])
  const pendingSync = pb + pboat

  // Recent bookings by month for chart
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const bookingsByMonth = await prisma.booking.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, totalPrice: true, status: true },
    orderBy: { createdAt: "asc" },
  })

  // Top boats
  const topBoats = await prisma.boat.findMany({
    where: { status: "active" },
    include: {
      _count: { select: { bookings: true } },
    },
    orderBy: { bookings: { _count: "desc" } },
    take: 5,
  })

  return NextResponse.json({
    stats: {
      userCount,
      boatCount,
      bookingCount,
      revenue: revenue._sum.amount || 0,
      pendingSync,
      syncErrors,
    },
    bookingsByMonth,
    topBoats,
  })
}
