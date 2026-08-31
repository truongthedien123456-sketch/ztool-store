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
      isLifetime
    } = body;

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: false, message: 'Chưa cấu hình GITHUB_TOKEN trên server' }, { status: 500 });
    }

    // 1. Lấy dữ liệu accounts.json hiện tại trên Gist
    const getGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}?timestamp=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ZTool-Automation-App',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
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
    // LUỒNG 1: XỬ LÝ GIA HẠN / CỘNG THÊM THỜI GIAN VÀ GHI LỊCH SỬ
    // =========================================================================
    if (action === 'EXTEND_TIME') {
      const rawKey = (accountKey || username || '').trim();
      const targetKey = Object.keys(accountsJson).find(k => k === rawKey || k.startsWith(`${rawKey}_`));

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

      // Đẩy JSON cập nhật lên GitHub Gist
      const patchGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ZTool-Automation-App',
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

      // Ghi log Supabase
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
    // LUỒNG 2: XỬ LÝ RESET HWID (XÓA MÃ THIẾT BỊ)
    // =========================================================================
    if (action === 'RESET_DEVICE') {
      const rawKey = (accountKey || username || '').trim();
      const targetKey = Object.keys(accountsJson).find(k => k === rawKey || k.startsWith(`${rawKey}_`));

      if (!targetKey || !accountsJson[targetKey]) {
        return NextResponse.json({ 
          success: false, 
          message: `Không tìm thấy tài khoản "${rawKey}" trên Gist!` 
        }, { status: 404 });
      }

      accountsJson[targetKey].device_id = 'Chưa liên kết';
      accountsJson[targetKey].last_active = 0;

      const patchGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ZTool-Automation-App',
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
    // LUỒNG 3: XỬ LÝ XÓA TÀI KHOẢN KHỎI GIST
    // =========================================================================
    if (action === 'DELETE_ACCOUNT') {
      const rawKey = (accountKey || username || '').trim();
      const targetKey = Object.keys(accountsJson).find(k => k === rawKey || k.startsWith(`${rawKey}_`));

      if (!targetKey || !accountsJson[targetKey]) {
        return NextResponse.json({ 
          success: false, 
          message: `Không tìm thấy tài khoản "${rawKey}" trên Gist!` 
        }, { status: 404 });
      }

      delete accountsJson[targetKey];

      const patchGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ZTool-Automation-App',
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
        message: `Đã xóa tài khoản "${targetKey}" khỏi Gist thành công!`
      });
    }

    // =========================================================================
    // LUỒNG 4: XỬ LÝ MUA TOOL / GIA HẠN TỪ PHÍA USER
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
      last_active: accountsJson[targetAccountKey]?.last_active || 0
    };

    const patchGistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ZTool-Automation-App',
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