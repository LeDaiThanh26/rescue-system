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
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi rót dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });