// js/companion.js — 同伴（小夥伴）AI
// v1.9：同伴陣列統一改存放在 Game.companions，不再另外維護一份 companions 陣列。

import { Eater } from './eater.js';
import { Game } from './state.js';

const STATE = {
    MOVING: 0,
    WAITING: 1,
};

export class Companion extends Eater {
    constructor(canvasW, canvasH) {
        super('skin/man2.png', 40);

        this.canvasW = canvasW;
        this.canvasH = canvasH;

        // 隨機初始位置
        this.x = Math.random() * canvasW;
        this.y = Math.random() * canvasH;
        this.angle = 0; // 真正面向會在 update() 裡設定

        this.state = STATE.MOVING;
        this.moveDist = 0;
        this.MAX_DIST = 100;
        this.waitTimer = 0;
    }

    update(delta) {
        if (this.state === STATE.MOVING) {
            const speed = 100; // px/s
            if (this.moveDist === 0) {
                // 第一幀或重設時，隨機朝向
                const randRad = Math.random() * Math.PI * 2;
                this.vx = Math.cos(randRad) * speed;
                this.vy = Math.sin(randRad) * speed;
            }
            const dx = this.vx * delta;
            const dy = this.vy * delta;
            this.x += dx;
            this.y += dy;
            this.moveDist += Math.hypot(dx, dy);

            // 瞬間面向移動方向（圖片預設朝上，+90°）
            this.angle = Math.atan2(this.vy, this.vx) * 180 / Math.PI + 90;

            // 碰邊反彈
            if (this.x <= 0 || this.x >= this.canvasW) this.vx = -this.vx;
            if (this.y <= 0 || this.y >= this.canvasH) this.vy = -this.vy;
            this.x = Math.min(Math.max(this.x, 0), this.canvasW);
            this.y = Math.min(Math.max(this.y, 0), this.canvasH);

            if (this.moveDist >= this.MAX_DIST) {
                this.state = STATE.WAITING;
                this.waitTimer = performance.now();
            }
        } else {
            // 等待 5 秒
            if (performance.now() - this.waitTimer >= 5000) {
                this.moveDist = 0;
                const randRad = Math.random() * Math.PI * 2;
                this.vx = Math.cos(randRad) * 100;
                this.vy = Math.sin(randRad) * 100;
                this.state = STATE.MOVING;
            }
        }
    }
    // draw() 繼承自 Eater（會用 this.angle 來旋轉）
}

// 召喚一位新同伴，加入 Game.companions
export function spawnCompanion(w, h) {
    Game.companions.push(new Companion(w, h));
}
