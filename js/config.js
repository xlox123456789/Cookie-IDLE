// js/config.js — 商店升級數值設定（v1.19 新增）
// 把「上限等級 / 基礎花費 / 成長倍率」集中在同一個地方，
// 避免同一份數值（例如上限 30、50、400…）分散寫在 HTML 與 ui.js 兩處。

import { Game } from './state.js';

export const UPGRADE_CONFIG = {
    count: { max: 30, baseCost: 10, growth: 1.5 },   // 出現數量
    speed: { max: 50, baseCost: 10, growth: 1.5 },   // 出現速度
    gain: { max: 400, baseCost: 500, growth: 5 },     // 獲得數量
    eat: { max: 30, baseCost: 100, growth: 1.5 },     // 吃餅乾速度
    summon: { max: 3, baseCost: 200, growth: 8 },     // 招喚小夥伴
    choco: { max: 1, baseCost: 10000, growth: 1 },    // 解鎖巧克力餅乾（固定花費）
};

// 餅乾生成的基礎間隔（毫秒）
export const SPAWN_BASE_INTERVAL = 10000;

// 依目前等級計算下一級的花費
export function getUpgradeCost(key) {
    const cfg = UPGRADE_CONFIG[key];
    const lvl = Game.levels[key];
    return Math.floor(cfg.baseCost * Math.pow(cfg.growth, lvl));
}
