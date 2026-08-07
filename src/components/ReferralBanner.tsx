'use client';

import { Zap, MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';

export default function ReferralBanner() {
  return (
    <div className="max-w-7xl mx-auto my-6 px-4">
      <div className="bg-gradient-to-r from-cyan-950/40 via-darkCard to-blue-950/40 border border-neonBlue/30 rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-xl">
        
        {/* Glow trang trí */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-neonBlue/10 rounded-full blur-2xl pointer-events-none" />

        {/* Nội dung thông báo bên trái */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-neonBlue/15 border border-neonBlue/40 flex items-center justify-center text-cyanGlow shrink-0 shadow-lg shadow-neonBlue/10">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyanGlow uppercase tracking-wider bg-neonBlue/20 border border-neonBlue/30 px-2.5 py-0.5 rounded-md">
                Hệ Thống Tự Động 24/7
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Uy tín & Bảo mật
              </span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-white mt-1">
              Nạp tiền qua Ngân hàng / Momo nhận Key tự động trong 5 giây!
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Hỗ trợ cài đặt & bảo hành Key suốt quá trình sử dụng. Đã cập nhật bản Tool mới nhất.
            </p>
          </div>
        </div>

        {/* Nút hành động bên phải */}
        <div className="flex items-center gap-3 z-10 shrink-0 w-full md:w-auto">
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-none bg-darkBg hover:bg-darkBorder text-gray-200 border border-darkBorder hover:border-neonBlue/50 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-cyanGlow" /> Hỗ Trợ Zalo / Discord
          </a>
          
          <button 
            onClick={() => alert('Vui lòng Đăng nhập tài khoản để nạp tiền!')}
            className="flex-1 md:flex-none bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-neonBlue/20 hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5"
          >
            NẠP TIỀN NGAY <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}