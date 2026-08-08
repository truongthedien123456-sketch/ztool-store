'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, Lock, LogIn, UserPlus, LogOut, Wallet, X, AlertCircle, CheckCircle2 
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

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const savedUser = localStorage.getItem('ztool_current_user');
    if (savedUser) {
      // Tải lại số dư mới nhất từ Supabase Cloud
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

      // 1. Kiểm tra tài khoản trùng trên Supabase Cloud
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

      // 2. Tạo người dùng mới lên Supabase Cloud Database
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
      // Đăng nhập từ Supabase Cloud Database
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

        {/* Menu Điều Hướng */}
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

        {/* Khung Tài Khoản & Ví */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-[#080B10] border border-[#1A2332] p-1.5 pl-3.5 rounded-2xl">
              <div className="text-right">
                <span className="text-xs font-bold text-white block">{currentUser.username}</span>
                <span className="text-[10px] font-extrabold text-emerald-400 flex items-center justify-end gap-1">
                  <Wallet className="w-3 h-3" /> {(currentUser.balance || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
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

      {/* Modal Đăng Nhập / Đăng Ký Tích Hợp Supabase Cloud */}
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