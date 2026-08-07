'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { CreditCard, QrCode, History, CheckCircle2, Clock, AlertCircle, Copy, ArrowRight } from 'lucide-react';

export default function RechargePage() {
  const [currentUser, setCurrentUser] = useState<{ username: string; balance: number } | null>(null);
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [history, setHistory] = useState<any[]>([]);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedStk, setCopiedStk] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Mức tiền gợi ý
  const quickAmounts = [20000, 50000, 100000, 200000, 500000];

  useEffect(() => {
    // 1. Đọc User
    const savedUser = localStorage.getItem('ztool_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // 2. Đọc Lịch sử nạp tiền
    const savedHistory = localStorage.getItem('ztool_recharge_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      const defaultHistory = [
        {
          id: 'ZTOOL88321',
          username: 'mienprovip',
          amount: 100000,
          status: 'Thành công',
          createdAt: '08/08/2026 01:15',
        },
      ];
      setHistory(defaultHistory);
      localStorage.setItem('ztool_recharge_history', JSON.stringify(defaultHistory));
    }
  }, []);

  // TỰ ĐỘNG ĐỐI SOÁT VỚI SEPAY VÀ CỘNG TIỀN VÀO VÍ KHÁCH HÀNG (REALTIME EACH 3 SECONDS)
  useEffect(() => {
    if (!currentUser?.username) return;

    const checkAutoRecharge = async () => {
      try {
        const res = await fetch(`/api/check-recharge?username=${encodeURIComponent(currentUser.username)}`);
        const data = await res.json();

        if (data.transactions && data.transactions.length > 0) {
          const processedTxs = JSON.parse(localStorage.getItem('ztool_processed_txs') || '[]');

          for (const tx of data.transactions) {
            if (!processedTxs.includes(tx.id)) {
              // 1. Cộng tiền vào ví user hiện tại
              const savedCurrentUser = localStorage.getItem('ztool_current_user');
              if (savedCurrentUser) {
                const parsed = JSON.parse(savedCurrentUser);
                const newBalance = (parsed.balance || 0) + tx.amount;
                const updatedUser = { ...parsed, balance: newBalance };
                localStorage.setItem('ztool_current_user', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
              }

              // 2. Cập nhật số dư trong ztool_users
              const savedUsers = localStorage.getItem('ztool_users');
              if (savedUsers) {
                const usersList = JSON.parse(savedUsers);
                const updatedUsersList = usersList.map((u: any) =>
                  u.username.toLowerCase() === currentUser.username.toLowerCase()
                    ? { ...u, balance: (u.balance || 0) + tx.amount }
                    : u
                );
                localStorage.setItem('ztool_users', JSON.stringify(updatedUsersList));
              }

              // 3. Cập nhật trạng thái đơn nạp
              const savedHistory = JSON.parse(localStorage.getItem('ztool_recharge_history') || '[]');
              const updatedHistory = savedHistory.map((h: any) => {
                if (h.username.toLowerCase() === currentUser.username.toLowerCase() && h.status === 'Chờ thanh toán') {
                  return { ...h, status: 'Thành công' };
                }
                return h;
              });
              localStorage.setItem('ztool_recharge_history', JSON.stringify(updatedHistory));
              setHistory(updatedHistory);

              // 4. Đánh dấu giao dịch đã cộng tiền
              processedTxs.push(tx.id);
              localStorage.setItem('ztool_processed_txs', JSON.stringify(processedTxs));

              window.dispatchEvent(new Event('storage'));
              alert(`🎉 Chúc mừng! Bạn đã nạp thành công ${tx.amount.toLocaleString('vi-VN')} VNĐ vào tài khoản.`);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra đối soát nạp tiền:', err);
      }
    };

    const interval = setInterval(checkAutoRecharge, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Vui lòng đăng nhập tài khoản trước khi tạo đơn nạp tiền!');
      return;
    }

    const orderId = `ZTOOL${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newOrder = {
      id: orderId,
      username: currentUser.username,
      amount: amount,
      status: 'Chờ thanh toán',
      createdAt: formattedDate,
      transferContent: `ZTOOL ${currentUser.username} ${orderId}`,
    };

    const updatedHistory = [newOrder, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ztool_recharge_history', JSON.stringify(updatedHistory));
    window.dispatchEvent(new Event('storage'));

    setCreatedOrder(newOrder);
  };

  const copyToClipboard = (text: string, type: 'stk' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'stk') {
      setCopiedStk(true);
      setTimeout(() => setCopiedStk(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const transferMemo = `ZTOOL ${currentUser ? currentUser.username : 'CLIENT'} ${createdOrder ? createdOrder.id : ''}`.trim();

  // Dùng template 'qr_only' để tạo ra hình mã QR thuần không bị viền trắng bao thừa
  const qrUrl = `https://img.vietqr.io/image/BIDV-1490055207-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=TRUONG%20THE%20DIEN`;

  return (
    <main className="min-h-screen bg-[#080B10] text-white pb-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        
        {/* Header Trang */}
        <div className="border-b border-[#1A2332] pb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-2">
            <CreditCard className="w-3.5 h-3.5" /> NẠP TIỀN VÀO TÀI KHOẢN ZTOOL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            NẠP TIỀN TỰ ĐỘNG <span className="bg-gradient-to-r from-cyanGlow to-neonBlue bg-clip-text text-transparent">NẠP QUA MÃ QR / BANK / MOMO</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Hệ thống xử lý nạp tiền tự động 24/7. Tiền sẽ được cộng vào Ví ngay sau khi chuyển khoản thành công.
          </p>
        </div>

        {/* Khung Nạp Tiền & Mã QR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột trái: Form chọn số tiền (7 cols) */}
          <div className="lg:col-span-7 bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
              <CreditCard className="w-5 h-5 text-cyanGlow" /> 1. CHỌN SỐ TIỀN MUỐN NẠP
            </h2>

            {!currentUser ? (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-2xl text-xs font-bold text-center">
                Bạn chưa đăng nhập. Vui lòng đăng nhập tài khoản ở góc trên trang web để thực hiện nạp tiền!
              </div>
            ) : (
              <form onSubmit={handleCreateOrder} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Chọn nhanh mệnh giá (VNĐ)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {quickAmounts.map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handleSelectAmount(val)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          amount === val
                            ? 'bg-neonBlue/20 border-neonBlue text-cyanGlow shadow-md shadow-neonBlue/20'
                            : 'bg-[#080B10] border-[#1A2332] text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {val.toLocaleString('vi-VN')}đ
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Hoặc nhập số tiền khác (Tối thiểu 10.000 VNĐ)</label>
                  <input
                    type="number"
                    min="10000"
                    required
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Nhập số tiền..."
                    className="w-full bg-[#080B10] border border-[#1A2332] focus:border-neonBlue rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-neonBlue to-cyanGlow text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-neonBlue/20 hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  TẠO MÃ QR NẠP TIỀN <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Cột phải: Mã QR BIDV Bao Phủ Khung (5 cols) */}
          <div className="lg:col-span-5 bg-[#0F141C] border border-neonBlue/40 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1A2332] pb-3">
                <QrCode className="w-5 h-5 text-cyanGlow" /> 2. MÃ QR THANH TOÁN BIDV
              </h2>

              <div className="mt-4 text-center space-y-3">
                {/* Khung chứa mã QR bao phủ tràn lề khung trắng */}
                <div className="relative w-64 h-64 mx-auto bg-white p-2 rounded-2xl border-2 border-neonBlue shadow-lg shadow-neonBlue/20 overflow-hidden flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt="Mã QR BIDV Nạp Tiền ZTool"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="text-xs space-y-1 pt-1">
                  <p className="text-gray-400">Số tiền: <b className="text-emerald-400 text-sm">{amount.toLocaleString('vi-VN')} VNĐ</b></p>
                  <p className="text-gray-400">Chủ tài khoản: <b className="text-white uppercase">TRUONG THE DIEN</b></p>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <span>STK: <b className="text-cyanGlow font-mono">1490055207</b> (BIDV)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1490055207', 'stk')}
                      className="p-1 text-[10px] bg-[#080B10] hover:bg-[#1A2332] text-cyanGlow border border-[#1A2332] rounded-md transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3 inline" /> {copiedStk ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                {/* Khung Nội dung chuyển khoản */}
                <div className="bg-[#080B10] border border-[#1A2332] p-3 rounded-xl space-y-1 text-left">
                  <span className="text-[11px] text-gray-400 block">Nội dung chuyển khoản (Đã nhúng vào QR):</span>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono font-bold text-amber-300">
                      {transferMemo}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferMemo, 'content')}
                      className="p-1.5 bg-[#0F141C] hover:bg-[#1A2332] text-gray-300 border border-[#1A2332] rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Copy className="w-3 h-3" /> {copiedContent ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 text-center mt-4 pt-3 border-t border-[#1A2332]">
              Lưu ý: Khách chỉ cần mở App Ngân hàng quét QR trên, ứng dụng sẽ <b>tự điền sẵn số tiền {amount.toLocaleString('vi-VN')}đ và nội dung chuyển khoản</b>!
            </p>
          </div>

        </div>

        {/* Bảng Lịch Sử Nạp Tiền */}
        <div className="bg-[#0F141C] border border-[#1A2332] rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1A2332] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyanGlow" /> LỊCH SỬ NẠP TIỀN & TRẠNG THÁI ĐƠN
            </h2>
            <span className="text-xs text-gray-400">Tổng cộng: <b className="text-cyanGlow">{history.length}</b> giao dịch</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#080B10] border-b border-[#1A2332] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Tài khoản</th>
                  <th className="p-3">Số tiền</th>
                  <th className="p-3">Trạng thái đơn nạp</th>
                  <th className="p-3">Thời gian nạp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2332]">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">Chưa có lịch sử nạp tiền nào</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-[#080B10]/50 transition">
                      <td className="p-3 font-mono font-bold text-cyanGlow">{item.id}</td>
                      <td className="p-3 font-bold text-white">{item.username}</td>
                      <td className="p-3 font-bold text-emerald-400">{item.amount?.toLocaleString('vi-VN')} VNĐ</td>
                      <td className="p-3">
                        {item.status === 'Thành công' ? (
                          <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Thành công
                          </span>
                        ) : item.status === 'Chờ thanh toán' ? (
                          <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-spin" /> Chờ thanh toán
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Thất bại
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-gray-400">{item.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}