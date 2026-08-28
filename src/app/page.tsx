'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Wrench, ShieldCheck, Zap, ArrowRight, ShoppingBag, FolderKanban, Bell, Flame, Eye, Info, X, Tag, CheckCircle2, AlertCircle, Loader2, Shield, Check, ZoomIn, Gift, Laptop, Star, Activity, Video, Image as ImageIcon, HelpCircle, Cpu, History
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
  const [detailMediaTab, setDetailMediaTab] = useState<'video' | 'image' | 'changelog'>('video');
  const [buyMediaTab, setBuyMediaTab] = useState<'image' | 'video'>('image');
  
  // State Trải Nghiệm Dùng Thử 3 Ngày
  const [trialTool, setTrialTool] = useState<any | null>(null);
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [trialMsg, setTrialMsg] = useState<{ type: 'success' | 'error'; text: string; successAction?: 'open_purchased' } | null>(null);

  // States Mã giảm giá & Thanh toán
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string; successAction?: 'open_purchased' } | null>(null);
  const [loadingBuy, setLoadingBuy] = useState(false);

  // State Phóng to ảnh
  const [zoomImage, setZoomImage] = useState<string | null>(null);

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
      // 1. Tải tools an toàn với select('*')
      const { data: toolData, error: toolErr } = await supabase
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
          videoLink: t.videoLink || t.video_link || '',
          version: t.version || '',
          changelog: t.changelog || '',
          views: Number(t.views) || 0,
          sales: Number(t.sales) || 0
        }));
        setTools(mappedTools);
      }

      // 2. Tải projects
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

      if (projectData && projectData.length > 0) {
        setProjects(projectData);
      }

      // 3. Tải thông báo
      const { data: noticeData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (noticeData) {
        setSystemNotice({ text: noticeData.notice_text, active: noticeData.is_active });
      }

    } catch (error) {
      console.error('Lỗi tải dữ liệu trang chủ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTools = [...tools].filter(t => t.status !== 'Tạm ngưng').sort((a, b) => b.views - a.views);
  const featuredTool = activeTools.length > 0 ? activeTools[0] : null;

  const handleOpenDetail = async (tool: any) => {
    if (!tool) return;
    setSelectedToolForDetail(tool);
    setDetailMediaTab(tool.videoLink ? 'video' : 'image');
    try {
      const newViews = (tool.views || 0) + 1;
      await supabase.from('tools').update({ views: newViews }).eq('id', tool.id);
      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, views: newViews } : t));
    } catch (e) {
      console.error('Lỗi cộng lượt xem:', e);
    }
  };

  const handleOpenBuyModal = (tool: any) => {
    if (!tool || tool.status === 'Tạm ngưng') return;
    setSelectedToolForBuy(tool);
    setBuyMediaTab(tool.videoLink ? 'video' : 'image');
    setPurchaseMsg(null);
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponMsg(null);
  };

  const calculateDiscount = (originalPrice: number, coupon: any) => {
    if (!coupon || originalPrice <= 0) return 0;
    if (coupon.discount_type === 'PERCENT' || (coupon.discount_percent && Number(coupon.discount_percent) > 0)) {
      const percent = Number(coupon.discount_percent) || 0;
      return Math.round((originalPrice * percent) / 100);
    }
    return Number(coupon.discount_amount) || 0;
  };

  const handleApplyCoupon = async () => {
    setCouponMsg(null);
    if (!couponInput.trim()) {
      setCouponMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá!' });
      return;
    }

    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) {
      setCouponMsg({ type: 'error', text: 'Vui lòng đăng nhập để áp dụng mã!' });
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

    const maxUsesPerUser = couponData.max_uses_per_user || 1;
    const { data: userUsedLogs } = await supabase.from('transactions').select('id').eq('username', currentUsername).ilike('title', `%${couponData.code}%`);
    const timesUsed = userUsedLogs ? userUsedLogs.length : 0;
    
    if (timesUsed >= maxUsesPerUser) {
      setCouponMsg({ type: 'error', text: `Tài khoản đã đạt giới hạn dùng mã này (${maxUsesPerUser} lần)!` });
      return;
    }

    setAppliedCoupon(couponData);
    const isPercent = couponData.discount_type === 'PERCENT' || (couponData.discount_percent && Number(couponData.discount_percent) > 0);
    const successText = isPercent ? `Áp dụng mã thành công! Giảm ${couponData.discount_percent}%.` : `Áp dụng thành công! Giảm trực tiếp ${Number(couponData.discount_amount).toLocaleString('en-US')}đ`;
    setCouponMsg({ type: 'success', text: successText });
  };

  const handleActivateTrial = async () => {
    setTrialMsg(null);
    if (!trialTool) return;

    if (trialTool.status === 'Tạm ngưng') {
      setTrialMsg({ type: 'error', text: 'Sản phẩm Tool này hiện đang TẠM NGƯNG để bảo trì!' });
      return;
    }

    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) {
      setTrialMsg({ type: 'error', text: 'Vui lòng đăng nhập tài khoản trước khi nhận trải nghiệm dùng thử!' });
      return;
    }

    setLoadingTrial(true);
    const { data: userData } = await supabase.from('users').select('*').eq('username', currentUsername).single();

    if (!userData) {
      setLoadingTrial(false);
      setTrialMsg({ type: 'error', text: 'Không tìm thấy thông tin tài khoản!' });
      return;
    }

    const isExempt = userData.is_exempt === true;
    const isVerified = userData.is_verified === true || isExempt;

    if (!isVerified) {
      setLoadingTrial(false);
      setTrialMsg({ 
        type: 'error', 
        text: 'Tài khoản chưa xác thực Gmail! Vui lòng vào trang cá nhân để hoàn tất xác thực OTP trước khi nhận trải nghiệm.' 
      });
      return;
    }

    const tCode = trialTool.toolCode || trialTool.tool_code || '';
    const { data: trialHistory } = await supabase
      .from('transactions')
      .select('id')
      .eq('username', currentUsername)
      .eq('type', 'TRIAL')
      .ilike('title', `%${tCode}%`);

    if (trialHistory && trialHistory.length > 0) {
      setLoadingTrial(false);
      setTrialMsg({ type: 'error', text: `Tài khoản của bạn đã từng kích hoạt trải nghiệm bản dùng thử cho "${trialTool.name}" rồi!` });
      return;
    }

    try {
      const gistRes = await fetch('/api/gist-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
          durationDays: 3,
          tool_code: tCode
        })
      });

      const gistData = await gistRes.json();
      if (!gistData.success) {
        setLoadingTrial(false);
        setTrialMsg({ type: 'error', text: `Lỗi kích hoạt dùng thử: ${gistData.message || gistData.error}` });
        return;
      }

      await supabase.from('transactions').insert([{
        username: userData.username,
        type: 'TRIAL',
        title: `Kích hoạt trải nghiệm 3 ngày miễn phí - Tool: ${trialTool.name} (${tCode})`,
        amount: 0,
        status: 'Thành công'
      }]);

      setLoadingTrial(false);
      setTrialMsg({ 
        type: 'success', 
        text: `Kích hoạt trải nghiệm 3 ngày thành công! Bản quyền đã được cấp cho tài khoản "${userData.username}".`,
        successAction: 'open_purchased'
      });
    } catch (err: any) {
      setLoadingTrial(false);
      setTrialMsg({ type: 'error', text: `Lỗi kết nối máy chủ: ${err.message}` });
    }
  };

  const handleBuyTool = async () => {
    setPurchaseMsg(null);
    if (!selectedToolForBuy) return;

    if (selectedToolForBuy.status === 'Tạm ngưng') {
      setPurchaseMsg({ type: 'error', text: 'Sản phẩm Tool này hiện đang TẠM NGƯNG cung cấp!' });
      return;
    }

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

    const isExempt = userData.is_exempt === true;
    const isVerified = userData.is_verified === true || isExempt;

    if (!isVerified) {
      setLoadingBuy(false);
      setPurchaseMsg({ 
        type: 'error', 
        text: 'Tài khoản chưa xác thực Gmail! Vui lòng vào trang cá nhân để hoàn tất xác thực OTP.' 
      });
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
          setPurchaseMsg({ type: 'error', text: 'Bạn đã sở hữu gói Vĩnh Viễn cho tool này rồi, không thể mua tiếp!' });
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
    const discountNum = calculateDiscount(basePriceNum, appliedCoupon);
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
      setPurchaseMsg({ 
        type: 'success', 
        text: `Kích hoạt thành công! Quyền sử dụng Tool đã được cấp cho tài khoản "${userData.username}".`,
        successAction: 'open_purchased'
      });

    } catch (err: any) {
      setLoadingBuy(false);
      setPurchaseMsg({ type: 'error', text: `Lỗi kết nối máy chủ: ${err.message}` });
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      let videoId = '';
      if (url.includes('youtu.be/')) { 
        videoId = url.split('youtu.be/')[1].split('?')[0]; 
      } else if (url.includes('youtube.com/watch')) { 
        const urlParams = new URLSearchParams(new URL(url).search); 
        videoId = urlParams.get('v') || ''; 
      } else if (url.includes('youtube.com/embed/')) { 
        videoId = url.split('embed/')[1].split('?')[0]; 
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;
    } catch (e) { return null; }
  };

  const renderFormattedChangelog = (changelogText: string, currentVersion: string) => {
    if (!changelogText || !changelogText.trim()) {
      return (
        <div className="py-12 text-center text-xs text-slate-500 italic">
          Bản cập nhật hiện tại đang hoạt động ổn định và chưa có nhật ký mới.
        </div>
      );
    }

    const lines = changelogText.split('\n').map(l => l.trim()).filter(Boolean);
    const sections: { title: string; items: string[] }[] = [];
    let currentSection: { title: string; items: string[] } = { title: '', items: [] };

    lines.forEach((line) => {
      const isHeader = line.startsWith('[') && line.endsWith(']');
      if (isHeader) {
        if (currentSection.title || currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { title: line.replace(/^\[|\]$/g, '').trim(), items: [] };
      } else {
        currentSection.items.push(line.replace(/^-\s*/, ''));
      }
    });

    if (currentSection.title || currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    return (
      <div className="space-y-3.5">
        {sections.map((sec, idx) => {
          const isLatest = idx === 0;

          return (
            <div 
              key={idx} 
              className={`rounded-2xl p-3.5 space-y-2 transition-all ${
                isLatest 
                  ? 'bg-[#0D1525] border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-[#060910] border border-slate-800/80 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                    isLatest 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm' 
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}>
                    {sec.title || (isLatest ? (currentVersion || 'Bản mới nhất') : 'Bản cũ')}
                  </span>
                  
                  {isLatest && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Mới Nhất
                    </span>
                  )}
                </div>

                {!isLatest && (
                  <span className="text-[10px] text-slate-500 font-bold italic">
                    Phiên bản trước
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pl-1">
                {sec.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed font-sans">
                    <span className={`font-bold select-none ${isLatest ? 'text-cyan-400' : 'text-slate-500'}`}>•</span>
                    <span className={isLatest ? 'text-slate-200' : 'text-slate-400'}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="font-sans pb-24 min-h-screen bg-transparent text-slate-100 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-8">

        {/* 1. KHUNG THÔNG BÁO ADMIN */}
        {systemNotice?.active && systemNotice?.text && (
          <div className="bg-[#0B1019]/90 border border-amber-500/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-md backdrop-blur-md">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                THÔNG BÁO
              </span>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed truncate">
                {systemNotice.text}
              </p>
            </div>
          </div>
        )}

        {/* 2. HERO BANNER CỐ ĐỊNH 12 CỘT */}
        <div className="relative rounded-3xl bg-[#0B1019]/95 border-2 border-cyan-500/30 p-6 sm:p-8 overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.12)] backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Cột trái: Tự động hóa trải nghiệm game */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 bg-[#05080E] border border-cyan-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> HỆ THỐNG AUTOMATION FIVEM HÀNG ĐẦU
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                TỰ ĐỘNG HÓA <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  TRẢI NGHIỆM GAME
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed font-normal">
                Chuyên cung cấp các giải pháp Tool Auto Farm chuẩn xác, tích hợp bypass hiện đại cho mọi Server FiveM / GTA V Launcher. Kích hoạt tài khoản tự động 24/7 tức thì.
              </p>

              {/* 3 Thẻ Mini Highlights */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="bg-[#05080E]/90 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-2xl space-y-1 transition group">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Bypass An Toàn</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">100% không chứa virus</p>
                </div>

                <div className="bg-[#05080E]/90 border border-slate-800 hover:border-amber-500/40 p-3 rounded-2xl space-y-1 transition group">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>Tự Động 24/7</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Cấp quyền tức thì 0s</p>
                </div>

                <div className="bg-[#05080E]/90 border border-slate-800 hover:border-emerald-500/40 p-3 rounded-2xl space-y-1 transition group">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                    <span>Tối Ưu Phần Cứng</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Mượt mà, không giật lag</p>
                </div>
              </div>

              {/* Cụm nút bấm kép */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-200 hover:scale-[1.03]"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.5]" /> TRUY CẬP CỬA HÀNG TOOL
                </Link>

                <Link
                  href="/huong-dan-kich-hoat"
                  className="inline-flex items-center gap-2 bg-[#05080E] border border-slate-800 hover:border-cyan-400/60 text-slate-300 hover:text-white font-bold px-5 py-3.5 rounded-2xl text-xs transition"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> Hướng Dẫn Kích Hoạt
                </Link>
              </div>
            </div>

            {/* Cột phải: Tool nổi bật Top 1 */}
            <div className="lg:col-span-5 w-full">
              {featuredTool ? (
                <div 
                  onClick={() => handleOpenDetail(featuredTool)}
                  className="group bg-[#0D131F] border-2 border-amber-500/50 hover:border-amber-400 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl transition-all duration-300 cursor-pointer relative"
                >
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" /> TOOL NỔI BẬT TOP 1
                    </span>
                    
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md border text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                      {featuredTool.status ? featuredTool.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                    </span>
                  </div>

                  <div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-2xl overflow-hidden relative">
                    <img 
                      src={featuredTool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                      alt={featuredTool.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    
                    <div className="absolute top-2.5 left-2.5 bg-[#05080E]/90 border border-slate-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10px] text-slate-200 font-bold shadow-md">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> {featuredTool.views || 0} lượt xem
                    </div>
                  </div>

                  {/* Tên Tool & Bản cập nhật (Version) */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-sm sm:text-base group-hover:text-amber-400 transition truncate">
                      {featuredTool.name}
                    </h3>
                    {featuredTool.version && (
                      <span className="text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-md shadow-sm shrink-0">
                        {featuredTool.version}
                      </span>
                    )}
                  </div>

                  {/* Cụm 2 nút bấm ngang */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrialTool(featuredTool);
                        setTrialMsg(null);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 text-amber-300 border border-amber-500/50 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Trải nghiệm Tool</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBuyModal(featuredTool);
                      }}
                      className="w-full text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 flex items-center justify-center gap-1.5 transition py-2.5 rounded-xl shadow-md whitespace-nowrap cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span>Mua ngay</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0D131F]/70 border border-slate-800/80 rounded-3xl p-5 space-y-3.5 animate-pulse">
                  <div className="h-4 bg-slate-800/90 rounded-lg w-2/5"></div>
                  <div className="w-full aspect-square bg-slate-800/50 rounded-2xl"></div>
                  <div className="h-4 bg-slate-800/90 rounded-lg w-3/5"></div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-9 bg-slate-800/70 rounded-xl"></div>
                    <div className="h-9 bg-slate-800/70 rounded-xl"></div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 3. SECTION DANH SÁCH TOOL ĐANG HOẠT ĐỘNG */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
                <Wrench className="w-4 h-4 text-cyan-400" /> DANH SÁCH TOOL AUTO NỔI BẬT
              </h2>
              <p className="text-xs text-slate-400">Các bản tool đang hoạt động và cập nhật liên tục</p>
            </div>
            <Link href="/tools" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0D121D]/60 border border-slate-800/80 rounded-3xl p-4.5 space-y-3 animate-pulse">
                  <div className="w-full aspect-square bg-slate-800/50 rounded-2xl"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-2/3"></div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-8 bg-slate-800 rounded-xl"></div>
                    <div className="h-8 bg-slate-800 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTools.length === 0 ? (
            <div className="text-center py-8 bg-[#0D121D]/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Hiện tại chưa có tool nào ở trạng thái hoạt động.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTools.slice(0, 3).map((tool) => (
                <div 
                  key={tool.id} 
                  onClick={() => handleOpenDetail(tool)} 
                  className="bg-[#0D121D]/95 border-2 border-slate-700/80 hover:border-cyan-400 rounded-3xl p-4.5 flex flex-col justify-between space-y-3.5 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative"
                >
                  <div className="space-y-2.5">
                    <div className="w-full aspect-square bg-[#05080E] border border-slate-800/80 rounded-2xl overflow-hidden relative">
                      <img 
                        src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                        alt={tool.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      
                      <div className="absolute top-2.5 left-2.5 bg-[#05080E]/90 border border-slate-700/60 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] text-slate-200 font-bold">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> {tool.views || 0}
                      </div>

                      <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-md border bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                        {tool.status ? tool.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                      </span>
                    </div>

                    {/* Tên Tool & Bản cập nhật (Version) */}
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition truncate">
                        {tool.name}
                      </h3>
                      {tool.version && (
                        <span className="text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-md shadow-sm shrink-0">
                          {tool.version}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CỤM NÚT TRÊN 1 DÒNG DUY NHẤT */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrialTool(tool);
                        setTrialMsg(null);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 text-amber-300 border border-amber-500/50 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Trải nghiệm Tool</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBuyModal(tool);
                      }} 
                      className="w-full font-black py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-sm whitespace-nowrap"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      <span>Mua Ngay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. TẠI SAO NÊN CHỌN ZTOOL? */}
        <section className="space-y-3.5 pt-2">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">ƯU ĐIỂM VƯỢT TRỘI</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">TẠI SAO NÊN CHỌN ZTOOL.STORE?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#0B1019] border border-slate-800 hover:border-cyan-500/40 p-5 rounded-3xl space-y-2.5 transition group">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition">Tối Ưu Phần Cứng Nhẹ Nhàng</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Các bản Tool được tối ưu hóa tài nguyên CPU & RAM cực thấp, đảm bảo FPS mượt mà khi chơi game mà không bị giật lag.
              </p>
            </div>

            <div className="bg-[#0B1019] border border-slate-800 hover:border-emerald-500/40 p-5 rounded-3xl space-y-2.5 transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition">Hệ Thống Phân Quyền Độc Quyền</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quản lý tài khoản thông minh, bảo vệ bản quyền, thông tin và không lo bị lộ key.
              </p>
            </div>

            <div className="bg-[#0B1019] border border-slate-800 hover:border-amber-500/40 p-5 rounded-3xl space-y-2.5 transition group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition">Trải Nghiệm Miễn Phí 3 Ngày</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mỗi thành viên sau khi xác thực tài khoản đều có thể trải nghiệm toàn bộ tính năng của tool trong 3 ngày trước khi quyết định mua.
              </p>
            </div>
          </div>
        </section>

        {/* 5. DỰ ÁN NỔI BẬT */}
        {projects.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
                  <FolderKanban className="w-4 h-4 text-cyan-400" /> DỰ ÁN ĐANG PHÁT TRIỂN
                </h2>
                <p className="text-xs text-slate-400">Các dự án, tool được cộng đồng quan tâm</p>
              </div>
              <Link href="/projects" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
                Xem tất cả dự án <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id} className="bg-[#0D121D]/95 border-2 border-slate-700/80 hover:border-cyan-400 rounded-3xl p-4.5 space-y-2.5 shadow-md">
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

      </div>

      {/* ================= MODAL TRẢI NGHIỆM DÙNG THỬ 3 NGÀY ================= */}
      <AnimatePresence>
        {trialTool && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={() => setTrialTool(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1019] border-2 border-amber-500/60 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_50px_rgba(245,158,11,0.25)] cursor-default"
            >
              <button onClick={() => setTrialTool(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 transition hover:border-amber-400 z-10"><X className="w-5 h-5" /></button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Gift className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">CHƯƠNG TRÌNH DÙNG THỬ MIỄN PHÍ</span>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-black text-white">{trialTool.name}</h2>
                  {trialTool.version && (
                    <span className="text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-md">
                      {trialTool.version}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Trải nghiệm toàn bộ tính năng cao cấp hoàn toàn miễn phí trong vòng 3 ngày!</p>
              </div>

              <div className="bg-[#05080E] border border-slate-800 p-4 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Thời hạn dùng thử:</span>
                  <b className="text-amber-400 font-mono font-black">3 Ngày (72 Giờ)</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chi phí kích hoạt:</span>
                  <b className="text-emerald-400 font-mono font-black">0 VNĐ (Miễn Phí)</b>
                </div>
              </div>

              {trialMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex flex-col gap-2.5 ${trialMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                  <div className="flex items-start gap-2">
                    {trialMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{trialMsg.text}</span>
                  </div>
                  
                  {trialMsg.successAction === 'open_purchased' && (
                    <button
                      onClick={() => {
                        setTrialTool(null);
                        const currentUserStr = localStorage.getItem('ztool_current_user');
                        if (currentUserStr) {
                          const event = new CustomEvent('open-purchased-tools');
                          window.dispatchEvent(event);
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Kiểm tra tài khoản (Tool đã mua)
                    </button>
                  )}
                </div>
              )}

              {!trialMsg?.successAction && (
                <button
                  disabled={loadingTrial}
                  onClick={handleActivateTrial}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loadingTrial ? <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>ĐANG KÍCH HOẠT DÙNG THỬ...</span></> : <><Gift className="w-4 h-4" /> XÁC NHẬN NHẬN 3 NGÀY DÙNG THỬ</>}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL CHI TIẾT TOOL ================= */}
      <AnimatePresence>
        {selectedToolForDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSelectedToolForDetail(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D121D] border-2 border-cyan-500/40 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-5 relative shadow-[0_0_50px_rgba(6,182,212,0.25)] max-h-[90vh] overflow-y-auto cursor-default custom-scrollbar"
            >
              <button onClick={() => setSelectedToolForDetail(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#080B10] border border-slate-800 transition hover:border-cyan-400 z-10"><X className="w-5 h-5" /></button>
              
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0"><Info className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">THÔNG TIN CHI TIẾT SẢN PHẨM</span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white leading-tight">{selectedToolForDetail.name}</h2>
                    {selectedToolForDetail.version && (
                      <span className="text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                        {selectedToolForDetail.version}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 NÚT CHUYỂN ĐỔI TAB */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1.5 bg-[#05080E] p-1.5 rounded-2xl border border-slate-800 w-full max-w-lg mx-auto flex-nowrap">
                  {selectedToolForDetail.videoLink && getYouTubeEmbedUrl(selectedToolForDetail.videoLink) && (
                    <button
                      type="button"
                      onClick={() => setDetailMediaTab('video')}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                        detailMediaTab === 'video' 
                          ? 'bg-rose-500 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span>Video Demo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailMediaTab('image')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                      detailMediaTab === 'image' 
                        ? 'bg-cyan-500 text-slate-950 shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Ảnh Chi Tiết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailMediaTab('changelog')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                      detailMediaTab === 'changelog' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Bản Cập Nhật</span>
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#05080E] shadow-inner">
                  {detailMediaTab === 'video' && selectedToolForDetail.videoLink && getYouTubeEmbedUrl(selectedToolForDetail.videoLink) ? (
                    <div className="w-full aspect-video">
                      <iframe 
                        width="100%" height="100%" 
                        src={getYouTubeEmbedUrl(selectedToolForDetail.videoLink)!} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    </div>
                  ) : detailMediaTab === 'changelog' ? (
                    <div className="w-full aspect-video max-h-[340px] p-4 sm:p-5 flex flex-col justify-start overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#090E1A] to-[#05080E]">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                            <History className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            LỊCH SỬ THAY ĐỔI THEO PHIÊN BẢN
                          </h4>
                        </div>
                        {selectedToolForDetail.version && (
                          <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                            Hiện tại: {selectedToolForDetail.version}
                          </span>
                        )}
                      </div>

                      {renderFormattedChangelog(selectedToolForDetail.changelog, selectedToolForDetail.version)}
                    </div>
                  ) : (
                    <div 
                      onClick={() => setZoomImage(selectedToolForDetail.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg')}
                      className="w-full aspect-video max-h-[340px] relative group cursor-zoom-in overflow-hidden flex items-center justify-center bg-[#05080E]"
                      title="Bấm để xem ảnh phóng to đầy đủ"
                    >
                      <img src={selectedToolForDetail.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={selectedToolForDetail.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300 backdrop-blur-[2px]">
                        <span className="bg-cyan-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg"><ZoomIn className="w-4 h-4" /> BẤM PHÓNG TO ẢNH</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mô tả tính năng đầy đủ:</h4>
                <p className="text-xs text-slate-300 bg-[#05080E] border border-slate-800/90 p-4 rounded-2xl leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto custom-scrollbar font-medium">
                  {selectedToolForDetail.description || 'Chưa có nội dung mô tả chi tiết cho sản phẩm này.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#05080E] border border-slate-800 p-2.5 rounded-2xl text-center"><span className="text-[10px] text-slate-500 block font-bold">Ngày</span><b className="text-xs text-emerald-400 font-mono">{formatPrice(selectedToolForDetail.priceDay)}đ</b></div>
                <div className="bg-[#05080E] border border-slate-800 p-2.5 rounded-2xl text-center"><span className="text-[10px] text-slate-500 block font-bold">Tuần</span><b className="text-xs text-emerald-400 font-mono">{formatPrice(selectedToolForDetail.priceWeek)}đ</b></div>
                <div className="bg-[#05080E] border border-slate-800 p-2.5 rounded-2xl text-center"><span className="text-[10px] text-slate-500 block font-bold">Tháng</span><b className="text-xs text-emerald-400 font-mono">{formatPrice(selectedToolForDetail.priceMonth)}đ</b></div>
                <div className="bg-[#05080E] border border-cyan-500/40 p-2.5 rounded-2xl text-center"><span className="text-[10px] text-cyan-400 block font-bold">Vĩnh Viễn</span><b className="text-xs text-cyan-300 font-mono font-black">{formatPrice(selectedToolForDetail.priceLifetime)}đ</b></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    const tool = selectedToolForDetail;
                    setSelectedToolForDetail(null);
                    setTrialTool(tool);
                    setTrialMsg(null);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 border border-amber-500/60 text-amber-300 font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md whitespace-nowrap"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Trải nghiệm Tool</span>
                </button>

                <button
                  disabled={selectedToolForDetail.status === 'Tạm ngưng'}
                  onClick={() => { const tool = selectedToolForDetail; setSelectedToolForDetail(null); handleOpenBuyModal(tool); }}
                  className={`w-full font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-lg whitespace-nowrap ${selectedToolForDetail.status === 'Tạm ngưng' ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.35)]'}`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span>Mua Ngay</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL MUA SẢN PHẨM ================= */}
      <AnimatePresence>
        {selectedToolForBuy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSelectedToolForBuy(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl max-h-[92vh] overflow-y-auto cursor-default custom-scrollbar"
            >
              <button onClick={() => setSelectedToolForBuy(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer transition hover:border-cyan-400 z-10"><X className="w-5 h-5" /></button>
              
              <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">XÁC NHẬN MUA BẢN QUYỀN</span>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-wide">{selectedToolForBuy.name}</h2>
                  {selectedToolForBuy.version && (
                    <span className="text-[11px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                      {selectedToolForBuy.version}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* CỘT TRÁI: TAB MEDIA */}
                <div className="md:col-span-6 space-y-3">
                  {selectedToolForBuy.videoLink && getYouTubeEmbedUrl(selectedToolForBuy.videoLink) && (
                    <div className="flex items-center justify-center gap-2 bg-[#05080E] p-1 rounded-2xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setBuyMediaTab('image')}
                        className={`flex-1 py-1 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          buyMediaTab === 'image' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Hình Ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuyMediaTab('video')}
                        className={`flex-1 py-1 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          buyMediaTab === 'video' ? 'bg-rose-500 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" /> Video Demo
                      </button>
                    </div>
                  )}

                  <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-[#05080E] relative shadow-md">
                    {buyMediaTab === 'video' && selectedToolForBuy.videoLink && getYouTubeEmbedUrl(selectedToolForBuy.videoLink) ? (
                      <div className="w-full h-full">
                        <iframe 
                          width="100%" height="100%" 
                          src={getYouTubeEmbedUrl(selectedToolForBuy.videoLink)!} 
                          title="YouTube video player" frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
                        </iframe>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setZoomImage(selectedToolForBuy.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg')}
                        className="w-full h-full relative group cursor-zoom-in"
                        title="Bấm để xem ảnh phóng to đầy đủ"
                      >
                        <img src={selectedToolForBuy.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={selectedToolForBuy.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300 backdrop-blur-[2px]">
                          <span className="bg-cyan-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xl"><ZoomIn className="w-4 h-4" /> PHÓNG TO ẢNH</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CỘT PHẢI: CHỌN GÓI & ÁP MÃ */}
                <div className="md:col-span-6 space-y-4 text-left">
                  <div className="bg-[#05080E] border border-slate-800/90 p-4 rounded-2xl space-y-1 shadow-inner">
                    <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">Mô tả tóm tắt:</span>
                    <p className="text-xs text-slate-200 leading-relaxed max-h-24 overflow-y-auto pr-1 whitespace-pre-line font-medium custom-scrollbar">
                      {selectedToolForBuy.description || 'Chưa có nội dung mô tả cho sản phẩm này.'}
                    </p>
                  </div>

                  {/* Mã giảm giá */}
                  <div className="space-y-1.5 bg-[#05080E] border border-slate-800/90 p-3.5 rounded-2xl">
                    <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-cyan-400" /> Mã giảm giá (nếu có):</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Nhập mã..." value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="flex-1 bg-[#0B1019] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 uppercase font-mono transition" />
                      <button onClick={handleApplyCoupon} className="bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 font-black px-3.5 py-2 rounded-xl text-xs transition cursor-pointer">Áp dụng</button>
                    </div>
                    {couponMsg && <p className={`text-[10px] font-bold ${couponMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{couponMsg.text}</p>}
                  </div>

                  {/* Gói thời hạn */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">Chọn gói thời hạn:</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[ { key: 'day', name: 'Gói 1 Ngày', price: selectedToolForBuy.priceDay }, { key: 'week', name: 'Gói 7 Ngày', price: selectedToolForBuy.priceWeek }, { key: 'month', name: 'Gói 30 Ngày', price: selectedToolForBuy.priceMonth }, { key: 'lifetime', name: 'Gói Vĩnh Viễn', price: selectedToolForBuy.priceLifetime }, ].map((pkg) => {
                        const originalPrice = Number(String(pkg.price || '0').replace(/[^0-9]/g, '')) || 0;
                        const discountAmt = calculateDiscount(originalPrice, appliedCoupon);
                        const finalPkgPrice = Math.max(0, originalPrice - discountAmt);
                        const isSelected = selectedDuration === pkg.key;

                        return (
                          <button 
                            key={pkg.key} 
                            onClick={() => setSelectedDuration(pkg.key as any)} 
                            className={`p-3 rounded-2xl border text-left text-xs space-y-0.5 relative transition cursor-pointer ${isSelected ? 'bg-[#121E2E] border-cyan-400 text-cyan-300 font-black shadow-md' : 'bg-[#05080E] border-slate-800 text-slate-400 hover:border-slate-700'}`}
                          >
                            {isSelected && <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950"><Check className="w-2.5 h-2.5 stroke-[3]" /></div>}
                            <div className="font-extrabold text-slate-200 text-[11px]">{pkg.name}</div>
                            <div>
                              {appliedCoupon && discountAmt > 0 && originalPrice > 0 ? (
                                <div className="flex items-center gap-1.5 flex-wrap"><span className="line-through text-slate-500 text-[9px]">{formatPrice(originalPrice)}đ</span><span className="text-emerald-400 font-extrabold font-mono text-xs">{finalPkgPrice === 0 ? '0 VNĐ' : `${formatPrice(finalPkgPrice)} VNĐ`}</span></div>
                              ) : (
                                <span className="text-emerald-400 font-extrabold font-mono text-xs">{originalPrice === 0 ? '0 VNĐ' : `${formatPrice(originalPrice)} VNĐ`}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {purchaseMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex flex-col gap-2.5 ${purchaseMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                  <div className="flex items-start gap-2">
                    {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{purchaseMsg.text}</span>
                  </div>

                  {purchaseMsg.successAction === 'open_purchased' && (
                    <button
                      onClick={() => {
                        setSelectedToolForBuy(null);
                        const currentUserStr = localStorage.getItem('ztool_current_user');
                        if (currentUserStr) {
                          const event = new CustomEvent('open-purchased-tools');
                          window.dispatchEvent(event);
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Kiểm tra tài khoản (Tool đã mua)
                    </button>
                  )}
                </div>
              )}

              {!purchaseMsg?.successAction && (
                <button disabled={loadingBuy} onClick={handleBuyTool} className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2">
                  {loadingBuy ? <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>ĐANG KHỞI TẠO TÀI KHOẢN...</span></> : <><Shield className="w-4 h-4" /> XÁC THỰC THANH TOÁN TỪ VÍ</>}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PHÓNG TO ẢNH FULLSCREEN */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => setZoomImage(null)} className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 sm:p-8 cursor-zoom-out">
            <button onClick={() => setZoomImage(null)} className="absolute top-6 right-6 text-slate-300 hover:text-white p-3 rounded-2xl bg-[#080B10]/80 border border-slate-700 hover:border-cyan-400 transition shadow-2xl z-50 cursor-pointer"><X className="w-6 h-6" /></button>
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ type: "spring", duration: 0.25, bounce: 0.1 }} onClick={(e) => e.stopPropagation()} className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] bg-[#05080E] cursor-default">
              <img src={zoomImage} alt="Phóng to" className="max-w-full max-h-[85vh] object-contain rounded-2xl select-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}