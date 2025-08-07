// js/ui.js
import { formatNumber } from './utils.js';

console.log('ui.js loaded');

window.addEventListener('DOMContentLoaded', () => {
    // 1. 測試模式：初始 200 塊奶油餅乾
    window.count = 100000000;
    window.count = 0;
    document.getElementById('count').textContent = formatNumber(window.count);

    // 2. 升級等級 & 最大值常數
    const MAX_COUNT_LEVEL = 30;
    const MAX_SPEED_LEVEL = 50;
    const MAX_GAIN_LEVEL = 400;
    const MAX_EAT_LEVEL = 30;  // 吃餅乾速度最高等級

    let butterCountLevel = window.butterCountLevel || 0;
    let butterSpeedLevel = window.butterSpeedLevel || 0;
    let butterGainLevel = window.butterGainLevel || 0;
    let eatSpeedLevel = window.eatSpeedLevel || 0;

    // 3. 更新商店 UI
    function updateShopUI() {
        // 同步全域等級
        window.butterCountLevel = butterCountLevel;
        window.butterSpeedLevel = butterSpeedLevel;
        window.butterGainLevel = butterGainLevel;
        window.eatSpeedLevel = eatSpeedLevel;

        // 左上角計數
        document.getElementById('count').textContent = formatNumber(window.count);

        // LV / MAX 顯示
        document.getElementById('lv-count').textContent = butterCountLevel;
        document.getElementById('lv-speed').textContent = butterSpeedLevel;
        document.getElementById('lv-gain').textContent = butterGainLevel;
        document.getElementById('lv-eat').textContent = eatSpeedLevel;

        // 計算各項花費
        const costCount = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        const costSpeed = Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
        const costGain = Math.floor(500 * Math.pow(5, butterGainLevel));
        const costEat = Math.floor(100 * Math.pow(1.5, eatSpeedLevel));

        // 顯示花費（大數字格式）
        document.getElementById('cost-count').textContent = formatNumber(costCount);
        document.getElementById('cost-speed').textContent = formatNumber(costSpeed);
        document.getElementById('cost-gain').textContent = formatNumber(costGain);
        document.getElementById('cost-eat').textContent = formatNumber(costEat);

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

        // 按鈕狀態：獲得量
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
    }
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
        console.log('DEBUG: eatSpeedLevel =', eatSpeedLevel, ' raw costEat =', cost);
        if (window.count < cost) return;
        window.count -= cost;
        eatSpeedLevel++;
        updateShopUI();
        // no need to reschedule spawn
    });

    // 8. 商店開關邏輯
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
