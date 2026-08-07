'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  Wrench, ShieldCheck, Zap, Key, ArrowRight, 
  Sparkles, ShoppingBag 
} from 'lucide-react';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);

  // Bảng dữ liệu sản phẩm mặc định có sẵn LINK ẢNH CỐ ĐỊNH dành cho máy khách
  const DEFAULT_TOOLS = [
    {
      id: 1,
      name: 'AUTO FARM F17',
      image: 'https://i.ibb.co/3s6ZgX9/ztool-banner.jpg', // Link ảnh hiển thị trực tiếp cho máy khách
      priceDay: '5.000',
      priceWeek: '20.000',
      priceMonth: '50.000',
      priceLifetime: '100.000',
      description: 'Tự động chạy nhanh, bấm E nghề công trường F17 City'
    },
    {
      id: 2,
      name: 'AUTO CÂU CÁ LŨ QUỶ',
      image: 'https://i.ibb.co/3s6ZgX9/ztool-banner.jpg',
      priceDay: '20.000',
      priceWeek: '50.000',
      priceMonth: '150.000',
      priceLifetime: '300.000',
      description: 'Tự quăng cần câu, giải minigame mũi tên, tự ngồi lên thuyền, thông báo khi có captcha, đổi đồ ăn.'
    }
  ];

  useEffect(() => {
    const savedTools = localStorage.getItem('ztool_tools');
    if (savedTools) {
      try {
        const parsed = JSON.parse(savedTools);
        setTools(parsed.length > 0 ? parsed : DEFAULT_TOOLS);
      } catch (e) {
        setTools(DEFAULT_TOOLS);
      }
    } else {
      setTools(DEFAULT_TOOLS);
    }
  }, []);

  const featuredTool = tools[0] || DEFAULT_TOOLS[0];

  return (
    <main className="min-h-screen bg-[#080B10] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* HERO SECTION TRANG CHỦ BÁN HÀNG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0F141C] border border-[#1A2332] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyanGlow">
              <Sparkles className="w-4 h-4" /> HỆ THỐNG CUNG CẤP TOOL AUTOMATION FIVE M
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight">
              TỰ ĐỘNG HÓA TRẢI NGHIỆM GAME CỦA BẠN
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
              Cung cấp đầy đủ các bản Tool Farm cho mọi server FiveM / Launcher. Key hoạt động tự động 24/7 ngay sau khi thanh toán.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300 pt-2">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Hoạt động ổn định</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Hỗ trợ Update liên tục</span>
              <span className="flex items-center gap-1.5"><Key className="w-4 h-4 text-cyanGlow" /> Key cấp tự động 24/7</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/tools"
                className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> XEM TẤT CẢ TOOL
              </Link>
            </div>
          </div>

          {/* KHỐI HIGHLIGHT TOOL NỔI BẬT */}
          <div className="lg:col-span-5 bg-[#080B10] border border-[#1A2332] rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1A2332] pb-3">
              <span className="text-xs font-bold text-cyanGlow flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> TOOL NỔI BẬT
              </span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded">
                Hoạt động tốt
              </span>
            </div>

            {featuredTool && (
              <div className="space-y-4">
                {/* Ảnh Tool hiển thị trực tiếp cho máy khách */}
                <div className="w-full h-44 bg-[#0F141C] border border-[#1A2332] rounded-2xl overflow-hidden flex items-center justify-center relative">
                  <img 
                    src={featuredTool.image || 'https://i.ibb.co/3s6ZgX9/ztool-banner.jpg'} 
                    alt={featuredTool.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-white">{featuredTool.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{featuredTool.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#1A2332]">
                  <span className="text-xs text-gray-400">
                    Giá chỉ từ: <b className="text-emerald-400 font-extrabold">{featuredTool.priceDay || '5.000'} VNĐ</b>
                  </span>
                  <Link href="/tools" className="text-xs text-cyanGlow font-bold flex items-center gap-1 hover:underline">
                    Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DANH SÁCH TOOL SẢN PHẨM */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1A2332] pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyanGlow" /> SẢN PHẨM TOOL AUTO
              </h2>
              <p className="text-xs text-gray-400">Danh sách các bản hack/tool tự động mới nhất</p>
            </div>

            <Link href="/tools" className="text-xs text-cyanGlow font-bold flex items-center gap-1 hover:underline">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="w-full h-36 bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={tool.image || 'https://i.ibb.co/3s6ZgX9/ztool-banner.jpg'} 
                    alt={tool.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="text-base font-bold text-white">{tool.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{tool.description}</p>
                <Link
                  href="/tools"
                  className="block text-center bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-2.5 rounded-xl text-xs"
                >
                  XEM SẢN PHẨM
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}