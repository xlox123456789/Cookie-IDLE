// js/utils.js 已經 export function formatNumber

// js/ui.js
import { formatNumber } from './utils.js';
import { spawnCompanion } from './companion.js';
console.log('ui.js loaded');
// 畫面中「目前存在」的奶油餅乾數
window.cookie_onscreen = 0;

export function cookie_onscreen_updateHUD() {
    const el = document.getElementById('cookie_onscreen_count');
    if (el) el.textContent = String(window.cookie_onscreen);
}

// 生成一個奶油餅乾（Spawn）時呼叫
export function cookie_onscreen_track_spawn() {
    window.cookie_onscreen++;
    cookie_onscreen_updateHUD();
}

// 奶油餅乾被吃掉/離場/銷毀（Despawn）時呼叫
export function cookie_onscreen_track_despawn() {
    if (window.cookie_onscreen > 0) {
        window.cookie_onscreen--;
        cookie_onscreen_updateHUD();
    }
}

// （可選）掃描全部物件重新計算
export function cookie_onscreen_rescan(list) {
    try {
        window.cookie_onscreen = list.filter(
            o => o && o.active !== false && (o.type === 'butter_cookie' || o.kind === 'butter_cookie')
        ).length;
    } catch (e) { }
    cookie_onscreen_updateHUD();
}

