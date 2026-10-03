import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const boatImages = [
  "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
  "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800",
  "https://images.unsplash.com/photo-1621277101888-ddc5b64f9c79?w=800",
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800",
  "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800",
  "https://images.unsplash.com/photo-1608855419638-06a41a2b3a2e?w=800",
  "https://images.unsplash.com/photo-1571882864003-47ea2a9ef4a9?w=800",
]

const locations = [
  "Mykonos, Greece", "Santorini, Greece", "Athens, Greece",
  "Paros, Greece", "Crete, Greece", "Corfu, Greece",
]

const boatTypes = ["yacht", "sailboat", "catamaran", "motorboat", "rib"]
const amenities = ["WiFi", "Air Conditioning", "Snorkeling Gear", "Kayak", "Bluetooth Sound System", "Sun Deck", "BBQ", "Shower", "Toilet", "Kitchen", "GPS", "Safety Equipment"]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const boatNames = [
  "Sea Breeze", "Aegean Queen", "Blue Horizon", "Ocean Dreamer", "Wind Dancer",
  "Mediterranean Star", "Poseidon's Pride", "Golden Wave", "Sapphire Seas", "Nautical Nomad",
  "Athena", "Zorba the Greek", "Santorini Sky", "Mykonos Magic", "Aeolus",
]

