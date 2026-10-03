import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get("location")
  const type = searchParams.get("type")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const guests = searchParams.get("guests")
  const ownerId = searchParams.get("ownerId")
  const status = searchParams.get("status")

  const where: any = {}
  if (location) where.location = { contains: location, mode: "insensitive" }
  if (type) where.type = type
  if (ownerId) where.ownerId = ownerId
  if (status) where.status = status
  else where.status = "active"
  if (minPrice) where.pricePerDay = { ...where.pricePerDay, gte: Number(minPrice) }
  if (maxPrice) where.pricePerDay = { ...where.pricePerDay, lte: Number(maxPrice) }
  if (guests) where.capacity = { gte: Number(guests) }

  const boats = await prisma.boat.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, companyName: true } },
    },
    orderBy: { rating: "desc" },
  })

  return NextResponse.json({ boats })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user.role !== "owner" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const boat = await prisma.boat.create({
      data: {
        name: body.name,
        type: body.type,
        make: body.make,
        model: body.model,
        year: body.year ? Number(body.year) : null,
        length: Number(body.length),
        capacity: Number(body.capacity),
        cabins: body.cabins ? Number(body.cabins) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        description: body.description,
        location: body.location,
        marina: body.marina,
        pricePerDay: Number(body.pricePerDay),
        currency: body.currency || "EUR",
        images: JSON.stringify(body.images || []),
        amenities: JSON.stringify(body.amenities || []),
        ownerId: session.user.role === "admin" && body.ownerId ? body.ownerId : session.user.id,
        externalId: `EXT-${Math.floor(Math.random() * 90000) + 10000}`,
        syncStatus: "pending",
      },
    })

    // Log sync
    await prisma.syncLog.create({
      data: {
        entityType: "boat",
        entityId: boat.id,
        externalId: boat.externalId,
        action: "create",
        status: "pending",
        direction: "outbound",
        payload: JSON.stringify(boat),
      },
    })

    return NextResponse.json({ boat })
  } catch (error) {
    console.error("Create boat error:", error)
    return NextResponse.json({ error: "Failed to create boat" }, { status: 500 })
  }
}
