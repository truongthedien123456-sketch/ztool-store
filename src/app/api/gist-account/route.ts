import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_GIST_TOKEN || process.env.GIST_TOKEN;
const GIST_ID = process.env.GIST_ID || process.env.GITHUB_GIST_ID || '21f0a39cbc434e5033d89f06e2c7d26e';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      action, 
      accountKey, 
      username, 
      password, 
      durationDays, 
      tool_code,
      addDays,
      addHours,
      isLifetime,
      device_id,
      hwid,
      is_online
    } = body;

    const rawKey = (accountKey || username || '').trim();

    // 1. Đọc dữ liệu accounts.json an toàn (Ưu tiên RAW URL để tránh Rate Limit 403)
    let accountsJson: Record<string, any> = {};
    const rawRes = await fetch(`https://gist.githubusercontent.com/raw/${GIST_ID}/accounts.json?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (rawRes.ok) {
      accountsJson = await rawRes.json();
    } else if (GITHUB_TOKEN) {
      const getGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'ZTool-Automation-App',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (getGistRes.ok) {
        const gistData = await getGistRes.json();
        accountsJson = JSON.parse(gistData.files['accounts.json']?.content || '{}');
      }
    }

    // =========================================================================
    // LUỒNG 1: XỬ LÝ RESET HWID (BẤM NÚT RESET TRÊN ADMIN PANEL HOẶC THOÁT TOOL)
    // =========================================================================
    if (action === 'RESET_DEVICE' || action === 'RESET_HWID') {
      if (!rawKey) {
        return NextResponse.json({ success: false, message: 'Thiếu tên tài khoản' }, { status: 400 });
      }

      // 1. Đồng bộ tức thì về 'Chưa liên kết' trên Supabase Realtime
      try {
        await supabase.from('tool_accounts').upsert({
          account_key: rawKey,
          device_id: 'Chưa liên kết',
          last_active: 0,
          is_online: false
        }, { onConflict: 'account_key' });
      } catch (e) {}

      // 2. Tìm key và ghi đè vào file JSON Gist
      let targetKey = Object.keys(accountsJson).find(k => k.toLowerCase() === rawKey.toLowerCase() || k.toLowerCase().startsWith(`${rawKey.toLowerCase()}_`));

      if (targetKey && accountsJson[targetKey]) {
        accountsJson[targetKey].device_id = 'Chưa liên kết';
        accountsJson[targetKey].last_active = 0;
        accountsJson[targetKey].is_online = false;

        if (GITHUB_TOKEN) {
          try {
            await fetch(`https://api.github.com/gists/${GIST_ID}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'ZTool-Automation-App',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                files: { 'accounts.json': { content: JSON.stringify(accountsJson, null, 2) } }
              })
            });
          } catch (err) {}
        }
      }

      return NextResponse.json({
        success: true,
        message: `Đã reset HWID thành công cho tài khoản ${rawKey}!`
      });
    }

    // =========================================================================
    // LUỒNG 2: XỬ LÝ CẬP NHẬT THIẾT BỊ (UPDATE_DEVICE / BIND_DEVICE) TỪ TOOL
    // =========================================================================
    if (action === 'UPDATE_DEVICE' || action === 'BIND_DEVICE') {
      const clientHWID = (device_id || hwid || '').trim();

      // Lưu ngay vào Database Supabase
      try {
        await supabase.from('tool_accounts').upsert({
          account_key: rawKey,
          device_id: clientHWID || 'Chưa liên kết',
          last_active: Date.now(),
          is_online: is_online !== undefined ? is_online : true
        }, { onConflict: 'account_key' });
      } catch (e) {}

      let targetKey = Object.keys(accountsJson).find(k => k.toLowerCase() === rawKey.toLowerCase() || k.toLowerCase().startsWith(`${rawKey.toLowerCase()}_`));

      if (targetKey && accountsJson[targetKey]) {
        if (clientHWID) accountsJson[targetKey].device_id = clientHWID;
        accountsJson[targetKey].last_active = Date.now();
        accountsJson[targetKey].is_online = is_online !== undefined ? is_online : true;

        if (GITHUB_TOKEN) {
          try {
            await fetch(`https://api.github.com/gists/${GIST_ID}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'ZTool-Automation-App',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                files: { 'accounts.json': { content: JSON.stringify(accountsJson, null, 2) } }
              })
            });
          } catch (err) {}
        }
      }

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật HWID thành công!`,
        device_id: clientHWID
      });
    }

    // =========================================================================
    // LUỒNG 3: XỬ LÝ GIA HẠN / CỘNG THÊM THỜI GIAN VÀ GHI LỊCH SỬ
    // =========================================================================
    if (action === 'EXTEND_TIME') {
      const targetKey = Object.keys(accountsJson).find(k => k.toLowerCase() === rawKey.toLowerCase() || k.toLowerCase().startsWith(`${rawKey.toLowerCase()}_`));

      if (!targetKey || !accountsJson[targetKey]) {
        return NextResponse.json({ 
          success: false, 
          message: `Không tìm thấy tài khoản "${rawKey}" trên Gist!` 
        }, { status: 404 });
      }

      let newTimestamp = accountsJson[targetKey].expire_timestamp || 0;
      const nowSec = Math.floor(Date.now() / 1000);
      let logTitle = '';

      if (isLifetime) {
        newTimestamp = 0; // Vĩnh viễn
        logTitle = `Bạn đã được Admin nâng cấp lên gói Vĩnh Viễn (Key: ${targetKey})`;
      } else {
        const days = Number(addDays) || 0;
        const hours = Number(addHours) || 0;
        const totalAddedSec = (days * 86400) + (hours * 3600);

        if (totalAddedSec <= 0) {
          return NextResponse.json({ success: false, message: 'Thời gian gia hạn phải lớn hơn 0!' }, { status: 400 });
        }

        const baseSec = (newTimestamp > nowSec) ? newTimestamp : nowSec;
        newTimestamp = baseSec + totalAddedSec;

        const timeParts = [];
        if (days > 0) timeParts.push(`${days} ngày`);
        if (hours > 0) timeParts.push(`${hours} giờ`);
        const timeText = timeParts.join(' ');

        logTitle = `Bạn đã được Admin gia hạn thêm ${timeText} (Key: ${targetKey})`;
      }

      accountsJson[targetKey].expire_timestamp = newTimestamp;

      if (GITHUB_TOKEN) {
        await fetch(`https://api.github.com/gists/${GIST_ID}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'ZTool-Automation-App',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: { 'accounts.json': { content: JSON.stringify(accountsJson, null, 2) } }
          })
        });
      }

      const baseOwnerUsername = targetKey.split('_')[0];
      await supabase.from('transactions').insert([{
        username: baseOwnerUsername,
        type: 'EXTEND',
        title: logTitle,
        amount: 0,
        status: 'Thành công'
      }]);

      return NextResponse.json({
        success: true,
        message: `Đã gia hạn thành công cho tài khoản ${targetKey}!`,
        newExpireTimestamp: newTimestamp
      });
    }

    // =========================================================================
    // LUỒNG 4: XỬ LÝ XÓA TÀI KHOẢN KHỎI GIST VÀ SUPABASE
    // =========================================================================
    if (action === 'DELETE_ACCOUNT') {
      const targetKey = Object.keys(accountsJson).find(k => k.toLowerCase() === rawKey.toLowerCase() || k.toLowerCase().startsWith(`${rawKey.toLowerCase()}_`));

      if (!targetKey || !accountsJson[targetKey]) {
        return NextResponse.json({ 
          success: false, 
          message: `Không tìm thấy tài khoản "${rawKey}" trên Gist!` 
        }, { status: 404 });
      }

      delete accountsJson[targetKey];
      try {
        await supabase.from('tool_accounts').delete().eq('account_key', targetKey);
      } catch (e) {}

      if (GITHUB_TOKEN) {
        await fetch(`https://api.github.com/gists/${GIST_ID}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'ZTool-Automation-App',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: { 'accounts.json': { content: JSON.stringify(accountsJson, null, 2) } }
          })
        });
      }

      return NextResponse.json({
        success: true,
        message: `Đã xóa tài khoản "${targetKey}" khỏi Gist thành công!`
      });
    }

    // =========================================================================
    // LUỒNG 5: XỬ LÝ MUA TOOL / GIA HẠN TỪ PHÍA USER
    // =========================================================================
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Thiếu username hoặc password' }, { status: 400 });
    }

    const targetToolCode = tool_code ? tool_code.trim() : '';
    let targetAccountKey = username;
    const matchedAccount = Object.keys(accountsJson).find(key => {
      const acc = accountsJson[key];
      const accToolCode = (acc.tool_code || acc.toolCode || '').trim();
      const isOwner = key === username || key.startsWith(`${username}_`);
      return isOwner && accToolCode === targetToolCode;
    });

    if (matchedAccount) {
      targetAccountKey = matchedAccount;
    } else if (accountsJson[username] && (!accountsJson[username].tool_code && !accountsJson[username].toolCode)) {
      targetAccountKey = username;
    } else {
      const cleanToolCode = targetToolCode ? targetToolCode.replace(/[^a-zA-Z0-9]/g, '_') : 'tool';
      targetAccountKey = `${username}_${cleanToolCode}`;
    }

    const currentExpire = accountsJson[targetAccountKey]?.expire_timestamp || 0;
    if (currentExpire === 0 && accountsJson[targetAccountKey]) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tài khoản này đã sở hữu gói Vĩnh Viễn, không thể gia hạn thêm!' 
      }, { status: 400 });
    }

    let expireTimestamp = 0;
    const nowSec = Math.floor(Date.now() / 1000);

    if (durationDays && Number(durationDays) > 0) {
      const addedSec = Number(durationDays) * 86400;
      if (currentExpire > nowSec) {
        expireTimestamp = currentExpire + addedSec;
      } else {
        expireTimestamp = nowSec + addedSec;
      }
    }

    accountsJson[targetAccountKey] = {
      password: password,
      role: accountsJson[targetAccountKey]?.role || 'user',
      tool_code: targetToolCode,
      expire_timestamp: expireTimestamp,
      device_id: accountsJson[targetAccountKey]?.device_id || 'Chưa liên kết',
      last_active: accountsJson[targetAccountKey]?.last_active || 0,
      is_online: false
    };

    if (GITHUB_TOKEN) {
      await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'ZTool-Automation-App',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: { 'accounts.json': { content: JSON.stringify(accountsJson, null, 2) } }
        })
      });
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