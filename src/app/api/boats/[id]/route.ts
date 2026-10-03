import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const boat = await prisma.boat.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, companyName: true, phone: true, email: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  })
  if (!boat) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ boat })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const boat = await prisma.boat.findUnique({ where: { id } })
  if (!boat) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (boat.ownerId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const updated = await prisma.boat.update({
      where: { id },
      data: {
        ...body,
        images: body.images ? JSON.stringify(body.images) : undefined,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        syncStatus: "pending",
      },
    })

    await prisma.syncLog.create({
      data: {
        entityType: "boat",
        entityId: id,
        externalId: updated.externalId,
        action: "update",
        status: "pending",
        direction: "outbound",
        payload: JSON.stringify(body),
      },
    })

    return NextResponse.json({ boat: updated })
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const boat = await prisma.boat.findUnique({ where: { id } })
  if (!boat) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (boat.ownerId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.boat.update({ where: { id }, data: { status: "inactive", syncStatus: "pending" } })
  return NextResponse.json({ success: true })
}
