import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, username, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập đầy đủ mã OTP!' }, { status: 400 });
    }

    // Kiểm tra mã trong bảng email_otps
    const { data: record, error } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp.trim())
      .single();

    if (error || !record) {
      return NextResponse.json({ success: false, message: 'Mã OTP không chính xác!' }, { status: 400 });
    }

    // Kiểm tra thời hạn mã
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ success: false, message: 'Mã OTP đã hết hạn sử dụng!' }, { status: 400 });
    }

    // Cập nhật trạng thái đã xác minh cho tài khoản
    await supabase
      .from('users')
      .update({ is_verified: true, email: email })
      .eq('username', username);

    // Xóa mã sau khi dùng xong
    await supabase.from('email_otps').delete().eq('email', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Xác thực tài khoản thành công!' 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}