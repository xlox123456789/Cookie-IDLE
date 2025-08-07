// js/utils.js: 大數字格式化
export function formatNumber(num) {
    if (num < 1000) return num.toString();
    // 在最前面加一個空字串，對齊指數
    const units = ["", "K", "M", "B", "T"];
    let u = 0;
    // 每除一次 1000，就往後一格單位
    while (num >= 1000 && u < units.length - 1) {
        num /= 1000;
        u++;
    }
    // 保留兩位小數 + 單位
    return num.toFixed(2) + units[u];
}