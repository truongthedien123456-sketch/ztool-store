import { NextResponse } from 'next/server';

// Mảng lưu trữ tạm thời các giao dịch nạp tiền thành công từ SePay
export const successfulTransactions: Array<{
  id: string;
  username: string;
  amount: number;
  content: string;
  createdAt: string;
}> = [];

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Dữ liệu SePay gửi về
    const {
      id,              // ID giao dịch trên SePay
      content,         // Nội dung chuyển khoản (VD: "ZTOOL mienprovip ZTOOL12345")
      transferAmount,  // Số tiền khách vừa chuyển (VD: 100000)
    } = data;

    if (!content || !transferAmount) {
      return NextResponse.json({ status: 400, message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Bóc tách Username từ cú pháp nội dung "ZTOOL <username> <orderId>"
    const parts = content.trim().split(/\s+/);
    let username = '';

    const ztoolIndex = parts.findIndex((p: string) => p.toUpperCase() === 'ZTOOL');
    if (ztoolIndex !== -1 && parts[ztoolIndex + 1]) {
      username = parts[ztoolIndex + 1].trim();
    }

    if (username) {
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Lưu giao dịch vào mảng tạm đối soát
      const tx = {
        id: id ? id.toString() : `SEPAY_${Date.now()}`,
        username: username,
        amount: Number(transferAmount),
        content: content,
        createdAt: formattedDate,
      };

      successfulTransactions.push(tx);
      console.log(`[SePay Webhook] Đã nhận thanh toán thành công cho user: ${username} +${transferAmount}đ`);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã nhận giao dịch thành công',
    });
  } catch (error) {
    console.error('Lỗi SePay Webhook:', error);
    return NextResponse.json({ status: 500, message: 'Lỗi máy chủ' }, { status: 500 });
  }
}