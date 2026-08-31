import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawKey = body.accountKey || body.username || '';
    const password = body.password;
    const toolCode = body.toolCode || 'caucaluquy';
    const hwid = body.hwid || body.device_id || body.deviceId || '';

    if (!rawKey) {
      return NextResponse.json({ success: false, message: 'Thiếu tên tài khoản' }, { status: 400 });
    }

    // 1. Đọc dữ liệu từ GitHub Gist
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

    // 2. Tìm kiếm linh hoạt key tài khoản trong Gist (hỗ trợ cả dạng 'test' lẫn 'test_...')
    let foundKey = null;
    for (const k of Object.keys(accounts)) {
      if (k === rawKey || k.startsWith(`${rawKey}_`)) {
        foundKey = k;
        break;
      }
    }

    if (!foundKey) {
      return NextResponse.json({ success: false, message: `Tài khoản [${rawKey}] không tồn tại trên hệ thống` });
    }

    const acc = accounts[foundKey];

    if (password && acc.password && acc.password !== password) {
      return NextResponse.json({ success: false, message: 'Mật khẩu không chính xác' });
    }

    // 3. Kiểm tra hạn dùng
    const nowSec = Math.floor(Date.now() / 1000);
    if (acc.expire_timestamp && acc.expire_timestamp > 0 && acc.expire_timestamp <= nowSec) {
      return NextResponse.json({ success: false, message: 'Tài khoản đã hết hạn sử dụng' });
    }

    // 4. Kiểm tra thiết bị trùng lặp (Timeout: 10 giây)
    const now = Date.now();
    const lastActive = Number(acc.last_active) || 0;
    const isOldDeviceTimeout = lastActive === 0 || (now - lastActive) > 10000;

    if (acc.device_id && acc.device_id !== '' && acc.device_id !== 'Chưa liên kết') {
      if (hwid && acc.device_id !== hwid && !isOldDeviceTimeout) {
        return NextResponse.json({
          success: false,
          message: `Tài khoản đang chạy trên thiết bị khác (${acc.device_id}). Hãy tắt tool ở máy cũ hoặc đợi 10 giây.`
        });
      }
    }

    // 5. Cập nhật HWID và thời gian nhịp tim chính xác vào đúng key tìm được
    if (hwid && hwid.trim() !== "") {
      acc.device_id = hwid;
    }
    acc.last_active = now;
    accounts[foundKey] = acc;

    // 6. Ghi đè trực tiếp lên Gist
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
      message: 'Xác thực và cập nhật thiết bị thành công',
      expire_timestamp: acc.expire_timestamp,
      device_id: acc.device_id
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}