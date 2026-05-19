# 📍 TÀI LIỆU THIẾT KẾ MODULE MAP (BẢN ĐỒ TOÀN QUỐC VIỆT NAM)

> Dự án: **Web Bản Đồ Điều Phối Cứu Trợ và Báo Cáo Khẩn Cấp**
>
> Route chính: `/map`
>
> Phạm vi hiển thị: **Toàn bộ lãnh thổ Việt Nam**

---

# 1. Tổng Quan Module

## 1.1 Mục tiêu

Module Map là bản đồ công khai của hệ thống, cho phép:

- Hiển thị tất cả các điểm cầu cứu trên phạm vi toàn quốc.
- Phân loại mức độ khẩn cấp bằng màu sắc.
- Xem chi tiết từng điểm cầu cứu.
- Lọc và tìm kiếm theo tỉnh/thành, mức độ và loại nhu cầu.
- Tra cứu trạng thái xử lý theo mã case.

## 1.2 Đối tượng sử dụng

- Người dân.
- Điều phối viên cứu trợ.
- Tình nguyện viên.
- Cơ quan quản lý.

## 1.3 Mục tiêu nghiệp vụ

Giúp người dùng nhanh chóng nắm bắt tình hình cứu trợ trên toàn Việt Nam và theo dõi tiến độ xử lý từng yêu cầu.

---

# 2. Phạm Vi Chức Năng

Module Map gồm 5 chức năng chính.

| STT | Chức năng | Mô tả |
|-----|----------|------|
| 1 | Bản đồ tương tác | Hiển thị toàn bộ điểm cầu cứu trên bản đồ Việt Nam |
| 2 | Cờ phân loại mức độ | Đỏ = khẩn cấp, Vàng = cần tiếp tế, Xanh = đã xử lý |
| 3 | Popup thông tin điểm | Click marker để xem thông tin chi tiết |
| 4 | Bộ lọc / tìm kiếm | Lọc theo tỉnh/thành, mức độ, loại nhu cầu |
| 5 | Tra cứu trạng thái case | Nhập mã case để xem tiến độ xử lý |

---

# 3. Phạm Vi Bản Đồ Việt Nam

## 3.1 Tâm bản đồ mặc định

```ts
const defaultCenter = [16.0, 108.0];
const defaultZoom = 6;
```

## 3.2 Giới hạn phạm vi

```ts
const vietnamBounds = [
  [8.0, 102.0],
  [23.5, 110.0]
];
```

## 3.3 Ý nghĩa

- Zoom 6: hiển thị toàn bộ Việt Nam.
- Người dùng có thể zoom vào từng tỉnh/thành.
- Có thể giới hạn không cho kéo ra ngoài khu vực Việt Nam.

---

# 4. Công Nghệ Sử Dụng

## Frontend

- React.js
- TypeScript
- Leaflet.js
- React Leaflet
- Axios
- Tailwind CSS

## Bản đồ nền

- OpenStreetMap

## Mock API

- JSON file hoặc json-server.

---

# 5. Chức Năng Chi Tiết

## 5.1 Bản đồ tương tác

### Chức năng

- Hiển thị bản đồ Việt Nam.
- Zoom in / zoom out.
- Kéo bản đồ.
- Hiển thị marker.
- Marker clustering.
- Auto refresh dữ liệu.

### Marker hiển thị tại các tỉnh thành

Ví dụ:

- Hà Nội.
- Đà Nẵng.
- TP. Hồ Chí Minh.
- Cần Thơ.
- Huế.
- Quảng Nam.

---

## 5.2 Cờ phân loại mức độ

| Priority | Màu | Ý nghĩa |
|--------|-----|------|
| HIGH | 🔴 Đỏ | Khẩn cấp |
| MEDIUM | 🟡 Vàng | Cần tiếp tế |
| RESOLVED | 🟢 Xanh | Đã xử lý |

---

## 5.3 Popup thông tin điểm

Popup hiển thị:

- Mã case.
- Họ tên.
- Số điện thoại.
- Địa chỉ.
- Tỉnh/Thành phố.
- Loại nhu cầu.
- Mức độ ưu tiên.
- Trạng thái.
- Mô tả.
- Thời gian gửi.

### Ví dụ

```text
CASE: RC2026001
Nguyễn Văn A
Liên Chiểu, Đà Nẵng
Nhu cầu: Y tế
Priority: HIGH
Status: PENDING
```

---

## 5.4 Bộ lọc / tìm kiếm

### Bộ lọc

- Tỉnh/Thành phố.
- Mức độ ưu tiên.
- Trạng thái.
- Loại nhu cầu.

### Tìm kiếm

- Mã case.
- Họ tên.
- Địa chỉ.

---

## 5.5 Tra cứu trạng thái case

### Input
Người dùng nhập mã case.

### Output

- Trạng thái xử lý.
- Đơn vị phụ trách.
- Tình nguyện viên phụ trách.
- Thời gian cập nhật gần nhất.

---

# 6. Use Case

## UC01 – Xem bản đồ Việt Nam
Người dùng mở `/map` để xem toàn bộ điểm cầu cứu trên cả nước.

## UC02 – Xem chi tiết điểm cầu cứu
Click marker để xem popup.

