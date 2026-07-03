// js/ui.js — 商店 UI 與互動邏輯（v1.9）
// 變更重點：
//  1. 不再有「一進畫面就把 cookieCount 強制歸零」的舊測試碼
//     （這行是先前存檔讀了也沒用的原因之一）。
//  2. 六個升級按鈕的邏輯合併成同一個 tryUpgrade()，
//     花費/上限統一從 config.js 的 UPGRADE_CONFIG 讀取，不再各自寫死數字。

import { formatNumber } from './utils.js';
import { Game } from './state.js';
import { UPGRADE_CONFIG, getUpgradeCost } from './config.js';
import { updateCookieCountHUD, updateCookieOnFieldHUD } from './hud.js';
import { spawnCompanion } from './companion.js';
import { scheduleNextSpawn } from './core.js';

console.log('ui.js loaded');

// 各升級項目對應的 DOM id
const UPGRADE_DOM = {
    count: { lv: 'lv-count', cost: 'cost-count', btn: 'btn-count' },
    speed: { lv: 'lv-speed', cost: 'cost-speed', btn: 'btn-speed' },
    gain: { lv: 'lv-gain', cost: 'cost-gain', btn: 'btn-gain' },
    eat: { lv: 'lv-eat', cost: 'cost-eat', btn: 'btn-eat' },
    summon: { lv: 'lv-summon', cost: 'cost-summon', btn: 'btn-summon' },
    choco: { lv: 'lv-choco', cost: 'cost-choco', btn: 'btn-choco' },
};

function updateShopUI() {
    updateCookieCountHUD();

    for (const key in UPGRADE_DOM) {
        const { lv, cost, btn } = UPGRADE_DOM[key];
        const level = Game.levels[key];
        const max = UPGRADE_CONFIG[key].max;

        document.getElementById(lv).textContent = level;
        document.getElementById(cost).textContent = formatNumber(getUpgradeCost(key));

        const btnEl = document.getElementById(btn);
        const maxed = level >= max;
        btnEl.disabled = maxed;
        btnEl.textContent = maxed ? 'MAX' : '+1';
        btnEl.style.opacity = maxed ? '0.5' : '1';
        btnEl.style.cursor = maxed ? 'default' : 'pointer';
    }
}

// 嘗試升級某一項目；成功時可傳入 onSuccess 做額外處理（例如重新排程生成）
function tryUpgrade(key, onSuccess) {
    const max = UPGRADE_CONFIG[key].max;
    if (Game.levels[key] >= max) return;

    const cost = getUpgradeCost(key);
    if (Game.cookieCount < cost) return;

    Game.cookieCount -= cost;
    Game.levels[key]++;
    updateShopUI();
    if (onSuccess) onSuccess();
}

window.addEventListener('DOMContentLoaded', () => {
    // 初次繪製商店 UI（此時 Game 狀態已由 save.js 讀檔完成）
    updateShopUI();
    updateCookieOnFieldHUD();

    document.getElementById('btn-count').addEventListener('click', () => tryUpgrade('count'));
    document.getElementById('btn-speed').addEventListener('click', () => tryUpgrade('speed', scheduleNextSpawn));
    document.getElementById('btn-gain').addEventListener('click', () => tryUpgrade('gain'));
    document.getElementById('btn-eat').addEventListener('click', () => tryUpgrade('eat'));
    document.getElementById('btn-summon').addEventListener('click', () =>
        tryUpgrade('summon', () => spawnCompanion(innerWidth, innerHeight))
    );
    document.getElementById('btn-choco').addEventListener('click', () => tryUpgrade('choco'));
    // 巧克力餅乾解鎖後的實際遊戲效果依需求暫不實作，僅保留購買/扣費行為。

    // 商店開關邏輯
    const popup = document.getElementById('popup');
    const openBtn = document.getElementById('openButton');
    const closeBtn = document.querySelector('#popup .closeBtn');

    openBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.style.display = 'none';
        document.body.style.overflow = '';
    });
    document.addEventListener('click', e => {
        if (popup.style.display === 'block') {
            const r = popup.getBoundingClientRect();
            if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
            ) {
                popup.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.style.display === 'block') {
            e.preventDefault();
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});
