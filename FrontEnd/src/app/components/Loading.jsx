import { Loader2 } from 'lucide-react';

export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#3b82f6] mx-auto mb-4" />
        <p className="text-slate-600">Đang tải...</p>
      </div>
    </div>
  );
};
