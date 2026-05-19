const { PrismaClient } = require('@prisma/client');
// Khởi tạo trực tiếp Client ở đây để đảm bảo không bị lỗi import từ file config
const prisma = new PrismaClient(); 

async function main() {
  console.log('🔄 Đang tiến hành rót dữ liệu mẫu vào Neon DB...');

  // 1. XÓA DỮ LIỆU CŨ (Lưu ý: Tên model phải viết hoa chữ cái đầu giống hệt schema.prisma)
  await prisma.aiPipelineLog.deleteMany({}).catch(() => console.log('Bỏ qua xóa AiPipelineLog'));
  await prisma.hotspotCluster.deleteMany({}).catch(() => console.log('Bỏ qua xóa HotspotCluster'));
  await prisma.mission.deleteMany({}).catch(() => console.log('Bỏ qua xóa Mission'));
  await prisma.incident.deleteMany({}).catch(() => console.log('Bỏ qua xóa Incident'));
  await prisma.rescueRequest.deleteMany({}).catch(() => console.log('Bỏ qua xóa RescueRequest'));
  await prisma.user.deleteMany({}).catch(() => console.log('Bỏ qua xóa User'));

  console.log('🧹 Đã dọn dẹp các bảng thành công.');

  // 2. TẠO TÀI KHOẢN MẪU
  const userAdmin = await prisma.user.create({
    data: {
      username: 'admin_dieuphoi',
      passwordHash: 'scrypt__hashed_token_abc123',
      fullName: 'Nguyễn Văn A (Ban Chỉ Huy)',
      role: 'ADMIN'
    }
  });

  const userVolunteer = await prisma.user.create({
    data: {
      username: 'volunteer_team01',
      passwordHash: 'scrypt__hashed_token_xyz456',
      fullName: 'Đội Canô Cứu Hộ Liên Chiểu',
      role: 'VOLUNTEER'
    }
  });

  // 3. TẠO TIN BÁO CỨU NẠN MẪU
  const req1 = await prisma.rescueRequest.create({
    data: {
      rawText: 'Nhà bị ngập sâu tại thôn túy loan, Hòa Phong. Có 3 người lớn, 1 trẻ em cần di dời gấp!',
      aiUrgency: 'NGUY_CAP',
      aiContact: '0905999888',
      status: 'PENDING'
    }
  });

  const req2 = await prisma.rescueRequest.create({
    data: {
      rawText: 'Cần hỗ trợ phao cứu sinh và mì tôm tại 120 Mẹ Suốt, nước lên bắp đùi rồi.',
      aiUrgency: 'CAO',
      aiContact: '0914111222',
      status: 'PENDING'
    }
  });

  // 4. TẠO SỰ CỐ MẪU
  await prisma.incident.create({
    data: {
      title: 'Sạt lở đất đá nghiêm trọng quốc lộ 14G',
      description: 'Đất đá sạt tràn ra đường gây chia cắt giao thông hoàn toàn giữa các xã miền núi.',
      status: 'PENDING',
      severity: 'HIGH'
    }
  });

  // 5. TẠO ĐIỂM NÓNG MẪU
  await prisma.hotspotCluster.create({
    data: {
      centerGeom: 'POINT(108.2135 15.9876)',
      totalRequests: 5,
      radiusMeters: 300
    }
  });

  // 6. TẠO LOG AI MẪU
  await prisma.aiPipelineLog.createMany({
    data: [
      {
        requestId: req1.id,
        promptVersion: 'gpt-4o-rescue-v1',
        rawLimResponse: '{"urgency": "NGUY_CAP", "contact": "0905999888", "location": "Túy Loan"}',
        parseSuccess: true
      },
      {
        requestId: req2.id,
        promptVersion: 'gpt-4o-rescue-v1',
        rawLimResponse: '{"urgency": "CAO", "contact": "0914111222", "location": "Mẹ Suốt"}',
        parseSuccess: true
      }
    ]
  });

  console.log('🎉 RÓT DỮ LIỆU LÊN NEON CLOUD THÀNH CÔNG RỰC RỠ!');
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
    console.error('❌ Lỗi khi rót dữ liệu:', e);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();



  });
