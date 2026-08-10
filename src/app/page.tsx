'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  Sparkles, Wrench, ShieldCheck, Zap, ArrowRight, ShoppingBag, FolderKanban, Bell
} from 'lucide-react';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [systemNotice, setSystemNotice] = useState<{ text: string, active: boolean } | null>(null);
  
  // Thêm trạng thái chờ tải dữ liệu
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
        .order('id', { ascending: false });

      if (toolData && toolData.length > 0) {
        const mappedTools = toolData.map((t: any) => ({
          id: t.id,
          name: t.name,
          image: t.image,
          status: t.status || 'Đang hoạt động',
          priceDay: t.priceDay || t.price_day || '',
          priceWeek: t.priceWeek || t.price_week || '',
          priceMonth: t.priceMonth || t.price_month || '',
          priceLifetime: t.priceLifetime || t.price_lifetime || '',
          description: t.description
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

      // Tải Thông báo từ Admin (id = 1)
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
      // Xác nhận đã tải xong data hoàn toàn
      setIsLoading(false);
    }
  };

  const activeTools = tools.filter(t => t.status !== 'Tạm ngưng');
  const featuredTool = activeTools.length > 0 ? activeTools[0] : null;

  return (
    <main className="font-sans pb-20 min-h-screen">
      {isLoading ? (
        // Khoảng trống bảo vệ cấu trúc trong lúc chờ data để chống chớp giật
        <div className="min-h-[60vh]"></div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 py-8 space-y-12"
        >

          {/* KHUNG HIỂN THỊ THÔNG BÁO TỪ ADMIN */}
          {systemNotice?.active && systemNotice?.text && (
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/40">
                <Bell className="w-5 h-5 text-amber-400 animate-[bounce_2s_infinite]" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1 drop-shadow-md">THÔNG BÁO TỪ ADMIN ZTOOL</h4>
                <p className="text-sm font-bold text-amber-100/90 leading-snug whitespace-pre-line">
                  {systemNotice.text}
                </p>
              </div>
            </div>
          )}

          {/* Banner Hero Chuyển Động */}
          <div className="bg-[#0D121D] border border-[#1C2638] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center shadow-2xl relative overflow-hidden">
            <div className="lg:col-span-2 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-400">
                <Sparkles className="w-4 h-4" /> HỆ THỐNG CUNG CẤP TOOL AUTOMATION FIVEM
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-wide">
                TỰ ĐỘNG HÓA TRẢI NGHIỆM GAME CỦA BẠN
              </h1>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Cung cấp đầy đủ các bản Tool Farm cho mọi server FiveM / Launcher. Key hoạt động tự động 24/7 ngay sau khi thanh toán.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300 pt-2">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Hoạt động ổn định</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Hỗ trợ Update liên tục</span>
                <span className="flex items-center gap-1.5"><Wrench className="w-4 h-4 text-cyan-400" /> Key cấp tự động 24/7</span>
              </div>
              <div className="pt-4">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition"
                >
                  <ShoppingBag className="w-4 h-4" /> XEM TẤT CẢ TOOL
                </Link>
              </div>
            </div>

            {/* Khung Tool Nổi Bật */}
            {featuredTool && (
              <div className="group bg-[#06090E] border-2 border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-5 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative z-10">
                <div className="flex justify-between items-center border-b border-[#1C2638] pb-3">
                  <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Wrench className="w-4 h-4" /> TOOL NỔI BẬT
                  </span>
                  
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded border text-emerald-400 bg-emerald-500/20 border-emerald-500/30">
                    {featuredTool.status ? featuredTool.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                  </span>
                </div>

                <div className="w-full aspect-square bg-[#0D121D] border border-[#1C2638] rounded-2xl overflow-hidden relative">
                  <img 
                    src={featuredTool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                    alt={featuredTool.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition">{featuredTool.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{featuredTool.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1C2638]">
                  <span className="text-xs text-emerald-400 font-extrabold">Giá từ: {formatPrice(featuredTool.priceDay)} VNĐ</span>
                  <Link href="/tools" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                    Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Section Danh Sách Tool Sản Phẩm */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1C2638] pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-cyan-400" /> SẢN PHẨM TOOL AUTO
                </h2>
                <p className="text-xs text-slate-400 mt-1">Danh sách các bản hack/tool tự động mới nhất</p>
              </div>
              <Link href="/tools" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.slice(0, 3).map((tool) => (
                <div 
                  key={tool.id} 
                  className="bg-[#0D121D] border-2 border-[#1C2638] hover:border-cyan-400 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-[#06090E] border border-[#1C2638] rounded-2xl overflow-hidden relative">
                      <img 
                        src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                        alt={tool.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                      
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

                  <div className="flex items-center justify-between pt-3 border-t border-[#1C2638]">
                    <div className="leading-none">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Giá theo ngày</span>
                      <span className="text-xs text-emerald-400 font-black">{tool.priceDay ? `${formatPrice(tool.priceDay)} VNĐ` : '---'}</span>
                    </div>
                    <Link 
                      href="/tools" 
                      className={`font-bold px-4 py-2 rounded-xl text-xs transition ${
                        tool.status === 'Tạm ngưng'
                          ? 'bg-slate-800 text-slate-500 border border-slate-700'
                          : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
                      }`}
                    >
                      {tool.status === 'Tạm ngưng' ? 'Tạm Ngưng' : 'Mua Ngay'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Dự Án Của Shop */}
          {projects.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-[#1C2638] pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-cyan-400" /> DỰ ÁN CỦA SHOP
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Các sản phẩm và dịch vụ đã phát triển thành công</p>
                </div>
                <Link href="/projects" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                  Xem tất cả dự án <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 3).map((p) => (
                  <div key={p.id} className="bg-[#0D121D] border border-[#1C2638] rounded-3xl p-5 space-y-3 hover:border-cyan-500/40 transition">
                    {p.image && (
                      <div className="w-full aspect-square bg-[#06090E] border border-[#1C2638] rounded-2xl overflow-hidden">
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