async function main() {
  console.log("🌊 Seeding database...")

  // Clean
  await prisma.syncLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.boat.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const passwordHash = await bcrypt.hash("demo1234", 10)

  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@boatrent.com",
      password: passwordHash,
      role: "admin",
      phone: "+30 210 1234567",
    },
  })

  const owner1 = await prisma.user.create({
    data: {
      name: "Nikos Papadopoulos",
      email: "owner@boatrent.com",
      password: passwordHash,
      role: "owner",
      companyName: "Aegean Yachting Co.",
      phone: "+30 210 9876543",
    },
  })

  const owner2 = await prisma.user.create({
    data: {
      name: "Maria Konstantinou",
      email: "maria@boatrent.com",
      password: passwordHash,
      role: "owner",
      companyName: "Cyclades Charters",
      phone: "+30 2289 012345",
    },
  })

  const agency = await prisma.user.create({
    data: {
      name: "Travel Booker",
      email: "agency@boatrent.com",
      password: passwordHash,
      role: "agency",
      companyName: "Greek Islands Travel SA",
      phone: "+30 210 5555555",
    },
  })

  const customer = await prisma.user.create({
    data: {
      name: "John Traveler",
      email: "customer@boatrent.com",
      password: passwordHash,
      role: "customer",
      phone: "+1 555 0123",
    },
  })

  console.log("✅ Users created")

  // Create boats
  const owners = [owner1, owner2]
  const boats = []

  for (let i = 0; i < 12; i++) {
    const owner = pickRandom(owners)
    const type = pickRandom(boatTypes)
    const pricePerDay = randomInt(350, 3500)
    const boatAmenities = amenities.sort(() => Math.random() - 0.5).slice(0, randomInt(4, 8))
    const boat = await prisma.boat.create({
      data: {
        name: boatNames[i],
        type,
        make: pickRandom(["Beneteau", "Jeanneau", "Lagoon", "Sunseeker", "Bavaria", "Azimut"]),
        model: pickRandom(["Oceanis", "Swift Trawler", "Lagoon 42", "Portofino 40", "Cruiser 46"]),
        year: randomInt(2015, 2024),
        length: type === "rib" ? randomInt(6, 12) : randomInt(9, 25),
        capacity: randomInt(4, 12),
        cabins: type === "rib" ? 0 : randomInt(1, 4),
        bathrooms: type === "rib" ? 0 : randomInt(1, 3),
        description: `Experience the beauty of the Greek islands aboard ${boatNames[i]}, a well-maintained ${type.replace("-", " ")} perfect for day trips and multi-day charters. Our professional crew will ensure an unforgettable sailing experience with crystal-clear waters, stunning sunsets, and hidden coves accessible only by boat. The vessel is fully equipped with safety gear, navigation equipment, and all the comforts you need for a memorable maritime adventure.`,
        location: pickRandom(locations),
        marina: pickRandom(["Old Port Marina", "New Port", "Tourist Harbor", "Yacht Club Marina"]),
        pricePerDay,
        images: JSON.stringify([
          pickRandom(boatImages),
          pickRandom(boatImages),
          pickRandom(boatImages),
          pickRandom(boatImages),
        ]),
        amenities: JSON.stringify(boatAmenities),
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: randomInt(3, 48),
        ownerId: owner.id,
        externalId: `EXT-${randomInt(10000, 99999)}`,
        syncStatus: Math.random() > 0.1 ? "synced" : "pending",
        lastSyncedAt: new Date(),
      },
    })
    boats.push(boat)
  }
  console.log("✅ Boats created")

  // Create availability for next 90 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const boat of boats) {
    for (let d = 0; d < 90; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const rand = Math.random()
      let status = "available"
      let source = "local"
      if (rand > 0.75) {
        status = "booked"
        source = rand > 0.88 ? "external" : "local"
      } else if (rand > 0.68) {
        status = "blocked"
      }
      await prisma.availability.create({
        data: { boatId: boat.id, date, status, source },
      })
    }
  }
  console.log("✅ Availability created")

  // Create bookings
  const bookingStatuses = ["pending", "confirmed", "confirmed", "confirmed", "completed", "cancelled"]
  const createdBookings = []
  for (let i = 0; i < 8; i++) {
    const boat = pickRandom(boats)
    const booker = Math.random() > 0.3 ? customer : agency
    const startOffset = randomInt(2, 60)
    const duration = randomInt(2, 7)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() + startOffset)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration)
    const status = pickRandom(bookingStatuses)
    const booking = await prisma.booking.create({
      data: {
        boatId: boat.id,
        customerId: customer.id,
        agencyId: booker.role === "agency" ? booker.id : null,
        startDate,
        endDate,
        guestCount: randomInt(2, boat.capacity),
        status,
        totalPrice: Math.round(boat.pricePerDay * duration * (0.9 + Math.random() * 0.2)),
        specialRequests: Math.random() > 0.5 ? "We would like a chilled bottle of champagne on arrival." : null,
        externalId: Math.random() > 0.4 ? `EXT-BKG-${randomInt(10000, 99999)}` : null,
        syncStatus: Math.random() > 0.2 ? "synced" : "pending",
        lastSyncedAt: Math.random() > 0.3 ? new Date() : null,
        cancelledAt: status === "cancelled" ? new Date() : null,
      },
    })
    createdBookings.push(booking)

    // Create payment for confirmed/completed
    if (status === "confirmed" || status === "completed") {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          status: "paid",
          method: "Credit Card",
          transactionId: `TXN-${randomInt(100000, 999999)}`,
          paidAt: new Date(),
        },
      })
    }
  }
  console.log("✅ Bookings created")

  // Create reviews
  for (const boat of boats) {
    const reviewCount = randomInt(1, 3)
    for (let r = 0; r < reviewCount; r++) {
      await prisma.review.create({
        data: {
          boatId: boat.id,
          userId: customer.id,
          rating: randomInt(4, 5),
          comment: pickRandom([
            "Amazing experience! The boat was immaculate and the crew was wonderful.",
            "Perfect day out on the water. Highly recommended!",
            "Beautiful boat, great service, stunning locations. Will book again.",
            "Captain was very knowledgeable about the best spots. Fantastic trip!",
          ]),
        },
      })
    }
  }

  // Create sync logs
  const syncActions = ["create", "update", "cancel", "push", "pull"]
  for (let i = 0; i < 20; i++) {
    await prisma.syncLog.create({
      data: {
        entityType: pickRandom(["boat", "booking", "availability"]),
        entityId: pickRandom(boats).id,
        externalId: `EXT-${randomInt(10000, 99999)}`,
        action: pickRandom(syncActions),
        status: Math.random() > 0.1 ? "success" : "failed",
        direction: Math.random() > 0.5 ? "outbound" : "inbound",
        payload: JSON.stringify({ synced: true, timestamp: new Date().toISOString() }),
        error: Math.random() > 0.9 ? "External API timeout" : null,
        createdAt: new Date(Date.now() - randomInt(0, 7) * 86400000),
      },
    })
  }
  console.log("✅ Sync logs created")
  console.log("\n🌊 Database seeded successfully!")
  console.log("\nDemo accounts (password: demo1234):")
  console.log("  Admin:    admin@boatrent.com")
  console.log("  Owner:    owner@boatrent.com")
  console.log("  Owner 2:  maria@boatrent.com")
  console.log("  Agency:   agency@boatrent.com")
  console.log("  Customer: customer@boatrent.com")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
