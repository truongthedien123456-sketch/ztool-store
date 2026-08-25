'use client';

import { Shield, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="font-sans pb-24 min-h-screen bg-transparent text-slate-100 max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-3 bg-[#0B1019]/90 border border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md">
        <div className="inline-flex items-center gap-2 bg-[#05080E] border border-cyan-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300">
          <Shield className="w-4 h-4 text-cyan-400" /> BẢO MẬT TUYỆT ĐỐI
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          CHÍNH SÁCH BẢO MẬT THÔNG TIN
        </h1>
        <p className="text-xs text-slate-400">
          Cập nhật lần cuối: Năm 2026 bởi Ban Quản Trị ZTool.Store
        </p>
      </div>

      {/* Nội dung chi tiết */}
      <div className="bg-[#0D131F]/90 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 text-xs text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <Lock className="w-4 h-4 text-cyan-400" /> 1. Thu Thập Dữ Liệu
          </h2>
          <p>
            Chúng tôi chỉ thu thập các thông tin tối thiểu cần thiết để phục vụ quá trình kích hoạt tài khoản và đối soát thanh toán tự động, bao gồm:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Tên tài khoản (Username) và mật khẩu đã mã hóa.</li>
            <li>Địa chỉ Gmail dùng để gửi mã xác thực OTP khôi phục tài khoản.</li>
            <li>Mã định danh phần cứng máy tính (HWID) dùng để gán bản quyền sử dụng phần mềm.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <EyeOff className="w-4 h-4 text-emerald-400" /> 2. Cam Kết Không Chứa Mã Độc / Virus
          </h2>
          <p>
            Tất cả các tệp thực thi của Tool đều được xây dựng độc lập, cam kết <b>100% không chứa mã độc, trojan, keylogger hay virus</b> gây hại cho máy tính của khách hàng.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <Server className="w-4 h-4 text-amber-400" /> 3. Bảo Vệ Dữ Liệu Người Dùng
          </h2>
          <p>
            ZTool cam kết không chia sẻ, mua bán hay cung cấp thông tin tài khoản của khách hàng cho bất kỳ bên thứ ba nào dưới mọi hình thức. Mọi dữ liệu giao dịch đều được đồng bộ mã hóa qua Cloud Database và hạ tầng bảo mật cao cấp.
          </p>
        </section>

      </div>

    </main>
  );
}