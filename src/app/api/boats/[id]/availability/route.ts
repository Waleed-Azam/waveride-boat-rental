import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addDays, startOfDay } from "date-fns"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const months = Number(searchParams.get("months") || 3)

  const startDate = startOfDay(new Date())
  const endDate = addDays(startDate, months * 30)

  const availability = await prisma.availability.findMany({
    where: {
      boatId: id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  })

  return NextResponse.json({ availability })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { dates, status } = body

  const result = await Promise.all(
    dates.map(async (dateStr: string) => {
      const date = startOfDay(new Date(dateStr))
      return prisma.availability.upsert({
        where: { boatId_date: { boatId: id, date } },
        update: { status, source: "local" },
        create: { boatId: id, date, status, source: "local" },
      })
    })
  )

  return NextResponse.json({ success: true, count: result.length })
}
