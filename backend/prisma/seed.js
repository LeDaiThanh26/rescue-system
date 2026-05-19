const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Clear existing missions and incidents to prevent duplication
  await prisma.mission.deleteMany({});
  await prisma.incident.deleteMany({});

  // 2. Seed Users
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: hashedPassword,
      fullName: "Quản trị viên",
      role: "ADMIN"
    }
  });

  const vol1 = await prisma.user.upsert({
    where: { username: "volunteer1" },
    update: {},
    create: {
      username: "volunteer1",
      passwordHash: hashedPassword,
      fullName: "Trần Hoài Nam (Đội cứu hộ xuồng)",
      role: "VOLUNTEER",
      currentLocation: "16.749431, 107.297889"
    }
  });

  const vol2 = await prisma.user.upsert({
    where: { username: "volunteer2" },
    update: {},
    create: {
      username: "volunteer2",
      passwordHash: hashedPassword,
      fullName: "Lê Thị Hoa (Y tá tình nguyện)",
      role: "VOLUNTEER",
      currentLocation: "105.8200, 21.0100"
    }
  });

  console.log("Users seeded successfully:", { admin, vol1, vol2 });

  // 3. Seed Incidents
  const inc1 = await prisma.incident.create({
    data: {
      rawMessage: "Nhà tôi ở số 12 đường CMT8 đang bị ngập sâu 1.5m, có người già cần cứu hộ khẩn cấp!",
      aiAddress: "12 CMT8, Đà Nẵng",
      geomLocation: "16.0678, 108.2207",
      urgencyLevel: "HIGH",
      needs: ["Phao cứu sinh", "Xuồng cứu trợ", "Di tản người già"],
      status: "PENDING"
    }
  });

  const inc2 = await prisma.incident.create({
    data: {
      rawMessage: "Có sản phụ sắp sinh tại thôn Trung, xã Duy Vinh. Đường ngập sâu xe không đi được.",
      aiAddress: "Thôn Trung, Duy Vinh, Quảng Nam",
      geomLocation: "15.8286, 108.3184",
      urgencyLevel: "CRITICAL",
      needs: ["Y tá", "Ca nô cứu hộ", "Hỗ trợ y tế khẩn cấp"],
      status: "ASSIGNED"
    }
  });

  const inc3 = await prisma.incident.create({
    data: {
      rawMessage: "Sạt lở đất sườn đồi làm đổ sập tường nhà số 45, có 1 người bị thương nhẹ đã được sơ cứu.",
      aiAddress: "45 Lê Lợi, Thừa Thiên Huế",
      geomLocation: "16.4637, 107.5908",
      urgencyLevel: "MEDIUM",
      needs: ["Sơ cứu y tế", "Dọn dẹp sạt lở"],
      status: "COMPLETED"
    }
  });

  console.log("Incidents seeded successfully");

  // 4. Seed Missions
  const mission1 = await prisma.mission.create({
    data: {
      incidentId: inc2.id,
      volunteerId: vol1.id,
      assignedById: admin.id,
      missionStatus: "EN_ROUTE",
      startedAt: new Date()
    }
  });

  const mission2 = await prisma.mission.create({
    data: {
      incidentId: inc3.id,
      volunteerId: vol2.id,
      assignedById: admin.id,
      missionStatus: "DONE",
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date()
    }
  });

  console.log("Missions seeded successfully:", { mission1, mission2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
