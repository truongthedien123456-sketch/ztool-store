'use client';

import { FileText, ShieldAlert, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <main className="font-sans pb-24 min-h-screen bg-transparent text-slate-100 max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-3 bg-[#0B1019]/90 border border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md">
        <div className="inline-flex items-center gap-2 bg-[#05080E] border border-cyan-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300">
          <FileText className="w-4 h-4 text-cyan-400" /> QUY ĐỊNH & THỎA THUẬN
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ
        </h1>
        <p className="text-xs text-slate-400">
          Vui lòng đọc kỹ các điều khoản trước khi đăng ký và sử dụng dịch vụ tại ZTool.Store
        </p>
      </div>

      {/* Nội dung chi tiết */}
      <div className="bg-[#0D131F]/90 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 text-xs text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> 1. Chấp Thuận Điều Khoản
          </h2>
          <p>
            Khi đăng ký tài khoản, nạp tiền hoặc kích hoạt bất kỳ gói bản quyền phần mềm nào trên hệ thống, bạn mặc nhiên đồng ý tuân thủ toàn bộ các quy định được nêu tại đây.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> 2. Quy Định Bản Quyền & Chống Gian Lận
          </h2>
          <p>
            Khách hàng nghiêm cấm thực hiện các hành vi sau:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Dịch ngược mã nguồn (Reverse Engineering), Debug hoặc can thiệp chỉnh sửa file phần mềm.</li>
            <li>Chia sẻ tài khoản cho nhiều người sử dụng chung trái phép.</li>
            <li>Spam đơn hàng ảo, trục lợi lỗ hổng thanh toán hoặc gian lận điểm danh.</li>
          </ul>
          <p className="text-rose-400 font-bold">
            Mọi trường hợp vi phạm sẽ bị khóa tài khoản vĩnh viễn và chấm dứt quyền sử dụng mà không cần thông báo trước.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <RefreshCw className="w-4 h-4 text-amber-400" /> 3. Chính Sách Hoàn Tiền & Bảo Hành
          </h2>
          <p>
            Chúng tôi hỗ trợ bảo hành và cập nhật tool miễn phí trong suốt thời hạn bản quyền bạn đã mua. Do tính chất sản phẩm phần mềm kỹ thuật số kích hoạt tức thì, hệ thống <b>không áp dụng chính sách hoàn lại tiền mặt</b> sau khi tool đã được kích hoạt thành công.
          </p>
        </section>

      </div>

    </main>
  );
}