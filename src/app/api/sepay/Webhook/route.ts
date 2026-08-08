import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Lấy nội dung chuyển khoản và số tiền từ payload SePay gửi về
    const content = String(data.content || data.code || data.description || '').trim();
    const amount = Number(data.transferAmount || data.amount || 0);

    if (!content || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Tách lấy username đứng sau từ khóa NAP (Chấp nhận nội dung chứa từ NAP ở bất kỳ đâu)
    // Ví dụ đọc tốt cả: "NAP abc", "SEPAY NAP abc", "VietQR NAP abc 123"
    const match = content.match(/NAP[\s_]+([a-zA-Z0-9_]+)/i);

    if (match && match[1]) {
      const username = match[1].trim();

      // 1. Lấy thông tin người dùng từ Supabase Database
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username) // So sánh không phân biệt hoa thường
        .single();

      if (user) {
        // 2. Cộng số dư mới
        const newBalance = (Number(user.balance) || 0) + amount;
        await supabase
          .from('users')
          .update({ balance: newBalance })
          .eq('id', user.id);

        // 3. Ghi nhật ký biến động vào bảng transactions trên Cloud
        await supabase.from('transactions').insert([
          {
            username: user.username,
            type: 'RECHARGE',
            title: `Nạp tiền tự động qua QR SePay`,
            amount: amount,
            status: 'Thành công'
          }
        ]);

        return NextResponse.json({ success: true, message: `Đã cộng ${amount}đ cho ${user.username}` });
      } else {
        console.error('Không tìm thấy user:', username);
      }
    }

    return NextResponse.json({ success: false, message: 'Nội dung không chứa cú pháp NAP <username>' });
  } catch (error: any) {
    console.error('Lỗi xử lý Webhook SePay:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}