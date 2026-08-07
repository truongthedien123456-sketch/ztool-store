'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, Wrench, FolderKanban, Wallet, Calendar, 
  LogIn, UserPlus, LogOut, X, User, Lock, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Modal Auth states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status messages
  const [authMsg, setAuthMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkUserSession();
  }, []);

  // Kiểm tra phiên đăng nhập & số dư người dùng
  const checkUserSession = () => {
    const loggedUser = localStorage.getItem('ztool_current_user');
    if (loggedUser) {
      setCurrentUser(loggedUser);
      
      // Đọc số dư ví từ chuẩn key 'ztool_users'
      const savedUsers = JSON.parse(localStorage.getItem('ztool_users') || '[]');
      const userData = savedUsers.find((u: any) => u.username === loggedUser);
      if (userData) {
        setUserBalance(userData.balance || 0);
      }
    } else {
      setCurrentUser(null);
      setUserBalance(0);
    }
  };

  // ================= XỬ LÝ ĐĂNG KÝ (ĐỒNG BỘ CHUẨN DỮ LIỆU ADMIN) =================
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);

    const cleanUsername = registerUsername.trim();

    if (!cleanUsername || !registerPassword) {
      setAuthMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!' });
      return;
    }

    if (registerPassword !== confirmPassword) {
      setAuthMsg({ type: 'error', text: 'Mật khẩu nhập lại không khớp!' });
      return;
    }

    // Đọc danh sách người dùng từ CHUẨN KEY 'ztool_users'
    const savedUsers = JSON.parse(localStorage.getItem('ztool_users') || '[]');

    // Kiểm tra tên tài khoản trùng
    const isExist = savedUsers.some((u: any) => u.username?.toLowerCase() === cleanUsername.toLowerCase());
    if (isExist) {
      setAuthMsg({ type: 'error', text: 'Tài khoản này đã được tạo!' });
      return;
    }

    // Tạo cấu trúc tài khoản chuẩn cho Admin đọc
    const newUser = {
      username: cleanUsername,
      password: registerPassword,
      balance: 0,
      isBanned: false,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    // Lưu lại vào 'ztool_users'
    const updatedUsers = [...savedUsers, newUser];
    localStorage.setItem('ztool_users', JSON.stringify(updatedUsers));

    // Tự động đăng nhập cho user vừa tạo
    localStorage.setItem('ztool_current_user', cleanUsername);
    setCurrentUser(cleanUsername);
    setUserBalance(0);

    setAuthMsg({ type: 'success', text: 'Đăng ký tài khoản thành công!' });

    setTimeout(() => {
      setIsRegisterOpen(false);
      setRegisterUsername('');
      setRegisterPassword('');
      setConfirmPassword('');
      setAuthMsg(null);
    }, 1000);
  };

  // ================= XỬ LÝ ĐĂNG NHẬP =================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);

    const cleanUsername = loginUsername.trim();
    const savedUsers = JSON.parse(localStorage.getItem('ztool_users') || '[]');

    const user = savedUsers.find((u: any) => u.username?.toLowerCase() === cleanUsername.toLowerCase());

    if (!user || user.password !== loginPassword) {
      setAuthMsg({ type: 'error', text: 'Tài khoản hoặc mật khẩu không chính xác!' });
      return;
    }

    if (user.isBanned) {
      setAuthMsg({ type: 'error', text: 'Tài khoản của bạn đã bị khóa bởi Admin!' });
      return;
    }

    // Lưu đăng nhập
    localStorage.setItem('ztool_current_user', user.username);
    setCurrentUser(user.username);
    setUserBalance(user.balance || 0);

    setAuthMsg({ type: 'success', text: 'Đăng nhập thành công!' });

    setTimeout(() => {
      setIsLoginOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      setAuthMsg(null);
    }, 1000);
  };

  // ================= ĐĂNG XUẤT =================
  const handleLogout = () => {
    localStorage.removeItem('ztool_current_user');
    setCurrentUser(null);
    setUserBalance(0);
  };

  return (
    <nav className="bg-[#0D121D] border-b border-[#1C2638] sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonBlue to-cyanGlow p-0.5 shadow-lg shadow-neonBlue/20">
            <div className="w-full h-full bg-[#080B10] rounded-[10px] flex items-center justify-center font-black text-cyanGlow text-lg">
              Z
            </div>
          </div>
          <div>
            <span className="text-base font-black text-white tracking-wider block group-hover:text-cyanGlow transition">
              ZTOOL
            </span>
            <span className="text-[10px] text-gray-400 block -mt-1 font-medium">
              Chuyên Cung Cấp Tool FiveM
            </span>
          </div>
        </Link>

        {/* Menu Điều Hướng */}
        <div className="hidden md:flex items-center gap-2 bg-[#080B10] p-1.5 rounded-2xl border border-[#1C2638]">
          <Link href="/" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0D121D] transition">
            <Home className="w-3.5 h-3.5 text-cyanGlow" /> Trang chủ
          </Link>
          <Link href="/tools" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0D121D] transition">
            <Wrench className="w-3.5 h-3.5 text-cyanGlow" /> TOOL AUTO
          </Link>
          <Link href="/projects" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0D121D] transition">
            <FolderKanban className="w-3.5 h-3.5 text-cyanGlow" /> Dự án
          </Link>
        </div>

        {/* Khối Tài Khoản & Ví */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Ví tiền */}
              <div className="bg-[#080B10] border border-[#1C2638] px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold text-emerald-400">
                <Wallet className="w-3.5 h-3.5" />
                <span>Ví: {userBalance.toLocaleString('vi-VN')} VNĐ</span>
              </div>

              {/* Tên User & Nút Đăng xuất */}
              <div className="bg-[#080B10] border border-[#1C2638] px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-cyanGlow" />
                <span>{currentUser}</span>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 ml-1 p-0.5 cursor-pointer" title="Đăng xuất">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsLoginOpen(true); setIsRegisterOpen(false); setAuthMsg(null); }}
                className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:opacity-90 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> ĐĂNG NHẬP
              </button>

              <button
                onClick={() => { setIsRegisterOpen(true); setIsLoginOpen(false); setAuthMsg(null); }}
                className="bg-[#080B10] border border-[#1C2638] hover:border-gray-500 text-gray-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyanGlow" /> ĐĂNG KÝ
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ================= MODAL ĐĂNG NHẬP ================= */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-[#1C2638] w-full max-w-md rounded-3xl p-6 space-y-6 relative shadow-2xl">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1C2638]">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-neonBlue/10 border border-neonBlue/30 rounded-2xl flex items-center justify-center mx-auto text-cyanGlow mb-2">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">Đăng Nhập Tài Khoản</h2>
              <p className="text-xs text-gray-400">Nhập thông tin tài khoản của bạn để tiếp tục</p>
            </div>

            {authMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                authMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {authMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{authMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Tên tài khoản (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input type="text" required placeholder="Nhập username..." value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-[#080B10] border border-[#1C2638] focus:border-neonBlue rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input type="password" required placeholder="Nhập mật khẩu..." value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-[#080B10] border border-[#1C2638] focus:border-neonBlue rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-3 rounded-xl text-xs hover:opacity-90 transition cursor-pointer">
                ĐĂNG NHẬP NGAY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ĐĂNG KÝ ================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#0D121D] border border-[#1C2638] w-full max-w-md rounded-3xl p-6 space-y-6 relative shadow-2xl">
            <button onClick={() => setIsRegisterOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1C2638]">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-neonBlue/10 border border-neonBlue/30 rounded-2xl flex items-center justify-center mx-auto text-cyanGlow mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">Tạo Tài Khoản Mới</h2>
              <p className="text-xs text-gray-400">Tạo tài khoản để mua và quản lý các sản phẩm Tool Auto</p>
            </div>

            {authMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                authMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {authMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{authMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Tên tài khoản (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input type="text" required placeholder="Tên đăng nhập..." value={registerUsername} onChange={e => setRegisterUsername(e.target.value)} className="w-full bg-[#080B10] border border-[#1C2638] focus:border-neonBlue rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input type="password" required placeholder="Mật khẩu..." value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} className="w-full bg-[#080B10] border border-[#1C2638] focus:border-neonBlue rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-semibold mb-1">Nhập lại mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input type="password" required placeholder="Xác nhận mật khẩu..." value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-[#080B10] border border-[#1C2638] focus:border-neonBlue rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-3 rounded-xl text-xs hover:opacity-90 transition cursor-pointer">
                TẠO TÀI KHOẢN NGAY
              </button>
            </form>
          </div>
        </div>
      )}

    </nav>
  );
}