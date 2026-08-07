'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { ShoppingCart, Flame, X, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ToolsPage() {
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'day' | 'week' | 'month' | 'lifetime'>('day');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Đọc danh sách Tool từ localStorage
  const loadTools = () => {
    if (typeof window !== 'undefined') {
      const savedTools = localStorage.getItem('ztool_tools');
      if (savedTools) {
        setToolsList(JSON.parse(savedTools));
      } else {
        const defaultTools = [
          {
            id: 1,
            name: 'AUTO FARM F17',
            image: '/logo.jpg',
            description: 'Tự động chạy nhanh, bấm E nghề công trường F17 City',
            priceDay: 5000,
            priceWeek: 20000,
            priceMonth: 50000,
            priceLifetime: 100000,
            status: 'Hoạt động tốt',
            buyDay: 1,
            buyWeek: 0,
            buyMonth: 0,
            buyLifetime: 0,
            buyCount: 1,
          },
          {
            id: 2,
            name: 'AUTO CÂU CÁ LŨ QUỶ',
            image: '/logo.jpg',
            description: 'Tự quăng cần câu, giải minigame mũi tên, tự ngồi lên thuyền...',
            priceDay: 20000,
            priceWeek: 50000,
            priceMonth: 150000,
            priceLifetime: 300000,
            status: 'Hoạt động tốt',
            buyDay: 0,
            buyWeek: 0,
            buyMonth: 0,
            buyLifetime: 0,
            buyCount: 0,
          },
        ];
        setToolsList(defaultTools);
        localStorage.setItem('ztool_tools', JSON.stringify(defaultTools));
      }
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  // Xử lý xác nhận mua hàng theo từng gói
  const handleConfirmPurchase = () => {
    if (!selectedTool) return;

    const updatedList = toolsList.map((t) => {
      if (t.id === selectedTool.id) {
        const buyDay = (t.buyDay || 0) + (selectedPlan === 'day' ? 1 : 0);
        const buyWeek = (t.buyWeek || 0) + (selectedPlan === 'week' ? 1 : 0);
        const buyMonth = (t.buyMonth || 0) + (selectedPlan === 'month' ? 1 : 0);
        const buyLifetime = (t.buyLifetime || 0) + (selectedPlan === 'lifetime' ? 1 : 0);
        const buyCount = buyDay + buyWeek + buyMonth + buyLifetime;

        return { ...t, buyDay, buyWeek, buyMonth, buyLifetime, buyCount };
      }
      return t;
    });

    setToolsList(updatedList);
    localStorage.setItem('ztool_tools', JSON.stringify(updatedList));

    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setSelectedTool(null);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#1A2332] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-neonBlue/10 border border-neonBlue/30 px-3 py-1 rounded-full text-xs font-semibold text-cyanGlow mb-2">
              <Flame className="w-3.5 h-3.5" /> DANH MỤC DỊCH VỤ
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              TẤT CẢ <span className="bg-gradient-to-r from-cyanGlow to-neonBlue bg-clip-text text-transparent">TOOL AUTO FIVEM</span>
            </h1>
          </div>
          <div className="text-xs text-gray-400 bg-[#0F141C] border border-[#1A2332] px-4 py-2.5 rounded-xl self-start">
            Hiện có: <b className="text-cyanGlow">{toolsList.length}</b> sản phẩm
          </div>
        </div>

        {/* Lưới sản phẩm Tool */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsList.map((tool) => (
            <div key={tool.id} className="bg-[#0F141C] border border-[#1A2332] hover:border-neonBlue/50 rounded-2xl overflow-hidden shadow-xl transition duration-300 flex flex-col group">
              <div className="relative h-48 bg-gradient-to-b from-cyan-950/20 to-[#080B10] p-4 flex items-center justify-center border-b border-[#1A2332]">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-neonBlue shadow-lg shadow-neonBlue/20 group-hover:scale-105 transition">
                  <Image src={tool.image || '/logo.jpg'} alt={tool.name} fill className="object-cover" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-cyanGlow transition">{tool.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{tool.description}</p>
                </div>

                {/* Bảng giá 4 gói */}
                <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gói 1 Ngày:</span>
                    <span className="font-bold text-cyanGlow">{tool.priceDay?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  {tool.priceWeek && (
                    <div className="flex justify-between items-center border-t border-[#1A2332] pt-1">
                      <span className="text-gray-400">Gói 7 Ngày:</span>
                      <span className="font-bold text-cyanGlow">{tool.priceWeek?.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  {tool.priceMonth && (
                    <div className="flex justify-between items-center border-t border-[#1A2332] pt-1">
                      <span className="text-gray-400">Gói 30 Ngày:</span>
                      <span className="font-bold text-emerald-400">{tool.priceMonth?.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  {tool.priceLifetime && (
                    <div className="flex justify-between items-center border-t border-[#1A2332] pt-1">
                      <span className="text-gray-400">Vĩnh Viễn:</span>
                      <span className="font-extrabold text-amber-400">{tool.priceLifetime?.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                </div>

                {/* Nút MUA TOOL NGAY (Đã bỏ đếm số) */}
                <button
                  onClick={() => { setSelectedTool(tool); setSelectedPlan('day'); }}
                  className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> MUA TOOL NGAY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CHỌN GÓI MUA */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F141C] border border-neonBlue/40 rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedTool(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#080B10] border border-[#1A2332] p-1.5 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">MUA TOOL: <span className="text-cyanGlow">{selectedTool.name}</span></h3>
            <p className="text-xs text-gray-400 mb-5">Chọn thời hạn gói bạn muốn thanh toán:</p>

            {purchaseSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-6 rounded-2xl text-center space-y-2 my-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <p className="font-bold text-sm">Đã ghi nhận lượt mua mới thành công!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedPlan('day')}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition cursor-pointer ${
                    selectedPlan === 'day' ? 'bg-neonBlue/20 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-300'
                  }`}
                >
                  <span>Gói 1 Ngày</span>
                  <span>{selectedTool.priceDay?.toLocaleString('vi-VN')} VNĐ</span>
                </button>

                {selectedTool.priceWeek && (
                  <button
                    onClick={() => setSelectedPlan('week')}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition cursor-pointer ${
                      selectedPlan === 'week' ? 'bg-neonBlue/20 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-300'
                    }`}
                  >
                    <span>Gói 7 Ngày</span>
                    <span>{selectedTool.priceWeek?.toLocaleString('vi-VN')} VNĐ</span>
                  </button>
                )}

                {selectedTool.priceMonth && (
                  <button
                    onClick={() => setSelectedPlan('month')}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition cursor-pointer ${
                      selectedPlan === 'month' ? 'bg-neonBlue/20 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-300'
                    }`}
                  >
                    <span>Gói 30 Ngày</span>
                    <span className="text-emerald-400">{selectedTool.priceMonth?.toLocaleString('vi-VN')} VNĐ</span>
                  </button>
                )}

                {selectedTool.priceLifetime && (
                  <button
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition cursor-pointer ${
                      selectedPlan === 'lifetime' ? 'bg-neonBlue/20 border-neonBlue text-cyanGlow' : 'bg-[#080B10] border-[#1A2332] text-gray-300'
                    }`}
                  >
                    <span>Gói Vĩnh Viễn</span>
                    <span className="text-amber-400">{selectedTool.priceLifetime?.toLocaleString('vi-VN')} VNĐ</span>
                  </button>
                )}

                <button
                  onClick={handleConfirmPurchase}
                  className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3.5 rounded-xl mt-4 shadow-lg shadow-neonBlue/20 hover:opacity-90 transition cursor-pointer"
                >
                  XÁC NHẬN MUA
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}