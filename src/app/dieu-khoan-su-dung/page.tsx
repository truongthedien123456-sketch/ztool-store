'use client';

import { FileText, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <main className="font-sans pb-24 min-h-screen bg-transparent text-slate-100 max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-3 bg-[#0B1019]/90 border border-cyan-500/30 p-8 sm:p-10 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md">
        <div className="inline-flex items-center gap-2 bg-[#05080E] border border-cyan-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300">
          <FileText className="w-4 h-4 text-cyan-400" /> QUY ĐỊNH & THỎA THUẬN
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
          ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ
        </h1>
        <p className="text-sm text-slate-400">
          Vui lòng đọc kỹ các điều khoản trước khi đăng ký và sử dụng dịch vụ tại ZTool.Store
        </p>
      </div>

      {/* Nội dung chi tiết - Phóng to chữ */}
      <div className="bg-[#0D131F]/90 border border-slate-800 p-7 sm:p-10 rounded-3xl space-y-8 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
        
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5 uppercase tracking-wide">
            <CheckCircle className="w-5 h-5 text-cyan-400" /> 1. Chấp Thuận Điều Khoản
          </h2>
          <p className="text-slate-300">
            Khi đăng ký tài khoản, nạp tiền hoặc kích hoạt bất kỳ gói bản quyền phần mềm nào trên hệ thống, bạn mặc nhiên đồng ý tuân thủ toàn bộ các quy định được nêu tại đây.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5 uppercase tracking-wide">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> 2. Quy Định Bản Quyền & Chống Gian Lận
          </h2>
          <p className="text-slate-300">
            Khách hàng nghiêm cấm thực hiện các hành vi sau:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Dịch ngược mã nguồn (Reverse Engineering), Debug hoặc can thiệp chỉnh sửa file phần mềm.</li>
            <li>Chia sẻ tài khoản cho nhiều người sử dụng chung trái phép.</li>
            <li>Spam đơn hàng ảo, trục lợi lỗ hổng thanh toán hoặc gian lận điểm danh.</li>
          </ul>
          <p className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/25 p-4 rounded-2xl">
            Mọi trường hợp vi phạm sẽ bị khóa tài khoản vĩnh viễn và chấm dứt quyền sử dụng mà không cần thông báo trước.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5 uppercase tracking-wide">
            <RefreshCw className="w-5 h-5 text-amber-400" /> 3. Chính Sách Hoàn Tiền & Bảo Hành
          </h2>
          <p className="text-slate-300">
            Chúng tôi hỗ trợ bảo hành và cập nhật tool miễn phí trong suốt thời hạn bản quyền bạn đã mua. Do tính chất sản phẩm phần mềm kỹ thuật số kích hoạt tức thì, hệ thống <b className="text-amber-300">không áp dụng chính sách hoàn lại tiền mặt</b> sau khi tool đã được kích hoạt thành công.
          </p>
        </section>

      </div>

    </main>
  );
}