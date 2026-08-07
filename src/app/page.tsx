'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  Wrench, ShieldCheck, Zap, Key, ArrowRight, Wallet, 
  Sparkles, CheckCircle2, ShoppingBag, FolderKanban 
} from 'lucide-react';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Đọc dữ liệu Tool & Dự án do Admin cấu hình từ localStorage
  useEffect(() => {
    // Lấy danh sách Tools
    const savedTools = localStorage.getItem('ztool_tools');
    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        setTools([]);
      }
    } else {
      setTools([
        {
          id: 1,
          name: 'Tool Auto FiveM VIP',
          priceDay: '20.000',
          priceLifetime: '1.000.000',
          description: 'Cung cấp đầy đủ các bản Tool Farm cho mọi server FiveM/Launcher. Key hoạt động tự động 24/7.'
        }
      ]);
    }

    // Lấy danh sách Dự án
    const savedProjects = localStorage.getItem('ztool_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        setProjects([]);
      }
    }
  }, []);

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

          {/* Khối Highlight Tool Nổi Bật */}
          <div className="lg:col-span-5 bg-[#080B10] border border-[#1A2332] rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1A2332] pb-3">
              <span className="text-xs font-bold text-cyanGlow flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> TOOL NỔI BẬT
              </span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded">
                Hoạt động tốt
              </span>
            </div>

            {tools.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white">{tools[0].name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{tools[0].description}</p>
                <div className="pt-2 flex items-center justify-between border-t border-[#1A2332]">
                  <span className="text-xs text-gray-400">Giá chỉ từ: <b className="text-emerald-400 font-extrabold">{tools[0].priceDay || '20.000'} VNĐ</b></span>
                  <Link href="/tools" className="text-xs text-cyanGlow font-bold flex items-center gap-1 hover:underline">
                    Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM TOOL XEM NHANH */}
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
                <h3 className="text-base font-bold text-white">{tool.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{tool.description}</p>
                <div className="bg-[#080B10] p-3 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span>Giá theo Ngày:</span>
                    <b className="text-emerald-400">{tool.priceDay ? `${tool.priceDay} VNĐ` : '---'}</b>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Gói Vĩnh Viễn:</span>
                    <b className="text-cyanGlow">{tool.priceLifetime ? `${tool.priceLifetime} VNĐ` : '---'}</b>
                  </div>
                </div>
                <Link
                  href="/tools"
                  className="block text-center bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-2.5 rounded-xl text-xs"
                >
                  MUA NGAY
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}