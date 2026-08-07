'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { FolderKanban, Sparkles, CheckCircle2, Clock, AlertTriangle, MessageSquare, Send, AlertCircle } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  // State dành cho khung Đóng góp dự án tool
  const [feedbackContent, setFeedbackContent] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tải danh sách Dự án từ LocalStorage do Admin cấu hình
  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = () => {
    const savedProjects = localStorage.getItem('ztool_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        setProjects([]);
      }
    } else {
      // Dữ liệu mẫu ban đầu nếu Admin chưa thêm dự án nào
      const defaultProjects = [
        {
          id: 1,
          title: 'Hệ thống ZTool FiveM Automation V2',
          image: '',
          status: 'Hoạt động tốt',
          description: 'Dự án tối ưu hóa các công cụ tự động dành cho game FiveM, cập nhật tính năng chống phát hiện mới nhất.'
        }
      ];
      setProjects(defaultProjects);
    }
  };

  // Helper hiển thị badge trạng thái dự án
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Hoạt động tốt':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động tốt
          </span>
        );
      case 'Đang bảo trì':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" /> Đang bảo trì
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {status || 'Sắp cập nhật'}
          </span>
        );
    }
  };

  // Xử lý gửi Đóng góp dự án tool
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!feedbackContent.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập nội dung ý kiến đóng góp dự án tool!' });
      return;
    }

    // Lấy tên người dùng hiện tại (nếu đã đăng nhập)
    const currentUsername = localStorage.getItem('ztool_current_user') || 'Khách ẩn danh';

    // Lấy danh sách đóng góp hiện có từ LocalStorage
    const existingFeedbacks = JSON.parse(localStorage.getItem('ztool_feedbacks') || '[]');

    // Tạo bản ghi đóng góp mới
    const newFeedback = {
      id: Date.now(),
      username: currentUsername,
      content: feedbackContent.trim(),
      date: new Date().toLocaleString('vi-VN')
    };

    // Lưu vào LocalStorage đồng bộ tới tab Admin
    const updatedFeedbacks = [newFeedback, ...existingFeedbacks];
    localStorage.setItem('ztool_feedbacks', JSON.stringify(updatedFeedbacks));

    setFeedbackContent('');
    setStatusMsg({ type: 'success', text: 'Cảm ơn bạn! Ý kiến đóng góp dự án tool đã được gửi tới Quản trị viên.' });
  };

  return (
    <main className="min-h-screen bg-[#080B10] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header Trang */}
        <div className="text-center space-y-3 border-b border-[#1A2332] pb-8">
          <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyanGlow">
            <Sparkles className="w-4 h-4" /> DỰ ÁN CỦA CHÚNG TÔI
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">DANH SÁCH DỰ ÁN & SẢN PHẨM PHÁT TRIỂN</h1>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Theo dõi tiến độ, tình trạng hoạt động và các cập nhật mới nhất cho từng dự án do ZTool phát triển.
          </p>
        </div>

        {/* 1. DANH SÁCH DỰ ÁN TOOL */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-[#0F141C] border border-[#1A2332] rounded-3xl">
            <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-semibold">Hiện chưa có thông tin dự án nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 shadow-xl hover:border-neonBlue/40 transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Ảnh Dự án */}
                  <div className="w-full h-48 bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden flex items-center justify-center relative">
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <FolderKanban className="w-14 h-14 text-cyanGlow/30" />
                    )}
                    <div className="absolute top-3 right-3">
                      {renderStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* Thông tin */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {project.description || 'Chưa có thông tin mô tả chi tiết cho dự án này.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1A2332] flex items-center justify-between text-[11px] text-gray-500">
                  <span>Trạng thái kết nối: Stable</span>
                  <span className="text-cyanGlow font-semibold">ZTool Systems</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. KHUNG ĐÓNG GÓP DỰ ÁN TOOL */}
        <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
            <div className="w-12 h-12 rounded-2xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-cyanGlow shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">ĐÓNG GÓP DỰ ÁN TOOL</h3>
              <p className="text-xs text-gray-400">Đóng góp ý kiến, đề xuất tính năng mới hoặc báo lỗi để phát triển dự án tool tốt hơn</p>
            </div>
          </div>

          {statusMsg && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
              statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Nội dung ý kiến đóng góp:</label>
              <textarea
                rows={4}
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Nhập ý kiến đóng góp, đề xuất tính năng mới hoặc báo lỗi cho dự án tool tại đây..."
                className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-2xl p-4 text-xs text-white focus:outline-none transition leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> GỬI ĐÓNG GÓP DỰ ÁN TOOL
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}