// js/companion.js
import { Eater } from './eater.js';

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
        // 初始朝向先給 0，真正面向會在 update 裡設定
        this.angle = 0;

        this.state = STATE.MOVING;
        this.moveDist = 0;
        this.MAX_DIST = 100;
        this.waitTimer = 0;
    }

    update(delta) {
        if (this.state === STATE.MOVING) {
            // 隨機移動距離累計，並取得方向向量
            // 先計算欲移動的長度 & 向量
            const speed = 100; // px/s
            // 若從上一幀沒記錄 vx, vy，可直接隨機方向：
            if (this.moveDist === 0) {
                // 第一帧或重設時，隨機朝向
                const randRad = Math.random() * Math.PI * 2;
                this.vx = Math.cos(randRad) * speed;
                this.vy = Math.sin(randRad) * speed;
            }
            // 根據速度 & delta 移動
            const dx = this.vx * delta;
            const dy = this.vy * delta;
            this.x += dx;
            this.y += dy;
            this.moveDist += Math.hypot(dx, dy);

            // **瞬間面向移動方向，圖片預設朝上所以 +90°**
            this.angle = Math.atan2(this.vy, this.vx) * 180 / Math.PI + 90;

            // 碰邊反彈：將速度向量水平或垂直翻負
            if (this.x <= 0 || this.x >= this.canvasW) {
                this.vx = -this.vx;
            }
            if (this.y <= 0 || this.y >= this.canvasH) {
                this.vy = -this.vy;
            }
            // 限制邊界
            this.x = Math.min(Math.max(this.x, 0), this.canvasW);
            this.y = Math.min(Math.max(this.y, 0), this.canvasH);

            // 到達指定距離後進入等待
            if (this.moveDist >= this.MAX_DIST) {
                this.state = STATE.WAITING;
                this.waitTimer = performance.now();
            }

        } else {
            // 等待 5 秒
            if (performance.now() - this.waitTimer >= 5000) {
                this.moveDist = 0;
                // 重置速度向量與方向
                const randRad = Math.random() * Math.PI * 2;
                this.vx = Math.cos(randRad) * 100;
                this.vy = Math.sin(randRad) * 100;
                this.state = STATE.MOVING;
            }
        }
    }

    // draw 繼承自 Eater (會用 this.angle 來旋轉)
}

// companions 陣列
export const companions = [];

// 召喚小夥伴
export function spawnCompanion(w, h) {
    companions.push(new Companion(w, h));
}
