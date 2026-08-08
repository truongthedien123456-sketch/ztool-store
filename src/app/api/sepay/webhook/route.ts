import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // SePay gửi nội dung qua trường 'content' hoặc 'description'
    const rawContent = String(data.content || data.description || data.code || '').trim();
    const amount = Number(data.transferAmount || data.amount || 0);

    if (!rawContent || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Lọc lấy username đứng sau từ khóa NAP
    const match = rawContent.match(/NAP[\s_]+([a-zA-Z0-9_]+)/i);

    if (match && match[1]) {
      const username = match[1].trim();

      // 1. Tìm người dùng trên Database Supabase
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .single();

      if (user) {
        // 2. Cộng đúng số tiền thực tế khách đã chuyển khoản vào ví
        const newBalance = (Number(user.balance) || 0) + amount;
        await supabase
          .from('users')
          .update({ balance: newBalance })
          .eq('id', user.id);

        // 3. Ghi nhật ký biến động vào bảng transactions trên Cloud (Admin xem tại Tab SePay)
        await supabase.from('transactions').insert([
          {
            username: user.username,
            type: 'RECHARGE',
            title: `Nạp tiền tự động qua QR SePay (${rawContent})`,
            amount: amount,
            status: 'Thành công'
          }
        ]);

        return NextResponse.json({ success: true, message: `Đã cộng ${amount}đ cho ${user.username}` });
      }
    }

    return NextResponse.json({ success: false, message: 'Nội dung giao dịch không chứa NAP <username>' });
  } catch (error: any) {
    console.error('Lỗi xử lý Webhook SePay:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}