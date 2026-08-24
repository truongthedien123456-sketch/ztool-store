'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Shield, Sparkles, Loader2, Video, ImageIcon
} from 'lucide-react';

export default function SocialFloatButtons() {
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ẩn toàn bộ nút floating nếu đang ở trang admin /quan-ly-secret
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdminPage(window.location.pathname.includes('/quan-ly-secret'));
    }

    const handleOpenZalo = () => setShowZaloModal(true);
    window.addEventListener('open-zalo-modal', handleOpenZalo);
    return () => window.removeEventListener('open-zalo-modal', handleOpenZalo);
  }, []);

  // Khởi tạo Username khách chat
  useEffect(() => {
    let user = localStorage.getItem('ztool_current_user');
    if (!user) {
      user = localStorage.getItem('ztool_temp_guest');
      if (!user) {
        user = 'Khach_' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('ztool_temp_guest', user);
      }
    }
    setCurrentUsername(user);
  }, []);

  // Lắng nghe Realtime Toàn diện cho Khách
  useEffect(() => {
    if (!currentUsername) return;

    loadMessages();

    // Channel realtime lắng nghe trực tiếp
    const channel = supabase
      .channel(`client_chat_${currentUsername}_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          // Nhận nếu tin nhắn liên quan tới user hiện tại
          if (
            newMsg.sender_username === currentUsername ||
            newMsg.receiver_username === currentUsername
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUsername]);

  useEffect(() => {
    if (isOpenChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpenChat]);

  const loadMessages = async () => {
    if (!currentUsername) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_username.eq.${currentUsername},receiver_username.eq.${currentUsername}`)
      .order('id', { ascending: true });

    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending || !currentUsername) return;

    const text = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    const newMsg = {
      sender_username: currentUsername,
      sender_role: 'user',
      receiver_username: 'admin',
      message: text
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
    setSending(false);

    if (!error && data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  };

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isAdminPage) return null;

  return (
    <>
      {/* CỤM NÚT NỔI Ở GÓC DƯỚI BÊN PHẢI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 items-end">
        <a
          href="https://www.facebook.com/profile.php?id=61592809269339"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 bg-gradient-to-tr from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white rounded-2xl shadow-xl shadow-blue-600/30 border border-blue-400/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Ghé thăm Fanpage Facebook"
        >
          <span className="font-black text-sm sm:text-base tracking-tighter select-none">FB</span>
          <span className="absolute right-16 bg-[#0D121D]/95 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none backdrop-blur-md">
            Ghé thăm Fanpage
          </span>
        </a>

        <button
          onClick={() => setShowZaloModal(true)}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 bg-gradient-to-tr from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 text-white rounded-2xl shadow-xl shadow-sky-600/30 border border-sky-400/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Liên hệ Zalo"
        >
          <span className="font-black text-xs sm:text-sm tracking-tight select-none">ZALO</span>
          <span className="absolute right-16 bg-[#0D121D]/95 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none backdrop-blur-md">
            Quét mã Zalo
          </span>
        </button>

        <button
          onClick={() => {
            setIsOpenChat(!isOpenChat);
            if (!isOpenChat) loadMessages();
          }}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 bg-gradient-to-tr from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.45)] border-2 border-cyan-300 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Chat trực tuyến"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-[#0B1019]"></span>
          </span>
          <span className="absolute right-16 bg-[#0D121D]/95 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none backdrop-blur-md">
            Hỗ trợ trực tuyến 24/7
          </span>
        </button>
      </div>

      {/* CỬA SỔ CHAT TRỰC TIẾP */}
      <AnimatePresence>
        {isOpenChat && (
          <motion.div 
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-4 sm:right-6 bottom-24 z-50 w-[92vw] sm:w-[380px] bg-[#0B1019]/95 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col h-[520px] max-h-[82vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#05080E] via-[#09101C] to-[#05080E] border-b border-slate-800/90 p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <div className="w-full h-full bg-[#05080E] rounded-[14px] flex items-center justify-center text-cyan-300">
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#05080E] absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 tracking-wide">
                    HỖ TRỢ ZTOOL <Sparkles className="w-3 h-3 text-cyan-400" />
                  </h4>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ID: <b className="text-cyan-300">{currentUsername}</b>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpenChat(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-[#05080E] border border-slate-800 hover:border-cyan-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Khung Tin Nhắn Cuộn */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#080D15]/80 text-xs custom-scrollbar">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 text-xs font-black">
                  Z
                </div>
                <div className="space-y-1 max-w-[85%]">
                  <div className="bg-[#0E1522] border border-cyan-500/30 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 leading-relaxed shadow-md">
                    👋 <b>Xin chào bạn!</b> Hãy để lại lời nhắn hoặc câu hỏi cần giải đáp, Admin ZTool sẽ hỗ trợ bạn ngay lập tức.
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block pl-1">Hệ thống CSKH 24/7</span>
                </div>
              </div>

              {messages.map((m, idx) => {
                const isMe = m.sender_username === currentUsername;
                return (
                  <div key={idx} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-[11px] uppercase shrink-0 shadow-sm ${
                      isMe 
                        ? 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950' 
                        : 'bg-gradient-to-tr from-slate-700 to-slate-800 text-cyan-300 border border-slate-600'
                    }`}>
                      {isMe ? currentUsername.charAt(0).toUpperCase() : 'AD'}
                    </div>

                    <div className={`space-y-1 max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3.5 rounded-2xl leading-relaxed text-xs break-words shadow-md ${
                        isMe 
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-tr-sm shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                          : 'bg-[#101826] border border-slate-800 text-slate-100 rounded-tl-sm'
                      }`}>
                        {m.message}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono px-1">
                        {formatMessageTime(m.created_at) || (isMe ? 'Đã gửi' : 'Admin')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Ô Nhập Tin Nhắn */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#05080E] border-t border-slate-800/90 flex items-center gap-2">
              <input 
                type="text"
                placeholder="Nhập nội dung cần hỗ trợ..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-[#0B1019] border border-slate-800 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none transition shadow-inner"
              />
              <button 
                type="submit" 
                disabled={sending || !inputMsg.trim()}
                className="bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 disabled:opacity-40 text-slate-950 p-3 rounded-2xl font-black transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP ZALO */}
      {showZaloModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-[#0D121D] border-2 border-cyan-400 w-full max-w-sm rounded-3xl p-6 relative text-center space-y-4 shadow-2xl shadow-cyan-500/30">
            <button
              onClick={() => setShowZaloModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-[#06090E] border border-[#1C2638] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider">LIÊN HỆ QUẢN TRỊ VIÊN</h3>
              <p className="text-xs text-slate-400">Mở ứng dụng Zalo bấm nút quét QR để kết bạn trực tiếp</p>
            </div>

            <div className="bg-white p-3 rounded-2xl inline-block shadow-inner">
              <img
                src="/zalo-qr.jpg"
                alt="Zalo QR Code"
                className="w-56 h-auto object-cover rounded-xl mx-auto"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-white">Nguyễn Minh Khang</p>
              <p className="text-xs font-bold text-cyan-400">Liên hệ Zalo 24/7</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}