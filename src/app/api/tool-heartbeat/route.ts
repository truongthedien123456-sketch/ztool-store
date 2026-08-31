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

    // Nếu Tool đang Tạm ngưng -> Chặn và báo mã TOOL_MAINTENANCE
    if (toolData && toolData.status === 'Tạm ngưng') {
      return NextResponse.json({
        success: false,
        code: 'TOOL_MAINTENANCE',
        message: `Tool [${toolData.name}] đang tạm ngưng bảo trì. Thời gian dùng của bạn đã được đóng băng tự động!`
      });
    }

    // 2. Lấy dữ liệu tài khoản từ GitHub Gist (Bổ sung User-Agent và Accept headers)
    const GIST_ID = process.env.GITHUB_GIST_ID;
    const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;

    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'ZTool-Automation-App',
        Accept: 'application/vnd.github.v3+json'
      },
      cache: 'no-store'
    });

    if (!gistRes.ok) {
      return NextResponse.json({ success: false, message: 'Lỗi kết nối kho dữ liệu Gist' }, { status: 500 });
    }

    const gistData = await gistRes.json();
    const accounts = JSON.parse(gistData.files['accounts.json'].content || '{}');
    const acc = accounts[accountKey];

    if (!acc) {
      return NextResponse.json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    if (password && acc.password !== password) {
      return NextResponse.json({ success: false, message: 'Mật khẩu không chính xác' });
    }

    // 3. Kiểm tra hạn dùng
    const nowSec = Math.floor(Date.now() / 1000);
    if (acc.expire_timestamp && acc.expire_timestamp > 0 && acc.expire_timestamp <= nowSec) {
      return NextResponse.json({ success: false, message: 'Tài khoản đã hết hạn sử dụng' });
    }

    // 4. Kiểm tra & Cập nhật HWID + Nhịp tim thời gian thực
    const now = Date.now();
    const lastActive = acc.last_active || 0;
    const isOldDeviceTimeout = (now - lastActive) > 180000; // Quá 3 phút không hoạt động -> Tự giải phóng HWID

    if (acc.device_id && acc.device_id !== '' && acc.device_id !== 'Chưa liên kết') {
      if (acc.device_id !== hwid && !isOldDeviceTimeout) {
        return NextResponse.json({
          success: false,
          message: `Tài khoản đang chạy trên thiết bị khác (${acc.device_id}). Hãy tắt tool ở máy cũ hoặc đợi 3 phút.`
        });
      }
    }

    // Cập nhật thiết bị hiện tại & thời gian hoạt động mới nhất
    acc.device_id = hwid;
    acc.last_active = now;

    // Cập nhật ngầm lên Gist
    fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'ZTool-Automation-App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: { 'accounts.json': { content: JSON.stringify(accounts, null, 2) } }
      })
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Xác thực phiên hoạt động thành công',
      expire_timestamp: acc.expire_timestamp
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}