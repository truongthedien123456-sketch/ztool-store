'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  FolderKanban, Sparkles, CheckCircle2, MessageSquare, Send, Clock, Server, 
  Briefcase, Crown, Gem, Flame, Star, Award, User
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [userVipMap, setUserVipMap] = useState<{ [key: string]: number }>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [serverName, setServerName] = useState('');
  const [jobName, setJobName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProjectsAndFeedbacks();

    // Lắng nghe realtime các yêu cầu góp ý mới
    const channel = supabase
      .channel('projects_realtime_feedbacks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, () => loadProjectsAndFeedbacks())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Cấu hình bậc VIP và khung viền riêng biệt
  const getVipInfo = (amount: number) => {
    if (amount >= 5000000) {
      return {
        level: 5,
        title: 'VIP 5',
        sub: 'Huyền Thoại',
        badgeBg: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-500/50 text-rose-300',
        border: 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] ring-2 ring-rose-500/30',
        avatarBg: 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 text-white',
        icon: Flame,
      };
    }
    if (amount >= 3000000) {
      return {
        level: 4,
        title: 'VIP 4',
        sub: 'Bạch Kim',
        badgeBg: 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-500/50 text-purple-300',
        border: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-2 ring-purple-500/30',
        avatarBg: 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 text-white',
        icon: Gem,
      };
    }
    if (amount >= 2000000) {
      return {
        level: 3,
        title: 'VIP 3',
        sub: 'Hoàng Kim',
        badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-300',
        border: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] ring-2 ring-amber-400/30',
        avatarBg: 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950',
        icon: Crown,
      };
    }
    if (amount >= 1000000) {
      return {
        level: 2,
        title: 'VIP 2',
        sub: 'Tinh Anh',
        badgeBg: 'bg-gradient-to-r from-slate-400/20 to-cyan-500/20 border-cyan-400/50 text-cyan-300',
        border: 'border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/20',
        avatarBg: 'bg-gradient-to-tr from-slate-400 via-cyan-400 to-blue-500 text-slate-950',
        icon: Star,
      };
    }
    if (amount >= 500000) {
      return {
        level: 1,
        title: 'VIP 1',
        sub: 'Đồng Neon',
        badgeBg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/50 text-orange-300',
        border: 'border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)] ring-1 ring-orange-500/20',
        avatarBg: 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white',
        icon: Award,
      };
    }
    return {
      level: 0,
      title: 'THÀNH VIÊN',
      sub: 'Thành viên',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      border: 'border-slate-800/90 hover:border-cyan-500/40 shadow-md',
      avatarBg: 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950',
      icon: User,
    };
  };

  const loadProjectsAndFeedbacks = async () => {
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

      setProjects(projectData || []);

      const { data: feedbackData } = await supabase
        .from('feedbacks')
        .select('*')
        .order('id', { ascending: false });

      if (feedbackData) {
        setFeedbacks(feedbackData);

        // Tính tổng nạp thực tế của từng tài khoản để xếp bậc VIP
        const uniqueUsers = Array.from(new Set(feedbackData.map((f: any) => f.username).filter(Boolean)));
        
        if (uniqueUsers.length > 0) {
          const { data: transData } = await supabase
            .from('transactions')
            .select('username, amount, type')
            .in('username', uniqueUsers)
            .in('type', ['RECHARGE', 'ADMIN_ADD', 'ADMIN_SUB']);

          if (transData) {
            const map: { [key: string]: number } = {};
            transData.forEach((t: any) => {
              const u = t.username;
              if (!map[u]) map[u] = 0;
              if (t.type === 'ADMIN_SUB') {
                map[u] -= Math.abs(Number(t.amount) || 0);
              } else {
                map[u] += (Number(t.amount) || 0);
              }
            });
            setUserVipMap(map);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim() || !jobName.trim() || !toolDescription.trim()) {
      alert('Vui lòng điền đầy đủ cả 3 thông tin!');
      return;
    }

    const currentUsername = localStorage.getItem('ztool_current_user') || 'Khách ẩn danh';
    const fullContent = `[Server: ${serverName.trim()}] - [Nghề: ${jobName.trim()}]\nMô tả & Cách hoạt động: ${toolDescription.trim()}`;

    const { error } = await supabase.from('feedbacks').insert([
      {
        username: currentUsername,
        content: fullContent
      }
    ]);

    if (!error) {
      setServerName('');
      setJobName('');
      setToolDescription('');
      setMsg('Gửi yêu cầu phát triển Tool thành công! Admin sẽ xem xét sớm nhất.');
      loadProjectsAndFeedbacks();
    } else {
      setMsg('Có lỗi xảy ra khi gửi góp ý!');
    }
  };

  return (
    <main className="font-sans pb-20 min-h-screen">
      {isLoadingData ? (
        <div className="min-h-[60vh]"></div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 py-8 space-y-12"
        >
          {/* HEADER TRANG DỰ ÁN */}
          <div className="text-center space-y-3 border-b border-[#1A2332] pb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" /> DỰ ÁN & SẢN PHẨM ĐÃ PHÁT TRIỂN
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">DANH SÁCH DỰ ÁN CỦA SHOP ZTOOL</h1>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
              Tổng hợp các hệ thống, mã nguồn tool tự động đã hoàn thiện và đang được bảo trì nâng cấp thường xuyên.
            </p>
          </div>

          {/* DANH SÁCH CÁC DỰ ÁN CỦA SHOP */}
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-[#0F141C] border border-[#1A2332] rounded-3xl space-y-3">
              <FolderKanban className="w-12 h-12 text-cyan-400/40 mx-auto" />
              <h3 className="text-sm font-bold text-white">HIỆN TẠI CHƯA CÓ DỰ ÁN NÀO</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Chưa có dự án nào được cập nhật trên hệ thống. Hãy quay lại sau hoặc gửi yêu cầu đặt tool bên dưới!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 shadow-xl hover:border-cyan-400/50 transition duration-300">
                  <div className="w-full aspect-square bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden relative">
                    <img src={p.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md">
                      {p.status || 'Hoạt động tốt'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                      {p.description || 'Chưa có thông tin chi tiết dự án.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FORM GỬI YÊU CẦU PHÁT TRIỂN TOOL & DANH SÁCH YÊU CẦU CÓ VIP AVATAR */}
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 sm:p-8 space-y-8 max-w-4xl mx-auto shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">ĐÓNG GÓP Ý KIẾN PHÁT TRIỂN DỰ ÁN TOOL</h2>
                <p className="text-xs text-slate-400">Gửi thông tin Server & Nghề bạn muốn làm Tool tự động cho Admin</p>
              </div>
            </div>

            {msg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {msg}
              </div>
            )}

            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" /> Tên Server FiveM
                  </label>
                  <input
                    type="text"
                    required
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="vd: F17 City, Lũ Quỷ RP..."
                    className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Tên Nghề Cần Làm Tool
                  </label>
                  <input
                    type="text"
                    required
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="vd: Nghề Công Trường, Câu Cá, Chặt Gỗ..."
                    className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mô tả chi tiết nghề & Cách bạn muốn Tool hoạt động
                </label>
                <textarea
                  required
                  rows={4}
                  value={toolDescription}
                  onChange={(e) => setToolDescription(e.target.value)}
                  placeholder="Mô tả các bước thực hiện trong game (vd: tự chạy đến vị trí, bấm phím E, giải minigame mũi tên, tự cất đồ vào cốp xe...)"
                  className="w-full bg-[#080B10] border border-[#1A2332] rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-cyan-400 transition leading-relaxed shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" /> GỬI YÊU CẦU LÀM TOOL TỚI ADMIN
              </button>
            </form>

            {/* ================= KHU VỰC YÊU CẦU GẦN ĐÂY CÓ AVATAR & KHUNG VIP ================= */}
            <div className="space-y-4 pt-4 border-t border-[#1A2332]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Yêu cầu phát triển tool gần đây:
                </h4>
                <span className="text-[11px] text-slate-500 font-bold">{feedbacks.length} yêu cầu</span>
              </div>

              {feedbacks.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Chưa có yêu cầu nào. Hãy là người đầu tiên gửi ý tưởng!</p>
              ) : (
                <div className="space-y-3.5">
                  {feedbacks.map((f) => {
                    const author = f.username || 'Khách';
                    const userDeposit = userVipMap[author] || 0;
                    const authorVip = getVipInfo(userDeposit);
                    const AuthorVipIcon = authorVip.icon;

                    return (
                      <div 
                        key={f.id} 
                        className={`bg-[#080B10] border-2 ${authorVip.border} p-4.5 rounded-2xl space-y-3 transition-all duration-300 relative overflow-hidden`}
                      >
                        {/* Header của thẻ: Avatar VIP, Username, Badge VIP & Thời gian */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-3">
                            
                            {/* Avatar theo màu sắc VIP */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-md shrink-0 relative ${authorVip.avatarBg}`}>
                              {author.charAt(0).toUpperCase()}
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080B10] absolute -bottom-0.5 -right-0.5"></span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white text-xs tracking-wide">
                                  {author}
                                </span>
                                
                                {/* Badge cấp bậc VIP */}
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${authorVip.badgeBg}`}>
                                  <AuthorVipIcon className="w-2.5 h-2.5" />
                                  {authorVip.level > 0 ? authorVip.title : 'THÀNH VIÊN'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">Người đóng góp ý kiến</span>
                            </div>
                          </div>

                          {/* Thời gian */}
                          <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> 
                            {f.created_at ? new Date(f.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                          </span>
                        </div>

                        {/* Nội dung yêu cầu */}
                        <div className="bg-[#05080E] border border-slate-800/90 p-3.5 rounded-xl text-xs text-slate-200 whitespace-pre-line leading-relaxed font-medium shadow-inner">
                          {f.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}