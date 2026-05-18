// frontend/src/pages/AdminDashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, Users, 
  MapPin, Radio, TrendingUp, ShieldAlert, Navigation 
} from 'lucide-react';
import MapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Bắt buộc import CSS để bản đồ không bị vỡ giao diện

// Điền Access Token lấy từ tài khoản Mapbox của bạn vào đây
const MAPBOX_TOKEN = 'pk.eyJ1IjoibmhhbnZpZW4iLCJhIjoiY21wYjZxeWphMDJ0ajJxc2ZpZWpjeTV2NyJ9.I8Jyms14VYLEC7NUIcW6IA'; 

// Hàm bổ trợ tách tọa độ từ chuỗi dữ liệu PostGIS "POINT(108.2135 15.9876)"
const parsePoint = (geomString: any) => {
  // Trường hợp 1: Dữ liệu đã là một Object tọa độ sạch sẵn (Ví dụ: GeoJSON từ Prisma)
  if (geomString && typeof geomString === 'object') {
    if (Array.isArray(geomString.coordinates) && geomString.coordinates.length === 2) {
      return {
        longitude: parseFloat(geomString.coordinates[0]),
        latitude: parseFloat(geomString.coordinates[1])
      };
    }
    // Nếu object trả về có sẵn key x, y hoặc lng, lat
    if (geomString.longitude && geomString.latitude) {
      return { longitude: parseFloat(geomString.longitude), latitude: parseFloat(geomString.latitude) };
    }
    if (geomString.lng && geomString.lat) {
      return { longitude: parseFloat(geomString.lng), latitude: parseFloat(geomString.lat) };
    }
  }

  // Ép kiểu dữ liệu về chuỗi text để xử lý chuỗi an toàn
  if (typeof geomString === 'string') {
    const cleanString = geomString.trim();

    // Trường hợp 2: Định dạng chuỗi thực tế của bạn "Vĩ_độ,Kinh_độ" (Ví dụ: "16.0678,108.2208")
    if (cleanString.includes(',')) {
      const parts = cleanString.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());

        if (!isNaN(lat) && !isNaN(lng)) {
          return { longitude: lng, latitude: lat }; // Đảo trục: Đưa kinh độ lên trước cho Mapbox
        }
      }
    }

    // Trường hợp 3: Định dạng PostGIS tiêu chuẩn "POINT(Kinh_độ Vĩ_độ)" hoặc "POINT(Kinh_độ,Vĩ_độ)"
    if (cleanString.toUpperCase().startsWith('POINT')) {
      // Loại bỏ chữ POINT và các dấu ngoặc để lấy lõi số bên trong
      const coreNumbers = cleanString.replace(/POINT\s*\(|\)/gi, '').trim();
      // Tách các số bằng dấu cách hoặc dấu phẩy
      const parts = coreNumbers.split(/[\s,]+/); 
      
      if (parts.length === 2) {
        const lng = parseFloat(parts[0]); // PostGIS mặc định số đầu luôn là Kinh độ (Longitude)
        const lat = parseFloat(parts[1]); // Số thứ hai luôn là Vĩ độ (Latitude)

        if (!isNaN(lng) && !isNaN(lat)) {
          return { longitude: lng, latitude: lat };
        }
      }
    }
  }

  // Tọa độ dự phòng cuối cùng nếu toàn bộ các bộ lọc trên thất bại (Mặc định: Đà Nẵng)
  return { longitude: 108.2022, latitude: 16.0544 }; 
};
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm fetch dữ liệu thực tế từ API Backend Docker Nodejs
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard'); // Đi qua Nginx Gateway Port 80
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cơ chế Realtime Pooling: Tự động nạp lại dữ liệu sau mỗi 10 giây để bắt kịp bão lũ
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải trung tâm điều phối cứu trợ khẩn cấp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-red-500 tracking-wide">
            <Radio className="animate-pulse" /> HỆ THỐNG ĐIỀU PHỐI CỨU TRỢ TRỰC TUYẾN
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Dữ liệu đồng bộ Realtime kết hợp phân tích ngôn ngữ tự nhiên (NLP)</p>
        </div>
        <div className="bg-gray-900 px-3 py-1.5 rounded border border-gray-800 text-xs text-green-400 font-mono animate-pulse">
          ● REALTIME ACTIVE
        </div>
      </div>

      {/* MODULE 1: THẺ THỐNG KÊ TỔNG HỢP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Tổng ca ghi nhận</p>
            <h3 className="text-2xl font-bold text-white mt-1">{data.stats.total}</h3>
          </div>
          <div className="p-2.5 bg-blue-500/10 rounded text-blue-500"><Radio size={20}/></div>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Đang chờ (Chưa duyệt/Duyệt)</p>
            <h3 className="text-2xl font-bold text-amber-500 mt-1">{data.stats.pending}</h3>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded text-amber-500"><Clock size={20}/></div>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Lực lượng tiếp cận</p>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1">{data.stats.processing}</h3>
          </div>
          <div className="p-2.5 bg-indigo-500/10 rounded text-indigo-400"><Navigation size={20}/></div>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Đã an toàn</p>
            <h3 className="text-2xl font-bold text-green-500 mt-1">{data.stats.completed}</h3>
          </div>
          <div className="p-2.5 bg-green-500/10 rounded text-green-500"><CheckCircle2 size={20}/></div>
        </div>
      </div>

      {/* Grid chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: MAP & CHART */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MODULE 2: MINI-MAP TỔNG QUAN VỚI MAPBOX */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 h-[320px] flex flex-col">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-red-400"/> Mini-map mật độ điểm nóng thiên tai (Mapbox)
        </h2>
        <div className="bg-gray-950 border border-gray-850 rounded-lg flex-1 relative overflow-hidden">
          
          <MapGL
            initialViewState={{
              longitude: 108.2022, // Kinh độ trung tâm hệ thống
              latitude: 16.0544,  // Vĩ độ trung tâm hệ thống
              zoom: 11
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11" // Sử dụng giao diện Dark Mode rất hợp với Dashboard
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {/* Vòng lặp quét qua danh sách hotSpots được trả về từ Controller Backend */}
            {data?.hotSpots?.map((spot: any) => {
              const coords = parsePoint(spot.centerGeom);
              return (
                <Marker 
                  key={spot.id} 
                  longitude={coords.longitude} 
                  latitude={coords.latitude} 
                  anchor="center"
                >
                  {/* Hiển thị điểm nhấp nháy cảnh báo sóng radar ngay trên bản đồ thực */}
                  <div className="relative flex items-center justify-center h-4 w-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full border border-white relative group cursor-pointer">
                      {/* Tooltip hiển thị thông tin cụm khi rê chuột vào điểm ghim */}
                      <span className="absolute left-5 -top-3 bg-gray-950 text-white text-[11px] font-sans px-2 py-1 rounded shadow-xl border border-gray-750 hidden group-hover:inline-block whitespace-nowrap z-50">
                        Cụm ID #{spot.id}: {spot.totalRequests} ca cứu trợ (Bán kính: {spot.radiusMeters}m)
                      </span>
                    </div>
                  </div>
                </Marker>
              );
            })}
          </MapGL>
        </div>
        </div>

          {/* MODULE 3: BIỂU ĐỒ CA THEO THỜI GIAN */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-blue-400"/> Tần suất biến động ca kêu cứu theo giờ (Hôm nay)</h2>
            <div className="h-[160px] w-full flex items-end gap-2 pt-4 border-b border-gray-800 px-2">
              {data.chartData.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div style={{ height: `${Math.min(100, bar.newCases * 10)}%` }} className="w-full bg-blue-500/80 rounded-t min-h-[4px]"></div>
                  <div style={{ height: `${Math.min(100, bar.resolvedCases * 10)}%` }} className="w-full bg-green-500/80 rounded-t mt-[1px] min-h-[2px]"></div>
                  <span className="text-[9px] text-gray-500 mt-1 whitespace-nowrap scale-90">{bar.timeFrame}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[11px] justify-center text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Phát sinh mới</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span> Đội giải quyết xong</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT AI & ĐỘI CỨU HỘ */}
        <div className="space-y-6">
          
          {/* MODULE 4: BẢNG ĐIỂM NÓNG */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldAlert size={16} className="text-amber-500"/> Khu vực mật độ cao (Hotspots)</h2>
            <div className="space-y-2">
              {data.hotSpots.map((spot) => (
                <div key={spot.clusterId} className="p-2.5 bg-gray-950 rounded border border-gray-850 flex justify-between items-center">
                  <div className="truncate pr-2">
                    <p className="text-xs font-semibold text-gray-200 font-mono">CLUSTER-ID: #{spot.clusterId}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">Tâm chấn: {spot.centerGeom}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold px-2 py-0.5 rounded">
                      {spot.totalRequests} ca
                    </span>
                    <p className="text-[9px] text-red-300 mt-0.5">{spot.redCount} báo động đỏ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MODULE 5: FEED CA MỚI NHẤT (NLP ANALYZED) */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 animate-pulse"/> Luồng tin báo khẩn (AI bóc tách tự động)
            </h2>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {data.recentFeeds.map((feed) => (
                <div key={feed.id} className="p-3 bg-gray-950 rounded border border-gray-850 border-l-2 border-l-red-500">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span className="font-mono font-bold text-blue-400">REQ-{feed.id}</span>
                    <span>{new Date(feed.createdAt).toLocaleTimeString('vi-VN')}</span>
                  </div>
                  <p className="text-xs text-gray-300 italic line-clamp-2">"{feed.rawText}"</p>
                  
                  {/* Render các nhãn dữ liệu JSON tự động bóc tách từ AI Pipeline */}
                  <div className="mt-2 pt-2 border-t border-gray-900 flex flex-wrap gap-1">
                    {feed.aiUrgency && (
                      <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-900">
                        🚨 Mức độ: {feed.aiUrgency}
                      </span>
                    )}
                    {feed.aiContact && (
                      <span className="text-[9px] bg-gray-900 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">
                        📞 SĐT: {feed.aiContact}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MODULE 6: TRẠNG THÁI ĐỘI CỨU HỘ */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users size={16} className="text-indigo-400"/> Tình trạng lực lượng ({data.rescueTeamsStatus.total} TNV)</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-950 p-2 rounded border border-gray-850">
                <p className="text-xs text-gray-400">Sẵn sàng</p>
                <p className="text-lg font-bold text-green-500 mt-0.5">{data.rescueTeamsStatus.ready}</p>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-850">
                <p className="text-xs text-gray-400">Đang đi</p>
                <p className="text-lg font-bold text-amber-500 mt-0.5">{data.rescueTeamsStatus.enRoute}</p>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-850">
                <p className="text-xs text-gray-400">Tại chỗ</p>
                <p className="text-lg font-bold text-red-400 mt-0.5">{data.rescueTeamsStatus.onSite}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}