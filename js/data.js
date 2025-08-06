// data.js: 定義 5 種餅乾與各自 5 個升級選項的資料結構
export const cookieTypes = [
    {
        id: 'butter',
        name: '奶油餅乾',
        baseValue: 1,
        upgrades: [
            { id: 'butter_power', name: '增強奶油力量', cost: 100, effect: 2, maxLevel: 10 },
            { id: 'butter_speed', name: '加快咀嚼速度', cost: 200, effect: 0.9, maxLevel: 8 },
            { id: 'butter_auto', name: '自動咀嚼機', cost: 500, effect: 0.5, maxLevel: 5 },
            { id: 'butter_crit', name: '暴擊機率', cost: 1000, effect: 0.05, maxLevel: 5 },
            { id: 'butter_mul', name: '暴擊傷害', cost: 2000, effect: 1.5, maxLevel: 3 }
        ]
    },
    {
        id: 'choco',
        name: '巧克力餅乾',
        baseValue: 5,
        upgrades: [
            { id: 'choco_power', name: '濃郁巧克力', cost: 500, effect: 5, maxLevel: 10 },
            { id: 'choco_speed', name: '快速融化', cost: 800, effect: 0.85, maxLevel: 8 },
            { id: 'choco_auto', name: '巧克力機器人', cost: 1200, effect: 1, maxLevel: 5 },
            { id: 'choco_crit', name: '巧克力暴擊', cost: 2000, effect: 0.1, maxLevel: 5 },
            { id: 'choco_mul', name: '雙倍巧克力', cost: 3000, effect: 2, maxLevel: 3 }
        ]
    },
    {
        id: 'strawberry',
        name: '草莓餅乾',
        baseValue: 10,
        upgrades: [
            { id: 'straw_power', name: '濃郁草莓', cost: 1000, effect: 10, maxLevel: 10 },
            { id: 'straw_speed', name: '快速清香', cost: 1500, effect: 0.8, maxLevel: 8 },
            { id: 'straw_auto', name: '草莓收割機', cost: 2000, effect: 1.5, maxLevel: 5 },
            { id: 'straw_crit', name: '草莓暴擊', cost: 3000, effect: 0.15, maxLevel: 5 },
            { id: 'straw_mul', name: '甜蜜加成', cost: 5000, effect: 2.5, maxLevel: 3 }
        ]
    },
    {
        id: 'matcha',
        name: '抹茶餅乾',
        baseValue: 20,
        upgrades: [
            { id: 'matcha_power', name: '濃郁抹茶', cost: 2000, effect: 20, maxLevel: 10 },
            { id: 'matcha_speed', name: '清新提速', cost: 2500, effect: 0.75, maxLevel: 8 },
            { id: 'matcha_auto', name: '自動抹茶機', cost: 3000, effect: 2, maxLevel: 5 },
            { id: 'matcha_crit', name: '抹茶暴擊', cost: 4000, effect: 0.2, maxLevel: 5 },
            { id: 'matcha_mul', name: '極致風味', cost: 6000, effect: 3, maxLevel: 3 }
        ]
    },
    {
        id: 'rainbow',
        name: '彩虹餅乾',
        baseValue: 50,
        upgrades: [
            { id: 'rain_power', name: '絢麗彩虹', cost: 5000, effect: 50, maxLevel: 10 },
            { id: 'rain_speed', name: '夢幻提速', cost: 6000, effect: 0.7, maxLevel: 8 },
            { id: 'rain_auto', name: '彩虹自動機', cost: 8000, effect: 3, maxLevel: 5 },
            { id: 'rain_crit', name: '彩虹暴擊', cost: 10000, effect: 0.25, maxLevel: 5 },
            { id: 'rain_mul', name: '奇跡加成', cost: 15000, effect: 4, maxLevel: 3 }
        ]
    }
];
