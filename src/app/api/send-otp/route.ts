import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Địa chỉ Email không hợp lệ!' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Hết hạn sau 5 phút

    // 2. Lưu mã OTP vào bảng email_otps trên Supabase
    await supabase.from('email_otps').delete().eq('email', cleanEmail);
    const { error: insertError } = await supabase.from('email_otps').insert([
      { email: cleanEmail, otp_code: otp, expires_at: expiresAt }
    ]);

    if (insertError) {
      console.error('Lỗi lưu OTP:', insertError);
      return NextResponse.json({ success: false, message: `Lỗi Database: ${insertError.message}` }, { status: 500 });
    }

    // 3. Khởi tạo dịch vụ gửi mail qua Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'truongthedien123456@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'ksfjojmfjjwhwntx',
      },
    });

    const mailOptions = {
      from: `"ZTOOL.STORE" <${process.env.GMAIL_USER || 'truongthedien123456@gmail.com'}>`,
      to: cleanEmail,
      subject: `[ZTOOL.STORE] Mã OTP xác thực của bạn: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b1019; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #06b6d4; max-width: 500px; margin: auto;">
          <h2 style="color: #06b6d4; text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: 900;">ZTOOL.STORE</h2>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 8px;">Xin chào <strong>${username || 'quý khách'}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 20px;">Mã xác thực OTP gồm 6 chữ số để kích hoạt tài khoản của bạn là:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #06b6d4; background-color: #05080e; padding: 12px 24px; border-radius: 12px; border: 1px dashed #06b6d4; display: inline-block;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 25px;">Mã OTP có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Mã xác thực OTP 6 số đã được gửi về hòm thư Gmail của bạn!' 
    });

  } catch (error: any) {
    console.error('Lỗi gửi mail:', error);
    return NextResponse.json({ success: false, message: `Lỗi gửi mail: ${error.message}` }, { status: 500 });
  }
}