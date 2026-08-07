'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Wrench, Download, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'day' | 'week' | 'month' | 'lifetime'>('day');
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tải danh sách Tool được cấu hình từ trang Admin
  useEffect(() => {
    loadToolsData();
  }, []);

  const loadToolsData = () => {
    const savedTools = localStorage.getItem('ztool_tools');
    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        setTools([]);
      }
    } else {
      // Dữ liệu mẫu ban đầu nếu Admin chưa thêm tool nào
      const defaultTools = [
        {
          id: 1,
          name: 'Tool Auto FiveM VIP',
          image: '',
          priceDay: '20.000',
          priceWeek: '100.000',
          priceMonth: '300.000',
          priceLifetime: '1.000.000',
          description: 'Hỗ trợ tự động bypass, tính năng mượt mà, chống ban 100% cho mọi server FiveM.',
          downloadLink: 'https://example.com/download'
        }
      ];
      setTools(defaultTools);
    }
  };

  // Xử lý khi khách hàng bấm nút "Mua Tool"
  const handleBuyTool = () => {
    setPurchaseMsg(null);
    if (!selectedTool) return;

    // Lấy thông tin user hiện tại
    const currentUsername = localStorage.getItem('ztool_current_user');
    if (!currentUsername) {
      setPurchaseMsg({ type: 'error', text: 'Vui lòng đăng nhập tài khoản để thực hiện giao dịch!' });
      return;
    }

    // Lấy danh sách users từ localStorage
    const savedUsers = JSON.parse(localStorage.getItem('ztool_users') || '[]');
    const userIndex = savedUsers.findIndex((u: any) => u.username === currentUsername);

    if (userIndex === -1) {
      setPurchaseMsg({ type: 'error', text: 'Không tìm thấy thông tin tài khoản!' });
      return;
    }

    const user = savedUsers[userIndex];

    // Xác định giá tiền tương ứng với gói đã chọn
    let priceStr = '0';
    if (selectedDuration === 'day') priceStr = selectedTool.priceDay;
    if (selectedDuration === 'week') priceStr = selectedTool.priceWeek;
    if (selectedDuration === 'month') priceStr = selectedTool.priceMonth;
    if (selectedDuration === 'lifetime') priceStr = selectedTool.priceLifetime;

    // Chuyển đổi chuỗi giá thành số
    const priceNum = Number(priceStr.replace(/[^0-9]/g, '')) || 0;

    if (user.balance < priceNum) {
      setPurchaseMsg({
        type: 'error',
        text: `Số dư ví không đủ! Cần ${priceNum.toLocaleString('vi-VN')} VNĐ nhưng số dư hiện tại là ${(user.balance || 0).toLocaleString('vi-VN')} VNĐ. Vui lòng nạp thêm tiền.`
      });
      return;
    }

    // Trừ tiền tài khoản
    user.balance -= priceNum;
    savedUsers[userIndex] = user;
    localStorage.setItem('ztool_users', JSON.stringify(savedUsers));

    // Phát Key tự động từ kho Key (nếu có)
    const savedKeys = JSON.parse(localStorage.getItem('ztool_keys') || '[]');
    const availableKeyIndex = savedKeys.findIndex((k: any) => k.toolName === selectedTool.name && !k.isUsed);

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
        {/* Header Trang */}
        <div className="text-center space-y-3 border-b border-[#1A2332] pb-8">
          <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyanGlow">
            <Sparkles className="w-4 h-4" /> BẢNG HÃNG TOOL AUTO HIGH-QUALITY
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">DANH SÁCH SẢN PHẨM TOOL AUTO</h1>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Cập nhật liên tục các bản hack/tool tự động mới nhất. Đảm bảo an toàn, tối ưu hiệu năng và cập nhật tự động.
          </p>
        </div>

        {/* Danh Sách Tool */}
        {tools.length === 0 ? (
          <div className="text-center py-16 bg-[#0F141C] border border-[#1A2332] rounded-3xl">
            <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-semibold">Hiện chưa có sản phẩm Tool nào được mở bán.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-neonBlue/50 transition duration-300">
                <div className="space-y-4">
                  {/* Ảnh Tool */}
                  <div className="w-full h-44 bg-[#080B10] border border-[#1A2332] rounded-2xl overflow-hidden flex items-center justify-center relative">
                    {tool.image ? (
                      <img src={tool.image} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="w-12 h-12 text-cyanGlow/40" />
                    )}
                    <span className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                      ONLINE 24/7
                    </span>
                  </div>

                  {/* Tên & Mô tả */}
                  <div>
                    <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tool.description || 'Chưa có mô tả sản phẩm.'}</p>
                  </div>

                  {/* Bảng Giá Đồng Bộ Từ Admin */}
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

                {/* Các nút Thao tác */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => { setSelectedTool(tool); setPurchaseMsg(null); }}
                    className="bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" /> Mua Ngay
                  </button>

                  {tool.downloadLink ? (
                    <a
                      href={tool.downloadLink}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#080B10] border border-[#1A2332] hover:border-gray-500 text-gray-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center transition"
                    >
                      <Download className="w-4 h-4 text-cyanGlow" /> Tải File
                    </a>
                  ) : (
                    <button disabled className="bg-[#080B10] border border-[#1A2332] text-gray-600 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed text-center">
                      Chưa có Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL MUA TOOL VÀ CHỌN GÓI */}
        {selectedTool && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#0F141C] border border-[#1A2332] w-full max-w-lg rounded-3xl p-6 space-y-6 relative shadow-2xl">
              <button
                onClick={() => setSelectedTool(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl bg-[#080B10] border border-[#1A2332]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs text-cyanGlow font-bold">XÁC NHẬN MUA SẢN PHẨM</span>
                <h2 className="text-xl font-black text-white">{selectedTool.name}</h2>
              </div>

              {purchaseMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
                  purchaseMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{purchaseMsg.text}</span>
                </div>
              )}

              {/* Chọn Thời Hạn */}
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
                    <div className="text-emerald-400 font-extrabold">{selectedTool.priceDay || '0'} VNĐ</div>
                  </button>

                  <button
                    onClick={() => setSelectedDuration('week')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'week' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói 7 Ngày</div>
                    <div className="text-emerald-400 font-extrabold">{selectedTool.priceWeek || '0'} VNĐ</div>
                  </button>

                  <button
                    onClick={() => setSelectedDuration('month')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'month' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói 30 Ngày</div>
                    <div className="text-emerald-400 font-extrabold">{selectedTool.priceMonth || '0'} VNĐ</div>
                  </button>

                  <button
                    onClick={() => setSelectedDuration('lifetime')}
                    className={`p-3 rounded-2xl border text-left text-xs space-y-1 transition ${
                      selectedDuration === 'lifetime' ? 'bg-neonBlue/10 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-400'
                    }`}
                  >
                    <div className="font-bold">Gói Vĩnh Viễn</div>
                    <div className="text-cyanGlow font-extrabold">{selectedTool.priceLifetime || '0'} VNĐ</div>
                  </button>
                </div>
              </div>

              {/* Nút Thanh Toán */}
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