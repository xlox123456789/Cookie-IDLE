// js/state.js — 遊戲全域狀態（v1.9 新增）
// 統一所有可變的遊戲資料，取代原本散落各處的 window.xxx 全域變數。

export const Game = {
    cookieCount: 0,        // 玩家目前擁有的餅乾數（貨幣）

    levels: {               // 各項升級等級
        count: 0,          // 奶油餅乾出現數量
        speed: 0,          // 奶油餅乾出現速度
        gain: 0,           // 奶油餅乾獲得數量
        eat: 0,            // 吃餅乾的速度
        summon: 0,         // 招喚小夥伴
        choco: 0,          // 解鎖巧克力餅乾（效果尚未實作）
    },

    cookieOnField: 0,       // 目前畫面上存在的餅乾數量（HUD 用）

    hero: null,              // 主角 Eater 實例（core.js 建立後寫入）
    companions: [],          // 同伴陣列（Companion 實例）
};

// 保留掛在 window 上，方便瀏覽器 console 除錯時直接存取 window.Game
window.Game = Game;