## UC03 – Lọc theo tỉnh/thành
Chọn tỉnh/thành để chỉ hiển thị dữ liệu tương ứng.

## UC04 – Tìm kiếm
Tìm theo mã case hoặc từ khóa.

## UC05 – Tra cứu trạng thái case
Nhập mã case để xem tiến độ xử lý.

---

# 7. API Sử Dụng

## 7.1 Lấy danh sách reports

```http
GET /api/reports
```

## 7.2 Lọc theo tỉnh/thành

```http
GET /api/reports?province=DaNang
```

## 7.3 Lấy chi tiết report

```http
GET /api/reports/{id}
```

## 7.4 Tra cứu theo case code

```http
GET /api/reports/track/{caseCode}
```

---

# 8. Cấu Trúc Dữ Liệu

```ts
interface Report {
  id: number;
  caseCode: string;
  fullName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  priority: 'HIGH' | 'MEDIUM' | 'RESOLVED';
  status: string;
  category: string;
  description: string;
  createdAt: string;
}
```

---

# 9. Dữ Liệu Mock Ví Dụ

```json
[
  {
    "caseCode": "HN001",
    "fullName": "Nguyễn Văn A",
    "province": "Hà Nội",
    "latitude": 21.0285,
    "longitude": 105.8542,
    "priority": "HIGH"
  },
  {
    "caseCode": "DN001",
    "fullName": "Trần Thị B",
    "province": "Đà Nẵng",
    "latitude": 16.0544,
    "longitude": 108.2022,
    "priority": "MEDIUM"
  },
  {
    "caseCode": "HCM001",
    "fullName": "Lê Văn C",
    "province": "TP. Hồ Chí Minh",
    "latitude": 10.8231,
    "longitude": 106.6297,
    "priority": "HIGH"
  }
]
```

---

# 10. UI Layout

```text
+------------------------------------------------------------------+
| Header                                                           |
+----------------------+-------------------------------------------+
| Filter Panel         |                                           |
| - Province           |                                           |
| - Priority           |                                           |
| - Category           |             MAP OF VIETNAM                |
| - Search             |                                           |
| - Track Case         |                                           |
+----------------------+-------------------------------------------+
```

---

# 11. Cấu Trúc Thư Mục

```text
src/
├── pages/
│   └── MapPage.tsx
├── components/
│   └── map/
│       ├── MapView.tsx
│       ├── ReportMarker.tsx
│       ├── MarkerPopup.tsx
│       ├── FilterPanel.tsx
│       ├── ProvinceSelector.tsx
│       └── CaseTracker.tsx
├── services/
│   └── reportService.ts
├── data/
│   └── mockReports.json
└── types/
    └── report.ts
```

---

# 12. Luồng Hoạt Động

```text
User opens /map
        ↓
Load Vietnam map
        ↓
Call GET /api/reports
        ↓
Render markers across Vietnam
        ↓
User filters by province
        ↓
Click marker → Popup
        ↓
Track case if needed
```

---

# 13. State Management

```ts
interface MapState {
  reports: Report[];
  selectedReport: Report | null;
  loading: boolean;
  filters: {
    province?: string;
    priority?: string;
    category?: string;
    keyword?: string;
  };
}
```

---

# 14. Acceptance Criteria

| Mã | Tiêu chí |
|----|---------|
| AC01 | Bản đồ Việt Nam hiển thị thành công |
| AC02 | Marker xuất hiện tại nhiều tỉnh/thành |
| AC03 | Marker đổi màu theo mức độ |
| AC04 | Popup hiển thị đầy đủ thông tin |
| AC05 | Lọc theo tỉnh/thành hoạt động đúng |
| AC06 | Tra cứu case hoạt động chính xác |

---

# 15. Kế Hoạch Phát Triển

| Công việc | Ước lượng |
|---------|----------:|
| Setup React + Leaflet | 0.5 ngày |
| Cấu hình bản đồ Việt Nam | 0.5 ngày |
| Mock data toàn quốc | 0.5 ngày |
| Marker + popup | 1 ngày |
| Filter theo tỉnh/thành | 1 ngày |
| Case tracker | 0.5 ngày |
| Testing | 1 ngày |

**Tổng cộng:** ~5–6 ngày.

---

# 16. Phát Triển Độc Lập

Module Map có thể chạy độc lập mà không cần các module khác.

Chỉ cần mock data chứa:

- `latitude`
- `longitude`
- `province`
- `priority`
- `status`

---

# 17. MVP Khuyến Nghị

Phiên bản tối thiểu:

1. Bản đồ Việt Nam.
2. Marker màu theo mức độ.
3. Popup chi tiết.
4. Lọc theo tỉnh/thành.
5. Tra cứu trạng thái case.

---

# 18. Kết Luận

Module Map là giao diện trung tâm của hệ thống cứu trợ trên phạm vi toàn quốc.

Module đáp ứng đầy đủ 5 chức năng:

1. Bản đồ tương tác toàn Việt Nam.
2. Cờ phân loại mức độ.
3. Popup thông tin điểm.
4. Bộ lọc / tìm kiếm.
5. Tra cứu trạng thái case.

Module có thể được phát triển độc lập bằng mock data và tích hợp API thật ở giai đoạn sau.

