# Snake Roguelike — 项目文档

## 概述

单文件贪吃蛇 Roguelike 游戏，暗色炫彩风格。HTML/CSS/JS 全内嵌，无需构建工具，浏览器直接打开。

## 运行方式

- **本地**：双击 `index.html`
- **在线**：https://helium55.github.io/snake-game/ （GitHub Pages）
- **备用**：https://snake-game-ten-dusky.vercel.app （Vercel）

## 技术栈

- 纯 HTML/CSS/JS，单文件 ~65KB
- Canvas 渲染，25×25 网格，500×500px
- Supabase（PostgreSQL）存排行榜
- Web Audio API 生成音效
- GitHub Pages + Vercel 双平台部署

## Supabase 配置

```
URL: https://qbjktyrbbhlkllforktr.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (见代码)
表名: leaderboard
列: id (bigint, auto), player_name (text), score (int), level (int), created_at (timestamptz)
RLS: SELECT 和 INSERT 对所有人开放
```

## 核心架构

```
main menu → 开始游戏 → 游戏循环 → 死亡 → 结算

游戏循环 (gameTick):
  AI移动(自动模式) / 玩家输入(手动模式)
  → 碰撞检测(墙/自身/闪避/护盾)
  → 吃食物(普通/特殊)
  → 磁铁/压缩/升级触发
  → 渲染
```

## 游戏系统

### 1. 升级系统 (showUpgradeScreen)
- 每 5 个食物触发一次升级
- **初次升级**(第1次)：2选1 — ♾️自我免疫 或 🗜️身体压缩
- **后续升级**：3 免费 + 2 商店，各选 1 个
- 免费升级从 16 个池子随机抽，可重复
- 商店升级 15 个，用身体点数购买，价格随购买次数递增
- 选完确认后 1 秒停顿继续

### 2. 身体压缩 (compressBody)
- 选了压缩后，同等级段位每 4 个合并为 1 个高级段位(2048式)
- 段位显示数字(2,3,4...)
- 每 tick 自动运行
- 融合加速升级可将门槛降为 3

### 3. 身体点数 (totalBodyPoints)
- 1级=1点, 2级=4点, 3级=16点, N级=4^(N-1)点
- 商店购买用身体点数
- 扣款函数: deductBodyPoints(cost) 从尾部移除等高值段位

### 4. 自动化模式 (autoMode, Lv10触发)
- 达到 10 级时升级界面只显示 🤖自动化 选项
- 小字："恭喜你爬入真实世界的大门"
- 激活后：AI 贪心寻路算法控制蛇
- 速度为原来的 1/4 (autoSpeedDivider=4)
- 右上角商店按钮(用身体点数购买永久升级)
- 三分类：⚡自动化 / 🍎食物 / 🌃环境
- 不再弹出升级界面
- 方向键和触屏输入被禁用

### 5. 成就系统 (ACHIEVEMENTS)
- 11 个成就，触发时顶部弹窗
- 未解锁显示 ❓???，解锁后显示真内容
- localStorage 持久化

### 6. 排行榜 (renderLB)
- Supabase 存取
- 每人只显示最高分
- 固定条目：👑 魔王helium (999分)
- 小字："看名字就知道很稀有"
- 击败触发成就"新任魔王"

### 7. 彩蛋
- Konami码 ↑↑↓↓←→←→ABAB 切换无敌模式(金色蛇身+穿墙)

## 全局状态变量

```
snake: [{x,y,lvl}]  // 蛇身，lvl为压缩等级
food, specialFood   // 食物位置
direction, nextDirection
score, highScore, level
gameOver, paused, invincible
autoMode            // 自动化模式开关
bodyCompress        // 身体压缩开关
noSelfCollide       // 自我免疫开关
wrapMode            // 穿墙模式
bodyPoints          // 身体总点数
mergeThreshold      // 合并门槛(默认4)
activeFree, activeShop  // 已选升级列表
growExtra, scoreMult, shieldCount, dodgeChance 等
```

## 关键函数速查

| 函数 | 作用 |
|------|------|
| gameTick() | 主循环，处理移动/碰撞/进食/升级触发 |
| showUpgradeScreen() | 渲染升级选择界面，绑定点击和确认逻辑 |
| applyUpgrade(id,isFirst) | 执行升级效果 |
| compressBody() | 段位合并 |
| totalBodyPoints() | 计算身体总点数 |
| deductBodyPoints(cost) | 从尾部移除段位支付成本 |
| initGame() | 重置所有状态开始新游戏 |
| endGame() | 结算、上传分数、检测成就 |
| renderAutoShop() | 渲染自动化商店 |
| draw() | Canvas 渲染蛇身/食物/段位数字/眼睛 |

## 商店列表 (升级)

FREE_UPGRADES(16个): speed1, grow1, special_chance, shield, score_boost, bonus_food, lucky, body_surge, crit_eat, slow_start, food_sense, tail_grow, merge_boost, gold_rush, iron_stomach, safe_passage, speedy

SHOP_UPGRADES(15个): phase, magnet, wrap, double_special, dodge, keep_score, periodic_shield, split_food, ghost_tail, food_radar, time_warp, safe_zone, revenge, golden_touch, wall_hack

AUTO_SHOP(11个): 加速运算, 寻路优化, 深度学习, 食物增值, 食物涌现, 稀有增产, 双倍产出, 暗夜模式, 矩阵世界, 星河漫游, 曙光之地

## 部署命令

```bash
# GitHub Pages
git add index.html && git commit -m "..." && git push

# Vercel
vercel --prod --yes
```
