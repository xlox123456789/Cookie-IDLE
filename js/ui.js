// js/utils.js 已經 export function formatNumber

// js/ui.js
import { formatNumber } from './utils.js';
import { spawnCompanion } from './companion.js';
console.log('ui.js loaded');

window.addEventListener('DOMContentLoaded', () => {
    // 1. 測試模式：初始 200 塊奶油餅乾
    window.count = 0;
    //window.count = 200;
    document.getElementById('count').textContent = formatNumber(window.count);

    // 2. 升級等級 & 最大值常數
    const MAX_COUNT_LEVEL = 30;
    const MAX_SPEED_LEVEL = 50;
    const MAX_GAIN_LEVEL = 400;
    const MAX_EAT_LEVEL = 30;
    const MAX_SUMMON_LEVEL = 3;

    // 讀取或初始化本地等級變數
    let butterCountLevel = window.butterCountLevel || 0;
    let butterSpeedLevel = window.butterSpeedLevel || 0;
    let butterGainLevel = window.butterGainLevel || 0;
    let eatSpeedLevel = window.eatSpeedLevel || 0;
    let summonLevel = window.summonLevel || 0;

    // 3. 更新商店 UI：LV/最大、花費、按鈕狀態、左上角計數
    function updateShopUI() {
        // 同步全域等級
        window.butterCountLevel = butterCountLevel;
        window.butterSpeedLevel = butterSpeedLevel;
        window.butterGainLevel = butterGainLevel;
        window.eatSpeedLevel = eatSpeedLevel;
        window.summonLevel = summonLevel;

        // 左上角計數
        document.getElementById('count').textContent = formatNumber(window.count);

        // LV / MAX 顯示
        document.getElementById('lv-count').textContent = butterCountLevel;
        document.getElementById('lv-speed').textContent = butterSpeedLevel;
        document.getElementById('lv-gain').textContent = butterGainLevel;
        document.getElementById('lv-eat').textContent = eatSpeedLevel;
        document.getElementById('lv-summon').textContent = summonLevel;

        // 計算花費
        const costCount = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        const costSpeed = Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
        const costGain = Math.floor(500 * Math.pow(5, butterGainLevel));
        const costEat = Math.floor(100 * Math.pow(1.5, eatSpeedLevel));
        const costSummon = Math.floor(200 * Math.pow(8, summonLevel));

        // 顯示花費
        document.getElementById('cost-count').textContent = formatNumber(costCount);
        document.getElementById('cost-speed').textContent = formatNumber(costSpeed);
        document.getElementById('cost-gain').textContent = formatNumber(costGain);
        document.getElementById('cost-eat').textContent = formatNumber(costEat);
        document.getElementById('cost-summon').textContent = formatNumber(costSummon);

        // 按鈕狀態：出現次數
        const btnCount = document.getElementById('btn-count');
        if (butterCountLevel >= MAX_COUNT_LEVEL) {
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
        if (butterSpeedLevel >= MAX_SPEED_LEVEL) {
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
        if (butterGainLevel >= MAX_GAIN_LEVEL) {
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
        if (eatSpeedLevel >= MAX_EAT_LEVEL) {
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
        if (summonLevel >= MAX_SUMMON_LEVEL) {
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
    }

    // 初次更新
    updateShopUI();

    // 4. 綁定「出現次數」升級
    document.getElementById('btn-count').addEventListener('click', () => {
        if (butterCountLevel >= MAX_COUNT_LEVEL) return;
        const cost = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterCountLevel++;
        updateShopUI();
    });

    // 5. 綁定「出現速度」升級
    document.getElementById('btn-speed').addEventListener('click', () => {
        if (butterSpeedLevel >= MAX_SPEED_LEVEL) return;
        const cost = Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterSpeedLevel++;
        updateShopUI();
        if (typeof window.scheduleNextSpawn === 'function') {
            window.scheduleNextSpawn();
        }
    });

    // 6. 綁定「獲得數量」升級
    document.getElementById('btn-gain').addEventListener('click', () => {
        if (butterGainLevel >= MAX_GAIN_LEVEL) return;
        const cost = Math.floor(500 * Math.pow(5, butterGainLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterGainLevel++;
        updateShopUI();
        if (typeof window.scheduleNextSpawn === 'function') {
            window.scheduleNextSpawn();
        }
    });

    // 7. 綁定「吃餅乾速度」升級
    document.getElementById('btn-eat').addEventListener('click', () => {
        if (eatSpeedLevel >= MAX_EAT_LEVEL) return;
        const cost = Math.floor(100 * Math.pow(1.5, eatSpeedLevel));
        if (window.count < cost) return;
        window.count -= cost;
        eatSpeedLevel++;
        updateShopUI();
    });

    // 8. 綁定「召喚小夥伴」升級
    document.getElementById('btn-summon').addEventListener('click', () => {
        if (summonLevel >= MAX_SUMMON_LEVEL) return;
        const cost = Math.floor(200 * Math.pow(8, summonLevel));
        if (window.count < cost) return;
        window.count -= cost;
        summonLevel++;
        updateShopUI();
        spawnCompanion(window.innerWidth, window.innerHeight);
    });

    // 9. 商店開關邏輯
    const popup = document.getElementById('popup');
    const openBtn = document.getElementById('openButton');
    const closeBtn = document.querySelector('#popup .closeBtn');

    openBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.style.display = 'block';
    });
    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.style.display = 'none';
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
            }
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.style.display === 'block') {
            e.preventDefault();
            popup.style.display = 'none';
        }
    });
}); // 這裡一定要有這個閉合
