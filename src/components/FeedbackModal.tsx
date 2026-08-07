'use client';

import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FeedbackForm() {
  const [content, setContent] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!content.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập nội dung đóng góp ý kiến cho dự án tool!' });
      return;
    }

    // Lấy tên tài khoản hiện tại (nếu đã đăng nhập)
    const currentUsername = localStorage.getItem('ztool_current_user') || 'Khách ẩn danh';

    // Lấy danh sách đóng góp hiện tại từ LocalStorage
    const existingFeedbacks = JSON.parse(localStorage.getItem('ztool_feedbacks') || '[]');

    // Tạo bản ghi đóng góp mới
    const newFeedback = {
      id: Date.now(),
      username: currentUsername,
      content: content.trim(),
      date: new Date().toLocaleString('vi-VN')
    };

    // Lưu lại vào LocalStorage để trang Admin đọc
    const updatedFeedbacks = [newFeedback, ...existingFeedbacks];
    localStorage.setItem('ztool_feedbacks', JSON.stringify(updatedFeedbacks));

    setContent('');
    setStatusMsg({ type: 'success', text: 'Cảm ơn bạn! Ý kiến đóng góp dự án tool đã được gửi tới Quản trị viên.' });
  };

  return (
    <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3 border-b border-[#1A2332] pb-3">
        <div className="w-10 h-10 rounded-xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-cyanGlow">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase">ĐÓNG GÓP DỰ ÁN TOOL</h3>
          <p className="text-[11px] text-gray-400">Đóng góp ý kiến, đề xuất tính năng mới để phát triển dự án tool tốt hơn</p>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmitFeedback} className="space-y-3">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập ý kiến đóng góp, ý tưởng tính năng mới hoặc báo lỗi cho dự án tool..."
          className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-2xl p-3 text-xs text-white focus:outline-none transition"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" /> GỬI ĐÓNG GÓP DỰ ÁN TOOL
        </button>
      </form>
    </div>
  );
}