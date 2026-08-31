import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const GIST_ID = process.env.GITHUB_GIST_ID || process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';
    const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN || process.env.GITHUB_TOKEN || process.env.GIST_TOKEN;

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

    const res = await fetch(`https://api.github.com/gists/${GIST_ID}?t=${Date.now()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: errText }, { status: res.status });
    }

    const data = await res.json();
    const contentRaw = data.files['accounts.json']?.content || '{}';
    const parsed = JSON.parse(contentRaw);
    const now = Date.now();
    let hasChanges = false;

    // Tự động kiểm tra: Nếu không có nhịp tim quá 15 giây -> Đổi về "Chưa liên kết"
    for (const key of Object.keys(parsed)) {
      const acc = parsed[key];
      let lastActive = Number(acc.last_active) || 0;
      
      if (lastActive > 0 && lastActive < 10000000000) {
        lastActive = lastActive * 1000;
      }

      const isOnline = lastActive > 0 && (now - lastActive) <= 15000;
      acc.is_online = isOnline;

      // Không mở tool -> Reset về Chưa liên kết
      if (!isOnline && acc.device_id && acc.device_id !== '' && acc.device_id !== 'Chưa liên kết') {
        acc.device_id = 'Chưa liên kết';
        acc.last_active = 0;
        hasChanges = true;
      }
    }

    if (hasChanges && GITHUB_TOKEN) {
      await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'ZTool-Automation-App',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: { 'accounts.json': { content: JSON.stringify(parsed, null, 2) } }
        })
      });
    }

    return NextResponse.json(
      { success: true, data: parsed },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}