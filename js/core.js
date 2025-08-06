// core.js: Canvas 初始化、Cookie 類別、主迴圈、生成邏輯
import { cookieTypes } from './data.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth, height = window.innerHeight;
canvas.width = width; canvas.height = height;
window.addEventListener('resize', () => {
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width; canvas.height = height;
});

// 圖片預載
export const cookieImg = new Image();
cookieImg.src = 'cookie/cookie_butter.png';

export let cookies = [];
export let count = 0;
let mouseX = 0, mouseY = 0;

// Cookie 類別
export class Cookie {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.scale = 1; this.angle = 0;
        this.follow = false; this.absorbed = false;
        this.offsetX = 0; this.offsetY = 0;
        this.shrinkTimer = 0; this.size = 60;
    }
    update() {
        const cx = this.x + this.size / 2, cy = this.y + this.size / 2;
        const dx = mouseX - cx, dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);
        if (!this.absorbed && !this.follow) {
            if (dist < 80 && dist > 30) {
                const mv = (80 - dist) / 80 * 5;
                this.x += dx / dist * mv;
                this.y += dy / dist * mv;
            } else if (dist <= 30) {
                this.follow = this.absorbed = true;
                this.shrinkTimer = performance.now();
                this.offsetX = cx - mouseX;
                this.offsetY = cy - mouseY;
            }
        } else if (this.follow) {
            this.x = mouseX + this.offsetX - this.size / 2;
            this.y = mouseY + this.offsetY - this.size / 2;
            const elapsed = (performance.now() - this.shrinkTimer) / 1000;
            this.scale = Math.max(1 - elapsed * 0.1, 0);
            this.angle += 5;
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

// 生成餅乾 (最多 500 顆)
export function spawnCookie() {
    if (cookies.length >= 500) return;
    const x = Math.random() * (width - 60), y = Math.random() * (height - 60);
    cookies.push(new Cookie(x, y));
}

// 滑鼠追蹤
document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
});

// 主迴圈
function gameLoop() {
    ctx.clearRect(0, 0, width, height);
    cookies.forEach((c, i) => {
        c.update(); c.draw();
        if (c.follow && c.isGone()) {
            cookies.splice(i, 1);
            count++;
            document.getElementById('count').textContent = count;
        }
    });
    requestAnimationFrame(gameLoop);
}

// 遊戲啟動
export function startGame() {
    spawnCookie();
    setInterval(spawnCookie, 10000);
    gameLoop();
}

cookieImg.onload = startGame;
