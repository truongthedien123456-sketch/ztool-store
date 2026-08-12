'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  User, Lock, LogIn, UserPlus, LogOut, Wallet, X, AlertCircle, CheckCircle2,
  PlusCircle, History, Calendar, CreditCard, Copy, Check, ChevronDown, Key, ArrowUpRight, ArrowDownLeft, Loader2, Wrench, Clock, RefreshCw, Download, Crown, CalendarCheck, Gift, Bell, Home, FolderKanban, Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith('/quan-ly-secret')) {
    return null;
  }

  // Khởi tạo User từ localStorage
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUserStr = localStorage.getItem('ztool_user_data');
      if (savedUserStr) {
        try {
          return JSON.parse(savedUserStr);
        } catch (e) {
          const savedUsername = localStorage.getItem('ztool_current_user');
          return savedUsername ? { username: savedUsername, balance: 0 } : null;
        }
      }
      const savedUsername = localStorage.getItem('ztool_current_user');
      return savedUsername ? { username: savedUsername, balance: 0 } : null;
    }
    return null;
  });

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
  
  // Trạng thái điểm danh từ localStorage
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const savedStatus = localStorage.getItem(`ztool_checkin_${todayStr}`);
      return savedStatus === 'true';
    }
    return false;
  });

  const [checkInModalShow, setCheckInModalShow] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [rechargeAmount, setRechargeAmount] = useState('50000');
  const [copied, setCopied] = useState(false);

  // Thông báo chung từ localStorage
  const [announcement, setAnnouncement] = useState<{ text: string, active: boolean } | null>(() => {
    if (typeof window !== 'undefined') {
      const savedNotice = localStorage.getItem('ztool_cached_notice');
      if (savedNotice) {
        try {
          return JSON.parse(savedNotice);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  // Dữ liệu Gist và Lịch sử
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userGistData, setUserGistData] = useState<any[] | null>(null);
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [loadingPurchasedTools, setLoadingPurchasedTools] = useState(false);
  const [nowTime, setNowTime] = useState(Date.now());

  // Tránh nháy active menu khi đang Hydration
  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    checkLoggedInUser();
    loadAllToolsMeta();
    loadAnnouncement();

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

  const loadAnnouncement = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) {
        const noticeObj = { text: data.notice_text, active: data.is_active };
        setAnnouncement(noticeObj);
        localStorage.setItem('ztool_cached_notice', JSON.stringify(noticeObj));
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    return () => clearInterval(interval);
  }, [currentUser?.username]);

  const checkTodayCheckInStatus = async (username: string) => {
    try {
      const { data: lastCheckIn } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('username', username)
        .eq('type', 'CHECKIN')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn.created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const checkedIn = lastCheckInDate === todayStr;
        setHasCheckedInToday(checkedIn);
        if (checkedIn) {
          localStorage.setItem(`ztool_checkin_${todayStr}`, 'true');
        } else {
          localStorage.removeItem(`ztool_checkin_${todayStr}`);
        }
      } else {
        setHasCheckedInToday(false);
        localStorage.removeItem(`ztool_checkin_${todayStr}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        localStorage.setItem('ztool_user_data', JSON.stringify(data));
        checkTodayCheckInStatus(data.username);
      } else {
        localStorage.removeItem('ztool_current_user');
        localStorage.removeItem('ztool_user_data');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

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
      console.error(err);
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
        .insert([{ username: usernameInput.trim(), password: passwordInput, balance: 0, isBanned: false, is_online: true, last_seen: new Date().toISOString() }])
        .select()
        .single();

      setLoading(false);

      if (error) {
        setAuthMsg({ type: 'error', text: 'Lỗi đăng ký: ' + error.message });
      } else {
        localStorage.setItem('ztool_current_user', newUser.username);
        localStorage.setItem('ztool_user_data', JSON.stringify(newUser));
        setCurrentUser(newUser);

        await supabase.from('transactions').insert([{ username: newUser.username, type: 'INIT', title: 'Khởi tạo tài khoản thành công', amount: 0, status: 'Thành công' }]);

        setAuthMsg({ type: 'success', text: 'Đăng ký tài khoản thành công!' });
        setTimeout(() => { setShowAuthModal(false); resetForm(); checkTodayCheckInStatus(newUser.username); }, 500);
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
      localStorage.setItem('ztool_user_data', JSON.stringify(user));
      setCurrentUser(user);

      setAuthMsg({ type: 'success', text: 'Đăng nhập thành công!' });
      setTimeout(() => { setShowAuthModal(false); resetForm(); checkTodayCheckInStatus(user.username); }, 500);
    }
  };

  const handleLogout = async () => {
    if (currentUser?.username) {
      await supabase.from('users').update({ is_online: false }).eq('username', currentUser.username);
    }
    const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    localStorage.removeItem('ztool_current_user');
    localStorage.removeItem('ztool_user_data');
    localStorage.removeItem(`ztool_checkin_${todayStr}`);
    setCurrentUser(null);
    setShowUserDropdown(false);
    setHasCheckedInToday(false);
  };

  const handleDailyCheckIn = async () => {
    if (!currentUser) return;
    setCheckInMsg(null);
    setCheckInLoading(true);

    try {
      const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      const { data: lastCheckIn } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('username', currentUser.username)
        .eq('type', 'CHECKIN')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastCheckIn) {
        const lastCheckInDate = new Date(lastCheckIn.created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        if (lastCheckInDate === todayStr) {
          setHasCheckedInToday(true);
          localStorage.setItem(`ztool_checkin_${todayStr}`, 'true');
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

      await supabase.from('transactions').insert([{ username: currentUser.username, type: 'CHECKIN', title: 'Điểm danh hàng ngày', amount: rewardAmount, status: 'Thành công' }]);

      const updatedUser = { ...currentUser, balance: newBalance };
      setCurrentUser(updatedUser);
      localStorage.setItem('ztool_user_data', JSON.stringify(updatedUser));
      setHasCheckedInToday(true);
      localStorage.setItem(`ztool_checkin_${todayStr}`, 'true');
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
      {/* 1. THANH THÔNG BÁO TÊN CÙNG: CĂN GIỮA DÒNG HOÀN HẢO */}
      {announcement?.active && announcement?.text && (
        <div className="bg-[#0A0E17] border-b border-amber-500/30 px-4 py-2 text-xs font-extrabold text-amber-300 flex items-center justify-center gap-3 relative z-50 shadow-md">
          <div className="flex items-center gap-1.5 shrink-0 bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider border border-amber-500/40 shadow-inner">
            <Bell className="w-3.5 h-3.5 animate-bounce text-amber-400" /> THÔNG BÁO
          </div>
          <p className="text-slate-200 truncate max-w-4xl tracking-wide text-center">
            {announcement.text}
          </p>
        </div>
      )}

      {/* 2. NAVBAR CHÍNH GLASSMORPHISM CYBERPUNK PRO */}
      <nav className="bg-[#080D15]/90 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LOGO ZTOOL GLOW */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#05080E] p-1 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] group-hover:scale-105 transition duration-300 overflow-hidden shrink-0">
              <img src="/logo.jpg" alt="ZTool Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider leading-none group-hover:text-cyan-300 transition duration-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                ZTOOL<span className="text-cyan-400">.STORE</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest block mt-1 uppercase">Chuyên Cung Cấp Tool FiveM</span>
            </div>
          </Link>

          {/* MENU ĐIỀU HƯỚNG DẠNG PILL GLASS */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0D131F] border border-slate-800/80 p-1.5 rounded-2xl shadow-inner">
            {[
              { name: 'Trang chủ', path: '/', icon: Home },
              { name: 'TOOL AUTO', path: '/tools', icon: Wrench },
              { name: 'Dự án', path: '/projects', icon: FolderKanban }
            ].map((item) => {
              const isActive = currentPath === item.path;
              const IconComp = item.icon;
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* CỤM ĐIỂM DANH, NẠP TIỀN & Ô THÔNG TIN TÀI KHOẢN CAO CẤP */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                
                {/* NÚT ĐIỂM DANH */}
                <button
                  disabled={hasCheckedInToday}
                  onClick={() => { setCheckInModalShow(true); setCheckInMsg(null); }}
                  className={`relative group overflow-hidden border px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition duration-200 ${
                    hasCheckedInToday
                      ? 'bg-[#0D131F] border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0D131F] border-cyan-500/40 hover:border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer'
                  }`}
                >
                  <Gift className={`w-3.5 h-3.5 ${hasCheckedInToday ? 'text-slate-500' : 'text-cyan-400 group-hover:animate-bounce'}`} />
                  <span className="font-bold hidden sm:inline">
                    {hasCheckedInToday ? 'Đã điểm danh' : 'Điểm danh'}
                  </span>
                  {!hasCheckedInToday && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>

                {/* NÚT NẠP TIỀN NEON EMERALD CAO CẤP */}
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] transition duration-300 hover:scale-[1.03] cursor-pointer border border-emerald-300/50"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" /> Nạp tiền
                </button>

                {/* Ô THÔNG TIN KHÁCH HÀNG (USER PROFILE CARD) */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-3 bg-[#0D131F]/90 border border-slate-700/80 hover:border-cyan-500/60 p-1.5 pr-3.5 rounded-2xl transition duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)] cursor-pointer group backdrop-blur-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs uppercase shadow-inner relative">
                      {currentUser.username.substring(0, 1).toUpperCase()}
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0D131F] absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
                    </div>
                    
                    <div className="text-left text-xs leading-tight flex flex-col justify-center">
                      <span className="font-extrabold text-white group-hover:text-cyan-300 transition truncate max-w-[90px]">
                        {currentUser.username}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-black block mt-0.5">
                        {(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition duration-300 ml-0.5 ${showUserDropdown ? 'rotate-180 text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                  </button>

                  {/* USER DROPDOWN MENU */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2.5 w-60 bg-[#0D131F] border border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1 z-50 backdrop-blur-xl">
                      <button onClick={() => { setShowAccountInfoModal(true); setShowUserDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/60 transition cursor-pointer">
                        <User className="w-4 h-4 text-cyan-400" /> Thông tin tài khoản
                      </button>
                      <button onClick={() => { if (currentUser) loadUserGistData(currentUser.username); setShowPurchasedToolsModal(true); setShowUserDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/60 transition cursor-pointer">
                        <Wrench className="w-4 h-4 text-cyan-300" /> Tool đã mua
                      </button>
                      <button onClick={() => { if (currentUser) loadUserTransactionsFromCloud(currentUser.username); setShowHistoryModal(true); setShowUserDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/60 transition cursor-pointer">
                        <History className="w-4 h-4 text-emerald-400" /> Lịch sử giao dịch
                      </button>
                      <div className="border-t border-slate-800 my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setAuthModalMode('login'); resetForm(); setShowAuthModal(true); }} className="bg-[#0D131F] border border-cyan-500/40 hover:border-cyan-400 text-slate-100 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" /> ĐĂNG NHẬP
                </button>
                <button onClick={() => { setAuthModalMode('register'); resetForm(); setShowAuthModal(true); }} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <UserPlus className="w-3.5 h-3.5" /> ĐĂNG KÝ
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL ĐIỂM DANH */}
      {checkInModalShow && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <button onClick={() => setCheckInModalShow(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><CalendarCheck className="w-5 h-5" /></div>
              <div><h3 className="text-base font-black text-white">ĐIỂM DANH MỖI NGÀY</h3><p className="text-xs text-slate-400">Nhận quà tặng từ ZTOOL để trải nghiệm dịch vụ</p></div>
            </div>
            <div className="bg-[#06090E] border border-slate-800 p-6 rounded-2xl flex flex-col items-center space-y-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse"><Gift className="w-10 h-10 text-cyan-300" /></div>
              <div className="space-y-1"><h4 className="text-lg font-black text-white">Phần thưởng hôm nay</h4><p className="text-2xl font-black text-emerald-400">+ 1,000 VNĐ</p></div>
            </div>
            {checkInMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${checkInMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                {checkInMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{checkInMsg.text}</span>
              </div>
            )}
            <button 
              disabled={checkInLoading || checkInMsg?.type === 'success' || hasCheckedInToday}
              onClick={handleDailyCheckIn} 
              className={`w-full font-black py-3.5 rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                (checkInMsg?.type === 'success' || hasCheckedInToday) ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer'
              }`}
            >
              {checkInLoading ? <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /> ĐANG XỬ LÝ...</> : (checkInMsg?.type === 'success' || hasCheckedInToday) ? <><CheckCircle2 className="w-4 h-4" /> ĐÃ ĐIỂM DANH HÔM NAY</> : <><Gift className="w-4 h-4" /> ĐIỂM DANH NGAY</>}
            </button>
          </div>
        </div>
      )}

      {/* CÁC MODAL KHÁC */}
      {showPurchasedToolsModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-xl rounded-3xl p-6 space-y-5 relative shadow-[0_0_30px_rgba(6,182,212,0.25)] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowPurchasedToolsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><Wrench className="w-5 h-5" /></div>
              <div><h3 className="text-base font-black text-white">DANH SÁCH TOOL ĐÃ MUA</h3><p className="text-xs text-slate-400">Quản lý tài khoản, mật khẩu và thời hạn</p></div>
            </div>
            {loadingPurchasedTools ? <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Đang kiểm tra...</div> : (
              <div className="space-y-4">
                {!userGistData || userGistData.length === 0 ? <div className="bg-[#06090E] p-6 rounded-2xl text-center text-xs text-slate-400">Chưa có bản quyền Tool nào.</div> : userGistData.map((toolAcc: any, idx: number) => (
                  <div key={idx} className="bg-[#06090E] border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="font-black text-white text-base uppercase">{toolAcc.toolName}</h4>
                      {renderRemainingTime(toolAcc.expire_timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showRechargeModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4"><div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><CreditCard className="w-5 h-5" /></div><div><h3 className="text-base font-black text-white">NẠP TIỀN VÀO VÍ TỰ ĐỘNG</h3></div></div>
            <div className="grid grid-cols-3 gap-2">{['20000', '50000', '100000', '200000', '500000', '1000000'].map((amt) => (<button key={amt} onClick={() => setRechargeAmount(amt)} className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${rechargeAmount === amt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#06090E] border-slate-800 text-slate-400'}`}>{Number(amt).toLocaleString('vi-VN')}đ</button>))}</div>
            <div className="bg-[#06090E] border border-slate-800 p-4 rounded-2xl flex flex-col items-center space-y-3 text-center"><img src={`https://qr.sepay.vn/img?bank=BIDV&acc=96247JFG2G&template=compact&amount=${rechargeAmount}&des=${encodeURIComponent(`NAP ${currentUser.username}`)}`} alt="QR SePay" className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg" /><button onClick={() => copyToClipboard(`NAP ${currentUser.username}`)} className="font-black text-cyan-400 text-xs flex items-center gap-1 hover:underline cursor-pointer">Nội dung CK: NAP {currentUser.username} {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}</button></div>
          </div>
        </div>
      )}

      {showHistoryModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-lg rounded-3xl p-6 space-y-5 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <button onClick={() => setShowHistoryModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4"><div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><History className="w-5 h-5" /></div><div><h3 className="text-base font-black text-white">LỊCH SỬ GIAO DỊCH</h3></div></div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {userTransactions.length === 0 ? <div className="text-center text-slate-500 text-xs py-4">Chưa có giao dịch.</div> : userTransactions.map((log: any, idx: number) => (
                <div key={idx} className="bg-[#06090E] border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                  <div><span className="font-bold text-white">{log.title}</span><span className="text-[10px] text-slate-500 block">{log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ''}</span></div>
                  <span className={log.amount > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{(log.amount).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAccountInfoModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-sm rounded-3xl p-6 space-y-5 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <button onClick={() => setShowAccountInfoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="text-center space-y-2"><div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto text-2xl font-black">{currentUser.username.substring(0, 1).toUpperCase()}</div><h3 className="text-lg font-black text-white">{currentUser.username}</h3></div>
            <div className="bg-[#06090E] border border-slate-800 rounded-2xl p-4 text-xs flex justify-between"><span className="text-slate-400">Số dư ví:</span><b className="text-emerald-400">{(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ</b></div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="text-center space-y-2"><h2 className="text-xl font-black text-white">{authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}</h2></div>
            {authMsg && <div className={`p-3.5 rounded-xl text-xs font-bold ${authMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}><span>{authMsg.text}</span></div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-300 mb-1">Tên tài khoản</label><input type="text" required placeholder="Nhập username..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-[#06090E] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition" /></div>
              <div><label className="block text-xs font-bold text-slate-300 mb-1">Mật khẩu</label><input type="password" required placeholder="Nhập mật khẩu..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-[#06090E] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition" /></div>
              {authMode === 'register' && <div><label className="block text-xs font-bold text-slate-300 mb-1">Nhập lại mật khẩu</label><input type="password" required placeholder="Xác nhận mật khẩu..." value={rePasswordInput} onChange={(e) => setRePasswordInput(e.target.value)} className="w-full bg-[#06090E] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition" /></div>}
              <button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs transition cursor-pointer mt-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">{loading ? 'ĐANG XỬ LÝ...' : authMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN NGAY'}</button>
            </form>
            <div className="text-center pt-2 border-t border-slate-800">
              {authMode === 'login' ? <p className="text-xs text-slate-400">Chưa có tài khoản? <button onClick={() => { setAuthModalMode('register'); resetForm(); }} className="text-cyan-400 font-bold hover:underline cursor-pointer">Đăng ký ngay</button></p> : <p className="text-xs text-slate-400">Đã có tài khoản? <button onClick={() => { setAuthModalMode('login'); resetForm(); }} className="text-cyan-400 font-bold hover:underline cursor-pointer">Đăng nhập</button></p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}