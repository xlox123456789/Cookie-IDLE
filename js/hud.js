// js/hud.js — 畫面上方數字顯示（v1.9 新增）
// 把 HUD（左上角餅乾數、正上方場上餅乾數）更新邏輯獨立出來，
// 讓 core.js（遊戲迴圈）與 ui.js（商店介面）都能直接呼叫，
// 不需要再互相 import，避免循環依賴。

import { formatNumber } from './utils.js';
import { Game } from './state.js';

export function updateCookieCountHUD() {
    const el = document.getElementById('count');
    if (el) el.textContent = formatNumber(Game.cookieCount);
}

export function updateCookieOnFieldHUD() {
    const el = document.getElementById('cookie_onscreen_count');
    if (el) el.textContent = String(Game.cookieOnField);
}

// 生成一顆餅乾時呼叫
export function trackCookieSpawn() {
    Game.cookieOnField++;
    updateCookieOnFieldHUD();
}

// 餅乾被吃掉 / 離場時呼叫
export function trackCookieDespawn() {
    if (Game.cookieOnField > 0) Game.cookieOnField--;
    updateCookieOnFieldHUD();
}
