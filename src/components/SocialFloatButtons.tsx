'use client';

import { useState } from 'react';
import Script from 'next/script';
import { MessageSquare, X } from 'lucide-react';

export default function SocialFloatButtons() {
  const [showZaloModal, setShowZaloModal] = useState(false);

  const openLiveChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.maximize();
    } else {
      alert('Hệ thống chat trực tuyến đang khởi tạo, vui lòng thử lại sau vài giây!');
    }
  };

  return (
    <>
      {/* CỤM NÚT NỔI Ở GÓC DƯỚI BÊN PHẢI MÀN HÌNH */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 items-end">
        
        {/* 1. NÚT ZALO (BẤM VÀO BẬT POPUP ẢNH QR NGUYỄN MINH KHANG) */}
        <button
          onClick={() => setShowZaloModal(true)}
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-600/30 border-2 border-blue-400/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Liên hệ Zalo"
        >
          <span className="font-black text-xs sm:text-sm tracking-tight">ZALO</span>
          
          {/* Tooltip khi hover */}
          <span className="absolute right-16 bg-[#0D121D] border border-[#1C2638] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
            Quét mã Zalo
          </span>
        </button>

        {/* 2. NÚT CHAT TRỰC TUYẾN (TAWK.TO) */}
        <button
          onClick={openLiveChat}
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl shadow-xl shadow-cyan-500/30 border-2 border-cyan-300 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Chat trực tuyến"
        >
          <MessageSquare className="w-6 h-6 stroke-[2.5]" />

          {/* Tooltip khi hover */}
          <span className="absolute right-16 bg-[#0D121D] border border-[#1C2638] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
            Hỗ trợ trực tuyến
          </span>
        </button>

      </div>

      {/* POPUP HIỂN THỊ MÃ QR ZALO NGUYỄN MINH KHANG */}
      {showZaloModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-sm rounded-3xl p-6 relative text-center space-y-4 shadow-2xl shadow-cyan-500/30">
            <button
              onClick={() => setShowZaloModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider">LIÊN HỆ QUẢN TRỊ VIÊN</h3>
              <p className="text-xs text-slate-400">Mở ứng dụng Zalo bấm nút quét QR để kết bạn trực tiếp</p>
            </div>

            {/* KHUNG ẢNH QR ZALO NGUYỄN MINH KHANG */}
            <div className="bg-white p-3 rounded-2xl inline-block shadow-inner">
              <img
                src="/zalo-qr.jpg"
                alt="Zalo QR Code Nguyễn Minh Khang"
                className="w-56 h-auto object-cover rounded-xl mx-auto"
                onError={(e) => {
                  // Hiển thị thông báo nếu chưa chép ảnh vào thư mục public/
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-white">Nguyễn Minh Khang</p>
              <p className="text-xs font-bold text-cyan-400">Liên hệ Zalo 24/7</p>
            </div>
          </div>
        </div>
      )}

      {/* TÍCH HỢP SCRIPT TAWK.TO CHAT */}
      <Script id="tawk-to-script" strategy="lazyOnload">
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/678a63583a84273260706cb8/1iho0f7b0';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script>
    </>
  );
}