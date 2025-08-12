const SAVE_KEY = 'cookieIdle.save';
const SAVE_VERSION = 1;
// 1) 蒐集遊戲狀態 → 放進一個物件
function collectState() {
    return {
        v: SAVE_VERSION,
        ts: Date.now(),
        // 依你的全域變數填進來（可再自行補）
        butter_cookie_count: window.butter_cookie_count ?? 0,
        butter_cookie_CountLevel: window.butter_cookie_CountLevel ?? 0,
        butter_cookie_butterSpeedLevel: window.butter_cookie_butterSpeedLevel ?? 0,
        butter_cookie_butterGainLevel: window.butter_cookie_butterGainLevel ?? 0,
        eatSpeedLevel: window.eatSpeedLevel ?? 0,
        summonLevel: window.summonLevel ?? 0,

        // 例：同伴/商店解鎖等，如需還原位置/等級就序列化必要欄位
        companions: Array.isArray(window.companions)
            ? window.companions.map(c => ({ type: c.type, x: c.x, y: c.y, lv: c.lv }))
            : [],
        upgrades: window.upgrades || {},
    };
}

// 2) 把狀態套回遊戲（必要時可做版本轉換）
function applyState(s) {
    if (!s) return;
    window.butter_cookie_count = s.butter_cookie_count ?? 0;
    window.butter_cookie_CountLevel = s.butter_cookie_CountLevel ?? 0;
    window.butter_cookie_butterSpeedLevel = s.butter_cookie_butterSpeedLevel ?? 0;
    window.butter_cookie_butterGainLevel = s.butter_cookie_butterGainLevel ?? 0;
    window.eatSpeedLevel = s.eatSpeedLevel ?? 0;
    window.summonLevel = s.summonLevel ?? 0;

    // 重建同伴（若你有專用的清除/生成函式，換成你的）
    if (Array.isArray(s.companions)) {
        if (Array.isArray(window.companions)) window.companions.length = 0;
        if (typeof window.spawnCompanion === 'function') {
            s.companions.forEach(c => window.spawnCompanion(c.type, c));
        }
    }
    window.upgrades = s.upgrades || {};
}

// 3) 存檔 / 讀檔 / 啟動自動存
export function saveGame() {
    try {
        const state = collectState();
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        console.debug(`[Save] ${new Date(state.ts).toLocaleString()}`);
    } catch (err) {
        console.error('[Save] 失敗', err);
    }
}

export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        applyState(JSON.parse(raw));
        console.debug('[Load] OK');
        return true;
    } catch (err) {
        console.error('[Load] 失敗', err);
        return false;
    }
}

export function startAutoSave(ms = 5 * 60 * 1000) {
    saveGame();                    // 啟動時先存一次
    setInterval(saveGame, ms);     // 每 5 分鐘存一次
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) saveGame();  // 切到背景時也存一次
    });
    window.addEventListener('beforeunload', saveGame); // 關頁前存
}

// 4) 可選：清存檔
export function wipeSave() {
    localStorage.removeItem(SAVE_KEY);
    console.debug('[Save] cleared');
}

// 5) 預設啟動：讀檔→自動存
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    startAutoSave(); // 5 分鐘
});