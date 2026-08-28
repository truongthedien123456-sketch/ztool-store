'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  User, Lock, LogIn, UserPlus, LogOut, Wallet, X, AlertCircle, CheckCircle2,
  PlusCircle, History, Calendar, CreditCard, Copy, Check, ChevronDown, Key, ArrowUpRight, ArrowDownLeft, Loader2, Wrench, Clock, RefreshCw, Download, Crown, CalendarCheck, Gift, Bell, Home, FolderKanban, Sparkles, Eye, EyeOff, ShieldCheck, Zap, ShoppingBag, Mail, Send, ShieldAlert, Shield, Award, ChevronRight, Gem, Flame, Star, HelpCircle, CheckCircle, Hourglass
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
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rePasswordInput, setRePasswordInput] = useState('');
  const [authMsg, setAuthMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals Tính Năng
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [showPurchasedToolsModal, setShowPurchasedToolsModal] = useState(false);
  const [showVipBenefitsModal, setShowVipBenefitsModal] = useState(false);
  
  // Profile Tabs (info | email | password)
  const [profileTab, setProfileTab] = useState<'info' | 'email' | 'password'>('info');

  // Đổi mật khẩu
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Tổng tiền nạp tích lũy tính VIP
  const [totalDeposited, setTotalDeposited] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedUserStr = localStorage.getItem('ztool_user_data');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          return Number(parsed.total_deposited) || 0;
        } catch (e) {}
      }
    }
    return 0;
  });

  // Trạng thái Xác thực Email trong Modal Account Info
  const [accountEmailInput, setAccountEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [emailActionMsg, setEmailActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailActionLoading, setEmailActionLoading] = useState(false);

  // Trạng thái ẩn/hiện password tool & copied
  const [showToolPasswords, setShowToolPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  // State Sự kiện nạp tiền đồng bộ từ Database
  const [rechargeEvent, setRechargeEvent] = useState<{ percent: number; active: boolean }>({ percent: 0, active: false });

  // Dữ liệu Gist và Lịch sử
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userGistData, setUserGistData] = useState<any[] | null>(null);
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [loadingPurchasedTools, setLoadingPurchasedTools] = useState(false);
  const [nowTime, setNowTime] = useState(Date.now());

  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    if (pathname) setCurrentPath(pathname);
  }, [pathname]);

  useEffect(() => {
    checkLoggedInUser();
    loadAllToolsMeta();
    loadRechargeEventSettings();

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

  const loadRechargeEventSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('bonus_percent, bonus_active').eq('id', 1).single();
      if (data) {
        setRechargeEvent({
          percent: Number(data.bonus_percent) || 0,
          active: data.bonus_active === true
        });
      }
    } catch (e) {}
  };

  const loadAllToolsMeta = async () => {
    const { data } = await supabase.from('tools').select('*');
    if (data) {
      setToolsList(data);
    }
  };

  const checkTodayCheckInStatus = async (username: string) => {
    const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const localChecked = localStorage.getItem(`ztool_checkin_${todayStr}`);
    if (localChecked === 'true') {
      setHasCheckedInToday(true);
      return;
    }

    try {
      const { data: lastCheckIn } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('username', username)
        .eq('type', 'CHECKIN')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastCheckIn && lastCheckIn.length > 0) {
        const lastCheckInDate = new Date(lastCheckIn[0].created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
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
      console.error('Lỗi kiểm tra trạng thái điểm danh:', err);
    }
  };

  // Tối ưu hoá truy vấn tài khoản với Cache LocalStorage
  const checkLoggedInUser = async () => {
    const savedUser = localStorage.getItem('ztool_current_user');
    if (savedUser) {
      const cachedData = localStorage.getItem('ztool_user_data');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.username === savedUser) {
            setCurrentUser(parsed);
            setAccountEmailInput(parsed.email || '');
            setTotalDeposited(Number(parsed.total_deposited) || 0);
            return;
          }
        } catch (e) {}
      }

      const { data } = await supabase
        .from('users')
        .select('id, username, email, password, balance, is_verified, is_exempt, isBanned, total_deposited')
        .eq('username', savedUser)
        .single();

      if (data) {
        if (data.isBanned) {
          alert('Tài khoản của bạn đã bị khóa!');
          handleLogout();
          return;
        }
        setCurrentUser(data);
        setAccountEmailInput(data.email || '');
        setTotalDeposited(Number(data.total_deposited) || 0);
        localStorage.setItem('ztool_user_data', JSON.stringify(data));
        checkTodayCheckInStatus(data.username);
      } else {
        handleLogout();
      }
    } else {
      setCurrentUser(null);
    }
  };

  // Cấu hình Bậc VIP
  const getVipInfo = (amount: number) => {
    if (amount >= 5000000) {
      return {
        level: 5,
        title: 'VIP 5 - HUYỀN THOẠI',
        sub: 'Kim Cương Đỏ Tối Thượng',
        color: 'text-rose-400',
        badgeBg: 'bg-gradient-to-r from-rose-600/30 via-pink-600/30 to-amber-500/30 border-rose-400 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse',
        border: 'border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        avatarBg: 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]',
        icon: Flame,
        nextGoal: 5000000,
        progress: 100,
      };
    }
    if (amount >= 3000000) {
      return {
        level: 4,
        title: 'VIP 4 - BẠCH KIM',
        sub: 'Hoàng Gia Tối Cao',
        color: 'text-purple-300',
        badgeBg: 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-pulse',
        border: 'border-2 border-purple-500/80 shadow-[0_0_18px_rgba(168,85,247,0.25)]',
        avatarBg: 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]',
        icon: Gem,
        nextGoal: 5000000,
        progress: Math.min(100, Math.round(((amount - 3000000) / (5000000 - 3000000)) * 100)),
      };
    }
    if (amount >= 2000000) {
      return {
        level: 3,
        title: 'VIP 3 - HOÀNG KIM',
        sub: 'Thương Gia Cao Cấp',
        color: 'text-amber-300',
        badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/60 text-amber-300',
        border: 'border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.2)]',
        avatarBg: 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950',
        icon: Crown,
        nextGoal: 3000000,
        progress: Math.min(100, Math.round(((amount - 2000000) / (3000000 - 2000000)) * 100)),
      };
    }
    if (amount >= 1000000) {
      return {
        level: 2,
        title: 'VIP 2 - TINH ANH',
        sub: 'Hiệp Sĩ Bạc Ánh Thép',
        color: 'text-cyan-300',
        badgeBg: 'bg-gradient-to-r from-slate-400/20 to-cyan-500/20 border-cyan-400/50 text-cyan-300',
        border: 'border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
        avatarBg: 'bg-gradient-to-tr from-slate-400 via-cyan-400 to-blue-500 text-slate-950',
        icon: Star,
        nextGoal: 2000000,
        progress: Math.min(100, Math.round(((amount - 1000000) / (2000000 - 1000000)) * 100)),
      };
    }
    if (amount >= 500000) {
      return {
        level: 1,
        title: 'VIP 1 - ĐỒNG NEON',
        sub: 'Chiến Binh Mới Nổi',
        color: 'text-orange-400',
        badgeBg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/50 text-orange-300',
        border: 'border-2 border-orange-400/70 shadow-[0_0_12px_rgba(249,115,22,0.2)]',
        avatarBg: 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white',
        icon: Award,
        nextGoal: 1000000,
        progress: Math.min(100, Math.round(((amount - 500000) / (1000000 - 500000)) * 100)),
      };
    }
    return {
      level: 0,
      title: 'THÀNH VIÊN',
      sub: 'Tài Khoản Chuẩn',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      border: 'border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      avatarBg: 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950',
      icon: User,
      nextGoal: 500000,
      progress: Math.min(100, Math.round((amount / 500000) * 100)),
    };
  };

  const vipInfo = getVipInfo(totalDeposited);
  const VipIcon = vipInfo.icon;

  const VIP_TIERS_DATA = [
    {
      level: 0,
      title: 'THÀNH VIÊN',
      req: 'Nạp từ 0đ',
      icon: User,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      cardBg: 'bg-[#080E18] border-slate-800',
      benefits: [
        'Đặc quyền Khung viền & Avatar Thành viên cơ bản',
        'Điểm danh nhận +1.000đ/ngày vào ví',
        'Mua và kích hoạt key tool tự động 24/7',
        'Hỗ trợ qua kênh Ticket / Live chat cơ bản'
      ]
    },
    {
      level: 1,
      title: 'VIP 1 - ĐỒNG NEON',
      req: 'Tổng nạp từ 500.000đ',
      icon: Award,
      color: 'text-orange-400',
      badgeBg: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
      cardBg: 'bg-[#0C0E14] border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]',
      benefits: [
        'Đặc quyền Khung viền & Avatar Đồng Neon phát sáng',
        'Đặc quyền ưu tiên nạp tiền tự động tốc độ cao',
        'Bao gồm toàn bộ quyền lợi của cấp Thành viên'
      ]
    },
    {
      level: 2,
      title: 'VIP 2 - TINH ANH',
      req: 'Tổng nạp từ 1.000.000đ',
      icon: Star,
      color: 'text-cyan-300',
      badgeBg: 'bg-slate-400/20 border-cyan-400/50 text-cyan-300',
      cardBg: 'bg-[#060F1A] border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      benefits: [
        'Đặc quyền Khung viền & Avatar Hiệp Sĩ Bạc Tinh Anh',
        'Đặc quyền ưu tiên hỗ trợ các vấn đề về tool',
        'Hỗ trợ cài đặt và fix lỗi trực tiếp qua Ultraviewer 1-1',
        'Bao gồm toàn bộ quyền lợi của cấp VIP 1'
      ]
    },
    {
      level: 3,
      title: 'VIP 3 - HOÀNG KIM',
      req: 'Tổng nạp từ 2.000.000đ',
      icon: Crown,
      color: 'text-amber-300',
      badgeBg: 'bg-amber-500/20 border-amber-500/60 text-amber-300',
      cardBg: 'bg-[#121008] border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.18)]',
      benefits: [
        'Đặc quyền Khung viền & Avatar Hoàng Kim',
        'Đặc quyền được trải nghiệm các bản Beta Tool sớm nhất',
        'Hỗ trợ Reset HWID (đổi máy) không giới hạn qua Admin',
        'Bao gồm toàn bộ quyền lợi của cấp VIP 2'
      ]
    },
    {
      level: 4,
      title: 'VIP 4 - BẠCH KIM',
      req: 'Tổng nạp từ 3.000.000đ',
      icon: Gem,
      color: 'text-purple-300',
      badgeBg: 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.7)]',
      cardBg: 'bg-[#110B1C] border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.22)]',
      benefits: [
        'Đặc quyền Khung viền & Avatar Bạch Kim Tối Cao phát sáng',
        'Đặc quyền kênh chat support riêng biệt 1-1 trực tiếp với Admin',
        'Tặng Key dùng thử 3 ngày miễn phí cho tất cả Tool mới',
        'Bao gồm toàn bộ quyền lợi của cấp VIP 3'
      ]
    },
    {
      level: 5,
      title: 'VIP 5 - HUYỀN THOẠI',
      req: 'Tổng nạp từ 5.000.000đ',
      icon: Flame,
      color: 'text-rose-400',
      badgeBg: 'bg-gradient-to-r from-rose-600/40 to-amber-500/40 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.7)]',
      cardBg: 'bg-gradient-to-b from-[#180A10] to-[#0A060A] border-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.3)]',
      benefits: [
        'Đặc quyền Khung viền & Avatar Kim Cương Đỏ Huyền Thoại Tối Thượng',
        'ĐẶC QUYỀN TỐI THƯỢNG TOÀN SHOP',
        'Quyền yêu cầu tính năng Tool riêng theo yêu cầu',
        'Bảo hành 1 đổi 1 & hỗ trợ kỹ thuật VIP 24/7 trọn đời'
      ]
    }
  ];

  const nextTierIndex = Math.min(5, vipInfo.level < 5 ? vipInfo.level + 1 : 5);
  const nextTierData = VIP_TIERS_DATA[nextTierIndex];
  const NextTierIcon = nextTierData.icon;

  const handleDailyCheckIn = async () => {
    if (!currentUser) return;
    setCheckInMsg(null);
    setCheckInLoading(true);

    try {
      const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      const { data: checkinLogs } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('username', currentUser.username)
        .eq('type', 'CHECKIN')
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkinLogs && checkinLogs.length > 0) {
        const lastCheckInDate = new Date(checkinLogs[0].created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        if (lastCheckInDate === todayStr) {
          setHasCheckedInToday(true);
          localStorage.setItem(`ztool_checkin_${todayStr}`, 'true');
          setCheckInMsg({ type: 'error', text: 'Bạn đã điểm danh hôm nay rồi. Hãy quay lại vào ngày mai nhé!' });
          setCheckInLoading(false);
          return;
        }
      }

      const rewardAmount = 1000;
      const newBalance = Number(currentUser.balance || 0) + rewardAmount;
      
      const { error: updateErr } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('username', currentUser.username);

      if (updateErr) throw updateErr;

      await supabase.from('transactions').insert([{ 
        username: currentUser.username, 
        type: 'CHECKIN', 
        title: `Điểm danh hàng ngày (+1.000 VNĐ)`, 
        amount: rewardAmount, 
        status: 'Thành công' 
      }]);

      const updatedUser = { ...currentUser, balance: newBalance };
      setCurrentUser(updatedUser);
      localStorage.setItem('ztool_user_data', JSON.stringify(updatedUser));
      setHasCheckedInToday(true);
      localStorage.setItem(`ztool_checkin_${todayStr}`, 'true');
      setCheckInMsg({ type: 'success', text: `Điểm danh thành công! Bạn nhận được +1,000 VNĐ vào ví.` });

    } catch (err: any) {
      console.error('Lỗi điểm danh:', err);
      setCheckInMsg({ type: 'error', text: `Lỗi điểm danh: ${err.message || 'Hệ thống gián đoạn'}` });
    } finally {
      setCheckInLoading(false);
    }
  };

  const loadUserGistData = async (username: string) => {
    setLoadingPurchasedTools(true);
    try {
      // 1. Luôn tải danh sách tools mới nhất trực tiếp từ Supabase để lấy link tải mới
      const { data: latestTools } = await supabase.from('tools').select('*');
      const currentTools = latestTools && latestTools.length > 0 ? latestTools : toolsList;
      if (latestTools) setToolsList(latestTools);

      // 2. Tải danh sách bản quyền từ Gist API
      const res = await fetch('/api/get-gist', { 
        cache: 'no-store', 
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } 
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const parsed = result.data;
          const cleanUser = username.trim().toLowerCase();

          const matchedKeys = Object.keys(parsed).filter(k => {
            const cleanKey = k.trim().toLowerCase();
            return cleanKey === cleanUser || cleanKey.startsWith(`${cleanUser}_`);
          });

          if (matchedKeys.length > 0) {
            const purchasedList = matchedKeys.map(k => {
              const item = parsed[k];
              const tCode = item.tool_code || item.toolCode || '';
              
              const foundTool = currentTools.find(t => {
                const codeA = (t.toolCode || t.tool_code || '').trim().toLowerCase();
                const codeB = tCode.trim().toLowerCase();
                return codeA === codeB;
              });

              return {
                accountKey: k,
                appUsername: k,
                appPassword: item.password || '---',
                toolCode: tCode,
                toolName: foundTool ? foundTool.name : (tCode ? `TOOL AUTO (${tCode.toUpperCase()})` : 'TOOL AUTOMATION'),
                downloadLink: foundTool ? (foundTool.downloadLink || foundTool.download_link || '') : '',
                expire_timestamp: item.expire_timestamp || 0,
                device_id: item.device_id || ''
              };
            });
            setUserGistData(purchasedList);
          } else {
            setUserGistData(null);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi đọc tài khoản Gist:', err);
    } finally {
      setLoadingPurchasedTools(false);
    }
  };

  const loadUserTransactionsFromCloud = async (username: string) => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, username, title, amount, type, status, created_at')
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
        <span className="text-cyan-300 font-black bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 px-3.5 py-1.5 rounded-xl border border-cyan-400/50 text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] inline-flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-cyan-300" /> Vĩnh Viễn
        </span>
      );
    }

    const nowSec = Math.floor(nowTime / 1000);
    const diffSec = expireTimestamp - nowSec;

    if (diffSec <= 0) {
      return (
        <span className="text-rose-400 font-black bg-rose-500/20 px-3.5 py-1.5 rounded-xl border border-rose-500/50 text-xs inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
          ⚠️ Đã Hết Hạn
        </span>
      );
    }

    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return (
      <span className="text-emerald-300 font-mono font-black bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-400/50 text-xs inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
        {days > 0 && `${days}d `}{hours}h {minutes}m {seconds}s
      </span>
    );
  };

  const handleOpenRenewModal = (toolCode: string) => {
    setShowPurchasedToolsModal(false);
    
    if (pathname === '/tools') {
      const event = new CustomEvent('open-buy-tool-modal', { detail: { toolCode } });
      window.dispatchEvent(event);
    } else {
      router.push(`/tools`);
      setTimeout(() => {
        const event = new CustomEvent('open-buy-tool-modal', { detail: { toolCode } });
        window.dispatchEvent(event);
      }, 400);
    }
  };

  const copyTextToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCopyField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
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
      if (!emailInput.trim() || !emailInput.includes('@')) {
        setLoading(false);
        setAuthMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ Gmail hợp lệ!' });
        return;
      }

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
        setAuthMsg({ type: 'error', text: 'Tên tài khoản này đã tồn tại trên hệ thống!' });
        return;
      }

      const { data: existingEmailUser } = await supabase
        .from('users')
        .select('username')
        .eq('email', emailInput.trim().toLowerCase())
        .single();

      if (existingEmailUser) {
        setLoading(false);
        setAuthMsg({ type: 'error', text: 'Địa chỉ Email này đã được đăng ký cho một tài khoản khác!' });
        return;
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ 
          username: usernameInput.trim(), 
          email: emailInput.trim().toLowerCase(), 
          is_verified: false, 
          is_exempt: false, 
          password: passwordInput, 
          balance: 0, 
          isBanned: false, 
          total_deposited: 0 
        }])
        .select()
        .single();

      setLoading(false);

      if (error) {
        setAuthMsg({ type: 'error', text: 'Lỗi đăng ký: ' + error.message });
      } else {
        localStorage.setItem('ztool_current_user', newUser.username);
        localStorage.setItem('ztool_user_data', JSON.stringify(newUser));
        setCurrentUser(newUser);
        setTotalDeposited(0);
        setAccountEmailInput(newUser.email || '');

        await supabase.from('transactions').insert([{ username: newUser.username, type: 'INIT', title: 'Khởi tạo tài khoản thành công', amount: 0, status: 'Thành công' }]);

        setAuthMsg({ type: 'success', text: 'Đăng ký tài khoản thành công!' });
        setTimeout(() => { 
          setShowAuthModal(false); 
          resetForm(); 
          checkTodayCheckInStatus(newUser.username); 
          setShowAccountInfoModal(true); 
        }, 500);
      }
    } else {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, password, balance, is_verified, is_exempt, isBanned, total_deposited')
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
      setTotalDeposited(Number(user.total_deposited) || 0);
      setAccountEmailInput(user.email || '');

      setAuthMsg({ type: 'success', text: 'Đăng nhập thành công!' });
      setTimeout(() => { 
        setShowAuthModal(false); 
        resetForm(); 
        checkTodayCheckInStatus(user.username); 
      }, 500);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg(null);
    if (!oldPass || !newPass || !confirmPass) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đầy đủ các thông tin mật khẩu!' });
      return;
    }

    if (currentUser?.password !== oldPass) {
      setPassMsg({ type: 'error', text: 'Mật khẩu hiện tại không chính xác!' });
      return;
    }

    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setPassLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ password: newPass })
      .eq('username', currentUser.username);

    setPassLoading(false);

    if (error) {
      setPassMsg({ type: 'error', text: `Lỗi cập nhật mật khẩu: ${error.message}` });
    } else {
      const updatedUser = { ...currentUser, password: newPass };
      setCurrentUser(updatedUser);
      localStorage.setItem('ztool_user_data', JSON.stringify(updatedUser));
      setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  const handleSendEmailOTP = async () => {
    setEmailActionMsg(null);
    const targetEmail = accountEmailInput.trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setEmailActionMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ Gmail hợp lệ!' });
      return;
    }

    setEmailActionLoading(true);

    const { data: duplicateEmailUser } = await supabase
      .from('users')
      .select('username')
      .eq('email', targetEmail)
      .neq('username', currentUser.username)
      .single();

    if (duplicateEmailUser) {
      setEmailActionLoading(false);
      setEmailActionMsg({ type: 'error', text: 'Địa chỉ Email này đã được đăng ký bởi tài khoản khác!' });
      return;
    }

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, username: currentUser.username })
      });
      const data = await res.json();
      setEmailActionLoading(false);

      if (data.success) {
        setIsOtpSent(true);
        setEmailActionMsg({ type: 'success', text: data.message });
      } else {
        setEmailActionMsg({ type: 'error', text: data.message || 'Lỗi gửi mã OTP' });
      }
    } catch (err: any) {
      setEmailActionLoading(false);
      setEmailActionMsg({ type: 'error', text: `Lỗi kết nối: ${err.message}` });
    }
  };

  const handleVerifyEmailOTP = async () => {
    setEmailActionMsg(null);
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setEmailActionMsg({ type: 'error', text: 'Vui lòng nhập đúng 6 chữ số mã OTP!' });
      return;
    }

    setEmailActionLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountEmailInput.trim().toLowerCase(), username: currentUser.username, otp: otpInput.trim() })
      });
      const data = await res.json();
      setEmailActionLoading(false);

      if (data.success) {
        setEmailActionMsg({ type: 'success', text: 'Xác thực tài khoản thành công!' });
        setIsOtpSent(false);
        setOtpInput('');
        
        localStorage.removeItem('ztool_user_data');
        await checkLoggedInUser();
      } else {
        setEmailActionMsg({ type: 'error', text: data.message || 'Mã OTP không đúng!' });
      }
    } catch (err: any) {
      setEmailActionLoading(false);
      setEmailActionMsg({ type: 'error', text: `Lỗi kết nối: ${err.message}` });
    }
  };

  const handleLogout = () => {
    const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    localStorage.removeItem('ztool_current_user');
    localStorage.removeItem('ztool_user_data');
    localStorage.removeItem(`ztool_checkin_${todayStr}`);
    setCurrentUser(null);
    setShowUserDropdown(false);
    setHasCheckedInToday(false);
  };

  const resetForm = () => {
    setUsernameInput('');
    setEmailInput('');
    setPasswordInput('');
    setRePasswordInput('');
    setAuthMsg(null);
  };

  const isExempt = currentUser?.is_exempt === true;
  const isVerified = currentUser?.is_verified === true || isExempt;

  // Tính số tiền thực nhận sau khuyến mãi
  const bonusMultiplier = (rechargeEvent.active && rechargeEvent.percent > 0) ? (1 + rechargeEvent.percent / 100) : 1;
  const actualReceivedAmount = Math.round(Number(rechargeAmount) * bonusMultiplier);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-[#080D15]/95 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-40 px-4 sm:px-8 lg:px-12 py-4 sm:py-4.5 shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all">
        <div className="max-w-[1550px] mx-auto flex items-center justify-between gap-6">
          
          {/* LOGO ZTOOL GLOW */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
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

          {/* MENU ĐIỀU HƯỚNG */}
          <div className="hidden md:flex items-center gap-2 bg-[#0D131F]/90 border border-slate-800/90 p-1.5 rounded-2xl shadow-inner">
            {[
              { name: 'Trang chủ', path: '/', icon: Home },
              { name: 'TOOL AUTO', path: '/tools', icon: Wrench },
              { name: 'Dự án', path: '/projects', icon: FolderKanban },
              { name: 'Hướng dẫn', path: '/huong-dan-kich-hoat', icon: HelpCircle }
            ].map((item) => {
              const isActive = currentPath === item.path;
              const IconComp = item.icon;
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.45)] font-black' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* CỤM ĐIỂM DANH, NẠP TIỀN & USER CARD */}
          <div className="flex items-center gap-3.5 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                
                {/* NÚT ĐIỂM DANH */}
                <button
                  onClick={() => { setCheckInModalShow(true); setCheckInMsg(null); }}
                  className={`relative group overflow-hidden border px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    hasCheckedInToday
                      ? 'bg-[#0D131F] border-slate-800 text-slate-400 hover:border-slate-700'
                      : 'bg-[#0D131F] border-cyan-500/50 hover:border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.04]'
                  }`}
                >
                  <Gift className={`w-4 h-4 ${hasCheckedInToday ? 'text-slate-500' : 'text-cyan-400 group-hover:animate-bounce'}`} />
                  <span className="font-extrabold hidden sm:inline">
                    {hasCheckedInToday ? 'Đã điểm danh' : 'Điểm danh'}
                  </span>
                  {!hasCheckedInToday && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>

                {/* NÚT NẠP TIỀN CÓ HIỂN THỊ BADGE KHUYẾN MÃI NẾU BẬT */}
                <button
                  onClick={() => { loadRechargeEventSettings(); setShowRechargeModal(true); }}
                  className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] transition duration-300 hover:scale-[1.03] cursor-pointer border border-emerald-300/50"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" /> Nạp tiền
                  {rechargeEvent.active && rechargeEvent.percent > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-bounce shadow-md">
                      +{rechargeEvent.percent}%
                    </span>
                  )}
                </button>

                {/* Ô THÔNG TIN KHÁCH HÀNG */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center gap-3 bg-[#0D131F]/95 p-1.5 pr-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group backdrop-blur-md relative ${vipInfo.border}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-inner relative ${vipInfo.avatarBg}`}>
                      {currentUser.username.substring(0, 1).toUpperCase()}
                    </div>
                    
                    <div className="text-left text-xs leading-tight flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white group-hover:text-cyan-300 transition truncate max-w-[85px]">
                          {currentUser.username}
                        </span>
                        
                        {vipInfo.level > 0 && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${vipInfo.badgeBg}`}>
                            V{vipInfo.level}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-black block mt-0.5 font-mono">
                        {(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition duration-300 ml-0.5 ${showUserDropdown ? 'rotate-180 text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                  </button>

                  {/* USER DROPDOWN MENU */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2.5 w-64 bg-[#0D121D] border border-slate-800 rounded-3xl p-2.5 shadow-2xl space-y-1 z-50 backdrop-blur-2xl">
                      <button 
                        onClick={() => { 
                          setShowUserDropdown(false); 
                          setProfileTab('info'); 
                          setShowAccountInfoModal(true); 
                        }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                      >
                        <User className="w-4 h-4 text-cyan-400" /> Thông tin & Cấp bậc VIP
                      </button>

                      <button 
                        onClick={() => { 
                          setShowUserDropdown(false); 
                          if (currentUser) loadUserGistData(currentUser.username); 
                          setShowPurchasedToolsModal(true); 
                        }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                      >
                        <Wrench className="w-4 h-4 text-cyan-300" /> Tool đã mua
                      </button>

                      <button 
                        onClick={() => { 
                          setShowUserDropdown(false); 
                          if (currentUser) loadUserTransactionsFromCloud(currentUser.username); 
                          setShowHistoryModal(true); 
                        }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                      >
                        <History className="w-4 h-4 text-emerald-400" /> Lịch sử giao dịch
                      </button>

                      <div className="border-t border-slate-800/80 my-1" />
                      <button 
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button onClick={() => { setAuthModalMode('login'); resetForm(); setShowAuthModal(true); }} className="bg-[#0D121D] border border-cyan-500/40 hover:border-cyan-400 text-slate-100 text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm">
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

      {/* ================= MODAL NẠP TIỀN ================= */}
      {showRechargeModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0F18] border-2 border-cyan-400/80 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_60px_rgba(6,182,212,0.35)] max-h-[92vh] overflow-y-auto">
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-2xl bg-[#05080E] border border-slate-800 cursor-pointer hover:border-cyan-400 transition"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CreditCard className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-wide">NẠP TIỀN TỰ ĐỘNG 24/7</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Zap className="w-3 h-3" /> DUYỆT 5-30 GIÂY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Quét mã QR qua ứng dụng ngân hàng để được cộng tiền tự động</p>
              </div>
            </div>

            {/* BANNER SỰ KIỆN KHUYẾN MÃI NẠP NẾU ĐANG BẬT */}
            {rechargeEvent.active && rechargeEvent.percent > 0 && (
              <div className="bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-orange-500/20 border-2 border-amber-400/60 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(251,191,36,0.2)] animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center text-amber-300">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wide block">
                      🔥 ĐANG DIỄN RA SỰ KIỆN KHUYẾN MÃI +{rechargeEvent.percent}% NẠP TIỀN!
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Cộng thêm ngay <b className="text-emerald-400">+{rechargeEvent.percent}%</b> giá trị nạp vào số dư ví của bạn.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black font-mono bg-amber-400 text-slate-950 px-3 py-1 rounded-xl shrink-0 shadow-md">
                  +{rechargeEvent.percent}%
                </span>
              </div>
            )}

            {/* Chọn số tiền nạp nhanh */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Chọn nhanh số tiền nạp:</span>
                {rechargeEvent.active && rechargeEvent.percent > 0 && (
                  <span className="text-amber-300 text-[11px] font-bold">Thực nhận sau khuyến mãi:</span>
                )}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['20000', '50000', '100000', '200000', '500000', '1000000'].map((amt) => {
                  const bonusAmt = Math.round(Number(amt) * bonusMultiplier);
                  return (
                    <button 
                      key={amt} 
                      onClick={() => setRechargeAmount(amt)} 
                      className={`py-2.5 px-2 rounded-2xl border text-xs font-extrabold transition cursor-pointer text-center font-mono flex flex-col items-center justify-center ${
                        rechargeAmount === amt 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-300' 
                          : 'bg-[#05080E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{Number(amt).toLocaleString('vi-VN')}đ</span>
                      {rechargeEvent.active && rechargeEvent.percent > 0 && (
                        <span className={`text-[9px] font-black ${rechargeAmount === amt ? 'text-slate-950' : 'text-amber-400'}`}>
                          🎁={bonusAmt.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khung Mã QR và Thông Tin Ngân Hàng */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#05080E] border border-slate-800/90 p-5 rounded-3xl shadow-inner">
              
              {/* QR Code */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0A0F18] border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <img 
                  src={`https://qr.sepay.vn/img?bank=BIDV&acc=96247JFG2G&template=compact&amount=${rechargeAmount}&des=${encodeURIComponent(`NAP ${currentUser.username}`)}`} 
                  alt="QR SePay" 
                  className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg object-contain" 
                />
                <div className="text-center mt-2">
                  <span className="text-[11px] font-black text-slate-400 block font-mono">
                    Số tiền thanh toán: <b className="text-white">{Number(rechargeAmount).toLocaleString('vi-VN')}đ</b>
                  </span>
                  {rechargeEvent.active && rechargeEvent.percent > 0 && (
                    <span className="text-[11px] font-black text-emerald-400 block font-mono">
                      Thực nhận vào ví: <b>{actualReceivedAmount.toLocaleString('vi-VN')} VNĐ</b>
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ngân hàng thụ hưởng</span>
                  <div className="bg-[#0A0F18] border border-slate-800 px-3.5 py-2 rounded-xl text-white font-bold flex items-center justify-between">
                    <span>BIDV (Ngân hàng TMCP Đầu tư và Phát triển)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Số tài khoản</span>
                  <div className="bg-[#0A0F18] border border-slate-800 px-3.5 py-2 rounded-xl font-mono font-black text-cyan-300 flex items-center justify-between">
                    <span className="text-sm">96247JFG2G</span>
                    <button 
                      onClick={() => handleCopyField('96247JFG2G', 'stk')}
                      className="text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'stk' ? <span className="text-emerald-400 font-sans">Đã chép!</span> : <><Copy className="w-3.5 h-3.5" /> Sao chép</>}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    Nội dung chuyển khoản (BẮT BUỘC CHÍNH XÁC)
                  </span>
                  <div className="bg-[#0A0F18] border-2 border-cyan-500/50 px-3.5 py-2 rounded-xl font-mono font-black text-amber-300 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <span className="text-sm">NAP {currentUser.username}</span>
                    <button 
                      onClick={() => handleCopyField(`NAP ${currentUser.username}`, 'memo')}
                      className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'memo' ? <span className="text-emerald-400 font-sans">Đã chép!</span> : <><Copy className="w-3.5 h-3.5" /> Chép cú pháp</>}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                  * Lưu ý: Hãy ghi chính xác cú pháp chuyển khoản để hệ thống tự động cộng tiền và thưởng khuyến mãi ngay sau khi giao dịch thành công.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL THÔNG TIN CÁ NHÂN & VIP ================= */}
      {showAccountInfoModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className={`bg-[#0A0F18] ${vipInfo.border} w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_60px_rgba(6,182,212,0.3)] text-slate-200 max-h-[92vh] overflow-y-auto`}>
            
            <button onClick={() => { setShowAccountInfoModal(false); setEmailActionMsg(null); setIsOtpSent(false); setPassMsg(null); }} className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-2xl bg-[#05080E] border border-slate-800 cursor-pointer hover:border-cyan-400 transition"><X className="w-5 h-5" /></button>
            
            {/* Header Avatar & Badge VIP */}
            <div className="text-center flex flex-col items-center gap-3 pt-2">
              <div className={`w-20 h-20 rounded-3xl p-1 flex items-center justify-center text-3xl font-black ${vipInfo.avatarBg}`}>
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
              
              <div className="pt-0.5">
                <span className={`text-[11px] font-black px-4 py-1.5 rounded-full border flex items-center gap-1.5 shadow-lg whitespace-nowrap ${vipInfo.badgeBg}`}>
                  <VipIcon className={`w-4 h-4 ${vipInfo.color}`} />
                  <span className={vipInfo.color}>{vipInfo.title}</span>
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-2xl font-black text-white tracking-wide">{currentUser.username}</h3>
                <p className="text-xs text-slate-400 font-medium">{vipInfo.sub}</p>
              </div>
            </div>

            {/* TAB CHUYỂN ĐỔI CHỨC NĂNG */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#05080E] p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setProfileTab('info')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === 'info' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Tổng quan
              </button>

              <button
                onClick={() => setProfileTab('password')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === 'password' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" /> Đổi mật khẩu
              </button>

              <button
                onClick={() => setProfileTab('email')}
                className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === 'email' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Gmail OTP
              </button>
            </div>

            {/* TAB 1: TỔNG QUAN VÍ & TIẾN TRÌNH VIP */}
            {profileTab === 'info' && (
              <div className="space-y-4">
                <div className="bg-[#05080E] border border-slate-800/90 p-4.5 rounded-2xl flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Số dư hiện tại</span>
                    <b className="text-xl text-emerald-400 font-mono font-black">{(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ</b>
                  </div>
                  <button 
                    onClick={() => { setShowAccountInfoModal(false); setShowRechargeModal(true); }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Nạp thêm
                  </button>
                </div>

                {/* KHUNG TIẾN TRÌNH VIP */}
                <div className="bg-[#05080E] border border-slate-800/90 p-4.5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" /> Tích luỹ nạp thực tế:
                    </span>
                    <b className="text-cyan-300 font-mono font-black">{totalDeposited.toLocaleString('vi-VN')} VNĐ</b>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full bg-[#0A0F18] border border-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${vipInfo.avatarBg}`} 
                        style={{ width: `${vipInfo.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span>Tiến độ cấp hiện tại</span>
                      <span className="text-cyan-400 font-mono">{vipInfo.progress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    {vipInfo.level < 5 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        Cần nạp thêm <b className="text-amber-400 font-mono">{Math.max(0, vipInfo.nextGoal - totalDeposited).toLocaleString('vi-VN')} VNĐ</b> để thăng hạng <b>VIP {vipInfo.level + 1}</b>.
                      </p>
                    ) : (
                      <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Bạn đã đạt cấp bậc VIP Huyền Thoại cao nhất!
                      </p>
                    )}

                    <button
                      onClick={() => setShowVipBenefitsModal(true)}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap shadow-sm hover:scale-105"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Xem quyền lợi
                    </button>
                  </div>
                </div>

                {/* KHUNG GIỚI THIỆU ĐẶC QUYỀN CỦA CẤP ĐỘ TIẾP THEO */}
                <div className={`p-4 rounded-2xl border transition duration-300 space-y-2.5 ${nextTierData.cardBg}`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${nextTierData.badgeBg}`}>
                        <NextTierIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">
                          {vipInfo.level === 5 ? 'ĐẶC QUYỀN ĐANG SỞ HỮU' : 'ĐẶC QUYỀN MỤC TIÊU TIẾP THEO'}
                        </span>
                        <h4 className={`text-xs font-black ${nextTierData.color}`}>
                          {nextTierData.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      {nextTierData.req}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {nextTierData.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${nextTierData.color}`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#05080E] border border-slate-800/90 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                    <span className="text-slate-400">Gmail liên kết:</span>
                    <b className="text-slate-200 font-mono">{currentUser.email || 'Chưa liên kết'}</b>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Trạng thái xác thực:</span>
                    {isExempt ? (
                      <span className="text-[11px] font-black text-cyan-300 bg-cyan-500/20 border border-cyan-400 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> MIỄN XÁC THỰC EMAIL
                      </span>
                    ) : isVerified ? (
                      <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ĐÃ XÁC THỰC
                      </span>
                    ) : (
                      <span className="text-[11px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> CHƯA XÁC THỰC
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ĐỔI MẬT KHẨU */}
            {profileTab === 'password' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Mật khẩu hiện tại:</label>
                  <input 
                    type="password"
                    placeholder="Nhập mật khẩu đang dùng..."
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Mật khẩu mới (Tối thiểu 6 ký tự):</label>
                  <input 
                    type="password"
                    placeholder="Nhập mật khẩu mới..."
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Xác nhận mật khẩu mới:</label>
                  <input 
                    type="password"
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                {passMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                    {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <button
                  disabled={passLoading}
                  onClick={handleChangePassword}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  CẬP NHẬT MẬT KHẨU MỚI
                </button>
              </div>
            )}

            {/* TAB 3: XÁC THỰC EMAIL */}
            {profileTab === 'email' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> Địa chỉ Gmail của bạn:
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="email"
                      placeholder="example@gmail.com..."
                      value={accountEmailInput}
                      onChange={(e) => setAccountEmailInput(e.target.value)}
                      disabled={isVerified}
                      className="flex-1 bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition disabled:opacity-60 font-mono"
                    />
                    {!isVerified && (
                      <button
                        disabled={emailActionLoading}
                        onClick={handleSendEmailOTP}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
                      >
                        {emailActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Gửi OTP
                      </button>
                    )}
                  </div>
                </div>

                {isOtpSent && !isVerified && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 animate-fade-in">
                    <label className="block text-xs font-bold text-cyan-300">Nhập mã OTP 6 số từ Gmail:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="6 số OTP..."
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="flex-1 bg-[#0B1019] border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-center font-mono font-black text-cyan-300 tracking-widest focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        disabled={emailActionLoading}
                        onClick={handleVerifyEmailOTP}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-md"
                      >
                        {emailActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Kích hoạt'}
                      </button>
                    </div>
                  </div>
                )}

                {emailActionMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${emailActionMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                    {emailActionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{emailActionMsg.text}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL BẢNG ĐẶC QUYỀN VIP ================= */}
      {showVipBenefitsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#070B14] border-2 border-cyan-400/80 w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_70px_rgba(6,182,212,0.35)] text-slate-200 max-h-[92vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowVipBenefitsModal(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-2xl bg-[#05080E] border border-slate-800 cursor-pointer hover:border-cyan-400 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal VIP */}
            <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                  BẢNG ĐẶC QUYỀN & LỢI ÍCH VIP <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-mono">ZTOOL VIP CLUB</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Tích lũy nạp tiền tự động để mở khóa đặc quyền và ưu đãi độc quyền</p>
              </div>
            </div>

            {/* Grid Thẻ VIP Từng Cấp */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIP_TIERS_DATA.map((tier) => {
                const TierIcon = tier.icon;
                const isCurrent = vipInfo.level === tier.level;

                return (
                  <div 
                    key={tier.level}
                    className={`rounded-2xl p-5 border flex flex-col justify-between relative transition duration-300 hover:scale-[1.02] ${tier.cardBg} ${
                      isCurrent ? 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]' : ''
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 right-4 bg-cyan-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)] uppercase tracking-wider">
                        CẤP ĐỘ CỦA BẠN
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tier.badgeBg}`}>
                            <TierIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={`font-black text-xs ${tier.color}`}>{tier.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400 font-bold block">{tier.req}</span>
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-300">
                        {tier.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${tier.color}`} />
                            <span className="text-[11px]">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Cấp độ V{tier.level}</span>
                      <span className={tier.color}>Kích hoạt vĩnh viễn</span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Nút hành động nạp tiền */}
            <div className="bg-[#05080E] border border-slate-800 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div>
                <span className="text-xs font-bold text-white block">Tích lũy nạp hiện tại của bạn: <b className="text-emerald-400 font-mono font-black">{totalDeposited.toLocaleString('vi-VN')} VNĐ</b></span>
                <span className="text-[11px] text-slate-400">Nạp thêm bất kỳ lúc nào để tự động nâng cấp bậc VIP ngay lập tức.</span>
              </div>
              <button 
                onClick={() => {
                  setShowVipBenefitsModal(false);
                  setShowAccountInfoModal(false);
                  setShowRechargeModal(true);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" /> NẠP TIỀN NÂNG CẤP VIP
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL LỊCH SỬ GIAO DỊCH ================= */}
      {showHistoryModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-xl rounded-3xl p-6 sm:p-7 space-y-6 relative shadow-[0_0_50px_rgba(6,182,212,0.3)] max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowHistoryModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer transition hover:border-cyan-400"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <History className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">NHẬT KÝ TÀI CHÍNH</span>
                <h3 className="text-lg font-black text-white tracking-wide">LỊCH SỬ GIAO DỊCH</h3>
              </div>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Đang tải lịch sử giao dịch...
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {userTransactions.length === 0 ? (
                  <div className="bg-[#05080E] border border-slate-800/80 p-8 rounded-2xl text-center text-xs text-slate-500">
                    Chưa có lịch sử biến động số dư.
                  </div>
                ) : (
                  userTransactions.map((log: any, idx: number) => {
                    const isBonus = log.type === 'BONUS';
                    const isExtend = log.type === 'EXTEND';
                    const isPositive = log.amount > 0;
                    const isCheckin = log.type === 'CHECKIN';
                    const isBuy = log.type === 'BUY' || log.amount < 0;

                    return (
                      <div 
                        key={idx} 
                        className={`bg-[#05080E] border p-4 rounded-2xl flex items-center justify-between gap-3 text-xs transition duration-300 hover:-translate-y-0.5 ${
                          isBonus 
                            ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-400' 
                            : isExtend
                            ? 'border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-400'
                            : isBuy 
                            ? 'border-slate-800/90 hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.12)]' 
                            : isCheckin 
                            ? 'border-slate-800/90 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                            : 'border-slate-800/90 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isBonus
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : isExtend
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                              : isBuy 
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                              : isCheckin 
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}>
                            {isBonus ? <Gift className="w-5 h-5" /> : isExtend ? <Hourglass className="w-5 h-5" /> : isBuy ? <ShoppingBag className="w-5 h-5" /> : isCheckin ? <Gift className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <span className="font-extrabold text-slate-100 block truncate text-xs sm:text-sm">
                              {log.title}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 block">
                              {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ''}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-mono font-black block ${
                            isBonus
                              ? 'text-amber-300'
                              : isExtend
                              ? 'text-cyan-300'
                              : isPositive 
                              ? 'text-emerald-400' 
                              : 'text-rose-400'
                          }`}>
                            {isExtend ? '0đ' : `${isPositive ? '+' : ''}${(log.amount || 0).toLocaleString('vi-VN')}đ`}
                          </span>
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mt-0.5">
                            {log.status || 'Thành công'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL TOOL ĐÃ MUA ================= */}
      {showPurchasedToolsModal && currentUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center px-4">
          <div className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-2xl rounded-3xl p-6 sm:p-7 space-y-6 relative shadow-[0_0_50px_rgba(6,182,212,0.3)] max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowPurchasedToolsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer transition hover:border-cyan-400"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Wrench className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">QUẢN LÝ BẢN QUYỀN</span>
                <h3 className="text-lg font-black text-white tracking-wide">DANH SÁCH TOOL ĐÃ MUA</h3>
              </div>
            </div>

            {loadingPurchasedTools ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Đang kiểm tra dữ liệu bản quyền...
              </div>
            ) : (
              <div className="space-y-4">
                {!userGistData || userGistData.length === 0 ? (
                  <div className="bg-[#05080E] border border-slate-800/80 p-8 rounded-2xl text-center text-xs text-slate-400 space-y-2">
                    <p className="font-bold text-slate-300 text-sm">Bạn chưa sở hữu bản quyền Tool nào.</p>
                    <p className="text-slate-500">Hãy truy cập mục "TOOL AUTO" để chọn mua và kích hoạt ứng dụng.</p>
                  </div>
                ) : (
                  userGistData.map((toolAcc: any, idx: number) => {
                    const isLifetime = !toolAcc.expire_timestamp || toolAcc.expire_timestamp === 0;
                    const isShowPass = showToolPasswords[toolAcc.accountKey] || false;

                    return (
                      <div key={idx} className="bg-[#05080E] border border-slate-800/90 p-5 rounded-2xl space-y-4 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] hover:-translate-y-0.5 transition duration-300">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                          <div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">BẢN QUYỀN HOẠT ĐỘNG</span>
                            <h4 className="font-black text-white text-base mt-0.5">{toolAcc.toolName}</h4>
                          </div>
                          <div>
                            {renderRemainingTime(toolAcc.expire_timestamp)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0B1019] border border-slate-800/80 p-3.5 rounded-xl text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tài khoản tool</span>
                            <div className="flex items-center justify-between bg-[#05080E] border border-slate-800/90 focus-within:border-cyan-400/60 px-3 py-2 rounded-lg font-mono font-bold text-cyan-300 transition">
                              <span className="truncate pr-2">{toolAcc.appUsername}</span>
                              <button 
                                onClick={() => copyTextToClipboard(toolAcc.appUsername, `user_${idx}`)} 
                                className="text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center gap-1" 
                                title="Sao chép tài khoản"
                              >
                                {copiedKey === `user_${idx}` ? <span className="text-[10px] text-emerald-400 font-sans">Đã chép!</span> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mật khẩu tool</span>
                            <div className="flex items-center justify-between bg-[#05080E] border border-slate-800/90 focus-within:border-cyan-400/60 px-3 py-2 rounded-lg font-mono font-bold text-slate-200 transition">
                              <span>{isShowPass ? toolAcc.appPassword : '••••••••'}</span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setShowToolPasswords(prev => ({ ...prev, [toolAcc.accountKey]: !prev[toolAcc.accountKey] }))} 
                                  className="text-slate-400 hover:text-white transition cursor-pointer" 
                                  title={isShowPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                  {isShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button 
                                  onClick={() => copyTextToClipboard(toolAcc.appPassword, `pass_${idx}`)} 
                                  className="text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center gap-1" 
                                  title="Sao chép mật khẩu"
                                >
                                  {copiedKey === `pass_${idx}` ? <span className="text-[10px] text-emerald-400 font-sans">Đã chép!</span> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          {!isLifetime ? (
                            <button
                              onClick={() => handleOpenRenewModal(toolAcc.toolCode)}
                              className="bg-amber-500/10 border border-amber-500/40 text-amber-400 font-black px-4 py-2.5 rounded-xl text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.03] hover:bg-amber-500/25 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} /> GIA HẠN THỜI HẠN
                            </button>
                          ) : (
                            <div className="text-[11px] text-slate-500 font-bold italic flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Sở hữu vĩnh viễn (Không cần gia hạn)
                            </div>
                          )}

                          {toolAcc.downloadLink && (
                            <a 
                              href={toolAcc.downloadLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black px-4 py-2.5 rounded-xl text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.03] hover:bg-cyan-500/35 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                            >
                              <Download className="w-3.5 h-3.5 text-cyan-400" /> Tải Tool về máy
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL ĐIỂM DANH ================= */}
      {checkInModalShow && currentUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center px-4">
          <div className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-6 relative shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <button onClick={() => setCheckInModalShow(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer transition hover:border-cyan-400"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-3.5 border-b border-slate-800/80 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <CalendarCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">ƯU ĐÃI THÀNH VIÊN</span>
                <h3 className="text-lg font-black text-white tracking-wide">ĐIỂM DANH MỖI NGÀY</h3>
              </div>
            </div>

            <div className="bg-[#05080E] border border-slate-800/90 p-6 rounded-2xl flex flex-col items-center space-y-4 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse">
                <Gift className="w-10 h-10 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Phần thưởng điểm danh hôm nay
                </h4>
                <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  +1.000 VNĐ
                </p>
              </div>
            </div>

            {checkInMsg && (
              <div className={`p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 ${checkInMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                {checkInMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span className="leading-relaxed">{checkInMsg.text}</span>
              </div>
            )}

            <button 
              disabled={checkInLoading || checkInMsg?.type === 'success' || hasCheckedInToday}
              onClick={handleDailyCheckIn} 
              className={`w-full font-black py-4 rounded-2xl text-xs shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                (checkInMsg?.type === 'success' || hasCheckedInToday) 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-[1.02]'
              }`}
            >
              {checkInLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin text-slate-950" /> ĐANG XỬ LÝ HỆ THỐNG...</>
              ) : (checkInMsg?.type === 'success' || hasCheckedInToday) ? (
                <><CheckCircle2 className="w-4 h-4" /> ĐÃ ĐIỂM DANH HÔM NAY</>
              ) : (
                <><Gift className="w-4 h-4" /> BẤM ĐỂ ĐIỂM DANH NHẬN 1.000đ</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL ĐĂNG NHẬP / ĐĂNG KÝ ================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-cyan-400/80 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="text-center space-y-2"><h2 className="text-xl font-black text-white">{authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}</h2></div>
            {authMsg && <div className={`p-3.5 rounded-xl text-xs font-bold ${authMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}><span>{authMsg.text}</span></div>}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-300 mb-1">Tên tài khoản (Username)</label><input type="text" required placeholder="Nhập username..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-[#06090E] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition" /></div>
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> Địa chỉ Gmail (Mỗi Email chỉ dùng cho 1 tài khoản)
                  </label>
                  <input 
                    type="email" 
                    required 
                    placeholder="example@gmail.com..." 
                    value={emailInput} 
                    onChange={(e) => setEmailInput(e.target.value)} 
                    className="w-full bg-[#06090E] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition" 
                  />
                </div>
              )}

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