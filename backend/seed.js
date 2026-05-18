const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Đang bắt đầu tạo dữ liệu mẫu...");

  // 1. Tạo 1 Admin (id sẽ là 1)
  const admin = await prisma.user.create({
    data: {
      username: "admin_hethong",
      passwordHash: "123456", // Demo nên để đơn giản
      fullName: "Nguyễn Trưởng Trạm",
      role: "ADMIN"
    }
  });

  // 2. Tạo 1 Tình nguyện viên (id sẽ là 2)
  const volunteer = await prisma.user.create({
    data: {
      username: "tnv_01",
      passwordHash: "123456",
      fullName: "Dạ Trần Tình Nguyện",
      role: "VOLUNTEER",
      currentLocation: "16.0717,108.2235"
    }
  });

  // 3. Tạo 1 ca cứu hộ do AI trích xuất (Case ID sẽ là 1)
  const incident = await prisma.incident.create({
    data: {
      rawMessage: "Cứu với nước ngập tới nóc nhà rồi, ở số 54 Nguyễn Văn Linh, nhà có 2 con nhỏ!",
      aiAddress: "Số 54 Nguyễn Văn Linh, Quận Hải Châu",
      geomLocation: "16.0601,108.2155",
      urgencyLevel: "Đỏ",
      needs: { "food": true, "boat": true, "medic": false },
      status: "PENDING"
    }
  });

  console.log("Tạo dữ liệu thành công! Bây giờ bạn có thể test API.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });