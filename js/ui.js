// ui.js: 計數器、商店視窗開關、按鈕事件綁定
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
