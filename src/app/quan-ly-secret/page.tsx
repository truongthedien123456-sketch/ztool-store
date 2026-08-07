'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Lock, User, Key, ShieldCheck, LogOut, Users, 
  Wrench, FolderKanban, MessageSquare, Plus, Trash2, Edit, RefreshCw,
  Ban, CheckCircle, CreditCard, KeyRound, Search, DollarSign, ShieldAlert
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab điều hướng
  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'projects' | 'keys' | 'sepay' | 'feedback'>('users');

  // --- DỮ LIỆU ĐỒNG BỘ TRANG BÁN HÀNG ---
  const [users, setUsers] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [keysList, setKeysList] = useState<any[]>([]);
  const [sepayLogs, setSepayLogs] = useState<any[]>([]);

  // States thao tác Người dùng
  const [userSearch, setUserSearch] = useState('');
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', balance: 0 });
  const [editUserPass, setEditUserPass] = useState<{ username: string; newPass: string } | null>(null);
  const [adjustBal, setAdjustBal] = useState<{ username: string; amount: number; isAdd: boolean } | null>(null);

  // States thao tác Tool Auto
  const [toolForm, setToolForm] = useState({
    id: 0,
    name: '',
    image: '',
    priceDay: '',
    priceWeek: '',
    priceMonth: '',
    priceLifetime: '',
    description: '',
    downloadLink: ''
  });
  const [isEditingTool, setIsEditingTool] = useState(false);

  // States thao tác Dự án
  const [projectForm, setProjectForm] = useState({
    id: 0,
    title: '',
    image: '',
    description: '',
    status: 'Hoạt động tốt'
  });
  const [isEditingProject, setIsEditingProject] = useState(false);

  // States thao tác Key
  const [newKeyForm, setNewKeyForm] = useState({ toolName: '', keyString: '', duration: '1 Ngày' });

  useEffect(() => {
    const isLogged = localStorage.getItem('ztool_admin_authenticated');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      loadAllSyncData();
    }
  }, []);

  // Tải & Đồng bộ toàn bộ dữ liệu với Storefront
  const loadAllSyncData = () => {
    const savedUsers = localStorage.getItem('ztool_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedTools = localStorage.getItem('ztool_tools');
    if (savedTools) setTools(JSON.parse(savedTools));

    const savedProjects = localStorage.getItem('ztool_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    const savedFeedbacks = localStorage.getItem('ztool_feedbacks');
    if (savedFeedbacks) setFeedbacks(JSON.parse(savedFeedbacks));

    const savedKeys = localStorage.getItem('ztool_keys');
    if (savedKeys) setKeysList(JSON.parse(savedKeys));

    const savedSepay = localStorage.getItem('ztool_recharge_history');
    if (savedSepay) setSepayLogs(JSON.parse(savedSepay));
  };

  // Đăng nhập Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'mienprovip' && passwordInput === 'Vietduc123456@') {
      localStorage.setItem('ztool_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      loadAllSyncData();
    } else {
      setLoginError('Tài khoản hoặc mật khẩu Quản trị không chính xác!');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('ztool_admin_authenticated');
    setIsAuthenticated(false);
  };

  // Helper lưu dữ liệu đồng bộ
  const syncStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // ================= 1. XỬ LÝ QUẢN LÝ NGƯỜI DÙNG =================
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username || !newUserForm.password) return alert('Nhập đủ username/password!');
    if (users.some(u => u.username === newUserForm.username)) return alert('Tài khoản đã tồn tại!');
    
    const updated = [...users, { ...newUserForm, balance: Number(newUserForm.balance) || 0, isBanned: false, createdAt: new Date().toLocaleString('vi-VN') }];
    setUsers(updated);
    syncStorage('ztool_users', updated);
    setNewUserForm({ username: '', password: '', balance: 0 });
    alert('Tạo người dùng thành công!');
  };

  const handleToggleBanUser = (username: string) => {
    const updated = users.map(u => u.username === username ? { ...u, isBanned: !u.isBanned } : u);
    setUsers(updated);
    syncStorage('ztool_users', updated);
  };

  const handleDeleteUser = (username: string) => {
    if (!confirm(`Xóa tài khoản ${username}?`)) return;
    const updated = users.filter(u => u.username !== username);
    setUsers(updated);
    syncStorage('ztool_users', updated);
  };

  const handleSaveUserPassword = (username: string) => {
    if (!editUserPass?.newPass) return;
    const updated = users.map(u => u.username === username ? { ...u, password: editUserPass.newPass } : u);
    setUsers(updated);
    syncStorage('ztool_users', updated);
    setEditUserPass(null);
    alert('Đổi mật khẩu thành công!');
  };

  const handleExecAdjustBalance = (username: string) => {
    if (!adjustBal || !adjustBal.amount) return;
    const updated = users.map(u => {
      if (u.username === username) {
        const cur = u.balance || 0;
        const next = adjustBal.isAdd ? cur + Number(adjustBal.amount) : Math.max(0, cur - Number(adjustBal.amount));
        return { ...u, balance: next };
      }
      return u;
    });
    setUsers(updated);
    syncStorage('ztool_users', updated);
    setAdjustBal(null);
    alert('Cập nhật số dư thành công!');
  };

  // ================= 2. XỬ LÝ TOOL AUTO =================
  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name) return alert('Nhập tên Tool!');
    
    let updated;
    if (isEditingTool) {
      updated = tools.map(t => t.id === toolForm.id ? toolForm : t);
    } else {
      updated = [...tools, { ...toolForm, id: Date.now() }];
    }
    setTools(updated);
    syncStorage('ztool_tools', updated);
    setToolForm({ id: 0, name: '', image: '', priceDay: '', priceWeek: '', priceMonth: '', priceLifetime: '', description: '', downloadLink: '' });
    setIsEditingTool(false);
    alert('Đã lưu thông tin Tool!');
  };

  const handleEditTool = (tool: any) => {
    setToolForm(tool);
    setIsEditingTool(true);
  };

  const handleDeleteTool = (id: number) => {
    if (!confirm('Xóa Tool này?')) return;
    const updated = tools.filter(t => t.id !== id);
    setTools(updated);
    syncStorage('ztool_tools', updated);
  };

  // ================= 3. XỬ LÝ DỰ ÁN =================
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title) return alert('Nhập tên dự án!');

    let updated;
    if (isEditingProject) {
      updated = projects.map(p => p.id === projectForm.id ? projectForm : p);
    } else {
      updated = [...projects, { ...projectForm, id: Date.now() }];
    }
    setProjects(updated);
    syncStorage('ztool_projects', updated);
    setProjectForm({ id: 0, title: '', image: '', description: '', status: 'Hoạt động tốt' });
    setIsEditingProject(false);
    alert('Đã lưu Dự án!');
  };

  const handleDeleteProject = (id: number) => {
    if (!confirm('Xóa Dự án này?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    syncStorage('ztool_projects', updated);
  };

  // ================= 4. XỬ LÝ KEY & ĐÓNG GÓP =================
  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.keyString) return alert('Nhập chuỗi Key!');
    const updated = [...keysList, { ...newKeyForm, id: Date.now(), isUsed: false, createdAt: new Date().toLocaleString('vi-VN') }];
    setKeysList(updated);
    syncStorage('ztool_keys', updated);
    setNewKeyForm({ toolName: '', keyString: '', duration: '1 Ngày' });
    alert('Thêm Key thành công!');
  };

  const handleDeleteKey = (id: number) => {
    const updated = keysList.filter(k => k.id !== id);
    setKeysList(updated);
    syncStorage('ztool_keys', updated);
  };

  const handleDeleteFeedback = (id: number) => {
    const updated = feedbacks.filter(f => f.id !== id);
    setFeedbacks(updated);
    syncStorage('ztool_feedbacks', updated);
  };

  // MÀN HÌNH ĐĂNG NHẬP ADMIN BẢO BỆ
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
                  className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none"
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
                  className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> ĐĂNG NHẬP HỆ THỐNG
            </button>
          </form>
        </div>
      </main>
    );
  }

  // MÀN HÌNH QUẢN TRỊ TOÀN DIỆN
  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Admin */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A2332] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> BẢNG QUẢN TRỊ BẢO MẬT & ĐỒNG BỘ STORE
            </div>
            <h1 className="text-2xl font-black text-white">QUẢN LÝ HỆ THỐNG ZTOOL</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllSyncData}
              className="bg-[#0F141C] border border-[#1A2332] hover:border-gray-600 text-gray-300 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ lại
            </button>

            <button
              onClick={handleAdminLogout}
              className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Menu Các Tab Chức Năng */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#1A2332] pb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'users' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg' : 'bg-[#0F141C] border border-[#1A2332] text-gray-400'
            }`}
          >
            <Users className="w-4 h-4" /> NGƯỜI DÙNG ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tools' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg' : 'bg-[#0F141C] border border-[#1A2332] text-gray-400'
            }`}
          >
            <Wrench className="w-4 h-4" /> TOOL AUTO ({tools.length})
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'projects' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg' : 'bg-[#0F141C] border border-[#1A2332] text-gray-400'
            }`}
          >
            <FolderKanban className="w-4 h-4" /> DỰ ÁN ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'keys' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg' : 'bg-[#0F141C] border border-[#1A2332] text-gray-400'
            }`}
          >
            <KeyRound className="w-4 h-4" /> QUẢN LÝ KEY ({keysList.length})
          </button>

          <button
            onClick={() => setActiveTab('sepay')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'sepay' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg' : 'bg-[#0F141C] border border-[#1A2332] text-gray-400'
            }`}
          >
            <CreditCard className="w-4 h-4" /> NẠP SEPAY ({sepayLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'feedback' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg' : 'bg-[#0F141C] border border-[#1A2332] text-gray-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> ĐÓNG GÓP ({feedbacks.length})
          </button>
        </div>

        {/* ================= 1. TAB NGƯỜI DÙNG ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Form tạo người dùng mới */}
            <form onSubmit={handleCreateUser} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <Plus className="w-4 h-4 text-cyanGlow" /> TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Tên tài khoản..." value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} className="bg-[#080B10] border border-[#1A2332] rounded-xl px-3 py-2 text-xs text-white" />
                <input type="text" placeholder="Mật khẩu..." value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="bg-[#080B10] border border-[#1A2332] rounded-xl px-3 py-2 text-xs text-white" />
                <input type="number" placeholder="Số dư ban đầu (VNĐ)..." value={newUserForm.balance || ''} onChange={e => setNewUserForm({ ...newUserForm, balance: Number(e.target.value) })} className="bg-[#080B10] border border-[#1A2332] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <button type="submit" className="bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow px-5 py-2 rounded-xl text-xs font-bold hover:bg-neonBlue/30 transition">TẠO NGƯỜI DÙNG</button>
            </form>

            {/* Bảng Danh Sách Người Dùng */}
            <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A2332] pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyanGlow" /> DANH SÁCH NGƯỜI DÙNG
                </h2>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input type="text" placeholder="Tìm tên..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tài khoản</th>
                      <th className="p-3">Số dư</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2332]">
                    {users.filter(u => u.username?.toLowerCase().includes(userSearch.toLowerCase())).map((u, i) => (
                      <tr key={i} className="hover:bg-[#080B10]/50 transition">
                        <td className="p-3 font-bold text-white">{u.username}</td>
                        <td className="p-3 font-bold text-emerald-400">{(u.balance || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="p-3">
                          {u.isBanned ? (
                            <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Bị BAN</span>
                          ) : (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Hoạt động</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {/* Nút Cộng/Trừ Tiền */}
                          <button onClick={() => setAdjustBal({ username: u.username, amount: 0, isAdd: true })} className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20" title="Cộng/Trừ tiền"><DollarSign className="w-3.5 h-3.5" /></button>
                          
                          {/* Nút Đổi Mật Khẩu */}
                          <button onClick={() => setEditUserPass({ username: u.username, newPass: '' })} className="bg-neonBlue/10 text-cyanGlow p-1.5 rounded-lg border border-neonBlue/20 hover:bg-neonBlue/20" title="Đổi mật khẩu"><Key className="w-3.5 h-3.5" /></button>

                          {/* Nút Ban/Unban */}
                          <button onClick={() => handleToggleBanUser(u.username)} className={`p-1.5 rounded-lg border ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`} title={u.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}>
                            {u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>

                          {/* Nút Xóa */}
                          <button onClick={() => handleDeleteUser(u.username)} className="bg-red-500/10 text-red-400 p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Pop-up Đổi mật khẩu */}
              {editUserPass && (
                <div className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-white">Đổi mật khẩu cho: {editUserPass.username}</h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nhập mật khẩu mới..." value={editUserPass.newPass} onChange={e => setEditUserPass({ ...editUserPass, newPass: e.target.value })} className="bg-[#0F141C] border border-[#1A2332] px-3 py-1.5 text-xs text-white rounded-lg flex-1" />
                    <button onClick={() => handleSaveUserPassword(editUserPass.username)} className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold">Lưu</button>
                    <button onClick={() => setEditUserPass(null)} className="text-gray-400 text-xs px-2">Hủy</button>
                  </div>
                </div>
              )}

              {/* Modal Pop-up Điều chỉnh số dư */}
              {adjustBal && (
                <div className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-white">Điều chỉnh số dư cho: {adjustBal.username}</h4>
                  <div className="flex gap-2 items-center">
                    <input type="number" placeholder="Nhập số tiền..." value={adjustBal.amount || ''} onChange={e => setAdjustBal({ ...adjustBal, amount: Number(e.target.value) })} className="bg-[#0F141C] border border-[#1A2332] px-3 py-1.5 text-xs text-white rounded-lg flex-1" />
                    <button onClick={() => { setAdjustBal({ ...adjustBal, isAdd: true }); handleExecAdjustBalance(adjustBal.username); }} className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold">+ Cộng</button>
                    <button onClick={() => { setAdjustBal({ ...adjustBal, isAdd: false }); handleExecAdjustBalance(adjustBal.username); }} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold">- Trừ</button>
                    <button onClick={() => setAdjustBal(null)} className="text-gray-400 text-xs px-2">Hủy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 2. TAB TOOL AUTO ================= */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveTool} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <Plus className="w-4 h-4 text-cyanGlow" /> {isEditingTool ? 'CHỈNH SỬA TOOL' : 'THÊM TOOL AUTO MỚI'}
              </h3>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Tên Tool</label>
                <input type="text" required value={toolForm.name} onChange={e => setToolForm({ ...toolForm, name: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="vd: Tool Auto FiveM" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Link Ảnh Minh Họa</label>
                <input type="text" value={toolForm.image} onChange={e => setToolForm({ ...toolForm, image: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400">Giá Ngày (VNĐ)</label>
                  <input type="text" value={toolForm.priceDay} onChange={e => setToolForm({ ...toolForm, priceDay: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="20.000" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400">Giá Tuần (VNĐ)</label>
                  <input type="text" value={toolForm.priceWeek} onChange={e => setToolForm({ ...toolForm, priceWeek: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="100.000" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400">Giá Tháng (VNĐ)</label>
                  <input type="text" value={toolForm.priceMonth} onChange={e => setToolForm({ ...toolForm, priceMonth: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="300.000" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400">Giá Vĩnh Viễn (VNĐ)</label>
                  <input type="text" value={toolForm.priceLifetime} onChange={e => setToolForm({ ...toolForm, priceLifetime: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="1.000.000" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Mô tả sản phẩm</label>
                <textarea value={toolForm.description} onChange={e => setToolForm({ ...toolForm, description: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="Chi tiết tính năng..." />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Link Tải File Tool</label>
                <input type="text" value={toolForm.downloadLink} onChange={e => setToolForm({ ...toolForm, downloadLink: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2 text-xs text-white" placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow py-2.5 rounded-xl text-xs font-bold hover:bg-neonBlue/30 transition">LƯU THÔNG TIN TOOL</button>
            </form>

            <div className="lg:col-span-2 bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#1A2332] pb-3">DANH SÁCH TOOL AUTO ĐỒNG BỘ STORE</h3>
              <div className="space-y-3">
                {tools.length === 0 ? <p className="text-xs text-gray-500">Chưa có Tool nào</p> : tools.map((t) => (
                  <div key={t.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{t.name}</h4>
                      <p className="text-[10px] text-emerald-400">Ngày: {t.priceDay || 'N/A'} | Tuần: {t.priceWeek || 'N/A'} | Tháng: {t.priceMonth || 'N/A'} | VV: {t.priceLifetime || 'N/A'}</p>
                      <p className="text-[11px] text-gray-400">{t.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditTool(t)} className="text-cyanGlow p-2 hover:bg-neonBlue/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteTool(t.id)} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. TAB DỰ ÁN ================= */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveProject} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <Plus className="w-4 h-4 text-cyanGlow" /> THÊM / SỬA DỰ ÁN
              </h3>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tên Dự Án</label>
                <input type="text" required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="Tên dự án..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Link Ảnh Minh Họa</label>
                <input type="text" value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tình trạng Tool/Dự án</label>
                <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white">
                  <option value="Hoạt động tốt">Hoạt động tốt</option>
                  <option value="Đang bảo trì">Đang bảo trì</option>
                  <option value="Sắp cập nhật">Sắp cập nhật</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mô tả dự án</label>
                <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="Chi tiết dự án..." />
              </div>
              <button type="submit" className="w-full bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow py-2.5 rounded-xl text-xs font-bold hover:bg-neonBlue/30 transition">LƯU DỰ ÁN</button>
            </form>

            <div className="lg:col-span-2 bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#1A2332] pb-3">DANH SÁCH DỰ ÁN CỦA SHOP</h3>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-xs">{p.title}</h4>
                      <span className="text-[10px] text-cyanGlow bg-neonBlue/10 px-2 py-0.5 rounded border border-neonBlue/20">{p.status}</span>
                      <p className="text-[11px] text-gray-400 mt-1">{p.description}</p>
                    </div>
                    <button onClick={() => handleDeleteProject(p.id)} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. TAB QUẢN LÝ KEY ================= */}
        {activeTab === 'keys' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddKey} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <Plus className="w-4 h-4 text-cyanGlow" /> KHỞI TẠO KEY BÁN HÀNG
              </h3>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tên Tool áp dụng</label>
                <input type="text" required placeholder="vd: Tool Auto FiveM" value={newKeyForm.toolName} onChange={e => setNewKeyForm({ ...newKeyForm, toolName: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mã Key (Chuỗi bí mật)</label>
                <input type="text" required placeholder="ZTOOL-XXXX-YYYY" value={newKeyForm.keyString} onChange={e => setNewKeyForm({ ...newKeyForm, keyString: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Thời hạn Key</label>
                <select value={newKeyForm.duration} onChange={e => setNewKeyForm({ ...newKeyForm, duration: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white">
                  <option value="1 Ngày">1 Ngày</option>
                  <option value="7 Ngày">7 Ngày</option>
                  <option value="30 Ngày">30 Ngày</option>
                  <option value="Vĩnh Viễn">Vĩnh Viễn</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow py-2.5 rounded-xl text-xs font-bold hover:bg-neonBlue/30 transition">LƯU KEY TỰ ĐỘNG</button>
            </form>

            <div className="lg:col-span-2 bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#1A2332] pb-3">KHO KEY ĐÃ KHỞI TẠO</h3>
              <div className="space-y-3">
                {keysList.length === 0 ? <p className="text-xs text-gray-500">Chưa có Key nào trong kho</p> : keysList.map((k) => (
                  <div key={k.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-white font-mono">{k.keyString}</span>
                      <p className="text-[10px] text-gray-400">Tool: {k.toolName} | Thời hạn: {k.duration}</p>
                    </div>
                    <button onClick={() => handleDeleteKey(k.id)} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. TAB SEPAY NẠP TIỀN ================= */}
        {activeTab === 'sepay' && (
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
              <CreditCard className="w-5 h-5 text-cyanGlow" /> LỊCH SỬ NẠP TIỀN TỰ ĐỘNG SEPAY
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Mã GD / Nội dung</th>
                    <th className="p-3">Số tiền</th>
                    <th className="p-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2332]">
                  {sepayLogs.length === 0 ? (
                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">Chưa có lịch sử giao dịch SePay</td></tr>
                  ) : (
                    sepayLogs.map((s, i) => (
                      <tr key={i} className="hover:bg-[#080B10]/50 transition">
                        <td className="p-3 font-bold text-white">{s.content || s.username}</td>
                        <td className="p-3 font-bold text-emerald-400">+{(s.amount || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="p-3 text-gray-400">{s.date || 'Gần đây'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 6. TAB ĐÓNG GÓP ================= */}
        {activeTab === 'feedback' && (
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
              <MessageSquare className="w-5 h-5 text-cyanGlow" /> ĐÓNG GÓP CỦA KHÁCH HÀNG
            </h2>
            <div className="space-y-3">
              {feedbacks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Chưa có đóng góp nào</p>
              ) : (
                feedbacks.map((f) => (
                  <div key={f.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-cyanGlow">{f.username || 'Khách'}</span>
                      <p className="text-xs text-gray-300 mt-1">{f.content}</p>
                    </div>
                    <button onClick={() => handleDeleteFeedback(f.id)} className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}