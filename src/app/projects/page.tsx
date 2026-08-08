'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { FolderKanban, Sparkles, CheckCircle2, MessageSquare, Send, Clock } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProjectsAndFeedbacks();
  }, []);

  const loadProjectsAndFeedbacks = async () => {
    // 1. Tải danh sách dự án trực tiếp từ Supabase Cloud
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false });

    // Đồng bộ chính xác dữ liệu từ Database (nếu chưa có dự án sẽ set mảng rỗng)
    setProjects(projectData || []);

    // 2. Tải danh sách ý kiến đóng góp dự án từ Supabase Cloud
    const { data: feedbackData } = await supabase
      .from('feedbacks')
      .select('*')
      .order('id', { ascending: false });

    if (feedbackData) setFeedbacks(feedbackData);
  };

  // Gửi ý kiến đóng góp dự án tool lên Cloud Database
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    const currentUsername = localStorage.getItem('ztool_current_user') || 'Khách ẩn danh';

    const { error } = await supabase.from('feedbacks').insert([
      {
        username: currentUsername,
        content: feedbackContent.trim()
      }
    ]);

    if (!error) {
      setFeedbackContent('');
      setMsg('Gửi ý kiến đóng góp thành công! Cảm ơn bạn đã hỗ trợ dự án.');
      loadProjectsAndFeedbacks();
    } else {
      setMsg('Có lỗi xảy ra khi gửi đóng góp!');
    }
  };

  return (
    <main className="min-h-screen bg-[#080B10] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="text-center space-y-3 border-b border-[#1A2332] pb-8">
          <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyanGlow">
            <Sparkles className="w-4 h-4" /> DỰ ÁN & SẢN PHẨM ĐÃ PHÁT TRIỂN
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">DANH SÁCH DỰ ÁN CỦA SHOP ZTOOL</h1>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Tổng hợp các hệ thống, mã nguồn tool tự động đã hoàn thiện và đang được bảo trì nâng cấp thường xuyên.
          </p>
        </div>

        {/* Danh Sách Dự Án Thực Tế Đồng Bộ 100% Với Supabase */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-[#0F141C] border border-[#1A2332] rounded-3xl space-y-3">
            <FolderKanban className="w-12 h-12 text-cyanGlow/40 mx-auto" />
            <h3 className="text-sm font-bold text-white">HIỆN TẠI CHƯA CÓ DỰ ÁN NÀO</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Chưa có dự án nào được cập nhật trên hệ thống. Hãy quay lại sau hoặc gửi ý kiến góp ý bên dưới!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 shadow-xl hover:border-neonBlue/50 transition duration-300">
                <div className="w-full aspect-square bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden relative">
                  <img src={p.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={p.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-cyan-500/20 border border-cyan-500/40 text-cyanGlow text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md">
                    {p.status || 'Hoạt động tốt'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                    {p.description || 'Chưa có thông tin chi tiết dự án.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Khung Đóng Góp Ý Kiến Cho Dự Án Tool */}
        <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-cyanGlow shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ĐÓNG GÓP Ý KIẾN PHÁT TRIỂN DỰ ÁN TOOL</h2>
              <p className="text-xs text-gray-400">Gửi yêu cầu thêm tính năng mới hoặc báo lỗi tool cho Admin</p>
            </div>
          </div>

          {msg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {msg}
            </div>
          )}

          <form onSubmit={handleSendFeedback} className="space-y-4">
            <textarea
              required
              rows={4}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Nhập nội dung góp ý, báo lỗi hoặc ý tưởng tính năng tool bạn mong muốn..."
              className="w-full bg-[#080B10] border border-[#1A2332] rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-neonBlue transition"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> GỬI ĐÓNG GÓP TỚI ADMIN
            </button>
          </form>

          {/* Danh sách các góp ý đã gửi */}
          <div className="space-y-3 pt-4 border-t border-[#1A2332]">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ý kiến đóng góp gần đây từ cộng đồng:</h4>
            {feedbacks.length === 0 ? (
              <p className="text-xs text-gray-500">Chưa có đóng góp nào. Hãy là người đầu tiên gửi góp ý!</p>
            ) : (
              feedbacks.slice(0, 5).map((f) => (
                <div key={f.id} className="bg-[#080B10] border border-[#1A2332] p-3.5 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-cyanGlow">{f.username || 'Khách ẩn danh'}</span>
                    <span className="text-gray-500 text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {f.created_at ? new Date(f.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{f.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}