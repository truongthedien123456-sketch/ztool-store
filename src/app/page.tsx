'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  Sparkles, Wrench, ShieldCheck, Zap, ArrowRight, ShoppingBag, FolderKanban, Bell, Flame, Eye, Star, TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [systemNotice, setSystemNotice] = useState<{ text: string, active: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeSyncData();
  }, []);

  const formatPrice = (price: string | number) => {
    if (!price) return '---';
    const num = Number(String(price).replace(/[^0-9]/g, ''));
    if (isNaN(num) || num === 0) return '---';
    return num.toLocaleString('en-US');
  };

  const loadHomeSyncData = async () => {
    try {
      const { data: toolData } = await supabase
        .from('tools')
        .select('*')
        .order('views', { ascending: false });

      if (toolData && toolData.length > 0) {
        const mappedTools = toolData.map((t: any) => ({
          id: t.id,
          name: t.name,
          toolCode: t.toolCode || t.tool_code || '',
          image: t.image,
          status: t.status || 'Đang hoạt động',
          priceDay: t.priceDay || t.price_day || '',
          priceWeek: t.priceWeek || t.price_week || '',
          priceMonth: t.priceMonth || t.price_month || '',
          priceLifetime: t.priceLifetime || t.price_lifetime || '',
          description: t.description,
          views: Number(t.views) || 0,
          sales: Number(t.sales) || 0
        }));
        setTools(mappedTools);
      }

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

      if (projectData && projectData.length > 0) {
        setProjects(projectData);
      }

      const { data: noticeData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (noticeData) {
        setSystemNotice({ text: noticeData.notice_text, active: noticeData.is_active });
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTools = [...tools].filter(t => t.status !== 'Tạm ngưng').sort((a, b) => b.views - a.views);
  const featuredTool = activeTools.length > 0 ? activeTools[0] : null;

  const handleOpenFeaturedTool = async (tool: any) => {
    if (!tool) return;
    try {
      const newViews = (tool.views || 0) + 1;
      await supabase.from('tools').update({ views: newViews }).eq('id', tool.id);
      
      const event = new CustomEvent('open-buy-tool-modal', {
        detail: { toolCode: tool.toolCode }
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.error('Lỗi cộng lượt xem:', e);
    }
  };

  return (
    <main className="font-sans pb-24 min-h-screen bg-[#05070D] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {isLoading ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 py-6 space-y-12"
        >

          {/* KHUNG THÔNG BÁO ADMIN - CYBERPUNK GLASS */}
          {systemNotice?.active && systemNotice?.text && (
            <div className="bg-[#0E1522]/80 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.12)] relative overflow-hidden group">
              <div className="absolute -left-10 top-0 bottom-0 w-24 bg-amber-500/10 blur-xl group-hover:bg-amber-500/20 transition duration-500"></div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Bell className="w-5 h-5 text-amber-400 animate-[bounce_2s_infinite]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    THÔNG BÁO TỪ HỆ THỐNG
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed whitespace-pre-line truncate">
                  {systemNotice.text}
                </p>
              </div>
            </div>
          )}

          {/* HERO BANNER CAO CẤP DẠNG GLASS COCKPIT */}
          <div className="relative rounded-3xl bg-[#0B101B]/90 border border-slate-800/80 p-8 sm:p-12 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Đổ hào quang nền (Background Ambient Glow) */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Cột Trái */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#121A2A] border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-400 shadow-inner">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> HỆ THỐNG AUTOMATION FIVEM HIGH-QUALITY
                </div>
                
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400 leading-[1.15] tracking-tight">
                  TỰ ĐỘNG HÓA TRẢI NGHIỆM GAME
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed font-normal">
                  Chuyên cung cấp các bản Tool Auto Farm chuẩn xác, tích hợp bypass hiện đại cho mọi Server FiveM / GTA V Launcher. Kích hoạt tài khoản tự động 24/7 tức thì.
                </p>

                {/* Các tính năng nổi bật dạng Chip */}
                <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-300 pt-1">
                  <span className="bg-[#121927] border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Hoạt động ổn định
                  </span>
                  <span className="bg-[#121927] border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Update liên tục
                  </span>
                  <span className="bg-[#121927] border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" /> Key tự động 24/7
                  </span>
                </div>

                <div className="pt-3">
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black px-7 py-4 rounded-2xl text-xs shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition duration-300 hover:scale-[1.02]"
                  >
                    <ShoppingBag className="w-4 h-4" /> TRUY CẬP CỬA HÀNG TOOL
                  </Link>
                </div>
              </div>

              {/* Cột Phải: CARD TOOL NỔI BẬT DẠNG CYBER BOARD */}
              {featuredTool && (
                <div className="lg:col-span-5">
                  <div 
                    onClick={() => handleOpenFeaturedTool(featuredTool)}
                    className="group bg-[#0B1019]/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-5 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-500 cursor-pointer relative backdrop-blur-md"
                  >
                    {/* Badge Tiêu đề Tool Nổi Bật */}
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Flame className="w-4 h-4 fill-amber-400" /> TOOL NỔI BẬT TOP 1
                        </span>
                      </div>
                      
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg border text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                        {featuredTool.status ? featuredTool.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                      </span>
                    </div>

                    {/* Khung Ảnh Banner Tool */}
                    <div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
                      <img 
                        src={featuredTool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                        alt={featuredTool.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
                      />
                      
                      {/* Badge Lượt xem ở Góc Trái Trên */}
                      <div className="absolute top-3 left-3 bg-[#05080E]/80 backdrop-blur-md border border-slate-700/60 px-3 py-1 rounded-xl flex items-center gap-1.5 text-[11px] text-slate-200 font-extrabold shadow-lg">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> {featuredTool.views || 0} lượt xem
                      </div>
                    </div>

                    {/* Thông tin tên & mô tả */}
                    <div className="space-y-1">
                      <h3 className="font-black text-white text-base group-hover:text-amber-400 transition duration-300">
                        {featuredTool.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {featuredTool.description}
                      </p>
                    </div>

                    {/* Chân Card */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Giá khởi điểm</span>
                        <span className="text-xs text-emerald-400 font-black">{formatPrice(featuredTool.priceDay)} VNĐ</span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1 transition">
                        Xem ngay <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION DANH SÁCH TOOL */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5 tracking-wide uppercase">
                  <Wrench className="w-5 h-5 text-cyan-400" /> DANH SÁCH TOOL AUTO
                </h2>
                <p className="text-xs text-slate-400 mt-1">Các bản tool được cập nhật liên tục</p>
              </div>
              <Link href="/tools" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.slice(0, 3).map((tool) => (
                <div 
                  key={tool.id} 
                  className="bg-[#0B1019] border-2 border-slate-800/80 hover:border-cyan-500/50 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-[#05080E] border border-slate-800/80 rounded-2xl overflow-hidden relative">
                      <img 
                        src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                        alt={tool.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                      
                      {/* Badge Mắt xem Góc Trái */}
                      <div className="absolute top-3 left-3 bg-[#05080E]/80 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-200 font-bold">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> {tool.views || 0}
                      </div>

                      {/* Badge Trạng thái Góc Phải */}
                      <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                        tool.status === 'Tạm ngưng'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {tool.status ? tool.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition">{tool.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="leading-none">
                      <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Gói ngày</span>
                      <span className="text-xs text-emerald-400 font-black">{tool.priceDay ? `${formatPrice(tool.priceDay)} VNĐ` : '---'}</span>
                    </div>
                    <Link 
                      href="/tools" 
                      className={`font-bold px-4 py-2 rounded-xl text-xs transition ${
                        tool.status === 'Tạm ngưng'
                          ? 'bg-slate-800 text-slate-500 border border-slate-700'
                          : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
                      }`}
                    >
                      {tool.status === 'Tạm ngưng' ? 'Tạm Ngưng' : 'Mua Ngay'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION DỰ ÁN */}
          {projects.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2.5 tracking-wide">
                    <FolderKanban className="w-5 h-5 text-cyan-400" /> DỰ ÁN NỔI BẬT
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Các dự án, tool đang trong thời gian phát triển</p>
                </div>
                <Link href="/projects" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
                  Xem tất cả dự án <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 3).map((p) => (
                  <div key={p.id} className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-5 space-y-3 hover:border-cyan-500/40 transition">
                    {p.image && (
                      <div className="w-full aspect-square bg-[#05080E] border border-slate-800/80 rounded-2xl overflow-hidden">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm">{p.title}</h3>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">{p.status || 'Hoạt động tốt'}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      )}
    </main>
  );
}