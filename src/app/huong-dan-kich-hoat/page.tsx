'use client';

import Link from 'next/link';
import { 
  KeyRound, ShieldCheck, Download, Laptop, CheckCircle2, 
  HelpCircle, ArrowRight, Zap, RefreshCw, AlertTriangle 
} from 'lucide-react';

export default function ActivationGuidePage() {
  return (
    <main className="font-sans pb-24 min-h-screen bg-transparent text-slate-100 max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 bg-[#0B1019]/90 border border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md">
        <div className="inline-flex items-center gap-2 bg-[#05080E] border border-cyan-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300">
          <KeyRound className="w-4 h-4 text-cyan-400" /> TỰ ĐỘNG KÍCH HOẠT 24/7
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
          HƯỚNG DẪN KÍCH HOẠT VÀ SỬ DỤNG TOOL
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Quy trình đơn giản gồm 4 bước để nhận quyền sử dụng và đăng nhập vào phần mềm tự động.
        </p>
      </div>

      {/* 4 Bước Kích Hoạt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bước 1 */}
        <div className="bg-[#0D131F]/90 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-3xl space-y-3 transition group">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm group-hover:scale-110 transition">
            01
          </div>
          <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition">
            Đăng Ký & Xác Thực Tài Khoản
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tạo tài khoản trên website <b>ZTool.Store</b> và hoàn tất xác thực địa chỉ Gmail qua mã OTP (hoặc được hệ thống cấp quyền miễn xác thực) để mở khóa quyền kích hoạt.
          </p>
        </div>

        {/* Bước 2 */}
        <div className="bg-[#0D131F]/90 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-3xl space-y-3 transition group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm group-hover:scale-110 transition">
            02
          </div>
          <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition">
            Nhận Dùng Thử Hoặc Mua Bản Quyền
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tại trang <b>Cửa Hàng Tool</b>, chọn gói thời hạn phù hợp hoặc bấm nút <b>Trải Nghiệm 3 Ngày (Miễn Phí)</b>. Hệ thống tự động cấp thời hạn lên máy chủ Gist ngay tức thì.
          </p>
        </div>

        {/* Bước 3 */}
        <div className="bg-[#0D131F]/90 border border-slate-800 hover:border-amber-500/40 p-6 rounded-3xl space-y-3 transition group">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm group-hover:scale-110 transition">
            03
          </div>
          <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
            Tải Tool & Mở Với Quyền Admin
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tải phần mềm về máy tính, giải nén và nhấp chuột phải chọn <b>Run as administrator</b> (Chạy với quyền Quản trị viên) để phần mềm tương tác chuẩn xác với game.
          </p>
        </div>

        {/* Bước 4 */}
        <div className="bg-[#0D131F]/90 border border-slate-800 hover:border-purple-500/40 p-6 rounded-3xl space-y-3 transition group">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-sm group-hover:scale-110 transition">
            04
          </div>
          <h3 className="text-base font-black text-white group-hover:text-purple-300 transition">
            Đăng Nhập Khóa Mã Máy (HWID)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Nhập chính xác <b>Username</b> và <b>Mật khẩu</b> web vào bảng đăng nhập của Tool. Tool sẽ tự động nhận diện thời hạn và khóa theo mã máy của bạn.
          </p>
        </div>

      </div>

      {/* Lưu Ý Quan Trọng */}
      <div className="bg-[#0B1019] border border-amber-500/40 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Lưu ý về đổi máy tính (Reset HWID)
        </h3>
        <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Mỗi tài khoản Tool chỉ được đăng nhập đồng thời trên <b>01 thiết bị máy tính</b> tại một thời điểm.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Khi đổi máy mới hoặc cài lại Win, vui lòng liên hệ Admin qua nút <b>Live Chat</b> hoặc <b>Zalo</b> góc phải màn hình để được hỗ trợ Reset HWID.</span>
          </li>
        </ul>
      </div>

    </main>
  );
}