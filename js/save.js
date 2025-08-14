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

        // 把目前畫面上的同伴序列化（若沒有就存空陣列）
        companions: Array.isArray(window.companions)
            ? window.companions.map((c, i) => ({
                id: c.id ?? i,
                type: c.type ?? 'MAN2',
                x: (c.x ?? c.pos?.x ?? 0),
                y: (c.y ?? c.pos?.y ?? 0),
                lv: (c.lv ?? c.level ?? 1),
            }))
            : [],

        upgrades: window.upgrades || {},
    };
}

// 2) 把狀態套回遊戲（必要時可做版本轉換）
function applyState(s) {
    if (!s) return;

    // 先還原數值
    window.butter_cookie_count = s.butter_cookie_count ?? 0;
    window.butter_cookie_CountLevel = s.butter_cookie_CountLevel ?? 0;
    window.butter_cookie_butterSpeedLevel = s.butter_cookie_butterSpeedLevel ?? 0;
    window.butter_cookie_butterGainLevel = s.butter_cookie_butterGainLevel ?? 0;
    window.eatSpeedLevel = s.eatSpeedLevel ?? 0;
    window.summonLevel = s.summonLevel ?? 0;
    window.upgrades = s.upgrades || {};

    // 清空舊同伴（保留同一個陣列參考）
    if (Array.isArray(window.companions)) window.companions.length = 0;

    // 生成清單：有存檔就用存檔；否則依等級補數量
    const list = (Array.isArray(s.companions) && s.companions.length)
        ? s.companions
        : Array.from({ length: s.summonLevel ?? 0 }, () => ({ type: 'MAN2', lv: 1 }));

    // --- 工具：確保數值是數字 ---
    const num = (v, d = 0) => Number.isFinite(v) ? v : d;

    // --- 核心：初始化座標/速度 + NaN 防護 + 啟動移動 ---
    function armToMove(c, saved) {
        // 1) 同步 pos 與頂層座標（兩邊都要有數字）
        if (!c.pos || typeof c.pos !== 'object') c.pos = {};
        c.pos.x = 0; c.pos.y = 0;
        c.x = 0; c.y = 0;

        // 2) 速度向量與常見欄位保底
        c.vx = 0; c.vy = 0;
        c.speed = num(c.speed, 1.5);
        if (typeof c.maxSpeed === 'number' && c.maxSpeed < c.speed) c.maxSpeed = c.speed;
        // 有這些欄位就補一下（避免程式用別名）
        if (!Number.isFinite(c.moveSpeed)) c.moveSpeed = c.speed;
        if (!Number.isFinite(c.runSpeed)) c.runSpeed = c.speed;

        // 3) 清旗標，避免被暫停
        ['stun', 'frozen', 'paused', 'isEating', 'idle', 'hold'].forEach(k => { if (k in c) c[k] = false; });

        // 等級
        if (saved?.lv != null) c.lv = saved.lv;

        // 4) 設定目標（有 hero 就跟 hero）
        if (typeof c.setTarget === 'function' && window.hero) c.setTarget(window.hero);
        else if (window.hero) c.target = window.hero;
        else c.target = { x: innerWidth / 2, y: innerHeight / 2 };

        // 5) 連續數幀做 NaN 防護與啟動位移（避免初始化順序導致 NaN 傳染）
        // 若與主角同點，輕推 1px 以免向量長度=0
        if (window.hero && c.x === window.hero.x && c.y === window.hero.y) {
            c.x += 1;
        }

        let frames = 8;
        const kick = () => {
            // NaN 防護：把所有可能被用到的欄位強制成數字
            c.pos.x = num(c.pos.x, 0);
            c.pos.y = num(c.pos.y, 0);
            c.x = num(c.x, c.pos.x);
            c.y = num(c.y, c.pos.y);
            c.vx = num(c.vx, 0);
            c.vy = num(c.vy, 0);
            c.speed = num(c.speed, 1.5);

            // 根據目標給一個速度向量（即使在 0,0 也不會是 NaN）
            const tgt = window.hero || c.target || { x: 0, y: 0 };
            const dx = num(tgt.x, 0) - c.x;
            const dy = num(tgt.y, 0) - c.y;
            const len = Math.hypot(dx, dy) || 1;
            const spd = c.speed;

            // 常見欄位全部同步一份，避免你的 update() 取不同名稱
            c.vx = (dx / len) * spd;
            c.vy = (dy / len) * spd;
            if ('dx' in c) c.dx = c.vx;
            if ('dy' in c) c.dy = c.vy;
            if ('dirX' in c) c.dirX = dx / len;
            if ('dirY' in c) c.dirY = dy / len;

            // 若有 API 就呼叫一下
            if (typeof c.moveTo === 'function') c.moveTo(num(tgt.x, 0), num(tgt.y, 0));
            if (typeof c.follow === 'function' && window.hero) c.follow(window.hero);
            if (typeof c.wake === 'function') c.wake();

            if (--frames > 0) requestAnimationFrame(kick);
        };
        requestAnimationFrame(kick);
    }

    // 先生 → 再武裝成會動
    if (typeof window.spawnCompanion === 'function') {
        list.forEach(saved => {
            window.spawnCompanion(innerWidth, innerHeight);
            const c = window.companions[window.companions.length - 1];
            if (c) armToMove(c, saved);
        });
    }
}
function sanitizeState(s) {
    return {
        v: 1,
        ts: Number(s?.ts) || Date.now(),
        butter_cookie_count: Number(s?.butter_cookie_count) || 0,
        butter_cookie_CountLevel: Number(s?.butter_cookie_CountLevel) || 0,
        butter_cookie_butterSpeedLevel: Number(s?.butter_cookie_butterSpeedLevel) || 0,
        butter_cookie_butterGainLevel: Number(s?.butter_cookie_butterGainLevel) || 0,
        eatSpeedLevel: Number(s?.eatSpeedLevel) || 0,
        summonLevel: Number(s?.summonLevel) || 0,
        companions: Array.isArray(s?.companions) ? s.companions : [],
        upgrades: s?.upgrades ?? {}
    };
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
        const safe = sanitizeState(JSON.parse(raw));
        applyState(safe);
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