window.addEventListener('DOMContentLoaded', () => {
    // 1. 測試模式：初始 200 塊奶油餅乾
    window.butter_cookie_count = 1000000000;
    //window.butter_cookie_count = 200;
    document.getElementById('count').textContent = formatNumber(window.butter_cookie_count);

    // 2. 升級等級 & 最大值常數
    const butter_cookie_MAX_COUNT_LEVEL = 30;
    const butter_cookie_MAX_SPEED_LEVEL = 50;
    const butter_cookie_MAX_GAIN_LEVEL = 400;
    const butter_cookie_MAX_EAT_LEVEL = 30;
    const butter_cookie_MAX_SUMMON_LEVEL = 3;
    const butter_cookie_MAX_CHOCO_UNLOCK_LEVEL = 1;

    // 讀取或初始化本地等級變數
    let butter_cookie_CountLevel = window.butter_cookie_CountLevel || 0;
    let butter_cookie_butterSpeedLevel = window.butter_cookie_butterSpeedLevel || 0;
    let butter_cookie_butterGainLevel = window.butter_cookie_butterGainLevel || 0;
    let eatSpeedLevel = window.eatSpeedLevel || 0;
    let summonLevel = window.summonLevel || 0;
    let cookie_chocolate_unlockLevel = window.cookie_chocolate_unlockLevel || 0;

    // 3. 更新商店 UI：LV/最大、花費、按鈕狀態、左上角計數
    function updateShopUI() {
        // 同步全域等級
        window.butter_cookie_CountLevel = butter_cookie_CountLevel;
        window.butter_cookie_butterSpeedLevel = butter_cookie_butterSpeedLevel;
        window.butter_cookie_butterGainLevel = butter_cookie_butterGainLevel;
        window.eatSpeedLevel = eatSpeedLevel;
        window.summonLevel = summonLevel;
        window.cookie_chocolate_unlockLevel = cookie_chocolate_unlockLevel;

        // 左上角計數
        document.getElementById('count').textContent = formatNumber(window.butter_cookie_count);

        // LV / MAX 顯示
        document.getElementById('lv-count').textContent = butter_cookie_CountLevel;
        document.getElementById('lv-speed').textContent = butter_cookie_butterSpeedLevel;
        document.getElementById('lv-gain').textContent = butter_cookie_butterGainLevel;
        document.getElementById('lv-eat').textContent = eatSpeedLevel;
        document.getElementById('lv-summon').textContent = summonLevel;
        document.getElementById('lv-choco').textContent = cookie_chocolate_unlockLevel;

        // 計算花費
        const costCount = Math.floor(10 * Math.pow(1.5, butter_cookie_CountLevel));
        const costSpeed = Math.floor(10 * Math.pow(1.5, butter_cookie_butterSpeedLevel));
        const costGain = Math.floor(500 * Math.pow(5, butter_cookie_butterGainLevel));
        const costEat = Math.floor(100 * Math.pow(1.5, eatSpeedLevel));
        const costSummon = Math.floor(200 * Math.pow(8, summonLevel));
        const costChoco = 1e4;

        // 顯示花費
        document.getElementById('cost-count').textContent = formatNumber(costCount);
        document.getElementById('cost-speed').textContent = formatNumber(costSpeed);
        document.getElementById('cost-gain').textContent = formatNumber(costGain);
        document.getElementById('cost-eat').textContent = formatNumber(costEat);
        document.getElementById('cost-summon').textContent = formatNumber(costSummon);
        document.getElementById('cost-choco').textContent = formatNumber(costChoco);

        // 按鈕狀態：出現次數
        const btnCount = document.getElementById('btn-count');
        if (butter_cookie_CountLevel >= butter_cookie_MAX_COUNT_LEVEL) {
            btnCount.disabled = true;
            btnCount.textContent = 'MAX';
            btnCount.style.opacity = '0.5';
            btnCount.style.cursor = 'default';
        } else {
            btnCount.disabled = false;
            btnCount.textContent = '+1';
            btnCount.style.opacity = '1';
            btnCount.style.cursor = 'pointer';
        }

        // 按鈕狀態：出現速度
        const btnSpeed = document.getElementById('btn-speed');
        if (butter_cookie_butterSpeedLevel >= butter_cookie_MAX_SPEED_LEVEL) {
            btnSpeed.disabled = true;
            btnSpeed.textContent = 'MAX';
            btnSpeed.style.opacity = '0.5';
            btnSpeed.style.cursor = 'default';
        } else {
            btnSpeed.disabled = false;
            btnSpeed.textContent = '+1';
            btnSpeed.style.opacity = '1';
            btnSpeed.style.cursor = 'pointer';
        }

        // 按鈕狀態：獲得數量
        const btnGain = document.getElementById('btn-gain');
        if (butter_cookie_butterGainLevel >= butter_cookie_MAX_GAIN_LEVEL) {
            btnGain.disabled = true;
            btnGain.textContent = 'MAX';
            btnGain.style.opacity = '0.5';
            btnGain.style.cursor = 'default';
        } else {
            btnGain.disabled = false;
            btnGain.textContent = '+1';
            btnGain.style.opacity = '1';
            btnGain.style.cursor = 'pointer';
        }

        // 按鈕狀態：吃餅乾速度
        const btnEat = document.getElementById('btn-eat');
        if (eatSpeedLevel >= butter_cookie_MAX_EAT_LEVEL) {
            btnEat.disabled = true;
            btnEat.textContent = 'MAX';
            btnEat.style.opacity = '0.5';
            btnEat.style.cursor = 'default';
        } else {
            btnEat.disabled = false;
            btnEat.textContent = '+1';
            btnEat.style.opacity = '1';
            btnEat.style.cursor = 'pointer';
        }

        // 按鈕狀態：召喚小夥伴
        const btnSummon = document.getElementById('btn-summon');
        if (summonLevel >= butter_cookie_MAX_SUMMON_LEVEL) {
            btnSummon.disabled = true;
            btnSummon.textContent = 'MAX';
            btnSummon.style.opacity = '0.5';
            btnSummon.style.cursor = 'default';
        } else {
            btnSummon.disabled = false;
            btnSummon.textContent = '+1';
            btnSummon.style.opacity = '1';
            btnSummon.style.cursor = 'pointer';
        }
        // 按鈕狀態：解鎖巧克力餅乾
        const btnChoco = document.getElementById('btn-choco');
        if (cookie_chocolate_unlockLevel >= butter_cookie_MAX_CHOCO_UNLOCK_LEVEL) {
            btnChoco.disabled = true;
            btnChoco.textContent = 'MAX';
            btnChoco.style.opacity = '0.5';
            btnChoco.style.cursor = 'default';
        } else {
            btnChoco.disabled = false;
            btnChoco.textContent = '+1';
            btnChoco.style.opacity = '1';
            btnChoco.style.cursor = 'pointer';
        }
    }

    // 初次更新
    updateShopUI();

    // 4. 綁定「出現次數」升級
    document.getElementById('btn-count').addEventListener('click', () => {
        if (butter_cookie_CountLevel >= butter_cookie_MAX_COUNT_LEVEL) return;
        const cost = Math.floor(10 * Math.pow(1.5, butter_cookie_CountLevel));
        if (window.butter_cookie_count < cost) return;
        window.butter_cookie_count -= cost;
        butter_cookie_CountLevel++;
        updateShopUI();
    });

    // 5. 綁定「出現速度」升級
    document.getElementById('btn-speed').addEventListener('click', () => {
        if (butter_cookie_butterSpeedLevel >= butter_cookie_MAX_SPEED_LEVEL) return;
        const cost = Math.floor(10 * Math.pow(1.5, butter_cookie_butterSpeedLevel));
        if (window.butter_cookie_count < cost) return;
        window.butter_cookie_count -= cost;
        butter_cookie_butterSpeedLevel++;
        updateShopUI();
        if (typeof window.scheduleNextSpawn === 'function') {
            window.scheduleNextSpawn();
        }
    });

    // 6. 綁定「獲得數量」升級
    document.getElementById('btn-gain').addEventListener('click', () => {
        if (butter_cookie_butterGainLevel >= butter_cookie_MAX_GAIN_LEVEL) return;
        const cost = Math.floor(500 * Math.pow(5, butter_cookie_butterGainLevel));
        if (window.butter_cookie_count < cost) return;
        window.butter_cookie_count -= cost;
        butter_cookie_butterGainLevel++;
        updateShopUI();
        if (typeof window.scheduleNextSpawn === 'function') {
            window.scheduleNextSpawn();
        }
    });

    // 7. 綁定「吃餅乾速度」升級
    document.getElementById('btn-eat').addEventListener('click', () => {
        if (eatSpeedLevel >= butter_cookie_MAX_EAT_LEVEL) return;
        const cost = Math.floor(100 * Math.pow(1.5, eatSpeedLevel));
        if (window.butter_cookie_count < cost) return;
        window.butter_cookie_count -= cost;
        eatSpeedLevel++;
        updateShopUI();
    });

    // 8. 綁定「召喚小夥伴」升級
    document.getElementById('btn-summon').addEventListener('click', () => {
        if (summonLevel >= butter_cookie_MAX_SUMMON_LEVEL) return;
        const cost = Math.floor(200 * Math.pow(8, summonLevel));
        if (window.butter_cookie_count < cost) return;
        window.butter_cookie_count -= cost;
        summonLevel++;
        updateShopUI();
        spawnCompanion(window.innerWidth, window.innerHeight);
    });
    // 綁定「解鎖巧克力餅乾」
    document.getElementById('btn-choco').addEventListener('click', () => {
        if (cookie_chocolate_unlockLevel >= butter_cookie_MAX_CHOCO_UNLOCK_LEVEL) return;
        const cost = 1e4; // 10,000
        if (window.butter_cookie_count < cost) return;
        window.butter_cookie_count -= cost;
        cookie_chocolate_unlockLevel++;
        updateShopUI();
        // 目前先不做解鎖後效果，之後在這裡掛鉤真正的解鎖行為
    });

    // 9. 商店開關邏輯
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
    // 初始化
    window.addEventListener('DOMContentLoaded', () => {
        window.cookie_onscreen = window.cookie_onscreen || 0;
        cookie_onscreen_updateHUD();
    });

}); // 這裡一定要有這個閉合
