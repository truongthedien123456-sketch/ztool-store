import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { accountKey, password, toolCode, hwid } = await req.json();

    if (!accountKey || !toolCode) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin xác thực' }, { status: 400 });
    }

    // 1. Kiểm tra trạng thái Tool trên Supabase
    const { data: toolData } = await supabase
      .from('tools')
      .select('status, name')
      .ilike('toolCode', toolCode)
      .single();

    // Chặn nếu Tool đang Tạm ngưng
    if (toolData && toolData.status === 'Tạm ngưng') {
      return NextResponse.json({
        success: false,
        code: 'TOOL_MAINTENANCE',
        message: `Tool [${toolData.name}] đang tạm ngưng bảo trì. Thời gian dùng của bạn đã được đóng băng tự động!`
      });
    }

    // 2. Tự động đọc đa dạng tên biến môi trường
    const GIST_ID = process.env.GITHUB_GIST_ID || process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';
    const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN || process.env.GITHUB_TOKEN || process.env.GIST_TOKEN;

    if (!GIST_ID) {
      return NextResponse.json({ 
        success: false, 
        message: 'Chưa cấu hình GIST_ID trong biến môi trường Vercel/.env.local' 
      }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'ZTool-Automation-App',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers,
      cache: 'no-store'
    });

    if (!gistRes.ok) {
      const errText = await gistRes.text();
      console.error('Lỗi Gist API:', gistRes.status, errText);
      return NextResponse.json({ 
        success: false, 
        message: `Lỗi kết nối GitHub Gist (Mã lỗi: ${gistRes.status})` 
      }, { status: 500 });
    }

    const gistData = await gistRes.json();
    const accounts = JSON.parse(gistData.files['accounts.json']?.content || '{}');
    const acc = accounts[accountKey];

    if (!acc) {
      return NextResponse.json({ success: false, message: 'Tài khoản không tồn tại trên hệ thống' });
    }

    if (password && acc.password !== password) {
      return NextResponse.json({ success: false, message: 'Mật khẩu không chính xác' });
    }

    // 3. Kiểm tra hạn dùng
    const nowSec = Math.floor(Date.now() / 1000);
    if (acc.expire_timestamp && acc.expire_timestamp > 0 && acc.expire_timestamp <= nowSec) {
      return NextResponse.json({ success: false, message: 'Tài khoản đã hết hạn sử dụng' });
    }

    // 4. Kiểm tra & Cập nhật HWID + Nhịp tim thời gian thực (Timeout: 30 giây)
    const now = Date.now();
    const lastActive = acc.last_active || 0;
    const isOldDeviceTimeout = (now - lastActive) > 30000; // Quá 30 giây không gửi nhịp tim -> Tự giải phóng HWID

    if (acc.device_id && acc.device_id !== '' && acc.device_id !== 'Chưa liên kết') {
      if (acc.device_id !== hwid && !isOldDeviceTimeout) {
        return NextResponse.json({
          success: false,
          message: `Tài khoản đang chạy trên thiết bị khác (${acc.device_id}). Hãy tắt tool ở máy cũ hoặc đợi 30 giây.`
        });
      }
    }

    // Cập nhật thiết bị và thời gian hoạt động mới nhất
    acc.device_id = hwid;
    acc.last_active = now;

    // Gửi cập nhật ngầm lên Gist
    if (GITHUB_TOKEN) {
      fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'User-Agent': 'ZTool-Automation-App',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: { 'accounts.json': { content: JSON.stringify(accounts, null, 2) } }
        })
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Xác thực thành công',
      expire_timestamp: acc.expire_timestamp
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}