import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Địa chỉ Email không hợp lệ!' }, { status: 400 });
    }

    // 1. Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 phút hết hạn

    // 2. Xóa các mã cũ của email này trước
    await supabase.from('email_otps').delete().eq('email', email.toLowerCase().trim());

    // 3. Thêm mã OTP mới vào bảng
    const { error: insertError } = await supabase.from('email_otps').insert([
      { 
        email: email.toLowerCase().trim(), 
        otp_code: otp, 
        expires_at: expiresAt 
      }
    ]);

    if (insertError) {
      console.error('Lỗi insert OTP:', insertError);
      return NextResponse.json({ 
        success: false, 
        message: `Lỗi Database: ${insertError.message}` 
      }, { status: 500 });
    }

    // 4. Gửi email xác thực qua Supabase Auth
    try {
      await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          data: { otp_code: otp, username: username }
        }
      });
    } catch (e) {
      console.error('Lỗi gọi Supabase Auth OTP:', e);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mã xác thực OTP đã được gửi về hòm thư Gmail của bạn!' 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}