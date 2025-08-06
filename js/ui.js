// ui.js
console.log('ui.js loaded');

window.addEventListener('DOMContentLoaded', () => {
    // — 1. 測試模式：開場給 200 塊奶油餅乾
    window.count = 200;
    document.getElementById('count').textContent = window.count;

    // — 2. 定義等級
    let butterCountLevel = 0;
    let butterSpeedLevel = 0;

    // — 3. 更新商店 UI
    function updateShopUI() {
        document.getElementById('lv-count').textContent = butterCountLevel;
        document.getElementById('lv-speed').textContent = butterSpeedLevel;
        document.getElementById('cost-count').textContent =
            Math.floor(10 * Math.pow(1.5, butterCountLevel));
        document.getElementById('cost-speed').textContent =
            Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
    }
    updateShopUI();

    // — 4. 綁定升級按鈕
    document.getElementById('btn-count').addEventListener('click', () => {
        const cost = Math.floor(10 * Math.pow(1.5, butterCountLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterCountLevel++;
        document.getElementById('count').textContent = window.count;
        updateShopUI();
        // TODO: 實際增加出現次數的邏輯
    });

    document.getElementById('btn-speed').addEventListener('click', () => {
        const cost = Math.floor(10 * Math.pow(1.5, butterSpeedLevel));
        if (window.count < cost) return;
        window.count -= cost;
        butterSpeedLevel++;
        document.getElementById('count').textContent = window.count;
        updateShopUI();
        // TODO: 實際增加出現速度的邏輯
    });

    // — 5. 綁定商店開關
    const popup = document.getElementById('popup');
    const openBtn = document.getElementById('openButton');
    const closeBtn = document.querySelector('#popup .closeBtn');

    console.log('綁定商店按鈕');
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
