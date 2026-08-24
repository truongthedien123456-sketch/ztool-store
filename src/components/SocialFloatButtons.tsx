'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, X, Send, User, Shield, Loader2 } from 'lucide-react';

export default function SocialFloatButtons() {
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện từ Footer gửi tới để mở popup Zalo
  useEffect(() => {
    const handleOpenZalo = () => setShowZaloModal(true);
    window.addEventListener('open-zalo-modal', handleOpenZalo);
    return () => window.removeEventListener('open-zalo-modal', handleOpenZalo);
  }, []);

  // Khởi tạo Username khách chat
  useEffect(() => {
    const savedUser = localStorage.getItem('ztool_current_user') || 'Khách_' + Math.floor(1000 + Math.random() * 9000);
    if (!localStorage.getItem('ztool_current_user')) {
      localStorage.setItem('ztool_temp_guest', savedUser);
    }
    setCurrentUsername(savedUser);
  }, []);

  // Lắng nghe tin nhắn Realtime qua Supabase
  useEffect(() => {
    if (!currentUsername || !isOpenChat) return;

    loadMessages();

    const channel = supabase
      .channel(`chat_${currentUsername}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_username=eq.${currentUsername}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUsername, isOpenChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_username.eq.${currentUsername},receiver_username.eq.${currentUsername}`)
      .order('id', { ascending: true });

    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

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
      setMessages((prev) => [...prev, data]);
    }
  };

  return (
    <>
      {/* CỤM NÚT NỔI Ở GÓC DƯỚI BÊN PHẢI MÀN HÌNH */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 items-end">
        
        {/* 1. NÚT FACEBOOK */}
        <a
          href="https://www.facebook.com/profile.php?id=61592809269339"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl shadow-xl shadow-blue-600/30 border-2 border-blue-400/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Ghé thăm Fanpage Facebook"
        >
          <span className="font-black text-sm sm:text-base tracking-tighter select-none">FB</span>
          <span className="absolute right-16 bg-[#0D121D] border border-[#1C2638] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
            Ghé thăm Fanpage
          </span>
        </a>

        {/* 2. NÚT ZALO */}
        <button
          onClick={() => setShowZaloModal(true)}
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-600/30 border-2 border-blue-400/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Liên hệ Zalo"
        >
          <span className="font-black text-xs sm:text-sm tracking-tight select-none">ZALO</span>
          <span className="absolute right-16 bg-[#0D121D] border border-[#1C2638] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
            Quét mã Zalo
          </span>
        </button>

        {/* 3. NÚT CHAT TRỰC TIẾP LIVE CHAT */}
        <button
          onClick={() => setIsOpenChat(!isOpenChat)}
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl shadow-xl shadow-cyan-500/30 border-2 border-cyan-300 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Chat trực tuyến"
        >
          <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          <span className="absolute right-16 bg-[#0D121D] border border-[#1C2638] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
            Hỗ trợ trực tuyến
          </span>
        </button>

      </div>

      {/* CỬA SỔ CHAT TRỰC TIẾP DÀNH CHO KHÁCH HÀNG */}
      {isOpenChat && (
        <div className="fixed right-6 bottom-24 z-50 w-80 sm:w-96 bg-[#0B1019] border-2 border-cyan-400/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[480px]">
          {/* Header Chat */}
          <div className="bg-[#05080E] border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  HỖ TRỢ ZTOOL <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <span className="text-[10px] text-slate-400 block font-mono">ID: {currentUsername}</span>
              </div>
            </div>
            <button onClick={() => setIsOpenChat(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Danh sách Tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080D15]/80 text-xs">
            <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-2xl text-[11px] text-cyan-300 leading-relaxed">
              👋 Xin chào! Hãy gửi thắc mắc của bạn tại đây, Admin ZTool sẽ hỗ trợ và giải đáp ngay nhé.
            </div>

            {messages.map((m, idx) => {
              const isMe = m.sender_username === currentUsername;
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-500 mb-0.5 font-mono">
                    {isMe ? 'Bạn' : 'Admin ZTool'}
                  </span>
                  <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    isMe 
                      ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-none shadow-md' 
                      : 'bg-[#121B29] border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}>
                    {m.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập tin nhắn */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#05080E] border-t border-slate-800 flex items-center gap-2">
            <input 
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-[#0B1019] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
            />
            <button 
              type="submit" 
              disabled={sending || !inputMsg.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 p-2.5 rounded-xl font-bold transition cursor-pointer"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* POPUP HIỂN THỊ MÃ QR ZALO */}
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
                alt="Zalo QR Code Nguyễn Minh Khang"
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