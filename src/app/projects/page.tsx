'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FolderKanban, Send, CheckCircle2, MessageSquarePlus, Server, Briefcase } from 'lucide-react';

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [serverName, setServerName] = useState('');
  const [jobName, setJobName] = useState('');
  const [note, setNote] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProjects = localStorage.getItem('ztool_projects');
      if (savedProjects) {
        setProjectsList(JSON.parse(savedProjects));
      } else {
        setProjectsList([
          {
            id: 1,
            title: 'Tool Auto Bác Sĩ & Cứu Thương',
            image: '/logo.jpg',
            server: 'GTA5VN / LuQuyRP',
            progress: 85,
            status: 'Đang thử nghiệm Beta',
            description: 'Tự động hồi máu, nhận cuộc gọi cứu hộ, di chuyển cấp cứu tự động.',
          },
        ]);
      }
    }
  }, []);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName || !jobName) {
      alert('Vui lòng nhập đầy đủ Tên Server và Tên Nghề!');
      return;
    }

    const newFeedback = {
      id: Date.now(),
      server: serverName.trim(),
      job: jobName.trim(),
      note: note.trim(),
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    const existing = localStorage.getItem('ztool_feedbacks');
    const feedbackList = existing ? JSON.parse(existing) : [];
    feedbackList.push(newFeedback);
    localStorage.setItem('ztool_feedbacks', JSON.stringify(feedbackList));

    setFeedbackSuccess(true);
    setServerName('');
    setJobName('');
    setNote('');

    setTimeout(() => {
      setFeedbackSuccess(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="border-b border-[#1A2332] pb-6">
          <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-3 py-1 rounded-full text-xs font-semibold text-cyanGlow mb-2">
            <FolderKanban className="w-3.5 h-3.5" /> DỰ ÁN DỊCH VỤ CỦA ZTOOL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            CÁC DỰ ÁN <span className="bg-gradient-to-r from-cyanGlow to-neonBlue bg-clip-text text-transparent">TOOL AUTO ĐANG PHÁT TRIỂN</span>
          </h1>
        </div>

        {/* Danh sách dự án */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectsList.map((project) => (
            <div key={project.id} className="bg-[#0F141C] border border-[#1A2332] hover:border-neonBlue/50 rounded-2xl p-6 shadow-xl transition flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-neonBlue shrink-0">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyanGlow bg-neonBlue/10 border border-neonBlue/30 px-2 py-0.5 rounded-md">
                    {project.server}
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-1">{project.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{project.description}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#1A2332]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Trạng thái: <b className="text-amber-400">{project.status}</b></span>
                  <span className="font-extrabold text-cyanGlow">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#080B10] rounded-full overflow-hidden border border-[#1A2332]">
                  <div className="h-full bg-gradient-to-r from-neonBlue to-cyanGlow rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Góp Ý gửi tới Admin */}
        <div className="bg-[#0F141C] border border-neonBlue/40 rounded-3xl p-6 lg:p-8 shadow-2xl">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-cyanGlow" /> GÓP Ý NGHỀ & SERVER BẠN MUỐN LÀM TOOL
            </h2>

            {feedbackSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl flex items-center gap-2 mt-6 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5" /> Góp ý của bạn đã được gửi tới trang Admin thành công!
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Server FiveM *</label>
                    <input type="text" required value={serverName} onChange={(e) => setServerName(e.target.value)} placeholder="VD: GTA5VN, LuQuyRP..." className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl px-4 py-3 text-xs text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Nghề Cần Làm Tool *</label>
                    <input type="text" required value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="VD: Nghề Cảnh sát, Cứu thương..." className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl px-4 py-3 text-xs text-white focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Ghi chú thêm</label>
                  <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mô tả cơ chế nghề bạn muốn làm..." className="w-full bg-[#080B10] border border-[#1A2332] rounded-xl px-4 py-3 text-xs text-white focus:outline-none" />
                </div>

                <button type="submit" className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2">
                  <Send className="w-4 h-4" /> GỬI GÓP Ý CHO ADMIN
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}