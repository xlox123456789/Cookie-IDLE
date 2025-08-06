// js/core.js

// ----------------------------------------------------
// 1. 全域初始設定
// ----------------------------------------------------
window.count = 0;               // 玩家當前餅乾數
window.butterCountLevel = 0;    // 出現次數升級等級
window.butterSpeedLevel = 0;    // 出現速度升級等級

// ----------------------------------------------------
// 2. Canvas 初始化
// ----------------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

// ----------------------------------------------------
// 3. 預載 Cookie 圖片
// ----------------------------------------------------
export const cookieImg = new Image();
cookieImg.src = 'cookie/cookie_butter.png';

// ----------------------------------------------------
// 4. Cookie 類別：繪製、邏輯、吸收後消失
// ----------------------------------------------------
export class Cookie {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 60;
        this.scale = 1;
        this.angle = 0;
        this.follow = false;
        this.absorbed = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.shrinkTimer = 0;
    }

    update() {
        const cx = this.x + this.size / 2;
        const cy = this.y + this.size / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);

        if (!this.absorbed && !this.follow) {
            // 滑鼠在 30~80px 範圍，吸引效果
            if (dist < 80 && dist > 30) {
                const mv = (80 - dist) / 80 * 5;
                this.x += (dx / dist) * mv;
                this.y += (dy / dist) * mv;
            } else if (dist <= 30) {
                // 進入跟隨縮小階段
                this.follow = this.absorbed = true;
                this.shrinkTimer = performance.now();
                this.offsetX = cx - mouseX;
                this.offsetY = cy - mouseY;
            }
        } else if (this.follow) {
            // 跟隨滑鼠、縮小、旋轉
            this.x = mouseX + this.offsetX - this.size / 2;
            this.y = mouseY + this.offsetY - this.size / 2;
            const elapsed = (performance.now() - this.shrinkTimer) / 1000;
            this.scale = Math.max(1 - elapsed * 0.1, 0);
            this.angle += 5; // 旋轉速度：每幀 5°
        }
    }

    draw() {
        if (this.scale <= 0) return;
        ctx.save();
        const cx = this.x + this.size / 2;
        const cy = this.y + this.size / 2;
        ctx.translate(cx, cy);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(cookieImg, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    isGone() {
        return this.scale <= 0;
    }
}

// ----------------------------------------------------
// 5. 全域變數與滑鼠位置追蹤
// ----------------------------------------------------
export let cookies = [];
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ----------------------------------------------------
// 6. 基本單一生成函式
// ----------------------------------------------------
export function spawnCookie() {
    const x = Math.random() * (width - 60);
    const y = Math.random() * (height - 60);
    cookies.push(new Cookie(x, y));
}

// ----------------------------------------------------
// 7. 根據等級生成多顆：N+1 個
// ----------------------------------------------------
export function spawnMultipleCookies() {
    const n = (window.butterCountLevel || 0) + 1;
    for (let i = 0; i < n; i++) {
        spawnCookie();
    }
}

// ----------------------------------------------------
// 8. 動態間隔排程：加速生產
// ----------------------------------------------------
const BASE_INTERVAL = 10000; // 基礎 10 秒
let spawnTimeoutId = null;

export function scheduleNextSpawn() {
    if (spawnTimeoutId !== null) clearTimeout(spawnTimeoutId);
    const speedLevel = window.butterSpeedLevel || 0;
    const interval = BASE_INTERVAL / (1 + speedLevel * 0.01);
    spawnTimeoutId = setTimeout(() => {
        spawnMultipleCookies();
        scheduleNextSpawn();
    }, interval);
}

// ----------------------------------------------------
// 9. 遊戲主迴圈：更新 & 繪製
// ----------------------------------------------------
function gameLoop() {
    ctx.clearRect(0, 0, width, height);
    cookies.forEach((c, i) => {
        c.update();
        c.draw();
        if (c.follow && c.isGone()) {
            cookies.splice(i, 1);
            window.count++;
            document.getElementById('count').textContent = window.count;
        }
    });
    requestAnimationFrame(gameLoop);
}

// ----------------------------------------------------
// 10. 遊戲啟動：第一次生成 + 啟動排程 + 主迴圈
// ----------------------------------------------------
export function startGame() {
    spawnMultipleCookies();
    scheduleNextSpawn();
    gameLoop();
}

// 自動在圖片載入後啟動遊戲
cookieImg.onload = startGame;

// 將 scheduleNextSpawn 掛到全域，供 ui.js 呼叫
window.scheduleNextSpawn = scheduleNextSpawn;
