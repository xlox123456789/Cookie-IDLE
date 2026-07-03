// js/utils.js — 共用工具函式
// 大數字格式化：1234 -> "1.23K"

export function formatNumber(num) {
    if (num < 1000) return num.toString();
    const units = ["", "K", "M", "B", "T"];
    let u = 0;
    while (num >= 1000 && u < units.length - 1) {
        num /= 1000;
        u++;
    }
    return num.toFixed(2) + units[u];
}
