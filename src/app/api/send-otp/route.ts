import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Địa chỉ Email không hợp lệ!' }, { status: 400 });
    }

    // 1. Tạo mã OTP 6 chữ số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Hết hạn sau 5 phút

    // 2. Xóa các mã OTP cũ của email này và lưu mã mới
    await supabase.from('email_otps').delete().eq('email', email);
    const { error: insertError } = await supabase.from('email_otps').insert([
      { email, otp_code: otp, expires_at: expiresAt }
    ]);

    if (insertError) {
      return NextResponse.json({ success: false, message: 'Không thể tạo mã OTP, vui lòng thử lại!' }, { status: 500 });
    }

    // 3. Gửi email OTP (Sử dụng Supabase Auth built-in hoặc Resend/Nodemailer)
    // Mặc định gọi hàm gửi email của Supabase Auth:
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        data: { otp_code: otp, username: username }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Mã xác thực OTP đã được gửi về hòm thư Gmail của bạn!' 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}