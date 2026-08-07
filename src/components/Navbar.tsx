'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Flame, LogIn, UserPlus, X, User, LogOut, CheckCircle2, Loader2, FolderKanban, Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'TOOL AUTO', href: '/tools', icon: Flame },
    { name: 'Dự án', href: '/projects', icon: FolderKanban },
  ];

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  // Form & Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentUser, setCurrentUser] = useState<{ username: string; balance: number } | null>(null);

  // TỰ ĐỘNG LẤY DỮ LIỆU SỐ DƯ TỪ ZTOOL_USERS ĐỂ ĐỒNG BỘ TỨC THÌ
  const syncUserData = () => {
    if (typeof window === 'undefined') return;

    const savedCurrentUser = localStorage.getItem('ztool_current_user');
    if (!savedCurrentUser) {
      setCurrentUser(null);
      return;
    }

    try {
      const parsedCurrent = JSON.parse(savedCurrentUser);
      if (!parsedCurrent || !parsedCurrent.username) {
        setCurrentUser(null);
        return;
      }

      // Lấy danh sách toàn bộ users từ ztool_users để tìm số dư mới nhất mà Admin vừa cộng/trừ
      const savedUsers = localStorage.getItem('ztool_users');
      if (savedUsers) {
        const usersList = JSON.parse(savedUsers);
        const foundUser = usersList.find(
          (u: any) => u.username.toLowerCase() === parsedCurrent.username.trim().toLowerCase()
        );

        if (foundUser) {
          setCurrentUser({
            username: foundUser.username,
            balance: foundUser.balance || 0,
          });
          return;
        }
      }

      setCurrentUser(parsedCurrent);
    } catch (e) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncUserData();

    window.addEventListener('storage', syncUserData);
    const interval = setInterval(syncUserData, 1000);

    return () => {
      window.removeEventListener('storage', syncUserData);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const existingUsersRaw = localStorage.getItem('ztool_users');
    let usersList = existingUsersRaw ? JSON.parse(existingUsersRaw) : [
      { id: 1, username: 'mienprovip', password: 'password123', balance: 150000, status: 'Active', createdAt: '08/08/2026 00:15' },
    ];

    if (isLogin) {
      const foundUser = usersList.find(
        (u: any) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      );

      if (!foundUser) {
        setErrorMsg('Không thể đăng nhập! Tài khoản hoặc mật khẩu không đúng.');
        return;
      }

      if (foundUser.status === 'Banned') {
        setErrorMsg('Tài khoản của bạn đã bị khóa bởi Admin!');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const userData = { username: foundUser.username, balance: foundUser.balance };
        setCurrentUser(userData);
        localStorage.setItem('ztool_current_user', JSON.stringify(userData));
        
        window.dispatchEvent(new Event('storage'));
        setSuccessMsg('Đăng nhập thành công!');

        setTimeout(() => {
          setIsAuthOpen(false);
          setSuccessMsg('');
        }, 1000);
      }, 800);

    } else {
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu nhập lại không trùng khớp!');
        return;
      }

      const isExist = usersList.some(
        (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (isExist) {
        setErrorMsg('Tài khoản này đã được tạo');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);

        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const maxId = usersList.reduce((max: number, u: any) => (u.id > max ? u.id : max), 0);

        const newUser = {
          id: maxId + 1,
          username: username.trim(),
          password: password,
          balance: 0,
          status: 'Active',
          createdAt: formattedDate,
        };

        usersList.push(newUser);
        localStorage.setItem('ztool_users', JSON.stringify(usersList));

        const userData = { username: newUser.username, balance: 0 };
        setCurrentUser(userData);
        localStorage.setItem('ztool_current_user', JSON.stringify(userData));

        window.dispatchEvent(new Event('storage'));
        setSuccessMsg('Đăng ký tài khoản thành công!');

        setTimeout(() => {
          setIsAuthOpen(false);
          setSuccessMsg('');
        }, 1000);
      }, 800);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ztool_current_user');
    window.dispatchEvent(new Event('storage'));
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <header className="w-full bg-darkBg/90 backdrop-blur-md border-b border-darkBorder sticky top-0 z-40 px-4 lg:px-8 py-3 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo ZTool */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-neonBlue/40 group-hover:border-neonBlue transition duration-300 shadow-lg shadow-neonBlue/20">
              <Image src="/logo.jpg" alt="Logo ZTool" fill className="object-cover group-hover:scale-105 transition" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-wider uppercase leading-tight bg-gradient-to-r from-cyanGlow via-neonBlue to-blue-500 bg-clip-text text-transparent">
                ZTool
              </h1>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyanGlow animate-pulse"></span>
                Chuyên Cung Cấp Tool FiveM
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav 
            className="hidden md:flex items-center gap-1 bg-darkCard/80 p-1.5 rounded-2xl border border-darkBorder text-sm font-medium relative"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isHovered = hoveredHref === item.href;
              const isHighlighted = isHovered || (hoveredHref === null && isActive);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-300 relative z-10 ${
                    isHighlighted
                      ? 'bg-neonBlue/20 text-cyanGlow font-bold border border-neonBlue/40 shadow-md shadow-neonBlue/20'
                      : 'text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-cyanGlow" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet & Auth Status */}
          <div className="flex items-center gap-2.5">
            {/* Nút VÍ trỏ tới trang Nạp tiền /recharge */}
            <Link
              href="/recharge"
              className="hidden sm:flex bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold items-center gap-1.5 text-emerald-400 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> VÍ: <span className="text-white font-bold">{currentUser ? `${currentUser.balance.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</span>
            </Link>
            
            <button className="hidden sm:flex bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold items-center gap-1.5 text-amber-400">
              <Calendar className="w-4 h-4" /> ĐIỂM DANH
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-darkBorder">
                <div className="flex items-center gap-2 bg-darkCard border border-neonBlue/40 px-3 py-1.5 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-neonBlue/20 text-cyanGlow border border-neonBlue/40 flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">{currentUser.username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 bg-darkCard hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-darkBorder rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setIsLogin(true); setIsAuthOpen(true); setErrorMsg(''); }}
                  className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer shadow-lg shadow-neonBlue/20"
                >
                  <LogIn className="w-4 h-4" /> ĐĂNG NHẬP
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setIsAuthOpen(true); setErrorMsg(''); }}
                  className="hidden lg:flex bg-darkCard hover:bg-darkBorder text-gray-200 border border-darkBorder font-bold text-xs px-3.5 py-2.5 rounded-xl items-center gap-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-cyanGlow" /> ĐĂNG KÝ
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MODAL ĐĂNG NHẬP / ĐĂNG KÝ */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-darkCard border border-neonBlue/40 rounded-3xl w-full max-w-md p-6 lg:p-8 relative shadow-2xl shadow-neonBlue/20">
            
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white bg-darkBg border border-darkBorder p-1.5 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="relative w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-neonBlue">
                <Image src="/logo.jpg" alt="Logo ZTool" fill className="object-cover" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {isLogin ? 'Đăng Nhập ZTool' : 'Tạo Tài Khoản Mới'}
              </h2>
            </div>

            {successMsg ? (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-center flex flex-col items-center gap-2 my-6 font-bold text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên tài khoản (Username)</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản..." 
                    className="w-full bg-darkBg border border-darkBorder focus:border-neonBlue rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mật khẩu</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-darkBg border border-darkBorder focus:border-neonBlue rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nhập lại mật khẩu</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-darkBg border border-darkBorder focus:border-neonBlue rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-3.5 rounded-xl shadow-lg shadow-neonBlue/25 transition mt-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : (isLogin ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN NGAY')}
                </button>
              </form>
            )}

            <div className="text-center mt-6 pt-4 border-t border-darkBorder text-xs text-gray-400">
              {isLogin ? (
                <p>Chưa có tài khoản? <button type="button" onClick={() => { setIsLogin(false); setErrorMsg(''); }} className="text-cyanGlow font-bold hover:underline">Đăng ký ngay</button></p>
              ) : (
                <p>Đã có tài khoản? <button type="button" onClick={() => { setIsLogin(true); setErrorMsg(''); }} className="text-cyanGlow font-bold hover:underline">Đăng nhập</button></p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}