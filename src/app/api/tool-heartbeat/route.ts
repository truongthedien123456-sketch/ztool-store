import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { accountKey, password, toolCode, hwid } = await req.json();

    if (!accountKey) {
      return NextResponse.json({ success: false, message: 'Thiếu tên tài khoản' }, { status: 400 });
    }

    // 1. Kiểm tra trạng thái Tool trên Supabase
    if (toolCode && toolCode.toLowerCase() !== 'chung' && toolCode.toLowerCase() !== 'all') {
      const { data: toolData } = await supabase
        .from('tools')
        .select('status, name')
        .ilike('toolCode', toolCode)
        .single();

      if (toolData && toolData.status === 'Tạm ngưng') {
        return NextResponse.json({
          success: false,
          code: 'TOOL_MAINTENANCE',
          message: `Tool [${toolData.name}] đang tạm ngưng bảo trì. Thời gian dùng của bạn đã được đóng băng tự động!`
        });
      }
    }

    // 2. Lấy dữ liệu tài khoản từ GitHub Gist
    const GIST_ID = process.env.GITHUB_GIST_ID || process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';
    const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN || process.env.GITHUB_TOKEN || process.env.GIST_TOKEN;

    if (!GIST_ID) {
      return NextResponse.json({ success: false, message: 'Chưa cấu hình GIST_ID' }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'ZTool-Automation-App',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}?t=${Date.now()}`, {
      headers,
      cache: 'no-store'
    });

    if (!gistRes.ok) {
      return NextResponse.json({ success: false, message: `Lỗi đọc Gist: ${gistRes.status}` }, { status: 500 });
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

    // 3. Kiểm tra Mã Tool (Quyền sử dụng)
    const accTool = (acc.tool_code || acc.toolCode || '').trim().toLowerCase();
    const reqTool = (toolCode || '').trim().toLowerCase();

    // Nếu tài khoản không phải là "chung", "all" hoặc rỗng thì phải khớp với tool hiện tại
    const isGeneralAccount = accTool === '' || accTool === 'chung' || accTool === 'all';
    if (!isGeneralAccount && reqTool !== '' && accTool !== reqTool) {
      return NextResponse.json({
        success: false,
        message: `Tài khoản này chỉ dành riêng cho tool [${acc.tool_code || acc.toolCode}]`
      });
    }

    // 4. Kiểm tra hạn dùng
    const nowSec = Math.floor(Date.now() / 1000);
    if (acc.expire_timestamp && acc.expire_timestamp > 0 && acc.expire_timestamp <= nowSec) {
      return NextResponse.json({ success: false, message: 'Tài khoản đã hết hạn sử dụng' });
    }

    // 5. Kiểm tra thiết bị & nhịp tim (Timeout: 10 giây)
    const now = Date.now();
    const lastActive = Number(acc.last_active) || 0;
    const isOldDeviceTimeout = lastActive === 0 || (now - lastActive) > 10000;

    if (acc.device_id && acc.device_id !== '' && acc.device_id !== 'Chưa liên kết') {
      if (acc.device_id !== hwid && !isOldDeviceTimeout) {
        return NextResponse.json({
          success: false,
          message: `Tài khoản đang chạy trên thiết bị khác (${acc.device_id}). Hãy tắt tool ở máy cũ hoặc đợi 10 giây.`
        });
      }
    }

    // 6. Cập nhật HWID và nhịp tim mới nhất
    acc.device_id = hwid || 'Chưa liên kết';
    acc.last_active = now;
    accounts[accountKey] = acc;

    // Ghi đè trực tiếp lên Gist (bắt buộc await để hoàn thành trên Vercel)
    if (GITHUB_TOKEN) {
      await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'ZTool-Automation-App',
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: { 'accounts.json': { content: JSON.stringify(accounts, null, 2) } }
        })
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Xác thực thành công',
      expire_timestamp: acc.expire_timestamp,
      device_id: acc.device_id
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}