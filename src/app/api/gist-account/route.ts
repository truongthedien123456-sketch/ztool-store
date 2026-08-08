import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, durationDays } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Thiếu username hoặc password' }, { status: 400 });
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: false, message: 'Chưa cấu hình GITHUB_TOKEN trên server' }, { status: 500 });
    }

    // 1. Lấy dữ liệu accounts.json hiện tại trên Gist
    const getGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
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

    // 2. Tính toán expire_timestamp (0 = Vĩnh Viễn)
    let expireTimestamp = 0;
    if (durationDays && Number(durationDays) > 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      const addedSec = Number(durationDays) * 86400; // 1 ngày = 86400 giây

      const currentExpire = accountsJson[username]?.expire_timestamp || 0;
      if (currentExpire > nowSec) {
        expireTimestamp = currentExpire + addedSec; // Gia hạn nối tiếp
      } else {
        expireTimestamp = nowSec + addedSec; // Tính từ hiện tại
      }
    }

    // 3. Cập nhật tài khoản vào JSON
    accountsJson[username] = {
      password: password,
      role: 'user',
      expire_timestamp: expireTimestamp,
      device_id: accountsJson[username]?.device_id || ''
    };

    // 4. Đẩy JSON mới lên GitHub Gist
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
      message: `Đã cập nhật tài khoản ${username} thành công trên Gist`,
      account: accountsJson[username]
    });

  } catch (error: any) {
    console.error('Lỗi Gist API:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}