'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, Lock, LogIn, UserPlus, LogOut, Wallet, X, AlertCircle, CheckCircle2,
  PlusCircle, History, Calendar, CreditCard, Copy, Check
} from 'lucide-react';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Modal Auth States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rePasswordInput, setRePasswordInput] = useState('');
  const [authMsg, setAuthMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals Tính Năng Mới
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  
  const [rechargeAmount, setRechargeAmount] = useState('50000');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkLoggedInUser();
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
      <nav className="bg-[#0D121D] border-b border-[#1A2332] sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-neonBlue to-cyanGlow p-0.5 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-neonBlue/20">
            Z
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wide leading-none">ZTOOL</h1>
            <span className="text-[10px] text-cyanGlow font-bold">Chuyên Cung Cấp Tool FiveM</span>
          </div>
        </Link>

        {/* Menu Điều Hướng Trang */}
        <div className="hidden md:flex items-center gap-2 bg-[#080B10] p-1.5 rounded-2xl border border-[#1A2332]">
          <Link href="/" className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0F141C] transition">
            Trang chủ
          </Link>
          <Link href="/tools" className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0F141C] transition">
            TOOL AUTO
          </Link>
          <Link href="/projects" className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0F141C] transition">
            Dự án
          </Link>
        </div>

        {/* Khung Thông Tin Tài Khoản & Các Nút Chức Năng Nạp Tiền / Lịch Sử */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#080B10] border border-[#1A2332] p-1.5 rounded-2xl">
              {/* Nút Xem Thông Tin Tài Khoản */}
              <button
                onClick={() => setShowAccountInfoModal(true)}
                className="text-right px-2.5 py-1 hover:bg-[#0F141C] rounded-xl transition cursor-pointer"
                title="Bấm để xem thông tin tài khoản"
              >
                <span className="text-xs font-bold text-white block">{currentUser.username}</span>
                <span className="text-[10px] font-extrabold text-emerald-400 flex items-center justify-end gap-1">
                  <Wallet className="w-3 h-3" /> {(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </button>

              {/* Nút Nạp Tiền */}
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Nạp tiền vào ví"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Nạp tiền
              </button>

              {/* Nút Lịch Sử Giao Dịch */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="bg-[#0F141C] border border-[#1A2332] hover:border-slate-500 text-gray-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Xem lịch sử giao dịch"
              >
                <History className="w-3.5 h-3.5 text-cyanGlow" /> Lịch sử
              </button>

              {/* Nút Đăng Xuất */}
              <button
                onClick={handleLogout}
                className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 p-2 rounded-xl transition cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthModalMode('login'); resetForm(); setShowAuthModal(true); }}
                className="bg-[#080B10] border border-[#1A2332] hover:border-gray-500 text-gray-200 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-cyanGlow" /> ĐĂNG NHẬP
              </button>
              <button
                onClick={() => { setAuthModalMode('register'); resetForm(); setShowAuthModal(true); }}
                className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black text-xs font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-neonBlue/10"
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
          <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-md rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowRechargeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">NẠP TIỀN VÀO VÍ TỰ ĐỘNG</h3>
                <p className="text-xs text-gray-400">Quét mã QR chuyển khoản để cộng tiền 24/7</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-300">Chọn số tiền muốn nạp:</label>
              <div className="grid grid-cols-3 gap-2">
                {['20000', '50000', '100000', '200000', '500000', '1000000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      rechargeAmount === amt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    {Number(amt).toLocaleString('vi-VN')}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Mã QR Tự Động */}
            <div className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex flex-col items-center space-y-3 text-center">
              <img
                src={`https://qr.sepay.vn/img?bank=MBBank&acc=0389178917&template=compact&amount=${rechargeAmount}&des=NAP%20${currentUser.username}`}
                alt="QR SePay"
                className="w-48 h-48 rounded-xl bg-white p-2"
              />
              <div className="space-y-1 w-full text-xs">
                <div className="flex justify-between items-center bg-[#0F141C] p-2.5 rounded-xl border border-[#1A2332]">
                  <span className="text-gray-400">Nội dung chuyển khoản:</span>
                  <button
                    onClick={() => copyToClipboard(`NAP ${currentUser.username}`)}
                    className="font-black text-cyanGlow flex items-center gap-1 hover:underline cursor-pointer"
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
          <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-lg rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyanGlow">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">LỊCH SỬ GIAO DỊCH TÀI KHOẢN</h3>
                <p className="text-xs text-gray-400">Nhật ký nạp tiền và mua Key của {currentUser.username}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">Tài khoản được khởi tạo</span>
                  <span className="text-[10px] text-gray-500">
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

      {/* MODAL 3: XEM THÔNG TIN TÀI KHOẢN VÀ NGÀY KHỞI TẠO */}
      {showAccountInfoModal && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-sm rounded-3xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowAccountInfoModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyanGlow mx-auto text-2xl font-black">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
              <h3 className="text-lg font-black text-white">{currentUser.username}</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Tài khoản chính thức
              </span>
            </div>

            <div className="bg-[#080B10] border border-[#1A2332] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400"><Wallet className="w-3.5 h-3.5 text-emerald-400" /> Số dư ví:</span>
                <b className="text-emerald-400 text-sm font-extrabold">{(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ</b>
              </div>

              <div className="flex justify-between items-center text-gray-300 border-t border-[#1A2332] pt-2.5">
                <span className="flex items-center gap-1.5 text-gray-400"><Calendar className="w-3.5 h-3.5 text-cyanGlow" /> Ngày khởi tạo:</span>
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
          <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-cyanGlow mx-auto">
                {authMode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              </div>
              <h2 className="text-xl font-black text-white">
                {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </h2>
              <p className="text-xs text-gray-400">
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
                <label className="block text-xs font-bold text-gray-300 mb-1">Tên tài khoản (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập username..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-neonBlue transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-neonBlue transition"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Xác nhận mật khẩu..."
                      value={rePasswordInput}
                      onChange={(e) => setRePasswordInput(e.target.value)}
                      className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-neonBlue transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-3.5 rounded-xl text-xs shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer mt-2"
              >
                {loading ? 'ĐANG XỬ LÝ...' : authMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN NGAY'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#1A2332]">
              {authMode === 'login' ? (
                <p className="text-xs text-gray-400">
                  Chưa có tài khoản?{' '}
                  <button onClick={() => { setAuthModalMode('register'); resetForm(); }} className="text-cyanGlow font-bold hover:underline">
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Đã có tài khoản?{' '}
                  <button onClick={() => { setAuthModalMode('login'); resetForm(); }} className="text-cyanGlow font-bold hover:underline">
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