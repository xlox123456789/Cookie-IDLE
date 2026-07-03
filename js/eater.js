// js/eater.js — 「吃餅乾者」基礎類別
// 主角與同伴共用這個類別：負責移動朝向、吃餅乾的靠近/縮小動畫。

export class Eater {
    constructor(imgSrc, size = 40) {
        // 圖片載入
        this.img = new Image();
        this.img.src = imgSrc;
        this.loaded = false;
        this.img.onload = () => { this.loaded = true; };

        // 位置與外觀
        this.x = 0;
        this.y = 0;
        this.size = size;

        // 平滑旋轉（同伴可不呼叫 smoothRotate，直接瞬間朝向）
        this.angle = 0;         // 畫面上實際角度（度）
        this.targetAngle = 0;   // 目標角度

        // 吃餅乾參數
        this.absorbRange = 30;  // 進入「要吃」的觸發距離
        this.shrinkRate = 0.1;  // 縮小速率基底
        this.approachSpeed = 10; // 開吃後，先以此速度靠近到 attachRadius
        this.attachRadius = 30;  // 先靠近到這個距離再開始縮小
    }

    // 位置＆方向
    setPosition(x, y) { this.x = x; this.y = y; }
    setDirection(dx, dy) {
        this.targetAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90; // 原圖朝上 +90°
    }
    smoothRotate(factor = 0.2) {
        let diff = (this.targetAngle - this.angle + 540) % 360 - 180;
        this.angle += diff * factor;
    }

    // 嘗試把某顆餅乾標記為「要吃」
    tryAbsorb(cookie, mx, my, eatLvl = 0) {
        if (cookie.eater) return false; // 已有人在吃
        const cx = cookie.x + cookie.size / 2;
        const cy = cookie.y + cookie.size / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist <= this.absorbRange) {
            cookie.eater = this;
            cookie.absorbState = 'approach'; // 先進入「靠近」階段
            return true;
        }
        return false;
    }

    // 每幀更新「被自己吃掉的餅乾」
    // 回傳 true 代表已吃完（可由外部移除並加分）
    updateAbsorb(cookie, eatLvl = 0) {
        if (cookie.eater !== this) return false;

        const ex = this.x;
        const ey = this.y;
        const cx = cookie.x + cookie.size / 2;
        const cy = cookie.y + cookie.size / 2;
        let dx = ex - cx;
        let dy = ey - cy;
        const dist = Math.hypot(dx, dy);

        // 階段一：先靠近到 attachRadius
        if (cookie.absorbState === 'approach') {
            if (dist > this.attachRadius) {
                const move = Math.min(this.approachSpeed, dist - this.attachRadius);
                if (dist > 0) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    cookie.x += nx * move;
                    cookie.y += ny * move;
                }
                return false; // 還在靠近，先不進入縮小
            } else {
                cookie.absorbState = 'attach';
                cookie.shrinkTimer = performance.now();
                cookie.offsetX = cookie.x - this.x;
                cookie.offsetY = cookie.y - this.y;
            }
        }

        // 階段二：跟隨 & 縮小 & 旋轉
        if (cookie.absorbState === 'attach') {
            cookie.x = this.x + cookie.offsetX;
            cookie.y = this.y + cookie.offsetY;

            const elapsed = (performance.now() - cookie.shrinkTimer) / 1000;
            const rate = this.shrinkRate * (1 + eatLvl * 0.05);
            cookie.scale = Math.max(1 - elapsed * rate, 0);

            cookie.angle += 1 + eatLvl * 0.5;

            if (cookie.scale <= 0) {
                delete cookie.eater;
                delete cookie.absorbState;
                return true; // 已吃完
            }
        }

        return false;
    }

    // 繪製自己
    draw(ctx) {
        if (!this.loaded) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}
