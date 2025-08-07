// js/eater.js
export class Eater {
    constructor(imgSrc, size = 40) {
        this.img = new Image();
        this.img.src = imgSrc;
        this.loaded = false;
        this.img.onload = () => { this.loaded = true; };

        this.x = 0;
        this.y = 0;
        this.size = size;

        // 平滑旋轉用
        this.angle = 0;        // 畫面上實際角度（度）
        this.targetAngle = 0;  // 目標角度

        // 吃餅乾參數
        this.absorbRange = 30;
        this.shrinkRate = 0.1;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // 設定新的目標朝向（滑鼠移動向量）
    setDirection(dx, dy) {
        this.targetAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    }

    // 每幀把 angle 漸進到 targetAngle
    smoothRotate(factor = 0.2) {
        let diff = (this.targetAngle - this.angle + 540) % 360 - 180;
        this.angle += diff * factor;
    }

    tryAbsorb(cookie, mx, my, eatLvl = 0) {
        if (cookie.eater) return false;
        const cx = cookie.x + cookie.size / 2;
        const cy = cookie.y + cookie.size / 2;
        if (Math.hypot(mx - cx, my - cy) <= this.absorbRange) {
            cookie.eater = this;
            cookie.shrinkTimer = performance.now();
            cookie.offsetX = cookie.x - this.x;
            cookie.offsetY = cookie.y - this.y;
            return true;
        }
        return false;
    }

    updateAbsorb(cookie, eatLvl = 0) {
        if (cookie.eater !== this) return false;
        // 跟隨自己
        cookie.x = this.x + cookie.offsetX;
        cookie.y = this.y + cookie.offsetY;
        // 縮小 & 旋轉
        const elapsed = (performance.now() - cookie.shrinkTimer) / 1000;
        const rate = this.shrinkRate * (1 + eatLvl * 0.05);
        cookie.scale = Math.max(1 - elapsed * rate, 0);
        cookie.angle += 1 + eatLvl * 0.5;
        if (cookie.scale <= 0) {
            delete cookie.eater;
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (!this.loaded) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}
