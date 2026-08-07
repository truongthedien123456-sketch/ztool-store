'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, Package, ShieldCheck, Plus, Trash2, Edit3,
  ArrowLeft, RefreshCw, FolderKanban, MessageSquare, X, ShoppingBag,
  Lock, Unlock, Key, Wallet, UserPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'tools' | 'users' | 'projects' | 'feedbacks'>('projects');
  
  // STATE TOOL AUTO
  const [tools, setTools] = useState<any[]>([]);
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [toolForm, setToolForm] = useState({
    name: '',
    image: '',
    description: '',
    priceDay: '',
    priceWeek: '',
    priceMonth: '',
    priceLifetime: '',
  });

  // STATE DỰ ÁN
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    image: '',
    server: '',
    progress: '50',
    status: 'Đang phát triển',
    description: '',
  });

  // STATE TÀI KHOẢN & GÓP Ý
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [onlineUsername, setOnlineUsername] = useState<string>('');

  // Form Thêm Tài Khoản Mới
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserBalance, setNewUserBalance] = useState('');

  const loadAllData = () => {
    if (typeof window !== 'undefined') {
      const savedCurrentUser = localStorage.getItem('ztool_current_user');
      if (savedCurrentUser) {
        try {
          const parsed = JSON.parse(savedCurrentUser);
          if (parsed && parsed.username) {
            setOnlineUsername(parsed.username.trim().toLowerCase());
          } else {
            setOnlineUsername('');
          }
        } catch (e) {
          setOnlineUsername('');
        }
      } else {
        setOnlineUsername('');
      }

      const savedTools = localStorage.getItem('ztool_tools');
      if (savedTools) setTools(JSON.parse(savedTools));

      const savedProjects = localStorage.getItem('ztool_projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        const defaultProjects = [
          {
            id: 1,
            title: 'Tool Auto Bác Sĩ & Cứu Thương',
            image: '/logo.jpg',
            server: 'GTA5VN / LuQuyRP',
            progress: 85,
            status: 'Đang thử nghiệm Beta',
            description: 'Tự động hồi máu, nhận cuộc gọi cứu hộ, di chuyển cấp cứu tự động.',
          },
        ];
        setProjects(defaultProjects);
        localStorage.setItem('ztool_projects', JSON.stringify(defaultProjects));
      }

      const savedUsers = localStorage.getItem('ztool_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        const defaultUsers = [
          { id: 1, username: 'mienprovip', password: 'password123', balance: 150000, status: 'Active', createdAt: '08/08/2026 00:15' },
          { id: 2, username: 'mienprovip1', password: 'Hesoyam1232', balance: 0, status: 'Active', createdAt: '08/08/2026 00:18' },
        ];
        setUsers(defaultUsers);
        localStorage.setItem('ztool_users', JSON.stringify(defaultUsers));
      }

      const savedFB = localStorage.getItem('ztool_feedbacks');
      setFeedbacks(savedFB ? JSON.parse(savedFB) : []);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleStorageChange = () => {
      loadAllData();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadAllData, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // --- QUẢN LÝ DỰ ÁN HANDLERS ---
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.server) {
      alert('Vui lòng điền Tiêu đề và Server!');
      return;
    }

    let updatedProjects = [...projects];

    if (editingProjectId) {
      // Chỉnh sửa dự án có sẵn
      updatedProjects = updatedProjects.map((p) =>
        p.id === editingProjectId
          ? {
              ...p,
              title: projectForm.title,
              image: projectForm.image || '/logo.jpg',
              server: projectForm.server,
              progress: Number(projectForm.progress) || 0,
              status: projectForm.status || 'Đang phát triển',
              description: projectForm.description || 'Chưa có mô tả',
            }
          : p
      );
      alert('Cập nhật thông tin dự án thành công!');
    } else {
      // Thêm dự án mới
      const newProject = {
        id: Date.now(),
        title: projectForm.title,
        image: projectForm.image || '/logo.jpg',
        server: projectForm.server,
        progress: Number(projectForm.progress) || 50,
        status: projectForm.status || 'Đang phát triển',
        description: projectForm.description || 'Chưa có mô tả',
      };
      updatedProjects.push(newProject);
      alert('Thêm dự án mới thành công!');
    }

    setProjects(updatedProjects);
    localStorage.setItem('ztool_projects', JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event('storage'));
    resetProjectForm();
  };

  const handleEditProjectClick = (project: any) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      image: project.image,
      server: project.server,
      progress: project.progress ? project.progress.toString() : '50',
      status: project.status || 'Đang phát triển',
      description: project.description || '',
    });
  };

  const handleDeleteProject = (id: number) => {
    if (confirm('Xóa dự án này?')) {
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      localStorage.setItem('ztool_projects', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      if (editingProjectId === id) {
        resetProjectForm();
      }
    }
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      image: '',
      server: '',
      progress: '50',
      status: 'Đang phát triển',
      description: '',
    });
  };

  // --- QUẢN LÝ TÀI KHOẢN HANDLERS ---
  const handleUpdateBalance = (userId: number) => {
    const amount = prompt('Nhập số tiền muốn cộng (+) hoặc trừ (-) vào ví:');
    if (amount !== null && !isNaN(Number(amount))) {
      const numAmount = Number(amount);
      
      const updated = users.map((u) => {
        if (u.id === userId) {
          const newBalance = Math.max(0, (u.balance || 0) + numAmount);

          const savedCurrentUser = localStorage.getItem('ztool_current_user');
          if (savedCurrentUser) {
            try {
              const parsed = JSON.parse(savedCurrentUser);
              if (parsed.username && parsed.username.trim().toLowerCase() === u.username.trim().toLowerCase()) {
                const updatedCurrent = { ...parsed, balance: newBalance };
                localStorage.setItem('ztool_current_user', JSON.stringify(updatedCurrent));
              }
            } catch (e) {
              console.error(e);
            }
          }

          return { ...u, balance: newBalance };
        }
        return u;
      });

      setUsers(updated);
      localStorage.setItem('ztool_users', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername || !newUserPassword) {
      alert('Vui lòng nhập Tên tài khoản và Mật khẩu!');
      return;
    }

    const isExist = users.some((u) => u.username.toLowerCase() === newUserUsername.trim().toLowerCase());
    if (isExist) {
      alert('Tài khoản này đã tồn tại trong hệ thống!');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const maxId = users.reduce((max: number, u: any) => (u.id > max ? u.id : max), 0);

    const newUser = {
      id: maxId + 1,
      username: newUserUsername.trim(),
      password: newUserPassword.trim(),
      balance: Number(newUserBalance) || 0,
      status: 'Active',
      createdAt: formattedDate,
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('ztool_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserBalance('');
    alert('Thêm tài khoản mới thành công!');
  };

  const handleToggleUserStatus = (userId: number) => {
    const updated = users.map((u) =>
      u.id === userId ? { ...u, status: u.status === 'Banned' ? 'Active' : 'Banned' } : u
    );
    setUsers(updated);
    localStorage.setItem('ztool_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleChangePassword = (userId: number, currentUsername: string) => {
    const newPass = prompt(`Nhập mật khẩu mới cho tài khoản "${currentUsername}":`);
    if (newPass !== null && newPass.trim() !== '') {
      const updated = users.map((u) => (u.id === userId ? { ...u, password: newPass.trim() } : u));
      setUsers(updated);
      localStorage.setItem('ztool_users', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert('Đã cập nhật mật khẩu mới thành công!');
    }
  };

  const handleDeleteUser = (userId: number, username: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${username}"?`)) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      localStorage.setItem('ztool_users', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // --- QUẢN LÝ TOOL HANDLERS ---
  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name || !toolForm.priceDay) {
      alert('Vui lòng điền tên Tool và giá theo Ngày!');
      return;
    }

    let updatedTools = [...tools];
    if (editingToolId) {
      updatedTools = updatedTools.map((t) =>
        t.id === editingToolId
          ? {
              ...t,
              name: toolForm.name,
              image: toolForm.image || '/logo.jpg',
              description: toolForm.description,
              priceDay: Number(toolForm.priceDay),
              priceWeek: Number(toolForm.priceWeek) || 0,
              priceMonth: Number(toolForm.priceMonth) || 0,
              priceLifetime: Number(toolForm.priceLifetime) || 0,
            }
          : t
      );
      alert('Cập nhật Tool thành công!');
    } else {
      const newTool = {
        id: Date.now(),
        name: toolForm.name,
        image: toolForm.image || '/logo.jpg',
        description: toolForm.description || 'Chưa có mô tả',
        priceDay: Number(toolForm.priceDay),
        priceWeek: Number(toolForm.priceWeek) || 0,
        priceMonth: Number(toolForm.priceMonth) || 0,
        priceLifetime: Number(toolForm.priceLifetime) || 0,
        status: 'Hoạt động tốt',
        buyDay: 0,
        buyWeek: 0,
        buyMonth: 0,
        buyLifetime: 0,
        buyCount: 0,
      };
      updatedTools.push(newTool);
      alert('Thêm Tool mới thành công!');
    }

    setTools(updatedTools);
    localStorage.setItem('ztool_tools', JSON.stringify(updatedTools));
    window.dispatchEvent(new Event('storage'));
    resetToolForm();
  };

  const handleEditToolClick = (tool: any) => {
    setEditingToolId(tool.id);
    setToolForm({
      name: tool.name,
      image: tool.image,
      description: tool.description,
      priceDay: tool.priceDay ? tool.priceDay.toString() : '',
      priceWeek: tool.priceWeek ? tool.priceWeek.toString() : '',
      priceMonth: tool.priceMonth ? tool.priceMonth.toString() : '',
      priceLifetime: tool.priceLifetime ? tool.priceLifetime.toString() : '',
    });
  };

  const handleDeleteTool = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa Tool này?')) {
      const updated = tools.filter((t) => t.id !== id);
      setTools(updated);
      localStorage.setItem('ztool_tools', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const resetToolForm = () => {
    setEditingToolId(null);
    setToolForm({ name: '', image: '', description: '', priceDay: '', priceWeek: '', priceMonth: '', priceLifetime: '' });
  };

  const handleDeleteFeedback = (id: number) => {
    if (confirm('Xóa góp ý này?')) {
      const updated = feedbacks.filter((f) => f.id !== id);
      setFeedbacks(updated);
      localStorage.setItem('ztool_feedbacks', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="min-h-screen bg-[#080B10] text-white flex flex-col font-sans">
      <header className="bg-[#0F141C] border-b border-[#1A2332] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 bg-[#080B10] hover:bg-[#1A2332] border border-[#1A2332] text-xs font-semibold px-3 py-2 rounded-xl transition text-gray-300">
            <ArrowLeft className="w-4 h-4 text-cyanGlow" /> Trang Chủ ZTool
          </Link>
          <div className="h-5 w-[1px] bg-[#1A2332]" />
          <h1 className="font-extrabold text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyanGlow" /> ADMIN DASHBOARD
          </h1>
        </div>

        <button onClick={loadAllData} className="flex items-center gap-1.5 bg-[#080B10] hover:bg-[#1A2332] border border-[#1A2332] text-xs font-bold px-3 py-2 rounded-xl text-cyanGlow transition">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới dữ liệu
        </button>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">Danh mục quản lý</span>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'users' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20' : 'text-gray-300 hover:bg-[#1A2332]'
              }`}
            >
              <Users className="w-4 h-4" /> Quản Lý Tài Khoản ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'tools' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20' : 'text-gray-300 hover:bg-[#1A2332]'
              }`}
            >
              <Package className="w-4 h-4" /> Quản Lý Tool Auto ({tools.length})
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'projects' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20' : 'text-gray-300 hover:bg-[#1A2332]'
              }`}
            >
              <FolderKanban className="w-4 h-4" /> Quản Lý Dự Án ({projects.length})
            </button>

            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'feedbacks' ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20' : 'text-gray-300 hover:bg-[#1A2332]'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Góp Ý Nghề/Server ({feedbacks.length})
            </button>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: QUẢN LÝ TÀI KHOẢN */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyanGlow" /> THÊM TÀI KHOẢN MỚI TỪ ADMIN
                </h2>

                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                      placeholder="Tên tài khoản..."
                      className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Mật khẩu *</label>
                    <input
                      type="text"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Số dư Ví ban đầu (VNĐ)</label>
                    <input
                      type="number"
                      value={newUserBalance}
                      onChange={(e) => setNewUserBalance(e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-2.5 rounded-xl hover:opacity-90 transition cursor-pointer">
                    THÊM TÀI KHOẢN
                  </button>
                </form>
              </div>

              <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-white">DANH SÁCH TÀI KHOẢN HỆ THỐNG</h2>
                  <span className="text-xs text-gray-400">Tổng cộng: <b className="text-cyanGlow">{users.length}</b> tài khoản</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Mật khẩu</th>
                        <th className="p-3">Số dư ví</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3">Ngày tạo</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2332]">
                      {users.map((u, index) => {
                        const isOnline = onlineUsername !== '' && onlineUsername === u.username.trim().toLowerCase();
                        const isBanned = u.status === 'Banned';

                        return (
                          <tr key={u.id} className="hover:bg-[#080B10]/50 transition">
                            <td className="p-3 font-mono font-bold text-cyanGlow">#{index + 1}</td>
                            <td className="p-3 font-bold text-white">{u.username}</td>
                            <td className="p-3 font-mono text-amber-300 font-bold">{u.password}</td>
                            <td className="p-3 font-bold text-emerald-400">{u.balance ? u.balance.toLocaleString('vi-VN') : 0} VNĐ</td>
                            
                            <td className="p-3">
                              {isBanned ? (
                                <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Banned
                                </span>
                              ) : isOnline ? (
                                <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-gray-500/10 text-gray-400 border border-gray-500/30 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Offline
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-gray-400 font-mono text-[11px]">{u.createdAt || 'Mới tạo'}</td>

                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleUpdateBalance(u.id)}
                                className="bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                <Wallet className="w-3.5 h-3.5 inline mr-1" />Ví
                              </button>

                              <button
                                onClick={() => handleChangePassword(u.id, u.username)}
                                className="bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5 inline mr-1" />Mật khẩu
                              </button>

                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                  u.status === 'Banned'
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {u.status === 'Banned' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ TOOL AUTO */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {editingToolId ? <Edit3 className="w-5 h-5 text-cyanGlow" /> : <Plus className="w-5 h-5 text-cyanGlow" />}
                    {editingToolId ? 'CHỈNH SỬA TOOL AUTO' : 'THÊM TOOL AUTO MỚI'}
                  </h2>
                  {editingToolId && (
                    <button onClick={resetToolForm} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                      <X className="w-4 h-4" /> Hủy sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveTool} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Tool Auto *</label>
                      <input
                        type="text"
                        required
                        value={toolForm.name}
                        onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                        placeholder="VD: TOOL AUTO FARM VIP"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Link Ảnh Tool (/logo.jpg)</label>
                      <input
                        type="text"
                        value={toolForm.image}
                        onChange={(e) => setToolForm({ ...toolForm, image: e.target.value })}
                        placeholder="/logo.jpg"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Mô tả ngắn</label>
                    <textarea
                      rows={2}
                      value={toolForm.description}
                      onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                      placeholder="Mô tả các chức năng nổi bật..."
                      className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">Giá Ngày (VNĐ) *</label>
                      <input
                        type="number"
                        required
                        value={toolForm.priceDay}
                        onChange={(e) => setToolForm({ ...toolForm, priceDay: e.target.value })}
                        placeholder="30000"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">Giá Tuần (VNĐ)</label>
                      <input
                        type="number"
                        value={toolForm.priceWeek}
                        onChange={(e) => setToolForm({ ...toolForm, priceWeek: e.target.value })}
                        placeholder="150000"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">Giá Tháng (VNĐ)</label>
                      <input
                        type="number"
                        value={toolForm.priceMonth}
                        onChange={(e) => setToolForm({ ...toolForm, priceMonth: e.target.value })}
                        placeholder="250000"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">Vĩnh Viễn (VNĐ)</label>
                      <input
                        type="number"
                        value={toolForm.priceLifetime}
                        onChange={(e) => setToolForm({ ...toolForm, priceLifetime: e.target.value })}
                        placeholder="800000"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-6 py-3 rounded-xl hover:opacity-90 transition cursor-pointer">
                    {editingToolId ? 'LƯU THAY ĐỔI' : 'THÊM TOOL MỚI'}
                  </button>
                </form>
              </div>

              <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl space-y-3">
                <h2 className="text-base font-bold text-white mb-4">DANH SÁCH TOOL HIỆN CÓ</h2>
                {tools.map((t) => (
                  <div key={t.id} className="bg-[#080B10] border border-[#1A2332] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neonBlue/40 shrink-0">
                        <Image src={t.image || '/logo.jpg'} alt={t.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-cyanGlow">{t.name}</h3>
                        <p className="text-xs text-gray-400">{t.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-[11px] text-gray-300 font-semibold pt-0.5">
                          <span>Ngày: <b className="text-emerald-400">{t.priceDay?.toLocaleString('vi-VN')}đ</b></span> | 
                          <span>Tuần: <b className="text-emerald-400">{t.priceWeek?.toLocaleString('vi-VN')}đ</b></span> | 
                          <span>Tháng: <b className="text-emerald-400">{t.priceMonth?.toLocaleString('vi-VN')}đ</b></span> | 
                          <span>Vĩnh viễn: <b className="text-amber-400">{t.priceLifetime?.toLocaleString('vi-VN')}đ</b></span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                          <span className="flex items-center gap-1 text-cyanGlow font-bold">
                            <ShoppingBag className="w-3.5 h-3.5" /> Lượt mua:
                          </span>
                          <span className="bg-neonBlue/10 border border-neonBlue/30 text-cyanGlow px-2 py-0.5 rounded-md font-mono text-[11px]">Ngày: <b>{t.buyDay || 0}</b></span>
                          <span className="bg-neonBlue/10 border border-neonBlue/30 text-cyanGlow px-2 py-0.5 rounded-md font-mono text-[11px]">Tuần: <b>{t.buyWeek || 0}</b></span>
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-mono text-[11px]">Tháng: <b>{t.buyMonth || 0}</b></span>
                          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-md font-mono text-[11px]">Vĩnh Viễn: <b>{t.buyLifetime || 0}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button onClick={() => handleEditToolClick(t)} className="p-2 bg-neonBlue/10 hover:bg-neonBlue/20 text-cyanGlow border border-neonBlue/30 rounded-xl transition cursor-pointer" title="Chỉnh sửa Tool">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTool(t.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition cursor-pointer" title="Xóa Tool">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUẢN LÝ DỰ ÁN (CÓ THÊM CHỨC NĂNG SỬA) */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {editingProjectId ? <Edit3 className="w-5 h-5 text-cyanGlow" /> : <Plus className="w-5 h-5 text-cyanGlow" />}
                    {editingProjectId ? 'CHỈNH SỬA DỰ ÁN' : 'THÊM DỰ ÁN MỚI'}
                  </h2>
                  {editingProjectId && (
                    <button onClick={resetProjectForm} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer">
                      <X className="w-4 h-4" /> Hủy sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Dự Án *</label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="VD: Tool Auto Bác Sĩ"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Server *</label>
                      <input
                        type="text"
                        required
                        value={projectForm.server}
                        onChange={(e) => setProjectForm({ ...projectForm, server: e.target.value })}
                        placeholder="VD: GTA5VN / LuQuyRP"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Link Ảnh (/logo.jpg)</label>
                      <input
                        type="text"
                        value={projectForm.image}
                        onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                        placeholder="/logo.jpg"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Tiến độ (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={projectForm.progress}
                        onChange={(e) => setProjectForm({ ...projectForm, progress: e.target.value })}
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Trạng thái</label>
                      <input
                        type="text"
                        value={projectForm.status}
                        onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                        placeholder="VD: Đang thử nghiệm Beta"
                        className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Mô tả dự án</label>
                    <textarea
                      rows={2}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Mô tả ngắn..."
                      className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button type="submit" className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-6 py-3 rounded-xl hover:opacity-90 transition cursor-pointer">
                    {editingProjectId ? 'LƯU THAY ĐỔI' : 'THÊM DỰ ÁN'}
                  </button>
                </form>
              </div>

              <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl space-y-3">
                <h2 className="text-base font-bold text-white mb-4">DANH SÁCH DỰ ÁN ĐANG LẬP</h2>
                {projects.map((p) => (
                  <div key={p.id} className="bg-[#080B10] border border-[#1A2332] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neonBlue shrink-0">
                        <Image src={p.image || '/logo.jpg'} alt={p.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-cyanGlow">{p.title}</h3>
                        <p className="text-xs text-gray-400">Server: {p.server} | Tiến độ: <b className="text-amber-400">{p.progress}%</b></p>
                        {p.description && <p className="text-[11px] text-gray-500 mt-0.5">{p.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditProjectClick(p)} className="p-2 bg-neonBlue/10 hover:bg-neonBlue/20 text-cyanGlow border border-neonBlue/30 rounded-xl transition cursor-pointer" title="Chỉnh sửa Dự Án">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProject(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition cursor-pointer" title="Xóa Dự Án">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BẢNG GÓP Ý */}
          {activeTab === 'feedbacks' && (
            <div className="bg-[#0F141C] border border-[#1A2332] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white">BẢNG THỐNG KÊ GÓP Ý TỪ KHÁCH HÀNG</h2>
                <span className="text-xs text-gray-400">Tổng cộng: <b className="text-cyanGlow">{feedbacks.length}</b> góp ý</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Tên Server FiveM</th>
                      <th className="p-3">Nghề Cần Làm Tool</th>
                      <th className="p-3">Ghi chú</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2332]">
                    {feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">Chưa có góp ý nào từ khách hàng</td>
                      </tr>
                    ) : (
                      feedbacks.map((f, index) => (
                        <tr key={f.id} className="hover:bg-[#080B10]/50 transition">
                          <td className="p-3 font-mono font-bold text-cyanGlow">#{index + 1}</td>
                          <td className="p-3 font-bold text-white">{f.server}</td>
                          <td className="p-3 font-bold text-amber-300">{f.job}</td>
                          <td className="p-3 text-gray-400">{f.note || 'Không có'}</td>
                          <td className="p-3 font-mono text-gray-500">{f.createdAt}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleDeleteFeedback(f.id)} className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}