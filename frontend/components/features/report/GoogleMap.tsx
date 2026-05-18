"use client";

import dynamic from "next/dynamic";

const LeafletMapClient = dynamic(
  () => import("@/components/features/report/LeafletMapClient"),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center gap-2"
        style={{ height: 280 }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Đang tải bản đồ...</span>
        </div>
      </div>
    ),
  }
);

interface GoogleMapProps {
  address: string;
  lat: string | number | null;
  lng: string | number | null;
  height?: number;
}

export default function GoogleMap({ address, lat, lng, height = 280 }: GoogleMapProps) {
  return (
    <LeafletMapClient
      address={address}
      lat={lat}
      lng={lng}
      height={height}
    />
  );
}
