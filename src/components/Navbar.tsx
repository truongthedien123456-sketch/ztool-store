'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  User, Lock, LogIn, UserPlus, LogOut, Wallet, X, AlertCircle, CheckCircle2,
  PlusCircle, History, Calendar, CreditCard, Copy, Check, ChevronDown, Key, ArrowUpRight, ArrowDownLeft, Loader2, Wrench, Clock, RefreshCw, Download, Crown, CalendarCheck, Gift
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith('/quan-ly-secret')) {
    return null;
  }

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // States Menu & Dropdown
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal Auth States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rePasswordInput, setRePasswordInput] = useState('');
  const [authMsg, setAuthMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals Tính Năng
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [showPurchasedToolsModal, setShowPurchasedToolsModal] = useState(false);
  
  // Tính năng Điểm danh
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [rechargeAmount, setRechargeAmount] = useState('50000');
  const [copied, setCopied] = useState(false);

  // Dữ liệu Gist và Lịch sử
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userGistData, setUserGistData] = useState<any[] | null>(null);
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [loadingPurchasedTools, setLoadingPurchasedTools] = useState(false);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    checkLoggedInUser();
    loadAllToolsMeta();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const timer = setInterval(() => setNowTime(Date.now()), 1000);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(timer);
    };
  }, []);

  const loadAllToolsMeta = async () => {
    const { data } = await supabase.from('tools').select('*');
    if (data) {
      setToolsList(data);
    }
  };

  // CƠ CHẾ HEARTBEAT CẬP NHẬT TRẠNG THÁI ONLINE / OFFLINE REALTIME
  useEffect(() => {
    if (!currentUser?.username) return;

    const updateOnline = async () => {
      await supabase
        .from('users')
        .update({ 
          is_online: true,
          last_seen: new Date().toISOString() 
        })
        .eq('username', currentUser.username);
    };

    updateOnline();

    const interval = setInterval(updateOnline, 10000);

    const handleUnload = () => {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(currentUser.username)}`;
      const headers = {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
      };
      
      fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_online: false }),
        keepalive: true
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser?.username]);

  const checkLoggedInUser = async () => {
    const savedUser = localStorage.getItem('ztool_current_user');
    if (savedUser) {
      const { data } = await supabase.from('users').select('*').eq('username', savedUser).single();
      if (data) {
        if (data.isBanned) {
          alert('Tài khoản của bạn đã bị khóa!');
          handleLogout();
          return;
        }
        setCurrentUser(data);
      } else {
        localStorage.removeItem('ztool_current_user');
      }
    }
  };

  // TẢI TẤT CẢ CÁC TOOL ĐÃ MUA
  const loadUserGistData = async (username: string) => {
    setLoadingPurchasedTools(true);
    try {
      const gistId = '21f0a39cbc434e5033d89f06e2c7d26e';
      const res = await fetch(`https://api.github.com/gists/${gistId}?timestamp=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const contentRaw = data.files['accounts.json']?.content || '{}';
        const parsed = JSON.parse(contentRaw);
        
        const matchedKeys = Object.keys(parsed).filter(
          k => k.trim().toLowerCase() === username.trim().toLowerCase() ||
               k.trim().toLowerCase().startsWith(`${username.trim().toLowerCase()}_`)
        );

        if (matchedKeys.length > 0) {
          const purchasedList = matchedKeys.map(k => {
            const tCode = parsed[k].tool_code || parsed[k].toolCode || '';
            const foundTool = toolsList.find(t => (t.toolCode || t.tool_code || '').trim().toLowerCase() === tCode.trim().toLowerCase());
            return {
              accountName: k,
              toolCode: tCode,
              toolName: foundTool ? foundTool.name : (tCode ? `AUTO ${tCode.toUpperCase()}` : 'TOOL AUTO CHUNG'),
              downloadLink: foundTool ? (foundTool.downloadLink || foundTool.download_link || '') : '',
              ...parsed[k]
            };
          });
          setUserGistData(purchasedList);
        } else {
          setUserGistData(null);
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Gist:', err);
    } finally {
      setLoadingPurchasedTools(false);
    }
  };

  const loadUserTransactionsFromCloud = async (username: string) => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('username', username)
      .order('id', { ascending: false });

    setLoadingHistory(false);
    if (!error && data) {
      setUserTransactions(data);
    } else {
      console.error('Lỗi tải lịch sử Cloud:', error?.message);
    }
  };

  const renderRemainingTime = (expireTimestamp: number) => {
    if (!expireTimestamp || expireTimestamp === 0) {
      return (
        <span className="text-cyan-300 font-black bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3.5 py-1.5 rounded-xl border border-cyan-400/40 text-xs shadow-[0_0_12px_rgba(6,182,212,0.2)] inline-flex items-center gap-1.5">
          ♾️ Vĩnh Viễn
        </span>
      );
    }

    const nowSec = Math.floor(nowTime / 1000);
    const diffSec = expireTimestamp - nowSec;

    if (diffSec <= 0) {
      return (
        <span className="text-rose-400 font-bold bg-rose-500/20 px-3.5 py-1.5 rounded-xl border border-rose-500/40 text-xs inline-flex items-center gap-1.5">
          ⚠️ Đã Hết Hạn
        </span>
      );
    }

    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return (
      <span className="text-emerald-300 font-mono font-black bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-400/40 text-xs inline-flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
        <Clock className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
        {days > 0 && `${days}d `}{hours}h {minutes}m {seconds}s
      </span>
    );
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthMsg({ type: 'error', text: 'Vui lòng điền đầy đủ tài khoản và mật khẩu!' });
      return;
    }

    setLoading(true);

    if (authMode === 'register') {
      if (passwordInput !== rePasswordInput) {
        setLoading(false);
        setAuthMsg({ type: 'error', text: 'Mật khẩu nhập lại không trùng khớp!' });
        return;
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', usernameInput.trim())
        .single();

      if (existingUser) {
        setLoading(false);
        setAuthMsg({ type: 'error', text: 'Tài khoản này đã tồn tại trên hệ thống!' });
        return;
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            username: usernameInput.trim(),
            password: passwordInput,
            balance: 0,
            isBanned: false,
            is_online: true,
            last_seen: new Date().toISOString()
          }
        ])
        .select()
        .single();

      setLoading(false);

      if (error) {
        setAuthMsg({ type: 'error', text: 'Lỗi đăng ký: ' + error.message });
      } else {
        localStorage.setItem('ztool_current_user', newUser.username);
        setCurrentUser(newUser);

        await supabase.from('transactions').insert([
          {
            username: newUser.username,
            type: 'INIT',
            title: 'Khởi tạo tài khoản thành công',
            amount: 0,
            status: 'Thành công'
          }
        ]);

        setAuthMsg({ type: 'success', text: 'Đăng ký tài khoản thành công!' });
        
        setTimeout(() => {
          setShowAuthModal(false);
          resetForm();
        }, 500);
      }
    } else {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', usernameInput.trim())
        .eq('password', passwordInput)
        .single();

      setLoading(false);

      if (error || !user) {
        setAuthMsg({ type: 'error', text: 'Tài khoản hoặc mật khẩu không chính xác!' });
        return;
      }

      if (user.isBanned) {
        setAuthMsg({ type: 'error', text: 'Tài khoản của bạn đã bị BAN khỏi hệ thống!' });
        return;
      }

      localStorage.setItem('ztool_current_user', user.username);
      setCurrentUser(user);

      setAuthMsg({ type: 'success', text: 'Đăng nhập thành công!' });
      
      setTimeout(() => {
        setShowAuthModal(false);
        resetForm();
      }, 500);
    }
  };

  const handleLogout = async () => {
    if (currentUser?.username) {
      await supabase.from('users').update({ is_online: false }).eq('username', currentUser.username);
    }
    localStorage.removeItem('ztool_current_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
  };

  // HÀM XỬ LÝ ĐIỂM DANH HÀNG NGÀY
  const handleDailyCheckIn = async () => {
    if (!currentUser) return;
    setCheckInMsg(null);
    setCheckInLoading(true);

    try {
      const { data: lastCheckIn } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('username', currentUser.username)
        .eq('type', 'CHECKIN')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn.created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        if (lastCheckInDate === today) {
          setCheckInMsg({ type: 'error', text: 'Bạn đã điểm danh hôm nay rồi. Hãy quay lại vào ngày mai nhé!' });
          setCheckInLoading(false);
          return;
        }
      }

      const rewardAmount = 1000;
      const newBalance = (currentUser.balance || 0) + rewardAmount;
      
      const { error: updateErr } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('username', currentUser.username);

      if (updateErr) throw updateErr;

      await supabase.from('transactions').insert([
        {
          username: currentUser.username,
          type: 'CHECKIN',
          title: 'Điểm danh hàng ngày',
          amount: rewardAmount,
          status: 'Thành công'
        }
      ]);

      setCurrentUser({ ...currentUser, balance: newBalance });
      setCheckInMsg({ type: 'success', text: 'Điểm danh thành công! Bạn nhận được +1,000 VNĐ.' });

    } catch (err: any) {
      setCheckInMsg({ type: 'error', text: `Lỗi hệ thống: ${err.message}` });
    } finally {
      setCheckInLoading(false);
    }
  };

  const resetForm = () => {
    setUsernameInput('');
    setPasswordInput('');
    setRePasswordInput('');
    setAuthMsg(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <nav className="bg-[#080B10]/95 backdrop-blur-md border-b-2 border-cyan-400/50 sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between shadow-lg shadow-cyan-500/15">
        
        {/* LOGO ZTOOL */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#06090E] p-1 border-2 border-cyan-400 shadow-lg shadow-cyan-400/40 group-hover:scale-105 group-hover:border-cyan-300 transition duration-300 overflow-hidden shrink-0">
            <img 
              src="/logo.jpg" 
              alt="ZTool Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider leading-none group-hover:text-cyan-300 transition drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">ZTOOL</h1>
            <span className="text-[11px] font-bold text-cyan-300 tracking-wide block mt-1">Chuyên Cung Cấp Tool FiveM</span>
          </div>
        </Link>

        {/* MENU ĐIỀU HƯỚNG */}
        <div className="hidden md:flex items-center gap-2 bg-[#06090E] p-1.5 rounded-2xl border-2 border-[#1C2638] shadow-xl">
          {[
            { name: 'Trang chủ', path: '/' },
            { name: 'TOOL AUTO', path: '/tools' },
            { name: 'Dự án', path: '/projects' }
          ].map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path}
                href={item.path} 
                className={`min-w-[110px] text-center px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer flex items-center justify-center select-none ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-[#0D121D]'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* NẠP TIỀN, ĐIỂM DANH & VÍ TIỀN */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              
              {/* NÚT ĐIỂM DANH MỚI - ĐẸP & PHÁT SÁNG */}
              <button
                onClick={() => { setShowCheckInModal(true); setCheckInMsg(null); }}
                className="relative group overflow-hidden bg-gradient-to-r from-[#0D121D] to-[#141C2B] border-2 border-cyan-500/60 hover:border-cyan-300 text-cyan-300 font-black px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Gift className="w-4 h-4 text-cyan-400 group-hover:animate-bounce relative z-10" />
                <span className="relative z-10">Điểm danh</span>
                {/* Dấu chấm đỏ thông báo nổi bật */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-[#080B10]"></span>
                </span>
              </button>

              {/* NÚT NẠP TIỀN */}
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-400/40 transition cursor-pointer hover:-translate-y-0.5 border-2 border-emerald-200"
              >
                <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" /> Nạp tiền
              </button>

              {/* KHUNG TÀI KHOẢN & SỐ DƯ MỚI (DẠNG PILL) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 bg-[#0D121D] border-2 border-[#1C2638] hover:border-cyan-500/60 p-1.5 pr-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 group cursor-pointer"
                >
                  {/* AVATAR TRÒN BÊN TRÁI */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0 relative shadow-inner">
                    {currentUser.username.substring(0, 1).toUpperCase()}
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0D121D] absolute bottom-0 right-0 animate-pulse"></span>
                  </div>

                  {/* THÔNG TIN BÊN PHẢI */}
                  <div className="text-left leading-none flex flex-col justify-center">
                    <span className="text-sm font-black text-white group-hover:text-cyan-300 transition truncate max-w-[100px]">{currentUser.username}</span>
                    <span className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 w-fit">
                      <Wallet className="w-3 h-3" /> {(currentUser.balance || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ml-1 ${showUserDropdown ? 'rotate-180 text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                </button>

                {/* USER DROPDOWN MENU */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#0D121D] border-2 border-cyan-400 rounded-2xl p-2.5 shadow-2xl shadow-cyan-500/35 space-y-1 z-50">
                    <button
                      onClick={() => { setShowAccountInfoModal(true); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#141C2B] transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-cyan-400" /> Thông tin tài khoản
                    </button>

                    <button
                      onClick={() => { 
                        if (currentUser) loadUserGistData(currentUser.username);
                        setShowPurchasedToolsModal(true); 
                        setShowUserDropdown(false); 
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#141C2B] transition cursor-pointer"
                    >
                      <Wrench className="w-4 h-4 text-cyan-300" /> Tool đã mua
                    </button>

                    <button
                      onClick={() => { 
                        if (currentUser) loadUserTransactionsFromCloud(currentUser.username);
                        setShowHistoryModal(true); 
                        setShowUserDropdown(false); 
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#141C2B] transition cursor-pointer"
                    >
                      <History className="w-4 h-4 text-emerald-400" /> Lịch sử giao dịch
                    </button>

                    <div className="border-t border-[#1C2638] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { setAuthModalMode('login'); resetForm(); setShowAuthModal(true); }}
                className="bg-[#0D121D] border-2 border-cyan-500/60 hover:border-cyan-400 text-slate-100 text-xs font-black px-5 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-400/40"
              >
                <LogIn className="w-4 h-4 text-cyan-400" /> ĐĂNG NHẬP
              </button>
              <button
                onClick={() => { setAuthModalMode('register'); resetForm(); setShowAuthModal(true); }}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/40 hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" /> ĐĂNG KÝ
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MODAL ĐIỂM DANH */}
      {showCheckInModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-2xl shadow-cyan-500/30">
            <button onClick={() => setShowCheckInModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 border-b border-[#1C2638] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">ĐIỂM DANH MỖI NGÀY</h3>
                <p className="text-xs text-slate-400">Nhận quà tặng từ ZTOOL để trải nghiệm dịch vụ</p>
              </div>
            </div>

            <div className="bg-[#06090E] border border-[#1C2638] p-6 rounded-2xl flex flex-col items-center space-y-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse">
                <Gift className="w-10 h-10 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Phần thưởng hôm nay</h4>
                <p className="text-2xl font-black text-emerald-400">+ 1,000 VNĐ</p>
              </div>
            </div>

            {checkInMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${checkInMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                {checkInMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{checkInMsg.text}</span>
              </div>
            )}

            <button 
              disabled={checkInLoading || checkInMsg?.type === 'success'}
              onClick={handleDailyCheckIn} 
              className={`w-full font-black py-3.5 rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                checkInMsg?.type === 'success' 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              {checkInLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /> ĐANG XỬ LÝ...</>
              ) : checkInMsg?.type === 'success' ? (
                <><CheckCircle2 className="w-4 h-4" /> ĐÃ ĐIỂM DANH HÔM NAY</>
              ) : (
                <><Gift className="w-4 h-4" /> ĐIỂM DANH NGAY</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL TOOL ĐÃ MUA & GIA HẠN */}
      {showPurchasedToolsModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-xl rounded-3xl p-6 space-y-5 relative shadow-2xl shadow-cyan-500/35 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPurchasedToolsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#1C2638] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">DANH SÁCH TOOL ĐÃ MUA</h3>
                <p className="text-xs text-slate-400">Quản lý tài khoản, mật khẩu và thời hạn cho {currentUser.username}</p>
              </div>
            </div>

            {loadingPurchasedTools ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Đang kiểm tra hệ thống tài khoản Tool...
              </div>
            ) : (
              <div className="space-y-4">
                {!userGistData || userGistData.length === 0 ? (
                  <div className="bg-[#06090E] border border-[#1C2638] p-6 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-slate-400">Tài khoản của bạn chưa được kích hoạt bản quyền Tool nào trên hệ thống Gist.</p>
                    <Link href="/tools" onClick={() => setShowPurchasedToolsModal(false)} className="inline-block bg-cyan-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs">
                      Mua Tool Ngay
                    </Link>
                  </div>
                ) : (
                  userGistData.map((toolAcc: any, idx: number) => {
                    const isLifetime = toolAcc.expire_timestamp === 0;
                    const hasDownloadLink = toolAcc.downloadLink && toolAcc.downloadLink.trim() !== '' && toolAcc.downloadLink !== 'EMPTY';

                    return (
                      <div key={idx} className="bg-[#06090E] border border-[#1C2638] p-5 rounded-2xl space-y-4 shadow-lg">
                        {/* Tiêu đề Tên tool và Thời gian nổi bật */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2638] pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block">TÊN TOOL SỬ DỤNG</span>
                            <h4 className="font-black text-white text-base tracking-wide uppercase">{toolAcc.toolName}</h4>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1 font-bold">THỜI HẠN SỬ DỤNG:</span>
                            {renderRemainingTime(toolAcc.expire_timestamp)}
                          </div>
                        </div>

                        {/* Khung Tài khoản, Mật khẩu tool & Nút Tải Tool */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#0D121D] p-3.5 rounded-xl border border-[#1C2638] items-center">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold mb-0.5">TÀI KHOẢN TOOL:</span>
                            <span className="font-mono font-bold text-cyan-300">{toolAcc.accountName}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold mb-0.5">MẬT KHẨU TOOL:</span>
                            <span className="font-mono font-bold text-emerald-400">{toolAcc.password || '---'}</span>
                          </div>
                          <div className="flex flex-col sm:items-end">
                            {hasDownloadLink ? (
                              <a 
                                href={toolAcc.downloadLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
                              >
                                <Download className="w-3.5 h-3.5" /> Tải Tool
                              </a>
                            ) : (
                              <button 
                                disabled 
                                className="bg-slate-800 border border-slate-700 text-slate-500 font-bold py-2 px-4 rounded-xl text-xs cursor-not-allowed w-full sm:w-auto text-center"
                              >
                                Chưa có link
                              </button>
                            )}
                          </div>
                        </div>

                        {/* KHUNG THÔNG BÁO VĨNH VIỄN */}
                        {isLifetime ? (
                          <div className="bg-[#080B10] border-2 border-cyan-500/50 p-4 rounded-2xl text-center shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center">
                            <div className="inline-flex items-center gap-2.5 animate-pulse">
                              <Crown className="w-5 h-5 text-cyan-400 shrink-0" />
                              <span className="text-xs font-bold text-cyan-300 tracking-wide">
                                Bạn đang sở hữu gói bản quyền Vĩnh Viễn. Không cần gia hạn!
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5" /> Cần gia hạn thêm thời gian?
                              </span>
                              <button 
                                onClick={() => {
                                  setShowPurchasedToolsModal(false);
                                  if (pathname !== '/tools') {
                                    router.push('/tools');
                                    setTimeout(() => {
                                      window.dispatchEvent(new CustomEvent('open-buy-tool-modal', { detail: { toolCode: toolAcc.toolCode } }));
                                    }, 500);
                                  } else {
                                    window.dispatchEvent(new CustomEvent('open-buy-tool-modal', { detail: { toolCode: toolAcc.toolCode } }));
                                  }
                                }}
                                className="bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-black py-2.5 px-6 rounded-xl text-xs shadow-md shadow-emerald-500/20 border-2 border-emerald-200 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-emerald-400/50 hover:brightness-110 active:scale-95 flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> GIA HẠN NGAY
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NẠP TIỀN */}
      {showRechargeModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-2xl shadow-cyan-500/30">
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-[#1C2638] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">NẠP TIỀN VÀO VÍ TỰ ĐỘNG</h3>
                <p className="text-xs text-slate-400">Quét mã QR chuyển khoản để cộng tiền 24/7</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">Chọn số tiền muốn nạp:</label>
              <div className="grid grid-cols-3 gap-2">
                {['20000', '50000', '100000', '200000', '500000', '1000000'].map((amt) => (
                  <button key={amt} onClick={() => setRechargeAmount(amt)} className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${rechargeAmount === amt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#06090E] border-[#1C2638] text-slate-400'}`}>
                    {Number(amt).toLocaleString('vi-VN')}đ
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#06090E] border border-[#1C2638] p-4 rounded-2xl flex flex-col items-center space-y-3 text-center">
              <img src={`https://qr.sepay.vn/img?bank=BIDV&acc=96247JFG2G&template=compact&amount=${rechargeAmount}&des=${encodeURIComponent(`NAP ${currentUser.username}`)}`} alt="QR SePay" className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg" />
              <div className="space-y-1 w-full text-xs">
                <div className="flex justify-between items-center bg-[#0D121D] p-2.5 rounded-xl border border-[#1C2638]">
                  <span className="text-slate-400">Nội dung chuyển khoản:</span>
                  <button onClick={() => copyToClipboard(`NAP ${currentUser.username}`)} className="font-black text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer">
                    NAP {currentUser.username} {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-amber-400 text-center font-medium bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
              Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động cộng tiền sau 1-3 phút.
            </p>
          </div>
        </div>
      )}

      {/* MODAL LỊCH SỬ GIAO DỊCH */}
      {showHistoryModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-lg rounded-3xl p-6 space-y-5 relative shadow-2xl shadow-cyan-500/35">
            <button onClick={() => setShowHistoryModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-[#1C2638] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">LỊCH SỬ GIAO DỊCH TÀI KHOẢN</h3>
                <p className="text-xs text-slate-400">Đồng bộ Cloud theo thời gian thực của {currentUser.username}</p>
              </div>
            </div>
            {loadingHistory ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Đang tải lịch sử giao dịch từ Cloud...
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {userTransactions.length === 0 ? (
                  <div className="bg-[#06090E] border border-[#1C2638] p-4 rounded-2xl text-center text-slate-500 text-xs">
                    Chưa có lịch sử mua tool hay biến động số dư nào trên Cloud.
                  </div>
                ) : (
                  userTransactions.map((log: any, idx: number) => (
                    <div key={idx} className="bg-[#06090E] border border-[#1C2638] p-3.5 rounded-2xl flex items-center justify-between text-xs gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {log.type === 'BUY' && <ArrowDownLeft className="w-4 h-4 text-rose-400 shrink-0" />}
                          {(log.type === 'RECHARGE' || log.type === 'ADMIN_ADD') && <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {log.type === 'ADMIN_SUB' && <ArrowDownLeft className="w-4 h-4 text-rose-400 shrink-0" />}
                          {log.type === 'INIT' && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                          {log.type === 'CHECKIN' && <CalendarCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
                          <span className="font-bold text-white leading-snug">{log.title}</span>
                        </div>
                        {log.key_code && (
                          <div className="bg-[#0D121D] border border-[#1C2638] px-2.5 py-1 rounded-lg text-[11px] text-cyan-400 font-mono w-fit">
                            Key: {log.key_code}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 block">
                          {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : log.time || 'Gần đây'}
                        </span>
                      </div>
                      {log.amount > 0 ? (
                        <span className="text-emerald-400 font-black text-xs shrink-0">+{(log.amount).toLocaleString('vi-VN')}đ</span>
                      ) : log.amount < 0 ? (
                        <span className="text-rose-400 font-black text-xs shrink-0">{(log.amount).toLocaleString('vi-VN')}đ</span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs shrink-0">0đ</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL THÔNG TIN TÀI KHOẢN */}
      {showAccountInfoModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-sm rounded-3xl p-6 space-y-5 relative shadow-2xl shadow-cyan-500/35">
            <button onClick={() => setShowAccountInfoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto text-2xl font-black shadow-lg shadow-cyan-400/40">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
              <h3 className="text-lg font-black text-white">{currentUser.username}</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Tài khoản chính thức
              </span>
            </div>
            <div className="bg-[#06090E] border border-[#1C2638] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400"><Wallet className="w-3.5 h-3.5 text-emerald-400" /> Số dư ví:</span>
                <b className="text-emerald-400 text-sm font-extrabold">{(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ</b>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-[#1C2638] pt-2.5">
                <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="w-3.5 h-3.5 text-cyan-400" /> Ngày khởi tạo:</span>
                <b className="text-white font-medium">
                  {currentUser.created_at ? new Date(currentUser.created_at).toLocaleString('vi-VN') : 'Mới khởi tạo'}
                </b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUTH */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl shadow-cyan-500/35">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                {authMode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              </div>
              <h2 className="text-xl font-black text-white">
                {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                {authMode === 'login' ? 'Nhập thông tin để truy cập hệ thống ZTOOL' : 'Tạo tài khoản để mua và quản lý các sản phẩm Tool Auto'}
              </p>
            </div>
            {authMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${authMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                {authMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{authMsg.text}</span>
              </div>
            )}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên tài khoản (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="text" required placeholder="Nhập username..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input type="password" required placeholder="Nhập mật khẩu..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition" />
                </div>
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input type="password" required placeholder="Xác nhận mật khẩu..." value={rePasswordInput} onChange={(e) => setRePasswordInput(e.target.value)} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition" />
                  </div>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer mt-2">
                {loading ? 'ĐANG XỬ LÝ...' : authMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN NGAY'}
              </button>
            </form>
            <div className="text-center pt-2 border-t border-[#1C2638]">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-400">
                  Chưa có tài khoản?{' '}
                  <button onClick={() => { setAuthModalMode('register'); resetForm(); }} className="text-cyan-400 font-bold hover:underline cursor-pointer">Đăng ký ngay</button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Đã có tài khoản?{' '}
                  <button onClick={() => { setAuthModalMode('login'); resetForm(); }} className="text-cyan-400 font-bold hover:underline cursor-pointer">Đăng nhập</button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}