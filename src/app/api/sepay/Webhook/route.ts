import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Dữ liệu SePay bắn về chứa: content (Nội dung CK), transferAmount (Số tiền)
    const content = data.content || data.code || '';
    const amount = Number(data.transferAmount || data.amount || 0);

    if (!content || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Tách lấy Username từ nội dung chuyển khoản (Ví dụ: "NAP abc" -> "abc")
    const match = content.match(/NAP\s+([a-zA-Z0-9_]+)/i);

    if (match && match[1]) {
      const username = match[1].trim();

      // 1. Kiểm tra tài khoản có tồn tại không
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (user) {
        // 2. Cộng số dư mới vào tài khoản khách hàng
        const newBalance = (user.balance || 0) + amount;
        await supabase
          .from('users')
          .update({ balance: newBalance })
          .eq('id', user.id);

        // 3. Ghi nhật ký vào bảng transactions để hiển thị trong Lịch sử giao dịch
        await supabase.from('transactions').insert([
          {
            username: username,
            type: 'RECHARGE',
            title: `Nạp tiền tự động qua QR SePay`,
            amount: amount,
            status: 'Thành công'
          }
        ]);

        return NextResponse.json({ success: true, message: `Đã cộng ${amount}đ cho ${username}` });
      }
    }

    return NextResponse.json({ success: false, message: 'Không tìm thấy username tương ứng' });
  } catch (error: any) {
    console.error('Lỗi xử lý Webhook SePay:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}