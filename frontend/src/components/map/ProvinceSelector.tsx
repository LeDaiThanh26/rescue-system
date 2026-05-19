'use client';

import React, { useCallback } from 'react';

interface ProvinceSelectorProps {
  value?: string;
  onChange: (province: string) => void;
}

const VIETNAM_PROVINCES = [
  // Đông bằng sông Hồng
  'TP Hà Nội', 'TP Hải Phòng', 'Bắc Ninh', 'Hưng Yên', 'Ninh Bình', 'Quảng Ninh',
  // Trung du và miền núi phía Bắc
  'Cao Bằng', 'Điện Biên', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Phú Thọ', 'Sơn La', 'Thái Nguyên', 'Tuyên Quang',
  // Bắc Trung Bộ
  'TP Huế', 'Hà Tĩnh', 'Nghệ An', 'Quảng Trị', 'Thanh Hóa',
  // Duyên hải Nam Trung Bộ
  'TP Đà Nẵng', 'Đắk Lắk', 'Gia Lai', 'Khánh Hòa', 'Lâm Đồng', 'Quảng Ngãi',
  // Đông Nam Bộ
  'TP Đông Nai', 'TP Hồ Chí Minh', 'Tây Ninh',
  // Đông bằng sông Cửu Long
  'TP Cần Thơ', 'An Giang', 'Cà Mau', 'Đồng Tháp', 'Vĩnh Long',
  // Các tỉnh còn lại
  'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước',
  'Bình Thuận', 'Hà Giang', 'Hà Nam', 'Hòa Bình', 'Kiên Giang', 'Kon Tum', 'Long An',
  'Nam Định', 'Ninh Thuận', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Sóc Trăng', 'Tiền Giang', 'Trà Vinh', 'Vĩnh Phúc', 'Yên Bái',
];

export const ProvinceSelector: React.FC<ProvinceSelectorProps> = React.memo(({ value, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div>
      <label className="block font-semibold text-sm text-gray-700 mb-1">
        Tỉnh / Thành phố
      </label>
      <select
        id="province-selector"
        value={value || ''}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">-- Tất cả tỉnh/thành --</option>
        {VIETNAM_PROVINCES.map((province) => (
          <option key={province} value={province}>
            {province}
          </option>
        ))}
      </select>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value && prevProps.onChange === nextProps.onChange;
});
