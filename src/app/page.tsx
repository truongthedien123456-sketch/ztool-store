'use client';

import Navbar from '@/components/Navbar';
import ProductHero from '@/components/ProductHero';
import SocialFloatButtons from '@/components/SocialFloatButtons';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20 font-sans relative">
      {/* Thanh điều hướng Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Banner Thông Báo Nạp Tiền 24/7 (Đã bỏ nút Zalo/Discord cũ) */}
        <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neonBlue/20 border border-neonBlue/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-cyanGlow animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-0.5">
                <span className="bg-neonBlue/10 text-cyanGlow border border-neonBlue/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  HỆ THỐNG TỰ ĐỘNG 24/7
                </span>
                <span>Uy tín & Bảo mật</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Nạp tiền qua Ngân hàng / Momo nhận Key tự động trong 5 giây!
              </h3>
              <p className="text-xs text-gray-400 hidden sm:block mt-0.5">
                Hỗ trợ cài đặt & bảo hành Key suốt quá trình sử dụng. Đã cập nhật bản Tool mới nhất.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Nút NẠP TIỀN NGAY */}
            <Link
              href="/recharge"
              className="bg-gradient-to-r from-neonBlue to-cyanGlow hover:opacity-90 text-black font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-neonBlue/20 shrink-0"
            >
              NẠP TIỀN NGAY ↗
            </Link>
          </div>
        </div>

        {/* Khối Hero Giới thiệu Tool VIP */}
        <ProductHero />

      </div>

      {/* Biểu tượng Zalo & Discord nổi ở góc dưới bên phải */}
      <SocialFloatButtons />
    </main>
  );
}