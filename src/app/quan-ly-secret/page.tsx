'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Lock, User, Key, ShieldCheck, LogOut, Users, CreditCard, RefreshCw, PlusCircle, MinusCircle, Search } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dữ liệu quản trị
  const [users, setUsers] = useState<any[]>([]);
  const [rechargeHistory, setRechargeHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Biến cộng/trừ tiền trực tiếp
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  // Kiểm tra trạng thái đăng nhập cũ trong phiên làm việc
  useEffect(() => {
    const isLogged = localStorage.getItem('ztool_admin_authenticated');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  // Tải dữ liệu từ LocalStorage
  const loadAdminData = () => {
    const savedUsers = localStorage.getItem('ztool_users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        setUsers([]);
      }
    }

    const savedHistory = localStorage.getItem('ztool_recharge_history');
    if (savedHistory) {
      try {
        setRechargeHistory(JSON.parse(savedHistory));
      } catch (e) {
        setRechargeHistory([]);
      }
    }
  };

  // Xử lý đăng nhập Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // TÀI KHOẢN & MẬT KHẨU ADMIN MẶC ĐỊNH
    const ADMIN_USER = 'mienprovip';
    const ADMIN_PASS = 'Vietduc123456@';

    if (usernameInput.trim() === ADMIN_USER && passwordInput === ADMIN_PASS) {
      localStorage.setItem('ztool_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      loadAdminData();
    } else {
      setLoginError('Tài khoản hoặc mật khẩu Quản trị không chính xác!');
    }
  };

  // Xử lý Đăng xuất Admin
  const handleAdminLogout = () => {
    localStorage.removeItem('ztool_admin_authenticated');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Cộng / Trừ số dư tài khoản người dùng
  const handleAdjustBalance = (targetUsername: string, isAdd: boolean) => {
    if (!adjustAmount || adjustAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.username === targetUsername) {
        const currentBal = u.balance || 0;
        const newBal = isAdd ? currentBal + adjustAmount : Math.max(0, currentBal - adjustAmount);
        return { ...u, balance: newBal };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('ztool_users', JSON.stringify(updatedUsers));
    
    // Lưu lịch sử biến động số dư
    const newHistory = [
      {
        username: targetUsername,
        amount: isAdd ? adjustAmount : -adjustAmount,
        type: isAdd ? 'Admin cộng tiền' : 'Admin trừ tiền',
        date: new Date().toLocaleString('vi-VN'),
      },
      ...rechargeHistory,
    ];
    setRechargeHistory(newHistory);
    localStorage.setItem('ztool_recharge_history', JSON.stringify(newHistory));

    alert(`${isAdd ? 'Cộng' : 'Trừ'} thành công ${adjustAmount.toLocaleString('vi-VN')} VNĐ cho ${targetUsername}`);
    setSelectedUser(null);
    setAdjustAmount(0);
  };

  // Lọc danh sách người dùng theo ô tìm kiếm
  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // MÀN HÌNH ĐĂNG NHẬP ADMIN (KHI CHƯA XÁC THỰC)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#080B10] text-white font-sans flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-[#0F141C] border border-[#1A2332] rounded-3xl p-8 shadow-2xl relative">
          
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 bg-neonBlue/10 border border-neonBlue/30 rounded-2xl flex items-center justify-center mx-auto text-cyanGlow">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">TRANG QUẢN TRỊ ZTOOL</h1>
            <p className="text-xs text-gray-400">Vui lòng đăng nhập tài khoản Admin để truy cập hệ thống</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tài khoản Quản trị</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Nhập username..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mật khẩu Bảo mật</label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" /> ĐĂNG NHẬP HỆ THỐNG
            </button>
          </form>

        </div>
      </main>
    );
  }

  // ==========================================
  // MÀN HÌNH DASHBOARD QUẢN TRỊ (ĐÃ ĐĂNG NHẬP)
  // ==========================================
  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Admin */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A2332] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> BẢNG QUẢN TRỊ BẢO MẬT
            </div>
            <h1 className="text-2xl font-black text-white">QUẢN LÝ HỆ THỐNG ZTOOL</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="bg-[#0F141C] border border-[#1A2332] hover:border-gray-600 text-gray-300 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tải lại dữ liệu
            </button>

            <button
              onClick={handleAdminLogout}
              className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Thống kê Tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-5 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-cyanGlow">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Tổng người dùng</span>
              <b className="text-xl font-bold text-white">{users.length} tài khoản</b>
            </div>
          </div>

          <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-5 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Lịch sử giao dịch</span>
              <b className="text-xl font-bold text-white">{rechargeHistory.length} lượt</b>
            </div>
          </div>
        </div>

        {/* Bảng Danh Sách Người Dùng */}
        <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A2332] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyanGlow" /> DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG
            </h2>

            {/* Thanh tìm kiếm */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên tài khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tài khoản</th>
                  <th className="p-3">Số dư hiện tại</th>
                  <th className="p-3">Ngày đăng ký</th>
                  <th className="p-3 text-right">Thao tác số dư</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2332]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">Chưa có dữ liệu người dùng</td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-[#080B10]/50 transition">
                      <td className="p-3 font-bold text-white">{u.username}</td>
                      <td className="p-3 font-bold text-emerald-400">{(u.balance || 0).toLocaleString('vi-VN')} VNĐ</td>
                      <td className="p-3 text-gray-400">{u.createdAt || 'N/A'}</td>
                      <td className="p-3 text-right">
                        {selectedUser === u.username ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              placeholder="Nhập số tiền..."
                              value={adjustAmount || ''}
                              onChange={(e) => setAdjustAmount(Number(e.target.value))}
                              className="w-28 bg-[#080B10] border border-[#1A2332] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={() => handleAdjustBalance(u.username, true)}
                              title="Cộng tiền"
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/40 cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAdjustBalance(u.username, false)}
                              title="Trừ tiền"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-1.5 rounded-lg border border-red-500/40 cursor-pointer"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="text-xs text-gray-400 hover:text-white px-1 cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(u.username)}
                            className="bg-neonBlue/10 hover:bg-neonBlue/20 border border-neonBlue/30 text-cyanGlow px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            Điều chỉnh số dư
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}