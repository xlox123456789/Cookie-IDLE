// js/ui.js
import { formatNumber } from './utils.js';

console.log('ui.js loaded');

window.addEventListener('DOMContentLoaded', () => {
    // ——————————————————————
    // 1. 測試模式：初始 200 塊奶油餅乾
    // ——————————————————————
    window.count = 1000000000;
    document.getElementById('count').textContent = formatNumber(window.count);

    // ——————————————————————
    // 2. 升級等級 & 最大值常數
    // ——————————————————————
    const MAX_COUNT_LEVEL = 30;
    const MAX_SPEED_LEVEL = 50;
    const MAX_GAIN_LEVEL = 400;

    let butterCountLevel = window.butterCountLevel || 0;
    let butterSpeedLevel = window.butterSpeedLevel || 0;
    let butterGainLevel = window.butterGainLevel || 0;

    // ——————————————————————
    // 3. 更新商店 UI
    // ——————————————————————
    function updateShopUI() {
        // 同步全域等級
        window.butterCountLevel = butterCountLevel;
        window.butterSpeedLevel = butterSpeedLevel;
        window.butterGainLevel = butterGainLevel;

        // 左上角計數
        document.getElementById('count').textContent = formatNumber(window.count);

        // LV / MAX 顯示
        document.getElementById('lv-count').textContent = butterCountLevel;
        document.getElementById('lv-speed').textContent = butterSpeedLevel;
        document.getElementById('lv-gain').textContent = butterGainLevel;

        // 計算花費
        const costCount = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        const costSpeed = Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
        const costGain = Math.floor(500 * Math.pow(5, butterGainLevel));

        // 顯示花費
        document.getElementById('cost-count').textContent = formatNumber(costCount);
        document.getElementById('cost-speed').textContent = formatNumber(costSpeed);
        document.getElementById('cost-gain').textContent = formatNumber(costGain);

        // 次數按鈕
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

        // 速度按鈕
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

        // 獲得量按鈕
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
    }
    updateShopUI();

    // ——————————————————————
    // 4. 綁定「出現次數」升級
    // ——————————————————————
    document.getElementById('btn-count').addEventListener('click', () => {
        if (butterCountLevel >= MAX_COUNT_LEVEL) return;
        const cost = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterCountLevel++;
        updateShopUI();
    });

    // ——————————————————————
    // 5. 綁定「出現速度」升級
    // ——————————————————————
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

    // ——————————————————————
    // 6. 綁定「獲得數量」升級（含除錯 log）
    // ——————————————————————
    document.getElementById('btn-gain').addEventListener('click', () => {
        if (butterGainLevel >= MAX_GAIN_LEVEL) return;

        // 計算原始花費
        const rawCostGain = Math.floor(500 * Math.pow(5, butterGainLevel));
        console.log('DEBUG: butterGainLevel =', butterGainLevel, ', rawCostGain =', rawCostGain);

        // 格式化後顯示
        const costGain = rawCostGain;
        if (window.count < costGain) return;
        window.count -= costGain;
        butterGainLevel++;
        updateShopUI();
        if (typeof window.scheduleNextSpawn === 'function') {
            window.scheduleNextSpawn();
        }
    });

    // ——————————————————————
    // 7. 商店開關
    // ——————————————————————
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
});
