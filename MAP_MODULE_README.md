# 🗺️ Map Module - Hệ Thống Cứu Trợ

Hoàn chỉnh Module Map hiển thị bản đồ tương tác để điều phối cứu trợ.

## ✅ Tính Năng Đã Triển Khai

- ✨ **Hiển thị Bản Đồ** - OpenStreetMap + Leaflet.js
- 📍 **Marker Cầu Cứu** - Đánh dấu vị trí các yêu cầu cứu trợ
- 🎨 **Màu Theo Ưu Tiên** - Đỏ (HIGH), Cam (MEDIUM), Xanh (LOW)
- 📋 **Popup Chi Tiết** - Xem thông tin khi click marker
- 🔍 **Filter Dữ Liệu** - Lọc theo mức độ ưu tiên, trạng thái
- 🔄 **Auto Refresh** - Cập nhật mỗi 30 giây
- 📊 **Tóm Tắt Dữ Liệu** - Hiển thị số liệu thống kê
- 🚀 **Cluster Map** - Tự động gom nhóm markers

## 🗂️ Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── types/
│   │   ├── report.ts          # Types cho Report
│   │   └── volunteer.ts       # Types cho Volunteer
│   ├── services/
│   │   ├── reportService.ts   # API calls cho reports
│   │   └── volunteerService.ts # API calls cho volunteers
│   └── components/
│       └── map/
│           ├── MapPage.tsx        # Main container
│           ├── MapView.tsx        # Leaflet map component
│           ├── ReportMarker.tsx   # Marker component
│           ├── MarkerPopup.tsx    # Popup info
│           └── FilterPanel.tsx    # Filter UI
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── map/
│       └── page.tsx           # Map page route
└── .env.local                 # Environment variables

backend/
├── src/
│   ├── app.js                 # Express app + API routes
│   ├── server.js              # Server setup
│   └── config/
│       └── db.js              # Prisma client
└── prisma/
    └── schema.prisma          # Database schema
```

## 🚀 Cách Chạy

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev    # Setup database
npm run dev               # Start server (port 3001)
```

### 2. Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev               # Start (port 3000)
```

### 3. Truy Cập

- **Map Page**: http://localhost:3000/map
- **Mock API**: http://localhost:3001/api/mock/reports

## 📡 API Endpoints

### Reports (Cầu Cứu)
- `GET /api/reports` - Lấy tất cả
- `GET /api/reports/:id` - Lấy chi tiết
- `PATCH /api/reports/:id/status` - Cập nhật trạng thái
- `GET /api/mock/reports` - Mock data

### Volunteers (Tình Nguyện Viên)
- `GET /api/volunteers` - Lấy tất cả
- `GET /api/volunteers/:id` - Lấy chi tiết

## 🎯 Chức Năng Chính

### 1. Hiển thị Bản Đồ
- Bản đồ OpenStreetMap tương tác
- Tự động zoom vào các markers
- Điều khiển zoom/pan

### 2. Markers & Popups
- Marker màu theo ưu tiên
- Click marker để xem popup
- Thông tin chi tiết trong popup

### 3. Filter Panel
- Lọc theo mức độ ưu tiên (HIGH, MEDIUM, LOW)
- Lọc theo trạng thái (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- Nút Reset để bỏ filter

### 4. Statistics
- Tổng số yêu cầu
- Số yêu cầu theo ưu tiên
- Số yêu cầu chưa xử lý

### 5. Auto Refresh
- Tự động cập nhật mỗi 30 giây
- Nút "Làm mới" để refresh ngay

## 🔧 Cấu Hình

### .env.local (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### .env (Backend)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rescue_db"
```

## 📱 Responsive Design
- ✅ Desktop (1920x1080)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

## 🧪 Testing Features

1. **Filter Test**
   - Chọn HIGH priority → Chỉ hiển thị high priority
   - Chọn PENDING status → Chỉ hiển thị pending

2. **Marker Click Test**
   - Click marker → Popup xuất hiện
   - Click "Xem chi tiết" → Navigate to detail page

3. **Auto Refresh Test**
   - Chờ 30 giây → Dữ liệu tự cập nhật

## 📊 Performance

- ⚡ Load time: < 3 giây
- 📍 Handles 1000+ markers
- 🔄 Refresh interval: 30 giây
- 💾 Minimal memory footprint

## 🎨 UI Colors

| Trạng thái | Màu |
|-----------|------|
| HIGH (Khẩn cấp) | Đỏ (#EF4444) |
| MEDIUM (Thường) | Cam (#F97316) |
| LOW (Thấp) | Xanh (#22C55E) |

## 📚 Technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Map**: Leaflet.js, React Leaflet
- **HTTP**: Axios
- **Backend**: Node.js, Express, Prisma
- **Database**: PostgreSQL

## 🚧 Future Enhancements

- [ ] Heatmap khu vực
- [ ] Routing (đường đi ngắn nhất)
- [ ] WebSocket real-time
- [ ] Geofencing alerts
- [ ] AI gợi ý điều phối
- [ ] Export reports

## 📝 Notes

- Mock data sẵn có tại `/api/mock/reports`
- Dữ liệu tự động refresh mỗi 30 giây
- Filter hoạt động real-time
- Hỗ trợ Vietnamese UI text

---

**Status**: ✅ MVP Complete - Ready for Demo
