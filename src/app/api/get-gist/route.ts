import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const GIST_ID = process.env.GITHUB_GIST_ID || process.env.GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';
    
    // 1. Lấy danh sách accounts từ RAW URL
    const rawRes = await fetch(`https://gist.githubusercontent.com/raw/${GIST_ID}/accounts.json?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!rawRes.ok) {
      return NextResponse.json({ success: false, error: 'Không thể tải accounts.json' }, { status: 500 });
    }

    const parsed = await rawRes.json();

    // 2. Lấy danh sách thiết bị Online và HWID Realtime từ Supabase
    const { data: activeSessions } = await supabase
      .from('tool_accounts')
      .select('account_key, device_id, last_active, is_online');

    const now = Date.now();
    const sessionMap = new Map();
    if (activeSessions) {
      activeSessions.forEach(s => sessionMap.set(s.account_key.toLowerCase(), s));
    }

    // 3. Hợp nhất dữ liệu hiển thị lên Admin Panel
    for (const key of Object.keys(parsed)) {
      const dbInfo = sessionMap.get(key.toLowerCase());
      let lastActive = 0;
      let dbHWID = '';

      if (dbInfo) {
        lastActive = Number(dbInfo.last_active) || 0;
        dbHWID = dbInfo.device_id || '';
      } else {
        lastActive = Number(parsed[key].last_active) || 0;
        dbHWID = parsed[key].device_id || '';
      }

      // Online nếu trong 15 giây gần nhất có gửi nhịp tim
      const isOnline = lastActive > 0 && (now - lastActive) <= 15000;
      parsed[key].is_online = isOnline;

      if (isOnline) {
        parsed[key].device_id = (dbHWID && dbHWID !== 'Chưa liên kết') ? dbHWID : (parsed[key].device_id || 'Chưa liên kết');
      } else {
        // Nếu Offline -> Tự động chuyển về Chưa liên kết
        parsed[key].device_id = 'Chưa liên kết';
      }
    }

    return NextResponse.json({ success: true, data: parsed }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}