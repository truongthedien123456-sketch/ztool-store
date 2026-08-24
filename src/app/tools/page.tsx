'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, X, Sparkles, Info, Loader2, Tag, Eye, Shield, Check, ZoomIn, Layers, Activity, AlertTriangle, Clock, Percent, Video, Image as ImageIcon, Gift
} from 'lucide-react';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [selectedToolForBuy, setSelectedToolForBuy] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'day' | 'week' | 'month' | 'lifetime'>('day');
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingBuy, setLoadingBuy] = useState(false);

  // State Trải Nghiệm Dùng Thử 3 Ngày
  const [trialTool, setTrialTool] = useState<any | null>(null);
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [trialMsg, setTrialMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [selectedToolForDetail, setSelectedToolForDetail] = useState<any | null>(null);
  const [detailMediaTab, setDetailMediaTab] = useState<'image' | 'video'>('video');
  const [buyMediaTab, setBuyMediaTab] = useState<'image' | 'video'>('image');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    loadToolsData();

    const handleOpenBuyModal = (e: any) => {
      const toolCodeToBuy = e.detail?.toolCode;
      if (toolCodeToBuy && tools.length > 0) {
        const found = tools.find(t => (t.toolCode || t.tool_code || '').trim().toLowerCase() === toolCodeToBuy.trim().toLowerCase());
        if (found) {
          setSelectedToolForBuy(found);
          setBuyMediaTab(found.videoLink ? 'video' : 'image');
          setPurchaseMsg(null);
          setCouponInput('');
          setAppliedCoupon(null);
          setCouponMsg(null);
        }
      }
    };

    window.addEventListener('open-buy-tool-modal', handleOpenBuyModal);
    return () => window.removeEventListener('open-buy-tool-modal', handleOpenBuyModal);
  }, [tools]);

  const loadToolsData = async () => {
    try {
      const { data } = await supabase.from('tools').select('*').order('views', { ascending: false });
      
      if (data && data.length > 0) {
        const mappedTools = data.map((t: any) => ({
          id: t.id, name: t.name, toolCode: t.toolCode || t.tool_code || '', image: t.image, status: t.status || 'Đang hoạt động',
          priceDay: t.priceDay || t.price_day || '', priceWeek: t.priceWeek || t.price_week || '', priceMonth: t.priceMonth || t.price_month || '',
          priceLifetime: t.priceLifetime || t.price_lifetime || '', description: t.description, downloadLink: t.downloadLink || t.download_link || '',
          videoLink: t.videoLink || t.video_link || '',
          views: t.views || 0, sales: t.sales || 0
        }));
        setTools(mappedTools);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoadingData(false); }
  };

  const formatPrice = (price: string | number) => {
    if (!price) return '---';
    const num = Number(String(price).replace(/[^0-9]/g, ''));
    if (isNaN(num) || num === 0) return '---';
    return num.toLocaleString('en-US');
  };

  const activeTools = tools.filter(t => t.status !== 'Tạm ngưng');
  const inactiveTools = tools.filter(t => t.status === 'Tạm ngưng');

  const handleOpenDetail = async (tool: any) => {
    setSelectedToolForDetail(tool);
    setDetailMediaTab(tool.videoLink ? 'video' : 'image');
    try {
      const newViews = (tool.views || 0) + 1;
      await supabase.from('tools').update({ views: newViews }).eq('id', tool.id);
      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, views: newViews } : t));
    } catch (e) { console.error('Lỗi cộng lượt xem:', e); }
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
    if (!couponInput.trim()) { setCouponMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá!' }); return; }

    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) { setCouponMsg({ type: 'error', text: 'Vui lòng đăng nhập để áp dụng mã!' }); return; }

    const { data: couponData, error } = await supabase.from('coupons').select('*').eq('code', couponInput.trim().toUpperCase()).single();
    if (error || !couponData) { setCouponMsg({ type: 'error', text: 'Mã giảm giá không tồn tại hoặc đã hết hạn!' }); return; }
    if (couponData.quantity <= 0) { setCouponMsg({ type: 'error', text: 'Mã này đã được sử dụng hết số lượng!' }); return; }

    const currentToolCode = (selectedToolForBuy?.toolCode || selectedToolForBuy?.tool_code || '').trim().toLowerCase();
    const couponToolCode = (couponData.tool_code || '').trim().toLowerCase();

    if (couponToolCode !== 'all' && couponToolCode !== currentToolCode) { setCouponMsg({ type: 'error', text: 'Mã giảm giá này không áp dụng cho sản phẩm này!' }); return; }

    const maxUsesPerUser = couponData.max_uses_per_user || 1;
    const { data: userUsedLogs } = await supabase.from('transactions').select('id').eq('username', currentUsername).ilike('title', `%${couponData.code}%`);
    const timesUsed = userUsedLogs ? userUsedLogs.length : 0;
    
    if (timesUsed >= maxUsesPerUser) { setCouponMsg({ type: 'error', text: `Tài khoản đã đạt giới hạn dùng mã này (${maxUsesPerUser} lần)!` }); return; }

    setAppliedCoupon(couponData);
    const isPercent = couponData.discount_type === 'PERCENT' || (couponData.discount_percent && Number(couponData.discount_percent) > 0);
    const successText = isPercent ? `Áp dụng mã thành công! Giảm ${couponData.discount_percent}%.` : `Áp dụng thành công! Giảm trực tiếp ${Number(couponData.discount_amount).toLocaleString('en-US')}đ.`;
    setCouponMsg({ type: 'success', text: successText });
  };

  // Kích hoạt dùng thử 3 ngày miễn phí (Có kiểm tra bắt buộc xác thực)
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

    // BẮT BUỘC TÀI KHOẢN ĐÃ XÁC THỰC HOẶC MIỄN XÁC THỰC
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

    // Kiểm tra xem đã từng nhận dùng thử tool này chưa
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

      // Ghi log giao dịch TRIAL miễn phí 0đ
      await supabase.from('transactions').insert([{
        username: userData.username,
        type: 'TRIAL',
        title: `Kích hoạt trải nghiệm 3 ngày miễn phí - Tool: ${trialTool.name} (${tCode})`,
        amount: 0,
        status: 'Thành công'
      }]);

      setLoadingTrial(false);
      setTrialMsg({ type: 'success', text: `Kích hoạt trải nghiệm 3 ngày thành công! Bạn có thể tải tool và đăng nhập tài khoản "${userData.username}" để sử dụng ngay.` });
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (err: any) {
      setLoadingTrial(false);
      setTrialMsg({ type: 'error', text: `Lỗi kết nối máy chủ: ${err.message}` });
    }
  };

  // Mua bản quyền Tool (Có kiểm tra bắt buộc xác thực)
  const handleBuyTool = async () => {
    setPurchaseMsg(null);
    if (!selectedToolForBuy) return;

    if (selectedToolForBuy.status === 'Tạm ngưng') { setPurchaseMsg({ type: 'error', text: 'Sản phẩm Tool này hiện đang TẠM NGƯNG!' }); return; }

    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) { setPurchaseMsg({ type: 'error', text: 'Vui lòng đăng nhập tài khoản để giao dịch!' }); return; }

    setLoadingBuy(true);
    const { data: userData } = await supabase.from('users').select('*').eq('username', currentUsername).single();

    if (!userData) { setLoadingBuy(false); setPurchaseMsg({ type: 'error', text: 'Không tìm thấy thông tin tài khoản!' }); return; }

    // BẮT BUỘC TÀI KHOẢN ĐÃ XÁC THỰC HOẶC MIỄN XÁC THỰC
    const isExempt = userData.is_exempt === true;
    const isVerified = userData.is_verified === true || isExempt;

    if (!isVerified) { 
      setLoadingBuy(false); 
      setPurchaseMsg({ 
        type: 'error', 
        text: 'Tài khoản chưa xác thực Gmail! Vui lòng vào trang cá nhân để xác thực OTP trước khi mua tool.' 
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
          setLoadingBuy(false); setPurchaseMsg({ type: 'error', text: 'Bạn đã sở hữu gói Vĩnh Viễn cho tool này rồi!' }); return;
        }
      }
    } catch (e) { console.error('Lỗi kiểm tra vĩnh viễn trên Gist:', e); }

    let priceStr = '0'; let durationText = '1 Ngày'; let durationDays = 1;
    if (selectedDuration === 'day') { priceStr = selectedToolForBuy.priceDay || '0'; durationText = '1 Ngày'; durationDays = 1; }
    if (selectedDuration === 'week') { priceStr = selectedToolForBuy.priceWeek || '0'; durationText = '7 Ngày'; durationDays = 7; }
    if (selectedDuration === 'month') { priceStr = selectedToolForBuy.priceMonth || '0'; durationText = '30 Ngày'; durationDays = 30; }
    if (selectedDuration === 'lifetime') { priceStr = selectedToolForBuy.priceLifetime || '0'; durationText = 'Vĩnh Viễn'; durationDays = 0; }

    const basePriceNum = Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;
    const discountNum = calculateDiscount(basePriceNum, appliedCoupon);
    const priceNum = Math.max(0, basePriceNum - discountNum);

    if ((userData.balance || 0) < priceNum) {
      setLoadingBuy(false); setPurchaseMsg({ type: 'error', text: `Số dư ví không đủ! Cần ${priceNum.toLocaleString('en-US')}đ nhưng bạn chỉ có ${(userData.balance || 0).toLocaleString('en-US')}đ.` }); return;
    }

    try {
      const gistRes = await fetch('/api/gist-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userData.username, password: userData.password, durationDays: durationDays, tool_code: selectedToolForBuy.toolCode || selectedToolForBuy.tool_code || '' })
      });
      const gistData = await gistRes.json();

      if (!gistData.success) { setLoadingBuy(false); setPurchaseMsg({ type: 'error', text: `Lỗi kích hoạt Gist: ${gistData.error || gistData.message}` }); return; }

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
      setPurchaseMsg({ type: 'success', text: `Kích hoạt thành công! Quyền sử dụng Tool đã được cấp cho tài khoản "${userData.username}".` });
      setTimeout(() => { window.location.reload(); }, 2500);
    } catch (err: any) { setLoadingBuy(false); setPurchaseMsg({ type: 'error', text: `Lỗi kết nối: ${err.message}` }); }
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

  return (
    <main className="font-sans pb-24 min-h-screen bg-transparent text-slate-100 selection:bg-cyan-500 selection:text-black">
      {isLoadingData ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
          
          {/* HEADER TRANG */}
          <div className="text-center space-y-4 border-b border-slate-800/80 pb-8 bg-[#0B1019]/95 p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="inline-flex items-center gap-2 bg-[#05080E] border border-cyan-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" /> BẢNG HÃNG TOOL AUTO HIGH-QUALITY
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
              DANH SÁCH SẢN PHẨM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">TOOL AUTO</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
              Cập nhật liên tục các bản tool tự động mới nhất. Đảm bảo an toàn tuyệt đối, tối ưu hiệu năng và kích hoạt tự động 24/7.
            </p>

            <div className="pt-3 flex items-center justify-center gap-2.5 flex-wrap">
              <button onClick={() => setActiveTab('all')} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === 'all' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105' : 'bg-[#05080E] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'}`}><Layers className="w-4 h-4" /> Tất Cả ({tools.length})</button>
              <button onClick={() => setActiveTab('active')} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === 'active' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'bg-[#05080E] text-slate-400 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300'}`}><Activity className="w-4 h-4" /> Đang Hoạt Động ({activeTools.length})</button>
              <button onClick={() => setActiveTab('inactive')} className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === 'inactive' ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105' : 'bg-[#05080E] text-slate-400 border border-slate-800 hover:border-rose-500/40 hover:text-rose-300'}`}><AlertTriangle className="w-4 h-4" /> Tạm Ngưng / Bảo Trì ({inactiveTools.length})</button>
            </div>
          </div>

          {/* DANH SÁCH TOOL ĐANG HOẠT ĐỘNG */}
          {(activeTab === 'all' || activeTab === 'active') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]"></span>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">SẢN PHẨM KHẢ DỤNG <span className="text-emerald-400 text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 font-bold">MUA & DÙNG NGAY</span></h2>
                </div>
                <span className="text-xs text-slate-400 font-bold">{activeTools.length} Tool sẵn sàng</span>
              </div>

              {activeTools.length === 0 ? (
                <div className="p-8 text-center bg-[#0B1019]/60 border border-slate-800 rounded-3xl text-slate-400 text-xs">Hiện chưa có sản phẩm nào ở trạng thái hoạt động.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTools.map((tool) => (
                    <div key={tool.id} onClick={() => handleOpenDetail(tool)} className="group bg-[#0D121D]/95 border-2 border-slate-700/80 hover:border-cyan-400 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-200 cursor-pointer relative">
                      <div className="space-y-3.5">
                        <div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-2xl overflow-hidden relative">
                          <img src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-out" />
                          <div className="absolute top-3 left-3 bg-[#05080E]/90 border border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-200 font-extrabold shadow-md"><Eye className="w-3.5 h-3.5 text-cyan-400" /> {tool.views || 0}</div>
                          <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-xl border shadow-md bg-emerald-500/20 border-emerald-500/40 text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ĐANG HOẠT ĐỘNG</span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition duration-200">{tool.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1 truncate" title={tool.description}>{tool.description || 'Chưa có mô tả sản phẩm.'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-[#05080E] border border-slate-800/90 p-3 rounded-2xl text-xs">
                          <div className="bg-[#0B1019] border border-slate-800/80 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Theo Ngày</span><b className="text-xs text-emerald-400 font-mono font-black">{tool.priceDay ? `${formatPrice(tool.priceDay)}đ` : '---'}</b></div>
                          <div className="bg-[#0B1019] border border-slate-800/80 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Theo Tuần</span><b className="text-xs text-emerald-400 font-mono font-black">{tool.priceWeek ? `${formatPrice(tool.priceWeek)}đ` : '---'}</b></div>
                          <div className="bg-[#0B1019] border border-slate-800/80 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Theo Tháng</span><b className="text-xs text-emerald-400 font-mono font-black">{tool.priceMonth ? `${formatPrice(tool.priceMonth)}đ` : '---'}</b></div>
                          <div className="bg-[#0B1019] border border-cyan-500/40 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Vĩnh Viễn</span><b className="text-xs text-cyan-300 font-mono font-black">{tool.priceLifetime ? `${formatPrice(tool.priceLifetime)}đ` : '---'}</b></div>
                        </div>
                      </div>

                      {/* CỤM NÚT THAO TÁC */}
                      <div className="space-y-2 pt-1">
                        {/* NÚT TRẢI NGHIỆM 3 NGÀY */}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setTrialTool(tool);
                            setTrialMsg(null);
                          }} 
                          className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/60 hover:border-amber-400 text-amber-300 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                          <Gift className="w-4 h-4 text-amber-400" /> Trải Nghiệm 3 Ngày (Miễn Phí)
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedToolForBuy(tool); setPurchaseMsg(null); setCouponInput(''); setAppliedCoupon(null); setCouponMsg(null); }} className="bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110"><ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" /> Mua Ngay</button>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(tool); }} className="bg-[#05080E] border border-slate-800 hover:border-cyan-400/60 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center transition-all duration-200 cursor-pointer hover:bg-slate-800/80"><Info className="w-3.5 h-3.5 text-cyan-400" /> Chi tiết</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DANH SÁCH TOOL TẠM NGƯNG */}
          {(activeTab === 'all' || activeTab === 'inactive') && inactiveTools.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e]"></span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-300 tracking-wide uppercase flex items-center gap-2">SẢN PHẨM ĐANG BẢO TRÌ & NÂNG CẤP <span className="text-rose-400 text-xs px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 font-bold">TẠM NGƯNG BÁN</span></h2>
                </div>
                <span className="text-xs text-slate-500 font-bold">{inactiveTools.length} Tool đang update</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveTools.map((tool) => (
                  <div key={tool.id} onClick={() => handleOpenDetail(tool)} className="group bg-[#0A0E17]/85 border-2 border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-md relative transition-all duration-200 cursor-pointer opacity-90 hover:opacity-100">
                    <div className="space-y-4">
                      <div className="w-full aspect-square bg-[#05080E] border border-slate-800/90 rounded-2xl overflow-hidden relative">
                        <img src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={tool.name} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition duration-300 ease-out" />
                        <div className="absolute top-3 left-3 bg-[#05080E]/90 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-400 font-bold shadow-md"><Eye className="w-3.5 h-3.5 text-slate-500" /> {tool.views || 0}</div>
                        <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-xl border shadow-md bg-rose-500/20 border-rose-500/40 text-rose-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> TẠM NGƯNG</span>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3.5 text-center"><p className="text-[11px] font-black text-rose-300 flex items-center justify-center gap-1.5 tracking-wide"><Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" /> Đang tối ưu thuật toán</p></div>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-300 group-hover:text-white transition duration-200">{tool.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 truncate" title={tool.description}>{tool.description || 'Chưa có mô tả sản phẩm.'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#05080E] border border-slate-800/60 p-3 rounded-2xl text-xs opacity-60">
                        <div className="bg-[#0B1019] border border-slate-800/60 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Theo Ngày</span><b className="text-xs text-slate-400 font-mono">{tool.priceDay ? `${formatPrice(tool.priceDay)}đ` : '---'}</b></div>
                        <div className="bg-[#0B1019] border border-slate-800/60 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Theo Tuần</span><b className="text-xs text-slate-400 font-mono">{tool.priceWeek ? `${formatPrice(tool.priceWeek)}đ` : '---'}</b></div>
                        <div className="bg-[#0B1019] border border-slate-800/60 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Theo Tháng</span><b className="text-xs text-slate-400 font-mono">{tool.priceMonth ? `${formatPrice(tool.priceMonth)}đ` : '---'}</b></div>
                        <div className="bg-[#0B1019] border border-slate-800/60 p-2 rounded-xl flex flex-col justify-center space-y-0.5"><span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Vĩnh Viễn</span><b className="text-xs text-slate-400 font-mono">{tool.priceLifetime ? `${formatPrice(tool.priceLifetime)}đ` : '---'}</b></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button disabled={true} className="bg-slate-800/80 text-slate-500 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-not-allowed"><AlertTriangle className="w-3.5 h-3.5" /> Tạm Ngưng</button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(tool); }} className="bg-[#05080E] border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center transition cursor-pointer hover:bg-slate-800/60"><Info className="w-4 h-4 text-slate-400" /> Chi tiết</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= MODAL TRẢI NGHIỆM DÙNG THỬ 3 NGÀY (ĐÃ ẨN MÃ GIST & BỎ HIỆU ỨNG NẨY) ================= */}
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
                    <h2 className="text-xl font-black text-white">{trialTool.name}</h2>
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
                    <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${trialMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                      {trialMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{trialMsg.text}</span>
                    </div>
                  )}

                  <button
                    disabled={loadingTrial}
                    onClick={handleActivateTrial}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loadingTrial ? <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>ĐANG KÍCH HOẠT DÙNG THỬ...</span></> : <><Gift className="w-4 h-4" /> XÁC NHẬN NHẬN 3 NGÀY DÙNG THỬ</>}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= MODAL CHI TIẾT SẢN PHẨM ================= */}
          <AnimatePresence>
            {selectedToolForDetail && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                onClick={() => setSelectedToolForDetail(null)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 cursor-pointer"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0D121D] border-2 border-cyan-500/40 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_50px_rgba(6,182,212,0.25)] max-h-[90vh] overflow-y-auto cursor-default custom-scrollbar"
                >
                  <button onClick={() => setSelectedToolForDetail(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#080B10] border border-slate-800 transition hover:border-cyan-400 z-10"><X className="w-5 h-5" /></button>
                  
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0"><Info className="w-5 h-5" /></div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">THÔNG TIN CHI TIẾT SẢN PHẨM</span>
                      <h2 className="text-xl font-black text-white leading-tight">{selectedToolForDetail.name}</h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedToolForDetail.videoLink && getYouTubeEmbedUrl(selectedToolForDetail.videoLink) && (
                      <div className="flex items-center justify-center gap-2 bg-[#05080E] p-1 rounded-2xl border border-slate-800 max-w-xs mx-auto">
                        <button
                          type="button"
                          onClick={() => setDetailMediaTab('video')}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            detailMediaTab === 'video' 
                              ? 'bg-rose-500 text-white shadow-md' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" /> Video Demo
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailMediaTab('image')}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            detailMediaTab === 'image' 
                              ? 'bg-cyan-500 text-slate-950 shadow-md' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Ảnh Chi Tiết
                        </button>
                      </div>
                    )}

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
                  
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        const tool = selectedToolForDetail;
                        setSelectedToolForDetail(null);
                        setTrialTool(tool);
                        setTrialMsg(null);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/60 text-amber-300 font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
                    >
                      <Gift className="w-4 h-4 text-amber-400" /> TRẢI NGHIỆM DÙNG THỬ 3 NGÀY MIỄN PHÍ
                    </button>

                    <button
                      disabled={selectedToolForDetail.status === 'Tạm ngưng'}
                      onClick={() => { const tool = selectedToolForDetail; setSelectedToolForDetail(null); setSelectedToolForBuy(tool); }}
                      className={`w-full font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg ${selectedToolForDetail.status === 'Tạm ngưng' ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.35)]'}`}
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" /> {selectedToolForDetail.status === 'Tạm ngưng' ? 'SẢN PHẨM ĐANG BẢO TRÌ' : 'MUA SẢN PHẨM NÀY NGAY'}
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
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                onClick={() => setSelectedToolForBuy(null)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 cursor-pointer"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl max-h-[92vh] overflow-y-auto cursor-default custom-scrollbar"
                >
                  <button onClick={() => setSelectedToolForBuy(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer transition hover:border-cyan-400 z-10"><X className="w-5 h-5" /></button>
                  
                  <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">XÁC NHẬN MUA BẢN QUYỀN</span>
                    <h2 className="text-2xl font-black text-white tracking-wide">{selectedToolForBuy.name}</h2>
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
                    <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${purchaseMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                      {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{purchaseMsg.text}</span>
                    </div>
                  )}

                  <button disabled={loadingBuy} onClick={handleBuyTool} className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2">
                    {loadingBuy ? <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>ĐANG KHỞI TẠO TÀI KHOẢN...</span></> : <><Shield className="w-4 h-4" /> XÁC THỰC THANH TOÁN TỪ VÍ</>}
                  </button>
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

        </div>
      )}
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 8px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.4); border-radius: 8px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.8); }`}</style>
    </main>
  );
}