import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { toolId, toolCode, newStatus } = await req.json();

    const { data: currentTool } = await supabase
      .from('tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (!currentTool) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy Tool' }, { status: 404 });
    }

    const now = new Date();

    if (newStatus === 'Tạm ngưng') {
      // 1. BẮT ĐẦU TẠM NGƯNG: Ghi lại thời điểm bắt đầu đóng băng
      await supabase
        .from('tools')
        .update({ status: 'Tạm ngưng', paused_at: now.toISOString() })
        .eq('id', toolId);

      return NextResponse.json({ success: true, message: 'Đã tạm ngưng tool và đóng băng thời hạn!' });
    } else {
      // 2. MỞ LẠI HOẠT ĐỘNG: Tính số giây đã bảo trì và bù giờ tự động cho tất cả key
      let addedSeconds = 0;
      if (currentTool.paused_at) {
        const pausedDate = new Date(currentTool.paused_at);
        addedSeconds = Math.floor((now.getTime() - pausedDate.getTime()) / 1000);
      }

      // Cập nhật trạng thái Tool trên Supabase
      await supabase
        .from('tools')
        .update({ status: 'Đang hoạt động', paused_at: null })
        .eq('id', toolId);

      // Nếu có thời gian bảo trì và có bù giờ, cộng thêm vào GitHub Gist
      if (addedSeconds > 0 && toolCode) {
        const gistRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/get-gist`, { cache: 'no-store' });
        if (gistRes.ok) {
          const gistJson = await gistRes.json();
          if (gistJson.success && gistJson.data) {
            const accounts = gistJson.data;
            let hasChange = false;

            for (const key of Object.keys(accounts)) {
              const acc = accounts[key];
              const accToolCode = (acc.tool_code || acc.toolCode || '').toLowerCase();
              if (accToolCode === toolCode.toLowerCase() && acc.expire_timestamp > 0) {
                // Cộng thêm đúng số giây đã đóng băng
                acc.expire_timestamp += addedSeconds;
                hasChange = true;
              }
            }

            // Lưu lại Gist đã bù giờ
            if (hasChange) {
              const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;
              const GIST_ID = process.env.GITHUB_GIST_ID;
              await fetch(`https://api.github.com/gists/${GIST_ID}`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${GITHUB_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  files: { 'accounts.json': { content: JSON.stringify(accounts, null, 2) } }
                })
              });
            }
          }
        }
      }

      const hours = Math.floor(addedSeconds / 3600);
      const minutes = Math.floor((addedSeconds % 3600) / 60);
      return NextResponse.json({ 
        success: true, 
        message: `Đã mở lại hoạt động! Tự động bù ${hours}h ${minutes}m cho toàn bộ khách hàng.` 
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}