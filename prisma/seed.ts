// prisma/seed.ts
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  BookingMode,
  ResourceStatus,
  ReservationStatus,
} from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/** A UTC timestamp N days from today at a given hour/minute. */
function utcDay(dayOffset: number, hour = 0, minute = 0): Date {
  const d = new Date();
  d.setUTCHours(hour, minute, 0, 0);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d;
}

async function main() {
  console.log("[seed] start");

  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
  console.log("[seed] cleared existing rows");

  const userHash = await bcrypt.hash("Password123!", 10);
  const adminHash = await bcrypt.hash("Admin123!", 10);

  const userSeeds = [
    { name: "Alice Perera",     email: "alice@example.com" },
    { name: "Bob Fernando",     email: "bob@example.com" },
    { name: "Carol Silva",      email: "carol@example.com" },
    { name: "Dave Jayawardena", email: "dave@example.com" },
    { name: "Eve Wijesinghe",   email: "eve@example.com" },
    { name: "Frank Dias",       email: "frank@example.com" },
    { name: "Grace Peiris",     email: "grace@example.com" },
    { name: "Heidi Gunasekara", email: "heidi@example.com" },
    { name: "Ivan Rajapaksa",   email: "ivan@example.com" },
    { name: "Judy Senanayake",  email: "judy@example.com" },
  ];

  const users = await Promise.all(
    userSeeds.map((u) =>
      prisma.user.create({
        data: { ...u, passwordHash: userHash, role: Role.USER },
      }),
    ),
  );

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log(`[seed] users: ${users.length} + admin (${admin.email})`);

  const [roomA, roomB, hall, van, projector, speaker] = await Promise.all([
    prisma.resource.create({
      data: {
        name: "Conference Room A",
        description: "Main meeting room with whiteboard and video conferencing.",
        location: "Floor 2, West Wing",
        capacity: 10,
        bookingMode: BookingMode.HOURLY,
        slotMinutes: 30,
        minMinutes: 30,
        maxMinutes: 240,
        openTime: "08:00",
        closeTime: "18:00",
      },
    }),
    prisma.resource.create({
      data: {
        name: "Conference Room B",
        description: "Smaller meeting room for 4–6 people.",
        location: "Floor 2, East Wing",
        capacity: 6,
        bookingMode: BookingMode.HOURLY,
        slotMinutes: 30,
        minMinutes: 30,
        maxMinutes: 180,
        openTime: "08:00",
        closeTime: "18:00",
      },
    }),
    prisma.resource.create({
      data: {
        name: "Event Hall",
        description: "Large hall for events, workshops, and gatherings.",
        location: "Ground Floor",
        capacity: 100,
        bookingMode: BookingMode.DAILY,
        minMinutes: 1440,
        maxMinutes: 1440 * 3,
      },
    }),
    prisma.resource.create({
      data: {
        name: "Company Van",
        description: "Toyota HiAce — for team trips and deliveries.",
        location: "Parking Bay 1",
        capacity: 12,
        bookingMode: BookingMode.DAILY,
        minMinutes: 1440,
        maxMinutes: 1440 * 30,
      },
    }),
    prisma.resource.create({
      data: {
        name: "Projector 01",
        description: "Epson Full HD projector with HDMI and VGA.",
        location: "IT Store Room",
        bookingMode: BookingMode.FLEXIBLE,
        minMinutes: 60,
        maxMinutes: 2880,
      },
    }),
    prisma.resource.create({
      data: {
        name: "Portable Speaker",
        description: "JBL portable PA speaker with microphone.",
        location: "IT Store Room",
        bookingMode: BookingMode.FLEXIBLE,
        minMinutes: 30,
        maxMinutes: 1440,
        status: ResourceStatus.MAINTENANCE,
      },
    }),
  ]);
  console.log("[seed] resources: 6");

  const rows = [
    {
      userId: users[0].id, resourceId: roomA.id,
      startTime: utcDay(1, 9), endTime: utcDay(1, 10),
      status: ReservationStatus.CONFIRMED,
      purpose: "Sprint planning",
    },
    {
      userId: users[1].id, resourceId: roomA.id,
      startTime: utcDay(1, 11), endTime: utcDay(1, 12),
      status: ReservationStatus.CONFIRMED,
      purpose: "Client call",
    },
    {
      userId: users[2].id, resourceId: roomA.id,
      startTime: utcDay(2, 14), endTime: utcDay(2, 16),
      status: ReservationStatus.CONFIRMED,
      purpose: "Design review",
    },
    {
      userId: users[3].id, resourceId: roomB.id,
      startTime: utcDay(1, 10), endTime: utcDay(1, 11, 30),
      status: ReservationStatus.CONFIRMED,
      purpose: "1:1",
    },
    {
      userId: users[0].id, resourceId: projector.id,
      startTime: utcDay(1, 9), endTime: utcDay(1, 17),
      status: ReservationStatus.CONFIRMED,
      purpose: "Workshop presentation",
    },
    {
      userId: users[4].id, resourceId: van.id,
      startTime: utcDay(3, 0), endTime: utcDay(5, 0),
      status: ReservationStatus.CONFIRMED,
      purpose: "Field trip — Kandy",
    },
    {
      userId: users[5].id, resourceId: hall.id,
      startTime: utcDay(5, 0), endTime: utcDay(6, 0),
      status: ReservationStatus.CONFIRMED,
      purpose: "Annual meetup",
    },
    {
      userId: users[0].id, resourceId: roomA.id,
      startTime: utcDay(-3, 9), endTime: utcDay(-3, 10),
      status: ReservationStatus.CONFIRMED,
      purpose: "Retrospective",
    },
    {
      userId: users[1].id, resourceId: roomA.id,
      startTime: utcDay(-2, 14), endTime: utcDay(-2, 15),
      status: ReservationStatus.CANCELLED,
      purpose: "Cancelled — moved to async",
    },
  ];

  await prisma.reservation.createMany({ data: rows });
  console.log(`[seed] reservations: ${rows.length}`);
  console.log("[seed] done");
}

main()
  .catch((err) => {
    console.error("[seed] failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });