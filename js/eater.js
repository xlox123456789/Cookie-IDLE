// js/eater.js
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

        // 主角平滑旋轉（小夥伴可不呼叫 smoothRotate）
        this.angle = 0;        // 畫面上實際角度（度）
        this.targetAngle = 0;  // 目標角度

        // 吃餅乾參數
        this.absorbRange = 30;  // 進入「要吃」的觸發距離（你原本的設定）
        this.shrinkRate = 0.1; // 縮小速率基底
        this.approachSpeed = 10;  // ★ 新增：開吃後，先以此速度靠近到 80
        this.attachRadius = 30;  // ★ 新增：先靠近到這個距離再開始縮小
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

    // 嘗試把某顆 cookie 標記為「要吃」
    tryAbsorb(butter_cookie_cookie, mx, my, eatLvl = 0) {
        if (butter_cookie_cookie.eater) return false; // 已有人在吃
        const cx = butter_cookie_cookie.x + butter_cookie_cookie.size / 2;
        const cy = butter_cookie_cookie.y + butter_cookie_cookie.size / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist <= this.absorbRange) {
            butter_cookie_cookie.eater = this;
            butter_cookie_cookie.absorbState = 'approach';       // ★ 先進入「靠近」階段
            // 先不要設定 shrinkTimer / offset，等靠近到 attachRadius 再設
            return true;
        }
        return false;
    }

    // 每幀更新「被自己吃掉的餅乾」
    // 回傳 true 代表已吃完（可由外部移除並加分）
    updateAbsorb(butter_cookie_cookie, eatLvl = 0) {
        if (butter_cookie_cookie.eater !== this) return false;

        // 以 eater（this）為目標
        const ex = this.x;
        const ey = this.y;
        const cx = butter_cookie_cookie.x + butter_cookie_cookie.size / 2;
        const cy = butter_cookie_cookie.y + butter_cookie_cookie.size / 2;
        let dx = ex - cx;
        let dy = ey - cy;
        const dist = Math.hypot(dx, dy);

        // 階段一：先靠近到 attachRadius（例如 80）
        if (butter_cookie_cookie.absorbState === 'approach') {
            if (dist > this.attachRadius) {
                // 往目標移動，但不要穿過半徑 80
                const move = Math.min(this.approachSpeed, dist - this.attachRadius);
                if (dist > 0) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    // cookie.x / y 是左上角座標，因此直接加 move
                    butter_cookie_cookie.x += nx * move;
                    butter_cookie_cookie.y += ny * move;
                }
                return false; // 還在靠近，先不進入縮小
            } else {
                // 進入跟隨縮小階段
                butter_cookie_cookie.absorbState = 'attach';
                butter_cookie_cookie.shrinkTimer = performance.now();
                // 記錄當下相對偏移（用左上角座標）
                butter_cookie_cookie.offsetX = butter_cookie_cookie.x - this.x;
                butter_cookie_cookie.offsetY = butter_cookie_cookie.y - this.y;
            }
        }

        // 階段二：跟隨 & 縮小 & 旋轉
        if (butter_cookie_cookie.absorbState === 'attach') {
            // 跟隨 eater 的相對偏移
            butter_cookie_cookie.x = this.x + butter_cookie_cookie.offsetX;
            butter_cookie_cookie.y = this.y + butter_cookie_cookie.offsetY;

            // 縮小（受吃餅乾速度等級影響）
            const elapsed = (performance.now() - butter_cookie_cookie.shrinkTimer) / 1000;
            const rate = this.shrinkRate * (1 + eatLvl * 0.05);
            butter_cookie_cookie.scale = Math.max(1 - elapsed * rate, 0);

            // 旋轉
            butter_cookie_cookie.angle += 1 + eatLvl * 0.5;

            if (butter_cookie_cookie.scale <= 0) {
                delete butter_cookie_cookie.eater;
                delete butter_cookie_cookie.absorbState;
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
