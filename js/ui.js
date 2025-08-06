// js/ui.js

console.log('ui.js loaded');

window.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. 測試模式：一開始給 200 塊餅乾
    // ----------------------------------------------------
    window.count = 0;
    document.getElementById('count').textContent = window.count;

    // ----------------------------------------------------
    // 2. 升級等級變數（local 變數同步到 window）
    // ----------------------------------------------------
    // ※ 在 core.js 已經用 window.butterCountLevel、window.butterSpeedLevel
    //    這裡直接從 window 取出，更保險。
    let butterCountLevel = window.butterCountLevel;
    let butterSpeedLevel = window.butterSpeedLevel;

    // ----------------------------------------------------
    // 3. 更新商店 UI（顯示 LV 與 花費）
    // ----------------------------------------------------
    function updateShopUI() {
        // 更新全域等級
        window.butterCountLevel = butterCountLevel;
        window.butterSpeedLevel = butterSpeedLevel;

        // 顯示等級
        document.getElementById('lv-count').textContent = butterCountLevel;
        document.getElementById('lv-speed').textContent = butterSpeedLevel;

        // 顯示花費
        document.getElementById('cost-count').textContent =
            Math.floor(10 * Math.pow(1.5, butterCountLevel));
        document.getElementById('cost-speed').textContent =
            Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
    }
    updateShopUI();

    // ----------------------------------------------------
    // 4. 綁定「出現次數」升級按鈕
    // ----------------------------------------------------
    document.getElementById('btn-count').addEventListener('click', () => {
        const cost = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        if (window.count < cost) return;   // 不夠就跳過
        window.count -= cost;              // 扣款
        butterCountLevel++;                // 等級 +1
        document.getElementById('count').textContent = window.count;
        updateShopUI();                    // 更新 UI
    });

    // ----------------------------------------------------
    // 5. 綁定「出現速度」升級按鈕
    //    並立即重排程，使加速生效
    // ----------------------------------------------------
    document.getElementById('btn-speed').addEventListener('click', () => {
        const cost = Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterSpeedLevel++;
        document.getElementById('count').textContent = window.count;
        updateShopUI();
        // 重新啟動核心排程，讓新速度生效
        if (typeof window.scheduleNextSpawn === 'function') {
            window.scheduleNextSpawn();
        }
    });

    // ----------------------------------------------------
    // 6. 商店視窗開關邏輯
    // ----------------------------------------------------
    const popup = document.getElementById('popup');
    const openBtn = document.getElementById('openButton');
    const closeBtn = document.querySelector('#popup .closeBtn');

    console.log('綁定商店開關按鈕');
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
