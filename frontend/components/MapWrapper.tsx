import dynamic from 'next/dynamic';

const MapWrapper = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse text-slate-500 font-medium">Đang tải bản đồ...</div>
});

export default MapWrapper;
