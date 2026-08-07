'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CheckCircle2, Wrench, ShieldCheck, CreditCard, Flame } from 'lucide-react';

export default function ProductHero() {
  const [topTool, setTopTool] = useState<any>({
    name: 'AUTO FARM F17',
    description: 'Tự động chạy nhanh, bấm E nghề công trường F17 City',
    priceDay: 5000,
    buyCount: 1,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTools = localStorage.getItem('ztool_tools');
      if (savedTools) {
        const toolsList = JSON.parse(savedTools);
        if (toolsList.length > 0) {
          const sorted = [...toolsList].sort((a, b) => (b.buyCount || 0) - (a.buyCount || 0));
          setTopTool(sorted[0]);
        }
      }
    }
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="bg-darkCard border border-neonBlue/30 rounded-3xl p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden shadow-2xl">
        
        {/* Glow hiệu ứng nền Xanh Neon */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-neonBlue/10 rounded-full blur-3xl pointer-events-none" />

        {/* Thông tin bên trái (7 cols) */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyanGlow">
            <ShieldCheck className="w-4 h-4" /> HỆ THỐNG TOOL FIVEM CHUYÊN NGHIỆP
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Công Cụ Tool <br />
            <span className="bg-gradient-to-r from-cyanGlow to-neonBlue bg-clip-text text-transparent">FiveM VIP</span> Cho Game Thủ
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
            Cung cấp đầy đủ các bản Tool Farm cho mọi server FiveM/Launcher. Key hoạt động tự động 24/7 ngay sau khi thanh toán.
          </p>

          <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-300">
            <span className="flex items-center gap-1.5 bg-darkBg border border-darkBorder px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-cyanGlow" /> Hoạt động ổn định
            </span>
            <span className="flex items-center gap-1.5 bg-darkBg border border-darkBorder px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-cyanGlow" /> Hỗ trợ Update liên tục
            </span>
            <span className="flex items-center gap-1.5 bg-darkBg border border-darkBorder px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-cyanGlow" /> Key cấp tự động 24/7
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Nút NẠP TIỀN NGAY chuyển hướng thẳng sang /recharge */}
            <Link 
              href="/recharge"
              className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold px-7 py-3.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-neonBlue/20 text-sm hover:opacity-90 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> NẠP TIỀN NGAY
            </Link>
            
            <Link 
              href="/tools"
              className="bg-darkBg hover:bg-darkBorder text-gray-300 font-semibold px-6 py-3.5 rounded-xl border border-darkBorder flex items-center gap-2 transition text-sm cursor-pointer hover:border-neonBlue/40"
            >
              <Wrench className="w-4 h-4 text-cyanGlow" /> XEM TẤT CẢ TOOL
            </Link>
          </div>
        </div>

        {/* Khối HOT - BÁN CHẠY NHẤT bên phải (5 cols) */}
        <div className="lg:col-span-5 space-y-4 z-10">
          <div className="bg-darkBg border border-neonBlue/40 rounded-2xl overflow-hidden shadow-xl relative">
            
            <div className="absolute top-3 left-3 z-10 bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyanGlow animate-ping"></span>
              HOT - BÁN CHẠY NHẤT ({topTool.buyCount || 1} lượt mua)
            </div>
            
            <div className="h-56 bg-gradient-to-br from-cyan-950/40 via-darkBg to-black flex flex-col items-center justify-center p-6 text-center relative border-b border-darkBorder">
              <h4 className="text-2xl font-black text-cyanGlow tracking-wide flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-400 fill-amber-400" /> {topTool.name}
              </h4>
              <p className="text-xs text-gray-300 mt-2 font-semibold line-clamp-2">{topTool.description}</p>
              <div className="mt-4 text-xs font-bold text-gray-400">
                Giá chỉ từ: <span className="text-cyanGlow text-base font-extrabold">{topTool.priceDay?.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <div className="p-4 bg-darkCard flex items-center justify-between text-xs">
              <span className="text-gray-400">Trạng thái: <span className="text-emerald-400 font-semibold">Hoạt động tốt</span></span>
              <Link href="/tools" className="text-cyanGlow font-bold hover:underline flex items-center gap-1">
                Xem bảng giá Chi Tiết →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}