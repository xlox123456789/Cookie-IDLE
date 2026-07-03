// js/save.js — 本地存讀檔（v1.9：修好，正式接上 localStorage 自動存檔）
//
// 使用瀏覽器 localStorage（不是傳統的 HTTP Cookie）。
// localStorage 容量大（一般 5MB 以上）且只存在使用者這台電腦的瀏覽器裡，
// 不會隨網路請求送出，是網頁遊戲存檔的標準做法。
//
// 這個模組會在被 import 的當下（core.js 一開始就會 import 它）
// 立刻嘗試讀檔，確保遊戲畫面與商店 UI 一開始顯示的數字就是正確的存檔進度。

import { Game } from './state.js';
import { spawnCompanion } from './companion.js';

const SAVE_KEY = 'cookieIdle.save.v1_9';
const SAVE_VERSION = 2;

// 1) 蒐集目前遊戲狀態
function collectState() {
    return {
        v: SAVE_VERSION,
        ts: Date.now(),
        cookieCount: Game.cookieCount,
        levels: { ...Game.levels },
        companionCount: Game.companions.length,
    };
}

// 2) 讀進來的資料做基本的型別/防呆檢查
function sanitizeState(s) {
    const lv = s?.levels || {};
    return {
        v: SAVE_VERSION,
        ts: Number(s?.ts) || Date.now(),
        cookieCount: Number(s?.cookieCount) || 0,
        levels: {
            count: Number(lv.count) || 0,
            speed: Number(lv.speed) || 0,
            gain: Number(lv.gain) || 0,
            eat: Number(lv.eat) || 0,
            summon: Number(lv.summon) || 0,
            choco: Number(lv.choco) || 0,
        },
        companionCount: Number(s?.companionCount) || 0,
    };
}

// 3) 把存檔資料套回遊戲狀態
function applyState(s) {
    if (!s) return;

    Game.cookieCount = s.cookieCount;
    Game.levels = { ...s.levels };

    // 同伴沒有需要保留的個別狀態（只是隨機遊走），
    // 所以讀檔時直接依存檔的數量重新召喚即可，不需要還原座標/速度。
    Game.companions.length = 0;
    for (let i = 0; i < s.companionCount; i++) {
        spawnCompanion(innerWidth, innerHeight);
    }
}

export function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(collectState()));
        console.debug(`[存檔] ${new Date().toLocaleString()}`);
    } catch (err) {
        console.error('[存檔] 失敗', err);
    }
}

export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        applyState(sanitizeState(JSON.parse(raw)));
        console.debug('[讀檔] 成功');
        return true;
    } catch (err) {
        console.error('[讀檔] 失敗', err);
        return false;
    }
}

// 啟動自動存檔：每 5 分鐘、切到背景、關閉頁面前都會存一次
export function startAutoSave(ms = 5 * 60 * 1000) {
    setInterval(saveGame, ms);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) saveGame();
    });
    window.addEventListener('beforeunload', saveGame);
}

// 手動清除存檔（例如做「重新開始」功能時可呼叫）
export function wipeSave() {
    localStorage.removeItem(SAVE_KEY);
    console.debug('[存檔] 已清除');
}

// 模組載入時立即嘗試讀檔，確保 core.js / ui.js 接下來拿到的都是讀檔後的資料
loadGame();
