'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Lock, User, Key, ShieldCheck, LogOut, Users, 
  Wrench, FolderKanban, MessageSquare, Plus, Trash2, Edit, RefreshCw,
  Ban, CheckCircle, CreditCard, KeyRound, Search, DollarSign, Settings,
  Upload, Loader2, Eye, EyeOff
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'projects' | 'keys' | 'sepay' | 'feedback'>('users');

  // Dữ liệu Realtime
  const [users, setUsers] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [keysList, setKeysList] = useState<any[]>([]);
  const [sepayLogs, setSepayLogs] = useState<any[]>([]);

  // States thao tác
  const [userSearch, setUserSearch] = useState('');
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', balance: 0 });
  const [editUserPass, setEditUserPass] = useState<{ username: string; newPass: string } | null>(null);
  const [adjustBal, setAdjustBal] = useState<{ username: string; amount: number; isAdd: boolean } | null>(null);
  
  // State Ẩn / Hiện mật khẩu
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // States Tool Auto (Đã có thêm trường status)
  const [toolForm, setToolForm] = useState({
    id: 0,
    name: '',
    image: '',
    status: 'Đang hoạt động',
    priceDay: '',
    priceWeek: '',
    priceMonth: '',
    priceLifetime: '',
    description: '',
    downloadLink: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingTool, setIsEditingTool] = useState(false);

  // States Dự Án
  const [projectForm, setProjectForm] = useState({
    id: 0,
    title: '',
    image: '',
    description: '',
    status: 'Hoạt động tốt'
  });
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectPreviewUrl, setProjectPreviewUrl] = useState<string>('');
  const [isUploadingProject, setIsUploadingProject] = useState(false);

  const [newKeyForm, setNewKeyForm] = useState({ toolName: '', keyString: '', duration: '1 Ngày' });

  useEffect(() => {
    const isLogged = localStorage.getItem('ztool_admin_authenticated');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      loadAllSyncData();
    }
  }, []);

  const loadAllSyncData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*').order('id', { ascending: false });
      if (userData) setUsers(userData);

      const { data: toolData } = await supabase.from('tools').select('*').order('id', { ascending: false });
      if (toolData) {
        const mappedTools = toolData.map((t: any) => ({
          id: t.id,
          name: t.name,
          image: t.image,
          status: t.status || 'Đang hoạt động',
          priceDay: t.priceDay || t.price_day || '',
          priceWeek: t.priceWeek || t.price_week || '',
          priceMonth: t.priceMonth || t.price_month || '',
          priceLifetime: t.priceLifetime || t.price_lifetime || '',
          description: t.description,
          downloadLink: t.downloadLink || t.download_link || ''
        }));
        setTools(mappedTools);
      }

      const { data: projectData } = await supabase.from('projects').select('*').order('id', { ascending: false });
      if (projectData) setProjects(projectData);

      const { data: feedbackData } = await supabase.from('feedbacks').select('*').order('id', { ascending: false });
      if (feedbackData) setFeedbacks(feedbackData);

      const savedKeys = localStorage.getItem('ztool_keys');
      if (savedKeys) setKeysList(JSON.parse(savedKeys));

      const savedSepay = localStorage.getItem('ztool_recharge_history');
      if (savedSepay) setSepayLogs(JSON.parse(savedSepay));
    } catch (e) {
      console.error('Error loading Supabase sync data:', e);
    }
  };

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

  const handleToggleShowPass = (username: string) => {
    setShowPasswords(prev => ({ ...prev, [username]: !prev[username] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProjectImageFile(file);
      setProjectPreviewUrl(URL.createObjectURL(file));
    }
  };

  // QUẢN LÝ NGƯỜI DÙNG
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username || !newUserForm.password) return alert('Nhập đủ username/password!');
    
    const { error } = await supabase.from('users').insert([
      {
        username: newUserForm.username.trim(),
        password: newUserForm.password,
        balance: Number(newUserForm.balance) || 0,
        isBanned: false
      }
    ]);

    if (error) {
      alert('Lỗi tạo tài khoản: ' + error.message);
    } else {
      setNewUserForm({ username: '', password: '', balance: 0 });
      alert('Tạo người dùng thành công trên Cloud Database!');
      loadAllSyncData();
    }
  };

  const handleToggleBanUser = async (u: any) => {
    const { error } = await supabase.from('users').update({ isBanned: !u.isBanned }).eq('id', u.id);
    if (!error) loadAllSyncData();
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`Xóa tài khoản ${username}?`)) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) loadAllSyncData();
  };

  const handleSaveUserPassword = async (id: number) => {
    if (!editUserPass?.newPass) return;
    const { error } = await supabase.from('users').update({ password: editUserPass.newPass }).eq('id', id);
    if (!error) {
      setEditUserPass(null);
      alert('Đã cập nhật mật khẩu thành công!');
      loadAllSyncData();
    }
  };

  const handleExecAdjustBalance = async (u: any, isAddMode: boolean) => {
    if (!adjustBal || !adjustBal.amount) return alert('Vui lòng nhập số tiền hợp lệ!');
    
    const cur = Number(u.balance) || 0;
    const changeAmt = Number(adjustBal.amount);
    const next = isAddMode ? cur + changeAmt : Math.max(0, cur - changeAmt);
    
    const { error } = await supabase.from('users').update({ balance: next }).eq('id', u.id);
    
    if (error) {
      alert('Lỗi cập nhật số dư: ' + error.message);
    } else {
      setAdjustBal(null);
      alert(`${isAddMode ? 'Cộng' : 'Trừ'} tiền thành công! Số dư mới: ${next.toLocaleString('vi-VN')} VNĐ`);
      loadAllSyncData();
    }
  };

  // QUẢN LÝ TOOL
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name) return alert('Nhập tên Tool!');

    setIsUploading(true);
    let finalImageUrl = toolForm.image;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `tools/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tool-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        setIsUploading(false);
        return alert('Lỗi tải ảnh lên Storage: ' + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from('tool-images')
        .getPublicUrl(filePath);

      finalImageUrl = urlData.publicUrl;
    }

    const payload = {
      name: toolForm.name,
      image: finalImageUrl,
      status: toolForm.status,
      priceDay: toolForm.priceDay,
      priceWeek: toolForm.priceWeek,
      priceMonth: toolForm.priceMonth,
      priceLifetime: toolForm.priceLifetime,
      description: toolForm.description,
      downloadLink: toolForm.downloadLink
    };

    let result;
    if (isEditingTool && toolForm.id) {
      result = await supabase.from('tools').update(payload).eq('id', toolForm.id);
    } else {
      result = await supabase.from('tools').insert([payload]);
    }

    setIsUploading(false);

    if (result.error) {
      alert('Lỗi lưu Tool: ' + result.error.message);
    } else {
      setImageFile(null);
      setPreviewUrl('');
      setToolForm({ id: 0, name: '', image: '', status: 'Đang hoạt động', priceDay: '', priceWeek: '', priceMonth: '', priceLifetime: '', description: '', downloadLink: '' });
      setIsEditingTool(false);
      alert('Lưu sản phẩm thành công!');
      loadAllSyncData();
    }
  };

  const handleDeleteTool = async (id: number) => {
    if (!confirm('Xóa Tool này khỏi hệ thống?')) return;
    const { error } = await supabase.from('tools').delete().eq('id', id);
    if (!error) loadAllSyncData();
  };

  // QUẢN LÝ DỰ ÁN
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title) return alert('Nhập tên dự án!');

    setIsUploadingProject(true);
    let finalImageUrl = projectForm.image;

    if (projectImageFile) {
      const fileExt = projectImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tool-images')
        .upload(filePath, projectImageFile);

      if (uploadError) {
        setIsUploadingProject(false);
        return alert('Lỗi tải ảnh dự án lên Storage: ' + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from('tool-images')
        .getPublicUrl(filePath);

      finalImageUrl = urlData.publicUrl;
    }

    const payload = {
      title: projectForm.title,
      image: finalImageUrl,
      status: projectForm.status,
      description: projectForm.description
    };

    const { error } = await supabase.from('projects').insert([payload]);

    setIsUploadingProject(false);

    if (error) {
      alert('Lỗi lưu dự án: ' + error.message);
    } else {
      setProjectImageFile(null);
      setProjectPreviewUrl('');
      setProjectForm({ id: 0, title: '', image: '', description: '', status: 'Hoạt động tốt' });
      alert('Thêm dự án mới thành công!');
      loadAllSyncData();
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Xóa dự án này?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) loadAllSyncData();
  };

  // KEY VÀ Ý KIẾN
  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.keyString) return alert('Nhập chuỗi Key!');
    const updated = [...keysList, { ...newKeyForm, id: Date.now(), isUsed: false, createdAt: new Date().toLocaleString('vi-VN') }];
    setKeysList(updated);
    localStorage.setItem('ztool_keys', JSON.stringify(updated));
    setNewKeyForm({ toolName: '', keyString: '', duration: '1 Ngày' });
  };

  const handleDeleteKey = (id: number) => {
    const updated = keysList.filter(k => k.id !== id);
    setKeysList(updated);
    localStorage.setItem('ztool_keys', JSON.stringify(updated));
  };

  const handleDeleteFeedback = async (id: number) => {
    const { error } = await supabase.from('feedbacks').delete().eq('id', id);
    if (!error) loadAllSyncData();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#06090E] text-white font-sans flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-[#0D121D] border border-[#1C2638] rounded-3xl p-8 shadow-2xl">
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">HỆ THỐNG QUẢN TRỊ ZTOOL</h1>
            <p className="text-xs text-slate-400">Đăng nhập tài khoản Quản trị viên để truy cập</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Tài khoản Quản trị</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Nhập username..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#06090E] border border-[#1C2638] focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Mật khẩu Bảo mật</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#06090E] border border-[#1C2638] focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4" /> XÁC THỰC VÀ ĐĂNG NHẬP
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06090E] text-slate-200 font-sans flex flex-col">
      <header className="bg-[#0D121D] border-b border-[#1C2638] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide">CONTROL PANEL DASHBOARD</h1>
            <p className="text-[11px] text-slate-400">Đồng bộ Cloud Supabase Realtime</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllSyncData}
            className="bg-[#141C2B] border border-[#1C2638] hover:border-slate-600 text-slate-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Tải lại dữ liệu Cloud
          </button>

          <button
            onClick={handleAdminLogout}
            className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-4 py-8 space-y-8 flex-1">
        <div className="flex flex-wrap items-center gap-2 bg-[#0D121D] p-2 rounded-2xl border border-[#1C2638]">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'users' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
            }`}
          >
            <Users className="w-4 h-4" /> QUẢN LÝ NGƯỜI DÙNG ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tools' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
            }`}
          >
            <Wrench className="w-4 h-4" /> SẢN PHẨM TOOL ({tools.length})
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'projects' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
            }`}
          >
            <FolderKanban className="w-4 h-4" /> DỰ ÁN CỦA SHOP ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'keys' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
            }`}
          >
            <KeyRound className="w-4 h-4" /> KHO KEY AUTO ({keysList.length})
          </button>

          <button
            onClick={() => setActiveTab('sepay')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'sepay' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
            }`}
          >
            <CreditCard className="w-4 h-4" /> LỊCH SỬ SEPAY ({sepayLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'feedback' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-[#141C2B]'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> ĐÓNG GÓP DỰ ÁN TOOL ({feedbacks.length})
          </button>
        </div>

        {/* 1. TAB USER */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateUser} className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-[#1C2638] pb-3 uppercase tracking-wider">
                <Plus className="w-4 h-4 text-cyan-400" /> Tạo tài khoản người dùng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Tên tài khoản..." value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} className="bg-[#06090E] border border-[#1C2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                <input type="text" placeholder="Mật khẩu..." value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="bg-[#06090E] border border-[#1C2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                <input type="number" placeholder="Số dư ban đầu (VNĐ)..." value={newUserForm.balance || ''} onChange={e => setNewUserForm({ ...newUserForm, balance: Number(e.target.value) })} className="bg-[#06090E] border border-[#1C2638] rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <button type="submit" className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 px-5 py-2 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer">Thêm người dùng mới</button>
            </form>

            <div className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C2638] pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> DANH SÁCH KHÁCH HÀNG (DATABASE CLOUD)
                </h2>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input type="text" placeholder="Tìm tên..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#06090E] border-b border-[#1C2638] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Tài khoản</th>
                      <th className="p-3">Mật khẩu</th>
                      <th className="p-3">Số dư ví</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2638]">
                    {users.filter(u => u.username?.toLowerCase().includes(userSearch.toLowerCase())).map((u, i) => (
                      <tr key={i} className="hover:bg-[#06090E]/50 transition">
                        <td className="p-3 font-bold text-white">{u.username}</td>
                        <td className="p-3 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400">
                              {showPasswords[u.username] ? u.password || '---' : '••••••••'}
                            </span>
                            <button 
                              onClick={() => handleToggleShowPass(u.username)}
                              className="text-slate-500 hover:text-white transition cursor-pointer"
                              title={showPasswords[u.username] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                              {showPasswords[u.username] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-emerald-400">{(u.balance || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="p-3">
                          {u.isBanned ? (
                            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Bị BAN</span>
                          ) : (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Hoạt động</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => setAdjustBal({ username: u.username, amount: 0, isAdd: true })} className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20 cursor-pointer" title="Cộng/Trừ tiền"><DollarSign className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditUserPass({ username: u.username, newPass: '' })} className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded-lg border border-cyan-500/20 cursor-pointer" title="Đổi mật khẩu"><Key className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleToggleBanUser(u)} className={`p-1.5 rounded-lg border cursor-pointer ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteUser(u.id, u.username)} className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg border border-rose-500/20 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {editUserPass && (
                <div className="bg-[#06090E] border border-[#1C2638] p-4 rounded-xl space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-white">Đổi mật khẩu cho: {editUserPass.username}</h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nhập mật khẩu mới..." value={editUserPass.newPass} onChange={e => setEditUserPass({ ...editUserPass, newPass: e.target.value })} className="bg-[#0D121D] border border-[#1C2638] px-3 py-1.5 text-xs text-white rounded-lg flex-1" />
                    <button onClick={() => { const user = users.find(u => u.username === editUserPass.username); if (user) handleSaveUserPassword(user.id); }} className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Lưu</button>
                    <button onClick={() => setEditUserPass(null)} className="text-slate-400 text-xs px-2 cursor-pointer">Hủy</button>
                  </div>
                </div>
              )}

              {adjustBal && (
                <div className="bg-[#06090E] border border-[#1C2638] p-4 rounded-xl space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-white">Điều chỉnh số dư ví cho: {adjustBal.username}</h4>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="Nhập số tiền..." 
                      value={adjustBal.amount || ''} 
                      onChange={e => setAdjustBal({ ...adjustBal, amount: Number(e.target.value) })} 
                      className="bg-[#0D121D] border border-[#1C2638] px-3 py-1.5 text-xs text-white rounded-lg flex-1 focus:outline-none" 
                    />
                    
                    <button 
                      onClick={() => { 
                        const user = users.find(u => u.username === adjustBal.username); 
                        if (user) handleExecAdjustBalance(user, true); 
                      }} 
                      className="bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                    >
                      + Cộng tiền
                    </button>

                    <button 
                      onClick={() => { 
                        const user = users.find(u => u.username === adjustBal.username); 
                        if (user) handleExecAdjustBalance(user, false); 
                      }} 
                      className="bg-rose-500/20 text-rose-400 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-500/30 transition cursor-pointer"
                    >
                      - Trừ tiền
                    </button>

                    <button onClick={() => setAdjustBal(null)} className="text-slate-400 text-xs px-2 cursor-pointer">Hủy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. TAB TOOL AUTO (ĐÃ THÊM Ô CHỌN TRẠNG THÁI TOOL) */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveTool} className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-[#1C2638] pb-3 uppercase">
                <Plus className="w-4 h-4 text-cyan-400" /> {isEditingTool ? 'Cập nhật Tool' : 'Thêm Tool mới'}
              </h3>
              
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tên Tool</label>
                <input type="text" required value={toolForm.name} onChange={e => setToolForm({ ...toolForm, name: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white focus:outline-none" placeholder="vd: AUTO FARM F17" />
              </div>

              {/* Ô Chọn Trạng Thái Tool */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Trạng Thái Hoạt Động</label>
                <select 
                  value={toolForm.status} 
                  onChange={e => setToolForm({ ...toolForm, status: e.target.value })}
                  className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400">Ảnh Minh Họa Sản Phẩm</label>
                
                <label className="flex items-center justify-center gap-2 bg-[#06090E] border border-dashed border-[#1C2638] hover:border-cyan-500 text-slate-300 p-3 rounded-xl text-xs cursor-pointer transition">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Chọn file ảnh từ máy tính...'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {(previewUrl || toolForm.image) && (
                  <div className="w-full aspect-square bg-[#06090E] border border-[#1C2638] rounded-xl overflow-hidden relative">
                    <img src={previewUrl || toolForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400">Giá Ngày (VNĐ)</label>
                  <input type="text" value={toolForm.priceDay} onChange={e => setToolForm({ ...toolForm, priceDay: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Giá Tuần (VNĐ)</label>
                  <input type="text" value={toolForm.priceWeek} onChange={e => setToolForm({ ...toolForm, priceWeek: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white" placeholder="20000" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Giá Tháng (VNĐ)</label>
                  <input type="text" value={toolForm.priceMonth} onChange={e => setToolForm({ ...toolForm, priceMonth: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Giá Vĩnh Viễn (VNĐ)</label>
                  <input type="text" value={toolForm.priceLifetime} onChange={e => setToolForm({ ...toolForm, priceLifetime: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white" placeholder="100000" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mô tả sản phẩm</label>
                <textarea value={toolForm.description} onChange={e => setToolForm({ ...toolForm, description: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white" placeholder="Chi tiết tính năng..." />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Link Tải Tool</label>
                <input type="text" value={toolForm.downloadLink} onChange={e => setToolForm({ ...toolForm, downloadLink: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2 text-xs text-white" placeholder="https://..." />
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>ĐANG UPLOAD ẢNH & LƯU...</span>
                  </>
                ) : (
                  <span>LƯU TỚI KHÁCH HÀNG (SUPABASE)</span>
                )}
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white border-b border-[#1C2638] pb-3 uppercase">DANH SÁCH TOOL AUTO HIỂN THỊ REALTIME</h3>
              <div className="space-y-3">
                {tools.length === 0 ? <p className="text-xs text-slate-500">Chưa có dữ liệu Tool trên Cloud Database</p> : tools.map((t) => (
                  <div key={t.id} className="bg-[#06090E] border border-[#1C2638] p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {t.image && (
                        <div className="w-16 h-16 bg-[#0D121D] border border-[#1C2638] rounded-lg overflow-hidden shrink-0">
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs">{t.name}</h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            t.status === 'Tạm ngưng' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          }`}>
                            {t.status || 'Đang hoạt động'}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-medium">Giá: Ngày {t.priceDay || 0}đ | Tuần {t.priceWeek || 0}đ | Tháng {t.priceMonth || 0}đ | VV {t.priceLifetime || 0}đ</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setToolForm(t); setPreviewUrl(t.image); setIsEditingTool(true); }} className="text-cyan-400 p-2 hover:bg-cyan-500/10 rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteTool(t.id)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB DỰ ÁN */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveProject} className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-[#1C2638] pb-3 uppercase">
                <Plus className="w-4 h-4 text-cyan-400" /> Thêm dự án
              </h3>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tên Dự Án</label>
                <input type="text" required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2.5 text-xs text-white focus:outline-none" placeholder="Tên dự án..." />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400">Ảnh Minh Họa Dự Án</label>
                
                <label className="flex items-center justify-center gap-2 bg-[#06090E] border border-dashed border-[#1C2638] hover:border-cyan-500 text-slate-300 p-3 rounded-xl text-xs cursor-pointer transition">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{projectImageFile ? projectImageFile.name : 'Chọn file ảnh từ máy tính...'}</span>
                  <input type="file" accept="image/*" onChange={handleProjectFileChange} className="hidden" />
                </label>

                {(projectPreviewUrl || projectForm.image) && (
                  <div className="w-full aspect-square bg-[#06090E] border border-[#1C2638] rounded-xl overflow-hidden relative">
                    <img src={projectPreviewUrl || projectForm.image} alt="Preview Project" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tình trạng Dự án</label>
                <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2.5 text-xs text-white">
                  <option value="Hoạt động tốt">Hoạt động tốt</option>
                  <option value="Đang bảo trì">Đang bảo trì</option>
                  <option value="Sắp cập nhật">Sắp cập nhật</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Mô tả dự án</label>
                <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2.5 text-xs text-white" placeholder="Chi tiết..." />
              </div>

              <button 
                type="submit" 
                disabled={isUploadingProject}
                className="w-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isUploadingProject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>ĐANG UPLOAD ẢNH & LƯU...</span>
                  </>
                ) : (
                  <span>LƯU DỰ ÁN CLOUD</span>
                )}
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white border-b border-[#1C2638] pb-3 uppercase">DANH SÁCH DỰ ÁN CỦA SHOP</h3>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="bg-[#06090E] border border-[#1C2638] p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {p.image && (
                        <div className="w-16 h-16 bg-[#0D121D] border border-[#1C2638] rounded-lg overflow-hidden shrink-0">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-xs">{p.title}</h4>
                        <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">{p.status}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{p.description}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProject(p.id)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB KEY */}
        {activeTab === 'keys' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddKey} className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-[#1C2638] pb-3 uppercase">
                <Plus className="w-4 h-4 text-cyan-400" /> Khởi tạo Key phát tự động
              </h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tên Tool áp dụng</label>
                <input type="text" required placeholder="vd: AUTO FARM F17" value={newKeyForm.toolName} onChange={e => setNewKeyForm({ ...newKeyForm, toolName: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Chuỗi Key kích hoạt</label>
                <input type="text" required placeholder="ZTOOL-XXXX-YYYY" value={newKeyForm.keyString} onChange={e => setNewKeyForm({ ...newKeyForm, keyString: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Thời hạn</label>
                <select value={newKeyForm.duration} onChange={e => setNewKeyForm({ ...newKeyForm, duration: e.target.value })} className="w-full bg-[#06090E] border border-[#1C2638] rounded-xl p-2.5 text-xs text-white">
                  <option value="1 Ngày">1 Ngày</option>
                  <option value="7 Ngày">7 Ngày</option>
                  <option value="30 Ngày">30 Ngày</option>
                  <option value="Vĩnh Viễn">Vĩnh Viễn</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer">LƯU VÀO KHO KEY</button>
            </form>

            <div className="lg:col-span-2 bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white border-b border-[#1C2638] pb-3 uppercase">DANH SÁCH KEY TRONG KHO</h3>
              <div className="space-y-3">
                {keysList.map((k) => (
                  <div key={k.id} className="bg-[#06090E] border border-[#1C2638] p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-white font-mono">{k.keyString}</span>
                      <p className="text-[10px] text-slate-400">Tool: {k.toolName} | Thời hạn: {k.duration}</p>
                    </div>
                    <button onClick={() => handleDeleteKey(k.id)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB SEPAY */}
        {activeTab === 'sepay' && (
          <div className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1C2638] pb-3 uppercase">
              <CreditCard className="w-4 h-4 text-cyan-400" /> LỊCH SỬ NẠP TIỀN SEPAY
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#06090E] border-b border-[#1C2638] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Nội dung / Mã giao dịch</th>
                    <th className="p-3">Số tiền</th>
                    <th className="p-3">Thời gian ghi nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2638]">
                  {sepayLogs.length === 0 ? (
                    <tr><td colSpan={3} className="p-4 text-center text-slate-500">Chưa có giao dịch SePay</td></tr>
                  ) : (
                    sepayLogs.map((s, i) => (
                      <tr key={i} className="hover:bg-[#06090E]/50 transition">
                        <td className="p-3 font-bold text-white">{s.content || s.username}</td>
                        <td className="p-3 font-bold text-emerald-400">+{(s.amount || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="p-3 text-slate-400">{s.date || 'Gần đây'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. TAB ĐÓNG GÓP DỰ ÁN TOOL */}
        {activeTab === 'feedback' && (
          <div className="bg-[#0D121D] border border-[#1C2638] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1C2638] pb-3 uppercase">
              <MessageSquare className="w-4 h-4 text-cyan-400" /> PHẢN HỒI Ý KIẾN ĐÓNG GÓP DỰ ÁN TOOL (KHÁCH GỬI REALTIME)
            </h2>
            <div className="space-y-3">
              {feedbacks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Chưa có ý kiến đóng góp dự án tool nào từ khách hàng</p>
              ) : (
                feedbacks.map((f) => (
                  <div key={f.id} className="bg-[#06090E] border border-[#1C2638] p-4 rounded-xl flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-cyan-400">{f.username || 'Khách ẩn danh'}</span>
                      <p className="text-xs text-slate-300 mt-1 whitespace-pre-line leading-relaxed">{f.content}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{f.created_at ? new Date(f.created_at).toLocaleString('vi-VN') : 'Gần đây'}</span>
                    </div>
                    <button onClick={() => handleDeleteFeedback(f.id)} className="text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
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