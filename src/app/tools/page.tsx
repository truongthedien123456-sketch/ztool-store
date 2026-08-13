'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, X, Sparkles, Info, Loader2, Tag, Eye, Shield, Check, Crown
} from 'lucide-react';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Modal Mua Tool
  const [selectedToolForBuy, setSelectedToolForBuy] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'day' | 'week' | 'month' | 'lifetime'>('day');
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingBuy, setLoadingBuy] = useState(false);

  // States Mã giảm giá
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Xem Chi Tiết Tool
  const [selectedToolForDetail, setSelectedToolForDetail] = useState<any | null>(null);

  useEffect(() => {
    loadToolsData();

    const handleOpenBuyModal = (e: any) => {
      const toolCodeToBuy = e.detail?.toolCode;
      if (toolCodeToBuy && tools.length > 0) {
        const found = tools.find(t => (t.toolCode || t.tool_code || '').trim().toLowerCase() === toolCodeToBuy.trim().toLowerCase());
        if (found) {
          setSelectedToolForBuy(found);
          setPurchaseMsg(null);
          setCouponInput('');
          setAppliedCoupon(null);
          setCouponMsg(null);
        }
      }
    };

    window.addEventListener('open-buy-tool-modal', handleOpenBuyModal);
    return () => {
      window.removeEventListener('open-buy-tool-modal', handleOpenBuyModal);
    };
  }, [tools]);

  const formatPrice = (price: string | number) => {
    if (!price) return '---';
    const num = Number(String(price).replace(/[^0-9]/g, ''));
    if (isNaN(num) || num === 0) return '---';
    return num.toLocaleString('en-US');
  };

  const loadToolsData = async () => {
    try {
      const { data } = await supabase.from('tools').select('*').order('views', { ascending: false });
      
      if (data && data.length > 0) {
        const mappedTools = data.map((t: any) => ({
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
          views: t.views || 0,
          sales: t.sales || 0
        }));
        setTools(mappedTools);
      } else {
        setTools([{
          id: 1, name: 'AUTO FARM CÔNG TRƯỜNG F17', toolCode: 'congtruongf17', image: 'https://i.ibb.co/8L2gsmQ0/logo.jpg', status: 'Đang hoạt động',
          priceDay: '5000', priceWeek: '20000', priceMonth: '50000', priceLifetime: '100000', description: 'Tự động chạy nhanh, bấm E nghề công trường F17 City.', downloadLink: '', views: 0, sales: 0
        }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOpenDetail = async (tool: any) => {
    setSelectedToolForDetail(tool);
    try {
      const newViews = (tool.views || 0) + 1;
      await supabase.from('tools').update({ views: newViews }).eq('id', tool.id);
      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, views: newViews } : t));
    } catch (e) {
      console.error('Lỗi cộng lượt xem:', e);
    }
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
    <main className="font-sans pb-20 min-h-screen bg-transparent text-slate-100 selection:bg-cyan-500 selection:text-black">
      {isLoadingData ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 py-8 space-y-8"
        >
          {/* HEADER TRANG KÍNH MỜ GLASSMORPHISM */}
          <div className="text-center space-y-3 border-b border-slate-800/80 pb-8 bg-[#0B1019]/40 backdrop-blur-md p-6 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="inline-flex items-center gap-2 bg-[#05080E]/80 border border-cyan-400/50 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> BẢNG HÃNG TOOL AUTO HIGH-QUALITY
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
              DANH SÁCH SẢN PHẨM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">TOOL AUTO</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
              Cập nhật liên tục các bản tool tự động mới nhất. Đảm bảo an toàn tuyệt đối, tối ưu hiệu năng và cập nhật tự động.
            </p>
          </div>

          {/* GRID CARD TẤT CẢ CÁC TOOL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                onClick={() => handleOpenDetail(tool)}
                className="group bg-[#0B1019]/60 backdrop-blur-md border-2 border-slate-800/80 hover:border-cyan-400/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative"
              >
                <div className="space-y-4">
                  {/* Khung Ảnh Banner Sản Phẩm */}
                  <div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
                    <img src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                    
                    {/* Badge Lượt xem ở GÓC TRÁI TRÊN */}
                    <div className="absolute top-3 left-3 bg-[#05080E]/80 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-200 font-extrabold shadow-md">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> {tool.views || 0}
                    </div>

                    {/* Badge Trạng thái ở GÓC PHẢI TRÊN */}
                    <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md border shadow-md ${tool.status === 'Tạm ngưng' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'}`}>
                      {tool.status ? tool.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition duration-300">{tool.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 truncate" title={tool.description}>{tool.description || 'Chưa có mô tả sản phẩm.'}</p>
                  </div>

                  {/* KHUNG GIÁ CẢ DẠNG CHIP MINI-BADGES PRO 2 CỘT */}
                  <div className="grid grid-cols-2 gap-2 bg-[#05080E]/80 border border-slate-800/80 p-3 rounded-2xl text-xs backdrop-blur-sm">
                    {/* Gói Ngày */}
                    <div className="bg-[#0B1019] border border-slate-800/80 p-2 rounded-xl flex flex-col justify-center space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Theo Ngày</span>
                      <b className="text-xs text-emerald-400 font-mono font-black">{tool.priceDay ? `${formatPrice(tool.priceDay)}đ` : '---'}</b>
                    </div>

                    {/* Gói Tuần */}
                    <div className="bg-[#0B1019] border border-slate-800/80 p-2 rounded-xl flex flex-col justify-center space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Theo Tuần</span>
                      <b className="text-xs text-emerald-400 font-mono font-black">{tool.priceWeek ? `${formatPrice(tool.priceWeek)}đ` : '---'}</b>
                    </div>

                    {/* Gói Tháng */}
                    <div className="bg-[#0B1019] border border-slate-800/80 p-2 rounded-xl flex flex-col justify-center space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Theo Tháng</span>
                      <b className="text-xs text-emerald-400 font-mono font-black">{tool.priceMonth ? `${formatPrice(tool.priceMonth)}đ` : '---'}</b>
                    </div>

                    {/* Gói Vĩnh Viễn Glow Neon Cyan với Icon Crown */}
                    <div className="bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-400/50 p-2 rounded-xl flex flex-col justify-center space-y-0.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                      <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider flex items-center gap-1">
                        <Crown className="w-3 h-3 text-cyan-300" /> Vĩnh Viễn
                      </span>
                      <b className="text-xs text-cyan-300 font-mono font-black">{tool.priceLifetime ? `${formatPrice(tool.priceLifetime)}đ` : '---'}</b>
                    </div>
                  </div>
                </div>

                {/* HÀNG NÚT BẤM "MUA NGAY" GRADIENT GLOW & "CHI TIẾT" */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    disabled={tool.status === 'Tạm ngưng'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedToolForBuy(tool); 
                      setPurchaseMsg(null); 
                      setCouponInput(''); 
                      setAppliedCoupon(null); 
                      setCouponMsg(null); 
                    }}
                    className={`relative overflow-hidden font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-md ${
                      tool.status === 'Tạm ngưng' 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                        : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.5]" /> 
                    {tool.status === 'Tạm ngưng' ? 'Tạm Ngưng' : 'Mua Ngay'}
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(tool);
                    }} 
                    className="bg-[#05080E]/90 border border-slate-800 hover:border-cyan-400/60 text-slate-200 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center transition-all duration-300 cursor-pointer hover:bg-slate-800/50"
                  >
                    <Info className="w-4 h-4 text-cyan-400" /> Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Chi tiết */}
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
                      onClick={() => { const tool = selectedToolForDetail; setSelectedToolForDetail(null); setSelectedToolForBuy(tool); }}
                      className={`w-full font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition ${selectedToolForDetail.status === 'Tạm ngưng' ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'}`}
                    >
                      <ShoppingBag className="w-4 h-4" /> {selectedToolForDetail.status === 'Tạm ngưng' ? 'SẢN PHẨM TẠM NGƯNG' : 'MUA SẢN PHẨM NÀY NGAY'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL MUA SẢN PHẨM CYBERPUNK HIGH-END */}
          <AnimatePresence>
            {selectedToolForBuy && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedToolForBuy(null)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center px-4 cursor-pointer"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 20 }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0.12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-5xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_60px_rgba(6,182,212,0.35)] max-h-[92vh] overflow-y-auto cursor-default"
                >
                  <button onClick={() => setSelectedToolForBuy(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer transition-all hover:border-cyan-400 hover:scale-105 z-10"><X className="w-5 h-5" /></button>
                  
                  <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">XÁC NHẬN MUA BẢN QUYỀN</span>
                    <h2 className="text-2xl font-black text-white tracking-wide">{selectedToolForBuy.name}</h2>
                  </div>

                  {/* BỐ CỤC 2 CỘT NẰM NGANG CÂN ĐỐI */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* CỘT TRÁI: ẢNH SẢN PHẨM SIÊU TO CHUẨN TỶ LỆ VUÔNG 1:1 + HOVER ZOOM */}
                    <div className="md:col-span-6 flex flex-col items-center group">
                      <div className="w-full aspect-square rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] bg-[#05080E] transition-all duration-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_40px_rgba(6,182,212,0.45)]">
                        <img src={selectedToolForBuy.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} alt={selectedToolForBuy.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                      </div>
                    </div>

                    {/* CỘT PHẢI: MÔ TẢ + MÃ GIẢM GIÁ + GÓI THỜI HẠN */}
                    <div className="md:col-span-6 space-y-5 text-left">
                      
                      {/* KHUNG MÔ TẢ CHI TIẾT */}
                      <div className="bg-[#05080E] border border-slate-800/90 p-4.5 rounded-2xl space-y-1.5 shadow-inner">
                        <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">Mô tả tính năng:</span>
                        <p className="text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto pr-1 whitespace-pre-line font-medium">
                          {selectedToolForBuy.description || 'Chưa có nội dung mô tả cho sản phẩm này.'}
                        </p>
                      </div>

                      {/* Ô NHẬP MÃ GIẢM GIÁ HOVER GLOW */}
                      <div className="space-y-2 bg-[#05080E] border border-slate-800/90 p-4 rounded-2xl transition duration-300 focus-within:border-cyan-500/50">
                        <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-cyan-400" /> Mã giảm giá (nếu có):</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Nhập mã giảm giá..." value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="flex-1 bg-[#0B1019] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 uppercase font-mono transition" />
                          <button onClick={handleApplyCoupon} className="bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-400 hover:text-slate-950 hover:scale-[1.02] text-cyan-300 font-black px-4 py-2.5 rounded-xl text-xs transition-all duration-300 cursor-pointer shadow-sm">Áp dụng</button>
                        </div>
                        {couponMsg && <p className={`text-[11px] font-bold ${couponMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{couponMsg.text}</p>}
                      </div>

                      {/* CHỌN GÓI THỜI HẠN DẠNG GAMING CARDS */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-slate-300">Chọn gói thời hạn sử dụng:</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[ { key: 'day', name: 'Gói 1 Ngày', price: selectedToolForBuy.priceDay }, { key: 'week', name: 'Gói 7 Ngày', price: selectedToolForBuy.priceWeek }, { key: 'month', name: 'Gói 30 Ngày', price: selectedToolForBuy.priceMonth }, { key: 'lifetime', name: 'Gói Vĩnh Viễn', price: selectedToolForBuy.priceLifetime }, ].map((pkg) => {
                            const originalPrice = Number(String(pkg.price || '0').replace(/[^0-9]/g, '')) || 0;
                            const discountAmt = appliedCoupon ? Number(appliedCoupon.discount_amount) || 0 : 0;
                            const finalPkgPrice = Math.max(0, originalPrice - discountAmt);
                            const isSelected = selectedDuration === pkg.key;

                            return (
                              <button 
                                key={pkg.key} 
                                onClick={() => setSelectedDuration(pkg.key as any)} 
                                className={`p-3.5 rounded-2xl border text-left text-xs space-y-1 relative transition-all duration-300 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-black scale-[1.02]' 
                                    : 'bg-[#05080E] border-slate-800/90 hover:border-cyan-500/50 hover:text-slate-200 hover:-translate-y-1'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                                <div className="font-extrabold text-slate-200">{pkg.name}</div>
                                <div>
                                  {appliedCoupon && discountAmt > 0 && originalPrice > 0 ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="line-through text-slate-500 text-[10px]">{formatPrice(originalPrice)}đ</span>
                                      <span className="text-emerald-400 font-extrabold font-mono">
                                        {finalPkgPrice === 0 ? '0 VNĐ' : `${formatPrice(finalPkgPrice)} VNĐ`}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-emerald-400 font-extrabold font-mono">
                                      {originalPrice === 0 ? '0 VNĐ' : `${formatPrice(originalPrice)} VNĐ`}
                                    </span>
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
                    <div className={`p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 ${purchaseMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                      {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{purchaseMsg.text}</span>
                    </div>
                  )}

                  <button 
                    disabled={loadingBuy} 
                    onClick={handleBuyTool} 
                    className="w-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-300 hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-xs shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 border border-cyan-300/50"
                  >
                    {loadingBuy ? (
                      <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /><span>ĐANG KHỞI TẠO TÀI KHOẢN...</span></>
                    ) : (
                      <><Shield className="w-4 h-4" /> XÁC NHẬN THANH TOÁN TỪ VÍ</>
                    )}
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