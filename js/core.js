// js/core.js
import { formatNumber } from './utils.js';
import { Eater } from './eater.js';
import { companions, spawnCompanion } from './companion.js';
import { cookie_onscreen_track_spawn, cookie_onscreen_track_despawn } from './ui.js';
// 全域
window.butter_cookie_count = 0;
window.butter_cookie_CountLevel = 0;
window.butter_cookie_butterSpeedLevel = 0;
window.butter_cookie_butterGainLevel = 0;
window.eatSpeedLevel = 0;
window.summonLevel = 0;

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = innerWidth, height = innerHeight;
canvas.width = width; canvas.height = height;
addEventListener('resize', () => {
    width = innerWidth; height = innerHeight;
    canvas.width = width; canvas.height = height;
});

// Cookie 圖
export const butter_cookie_cookieImg = new Image();
butter_cookie_cookieImg.src = 'cookie/cookie_butter.png';

export class butter_cookie_Cookie {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = 60; this.scale = 1; this.angle = 0;
        this.absorbed = false;
    }
    update() {
        const cx = this.x + this.size / 2, cy = this.y + this.size / 2;
        const dx = mouseX - cx, dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);
        if (!this.absorbed && !this.eater && dist < 80 && dist > 30) {
            const mv = (80 - dist) / 80 * 5;
            this.x += dx / dist * mv; this.y += dy / dist * mv;
        }
    }
    draw() {
        if (this.scale <= 0) return;
        ctx.save();
        const cx = this.x + this.size / 2, cy = this.y + this.size / 2;
        ctx.translate(cx, cy);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(butter_cookie_cookieImg, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
    isGone() { return this.scale <= 0; }
}

export let butter_cookie_cookies = [];
export function butter_cookie_spawnCookie() {
    butter_cookie_cookies.push(new butter_cookie_Cookie(
        Math.random() * (width - 60),
        Math.random() * (height - 60)
    ));
    cookie_onscreen_track_spawn()
}
export function butter_cookie_spawnMultipleCookies() {
    const n = (window.butter_cookie_CountLevel || 0) + 1;
    for (let i = 0; i < n; i++)butter_cookie_spawnCookie();
}

const BASE_INTERVAL = 10000;
let spawnTimeoutId = null;
export function scheduleNextSpawn() {
    if (spawnTimeoutId !== null) clearTimeout(spawnTimeoutId);
    const lvl = window.butter_cookie_butterSpeedLevel || 0;
    const interval = BASE_INTERVAL / (1 + lvl * 0.01);
    spawnTimeoutId = setTimeout(() => {
        butter_cookie_spawnMultipleCookies(); scheduleNextSpawn();
    }, interval);
}

// 主角
const mainEater = new Eater('skin/man1.png', 40);

let mouseX = 0, mouseY = 0;
let prevX = 0, prevY = 0;
canvas.addEventListener('mousemove', e => {
    // 立刻設定主角 targetAngle
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    if (dx !== 0 || dy !== 0) {
        mainEater.setDirection(dx, dy);
    }
    prevX = e.clientX;
    prevY = e.clientY;

    // 更新滑鼠位置
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 主迴圈
let lastTime = performance.now();
function gameLoop() {
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    butter_cookie_cookies.forEach((c, i) => {
        c.update();
        if (!c.absorbed && !c.eater) {
            if (mainEater.tryAbsorb(c, mouseX, mouseY, window.eatSpeedLevel)) c.absorbed = true;
            companions.forEach(cp => {
                if (!c.absorbed && !c.eater && cp.tryAbsorb(c, cp.x, cp.y, window.eatSpeedLevel)) {
                    c.absorbed = true;
                }
            });
        }
        if (c.absorbed && c.eater) {
            c.eater.updateAbsorb(c, window.eatSpeedLevel);
            if (c.isGone()) {
                butter_cookie_cookies.splice(i, 1);
                cookie_onscreen_track_despawn();
                const gain = 1 + (window.butter_cookie_butterGainLevel || 0);
                window.butter_cookie_count += gain;
                document.getElementById('count').textContent = formatNumber(window.butter_cookie_count);
            }
        }
        c.draw();
    });

    // 主角平滑旋轉 + 繪製
    mainEater.smoothRotate(0.2);
    mainEater.setPosition(mouseX, mouseY);
    mainEater.draw(ctx);

    // 更新 & 繪製夥伴（瞬間朝向）
    companions.forEach(cp => {
        cp.update(delta);
        // 小夥伴瞬間面向移動方向
        // angle 已由 update() 保持為移動方向
        cp.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
}

// 啟動
export function startGame() {
    butter_cookie_spawnMultipleCookies();
    scheduleNextSpawn();
    lastTime = performance.now();
    gameLoop();
}
butter_cookie_cookieImg.onload = startGame;
window.scheduleNextSpawn = scheduleNextSpawn;

// 召喚
export function summonPartner() {
    if (companions.length < window.summonLevel) {
        spawnCompanion(width, height);
    }
}
