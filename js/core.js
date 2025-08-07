// js/core.js
import { formatNumber } from './utils.js';

// ----------------------------------------------------
// 1. 全域初始設定
// ----------------------------------------------------
window.count = 0;  // 玩家當前餅乾數
window.butterCountLevel = 0;  // 出現次數升級等級
window.butterSpeedLevel = 0;  // 出現速度升級等級
window.butterGainLevel = 0;  // 獲得量升級等級
window.eatSpeedLevel = 0;  // 吃餅乾速度升級等級

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
// 3.1 預載主角貼圖
// ----------------------------------------------------
const manImg = new Image();
manImg.src = 'skin/man1.png'; // 原圖 160×160
let manLoaded = false;
manImg.onload = () => { manLoaded = true; };

// ----------------------------------------------------
// 4. Cookie 類別：繪製、邏輯、吸收後消失
// ----------------------------------------------------
export class Cookie {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = 60; this.scale = 1; this.angle = 0;
        this.follow = false; this.absorbed = false;
        this.offsetX = 0; this.offsetY = 0;
        this.shrinkTimer = 0;
    }

    update() {
        const cx = this.x + this.size / 2;
        const cy = this.y + this.size / 2;
        const dx = mouseX - cx, dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);

        if (!this.absorbed && !this.follow) {
            // 滑鼠在 30~80px 範圍，吸引效果
            if (dist < 80 && dist > 30) {
                const mv = (80 - dist) / 80 * 5;
                this.x += dx / dist * mv;
                this.y += dy / dist * mv;
            } else if (dist <= 30) {
                // 進入跟隨縮小階段
                this.follow = this.absorbed = true;
                this.shrinkTimer = performance.now();
                this.offsetX = cx - mouseX;
                this.offsetY = cy - mouseY;
            }
        }
        else if (this.follow) {
            // 跟隨滑鼠、縮小、旋轉
            this.x = mouseX + this.offsetX - this.size / 2;
            this.y = mouseY + this.offsetY - this.size / 2;
            const elapsed = (performance.now() - this.shrinkTimer) / 1000;

            // 縮小速率與旋轉，受吃餅乾速度等級影響
            const eatLvl = window.eatSpeedLevel || 0;
            const shrinkRate = 0.1 * (1 + eatLvl * 0.05);
            this.scale = Math.max(1 - elapsed * shrinkRate, 0);
            this.angle += 1 + eatLvl * 0.5;  // 基礎1° + 0.5°*等級
        }
    }

    draw() {
        if (this.scale <= 0) return;
        ctx.save();
        const cx = this.x + this.size / 2, cy = this.y + this.size / 2;
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
// 在最前面宣告
let mouseX = 0, mouseY = 0;
let prevMouseX = 0, prevMouseY = 0;
let manAngle = 0;   // 實際繪製用的角度
let targetAngle = 0;   // 目標角度

// 追蹤滑鼠移動時，只更新 targetAngle
document.addEventListener('mousemove', e => {
    const dx = e.clientX - prevMouseX;
    const dy = e.clientY - prevMouseY;
    if (dx !== 0 || dy !== 0) {
        targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
    }
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ----------------------------------------------------
// 6. 生成函式
// ----------------------------------------------------
export function spawnCookie() {
    const x = Math.random() * (width - 60);
    const y = Math.random() * (height - 60);
    cookies.push(new Cookie(x, y));
}
export function spawnMultipleCookies() {
    const n = (window.butterCountLevel || 0) + 1;
    for (let i = 0; i < n; i++) spawnCookie();
}

// ----------------------------------------------------
// 7. 排程生產
// ----------------------------------------------------
const BASE_INTERVAL = 10000;
let spawnTimeoutId = null;
export function scheduleNextSpawn() {
    if (spawnTimeoutId !== null) clearTimeout(spawnTimeoutId);
    const lvl = window.butterSpeedLevel || 0;
    const interval = BASE_INTERVAL / (1 + lvl * 0.01);
    spawnTimeoutId = setTimeout(() => {
        spawnMultipleCookies();
        scheduleNextSpawn();
    }, interval);
}

// ----------------------------------------------------
// 8. 繪製主角
// ----------------------------------------------------
// drawMan() 改成平滑插值
function drawMan() {
    if (!manLoaded) return;
    const cx = mouseX, cy = mouseY;
    const size = 40;

    // 每幀把 manAngle 朝 targetAngle 推進 20%
    const delta = (targetAngle - manAngle);
    // 把 delta 包裹到 -PI..PI，避免跨過 2π 斷點
    const wrapped = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
    manAngle += wrapped * 0.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(manAngle);
    ctx.drawImage(manImg, -size / 2, -size / 2, size, size);
    ctx.restore();
}

// ----------------------------------------------------
// 9. 主迴圈
// ----------------------------------------------------
function gameLoop() {
    ctx.clearRect(0, 0, width, height);

    // 繪製餅乾
    cookies.forEach((c, i) => {
        c.update();
        c.draw();
        if (c.follow && c.isGone()) {
            cookies.splice(i, 1);
            const gain = 1 + (window.butterGainLevel || 0);
            window.count += gain;
            document.getElementById('count').textContent = formatNumber(window.count);
        }
    });

    // 繪製主角
    drawMan();

    requestAnimationFrame(gameLoop);
}

// ----------------------------------------------------
// 10. 遊戲啟動
// ----------------------------------------------------
export function startGame() {
    spawnMultipleCookies();
    scheduleNextSpawn();
    gameLoop();
}
cookieImg.onload = startGame;
window.scheduleNextSpawn = scheduleNextSpawn;
