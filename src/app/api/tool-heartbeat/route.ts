import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawKey = (body.accountKey || body.username || '').trim();
    const password = body.password;
    const toolCode = (body.toolCode || 'caucaluquy').trim();
    const hwid = (body.hwid || body.device_id || body.deviceId || '').trim();

    if (!rawKey) {
      return NextResponse.json({ success: false, message: 'Thiếu tên tài khoản' }, { status: 400 });
    }

    // 1. Kiểm tra trạng thái Tool
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
          message: `Tool [${toolData.name}] đang tạm ngưng bảo trì.`
        });
      }
    }

    // 2. Lấy dữ liệu Accounts qua RAW URL (Bỏ qua GitHub API Limit)
    const GIST_ID = process.env.GITHUB_GIST_ID || process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';
    const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN || process.env.GITHUB_TOKEN || process.env.GIST_TOKEN;

    let accounts: Record<string, any> = {};
    const rawRes = await fetch(`https://gist.githubusercontent.com/raw/${GIST_ID}/accounts.json?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (rawRes.ok) {
      accounts = await rawRes.json();
    } else {
      // Fallback nếu RAW cache
      const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          'Authorization': GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN.trim()}` : '',
          'User-Agent': 'ZTool-Automation-App'
        },
        cache: 'no-store'
      });
      if (gistRes.ok) {
        const d = await gistRes.json();
        accounts = JSON.parse(d.files['accounts.json']?.content || '{}');
      }
    }

    // 3. Khớp Key tài khoản
    let foundKey = Object.keys(accounts).find(k => k.toLowerCase() === rawKey.toLowerCase());
    if (!foundKey) {
      foundKey = Object.keys(accounts).find(k => {
        const isPrefix = k.toLowerCase().startsWith(`${rawKey.toLowerCase()}_`);
        const accTool = (accounts[k].tool_code || accounts[k].toolCode || '').toLowerCase();
        return isPrefix && (accTool === toolCode.toLowerCase() || accTool === 'chung' || accTool === '');
      });
    }

    if (!foundKey || !accounts[foundKey]) {
      return NextResponse.json({ success: false, message: `Tài khoản [${rawKey}] không tồn tại` });
    }

    const acc = accounts[foundKey];

    // Kiểm tra mật khẩu
    if (password && acc.password && String(acc.password) !== String(password)) {
      return NextResponse.json({ success: false, message: 'Mật khẩu không chính xác' });
    }

    // 4. Kiểm tra quyền Tool
    const accTool = (acc.tool_code || acc.toolCode || '').trim().toLowerCase();
    const reqTool = toolCode.toLowerCase();
    const isGeneralAccount = !accTool || accTool === 'chung' || accTool === 'all' || acc.role === 'admin';

    if (!isGeneralAccount && reqTool !== '' && accTool !== reqTool) {
      return NextResponse.json({
        success: false,
        message: `Tài khoản chỉ dùng cho tool [${acc.tool_code || acc.toolCode}]`
      });
    }

    // 5. Kiểm tra hạn dùng
    const nowSec = Math.floor(Date.now() / 1000);
    if (acc.expire_timestamp && acc.expire_timestamp > 0 && acc.expire_timestamp <= nowSec) {
      return NextResponse.json({ success: false, message: 'Tài khoản đã hết hạn sử dụng' });
    }

    const now = Date.now();
    const activeHWID = (hwid && hwid !== 'Chưa liên kết') ? hwid : (acc.device_id || 'Chưa liên kết');

    // 6. GHI NHẬN VÀO SUPABASE (Không giới hạn lượt gọi / Tốc độ thời gian thực)
    await supabase.from('tool_accounts').upsert({
      account_key: foundKey,
      device_id: activeHWID,
      tool_code: toolCode,
      last_active: now,
      is_online: true
    }, { onConflict: 'account_key' }).select();

    // 7. Ghi đè vào Gist (Chỉ chạy khi thiết bị thay đổi lần đầu và có Token)
    if (hwid && hwid !== 'Chưa liên kết' && acc.device_id !== hwid && GITHUB_TOKEN) {
      acc.device_id = hwid;
      acc.last_active = now;
      acc.is_online = true;
      accounts[foundKey] = acc;

      fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
          'User-Agent': 'ZTool-Automation-App',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: { 'accounts.json': { content: JSON.stringify(accounts, null, 2) } }
        })
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Xác thực thành công',
      expire_timestamp: acc.expire_timestamp || 0,
      device_id: activeHWID,
      is_online: true
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}