'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  User, Lock, LogIn, UserPlus, LogOut, Wallet, X, AlertCircle, CheckCircle2,
  PlusCircle, History, Calendar, CreditCard, Copy, Check, ChevronDown, Key
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
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
  
  const [rechargeAmount, setRechargeAmount] = useState('50000');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkLoggedInUser();

    // Lắng nghe click bên ngoài để đóng Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      }
    }
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
            isBanned: false
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
        setAuthMsg({ type: 'success', text: 'Đăng ký tài khoản thành công!' });
        setTimeout(() => {
          setShowAuthModal(false);
          resetForm();
        }, 1200);
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
      }, 1000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ztool_current_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
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
      <nav className="bg-[#0D121D]/90 backdrop-blur-md border-b border-[#1C2638] sticky top-0 z-40 px-4 lg:px-10 py-3 flex items-center justify-between">
        {/* LOGO SHOP */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
            Z
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider leading-none">ZTOOL</h1>
            <span className="text-[10px] text-cyan-400 font-bold tracking-tight">Chuyên Cung Cấp Tool FiveM</span>
          </div>
        </Link>

        {/* MENU ĐIỀU HƯỚNG */}
        <div className="hidden md:flex items-center gap-1 bg-[#06090E] p-1.5 rounded-2xl border border-[#1C2638]">
          <Link 
            href="/" 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              pathname === '/' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-[#0D121D]'
            }`}
          >
            Trang chủ
          </Link>
          <Link 
            href="/tools" 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              pathname === '/tools' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-[#0D121D]'
            }`}
          >
            TOOL AUTO
          </Link>
          <Link 
            href="/projects" 
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              pathname === '/projects' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-[#0D121D]'
            }`}
          >
            Dự án
          </Link>
        </div>

        {/* USER PROFILE & ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Nút Nạp Tiền Nổi Bật */}
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Nạp tiền
              </button>

              {/* Profile Card & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 bg-[#06090E] border border-[#1C2638] hover:border-cyan-500/50 p-1.5 pl-3 rounded-2xl transition cursor-pointer"
                >
                  <div className="text-right leading-tight">
                    <span className="text-xs font-black text-white block">{currentUser.username}</span>
                    <span className="text-[10px] font-extrabold text-emerald-400">
                      {(currentUser.balance || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                    {currentUser.username.substring(0, 1).toUpperCase()}
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition duration-200 mr-1 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Mở Ra */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0D121D] border border-[#1C2638] rounded-2xl p-2 shadow-2xl space-y-1 z-50">
                    <button
                      onClick={() => { setShowAccountInfoModal(true); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-[#141C2B] transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-cyan-400" /> Thông tin tài khoản
                    </button>

                    <button
                      onClick={() => { setShowHistoryModal(true); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-[#141C2B] transition cursor-pointer"
                    >
                      <History className="w-4 h-4 text-emerald-400" /> Lịch sử giao dịch
                    </button>

                    <div className="border-t border-[#1C2638] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthModalMode('login'); resetForm(); setShowAuthModal(true); }}
                className="bg-[#06090E] border border-[#1C2638] hover:border-slate-500 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" /> ĐĂNG NHẬP
              </button>
              <button
                onClick={() => { setAuthModalMode('register'); resetForm(); setShowAuthModal(true); }}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" /> ĐĂNG KÝ
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MODAL 1: BẢNG NẠP TIỀN TỰ ĐỘNG BẰNG QR SEPAY */}
      {showRechargeModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-[#1C2638] w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowRechargeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
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
                  <button
                    key={amt}
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      rechargeAmount === amt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#06090E] border-[#1C2638] text-slate-400'
                    }`}
                  >
                    {Number(amt).toLocaleString('vi-VN')}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Mã QR Tự Động */}
            <div className="bg-[#06090E] border border-[#1C2638] p-4 rounded-2xl flex flex-col items-center space-y-3 text-center">
              <img
                src={`https://qr.sepay.vn/img?bank=MBBank&acc=0389178917&template=compact&amount=${rechargeAmount}&des=NAP%20${currentUser.username}`}
                alt="QR SePay"
                className="w-48 h-48 rounded-xl bg-white p-2"
              />
              <div className="space-y-1 w-full text-xs">
                <div className="flex justify-between items-center bg-[#0D121D] p-2.5 rounded-xl border border-[#1C2638]">
                  <span className="text-slate-400">Nội dung chuyển khoản:</span>
                  <button
                    onClick={() => copyToClipboard(`NAP ${currentUser.username}`)}
                    className="font-black text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
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

      {/* MODAL 2: BẢNG LỊCH SỬ GIAO DỊCH */}
      {showHistoryModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-[#1C2638] w-full max-w-lg rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#1C2638] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">LỊCH SỬ GIAO DỊCH TÀI KHOẢN</h3>
                <p className="text-xs text-slate-400">Nhật ký nạp tiền và mua Key của {currentUser.username}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <div className="bg-[#06090E] border border-[#1C2638] p-3 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">Tài khoản được khởi tạo</span>
                  <span className="text-[10px] text-slate-500">
                    {currentUser.created_at ? new Date(currentUser.created_at).toLocaleString('vi-VN') : 'Gần đây'}
                  </span>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Thành công
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM THÔNG TIN TÀI KHOẢN */}
      {showAccountInfoModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-[#1C2638] w-full max-w-sm rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowAccountInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto text-2xl font-black">
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

      {/* MODAL AUTH DÀNH CHO ĐĂNG NHẬP / ĐĂNG KÝ */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-[#1C2638] w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
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
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                authMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                {authMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{authMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên tài khoản (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập username..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Xác nhận mật khẩu..."
                      value={rePasswordInput}
                      onChange={(e) => setRePasswordInput(e.target.value)}
                      className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer mt-2"
              >
                {loading ? 'ĐANG XỬ LÝ...' : authMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN NGAY'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#1C2638]">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-400">
                  Chưa có tài khoản?{' '}
                  <button onClick={() => { setAuthModalMode('register'); resetForm(); }} className="text-cyan-400 font-bold hover:underline cursor-pointer">
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Đã có tài khoản?{' '}
                  <button onClick={() => { setAuthModalMode('login'); resetForm(); }} className="text-cyan-400 font-bold hover:underline cursor-pointer">
                    Đăng nhập
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}