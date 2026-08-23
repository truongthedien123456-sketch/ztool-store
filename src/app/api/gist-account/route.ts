import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_GIST_TOKEN;
const GIST_ID = process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, accountKey, username, password, durationDays, tool_code } = body;

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: false, message: 'Chưa cấu hình GITHUB_TOKEN trên server' }, { status: 500 });
    }

    // 1. Lấy dữ liệu accounts.json hiện tại trên Gist
    const getGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}?timestamp=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
      cache: 'no-store'
    });

    if (!getGistRes.ok) {
      throw new Error(`Lỗi đọc Gist từ GitHub: ${getGistRes.statusText}`);
    }

    const gistData = await getGistRes.json();
    const currentContentRaw = gistData.files['accounts.json']?.content || '{}';
    const accountsJson = JSON.parse(currentContentRaw);

    // =========================================================================
    // LUỒNG 1: XỬ LÝ RESET HWID (XÓA MÃ THIẾT BỊ ĐĂNG NHẬP MÁY MỚI)
    // =========================================================================
    if (action === 'RESET_DEVICE') {
      const targetKey = accountKey || username;
      if (!targetKey || !accountsJson[targetKey]) {
        return NextResponse.json({ 
          success: false, 
          message: `Không tìm thấy tài khoản "${targetKey}" trên Gist!` 
        }, { status: 404 });
      }

      // Xóa sạch mã thiết bị
      accountsJson[targetKey].device_id = '';

      // Đẩy JSON cập nhật lên GitHub Gist
      const patchGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'accounts.json': {
              content: JSON.stringify(accountsJson, null, 2)
            }
          }
        })
      });

      if (!patchGistRes.ok) {
        throw new Error(`Lỗi lưu dữ liệu lên Gist: ${patchGistRes.statusText}`);
      }

      return NextResponse.json({
        success: true,
        message: `Đã reset HWID thành công cho tài khoản ${targetKey}!`
      });
    }

    // =========================================================================
    // LUỒNG 2: XỬ LÝ MUA TOOL / GIA HẠN THỜI HẠN
    // =========================================================================
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Thiếu username hoặc password' }, { status: 400 });
    }

    // Chuẩn hóa mã tool mới mua
    const targetToolCode = tool_code ? tool_code.trim() : '';

    // 2. Kiểm tra xem user đã sở hữu tài khoản nào có cùng tool_code hay chưa
    let targetAccountKey = username;
    const matchedAccount = Object.keys(accountsJson).find(key => {
      const acc = accountsJson[key];
      const accToolCode = (acc.tool_code || acc.toolCode || '').trim();
      const isOwner = key === username || key.startsWith(`${username}_`);
      return isOwner && accToolCode === targetToolCode;
    });

    if (matchedAccount) {
      // Đã có tài khoản mang đúng mã tool này -> Dùng lại để cộng dồn thời gian
      targetAccountKey = matchedAccount;
    } else if (accountsJson[username] && (!accountsJson[username].tool_code && !accountsJson[username].toolCode)) {
      // Nếu user gốc chưa gán mã tool nào, gán luôn cho user gốc
      targetAccountKey = username;
    } else {
      // Nếu user gốc đã có mã tool khác -> Tự động tạo tài khoản phụ mới (ví dụ: abc_congtruongf17)
      const cleanToolCode = targetToolCode ? targetToolCode.replace(/[^a-zA-Z0-9]/g, '_') : 'tool';
      targetAccountKey = `${username}_${cleanToolCode}`;
    }

    // 3. KIỂM TRA CHẶN NẾU TÀI KHOẢN ĐÃ LÀ VĨNH VIỄN (expire_timestamp === 0)
    const currentExpire = accountsJson[targetAccountKey]?.expire_timestamp || 0;
    if (currentExpire === 0 && accountsJson[targetAccountKey]) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tài khoản này đã sở hữu gói Vĩnh Viễn, không thể gia hạn thêm!' 
      }, { status: 400 });
    }

    // 4. Tính toán expire_timestamp (0 = Vĩnh Viễn)
    let expireTimestamp = 0;
    const nowSec = Math.floor(Date.now() / 1000);

    if (durationDays && Number(durationDays) > 0) {
      const addedSec = Number(durationDays) * 86400; // 1 ngày = 86400 giây

      if (currentExpire > nowSec) {
        expireTimestamp = currentExpire + addedSec; // Gia hạn nối tiếp nếu chưa hết hạn
      } else {
        expireTimestamp = nowSec + addedSec; // Tính từ thời điểm hiện tại
      }
    }

    // 5. Cập nhật hoặc tạo mới tài khoản vào JSON kèm theo tool_code
    accountsJson[targetAccountKey] = {
      password: password,
      role: accountsJson[targetAccountKey]?.role || 'user',
      tool_code: targetToolCode,
      expire_timestamp: expireTimestamp,
      device_id: accountsJson[targetAccountKey]?.device_id || ''
    };

    // 6. Đẩy JSON mới lên GitHub Gist
    const patchGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'accounts.json': {
            content: JSON.stringify(accountsJson, null, 2)
          }
        }
      })
    });

    if (!patchGistRes.ok) {
      throw new Error(`Lỗi lưu dữ liệu lên Gist: ${patchGistRes.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: `Đã xử lý thành công tài khoản ${targetAccountKey} trên Gist`,
      accountKey: targetAccountKey,
      account: accountsJson[targetAccountKey]
    });

  } catch (error: any) {
    console.error('Lỗi Gist API:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}