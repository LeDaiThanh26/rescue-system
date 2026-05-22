const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu chèn dữ liệu mẫu...");

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('123456', saltRounds);

  const usersToCreate = [
    {
      username: 'admin',
      fullName: 'Quản trị viên Hệ thống',
      role: 'ADMIN',
      currentLocation: null,
    },
    {
      username: 'volunteer1',
      fullName: 'Lê Thị Hoa (Y tá tình nguyện)',
      role: 'VOLUNTEER',
      currentLocation: '16.0650,108.2010', 
    },
    {
      username: 'volunteer2',
      fullName: 'Trần Thanh Mai (Bác sĩ cấp cứu)',
      role: 'VOLUNTEER',
      currentLocation: '16.0720,108.2200', 
    },
    {
      username: 'volunteer3',
      fullName: 'Trần Hoài Nam (Đội cứu hộ xuồng)',
      role: 'VOLUNTEER',
      currentLocation: '16.0790,108.2128',
    },
    {
      username: 'volunteer4',
      fullName: 'Phạm Minh Tuấn (Đội xe tải lội nước)',
      role: 'VOLUNTEER',
      currentLocation: '16.0544,108.2022', 
    },
    {
      username: 'volunteer5',
      fullName: 'Đinh Văn Hùng (Đội người nhái / lặn)',
      role: 'VOLUNTEER',
      currentLocation: '16.0400,108.1900', 
    },
    {
      username: 'volunteer6',
      fullName: 'Nguyễn Thùy Linh (Tổ hậu cần - Tiếp tế)',
      role: 'VOLUNTEER',
      currentLocation: '16.0600,108.2100', 
    },
    {
      username: 'volunteer7',
      fullName: 'Nguyễn Quốc Bảo (Đội điều phối khu vực)',
      role: 'VOLUNTEER',
      currentLocation: '16.0850,108.2300', 
    },
    {
      username: 'volunteer8',
      fullName: 'Nguyễn Văn Phong (Phân phát áo phao)',
      role: 'VOLUNTEER',
      currentLocation: '16.0500,108.1800', 
    }
  ];

  for (const userData of usersToCreate) {
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        passwordHash: hashedPassword,
        fullName: userData.fullName,
        role: userData.role,
        currentLocation: userData.currentLocation,
      },
    });
    console.log(` Đã tạo: ${userData.fullName} (${userData.role})`);
  }

  console.log("====================================");
  console.log("CHÈN DỮ LIỆU THÀNH CÔNG! ĐÃ SẴN SÀNG TEST");
}

main()
  .catch((e) => {
    console.error("Lỗi khi chèn dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });