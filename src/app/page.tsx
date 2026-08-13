'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Wrench, ShieldCheck, Zap, ArrowRight, ShoppingBag, FolderKanban, Bell, Flame, Eye, Info, X, Tag, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [systemNotice, setSystemNotice] = useState<{ text: string, active: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States Modal Chi Tiết & Modal Mua
  const [selectedToolForDetail, setSelectedToolForDetail] = useState<any | null>(null);
  const [selectedToolForBuy, setSelectedToolForBuy] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'day' | 'week' | 'month' | 'lifetime'>('day');
  
  // States Mã giảm giá & Thanh toán
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingBuy, setLoadingBuy] = useState(false);

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
          downloadLink: t.downloadLink || t.download_link || '',
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

  // Xử lý mở Modal Chi Tiết và cộng view ngầm
  const handleOpenDetail = async (tool: any) => {
    if (!tool) return;
    setSelectedToolForDetail(tool);
    try {
      const newViews = (tool.views || 0) + 1;
      await supabase.from('tools').update({ views: newViews }).eq('id', tool.id);
      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, views: newViews } : t));
    } catch (e) {
      console.error('Lỗi cộng lượt xem:', e);
    }
  };

  // Xử lý mở Modal Mua Ngay
  const handleOpenBuyModal = (tool: any) => {
    if (!tool || tool.status === 'Tạm ngưng') return;
    setSelectedToolForBuy(tool);
    setPurchaseMsg(null);
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponMsg(null);
  };

  const handleApplyCoupon = async () => {
    setCouponMsg(null);
    if (!couponInput.trim()) {
      setCouponMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá!' });
      return;
    }

    const { data: couponData, error } = await supabase.from('coupons').select('*').eq('code', couponInput.trim().toUpperCase()).single();

    if (error || !couponData) {
      setCouponMsg({ type: 'error', text: 'Mã giảm giá không tồn tại hoặc đã hết hạn!' });
      return;
    }

    if (couponData.quantity <= 0) {
      setCouponMsg({ type: 'error', text: 'Mã giảm giá này đã được sử dụng hết số lượng!' });
      return;
    }

    const currentToolCode = (selectedToolForBuy?.toolCode || selectedToolForBuy?.tool_code || '').trim().toLowerCase();
    const couponToolCode = (couponData.tool_code || '').trim().toLowerCase();

    if (couponToolCode !== 'all' && couponToolCode !== currentToolCode) {
      setCouponMsg({ type: 'error', text: 'Mã giảm giá này không áp dụng cho sản phẩm tool này!' });
      return;
    }

    setAppliedCoupon(couponData);
    setCouponMsg({ type: 'success', text: `Áp dụng mã thành công! Giảm trực tiếp ${Number(couponData.discount_amount).toLocaleString('en-US')}đ` });
  };

  const handleBuyTool = async () => {
    setPurchaseMsg(null);
    if (!selectedToolForBuy) return;

    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) {
      setPurchaseMsg({ type: 'error', text: 'Vui lòng đăng nhập tài khoản để thực hiện giao dịch!' });
      return;
    }

    setLoadingBuy(true);

    const { data: userData } = await supabase.from('users').select('*').eq('username', currentUsername).single();

    if (!userData) {
      setLoadingBuy(false);
      setPurchaseMsg({ type: 'error', text: 'Không tìm thấy thông tin tài khoản của bạn trên hệ thống!' });
      return;
    }

    try {
      const gistId = '21f0a39cbc434e5033d89f06e2c7d26e';
      const gistCheckRes = await fetch(`https://api.github.com/gists/${gistId}?timestamp=${Date.now()}`, { cache: 'no-store' });
      if (gistCheckRes.ok) {
        const gistJson = await gistCheckRes.json();
        const accountsParsed = JSON.parse(gistJson.files['accounts.json']?.content || '{}');
        const tCode = selectedToolForBuy.toolCode || selectedToolForBuy.tool_code || '';
        const cleanToolCode = tCode ? tCode.replace(/[^a-zA-Z0-9]/g, '_') : 'tool';
        const targetKey = tCode ? `${userData.username}_${cleanToolCode}` : userData.username;

        if (accountsParsed[targetKey] && accountsParsed[targetKey].expire_timestamp === 0) {
          setLoadingBuy(false);
          setPurchaseMsg({ type: 'error', text: 'Bạn đã sở hữu gói Vĩnh Viễn cho tool này rồi, không thể gia hạn hoặc mua tiếp!' });
          return;
        }
      }
    } catch (e) {
      console.error('Lỗi kiểm tra vĩnh viễn trên Gist:', e);
    }

    let priceStr = '0'; let durationText = '1 Ngày'; let durationDays = 1;
    if (selectedDuration === 'day') { priceStr = selectedToolForBuy.priceDay || '0'; durationText = '1 Ngày'; durationDays = 1; }
    if (selectedDuration === 'week') { priceStr = selectedToolForBuy.priceWeek || '0'; durationText = '7 Ngày'; durationDays = 7; }
    if (selectedDuration === 'month') { priceStr = selectedToolForBuy.priceMonth || '0'; durationText = '30 Ngày'; durationDays = 30; }
    if (selectedDuration === 'lifetime') { priceStr = selectedToolForBuy.priceLifetime || '0'; durationText = 'Vĩnh Viễn'; durationDays = 0; }

    const basePriceNum = Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
    const discountNum = appliedCoupon ? Number(appliedCoupon.discount_amount) || 0 : 0;
    const priceNum = Math.max(0, basePriceNum - discountNum);

    if ((userData.balance || 0) < priceNum) {
      setLoadingBuy(false);
      setPurchaseMsg({ type: 'error', text: `Số dư ví không đủ! Cần ${priceNum.toLocaleString('en-US')} VNĐ nhưng số dư hiện tại là ${(userData.balance || 0).toLocaleString('en-US')} VNĐ.` });
      return;
    }

    try {
      const gistRes = await fetch('/api/gist-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username, password: userData.password, durationDays: durationDays, tool_code: selectedToolForBuy.toolCode || selectedToolForBuy.tool_code || ''
        })
      });

      const gistData = await gistRes.json();

      if (!gistData.success) {
        setLoadingBuy(false);
        setPurchaseMsg({ type: 'error', text: `Lỗi đăng ký tài khoản Tool trên GitHub Gist: ${gistData.error || gistData.message}` });
        return;
      }

      if (appliedCoupon) {
        const newQty = Math.max(0, appliedCoupon.quantity - 1);
        await supabase.from('coupons').update({ quantity: newQty }).eq('id', appliedCoupon.id);
      }

      const newBalance = userData.balance - priceNum;
      await supabase.from('users').update({ balance: newBalance }).eq('id', userData.id);

      const newSales = (selectedToolForBuy.sales || 0) + 1;
      await supabase.from('tools').update({ sales: newSales }).eq('id', selectedToolForBuy.id);

      const logTitle = appliedCoupon ? `Mua ${selectedToolForBuy.name} (${durationText}) - Giảm giá mã ${appliedCoupon.code}` : `Mua ${selectedToolForBuy.name} (${durationText})`;
      await supabase.from('transactions').insert([{ username: userData.username, type: 'BUY', title: logTitle, amount: -priceNum, status: 'Thành công' }]);

      setLoadingBuy(false);
      setPurchaseMsg({ type: 'success', text: `Kích hoạt thành công! Tài khoản "${userData.username}" đã được cấp quyền sử dụng Tool (${durationText}) trên ứng dụng.` });

      setTimeout(() => { window.location.reload(); }, 2500);

    } catch (err: any) {
      setLoadingBuy(false);
      setPurchaseMsg({ type: 'error', text: `Lỗi kết nối máy chủ: ${err.message}` });
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

          {/* KHUNG THÔNG BÁO ADMIN */}
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

          {/* HERO BANNER CAO CẤP */}
          <div className="relative rounded-3xl bg-[#0B101B]/90 border border-slate-800/80 p-8 sm:p-12 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
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

              {featuredTool && (
                <div className="lg:col-span-5">
                  <div 
                    onClick={() => handleOpenDetail(featuredTool)}
                    className="group bg-[#0B1019]/90 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-5 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-500 cursor-pointer relative backdrop-blur-md"
                  >
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

                    <div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
                      <img 
                        src={featuredTool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                        alt={featuredTool.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
                      />
                      
                      <div className="absolute top-3 left-3 bg-[#05080E]/80 backdrop-blur-md border border-slate-700/60 px-3 py-1 rounded-xl flex items-center gap-1.5 text-[11px] text-slate-200 font-extrabold shadow-lg">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> {featuredTool.views || 0} lượt xem
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-white text-base group-hover:text-amber-400 transition duration-300">
                        {featuredTool.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {featuredTool.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Giá khởi điểm</span>
                        <span className="text-xs text-emerald-400 font-black">{formatPrice(featuredTool.priceDay)} VNĐ</span>
                      </div>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBuyModal(featuredTool);
                        }}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl hover:bg-amber-500/20"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Mua ngay
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
                  onClick={() => handleOpenDetail(tool)}
                  className="bg-[#0B1019] border-2 border-slate-800/80 hover:border-cyan-500/50 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-[#05080E] border border-slate-800/80 rounded-2xl overflow-hidden relative">
                      <img 
                        src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                        alt={tool.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                      
                      <div className="absolute top-3 left-3 bg-[#05080E]/80 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-200 font-bold">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> {tool.views || 0}
                      </div>

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
                    <button 
                      disabled={tool.status === 'Tạm ngưng'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBuyModal(tool);
                      }} 
                      className={`font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        tool.status === 'Tạm ngưng'
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> {tool.status === 'Tạm ngưng' ? 'Tạm Ngưng' : 'Mua Ngay'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION DỰ ÁN NỔI BẬT */}
          {projects.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2.5 tracking-wide uppercase">
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

          {/* MODAL CHI TIẾT TOOL */}
          <AnimatePresence>
            {selectedToolForDetail && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedToolForDetail(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 cursor-pointer"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0F141C] border border-[#1A2332] w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
                >
                  <button onClick={() => setSelectedToolForDetail(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-[#080B10] border border-[#1A2332] transition"><X className="w-5 h-5" /></button>
                  <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0"><Info className="w-6 h-6" /></div>
                    <div><span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">THÔNG TIN CHI TIẾT SẢN PHẨM</span><h2 className="text-xl font-black text-white">{selectedToolForDetail.name}</h2></div>
                  </div>
                  <div className="w-full max-w-md mx-auto aspect-square bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden relative">
                    <img src={selectedToolForDetail.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={selectedToolForDetail.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mô tả tính năng đầy đủ:</h4>
                    <p className="text-xs text-slate-300 bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl leading-relaxed whitespace-pre-line">{selectedToolForDetail.description || 'Chưa có nội dung mô tả chi tiết cho sản phẩm này.'}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center"><span className="text-[10px] text-slate-400 block">Ngày</span><b className="text-xs text-emerald-400">{formatPrice(selectedToolForDetail.priceDay)}đ</b></div>
                    <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center"><span className="text-[10px] text-slate-400 block">Tuần</span><b className="text-xs text-emerald-400">{formatPrice(selectedToolForDetail.priceWeek)}đ</b></div>
                    <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center"><span className="text-[10px] text-slate-400 block">Tháng</span><b className="text-xs text-emerald-400">{formatPrice(selectedToolForDetail.priceMonth)}đ</b></div>
                    <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center"><span className="text-[10px] text-slate-400 block">Vĩnh Viễn</span><b className="text-xs text-cyan-400">{formatPrice(selectedToolForDetail.priceLifetime)}đ</b></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      disabled={selectedToolForDetail.status === 'Tạm ngưng'}
                      onClick={() => { const tool = selectedToolForDetail; setSelectedToolForDetail(null); handleOpenBuyModal(tool); }}
                      className={`w-full font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition ${selectedToolForDetail.status === 'Tạm ngưng' ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'}`}
                    >
                      <ShoppingBag className="w-4 h-4" /> {selectedToolForDetail.status === 'Tạm ngưng' ? 'SẢN PHẨM TẠM NGƯNG' : 'MUA SẢN PHẨM NÀY NGAY'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL MUA SẢN PHẨM */}
          <AnimatePresence>
            {selectedToolForBuy && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedToolForBuy(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 cursor-pointer"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0F141C] border border-[#1A2332] w-full max-w-lg rounded-3xl p-6 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
                >
                  <button onClick={() => setSelectedToolForBuy(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332] transition"><X className="w-5 h-5" /></button>
                  <div className="space-y-1"><span className="text-xs text-cyan-400 font-bold">XÁC NHẬN MUA SẢN PHẨM</span><h2 className="text-xl font-black text-white">{selectedToolForBuy.name}</h2></div>
                  <div className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#1A2332]"><img src={selectedToolForBuy.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={selectedToolForBuy.name} className="w-full h-full object-cover" /></div>
                    <div className="space-y-1 flex-1 min-w-0"><span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Mã Tool: {selectedToolForBuy.toolCode || selectedToolForBuy.tool_code || '---'}</span><p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{selectedToolForBuy.description || 'Chưa có mô tả cho sản phẩm này.'}</p></div>
                  </div>

                  <div className="space-y-2 bg-[#080B10] border border-[#1A2332] p-3.5 rounded-2xl">
                    <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-cyan-400" /> Mã giảm giá (nếu có):</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Nhập mã giảm giá..." value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="flex-1 bg-[#0F141C] border border-[#1C2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 uppercase font-mono" />
                      <button onClick={handleApplyCoupon} className="bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">Áp dụng</button>
                    </div>
                    {couponMsg && <p className={`text-[11px] font-bold ${couponMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{couponMsg.text}</p>}
                  </div>

                  {purchaseMsg && (
                    <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${purchaseMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                      {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}<span>{purchaseMsg.text}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">Chọn gói thời hạn sử dụng:</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[ { key: 'day', name: 'Gói 1 Ngày', price: selectedToolForBuy.priceDay }, { key: 'week', name: 'Gói 7 Ngày', price: selectedToolForBuy.priceWeek }, { key: 'month', name: 'Gói 30 Ngày', price: selectedToolForBuy.priceMonth }, { key: 'lifetime', name: 'Gói Vĩnh Viễn', price: selectedToolForBuy.priceLifetime }, ].map((pkg) => {
                        const originalPrice = Number(String(pkg.price || '0').replace(/[^0-9]/g, '')) || 0;
                        const discountAmt = appliedCoupon ? Number(appliedCoupon.discount_amount) || 0 : 0;
                        const finalPkgPrice = Math.max(0, originalPrice - discountAmt);
                        return (
                          <button key={pkg.key} onClick={() => setSelectedDuration(pkg.key as any)} className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${selectedDuration === pkg.key ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-[#080B10] border-[#1A2332] text-slate-400'}`}>
                            <div className="font-bold">{pkg.name}</div>
                            <div>
                              {appliedCoupon && discountAmt > 0 && originalPrice > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="line-through text-slate-500 text-[10px]">{formatPrice(originalPrice)}đ</span>
                                  <span className="text-emerald-400 font-extrabold">
                                    {finalPkgPrice === 0 ? '0 VNĐ' : `${formatPrice(finalPkgPrice)} VNĐ`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-emerald-400 font-extrabold">
                                  {originalPrice === 0 ? '0 VNĐ' : `${formatPrice(originalPrice)} VNĐ`}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button disabled={loadingBuy} onClick={handleBuyTool} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2">
                    {loadingBuy ? (<><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>ĐANG KHỞI TẠO TÀI KHOẢN</span></>) : (<><ShieldCheck className="w-4 h-4" /> XÁC NHẬN THANH TOÁN TỪ VÍ</>)}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </main>
  );
}