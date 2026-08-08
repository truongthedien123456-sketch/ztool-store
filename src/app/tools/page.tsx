'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
  Wrench, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, X, Sparkles, Info 
} from 'lucide-react';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  
  // Modal Mua Tool
  const [selectedToolForBuy, setSelectedToolForBuy] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'day' | 'week' | 'month' | 'lifetime'>('day');
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Xem Chi Tiết Tool
  const [selectedToolForDetail, setSelectedToolForDetail] = useState<any | null>(null);

  useEffect(() => {
    loadToolsData();
  }, []);

  const loadToolsData = async () => {
    const { data, error } = await supabase.from('tools').select('*').order('id', { ascending: false });
    
    if (data && data.length > 0) {
      setTools(data);
    } else {
      setTools([
        {
          id: 1,
          name: 'AUTO FARM F17',
          image: 'https://i.ibb.co/8L2gsmQ0/logo.jpg',
          priceDay: '5.000',
          priceWeek: '20.000',
          priceMonth: '50.000',
          priceLifetime: '100.000',
          description: 'Tự động chạy nhanh, bấm E nghề công trường F17 City.',
          downloadLink: ''
        }
      ]);
    }
  };

  const handleBuyTool = async () => {
    setPurchaseMsg(null);
    if (!selectedToolForBuy) return;

    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) {
      setPurchaseMsg({ type: 'error', text: 'Vui lòng đăng nhập tài khoản để thực hiện giao dịch!' });
      return;
    }

    const { data: userData } = await supabase.from('users').select('*').eq('username', currentUsername).single();

    if (!userData) {
      setPurchaseMsg({ type: 'error', text: 'Không tìm thấy thông tin tài khoản của bạn trên hệ thống!' });
      return;
    }

    let priceStr = '0';
    if (selectedDuration === 'day') priceStr = selectedToolForBuy.priceDay || '0';
    if (selectedDuration === 'week') priceStr = selectedToolForBuy.priceWeek || '0';
    if (selectedDuration === 'month') priceStr = selectedToolForBuy.priceMonth || '0';
    if (selectedDuration === 'lifetime') priceStr = selectedToolForBuy.priceLifetime || '0';

    const priceNum = Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;

    if ((userData.balance || 0) < priceNum) {
      setPurchaseMsg({
        type: 'error',
        text: `Số dư ví không đủ! Cần ${priceNum.toLocaleString('vi-VN')} VNĐ nhưng số dư hiện tại là ${(userData.balance || 0).toLocaleString('vi-VN')} VNĐ.`
      });
      return;
    }

    const newBalance = userData.balance - priceNum;
    await supabase.from('users').update({ balance: newBalance }).eq('id', userData.id);

    const savedKeys = JSON.parse(localStorage.getItem('ztool_keys') || '[]');
    const availableKeyIndex = savedKeys.findIndex((k: any) => k.toolName === selectedToolForBuy.name && !k.isUsed);

    let deliveredKey = 'ZTOOL-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    if (availableKeyIndex !== -1) {
      deliveredKey = savedKeys[availableKeyIndex].keyString;
      savedKeys[availableKeyIndex].isUsed = true;
      localStorage.setItem('ztool_keys', JSON.stringify(savedKeys));
    }

    setPurchaseMsg({
      type: 'success',
      text: `Thanh toán thành công! Mã Key kích hoạt của bạn: ${deliveredKey}`
    });
  };

  return (
    <main className="min-h-screen bg-[#080B10] text-white font-sans pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-3 border-b border-[#1A2332] pb-8">
          <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyanGlow">
            <Sparkles className="w-4 h-4" /> BẢNG HÃNG TOOL AUTO HIGH-QUALITY
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">DANH SÁCH SẢN PHẨM TOOL AUTO</h1>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Cập nhật liên tục các bản hack/tool tự động mới nhất. Đảm bảo an toàn, tối ưu hiệu năng và cập nhật tự động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-neonBlue/50 transition duration-300">
              <div className="space-y-4">
                {/* Khung chứa ảnh TỈ LỆ DỌC khít 100% không bị thừa nền đen */}
                <div className="w-full aspect-[4/5] bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden relative">
                  <img 
                    src={tool.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                    alt={tool.name} 
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md">
                    ONLINE 24/7
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1 truncate" title={tool.description}>
                    {tool.description || 'Chưa có mô tả sản phẩm.'}
                  </p>
                </div>

                <div className="bg-[#080B10] border border-[#1A2332] p-3.5 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Theo Ngày:</span>
                    <b className="text-emerald-400 font-bold">{tool.priceDay ? `${tool.priceDay} VNĐ` : '---'}</b>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Theo Tuần:</span>
                    <b className="text-emerald-400 font-bold">{tool.priceWeek ? `${tool.priceWeek} VNĐ` : '---'}</b>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Theo Tháng:</span>
                    <b className="text-emerald-400 font-bold">{tool.priceMonth ? `${tool.priceMonth} VNĐ` : '---'}</b>
                  </div>
                  <div className="flex justify-between items-center text-gray-300 border-t border-[#1A2332] pt-1.5">
                    <span className="font-semibold text-white">Vĩnh Viễn:</span>
                    <b className="text-cyanGlow font-black">{tool.priceLifetime ? `${tool.priceLifetime} VNĐ` : '---'}</b>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => { setSelectedToolForBuy(tool); setPurchaseMsg(null); }}
                  className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Mua Ngay
                </button>

                <button
                  onClick={() => setSelectedToolForDetail(tool)}
                  className="bg-[#080B10] border border-[#1A2332] hover:border-gray-500 text-gray-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center transition cursor-pointer"
                >
                  <Info className="w-4 h-4 text-cyanGlow" /> Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Chi tiết */}
        {selectedToolForDetail && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedToolForDetail(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-[#080B10] border border-[#1A2332]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-[#1A2332] pb-4">
                <div className="w-12 h-12 rounded-2xl bg-neonBlue/10 border border-neonBlue/30 flex items-center justify-center text-cyanGlow shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-cyanGlow font-bold uppercase tracking-wider">THÔNG TIN CHI TIẾT SẢN PHẨM</span>
                  <h2 className="text-xl font-black text-white">{selectedToolForDetail.name}</h2>
                </div>
              </div>

              {/* Khung xem chi tiết ảnh tỉ lệ dọc khít toàn bộ */}
              <div className="w-full max-w-sm mx-auto aspect-[4/5] bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden">
                <img 
                  src={selectedToolForDetail.image || 'https://i.ibb.co/8L2gsmQ0/logo.jpg'} 
                  alt={selectedToolForDetail.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Mô tả tính năng đầy đủ:</h4>
                <p className="text-xs text-gray-300 bg-[#080B10] border border-[#1A2332] p-4 rounded-2xl leading-relaxed whitespace-pre-line">
                  {selectedToolForDetail.description || 'Chưa có nội dung mô tả chi tiết cho sản phẩm này.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-gray-400 block">Ngày</span>
                  <b className="text-xs text-emerald-400">{selectedToolForDetail.priceDay || '---'}đ</b>
                </div>
                <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-gray-400 block">Tuần</span>
                  <b className="text-xs text-emerald-400">{selectedToolForDetail.priceWeek || '---'}đ</b>
                </div>
                <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-gray-400 block">Tháng</span>
                  <b className="text-xs text-emerald-400">{selectedToolForDetail.priceMonth || '---'}đ</b>
                </div>
                <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-gray-400 block">Vĩnh Viễn</span>
                  <b className="text-xs text-cyanGlow">{selectedToolForDetail.priceLifetime || '---'}đ</b>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const tool = selectedToolForDetail;
                    setSelectedToolForDetail(null);
                    setSelectedToolForBuy(tool);
                  }}
                  className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> MUA SẢN PHẨM NÀY NGAY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Mua */}
        {selectedToolForBuy && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-lg rounded-3xl p-6 space-y-6 relative shadow-2xl">
              <button
                onClick={() => setSelectedToolForBuy(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs text-cyanGlow font-bold">XÁC NHẬN MUA SẢN PHẨM</span>
                <h2 className="text-xl font-black text-white">{selectedToolForBuy.name}</h2>
              </div>

              {purchaseMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
                  purchaseMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{purchaseMsg.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">Chọn gói thời hạn sử dụng:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedDuration('day')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'day' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói 1 Ngày</div>
                    <div className="text-emerald-400 font-extrabold">{selectedToolForBuy.priceDay || '0'} VNĐ</div>
                  </button>

                  <button
                    onClick={() => setSelectedDuration('week')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'week' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói 7 Ngày</div>
                    <div className="text-emerald-400 font-extrabold">{selectedToolForBuy.priceWeek || '0'} VNĐ</div>
                  </button>

                  <button
                    onClick={() => setSelectedDuration('month')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'month' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói 30 Ngày</div>
                    <div className="text-emerald-400 font-extrabold">{selectedToolForBuy.priceMonth || '0'} VNĐ</div>
                  </button>

                  <button
                    onClick={() => setSelectedDuration('lifetime')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'lifetime' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói Vĩnh Viễn</div>
                    <div className="text-cyanGlow font-extrabold">{selectedToolForBuy.priceLifetime || '0'} VNĐ</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleBuyTool}
                className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-3.5 rounded-2xl text-xs shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> XÁC NHẬN THANH TOÁN TỪ VÍ
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}