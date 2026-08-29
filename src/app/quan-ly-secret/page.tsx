'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Lock, User, Key, ShieldCheck, LogOut, Users, 
  Wrench, FolderKanban, MessageSquare, Plus, Trash2, Edit, RefreshCw,
  Ban, CheckCircle, CheckCircle2, CreditCard, KeyRound, Search, DollarSign, Settings,
  Upload, Loader2, Eye, EyeOff, History, X, ArrowUpRight, ArrowDownLeft, Clock, Tag, Bell, ShoppingBag, ShieldAlert, Cpu, Activity, TrendingUp, Laptop, Mail, Shield, Sparkles, XCircle, Percent, Crown, Gem, Flame, Star, Award, Video, Send, Headset, Volume2, FileText, Check, Gift, Hourglass, AlertTriangle
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'projects' | 'gist_accounts' | 'sepay' | 'feedback' | 'coupons' | 'settings' | 'chat'>('users');

  const [users, setUsers] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [sepayLogs, setSepayLogs] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  // State Chat Hỗ Trợ Khách Hàng Realtime & Đếm tin chưa đọc
  const [chatUsers, setChatUsers] = useState<string[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const selectedChatUserRef = useRef<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [username: string]: number }>({});
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // Ref trực tiếp vào khung chứa tin nhắn nội bộ
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  // State Thông báo & Sự kiện nạp tiền
  const [noticeForm, setNoticeForm] = useState({ text: '', active: false });
  const [currentActiveNotice, setCurrentActiveNotice] = useState<{ text: string, active: boolean } | null>(null);
  const [bonusEventForm, setBonusEventForm] = useState({ percent: 10, active: false });

  const [gistAccounts, setGistAccounts] = useState<any[]>([]);
  const [loadingGist, setLoadingGist] = useState(false);
  const [resettingHwid, setResettingHwid] = useState<string | null>(null);
  const [deletingGistKey, setDeletingGistKey] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState(Date.now());

  // Modal Gia hạn Key Tool
  const [extendModalData, setExtendModalData] = useState<{ accountKey: string; currentExpire: number } | null>(null);
  const [extendDaysInput, setExtendDaysInput] = useState<number>(1);
  const [extendHoursInput, setExtendHoursInput] = useState<number>(0);
  const [isExtendLifetime, setIsExtendLifetime] = useState<boolean>(false);
  const [extendingLoading, setExtendingLoading] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [gistSearch, setGistSearch] = useState('');
  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '', balance: 0 });
  
  const [editUserPass, setEditUserPass] = useState<{ username: string; newPass: string } | null>(null);
  const [adjustBal, setAdjustBal] = useState<{ username: string; amount: number; isAdd: boolean } | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [selectedUserHistory, setSelectedUserHistory] = useState<{ username: string; logs: any[] } | null>(null);
  const [loadingUserHistory, setLoadingUserHistory] = useState(false);
  const [exemptLoadingId, setExemptLoadingId] = useState<number | null>(null);
  const [deleteEmailLoadingId, setDeleteEmailLoadingId] = useState<number | null>(null);

  // Form Tool hỗ trợ đa phiên bản và lịch sử cập nhật
  const [toolForm, setToolForm] = useState({
    id: 0, name: '', toolCode: '', image: '', status: 'Đang hoạt động',
    priceDay: '', priceWeek: '', priceMonth: '', priceLifetime: '', description: '', downloadLink: '', videoLink: '',
    version: '', changelog: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingTool, setIsEditingTool] = useState(false);

  const [projectForm, setProjectForm] = useState({ id: 0, title: '', image: '', description: '', status: 'Hoạt động tốt' });
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectPreviewUrl, setProjectPreviewUrl] = useState<string>('');
  const [isUploadingProject, setIsUploadingProject] = useState(false);

  const [couponForm, setCouponForm] = useState({ 
    code: '', toolCode: 'ALL', discountType: 'FIXED' as 'FIXED' | 'PERCENT', 
    discountAmount: 5000, discountPercent: 10, quantity: 50, maxUsesPerUser: 1 
  });

  useEffect(() => {
    selectedChatUserRef.current = selectedChatUser;
  }, [selectedChatUser]);

  // Cuộn thanh cuộn bên trong khung chat (không làm trượt toàn trang)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Bộ phát âm thanh chuông thông báo đa tầng, vượt qua mọi chính sách chặn Autoplay của trình duyệt
  const playNotificationSound = () => {
    try {
      // 1. Thử phát bằng Audio Element trực tiếp
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.8;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // 2. Dự phòng dùng Web Audio Synthesizer nếu Audio Element bị trình duyệt giữ lại
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              if (ctx.state === 'suspended') {
                ctx.resume();
              }
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
              gain.gain.setValueAtTime(0.35, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.4);
            }
          } catch (err) {}
        });
      }
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  useEffect(() => {
    // Lắng nghe tương tác chuột đầu tiên để kích hoạt quyền Audio trên trình duyệt
    const handleUnlockAudio = () => {
      if (!audioUnlockedRef.current) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            if (ctx.state === 'suspended') ctx.resume();
          }
          const dummyAudio = new Audio();
          dummyAudio.play().catch(() => {});
          audioUnlockedRef.current = true;
        } catch (e) {}
      }
      window.removeEventListener('click', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
    };

    window.addEventListener('click', handleUnlockAudio);
    window.addEventListener('keydown', handleUnlockAudio);

    return () => {
      window.removeEventListener('click', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
    };
  }, []);

  useEffect(() => {
    const isLogged = localStorage.getItem('ztool_admin_authenticated');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      loadAllSyncData();
      loadChatUsers();
    }

    // Kênh Realtime nghe tin nhắn và giao dịch SePay
    const channel = supabase
      .channel('admin_live_chat_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        handleIncomingMessage(msg);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const newTx = payload.new;
        if (newTx.type === 'RECHARGE' || newTx.type === 'BONUS' || newTx.type === 'EXTEND') {
          setSepayLogs(prev => [newTx, ...prev]);
        }
      })
      .subscribe();

    // Cơ chế polling tự động dự phòng 3 giây
    const pollInterval = setInterval(() => {
      if (selectedChatUserRef.current) {
        loadConversation(selectedChatUserRef.current, false);
      }
      loadChatUsers(false);
    }, 3000);

    const timer = setInterval(() => { 
      if (!document.hidden) setNowTime(Date.now()); 
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, []);

  const handleIncomingMessage = (msg: any) => {
    const sender = msg.sender_username;
    const currentActive = selectedChatUserRef.current;

    if (msg.sender_role === 'user') {
      playNotificationSound();

      if (sender !== currentActive) {
        setUnreadCounts((prev) => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1
        }));
      }
    }

    setChatUsers((prev) => {
      const targetUser = msg.sender_username === 'admin' ? msg.receiver_username : msg.sender_username;
      if (!prev.includes(targetUser)) return [targetUser, ...prev];
      return prev;
    });

    if (
      currentActive &&
      (msg.sender_username === currentActive || msg.receiver_username === currentActive)
    ) {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }
  };

  const loadChatUsers = async (autoSelectFirst = true) => {
    const { data } = await supabase
      .from('messages')
      .select('sender_username, receiver_username')
      .order('id', { ascending: false })
      .limit(300);

    if (data) {
      const unique = Array.from(
        new Set(
          data
            .map((m) => m.sender_username === 'admin' ? m.receiver_username : m.sender_username)
            .filter((u) => u && u !== 'admin')
        )
      );
      setChatUsers(unique);
      if (autoSelectFirst && !selectedChatUserRef.current && unique.length > 0) {
        setSelectedChatUser(unique[0]);
        loadConversation(unique[0]);
      }
    }
  };

  const loadConversation = async (targetUser: string, resetUnread = true) => {
    if (resetUnread) {
      setUnreadCounts((prev) => ({
        ...prev,
        [targetUser]: 0
      }));
    }

    const { data } = await supabase
      .from('messages')
      .select('id, sender_username, sender_role, receiver_username, message, created_at')
      .or(`sender_username.eq.${targetUser},receiver_username.eq.${targetUser}`)
      .order('id', { ascending: true })
      .limit(200);

    if (data) {
      setChatMessages(data);
    }
  };

  const handleAdminSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUser || !adminReplyText.trim() || sendingReply) return;

    const text = adminReplyText.trim();
    setAdminReplyText('');
    setSendingReply(true);

    const newMsg = {
      sender_username: 'admin',
      sender_role: 'admin',
      receiver_username: selectedChatUser,
      message: text
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
    setSendingReply(false);

    if (!error && data) {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedChatUser || !confirm(`Xóa toàn bộ lịch sử trò chuyện với khách hàng "${selectedChatUser}"?`)) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`sender_username.eq.${selectedChatUser},receiver_username.eq.${selectedChatUser}`);

    if (!error) {
      setChatMessages([]);
      loadChatUsers();
      alert('Đã xóa cuộc hội thoại thành công!');
    } else {
      alert('Lỗi xóa hội thoại: ' + error.message);
    }
  };

  const formatMsgTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      return `${timeStr} - ${dateStr}`;
    } catch (e) {
      return '';
    }
  };

  const getVipBadge = (amount: number) => {
    if (amount >= 5000000) return <span className="text-[10px] font-black bg-gradient-to-r from-rose-600/30 via-pink-600/30 to-amber-500/30 border border-rose-400 text-rose-200 px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse w-full"><Flame className="w-3 h-3 text-rose-400" /> VIP 5</span>;
    if (amount >= 3000000) return <span className="text-[10px] font-black bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400 text-purple-200 px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse w-full"><Gem className="w-3 h-3 text-purple-300" /> VIP 4</span>;
    if (amount >= 2000000) return <span className="text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/60 text-amber-300 px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 shadow-[0_0_8px_rgba(251,191,36,0.3)] w-full"><Crown className="w-3 h-3 text-amber-400" /> VIP 3</span>;
    if (amount >= 1000000) return <span className="text-[10px] font-black bg-gradient-to-r from-slate-400/20 to-cyan-500/20 border border-cyan-400/50 text-cyan-300 px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.3)] w-full"><Star className="w-3 h-3 text-cyan-300" /> VIP 2</span>;
    if (amount >= 500000) return <span className="text-[10px] font-black bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-orange-300 px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 shadow-[0_0_8px_rgba(249,115,22,0.3)] w-full"><Award className="w-3 h-3 text-orange-400" /> VIP 1</span>;
    return <span className="text-[10px] font-bold bg-slate-800/80 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 w-full"><User className="w-3 h-3 text-slate-500" /> Thành viên</span>;
  };

  const fetchGistAccountsData = async () => {
    setLoadingGist(true);
    try {
      const res = await fetch('/api/get-gist', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const parsed = result.data;
          const list = Object.keys(parsed)
            .map((accName) => ({ username: accName, ...parsed[accName] }))
            .sort((a, b) => {
              const userA = a.username.split('_')[0].toLowerCase();
              const userB = b.username.split('_')[0].toLowerCase();
              
              if (userA === userB) {
                return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
              }
              return userA.localeCompare(userB, undefined, { sensitivity: 'base' });
            });

          setGistAccounts(list);
        }
      }
    } catch (err) { console.error(err); } finally { setLoadingGist(false); }
  };

  const handleResetHwid = async (accountName: string) => {
    if (!confirm(`Xác nhận xóa Mã thiết bị (HWID) cho tài khoản "${accountName}"?`)) return;
    setResettingHwid(accountName);
    try {
      const res = await fetch('/api/gist-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountKey: accountName,
          action: 'RESET_DEVICE'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Đã xóa Mã thiết bị thành công cho tài khoản ${accountName}!`);
        fetchGistAccountsData();
      } else {
        alert(`Lỗi reset thiết bị: ${data.message || 'Không thể cập nhật Gist'}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối máy chủ: ${err.message}`);
    } finally {
      setResettingHwid(null);
    }
  };

  const handleDeleteGistAccount = async (accountName: string) => {
    if (!confirm(`Xác nhận XÓA VĨNH VIỄN tài khoản "${accountName}" khỏi kho GitHub Gist?`)) return;
    setDeletingGistKey(accountName);
    try {
      const res = await fetch('/api/gist-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountName, action: 'DELETE_ACCOUNT' })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã xóa tài khoản "${accountName}" khỏi Gist thành công!`);
        fetchGistAccountsData();
      } else {
        alert(`Lỗi xóa tài khoản Gist: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Lỗi kết nối máy chủ: ${err.message}`);
    } finally {
      setDeletingGistKey(null);
    }
  };

  // Xử lý gọi API Gia Hạn Thời Gian
  const handleExecuteExtendTime = async () => {
    if (!extendModalData) return;
    setExtendingLoading(true);

    try {
      const res = await fetch('/api/gist-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountKey: extendModalData.accountKey,
          action: 'EXTEND_TIME',
          addDays: Number(extendDaysInput) || 0,
          addHours: Number(extendHoursInput) || 0,
          isLifetime: isExtendLifetime
        })
      });

      const result = await res.json();
      setExtendingLoading(false);

      if (result.success) {
        alert(`Đã gia hạn thành công cho key "${extendModalData.accountKey}"!`);
        setExtendModalData(null);
        fetchGistAccountsData();
      } else {
        alert(`Lỗi: ${result.message || 'Không thể gia hạn'}`);
      }
    } catch (err: any) {
      setExtendingLoading(false);
      alert(`Lỗi kết nối: ${err.message}`);
    }
  };

  const loadAllSyncData = async () => {
    try {
      // 1. Tải users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .order('id', { ascending: false });
        
      if (userData) {
        setUsers(userData);
      }

      // 2. Tải tools
      const { data: toolData } = await supabase
        .from('tools')
        .select('*')
        .order('id', { ascending: false });
        
      if (toolData) {
        setTools(toolData.map((t: any) => ({
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
          views: t.views || 0, 
          sales: t.sales || 0
        })));
      }

      // 3. Tải projects
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });
      if (projectData) setProjects(projectData);

      // 4. Tải feedbacks
      const { data: feedbackData } = await supabase
        .from('feedbacks')
        .select('*')
        .order('id', { ascending: false });
      if (feedbackData) setFeedbacks(feedbackData);

      // 5. Tải SePay & Bonus logs
      const { data: sepayData } = await supabase
        .from('transactions')
        .select('*')
        .or('type.eq.RECHARGE,type.eq.BONUS,type.eq.EXTEND')
        .order('id', { ascending: false })
        .limit(100);
      if (sepayData) setSepayLogs(sepayData);

      // 6. Tải coupons
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .order('id', { ascending: false });
      if (couponData) setCoupons(couponData);

      // 7. Tải settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (settingsData) {
        setNoticeForm({ text: settingsData.notice_text || '', active: settingsData.is_active });
        setCurrentActiveNotice({ text: settingsData.notice_text || '', active: settingsData.is_active });
        setBonusEventForm({ 
          percent: Number(settingsData.bonus_percent) || 10, 
          active: settingsData.bonus_active === true 
        });
      }

      fetchGistAccountsData();
    } catch (e) { 
      console.error('Lỗi đồng bộ dữ liệu Supabase:', e); 
    }
  };

  const renderRemainingTime = (expireTimestamp: number) => {
    if (!expireTimestamp || expireTimestamp === 0) return <span className="text-cyan-300 font-black bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-400/40 text-xs">♾️ Vĩnh Viễn</span>;
    const nowSec = Math.floor(nowTime / 1000); const diffSec = expireTimestamp - nowSec;
    if (diffSec <= 0) return <span className="text-rose-400 font-bold bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/40 text-xs">⚠️ Hết Hạn Quyền Dùng</span>;
    const days = Math.floor(diffSec / 86400); const hours = Math.floor((diffSec % 86400) / 3600); const minutes = Math.floor((diffSec % 3600) / 60); const seconds = diffSec % 60;
    return <span className="text-emerald-300 font-mono font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/40 text-xs flex items-center gap-1.5 w-fit"><Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{days > 0 && `${days}d `}{hours}h {minutes}m {seconds}s</span>;
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'mienprovip' && passwordInput === 'Vietduc123456@') {
      localStorage.setItem('ztool_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      loadAllSyncData();
      loadChatUsers();
      playNotificationSound();
    } else {
      setLoginError('Tài khoản hoặc mật khẩu Quản trị không chính xác!');
    }
  };

  const handleAdminLogout = () => { localStorage.removeItem('ztool_admin_authenticated'); setIsAuthenticated(false); };
  const handleToggleShowPass = (username: string) => { setShowPasswords(prev => ({ ...prev, [username]: !prev[username] })); };

  const handleViewUserTransactions = async (username: string) => {
    setLoadingUserHistory(true); 
    setSelectedUserHistory({ username, logs: [] });
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('username', username)
      .order('id', { ascending: false })
      .limit(50);
    setLoadingUserHistory(false); 
    if (!error && data) setSelectedUserHistory({ username, logs: data });
  };

  const handleToggleExemptVerification = async (u: any) => {
    setExemptLoadingId(u.id);
    const newExemptState = !u.is_exempt;
    const hasValidEmail = u.email && u.email.trim() !== '' && u.email.includes('@');
    const newVerifiedState = newExemptState ? true : (hasValidEmail ? (u.is_verified === true) : false);

    const updatePayload: any = { is_exempt: newExemptState, is_verified: newVerifiedState };
    const { error } = await supabase.from('users').update(updatePayload).eq('id', u.id);
    setExemptLoadingId(null);
    if (!error) setUsers(prev => prev.map(user => user.id === u.id ? { ...user, ...updatePayload } : user));
    else alert(`Lỗi cập nhật miễn xác thực: ${error.message}`);
  };

  const handleDeleteUserEmail = async (u: any) => {
    if (!confirm(`Xác nhận xóa địa chỉ Gmail của tài khoản "${u.username}"?`)) return;
    setDeleteEmailLoadingId(u.id);
    const updatePayload = { email: null, is_verified: false, is_exempt: false };
    const { error } = await supabase.from('users').update(updatePayload).eq('id', u.id);
    setDeleteEmailLoadingId(null);
    if (!error) { setUsers(prev => prev.map(user => user.id === u.id ? { ...user, ...updatePayload } : user)); alert('Đã xóa thành công!'); }
    else alert(`Lỗi xóa Gmail: ${error.message}`);
  };

  const handleFileChange = (e: React.FormEvent<HTMLInputElement>) => { 
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) { setImageFile(target.files[0]); setPreviewUrl(URL.createObjectURL(target.files[0])); } 
  };
  
  const handleProjectFileChange = (e: React.FormEvent<HTMLInputElement>) => { 
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) { setProjectImageFile(target.files[0]); setProjectPreviewUrl(URL.createObjectURL(target.files[0])); } 
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newUserForm.username || !newUserForm.password) return alert('Nhập đủ username/password!');
    const { error } = await supabase.from('users').insert([{ 
      username: newUserForm.username.trim(), email: newUserForm.email ? newUserForm.email.trim().toLowerCase() : null,
      password: newUserForm.password, balance: Number(newUserForm.balance) || 0, is_verified: false, is_exempt: false, isBanned: false, total_deposited: 0
    }]);
    if (error) alert('Lỗi tạo tài khoản: ' + error.message);
    else {
      await supabase.from('transactions').insert([{ username: newUserForm.username.trim(), type: 'INIT', title: 'Khởi tạo tài khoản thành công', amount: Number(newUserForm.balance) || 0, status: 'Thành công' }]);
      setNewUserForm({ username: '', email: '', password: '', balance: 0 }); alert('Tạo người dùng thành công trên Cloud Database!'); loadAllSyncData();
    }
  };

  const handleToggleBanUser = async (u: any) => { 
    const { error } = await supabase.from('users').update({ isBanned: !u.isBanned }).eq('id', u.id); 
    if (!error) setUsers(prev => prev.map(user => user.id === u.id ? { ...user, isBanned: !u.isBanned } : user)); 
  };
  
  const handleDeleteUser = async (id: number, username: string) => { 
    if (!confirm(`Xóa tài khoản ${username}?`)) return; 
    const { error } = await supabase.from('users').delete().eq('id', id); 
    if (!error) setUsers(prev => prev.filter(user => user.id !== id)); 
  };
  
  const handleSaveUserPassword = async () => { 
    if (!editUserPass || !editUserPass.newPass.trim()) return alert('Vui lòng nhập mật khẩu mới!'); 
    const { error } = await supabase.from('users').update({ password: editUserPass.newPass.trim() }).eq('username', editUserPass.username); 
    if (error) alert('Lỗi đổi mật khẩu: ' + error.message);
    else { 
      setUsers(prev => prev.map(user => user.username === editUserPass.username ? { ...user, password: editUserPass.newPass.trim() } : user));
      setEditUserPass(null); 
      alert('Đã cập nhật mật khẩu mới!'); 
    } 
  };
  
  const handleExecAdjustBalance = async (isAddMode: boolean) => {
    if (!adjustBal || !adjustBal.amount || adjustBal.amount <= 0) return alert('Vui lòng nhập số tiền hợp lệ!');
    const targetUser = users.find(u => u.username === adjustBal.username);
    if (!targetUser) return alert('Không tìm thấy người dùng!');

    const cur = Number(targetUser.balance) || 0; 
    const changeAmt = Number(adjustBal.amount); 
    const next = isAddMode ? cur + changeAmt : Math.max(0, cur - changeAmt);
    
    // Cập nhật cả total_deposited của user
    const curDeposited = Number(targetUser.total_deposited) || 0;
    const nextDeposited = isAddMode ? curDeposited + changeAmt : Math.max(0, curDeposited - changeAmt);

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: next, total_deposited: nextDeposited })
      .eq('id', targetUser.id);

    if (updateError) alert('Lỗi cập nhật số dư: ' + updateError.message);
    else {
      await supabase.from('transactions').insert([{ username: targetUser.username, type: isAddMode ? 'ADMIN_ADD' : 'ADMIN_SUB', title: isAddMode ? 'Admin cộng tiền vào ví' : 'Admin trừ tiền khỏi ví', amount: isAddMode ? changeAmt : -changeAmt, status: 'Thành công' }]);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, balance: next, total_deposited: nextDeposited } : u));
      setAdjustBal(null); 
      alert('Điều chỉnh số dư thành công!');
    }
  };

  const appendChangelogTemplate = (ver: string) => {
    const template = `[${ver}]\n- Cập nhật tính năng mới\n- Tối ưu hóa hiệu năng & vượt Anticheat\n- Sửa lỗi hoạt động\n`;
    setToolForm(prev => ({
      ...prev,
      changelog: prev.changelog ? `${template}\n${prev.changelog}` : template
    }));
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault(); if (!toolForm.name) return alert('Nhập tên Tool!');
    setIsUploading(true); let finalImageUrl = toolForm.image;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop(); const fileName = `${Date.now()}.${fileExt}`; const filePath = `tools/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('tool-images').upload(filePath, imageFile);
      if (uploadError) { setIsUploading(false); return alert('Lỗi tải ảnh lên Storage: ' + uploadError.message); }
      const { data: urlData } = supabase.storage.from('tool-images').getPublicUrl(filePath); finalImageUrl = urlData.publicUrl;
    }
    const payload = { 
      name: toolForm.name, 
      toolCode: toolForm.toolCode.trim(), 
      image: finalImageUrl, 
      status: toolForm.status, 
      priceDay: toolForm.priceDay, 
      priceWeek: toolForm.priceWeek, 
      priceMonth: toolForm.priceMonth, 
      priceLifetime: toolForm.priceLifetime, 
      description: toolForm.description, 
      downloadLink: toolForm.downloadLink, 
      video_link: toolForm.videoLink,
      version: toolForm.version.trim(),
      changelog: toolForm.changelog.trim()
    };
    let result;
    if (isEditingTool && toolForm.id) result = await supabase.from('tools').update(payload).eq('id', toolForm.id);
    else result = await supabase.from('tools').insert([payload]);
    setIsUploading(false);
    if (result.error) alert('Lỗi lưu Tool: ' + result.error.message);
    else { 
      setImageFile(null); setPreviewUrl(''); 
      setToolForm({ 
        id: 0, name: '', toolCode: '', image: '', status: 'Đang hoạt động', 
        priceDay: '', priceWeek: '', priceMonth: '', priceLifetime: '', 
        description: '', downloadLink: '', videoLink: '', version: '', changelog: '' 
      }); 
      setIsEditingTool(false); 
      alert('Lưu sản phẩm thành công!'); 
      loadAllSyncData(); 
    }
  };

  const handleDeleteTool = async (id: number) => { 
    if (!confirm('Xóa Tool này khỏi hệ thống?')) return; 
    const { error } = await supabase.from('tools').delete().eq('id', id); 
    if (!error) setTools(prev => prev.filter(t => t.id !== id)); 
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault(); if (!projectForm.title) return alert('Nhập tên dự án!');
    setIsUploadingProject(true); let finalImageUrl = projectForm.image;
    if (projectImageFile) {
      const fileExt = projectImageFile.name.split('.').pop(); const fileName = `${Date.now()}.${fileExt}`; const filePath = `projects/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('tool-images').upload(filePath, projectImageFile);
      if (uploadError) { setIsUploadingProject(false); return alert('Lỗi tải ảnh dự án lên Storage: ' + uploadError.message); }
      const { data: urlData } = supabase.storage.from('tool-images').getPublicUrl(filePath); finalImageUrl = urlData.publicUrl;
    }
    const payload = { title: projectForm.title, image: finalImageUrl, status: projectForm.status, description: projectForm.description };
    const { error } = await supabase.from('projects').insert([payload]);
    setIsUploadingProject(false);
    if (error) alert('Lỗi lưu dự án: ' + error.message);
    else { setProjectImageFile(null); setProjectPreviewUrl(''); setProjectForm({ id: 0, title: '', image: '', description: '', status: 'Hoạt động tốt' }); alert('Thêm dự án mới thành công!'); loadAllSyncData(); }
  };

  const handleDeleteProject = async (id: number) => { 
    if (!confirm('Xóa dự án này?')) return; 
    const { error } = await supabase.from('projects').delete().eq('id', id); 
    if (!error) setProjects(prev => prev.filter(p => p.id !== id)); 
  };
  
  const handleDeleteFeedback = async (id: number) => { 
    const { error } = await supabase.from('feedbacks').delete().eq('id', id); 
    if (!error) setFeedbacks(prev => prev.filter(f => f.id !== id)); 
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!couponForm.code.trim()) return alert('Vui lòng nhập mã giảm giá!');

    const payload: any = { 
      code: couponForm.code.trim().toUpperCase(), tool_code: couponForm.toolCode, discount_type: couponForm.discountType, 
      discount_amount: couponForm.discountType === 'FIXED' ? Number(couponForm.discountAmount) : 0, 
      discount_percent: couponForm.discountType === 'PERCENT' ? Number(couponForm.discountPercent) : 0, 
      quantity: Number(couponForm.quantity), max_uses_per_user: Number(couponForm.maxUsesPerUser) || 1 
    };

    const { error } = await supabase.from('coupons').insert([payload]);
    if (error) alert('Lỗi tạo mã giảm giá: ' + error.message);
    else { alert('Tạo mã giảm giá thành công!'); setCouponForm({ code: '', toolCode: 'ALL', discountType: 'FIXED', discountAmount: 5000, discountPercent: 10, quantity: 50, maxUsesPerUser: 1 }); loadAllSyncData(); }
  };

  const handleDeleteCoupon = async (id: number) => { 
    if (!confirm('Xóa mã giảm giá này khỏi hệ thống?')) return; 
    const { error } = await supabase.from('coupons').delete().eq('id', id); 
    if (!error) setCoupons(prev => prev.filter(c => c.id !== id)); 
  };

  const handleSaveNotice = async () => {
    const { error } = await supabase.from('settings').upsert({ id: 1, notice_text: noticeForm.text, is_active: noticeForm.active });
    if (error) alert('Lỗi lưu thông báo: ' + error.message);
    else { setCurrentActiveNotice({ text: noticeForm.text, active: noticeForm.active }); alert('Đã lưu và cập nhật thông báo thành công!'); }
  };

  // Lưu cấu hình Sự Kiện Nạp Tiền
  const handleSaveBonusEvent = async () => {
    const { error } = await supabase.from('settings').upsert({ 
      id: 1, 
      bonus_percent: Number(bonusEventForm.percent) || 0, 
      bonus_active: bonusEventForm.active 
    });
    if (error) alert('Lỗi lưu sự kiện nạp tiền: ' + error.message);
    else { alert('Đã cập nhật sự kiện nạp tiền thành công!'); }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#05070D] text-white font-sans flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-[#0B1019] border-2 border-cyan-400/80 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-cyan-500/10 border-2 border-cyan-400/50 rounded-2xl flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]"><Lock className="w-8 h-8 animate-pulse" /></div>
            <h1 className="text-xl font-black tracking-wider text-white">HỆ THỐNG QUẢN TRỊ ZTOOL</h1>
            <p className="text-xs text-slate-400">Đăng nhập quyền Quản trị viên để điều hành toàn hệ thống</p>
          </div>
          {loginError && <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-bold">{loginError}</div>}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">Tài khoản Quản trị</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input type="text" required placeholder="Nhập username..." value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-[#05080E] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">Mật khẩu Bảo mật</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input type="password" required placeholder="Nhập mật khẩu..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-[#05080E] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition" />
              </div>
            </div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition flex items-center justify-center gap-2 cursor-pointer mt-2">
              <ShieldCheck className="w-4 h-4" /> XÁC THỰC VÀ ĐĂNG NHẬP
            </button>
          </form>
        </div>
      </main>
    );
  }

  const totalUserBalance = users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);

  // Phân loại tài khoản Gist còn hạn & hết hạn
  const nowSec = Math.floor(nowTime / 1000);
  const activeGistAccounts = gistAccounts.filter(acc => !acc.expire_timestamp || acc.expire_timestamp === 0 || acc.expire_timestamp > nowSec);
  const expiredGistAccounts = gistAccounts.filter(acc => acc.expire_timestamp && acc.expire_timestamp > 0 && acc.expire_timestamp <= nowSec);

  return (
    <main className="min-h-screen bg-[#05070D] text-slate-200 font-sans flex flex-col pb-20 relative">
      
      {/* HEADER */}
      <header className="bg-[#0B1019]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"><Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} /></div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider flex items-center gap-2">
              ZTOOL ADMIN PANEL <span className="text-[10px] bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded-md font-mono">v2.5 PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400">Đồng bộ Cloud Supabase Realtime & GitHub Gist API</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={playNotificationSound} className="bg-[#05080E] border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 p-2.5 rounded-xl transition cursor-pointer" title="Test âm thanh"><Volume2 className="w-4 h-4" /></button>
          <button onClick={loadAllSyncData} className="bg-[#05080E] border border-slate-800 hover:border-cyan-400 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"><RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Tải lại dữ liệu Cloud</button>
          <button onClick={handleAdminLogout} className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"><LogOut className="w-3.5 h-3.5" /> Đăng xuất</button>
        </div>
      </header>

      {/* KHUNG NỘI DUNG CHÍNH */}
      <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B1019] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-cyan-500/40 transition">
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TỔNG KHÁCH HÀNG</span><span className="text-2xl font-black text-white font-mono">{users.length}</span></div>
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><Users className="w-5 h-5" /></div>
          </div>
          <div className="bg-[#0B1019] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/40 transition">
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SỐ DƯ KHÁCH CÒN LẠI</span><span className="text-2xl font-black text-emerald-400 font-mono">{totalUserBalance.toLocaleString('vi-VN')}đ</span></div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><CreditCard className="w-5 h-5" /></div>
          </div>
          <div className="bg-[#0B1019] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-amber-500/40 transition">
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SẢN PHẨM TOOL AUTO</span><span className="text-2xl font-black text-amber-400 font-mono">{tools.length}</span></div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400"><Wrench className="w-5 h-5" /></div>
          </div>
          <div className="bg-[#0B1019] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/40 transition">
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MÃ GIẢM GIÁ HIỆN CÓ</span><span className="text-2xl font-black text-purple-400 font-mono">{coupons.length}</span></div>
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400"><Tag className="w-5 h-5" /></div>
          </div>
        </div>

        {/* MENU TABS */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0B1019] p-2.5 rounded-2xl border border-slate-800/80 shadow-lg">
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'users' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Users className="w-4 h-4" /> QUẢN LÝ NGƯỜI DÙNG ({users.length})</button>
          <button onClick={() => setActiveTab('tools')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'tools' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Wrench className="w-4 h-4" /> SẢN PHẨM TOOL ({tools.length})</button>
          <button onClick={() => { setActiveTab('gist_accounts'); fetchGistAccountsData(); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'gist_accounts' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><KeyRound className="w-4 h-4" /> KHO ACC TOOL ({gistAccounts.length})</button>
          <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'coupons' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><Tag className="w-4 h-4" /> MÃ GIẢM GIÁ ({coupons.length})</button>
          <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${activeTab === 'chat' ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <Headset className="w-4 h-4 text-cyan-400" /> LIVE CHAT ({chatUsers.length})
            {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
              <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'projects' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><FolderKanban className="w-4 h-4" /> DỰ ÁN CỦA SHOP ({projects.length})</button>
          <button onClick={() => setActiveTab('sepay')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'sepay' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><CreditCard className="w-4 h-4" /> LỊCH SỬ SEPAY ({sepayLogs.length})</button>
          <button onClick={() => setActiveTab('feedback')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'feedback' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}><MessageSquare className="w-4 h-4" /> ĐÓNG GÓP ({feedbacks.length})</button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'settings' ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/50'}`}><Bell className="w-4 h-4" /> THÔNG BÁO & SỰ KIỆN</button>
        </div>

        {/* ================= TAB 1: QUẢN LÝ NGƯỜI DÙNG ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateUser} className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3 uppercase tracking-wider"><Plus className="w-4 h-4 text-cyan-400" /> Tạo tài khoản người dùng mới</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label className="block text-[11px] font-bold text-slate-400 mb-1">Username:</label><input type="text" placeholder="Nhập username..." value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono" /></div>
                <div><label className="block text-[11px] font-bold text-slate-400 mb-1">Gmail:</label><input type="email" placeholder="example@gmail.com..." value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono" /></div>
                <div><label className="block text-[11px] font-bold text-slate-400 mb-1">Mật khẩu:</label><input type="text" placeholder="Nhập mật khẩu..." value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono" /></div>
                <div><label className="block text-[11px] font-bold text-slate-400 mb-1">Số dư ban đầu:</label><input type="number" placeholder="0" value={newUserForm.balance || ''} onChange={e => setNewUserForm({ ...newUserForm, balance: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono" /></div>
              </div>
              <button type="submit" className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer shadow-sm flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Tạo người dùng</button>
            </form>

            <div className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div><h2 className="text-base font-black text-white flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> DANH SÁCH KHÁCH HÀNG ({users.length})</h2><p className="text-xs text-slate-400">Quản lý tài khoản, VIP, xác thực...</p></div>
                <div className="relative w-full md:w-80"><Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Tìm tên tài khoản, Gmail..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-[#05080E] border border-slate-800 focus:border-cyan-400 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none transition shadow-inner font-mono" />{userSearch && (<button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded-md"><X className="w-3.5 h-3.5" /></button>)}</div>
              </div>

              <div className="overflow-x-auto border border-slate-800/60 rounded-2xl bg-[#05080E]/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#05080E] border-b border-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-black">
                    <tr><th className="p-4">Tài khoản</th><th className="p-4 text-center">VIP</th><th className="p-4">Gmail</th><th className="p-4">Mật khẩu</th><th className="p-4">Số dư</th><th className="p-4 text-center">Trạng thái Gmail</th><th className="p-4 text-center">Miễn xác thực</th><th className="p-4 text-center">Khóa</th><th className="p-4 text-right">Hành động</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {users.filter(u => u.username?.toLowerCase().includes(userSearch.toLowerCase()) || (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))).map((u, i) => {
                      const isExempt = u.is_exempt === true;
                      const hasValidEmail = u.email && u.email.trim() !== '' && u.email.includes('@');
                      const isVerified = isExempt || (hasValidEmail && u.is_verified === true);
                      const depositedAmount = Number(u.total_deposited) || 0;

                      return (
                        <tr key={i} className="hover:bg-[#080D17]/80 transition">
                          <td className="p-4 font-bold text-white whitespace-nowrap"><span className="font-mono text-cyan-300 font-black">{u.username}</span></td>
                          <td className="p-4 text-center whitespace-nowrap"><div className="flex flex-col items-center justify-center gap-1">{getVipBadge(depositedAmount)}<span className="text-[9px] text-slate-500 font-mono font-bold">Nạp: {depositedAmount.toLocaleString('vi-VN')}đ</span></div></td>
                          <td className="p-4 font-mono whitespace-nowrap">
                            {hasValidEmail ? (
                              <div className="inline-flex items-center gap-2 bg-[#0B1019] border border-slate-800 px-2.5 py-1 rounded-xl"><span className="text-slate-200 text-xs">{u.email}</span><button disabled={deleteEmailLoadingId === u.id} onClick={() => handleDeleteUserEmail(u)} className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/20 rounded-md transition cursor-pointer">{deleteEmailLoadingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-rose-400/80 hover:text-rose-400" />}</button></div>
                            ) : (<span className="text-slate-600 italic">Chưa có</span>)}
                          </td>
                          <td className="p-4 font-mono whitespace-nowrap"><div className="flex items-center gap-2"><span className="text-slate-300 font-bold">{showPasswords[u.username] ? u.password || '---' : '••••••••'}</span><button onClick={() => handleToggleShowPass(u.username)} className="text-slate-500 hover:text-white transition cursor-pointer">{showPasswords[u.username] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button></div></td>
                          <td className="p-4 font-mono font-black text-emerald-400 whitespace-nowrap">{(u.balance || 0).toLocaleString('vi-VN')}đ</td>
                          <td className="p-4 text-center whitespace-nowrap">
                            {isExempt ? <span className="text-cyan-300 font-black bg-cyan-500/20 px-3 py-1 rounded-xl border border-cyan-400 text-[10px] inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.25)]"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /> MIỄN XÁC THỰC</span> : isVerified ? <span className="text-emerald-400 font-black bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30 text-[10px] inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ĐÃ XÁC THỰC</span> : <span className="text-rose-400 font-black bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/30 text-rose-400 text-[10px] inline-flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-rose-400" /> CHƯA XÁC THỰC</span>}
                          </td>
                          <td className="p-4 text-center whitespace-nowrap"><button disabled={exemptLoadingId === u.id} onClick={() => handleToggleExemptVerification(u)} className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer border inline-flex items-center gap-1.5 ${isExempt ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950' : 'bg-[#05080E] border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300'}`}>{exemptLoadingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : isExempt ? <>Bỏ miễn xác thực</> : <><Shield className="w-3.5 h-3.5 text-cyan-400" /> Miễn xác thực</>}</button></td>
                          <td className="p-4 text-center whitespace-nowrap">{u.isBanned ? <span className="text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 text-[10px]">Bị BAN</span> : <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 text-[10px]">Hoạt động</span>}</td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap"><button onClick={() => handleViewUserTransactions(u.username)} className="bg-cyan-500/10 text-cyan-400 p-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 cursor-pointer transition inline-flex" title="Xem lịch sử giao dịch"><History className="w-3.5 h-3.5" /></button><button onClick={() => setAdjustBal({ username: u.username, amount: 0, isAdd: true })} className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition inline-flex" title="Cộng/Trừ tiền ví"><DollarSign className="w-3.5 h-3.5" /></button><button onClick={() => setEditUserPass({ username: u.username, newPass: '' })} className="bg-cyan-500/10 text-cyan-400 p-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 cursor-pointer transition inline-flex" title="Đổi mật khẩu"><Key className="w-3.5 h-3.5" /></button><button onClick={() => handleToggleBanUser(u)} className={`p-2 rounded-xl border cursor-pointer transition inline-flex ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}</button><button onClick={() => handleDeleteUser(u.id, u.username)} className="bg-rose-500/10 text-rose-400 p-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer transition inline-flex"><Trash2 className="w-3.5 h-3.5" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: KHO ACC TOOL (PHÂN TÁCH CÒN HẠN VÀ HẾT HẠN) ================= */}
        {activeTab === 'gist_accounts' && (
          <div className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 sm:p-7 space-y-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider">
                    QUẢN LÝ KHO BẢN QUYỀN TOOL
                  </h2>
                </div>
                <p className="text-xs text-slate-400 pl-11.5">
                  Tự động phân nhóm bản quyền theo chủ sở hữu • Quản lý HWID, Gia hạn giờ/ngày và thời hạn kích hoạt
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm tên khách, mã tool, HWID..." 
                    value={gistSearch} 
                    onChange={e => setGistSearch(e.target.value)} 
                    className="w-full bg-[#05080E] border border-slate-800 focus:border-cyan-400 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none transition shadow-inner font-mono" 
                  />
                  {gistSearch && (
                    <button onClick={() => setGistSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={fetchGistAccountsData} 
                  className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition shrink-0 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGist ? 'animate-spin' : ''}`} /> Tải lại Gist
                </button>
              </div>
            </div>

            {loadingGist ? (
              <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Đang đồng bộ tài khoản từ GitHub Gist...
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* 1. KHU VỰC TÀI KHOẢN ĐANG HOẠT ĐỘNG & VĨNH VIỄN */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        TÀI KHOẢN ĐANG HOẠT ĐỘNG & VĨNH VIỄN 
                        <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          {activeGistAccounts.length} Key
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-800/80 rounded-2xl bg-[#060911] shadow-2xl">
                    <table className="w-full text-left text-xs border-collapse table-fixed min-w-[1050px]">
                      <thead className="bg-[#090E1A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-black select-none">
                        <tr>
                          <th className="py-4 px-6 w-[25%]">Key Tài Khoản Tool</th>
                          <th className="py-4 px-4 w-[11%]">Mật Khẩu</th>
                          <th className="py-4 px-4 w-[12%]">Mã Tool</th>
                          <th className="py-4 px-4 w-[17%]">Mã Thiết Bị (HWID)</th>
                          <th className="py-4 px-4 w-[15%] text-center">Thời Gian Còn Lại</th>
                          <th className="py-4 px-6 w-[20%] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {(() => {
                          const grouped: { [baseUser: string]: any[] } = {};
                          activeGistAccounts.forEach((acc) => {
                            const baseUser = acc.username.split('_')[0];
                            if (!grouped[baseUser]) grouped[baseUser] = [];
                            grouped[baseUser].push(acc);
                          });

                          const filteredEntries = Object.entries(grouped).filter(([baseUser, subAccs]) => {
                            const search = gistSearch.toLowerCase();
                            if (baseUser.toLowerCase().includes(search)) return true;
                            return subAccs.some(a => 
                              a.username.toLowerCase().includes(search) || 
                              (a.device_id && a.device_id.toLowerCase().includes(search)) ||
                              (a.tool_code && a.tool_code.toLowerCase().includes(search)) ||
                              (a.toolCode && a.toolCode.toLowerCase().includes(search))
                            );
                          });

                          if (filteredEntries.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="py-10 text-center text-slate-500 font-normal">
                                  Không có tài khoản đang hoạt động nào khớp với tìm kiếm.
                                </td>
                              </tr>
                            );
                          }

                          return filteredEntries.map(([baseUser, subAccs]) => (
                            <React.Fragment key={baseUser}>
                              <tr className="bg-gradient-to-r from-[#0C1527] via-[#09101F] to-[#060911] border-t-2 border-slate-800">
                                <td colSpan={6} className="py-2.5 px-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 text-[11px] font-black uppercase shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                        {baseUser.substring(0, 1)}
                                      </div>
                                      <span className="font-mono font-black text-white text-sm tracking-wide">{baseUser}</span>
                                      <span className="text-[10px] font-bold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 px-2.5 py-0.5 rounded-full">
                                        {subAccs.length} Tool đang dùng
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2.5 py-0.5 rounded-md border border-slate-700">
                                      Chủ tài khoản
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {subAccs.map((acc) => {
                                const hasHwid = acc.device_id && acc.device_id.trim() !== '' && acc.device_id.trim().toLowerCase() !== 'chưa liên kết';

                                return (
                                  <tr key={acc.username} className="hover:bg-[#080E1C] transition-colors group">
                                    <td className="py-3 px-6 font-mono">
                                      <div className="flex items-center gap-2 pl-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0"></span>
                                        <span className="font-bold text-cyan-300 bg-[#05080E] px-3 py-1 rounded-xl border border-slate-800/90 group-hover:border-cyan-500/40 transition truncate max-w-[210px]" title={acc.username}>
                                          {acc.username}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 font-mono text-slate-300 font-semibold truncate">
                                      {acc.password}
                                    </td>

                                    <td className="py-3 px-4 font-mono font-black text-emerald-400 truncate">
                                      {acc.tool_code || acc.toolCode || 'Chung'}
                                    </td>

                                    <td className="py-3 px-4 font-mono">
                                      {hasHwid ? (
                                        <span className="text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1.5 max-w-full shadow-sm">
                                          <Laptop className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                          <span className="truncate max-w-[130px]">{acc.device_id}</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 bg-slate-800/30 px-2.5 py-1 rounded-xl border border-slate-800/60 text-[11px] italic">Chưa liên kết</span>
                                      )}
                                    </td>

                                    <td className="py-3 px-4 text-center">
                                      <div className="flex justify-center">
                                        {renderRemainingTime(acc.expire_timestamp)}
                                      </div>
                                    </td>

                                    <td className="py-3 px-6 text-right whitespace-nowrap space-x-1.5">
                                      <button
                                        onClick={() => {
                                          setExtendModalData({ accountKey: acc.username, currentExpire: acc.expire_timestamp || 0 });
                                          setExtendDaysInput(1);
                                          setExtendHoursInput(0);
                                          setIsExtendLifetime(false);
                                        }}
                                        className="bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 px-2.5 py-1 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                                        title="Thêm giờ, thêm ngày hoặc đặt vĩnh viễn"
                                      >
                                        <Hourglass className="w-3.5 h-3.5" /> + Gia hạn
                                      </button>

                                      {hasHwid && (
                                        <button
                                          disabled={resettingHwid === acc.username}
                                          onClick={() => handleResetHwid(acc.username)}
                                          className="bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 font-bold px-2.5 py-1 rounded-xl text-[11px] transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                                          title="Xóa HWID để chuyển máy"
                                        >
                                          {resettingHwid === acc.username ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5 text-amber-400" />}
                                          <span>Reset</span>
                                        </button>
                                      )}

                                      <button
                                        disabled={deletingGistKey === acc.username}
                                        onClick={() => handleDeleteGistAccount(acc.username)}
                                        className="bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/25 text-rose-300 font-bold px-2.5 py-1 rounded-xl text-[11px] transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                                        title="Xóa tài khoản này khỏi Gist"
                                      >
                                        {deletingGistKey === acc.username ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                                        <span>Xóa</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. KHU VỰC RIÊNG CHO CÁC TÀI KHOẢN ĐÃ HẾT HẠN */}
                {expiredGistAccounts.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></span>
                        <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          DANH SÁCH TÀI KHOẢN ĐÃ HẾT HẠN QUYỀN DÙNG
                          <span className="text-rose-400 text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                            {expiredGistAccounts.length} Key hết hạn
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="overflow-x-auto border-2 border-rose-500/30 rounded-2xl bg-[#0C080E] shadow-2xl">
                      <table className="w-full text-left text-xs border-collapse table-fixed min-w-[1050px]">
                        <thead className="bg-[#140A10] text-rose-400 uppercase text-[10px] tracking-wider border-b border-rose-500/20 font-black select-none">
                          <tr>
                            <th className="py-4 px-6 w-[25%]">Key Tài Khoản Tool</th>
                            <th className="py-4 px-4 w-[11%]">Mật Khẩu</th>
                            <th className="py-4 px-4 w-[12%]">Mã Tool</th>
                            <th className="py-4 px-4 w-[17%]">Mã Thiết Bị (HWID)</th>
                            <th className="py-4 px-4 w-[15%] text-center">Trạng Thái</th>
                            <th className="py-4 px-6 w-[20%] text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-500/10">
                          {(() => {
                            const filteredExpired = expiredGistAccounts.filter(a => {
                              const search = gistSearch.toLowerCase();
                              return a.username.toLowerCase().includes(search) || 
                                (a.device_id && a.device_id.toLowerCase().includes(search)) ||
                                (a.tool_code && a.tool_code.toLowerCase().includes(search)) ||
                                (a.toolCode && a.toolCode.toLowerCase().includes(search));
                            });

                            if (filteredExpired.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={6} className="py-8 text-center text-slate-500 font-normal">
                                    Không có tài khoản hết hạn nào khớp với từ khóa tìm kiếm.
                                  </td>
                                </tr>
                              );
                            }

                            return filteredExpired.map((acc) => {
                              const hasHwid = acc.device_id && acc.device_id.trim() !== '' && acc.device_id.trim().toLowerCase() !== 'chưa liên kết';

                              return (
                                <tr key={acc.username} className="hover:bg-rose-500/5 transition-colors group">
                                  <td className="py-3 px-6 font-mono">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400/60 shrink-0"></span>
                                      <span className="font-bold text-rose-300 bg-[#05080E] px-3 py-1 rounded-xl border border-rose-500/30 truncate max-w-[210px]" title={acc.username}>
                                        {acc.username}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 font-mono text-slate-400 truncate">
                                    {acc.password}
                                  </td>

                                  <td className="py-3 px-4 font-mono font-bold text-slate-300 truncate">
                                    {acc.tool_code || acc.toolCode || 'Chung'}
                                  </td>

                                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] truncate">
                                    {hasHwid ? acc.device_id : 'Chưa liên kết'}
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <span className="text-rose-400 font-bold bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/40 text-[11px] inline-flex items-center gap-1">
                                      ⚠️ Hết Hạn Quyền Dùng
                                    </span>
                                  </td>

                                  <td className="py-3 px-6 text-right whitespace-nowrap space-x-1.5">
                                    <button
                                      onClick={() => {
                                        setExtendModalData({ accountKey: acc.username, currentExpire: acc.expire_timestamp || 0 });
                                        setExtendDaysInput(1);
                                        setExtendHoursInput(0);
                                        setIsExtendLifetime(false);
                                      }}
                                      className="bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 px-2.5 py-1 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                                      title="Gia hạn lại để sử dụng tiếp"
                                    >
                                      <Hourglass className="w-3.5 h-3.5" /> + Gia hạn
                                    </button>

                                    <button
                                      disabled={deletingGistKey === acc.username}
                                      onClick={() => handleDeleteGistAccount(acc.username)}
                                      className="bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/25 text-rose-300 font-bold px-2.5 py-1 rounded-xl text-[11px] transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                                      title="Xóa vĩnh viễn tài khoản hết hạn này"
                                    >
                                      {deletingGistKey === acc.username ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                                      <span>Xóa Acc</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: TRUNG TÂM LIVE CHAT ================= */}
        {activeTab === 'chat' && (
          <div className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Headset className="w-4 h-4 text-cyan-400" /> TRUNG TÂM CHAT & HỖ TRỢ KHÁCH HÀNG (REALTIME)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Tự động nhận và cập nhật tin nhắn tức thì • Hiển thị chi tiết thời gian gửi</p>
              </div>
              <button onClick={() => { loadChatUsers(); if (selectedChatUser) loadConversation(selectedChatUser); }} className="bg-[#05080E] border border-slate-800 hover:border-cyan-400 text-cyan-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition">
                <RefreshCw className="w-3.5 h-3.5" /> Làm mới hội thoại
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[530px]">
              <div className="md:col-span-4 bg-[#05080E] border border-slate-800 rounded-2xl p-3 space-y-2 overflow-y-auto">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block px-2">Khách hàng cần hỗ trợ ({chatUsers.length})</span>
                {chatUsers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Chưa có tin nhắn nào từ khách.</p>
                ) : (
                  chatUsers.map((u, i) => {
                    const unread = unreadCounts[u] || 0;
                    const isSelected = selectedChatUser === u;

                    return (
                      <button
                        key={i}
                        onClick={() => { 
                          setSelectedChatUser(u); 
                          loadConversation(u); 
                        }}
                        className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          isSelected ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'bg-[#0B1019] text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <User className="w-4 h-4 shrink-0" />
                          <span className="truncate">{u}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {unread > 0 && !isSelected && (
                            <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse">
                              {unread}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="md:col-span-8 bg-[#05080E] border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
                {selectedChatUser ? (
                  <>
                    <div className="bg-[#080D15] p-3 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        Đang chat với: <b className="text-cyan-400 font-mono">{selectedChatUser}</b>
                      </span>
                      
                      <button 
                        onClick={handleDeleteConversation}
                        className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Xóa toàn bộ tin nhắn với khách này"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa hội thoại
                      </button>
                    </div>

                    {/* VÙNG HIỂN THỊ TIN NHẮN TỰ ĐỘNG CUỘN NỘI BỘ */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#05080E] text-xs"
                    >
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          Chưa có tin nhắn nào trong hội thoại này.
                        </div>
                      ) : (
                        chatMessages.map((m, idx) => {
                          const isAdmin = m.sender_username === 'admin';
                          return (
                            <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                              <span className="text-[9px] text-slate-500 mb-1 font-mono">
                                {isAdmin ? 'Admin (Bạn)' : m.sender_username}
                              </span>

                              <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                                isAdmin 
                                  ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-none shadow-md' 
                                  : 'bg-[#0B1019] border border-slate-800 text-slate-100 rounded-tl-none'
                              }`}>
                                <p className="whitespace-pre-wrap break-words text-xs">{m.message}</p>
                              </div>

                              <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                                {formatMsgTime(m.created_at)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleAdminSendReply} className="p-3 bg-[#080D15] border-t border-slate-800 flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder={`Trả lời cho ${selectedChatUser}...`}
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 bg-[#05080E] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                      />
                      <button 
                        type="submit" 
                        disabled={sendingReply || !adminReplyText.trim()}
                        className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Gửi</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    Chọn một khách hàng ở danh sách bên trái để bắt đầu chat.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SẢN PHẨM TOOL */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveTool} className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 h-fit shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <Plus className="w-4 h-4 text-cyan-400" /> {isEditingTool ? `Cập nhật: ${toolForm.name}` : 'Thêm Tool mới'}
                </h3>
                {isEditingTool && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditingTool(false);
                      setImageFile(null);
                      setPreviewUrl('');
                      setToolForm({ 
                        id: 0, name: '', toolCode: '', image: '', status: 'Đang hoạt động', 
                        priceDay: '', priceWeek: '', priceMonth: '', priceLifetime: '', 
                        description: '', downloadLink: '', videoLink: '', version: '', changelog: '' 
                      });
                    }}
                    className="text-[10px] text-rose-400 hover:text-white px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 transition cursor-pointer"
                  >
                    Hủy sửa
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Tên Tool</label>
                <input type="text" required value={toolForm.name} onChange={e => setToolForm({ ...toolForm, name: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400" placeholder="vd: AUTO FARM F17" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-cyan-400 mb-1 font-bold">Mã Tool (Gist)</label>
                  <input type="text" required value={toolForm.toolCode} onChange={e => setToolForm({ ...toolForm, toolCode: e.target.value })} className="w-full bg-[#05080E] border border-cyan-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono" placeholder="vd: congtruongf17" />
                </div>
                <div>
                  <label className="block text-[11px] text-cyan-300 mb-1 font-bold">Phiên bản hiện tại</label>
                  <input type="text" value={toolForm.version} onChange={e => setToolForm({ ...toolForm, version: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-bold" placeholder="vd: v2.0 hoặc v1.8" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Trạng Thái</label>
                <select value={toolForm.status} onChange={e => setToolForm({ ...toolForm, status: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400 font-bold">Ảnh sản phẩm</label>
                <label className="flex items-center justify-center gap-2 bg-[#05080E] border border-dashed border-slate-800 text-slate-300 p-3 rounded-xl text-xs cursor-pointer hover:border-cyan-400">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Chọn ảnh...' }</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {(previewUrl || toolForm.image) && (
                  <div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-xl overflow-hidden relative">
                    <img src={previewUrl || toolForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-500" /> Link Video Youtube (Giới thiệu)
                </label>
                <input type="text" value={toolForm.videoLink || ''} onChange={e => setToolForm({ ...toolForm, videoLink: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400" placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[10px] text-slate-400 font-bold">Giá Ngày</label><input type="text" value={toolForm.priceDay} onChange={e => setToolForm({ ...toolForm, priceDay: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-xs text-white font-mono" placeholder="5000" /></div>
                <div><label className="block text-[10px] text-slate-400 font-bold">Giá Tuần</label><input type="text" value={toolForm.priceWeek} onChange={e => setToolForm({ ...toolForm, priceWeek: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-xs text-white font-mono" placeholder="20000" /></div>
                <div><label className="block text-[10px] text-slate-400 font-bold">Giá Tháng</label><input type="text" value={toolForm.priceMonth} onChange={e => setToolForm({ ...toolForm, priceMonth: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-xs text-white font-mono" placeholder="50000" /></div>
                <div><label className="block text-[10px] text-slate-400 font-bold">Giá Vĩnh Viễn</label><input type="text" value={toolForm.priceLifetime} onChange={e => setToolForm({ ...toolForm, priceLifetime: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-xs text-white font-mono" placeholder="100000" /></div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Mô tả sản phẩm</label>
                <textarea value={toolForm.description} onChange={e => setToolForm({ ...toolForm, description: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white leading-relaxed" rows={3} placeholder="Mô tả các tính năng chính của tool..." />
              </div>

              {/* KHUNG NHẬP CHANGELOG */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-cyan-400 font-bold flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" /> Lịch sử các phiên bản (Changelog):
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => appendChangelogTemplate(toolForm.version || 'v2.0')}
                      className="text-[10px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded transition cursor-pointer"
                      title="Chèn khung phiên bản hiện tại"
                    >
                      + Bản Hiện Tại
                    </button>
                    <button
                      type="button"
                      onClick={() => appendChangelogTemplate('v1.0 - Bản Cũ')}
                      className="text-[10px] font-bold text-slate-400 bg-slate-800 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
                      title="Chèn lịch sử bản cũ"
                    >
                      + Bản Cũ
                    </button>
                  </div>
                </div>

                <textarea 
                  value={toolForm.changelog} 
                  onChange={e => setToolForm({ ...toolForm, changelog: e.target.value })} 
                  className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed font-mono focus:outline-none focus:border-cyan-400" 
                  rows={4} 
                  placeholder="[v2.0 - Mới nhất]&#10;- Tối ưu tốc độ di chuyển và tự động hóa&#10;- Thêm cơ chế vượt Anticheat mới&#10;&#10;[v1.0 - Bản Cũ]&#10;- Khởi tạo tính năng tự động cơ bản"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Link Tải Tool</label>
                <input type="text" value={toolForm.downloadLink} onChange={e => setToolForm({ ...toolForm, downloadLink: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white" placeholder="https://..." />
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl text-xs font-black transition cursor-pointer shadow-md">
                {isUploading ? 'ĐANG UPLOAD...' : isEditingTool ? 'LƯU CẬP NHẬT TOOL NÀY' : 'LƯU SẢN PHẨM MỚI'}
              </button>
            </form>
            
            {/* DANH SÁCH TOOL VỚI NÚT SỬA NHANH TỪNG SẢN PHẨM */}
            <div className="lg:col-span-2 bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-xs font-bold text-white uppercase">DANH SÁCH TOOL ĐANG BÁN ({tools.length})</h3>
                <span className="text-[11px] text-slate-400">Bấm nút Sửa để cập nhật phiên bản & lịch sử</span>
              </div>

              <div className="space-y-3">
                {tools.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có sản phẩm Tool nào.</p>
                ) : (
                  tools.map((t) => (
                    <div key={t.id} className="bg-[#05080E] border border-slate-800 p-4 rounded-2xl space-y-3 hover:border-cyan-500/40 transition">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          {t.image && (
                            <div className="w-16 h-16 bg-[#0B1019] border border-slate-800 rounded-xl overflow-hidden shrink-0">
                              <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-xs">{t.name}</h4>
                              {t.version ? (
                                <span className="text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.2 rounded-md">
                                  {t.version}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.2 rounded-md italic">
                                  Chưa có ver
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-cyan-300 block mt-0.5">Mã Tool: {t.toolCode}</span>
                            <span className={`inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded border ${t.status === 'Tạm ngưng' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'}`}>
                              {t.status ? t.status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { 
                              setToolForm({
                                id: t.id,
                                name: t.name || '',
                                toolCode: t.toolCode || '',
                                image: t.image || '',
                                status: t.status || 'Đang hoạt động',
                                priceDay: t.priceDay || '',
                                priceWeek: t.priceWeek || '',
                                priceMonth: t.priceMonth || '',
                                priceLifetime: t.priceLifetime || '',
                                description: t.description || '',
                                downloadLink: t.downloadLink || '',
                                videoLink: t.videoLink || '',
                                version: t.version || '',
                                changelog: t.changelog || ''
                              }); 
                              setPreviewUrl(t.image); 
                              setIsEditingTool(true); 
                              window.scrollTo({ top: 400, behavior: 'smooth' });
                            }} 
                            className="bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 p-2 rounded-xl cursor-pointer transition flex items-center gap-1.5 text-xs font-bold" 
                            title="Sửa thông tin và cập nhật phiên bản"
                          >
                            <Edit className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteTool(t.id)} 
                            className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-xl cursor-pointer transition" 
                            title="Xóa Tool"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {t.changelog ? (
                        <div className="text-[11px] text-slate-300 bg-[#0B1019] border border-slate-800/80 p-2.5 rounded-xl space-y-1">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Nhật ký cập nhật:
                          </span>
                          <p className="whitespace-pre-line leading-relaxed font-mono text-slate-400 pl-1 text-[11px]">
                            {t.changelog}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 bg-[#0B1019] border border-slate-800/40 p-2 rounded-xl flex items-center justify-between">
                          <span className="italic">Chưa nhập nhật ký bản cập nhật cho tool này.</span>
                          <button 
                            onClick={() => {
                              setToolForm({
                                id: t.id,
                                name: t.name || '',
                                toolCode: t.toolCode || '',
                                image: t.image || '',
                                status: t.status || 'Đang hoạt động',
                                priceDay: t.priceDay || '',
                                priceWeek: t.priceWeek || '',
                                priceMonth: t.priceMonth || '',
                                priceLifetime: t.priceLifetime || '',
                                description: t.description || '',
                                downloadLink: t.downloadLink || '',
                                videoLink: t.videoLink || '',
                                version: t.version || '',
                                changelog: t.changelog || ''
                              }); 
                              setPreviewUrl(t.image); 
                              setIsEditingTool(true); 
                              window.scrollTo({ top: 400, behavior: 'smooth' });
                            }}
                            className="text-cyan-400 font-bold hover:underline text-[10px] cursor-pointer"
                          >
                            + Thêm ngay
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B1019] border border-slate-800 p-2.5 rounded-xl text-[11px]">
                        <div><span className="text-slate-500 block">Ngày:</span><b className="text-emerald-400 font-mono">{t.priceDay ? `${Number(t.priceDay).toLocaleString('vi-VN')}đ` : '---'}</b></div>
                        <div><span className="text-slate-500 block">Tuần:</span><b className="text-emerald-400 font-mono">{t.priceWeek ? `${Number(t.priceWeek).toLocaleString('vi-VN')}đ` : '---'}</b></div>
                        <div><span className="text-slate-500 block">Tháng:</span><b className="text-emerald-400 font-mono">{t.priceMonth ? `${Number(t.priceMonth).toLocaleString('vi-VN')}đ` : '---'}</b></div>
                        <div><span className="text-slate-500 block">Vĩnh viễn:</span><b className="text-cyan-300 font-mono">{t.priceLifetime ? `${Number(t.priceLifetime).toLocaleString('vi-VN')}đ` : '---'}</b></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MÃ GIẢM GIÁ */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleCreateCoupon} className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 h-fit shadow-xl">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3 uppercase tracking-wider">
                <Plus className="w-4 h-4 text-cyan-400" /> Tạo Mã Giảm Giá Mới
              </h3>
              
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Mã Code</label>
                <input type="text" required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono uppercase focus:border-cyan-400" placeholder="VD: GIAM20PT, SALE5K" />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Tool áp dụng</label>
                <select value={couponForm.toolCode} onChange={e => setCouponForm({ ...couponForm, toolCode: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                  <option value="ALL">Tất cả sản phẩm (ALL)</option>
                  {tools.map((t) => (<option key={t.id} value={t.toolCode || t.tool_code}>{t.name}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">Hình thức giảm giá</label>
                <div className="grid grid-cols-2 gap-2 bg-[#05080E] p-1 rounded-xl border border-slate-800 text-xs">
                  <button type="button" onClick={() => setCouponForm({ ...couponForm, discountType: 'FIXED' })} className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${couponForm.discountType === 'FIXED' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}><DollarSign className="w-3.5 h-3.5" /> Giảm Số Tiền</button>
                  <button type="button" onClick={() => setCouponForm({ ...couponForm, discountType: 'PERCENT' })} className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${couponForm.discountType === 'PERCENT' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}><Percent className="w-3.5 h-3.5" /> Giảm %</button>
                </div>
              </div>

              {couponForm.discountType === 'FIXED' ? (
                <div><label className="block text-[11px] text-slate-400 mb-1 font-bold">Số tiền giảm trực tiếp (VNĐ)</label><input type="number" min="1000" required value={couponForm.discountAmount} onChange={e => setCouponForm({ ...couponForm, discountAmount: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono" /></div>
              ) : (
                <div><label className="block text-[11px] text-slate-400 mb-1 font-bold">Phần trăm giảm (1% - 100%)</label><input type="number" min="1" max="100" required value={couponForm.discountPercent} onChange={e => setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono" /></div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] text-slate-400 mb-1 font-bold">Tổng lượt dùng toàn shop</label><input type="number" min="1" required value={couponForm.quantity} onChange={e => setCouponForm({ ...couponForm, quantity: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono" /></div>
                <div><label className="block text-[11px] text-slate-400 mb-1 font-bold">Giới hạn/tài khoản</label><input type="number" min="1" required value={couponForm.maxUsesPerUser} onChange={e => setCouponForm({ ...couponForm, maxUsesPerUser: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono" /></div>
              </div>

              <button type="submit" className="w-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 py-3 rounded-xl text-xs font-black transition cursor-pointer shadow-sm hover:bg-cyan-500 hover:text-slate-950">PHÁT HÀNH MÃ GIẢM GIÁ</button>
            </form>

            <div className="lg:col-span-2 bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white border-b border-slate-800/80 pb-3 uppercase tracking-wider">DANH SÁCH MÃ GIẢM GIÁ HIỆN HÀNH ({coupons.length})</h3>
              <div className="space-y-3">
                {coupons.map((c) => {
                  const isPercent = c.discount_type === 'PERCENT' || (c.discount_percent && Number(c.discount_percent) > 0);
                  const discountLabel = isPercent ? `-${c.discount_percent}%` : `-${Number(c.discount_amount || 0).toLocaleString('vi-VN')}đ`;
                  return (
                    <div key={c.id} className="bg-[#05080E] border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-cyan-500/40 transition">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2"><span className="font-mono font-black text-cyan-300 text-sm bg-cyan-500/10 px-3 py-0.5 rounded-lg border border-cyan-500/30">{c.code}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${isPercent ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{isPercent ? 'GIẢM %' : 'GIẢM SỐ TIỀN'}</span></div>
                        <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap"><span>Mức giảm: <b className="text-emerald-400 font-mono font-black">{discountLabel}</b></span><span>|</span><span>Còn lại: <b className="text-amber-400 font-mono font-bold">{c.quantity}</b></span><span>|</span><span>Tool: <b className="text-slate-400 font-mono uppercase">{c.tool_code || 'ALL'}</b></span></div>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-xl cursor-pointer transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DỰ ÁN SHOP */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveProject} className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 h-fit shadow-xl">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3 uppercase"><Plus className="w-4 h-4 text-cyan-400" /> Thêm dự án mới</h3>
              <div><label className="block text-xs text-slate-400 mb-1 font-bold">Tên Dự Án</label><input type="text" required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white" /></div>
              <div className="space-y-2"><label className="block text-[11px] text-slate-400 font-bold">Ảnh Minh Họa</label><label className="flex items-center justify-center gap-2 bg-[#05080E] border border-dashed border-slate-800 text-slate-300 p-3 rounded-xl text-xs cursor-pointer hover:border-cyan-400"><Upload className="w-4 h-4 text-cyan-400" /><span className="truncate">{projectImageFile ? projectImageFile.name : 'Chọn file ảnh...'}</span><input type="file" accept="image/*" onChange={handleProjectFileChange} className="hidden" /></label>{(projectPreviewUrl || projectForm.image) && (<div className="w-full aspect-square bg-[#05080E] border border-slate-800 rounded-xl overflow-hidden relative"><img src={projectPreviewUrl || projectForm.image} alt="Preview" className="w-full h-full object-cover" /></div>)}</div>
              <div><label className="block text-xs text-slate-400 mb-1 font-bold">Tình trạng</label><select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white"><option value="Hoạt động tốt">Hoạt động tốt</option><option value="Đang bảo trì">Đang bảo trì</option></select></div>
              <div><label className="block text-xs text-slate-400 mb-1 font-bold">Mô tả dự án</label><textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white" rows={3} /></div>
              <button type="submit" disabled={isUploadingProject} className="w-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 py-3 rounded-xl text-xs font-black transition cursor-pointer">{isUploadingProject ? 'ĐANG UPLOAD...' : 'LƯU DỰ ÁN'}</button>
            </form>
            <div className="lg:col-span-2 bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white border-b border-slate-800/80 pb-3 uppercase">DANH SÁCH DỰ ÁN</h3>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="bg-[#05080E] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">{p.image && (<div className="w-16 h-16 bg-[#0B1019] border border-slate-800 rounded-xl overflow-hidden shrink-0"><img src={p.image} alt={p.title} className="w-full h-full object-cover" /></div>)}<div><h4 className="font-bold text-white text-xs">{p.title}</h4><span className="text-[10px] text-cyan-300 font-bold">{p.status}</span></div></div>
                    <button onClick={() => handleDeleteProject(p.id)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LỊCH SỬ SEPAY */}
        {activeTab === 'sepay' && (
          <div className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white border-b border-slate-800/80 pb-3 uppercase flex items-center gap-2"><CreditCard className="w-4 h-4 text-cyan-400" /> LỊCH SỬ NẠP TIỀN, THƯỞNG & GIA HẠN TÀI KHOẢN</h2>
            <div className="overflow-x-auto border border-slate-800/60 rounded-2xl bg-[#05080E]/40">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#05080E] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800"><tr><th className="p-3.5">Tài khoản</th><th className="p-3.5">Nội dung</th><th className="p-3.5">Số tiền</th><th className="p-3.5">Thời gian</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sepayLogs.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-slate-500">Chưa có giao dịch nào.</td></tr> : sepayLogs.map((s, i) => (
                    <tr key={i} className="hover:bg-[#05080E]/60 transition">
                      <td className="p-3.5 font-bold text-white">{s.username}</td>
                      <td className="p-3.5">{s.title || s.content}</td>
                      <td className="p-3.5 font-black text-emerald-400 font-mono">{Number(s.amount) > 0 ? `+${Number(s.amount).toLocaleString('vi-VN')}đ` : `${Number(s.amount || 0).toLocaleString('vi-VN')}đ`}</td>
                      <td className="p-3.5 font-mono text-slate-400">{s.created_at ? new Date(s.created_at).toLocaleString('vi-VN') : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: ĐÓNG GÓP Ý KIẾN */}
        {activeTab === 'feedback' && (
          <div className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white border-b border-slate-800/80 pb-3 uppercase flex items-center gap-2"><MessageSquare className="w-4 h-4 text-cyan-400" /> Ý KIẾN ĐÓNG GÓP TỪ KHÁCH HÀNG</h2>
            <div className="space-y-3">
              {feedbacks.length === 0 ? <p className="text-xs text-slate-500 text-center py-6">Chưa có ý kiến đóng góp nào.</p> : feedbacks.map((f) => (
                <div key={f.id} className="bg-[#05080E] border border-slate-800 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div><span className="text-xs font-bold text-cyan-300">{f.username || 'Khách ẩn danh'}</span><p className="text-xs text-slate-300 mt-1 whitespace-pre-line leading-relaxed">{f.content}</p></div>
                  <button onClick={() => handleDeleteFeedback(f.id)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: THÔNG BÁO CHUNG & SỰ KIỆN */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CỤM 1: CẤU HÌNH SỰ KIỆN NẠP TIỀN */}
            <div className="bg-[#0B1019] border-2 border-emerald-500/40 rounded-3xl p-6 space-y-4 h-fit shadow-xl shadow-emerald-500/5">
              <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2 border-b border-slate-800/80 pb-3 uppercase">
                <Gift className="w-4 h-4 text-emerald-400" /> SỰ KIỆN KHUYẾN MÃI NẠP TIỀN
              </h3>
              <div className="space-y-4">
                <div className="bg-[#05080E] border border-slate-800 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-300">% Khuyến mãi nạp thưởng (VD: 10 = +10%):</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={bonusEventForm.percent} 
                      onChange={e => setBonusEventForm({ ...bonusEventForm, percent: Number(e.target.value) })} 
                      className="w-full bg-[#0B1019] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono font-black focus:border-emerald-400" 
                    />
                    <span className="text-emerald-400 font-black text-sm font-mono">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">* Ví dụ nạp 20.000đ nhận 22.000đ (20k gốc + 2k thưởng sự kiện).</p>
                </div>

                <div className="flex items-center justify-between bg-[#05080E] border border-slate-800 p-4 rounded-xl">
                  <label className="text-xs font-bold text-slate-300">Trạng thái sự kiện nạp:</label>
                  <button 
                    onClick={() => setBonusEventForm({ ...bonusEventForm, active: !bonusEventForm.active })} 
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-2 ${bonusEventForm.active ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {bonusEventForm.active ? <><CheckCircle2 className="w-4 h-4"/> ĐANG BẬT (+{bonusEventForm.percent}%)</> : <><Ban className="w-4 h-4"/> ĐANG TẮT</>}
                  </button>
                </div>

                <button 
                  onClick={handleSaveBonusEvent} 
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> LƯU & ÁP DỤNG SỰ KIỆN NẠP TIỀN
                </button>
              </div>
            </div>

            {/* CỤM 2: THÔNG BÁO HỆ THỐNG */}
            <div className="bg-[#0B1019] border border-slate-800/80 rounded-3xl p-6 space-y-4 h-fit shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3 uppercase">
                <Bell className="w-4 h-4 text-amber-400" /> Soạn thảo thông báo chung
              </h3>
              <div className="space-y-4">
                <div className="bg-[#05080E] border border-slate-800 p-4 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Nội dung thông báo:</label>
                  <textarea 
                    rows={4} 
                    value={noticeForm.text} 
                    onChange={e => setNoticeForm({ ...noticeForm, text: e.target.value })} 
                    className="w-full bg-[#0B1019] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition leading-relaxed" 
                    placeholder="Nhập nội dung thông báo hiển thị cho khách..." 
                  />
                </div>
                <div className="flex items-center justify-between bg-[#05080E] border border-slate-800 p-4 rounded-xl">
                  <label className="text-xs font-bold text-slate-300">Trạng thái bật/tắt hiển thị:</label>
                  <button 
                    onClick={() => setNoticeForm({ ...noticeForm, active: !noticeForm.active })} 
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer flex items-center gap-2 ${noticeForm.active ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {noticeForm.active ? <><CheckCircle2 className="w-4 h-4"/> ĐANG BẬT</> : <><Ban className="w-4 h-4"/> ĐANG TẮT</>}
                  </button>
                </div>
                <button 
                  onClick={handleSaveNotice} 
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> LƯU VÀ PHÁT HÀNH THÔNG BÁO
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ================= MODAL GIA HẠN THỜI GIAN CHO KEY ================= */}
      {extendModalData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1019] border-2 border-cyan-400/80 w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-5 relative shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <button onClick={() => setExtendModalData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 cursor-pointer hover:border-cyan-400 transition"><X className="w-5 h-5" /></button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Hourglass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">GIA HẠN KEY TOOL</span>
                <h3 className="text-sm font-mono font-black text-white truncate max-w-[240px]">{extendModalData.accountKey}</h3>
              </div>
            </div>

            <div className="bg-[#05080E] border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Thời hạn hiện tại:</span>
              <span>{renderRemainingTime(extendModalData.currentExpire)}</span>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 text-slate-300 font-bold cursor-pointer bg-[#05080E] p-3 rounded-xl border border-slate-800 hover:border-cyan-500/40">
                <input 
                  type="checkbox" 
                  checked={isExtendLifetime} 
                  onChange={(e) => setIsExtendLifetime(e.target.checked)} 
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer" 
                />
                <span>Kích hoạt gói <b>VĨNH VIỄN</b> (Không giới hạn thời gian)</span>
              </label>

              {!isExtendLifetime && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400">Cộng thêm Ngày:</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={extendDaysInput} 
                      onChange={e => setExtendDaysInput(Math.max(0, Number(e.target.value)))} 
                      className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-cyan-400" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400">Cộng thêm Giờ:</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="23" 
                      value={extendHoursInput} 
                      onChange={e => setExtendHoursInput(Math.max(0, Number(e.target.value)))} 
                      className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-cyan-400" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                disabled={extendingLoading} 
                onClick={handleExecuteExtendTime} 
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                {extendingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>XÁC NHẬN CẬP NHẬT</span>
              </button>
              <button 
                onClick={() => setExtendModalData(null)} 
                className="px-4 bg-[#05080E] border border-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs cursor-pointer hover:text-white"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 1: LỊCH SỬ GIAO DỊCH NỔI */}
      {selectedUserHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1019] border-2 border-cyan-500/50 w-full max-w-2xl rounded-3xl p-6 space-y-4 relative shadow-[0_0_50px_rgba(6,182,212,0.25)] max-h-[85vh] flex flex-col">
            <button onClick={() => setSelectedUserHistory(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 transition cursor-pointer hover:border-cyan-400"><X className="w-5 h-5" /></button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><History className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">LỊCH SỬ TÀI KHOẢN</span>
                <h2 className="text-base font-black text-white">{selectedUserHistory.username}</h2>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              {loadingUserHistory ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Đang tải lịch sử...</div>
              ) : selectedUserHistory.logs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">Tài khoản này chưa có lịch sử giao dịch nào.</div>
              ) : (
                <div className="space-y-2.5">
                  {selectedUserHistory.logs.map((log, idx) => (
                    <div key={idx} className="bg-[#05080E] border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{log.title || 'Biến động số dư'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ''}</span>
                      </div>
                      <span className={`font-mono font-black text-sm ${log.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {log.amount > 0 ? `+${log.amount.toLocaleString('vi-VN')}đ` : `${log.amount.toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: ĐỔI MẬT KHẨU NỔI */}
      {editUserPass && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1019] border-2 border-cyan-500/50 w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <button onClick={() => setEditUserPass(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 transition cursor-pointer hover:border-cyan-400"><X className="w-5 h-5" /></button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><Key className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">ĐỔI MẬT KHẨU</span>
                <h2 className="text-base font-black text-white">{editUserPass.username}</h2>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">Mật khẩu mới:</label>
              <input 
                type="text" 
                placeholder="Nhập mật khẩu mới..." 
                value={editUserPass.newPass} 
                onChange={e => setEditUserPass({ ...editUserPass, newPass: e.target.value })} 
                className="w-full bg-[#05080E] border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none transition font-mono" 
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveUserPassword} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md">LƯU MẬT KHẨU MỚI</button>
              <button onClick={() => setEditUserPass(null)} className="px-4 bg-[#05080E] border border-slate-800 hover:border-slate-700 text-slate-400 font-bold py-3 rounded-xl text-xs transition cursor-pointer">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: CỘNG/TRỪ TIỀN VÍ NỔI */}
      {adjustBal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1019] border-2 border-emerald-500/50 w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-[0_0_50px_rgba(16,185,129,0.25)]">
            <button onClick={() => setAdjustBal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 transition cursor-pointer hover:border-emerald-400"><X className="w-5 h-5" /></button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><DollarSign className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">ĐIỀU CHỈNH SỐ DƯ VÍ</span>
                <h2 className="text-base font-black text-white">{adjustBal.username}</h2>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">Số tiền biến động (VNĐ):</label>
              <input 
                type="number" 
                placeholder="Nhập số tiền (VD: 50000)..." 
                value={adjustBal.amount || ''} 
                onChange={e => setAdjustBal({ ...adjustBal, amount: Number(e.target.value) })} 
                className="w-full bg-[#05080E] border border-slate-800 focus:border-emerald-400 rounded-xl p-3 text-xs text-white focus:outline-none transition font-mono" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => handleExecAdjustBalance(true)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md">+ CỘNG VÀO VÍ</button>
              <button onClick={() => handleExecAdjustBalance(false)} className="bg-rose-500 hover:bg-rose-400 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md">- TRỪ KHỎI VÍ</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}