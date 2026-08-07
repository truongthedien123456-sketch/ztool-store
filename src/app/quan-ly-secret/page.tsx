'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Lock, User, Key, ShieldCheck, LogOut, Users, 
  Wrench, FolderKanban, MessageSquare, Plus, Trash2, Edit, Save, RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab đang chọn
  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'projects' | 'feedback'>('users');

  // Dữ liệu quản trị
  const [users, setUsers] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // Form thêm / sửa Tool Auto
  const [toolForm, setToolForm] = useState({ name: '', price: '', desc: '', image: '', link: '' });
  // Form thêm / sửa Dự án
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', link: '', status: 'Đang chạy' });

  useEffect(() => {
    const isLogged = localStorage.getItem('ztool_admin_authenticated');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      loadAllAdminData();
    }
  }, []);

  // Load toàn bộ dữ liệu từ LocalStorage
  const loadAllAdminData = () => {
    const savedUsers = localStorage.getItem('ztool_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedTools = localStorage.getItem('ztool_tools');
    if (savedTools) setTools(JSON.parse(savedTools));

    const savedProjects = localStorage.getItem('ztool_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    const savedFeedbacks = localStorage.getItem('ztool_feedbacks');
    if (savedFeedbacks) setFeedbacks(JSON.parse(savedFeedbacks));
  };

  // Đăng nhập Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'mienprovip' && passwordInput === 'Vietduc123456@') {
      localStorage.setItem('ztool_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      loadAllAdminData();
    } else {
      setLoginError('Tài khoản hoặc mật khẩu Quản trị không chính xác!');
    }
  };

  // Đăng xuất Admin
  const handleAdminLogout = () => {
    localStorage.removeItem('ztool_admin_authenticated');
    setIsAuthenticated(false);
  };

  // --- QUẢN LÝ TOOL AUTO ---
  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name || !toolForm.price) return alert('Vui lòng điền đủ thông tin!');
    const newTools = [...tools, { id: Date.now(), ...toolForm }];
    setTools(newTools);
    localStorage.setItem('ztool_tools', JSON.stringify(newTools));
    setToolForm({ name: '', price: '', desc: '', image: '', link: '' });
    alert('Thêm Tool Auto thành công!');
  };

  const handleDeleteTool = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa Tool này?')) return;
    const newTools = tools.filter(t => t.id !== id);
    setTools(newTools);
    localStorage.setItem('ztool_tools', JSON.stringify(newTools));
  };

  // --- QUẢN LÝ DỰ ÁN ---
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title) return alert('Vui lòng điền tên dự án!');
    const newProjects = [...projects, { id: Date.now(), ...projectForm }];
    setProjects(newProjects);
    localStorage.setItem('ztool_projects', JSON.stringify(newProjects));
    setProjectForm({ title: '', desc: '', link: '', status: 'Đang chạy' });
    alert('Thêm Dự án thành công!');
  };

  const handleDeleteProject = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa Dự án này?')) return;
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    localStorage.setItem('ztool_projects', JSON.stringify(newProjects));
  };

  // --- XÓA ĐÓNG GÓP ---
  const handleDeleteFeedback = (id: number) => {
    const newFeedbacks = feedbacks.filter(f => f.id !== id);
    setFeedbacks(newFeedbacks);
    localStorage.setItem('ztool_feedbacks', JSON.stringify(newFeedbacks));
  };

  // MÀN HÌNH ĐĂNG NHẬP
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#080B10] text-white font-sans flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-[#0F141C] border border-[#1A2332] rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 bg-neonBlue/10 border border-neonBlue/30 rounded-2xl flex items-center justify-center mx-auto text-cyanGlow">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white">TRANG QUẢN TRỊ ZTOOL</h1>
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

  // MÀN HÌNH DASHBOARD QUẢN TRỊ ĐA NĂNG
  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A2332] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> BẢNG QUẢN TRỊ BẢO MẬT
            </div>
            <h1 className="text-2xl font-black text-white">QUẢN LÝ HỆ THỐNG ZTOOL</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllAdminData}
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

        {/* Thanh Điều Hướng Các Tab Quản Lý */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#1A2332] pb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20'
                : 'bg-[#0F141C] border border-[#1A2332] text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> QUẢN LÝ NGƯỜI DÙNG ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20'
                : 'bg-[#0F141C] border border-[#1A2332] text-gray-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" /> QUẢN LÝ TOOL AUTO ({tools.length})
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20'
                : 'bg-[#0F141C] border border-[#1A2332] text-gray-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" /> QUẢN LÝ DỰ ÁN ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-gradient-to-r from-neonBlue to-cyanGlow text-black shadow-lg shadow-neonBlue/20'
                : 'bg-[#0F141C] border border-[#1A2332] text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> ĐÓNG GÓP NGƯỜI DÙNG ({feedbacks.length})
          </button>
        </div>

        {/* TAB 1: QUẢN LÝ NGƯỜI DÙNG */}
        {activeTab === 'users' && (
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
              <Users className="w-5 h-5 text-cyanGlow" /> DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Tài khoản</th>
                    <th className="p-3">Số dư hiện tại</th>
                    <th className="p-3">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2332]">
                  {users.length === 0 ? (
                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">Chưa có người dùng nào đăng ký</td></tr>
                  ) : (
                    users.map((u, i) => (
                      <tr key={i} className="hover:bg-[#080B10]/50 transition">
                        <td className="p-3 font-bold text-white">{u.username}</td>
                        <td className="p-3 font-bold text-emerald-400">{(u.balance || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="p-3 text-gray-400">{u.createdAt || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ TOOL AUTO */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddTool} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <Plus className="w-4 h-4 text-cyanGlow" /> THÊM TOOL AUTO MỚI
              </h3>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tên Tool</label>
                <input type="text" value={toolForm.name} onChange={e => setToolForm({ ...toolForm, name: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="vd: Tool Auto FiveM" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Giá (VNĐ)</label>
                <input type="text" value={toolForm.price} onChange={e => setToolForm({ ...toolForm, price: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="vd: 50.000" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mô tả ngắn</label>
                <textarea value={toolForm.desc} onChange={e => setToolForm({ ...toolForm, desc: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="Mô tả chức năng..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Link Tải Tool</label>
                <input type="text" value={toolForm.link} onChange={e => setToolForm({ ...toolForm, link: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow py-2.5 rounded-xl text-xs font-bold hover:bg-neonBlue/30 transition">LƯU TOOL MỚI</button>
            </form>

            <div className="lg:col-span-2 bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#1A2332] pb-3">DANH SÁCH TOOL HIỆN CÓ</h3>
              <div className="space-y-3">
                {tools.length === 0 ? <p className="text-xs text-gray-500">Chưa có Tool nào</p> : tools.map((t) => (
                  <div key={t.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-xs">{t.name}</h4>
                      <p className="text-[11px] text-emerald-400 font-semibold">{t.price} VNĐ</p>
                      <p className="text-[11px] text-gray-400">{t.desc}</p>
                    </div>
                    <button onClick={() => handleDeleteTool(t.id)} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ DỰ ÁN */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddProject} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <Plus className="w-4 h-4 text-cyanGlow" /> THÊM DỰ ÁN MỚI
              </h3>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tên Dự Án</label>
                <input type="text" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="vd: ZTool Store V2" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mô tả Dự Án</label>
                <textarea value={projectForm.desc} onChange={e => setProjectForm({ ...projectForm, desc: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white" placeholder="Chi tiết dự án..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Trạng thái</label>
                <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl p-2.5 text-xs text-white">
                  <option value="Đang chạy">Đang chạy</option>
                  <option value="Đang bảo trì">Đang bảo trì</option>
                  <option value="Sắp ra mắt">Sắp ra mắt</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-neonBlue/20 border border-neonBlue/40 text-cyanGlow py-2.5 rounded-xl text-xs font-bold hover:bg-neonBlue/30 transition">LƯU DỰ ÁN</button>
            </form>

            <div className="lg:col-span-2 bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#1A2332] pb-3">DANH SÁCH DỰ ÁN</h3>
              <div className="space-y-3">
                {projects.length === 0 ? <p className="text-xs text-gray-500">Chưa có dự án nào</p> : projects.map((p) => (
                  <div key={p.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-xs">{p.title}</h4>
                      <p className="text-[11px] text-cyanGlow">{p.status}</p>
                      <p className="text-[11px] text-gray-400">{p.desc}</p>
                    </div>
                    <button onClick={() => handleDeleteProject(p.id)} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ĐÓNG GÓP TỪ NGƯỜI DÙNG */}
        {activeTab === 'feedback' && (
          <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
              <MessageSquare className="w-5 h-5 text-cyanGlow" /> Ý KIẾN & ĐÓNG GÓP TỪ KHÁCH HÀNG
            </h2>
            <div className="space-y-3">
              {feedbacks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Chưa có đóng góp nào từ người dùng</p>
              ) : (
                feedbacks.map((f) => (
                  <div key={f.id} className="bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-cyanGlow">{f.username || 'Khách ẩn danh'}</span>
                        <span className="text-[10px] text-gray-500">{f.date || 'Gần đây'}</span>
                      </div>
                      <p className="text-xs text-gray-300">{f.content}</p>
                    </div>
                    <button onClick={() => handleDeleteFeedback(f.id)} className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
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