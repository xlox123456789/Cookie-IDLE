// js/core.js — 主遊戲迴圈（v1.19）
// 變更重點：
//  1. 全域變數統一改用 Game（見 state.js），不再散落一堆 window.xxx。
//  2. HUD 更新邏輯抽到 hud.js，避免與 ui.js 互相 import 造成循環依賴。
//  3. 真正接上 save.js，啟動時會先讀檔、遊戲開始後會啟動自動存檔。

import { Game } from './state.js';
import { SPAWN_BASE_INTERVAL } from './config.js';
import { Eater } from './eater.js';
import { spawnCompanion } from './companion.js';
import { trackCookieSpawn, trackCookieDespawn, updateCookieCountHUD } from './hud.js';
import { startAutoSave } from './save.js';

// ---- Canvas 初始化 ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = innerWidth, height = innerHeight;
canvas.width = width; canvas.height = height;
addEventListener('resize', () => {
    width = innerWidth; height = innerHeight;
    canvas.width = width; canvas.height = height;
});

// ---- 餅乾 ----
export const cookieImgButter = new Image();
cookieImgButter.src = 'cookie/cookie_butter.png';

export class Cookie {
    constructor(x, y, type = 'butter') {
        this.x = x; this.y = y;
        this.type = type; // 目前只有 'butter'，保留欄位供未來巧克力餅乾使用
        this.size = 60; this.scale = 1; this.angle = 0;
        this.absorbed = false;
    }
    get img() {
        return cookieImgButter;
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
        ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
    isGone() { return this.scale <= 0; }
}

let cookies = [];

export function spawnCookie() {
    cookies.push(new Cookie(
        Math.random() * (width - 60),
        Math.random() * (height - 60)
    ));
    trackCookieSpawn();
}

export function spawnCookieBatch() {
    const n = Game.levels.count + 1;
    for (let i = 0; i < n; i++) spawnCookie();
}

let spawnTimeoutId = null;
export function scheduleNextSpawn() {
    if (spawnTimeoutId !== null) clearTimeout(spawnTimeoutId);
    const interval = SPAWN_BASE_INTERVAL / (1 + Game.levels.speed * 0.01);
    spawnTimeoutId = setTimeout(() => {
        spawnCookieBatch();
        scheduleNextSpawn();
    }, interval);
}

// ---- 主角 ----
const hero = new Eater('skin/man1.png', 40);
Game.hero = hero;

let mouseX = width / 2, mouseY = height / 2;
let prevX = mouseX, prevY = mouseY;
hero.setPosition(mouseX, mouseY);
canvas.addEventListener('mousemove', e => {
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    if (dx !== 0 || dy !== 0) hero.setDirection(dx, dy);
    prevX = e.clientX;
    prevY = e.clientY;

    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ---- 主迴圈 ----
let lastTime = performance.now();
function gameLoop() {
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    cookies.forEach((c, i) => {
        c.update();
        if (!c.absorbed && !c.eater) {
            if (hero.tryAbsorb(c, mouseX, mouseY, Game.levels.eat)) c.absorbed = true;
            Game.companions.forEach(cp => {
                if (!c.absorbed && !c.eater && cp.tryAbsorb(c, cp.x, cp.y, Game.levels.eat)) {
                    c.absorbed = true;
                }
            });
        }
        if (c.absorbed && c.eater) {
            c.eater.updateAbsorb(c, Game.levels.eat);
            if (c.isGone()) {
                cookies.splice(i, 1);
                trackCookieDespawn();
                const gain = 1 + Game.levels.gain;
                Game.cookieCount += gain;
                updateCookieCountHUD();
            }
        }
        c.draw();
    });

    // 主角平滑旋轉 + 繪製
    hero.smoothRotate(0.2);
    hero.setPosition(mouseX, mouseY);
    hero.draw(ctx);

    // 更新 & 繪製同伴（瞬間朝向）
    Game.companions.forEach(cp => {
        cp.update(delta);
        cp.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
}

// ---- 啟動 ----
export function startGame() {
    spawnCookieBatch();
    scheduleNextSpawn();
    lastTime = performance.now();
    gameLoop();
    startAutoSave();
}
cookieImgButter.onload = startGame;

// ---- 召喚（提供給 ui.js 以外的地方使用；ui.js 目前直接呼叫 companion.js 的 spawnCompanion）----
export function summonPartner() {
    if (Game.companions.length < Game.levels.summon) {
        spawnCompanion(width, height);
    }
}
