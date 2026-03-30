/**
 * ============================================================================
 * 🎮 像素锻造纪元 (Pixel Forge Era) - DND 风格 TRPG 游戏
 * ============================================================================
 * 
 * 作者: Claude AI
 * 版本: 2.0
 * 
 * 📁 文件结构说明:
 * ├── [第1部分] API 配置管理 (约第30-120行)
 * │   └── API_CONFIG - 集中管理所有 AI API 配置，方便切换不同大模型
 * │
 * ├── [第2部分] 游戏数据常量 (约第130-250行)
 * │   ├── PIXEL_COLORS - 像素颜色与元素属性
 * │   ├── WEAPON_DATABASE - 70+种武器数据库
 * │   └── CHARACTER_CLASSES - 6种角色职业
 * │
 * ├── [第3部分] UI 组件 (约第260-400行)
 * │   ├── GothicTitle - 哥特风格标题
 * │   ├── RuneButton - 符文按钮
 * │   └── ScrollPanel - 卷轴面板
 * │
 * ├── [第4部分] 像素武器编辑器 (约第410-850行)
 * │   ├── PixelWeaponEditor - 16x16 像素绘制
 * │   ├── 形状特征提取算法
 * │   ├── 本地武器匹配
 * │   └── AI 智能识别
 * │
 * ├── [第5部分] 角色系统 (约第860-1050行)
 * │   ├── CharacterCreation - 角色创建
 * │   └── CharacterSelect - 角色选择
 * │
 * ├── [第6部分] 世界导入系统 (约第1060-1150行)
 * │   └── StoryImport - 预设世界观导入
 * │
 * ├── [第7部分] 主游戏组件 (约第1160-1950行)
 * │   ├── DNDGame - 主游戏逻辑
 * │   ├── AI 剧情生成
 * │   ├── 离线模式备用
 * │   └── 游戏界面渲染
 * │
 * └── [第8部分] 导出
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';

/* ============================================================================
 * 第1部分: API 配置管理
 * ============================================================================
 * 
 * 🔧 如何切换到其他大模型:
 * 
 * 1. OpenAI (GPT-4):
 *    - 修改 provider 为 'openai'
 *    - 设置 apiKey 为你的 OpenAI API Key
 *    - endpoint 改为 'https://api.openai.com/v1/chat/completions'
 *    - model 改为 'gpt-4' 或 'gpt-4-turbo'
 * 
 * 2. DeepSeek (深度求索):
 *    - 修改 provider 为 'deepseek'
 *    - 设置 apiKey 为你的 DeepSeek API Key
 *    - 可选模型: 'deepseek-chat' (V3) 或 'deepseek-reasoner' (R1)
 * 
 * 3. 国内大模型 (如通义千问):
 *    - 修改 provider 为 'qwen'
 *    - 设置 apiKey 为你的 API Key
 *    - endpoint 改为 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
 *    - model 改为 'qwen-max' 或 'qwen-plus'
 * 
 * 4. 本地部署 (如 Ollama):
 *    - 修改 provider 为 'ollama'
 *    - endpoint 改为 'http://localhost:11434/api/chat'
 *    - model 改为 'llama3' 或其他本地模型
 *    - apiKey 可以留空
 * 
 * 5. 其他兼容 OpenAI 格式的 API:
 *    - 修改 provider 为 'openai-compatible'
 *    - 设置对应的 endpoint 和 apiKey
 */

const API_CONFIG = {
  // ==================== 当前使用的配置 ====================
  // 修改这里来切换不同的 AI 服务
  
  provider: 'anthropic',  // 可选: 'anthropic', 'deepseek', 'openai', 'qwen', 'ollama', 'openai-compatible'
  
  // Anthropic Claude 配置 (默认)
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    apiKey: '',  // 在 claude.ai 中运行时不需要填写
    maxTokens: 1000,
    // 是否启用网络搜索 (仅 Anthropic 支持)
    enableWebSearch: true,
  },
  
  // ⭐ DeepSeek 配置 (推荐国内用户使用)
  deepseek: {
    endpoint: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',  // 可选: 'deepseek-chat' (V3) 或 'deepseek-reasoner' (R1)
    apiKey: 'sk-your-deepseek-key-here',  // 🔑 填入你的 DeepSeek API Key
    maxTokens: 1000,
  },
  
  // OpenAI GPT 配置
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-turbo',
    apiKey: 'sk-your-api-key-here',  // 🔑 填入你的 OpenAI API Key
    maxTokens: 1000,
  },
  
  // 通义千问配置
  qwen: {
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-max',
    apiKey: 'sk-your-qwen-key-here',  // 🔑 填入你的通义千问 API Key
    maxTokens: 1000,
  },
  
  // Ollama 本地部署配置
  ollama: {
    endpoint: 'http://localhost:11434/api/chat',
    model: 'llama3',
    apiKey: '',  // 本地部署不需要
    maxTokens: 1000,
  },
  
  // 其他 OpenAI 兼容 API (如 Azure, Groq, Together 等)
  'openai-compatible': {
    endpoint: 'https://your-api-endpoint/v1/chat/completions',
    model: 'your-model-name',
    apiKey: 'your-api-key',
    maxTokens: 1000,
  },
  
  // ==================== 通用设置 ====================
  
  // 请求超时时间 (毫秒)
  timeout: 15000,
  
  // 武器识别 AI 超时时间 (毫秒)
  weaponAnalysisTimeout: 12000,
  
  // 是否在 API 失败时使用离线模式
  enableOfflineFallback: true,
};

/**
 * 获取当前 API 配置
 * @returns {Object} 当前选择的 API 配置
 */
const getCurrentAPIConfig = () => {
  return API_CONFIG[API_CONFIG.provider] || API_CONFIG.anthropic;
};

/**
 * 通用 AI API 调用函数
 * 根据配置的 provider 自动适配不同的 API 格式
 * 
 * @param {string} systemPrompt - 系统提示词
 * @param {string} userMessage - 用户消息
 * @param {Object} options - 额外选项
 * @returns {Promise<string|null>} AI 回复文本，失败返回 null
 */
const callAIAPI = async (systemPrompt, userMessage, options = {}) => {
  const config = getCurrentAPIConfig();
  const { includeWebSearch = false } = options;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    let requestBody, headers;
    
    // 根据不同的 provider 构建请求
    switch (API_CONFIG.provider) {
      case 'anthropic':
        headers = { 'Content-Type': 'application/json' };
        requestBody = {
          model: config.model,
          max_tokens: config.maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        };
        // 添加网络搜索工具 (仅 Anthropic)
        if (includeWebSearch && config.enableWebSearch) {
          requestBody.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
        }
        break;
      
      // ⭐ DeepSeek 配置 (兼容 OpenAI 格式)
      case 'deepseek':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        };
        requestBody = {
          model: config.model,
          max_tokens: config.maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        };
        break;
        
      case 'openai':
      case 'openai-compatible':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        };
        requestBody = {
          model: config.model,
          max_tokens: config.maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        };
        break;
        
      case 'qwen':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        };
        requestBody = {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        };
        break;
        
      case 'ollama':
        headers = { 'Content-Type': 'application/json' };
        requestBody = {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          stream: false,
        };
        break;
        
      default:
        throw new Error(`Unknown API provider: ${API_CONFIG.provider}`);
    }
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 解析不同格式的响应
    let text = '';
    switch (API_CONFIG.provider) {
      case 'anthropic':
        text = data.content?.map(item => item.type === 'text' ? item.text : '').filter(Boolean).join('\n') || '';
        break;
      case 'deepseek':  // DeepSeek 使用 OpenAI 兼容格式
      case 'openai':
      case 'openai-compatible':
      case 'qwen':
        text = data.choices?.[0]?.message?.content || '';
        break;
      case 'ollama':
        text = data.message?.content || '';
        break;
    }
    
    return text || null;
    
  } catch (error) {
    console.error(`[API Error] ${API_CONFIG.provider}:`, error);
    return null;
  }
};

/* ============================================================================
 * 第2部分: 游戏数据常量
 * ============================================================================
 * 
 * 包含:
 * - PIXEL_COLORS: 12种像素颜色，每种对应一个元素和特效
 * - WEAPON_DATABASE: 70+种武器的完整数据
 * - CHARACTER_CLASSES: 6种可选职业
 */

/**
 * 像素颜色配置
 * 每种颜色代表一种元素，影响武器的属性和特效
 */
const PIXEL_COLORS = {
  red: { name: '火焰', element: 'fire', emoji: '🔥', damage: 8, effect: '灼烧' },
  orange: { name: '岩浆', element: 'lava', emoji: '🌋', damage: 10, effect: '熔化' },
  yellow: { name: '雷电', element: 'lightning', emoji: '⚡', damage: 12, effect: '麻痹' },
  lime: { name: '毒素', element: 'poison', emoji: '🧪', damage: 6, effect: '中毒' },
  green: { name: '自然', element: 'nature', emoji: '🌿', damage: 5, effect: '治愈' },
  cyan: { name: '冰霜', element: 'ice', emoji: '❄️', damage: 7, effect: '冻结' },
  blue: { name: '水流', element: 'water', emoji: '💧', damage: 6, effect: '侵蚀' },
  purple: { name: '暗影', element: 'shadow', emoji: '🌑', damage: 9, effect: '诅咒' },
  pink: { name: '圣光', element: 'holy', emoji: '✨', damage: 11, effect: '净化' },
  white: { name: '风暴', element: 'wind', emoji: '🌪️', damage: 7, effect: '击退' },
  gray: { name: '钢铁', element: 'steel', emoji: '⚔️', damage: 8, effect: '穿刺' },
  black: { name: '虚空', element: 'void', emoji: '🕳️', damage: 15, effect: '湮灭' },
};

/**
 * 武器数据库 - 70+种武器
 * 
 * 属性说明:
 * - name: 武器中文名
 * - emoji: 显示图标
 * - baseAtk: 基础攻击力
 * - type: 武器类型 (melee/ranged/firearm/heavy/magic/defense/thrown/trap/utility/hybrid/tech/natural)
 * - desc: 武器描述
 * 
 * 特殊属性 (可选):
 * - range: 攻击范围
 * - ammo: 弹药数量
 * - crit: 暴击倍率
 * - attackSpeed: 攻击速度倍率
 * - aoe: 范围伤害半径
 * - magic: 魔法加成
 * - defense: 防御加成
 * - stun: 眩晕概率
 * - lifesteal: 吸血比例
 * - poison: 是否带毒
 * - pierce: 是否穿透
 * - multiHit: 多重打击次数
 * - legendary: 是否为传说武器
 */
const WEAPON_DATABASE = {
  // ==================== 近战武器 - Melee ====================
  sword: { name: '剑', emoji: '⚔️', baseAtk: 10, type: 'melee', desc: '经典的近战武器' },
  longsword: { name: '长剑', emoji: '🗡️', baseAtk: 12, type: 'melee', desc: '双手持握的大剑' },
  katana: { name: '太刀', emoji: '⚔️', baseAtk: 14, type: 'melee', desc: '东方武士之魂' },
  dagger: { name: '匕首', emoji: '🔪', baseAtk: 5, type: 'melee', crit: 2.5, desc: '灵巧的暗杀武器' },
  axe: { name: '战斧', emoji: '🪓', baseAtk: 15, type: 'melee', desc: '野蛮的力量象征' },
  hammer: { name: '战锤', emoji: '🔨', baseAtk: 18, type: 'melee', stun: 0.3, desc: '沉重的钝器' },
  mace: { name: '钉锤', emoji: '🔨', baseAtk: 14, type: 'melee', armorPen: 0.2, desc: '破甲利器' },
  spear: { name: '长矛', emoji: '🔱', baseAtk: 11, type: 'melee', range: 2, desc: '攻击距离优秀' },
  halberd: { name: '戟', emoji: '🔱', baseAtk: 16, type: 'melee', range: 2, desc: '枪斧合一' },
  scythe: { name: '死神镰刀', emoji: '⚰️', baseAtk: 13, type: 'melee', lifesteal: 0.1, desc: '死亡的收割者' },
  whip: { name: '鞭子', emoji: '〰️', baseAtk: 6, type: 'melee', range: 3, desc: '灵活的远程近战' },
  claws: { name: '利爪', emoji: '🐾', baseAtk: 8, type: 'melee', attackSpeed: 1.5, desc: '野兽之爪' },
  gauntlet: { name: '拳套', emoji: '🥊', baseAtk: 9, type: 'melee', combo: true, desc: '格斗家之选' },
  nunchaku: { name: '双截棍', emoji: '🥢', baseAtk: 7, type: 'melee', attackSpeed: 1.8, desc: '功夫大师' },
  sai: { name: '钗', emoji: '🥢', baseAtk: 6, type: 'melee', parry: 0.3, desc: '防御反击' },
  
  // ==================== 远程武器 - Ranged ====================
  bow: { name: '弓', emoji: '🏹', baseAtk: 9, type: 'ranged', range: 10, desc: '精准的远程武器' },
  longbow: { name: '长弓', emoji: '🏹', baseAtk: 12, type: 'ranged', range: 15, desc: '射程极远' },
  crossbow: { name: '弩', emoji: '🎯', baseAtk: 14, type: 'ranged', range: 8, armorPen: 0.3, desc: '穿甲利器' },
  slingshot: { name: '弹弓', emoji: '🎯', baseAtk: 4, type: 'ranged', range: 6, desc: '简易但实用' },
  javelin: { name: '标枪', emoji: '🎯', baseAtk: 10, type: 'ranged', range: 7, desc: '投掷武器' },
  chakram: { name: '战轮', emoji: '💫', baseAtk: 8, type: 'ranged', range: 6, bounce: true, desc: '回旋飞轮' },
  
  // ==================== 忍者武器 - Ninja ====================
  shuriken: { name: '手里剑', emoji: '✴️', baseAtk: 5, type: 'ranged', range: 5, multiHit: 3, desc: '忍者暗器' },
  kunai: { name: '苦无', emoji: '📍', baseAtk: 6, type: 'ranged', range: 4, desc: '忍者标配' },
  kusarigama: { name: '锁镰', emoji: '⛓️', baseAtk: 9, type: 'melee', range: 3, pull: true, desc: '链锁武器' },
  blowgun: { name: '吹箭', emoji: '🎺', baseAtk: 3, type: 'ranged', range: 8, poison: true, desc: '暗杀利器' },
  
  // ==================== 现代枪械 - Firearms ====================
  pistol: { name: '手枪', emoji: '🔫', baseAtk: 12, type: 'firearm', range: 8, ammo: 12, desc: '便携火器' },
  revolver: { name: '左轮', emoji: '🔫', baseAtk: 18, type: 'firearm', range: 6, ammo: 6, crit: 2, desc: '西部牛仔' },
  rifle: { name: '步枪', emoji: '🔫', baseAtk: 20, type: 'firearm', range: 20, ammo: 30, desc: '精准射击' },
  shotgun: { name: '霰弹枪', emoji: '🔫', baseAtk: 25, type: 'firearm', range: 4, spread: true, desc: '近距毁灭' },
  smg: { name: '冲锋枪', emoji: '🔫', baseAtk: 8, type: 'firearm', range: 6, ammo: 50, attackSpeed: 3, desc: '火力压制' },
  machinegun: { name: '机枪', emoji: '🔫', baseAtk: 10, type: 'firearm', range: 10, ammo: 200, attackSpeed: 5, desc: '疯狂扫射' },
  sniper: { name: '狙击枪', emoji: '🎯', baseAtk: 50, type: 'firearm', range: 50, ammo: 5, crit: 3, desc: '一击必杀' },
  
  // ==================== 重型武器 - Heavy ====================
  cannon: { name: '大炮', emoji: '💣', baseAtk: 80, type: 'heavy', range: 30, aoe: 5, reload: 5, desc: '攻城利器' },
  rocketlauncher: { name: '火箭筒', emoji: '🚀', baseAtk: 60, type: 'heavy', range: 20, aoe: 3, desc: '爆破专家' },
  minigun: { name: '加特林', emoji: '🔫', baseAtk: 6, type: 'heavy', range: 8, attackSpeed: 10, desc: '弹幕覆盖' },
  flamethrower: { name: '火焰喷射器', emoji: '🔥', baseAtk: 15, type: 'heavy', range: 4, dot: true, desc: '焚烧一切' },
  railgun: { name: '电磁炮', emoji: '⚡', baseAtk: 100, type: 'heavy', range: 40, pierce: true, reload: 8, desc: '科技结晶' },
  
  // ==================== 魔法武器 - Magic ====================
  staff: { name: '法杖', emoji: '🪄', baseAtk: 5, type: 'magic', magic: 20, desc: '施法媒介' },
  wand: { name: '魔杖', emoji: '✨', baseAtk: 3, type: 'magic', magic: 15, castSpeed: 1.5, desc: '轻巧灵便' },
  orb: { name: '法球', emoji: '🔮', baseAtk: 2, type: 'magic', magic: 25, desc: '蕴含强大魔力' },
  tome: { name: '魔法书', emoji: '📖', baseAtk: 1, type: 'magic', magic: 30, spells: 5, desc: '知识就是力量' },
  scepter: { name: '权杖', emoji: '👑', baseAtk: 8, type: 'magic', magic: 18, summon: true, desc: '召唤师之选' },
  
  // ==================== 防具 - Defensive ====================
  shield: { name: '盾牌', emoji: '🛡️', baseAtk: 3, type: 'defense', defense: 25, desc: '坚实的防护' },
  buckler: { name: '圆盾', emoji: '🛡️', baseAtk: 5, type: 'defense', defense: 15, parry: 0.4, desc: '格挡利器' },
  towershield: { name: '塔盾', emoji: '🛡️', baseAtk: 1, type: 'defense', defense: 40, desc: '移动的城墙' },
  
  // ==================== 特殊武器 - Special ====================
  boomerang: { name: '回旋镖', emoji: '🪃', baseAtk: 7, type: 'ranged', range: 8, returns: true, desc: '扔出去还能回来' },
  bomb: { name: '炸弹', emoji: '💣', baseAtk: 30, type: 'thrown', aoe: 4, consumable: true, desc: '一次性大伤害' },
  grenade: { name: '手雷', emoji: '💥', baseAtk: 20, type: 'thrown', aoe: 3, consumable: true, desc: '战场利器' },
  mine: { name: '地雷', emoji: '💣', baseAtk: 35, type: 'trap', aoe: 3, desc: '埋伏神器' },
  net: { name: '捕网', emoji: '🕸️', baseAtk: 0, type: 'utility', immobilize: true, desc: '控制敌人' },
  hook: { name: '钩爪', emoji: '🪝', baseAtk: 6, type: 'utility', pull: true, grapple: true, desc: '拉近距离' },
  fan: { name: '战扇', emoji: '🪭', baseAtk: 7, type: 'melee', windAttack: true, desc: '优雅而致命' },
  umbrella: { name: '伞剑', emoji: '☂️', baseAtk: 8, type: 'melee', hidden: true, desc: '暗藏杀机' },
  guitar: { name: '战斗吉他', emoji: '🎸', baseAtk: 10, type: 'magic', sonic: true, desc: '用音乐战斗' },
  cards: { name: '飞牌', emoji: '🃏', baseAtk: 4, type: 'ranged', multiHit: 5, desc: '赌徒的武器' },
  yo_yo: { name: '溜溜球', emoji: '🪀', baseAtk: 5, type: 'melee', range: 3, returns: true, desc: '童趣与杀意' },
  
  // ==================== 传说武器 - Legendary ====================
  excalibur: { name: '圣剑', emoji: '⚔️', baseAtk: 30, type: 'melee', holy: true, legendary: true, desc: '王者之剑' },
  mjolnir: { name: '雷神之锤', emoji: '🔨', baseAtk: 35, type: 'melee', lightning: true, legendary: true, returns: true, desc: '只有勇者能举起' },
  trident: { name: '三叉戟', emoji: '🔱', baseAtk: 22, type: 'melee', water: true, range: 2, desc: '海神之武' },
  gunblade: { name: '枪刃', emoji: '⚔️', baseAtk: 18, type: 'hybrid', range: 6, desc: '近远皆可' },
  chainsword: { name: '链锯剑', emoji: '⚔️', baseAtk: 22, type: 'melee', bleed: true, desc: '暴力美学' },
  lightsaber: { name: '光剑', emoji: '⚡', baseAtk: 25, type: 'melee', energy: true, desc: '原力与你同在' },
  
  // ==================== 乐器武器 - Instrument ====================
  warhorn: { name: '战号', emoji: '📯', baseAtk: 0, type: 'support', buff: true, aoe: 10, desc: '鼓舞士气' },
  wardrums: { name: '战鼓', emoji: '🥁', baseAtk: 0, type: 'support', buff: true, aoe: 15, desc: '激励战友' },
  
  // ==================== 科技武器 - Tech ====================
  lasergun: { name: '激光枪', emoji: '🔫', baseAtk: 16, type: 'energy', range: 12, pierce: true, desc: '未来科技' },
  plasmarifle: { name: '等离子步枪', emoji: '🔫', baseAtk: 22, type: 'energy', range: 10, aoe: 2, desc: '高温毁灭' },
  taser: { name: '电击枪', emoji: '⚡', baseAtk: 5, type: 'energy', range: 3, stun: 0.8, desc: '非致命制服' },
  drone: { name: '攻击无人机', emoji: '🛸', baseAtk: 8, type: 'tech', autonomous: true, desc: 'AI战斗伙伴' },
  mech_arm: { name: '机械臂', emoji: '🦾', baseAtk: 20, type: 'tech', grapple: true, desc: '义体强化' },
  
  // ==================== 自然武器 - Natural ====================
  claws_beast: { name: '兽爪', emoji: '🐻', baseAtk: 12, type: 'natural', bleed: true, desc: '野性之力' },
  fangs: { name: '毒牙', emoji: '🐍', baseAtk: 8, type: 'natural', poison: true, desc: '致命毒素' },
  tail: { name: '尾击', emoji: '🦎', baseAtk: 10, type: 'natural', knockback: true, desc: '力大无穷' },
  horn: { name: '尖角', emoji: '🦏', baseAtk: 15, type: 'natural', charge: true, desc: '冲锋陷阵' },
  
  // ==================== 未知/通用 ====================
  unknown: { name: '神秘武器', emoji: '❓', baseAtk: 10, type: 'unknown', desc: 'AI正在分析...' }
};

/**
 * 角色职业配置
 * 包含6种可选职业，每种有不同的属性分配
 */
const CHARACTER_CLASSES = [
  { id: 'warrior', name: '战士', emoji: '⚔️', hp: 120, mp: 30, str: 18, int: 8, agi: 12, desc: '近战物理输出，高生命值' },
  { id: 'mage', name: '法师', emoji: '🔮', hp: 60, mp: 120, str: 8, int: 20, agi: 10, desc: '远程魔法输出，高魔法值' },
  { id: 'rogue', name: '刺客', emoji: '🗡️', hp: 80, mp: 50, str: 14, int: 10, agi: 20, desc: '高敏捷，擅长暴击' },
  { id: 'cleric', name: '牧师', emoji: '✝️', hp: 90, mp: 100, str: 10, int: 16, agi: 8, desc: '治疗与辅助专精' },
  { id: 'ranger', name: '游侠', emoji: '🏹', hp: 85, mp: 60, str: 12, int: 12, agi: 18, desc: '远程物理输出，追踪专家' },
  { id: 'paladin', name: '圣骑士', emoji: '🛡️', hp: 110, mp: 70, str: 16, int: 12, agi: 10, desc: '坦克与治疗兼备' },
];

/**
 * 武器名称生成系统
 * 生成类似"霜之哀伤"、"火之高兴"这样的一体化酷炫名称
 */

// 元素相关的名称词库
const ELEMENT_NAMES = {
  fire: {
    prefix: ['炎', '火', '焰', '烬', '灼', '炽', '赤', '燃', '熔'],
    middle: ['之', '与', '的'],
    suffix: ['高兴', '愤怒', '咆哮', '吞噬', '审判', '净化', '涅槃', '永燃', '狂怒', '焚天', '灭世', '凤凰', '浴火', '燎原'],
    full: ['炎之高兴', '焚天', '火神之怒', '赤焰吞噬者', '灼热审判', '凤凰涅槃', '烈焰风暴', '燃烧的意志', '永燃之心', '炎魔之触', '地狱业火', '焰灵之息']
  },
  lava: {
    prefix: ['熔', '岩', '炽', '焦', '灼'],
    middle: ['之', '与', '的'],
    suffix: ['崩塌', '毁灭', '吞噬', '末日', '地核', '熔断', '焦土'],
    full: ['熔岩之心', '地核咆哮', '岩浆吞噬者', '焦土审判', '熔断者', '末日熔炉', '深渊之焰', '地狱熔岩', '炽热核心']
  },
  lightning: {
    prefix: ['雷', '电', '霆', '闪', '霹', '雳'],
    middle: ['之', '与', '的'],
    suffix: ['哀伤', '审判', '天罚', '震怒', '轰鸣', '闪击', '贯穿'],
    full: ['雷霆之怒', '闪电风暴', '天罚之雷', '霹雳一击', '雷神之锤', '电弧编织者', '万雷天牢', '霆之哀伤', '雷鸣审判', '苍穹之怒']
  },
  poison: {
    prefix: ['毒', '蚀', '腐', '疫', '瘴'],
    middle: ['之', '与', '的'],
    suffix: ['低语', '蔓延', '侵蚀', '腐化', '瘟疫', '剧毒', '凋零'],
    full: ['毒蛇之吻', '瘟疫蔓延', '腐化之触', '蚀骨剧毒', '疫病使者', '毒雾弥漫', '凋零之息', '剧毒之牙', '腐蚀者', '瘴气深渊']
  },
  nature: {
    prefix: ['翠', '森', '灵', '木', '叶', '藤'],
    middle: ['之', '与', '的'],
    suffix: ['低语', '祝福', '生机', '轮回', '新生', '萌芽', '觉醒'],
    full: ['自然之怒', '森林守护者', '翠绿祝福', '生命之树', '万物低语', '丛林之心', '精灵的祝福', '自然轮回', '绿野仙踪', '生机盎然']
  },
  ice: {
    prefix: ['霜', '冰', '寒', '冻', '雪', '凛', '凝'],
    middle: ['之', '与', '的'],
    suffix: ['哀伤', '悲鸣', '叹息', '寂静', '永寂', '凝结', '冻结'],
    full: ['霜之哀伤', '寒冰王座', '冰封千里', '凛冬将至', '霜冻之心', '雪暴', '永冻之境', '寒霜悲鸣', '冰魄', '极寒审判', '冰晶泪滴']
  },
  water: {
    prefix: ['潮', '海', '波', '涛', '渊', '泊', '浪'],
    middle: ['之', '与', '的'],
    suffix: ['呼唤', '低语', '怒涛', '深渊', '宁静', '咆哮', '吞没'],
    full: ['海神之怒', '深海低语', '潮汐之力', '波涛汹涌', '渊底呼唤', '碧海狂涛', '沧海一粟', '海啸', '深渊凝视', '水之呼吸']
  },
  shadow: {
    prefix: ['影', '暗', '冥', '夜', '黯', '幽', '魅'],
    middle: ['之', '与', '的'],
    suffix: ['哀嚎', '吞噬', '低语', '凝视', '腐蚀', '噩梦', '深渊'],
    full: ['暗影之刃', '噩梦低语', '暗夜猎手', '影之吞噬', '黑暗凝视', '幽冥使者', '暗影弑神', '夜幕降临', '深渊之子', '虚空行者']
  },
  holy: {
    prefix: ['圣', '神', '光', '辉', '曜', '耀', '明'],
    middle: ['之', '与', '的'],
    suffix: ['救赎', '审判', '祝福', '降临', '复仇', '净化', '裁决'],
    full: ['圣光审判', '神圣复仇者', '光之救赎', '天使降临', '圣洁之光', '神谕之剑', '光明裁决', '黎明使者', '天堂之怒', '救世之光']
  },
  wind: {
    prefix: ['风', '岚', '飚', '旋', '空', '翔'],
    middle: ['之', '与', '的'],
    suffix: ['呼啸', '咆哮', '狂奔', '自由', '流浪', '轨迹', '轻语'],
    full: ['风之轨迹', '狂风呼啸', '疾风斩', '岚之息', '风暴使者', '自由之风', '苍穹翱翔', '风语者', '旋风绝杀', '御风而行']
  },
  steel: {
    prefix: ['钢', '铁', '锋', '刃', '锐', '寒'],
    middle: ['之', '与', '的'],
    suffix: ['意志', '信念', '决心', '誓约', '荣耀', '不屈', '永恒'],
    full: ['钢铁意志', '寒铁之心', '利刃誓约', '锋芒毕露', '百炼精钢', '不屈之刃', '铁血雄心', '金属风暴', '陨铁之锋', '精钢之魂']
  },
  void: {
    prefix: ['虚', '空', '无', '灭', '寂', '渊'],
    middle: ['之', '与', '的'],
    suffix: ['湮灭', '终结', '虚无', '消逝', '轮回', '归零', '末日'],
    full: ['虚空之眼', '湮灭者', '万物终结', '虚无之境', '空间撕裂', '末日审判', '存在抹杀', '归于虚无', '深渊凝视', '宇宙终焉']
  }
};

// 武器类型相关的名称词库
const WEAPON_TYPE_NAMES = {
  sword: ['斩', '刃', '剑', '断', '斩魄', '魂'],
  longsword: ['巨剑', '断罪', '裁决', '审判'],
  katana: ['一闪', '居合', '斩月', '无铭', '村雨', '正宗'],
  dagger: ['暗杀', '致命', '噬血', '夜刃'],
  axe: ['劈山', '开天', '裂地', '战怒'],
  hammer: ['崩山', '碎星', '震地', '雷霆'],
  spear: ['穿心', '贯日', '逐风', '破空'],
  bow: ['射日', '追风', '穿云', '破晓'],
  crossbow: ['连珠', '穿甲', '狙击'],
  staff: ['星辰', '时空', '命运', '真理'],
  wand: ['秘法', '奥术', '符文', '咒语'],
  orb: ['预言', '命运', '占星', '天眼'],
  shield: ['守护', '壁垒', '不破', '坚盾'],
  pistol: ['裁决', '执法', '正义', '审判'],
  rifle: ['狙神', '鹰眼', '死神', '远征'],
  sniper: ['一击', '终结', '猎杀', '天诛'],
  shotgun: ['毁灭', '风暴', '狂暴', '扫射'],
  shuriken: ['影', '风', '舞', '残月'],
  kunai: ['暗', '忍', '隐', '夜'],
  guitar: ['摇滚', '狂想', '交响', '绝唱'],
  umbrella: ['绅士', '优雅', '暴风', '骤雨'],
  cards: ['命运', '王牌', '小丑', '皇家'],
  yo_yo: ['轮回', '永动', '弹跳', '旋转']
};

// 传说级/史诗级特殊名称
const LEGENDARY_NAMES = [
  // 经典梗
  '霜之哀伤', '火之高兴', '炎之愤怒', '雷之震怒', '光之救赎', '暗之吞噬',
  // 中二风
  '黑暗破坏神', '光明圣剑', '命运裁决者', '时间终结者', '空间撕裂者', '万物归一',
  '诸神黄昏', '世界终焉', '创世之刃', '灭世之锤', '轮回之镰', '永恒审判',
  // 搞笑风/职场梗
  '月光下的忧伤', '三点几嚟饮茶先', '打工人之魂', '社畜的悲鸣', '周一恐惧症',
  '绩效之刃', 'KPI收割者', '加班终结者', 'DDL粉碎机', '甲方需求毁灭者',
  '老板克星', '早八杀手', '外卖终结者', '摸鱼神器', '带薪拉屎', '准时下班',
  // 网络热梗 2023-2024
  '这把剑它不讲武德', '六边形战士', '遥遥领先', '不是...吧', '真的会谢',
  '无中生有暗度陈仓', '格局打开', '雷霆嘎巴', 'CPU烧了', '他急了',
  '我真的栓Q', '芭比Q了', '绝绝子', '无语子', 'yyds', '针不戳',
  '什么档次', '纯纯的', '属于是', '咱就是说', '一整个大动作',
  '蜜雪冰城甜蜜蜜', '挖呀挖呀挖', '命运的齿轮开始转动', '科目三',
  // B站/游戏梗
  '不要停下来啊', '逃不掉的宿命', '见证者的目光', '深渊的凝视',
  '原神启动', '提瓦特最强', '芙宁娜的眼泪', '但是但是', '诶嘿',
  '就这？就这？', '寄了', '大威天龙', '芜湖起飞', '下次一定',
  // 武侠梗
  '万剑归宗', '六脉神剑', '降龙十八掌', '九阴白骨爪', '如来神掌',
  '独孤九剑', '葵花宝典', '辟邪剑谱', '吸星大法', '北冥神功',
  // 经典游戏梗
  '你前面的路被堵死了', '不愧是你', '宝可梦图鉴完成', '红蓝药水',
  '传说中的回血道具', '满级了还打新手村', '一刀999', '是兄弟就来砍我'
];

// 趣味名称 (带有背景故事感/meme感)
const QUIRKY_NAMES = [
  // 日常篇
  '前任的回忆', '初恋的重量', '妈妈的拖鞋', '爸爸的皮带', '奶奶的擀面杖',
  '房东的催租', '银行的短信', '体检报告', '相亲对象的微笑', '领导的凝视',
  '丈母娘的审视', '亲戚的关心', '同学聚会', '前同事的朋友圈', '已读不回',
  // 职场篇
  '工资条的轻薄', '年终奖的厚度', '请假条的温度', '辞职信的重量', '会议室的沉默',
  '需求文档', '紧急修复', '线上事故', '版本回滚', '删库跑路',
  '周报的敷衍', '日报的复制', '周会的无聊', '团建的尴尬', '述职的紧张',
  // 生活篇
  '快递的期待', '外卖的温度', '闹钟的绝望', '被子的引力', '沙发的舒适',
  '冰箱的诱惑', '手机的魔力', '充电宝的焦虑', 'WiFi信号', '满格电量',
  '减肥的明天', '早起的决心', '健身卡的灰尘', '书架的装饰', '泡面的幸福',
  // 玄学篇
  '欧皇的气运', '非酋的诅咒', '玄学调参', '随缘抽卡', '今日运势',
  '水逆退散', '锦鲤附体', '天选之人', '气运之子', '命运之轮',
  '十连保底', '小保底歪了', '大保底稳了', '单抽出奇迹', '金光闪闪',
  // 互联网篇
  '404的绝望', '500的崩溃', '加载中...', '网络异常', '验证码地狱',
  '账号已存在', '密码错误', '请重新登录', '系统维护中', '服务器已满',
  // 食物篇（？）
  '螺蛳粉的味道', '火锅的热情', '奶茶的快乐', '炸鸡的罪恶', '沙拉的自欺'
];

// 生成复合名称的模板
const NAME_TEMPLATES = [
  '{element}之{emotion}',      // 霜之哀伤
  '{element}{action}',         // 焚天、裂地
  '{action}之{element}',       // 吞噬之炎
  '{adj}{weapon}',             // 血色长剑
  '{element}{weapon}',         // 雷霆战锤
  '{creature}之{part}',        // 凤凰之羽
  '{god}的{weapon}',           // 雷神的锤子 -> 简化
  '{emotion}的{element}',      // 愤怒的烈焰
];

/**
 * 生成武器名称
 * @param {string} weaponType - 武器类型ID
 * @param {string} element - 元素类型
 * @param {number} pixelCount - 像素数量
 * @returns {string} 生成的武器名称
 */
const generateWeaponName = (weaponType, element, pixelCount) => {
  const elementData = ELEMENT_NAMES[element] || ELEMENT_NAMES.steel;
  const weaponData = WEAPON_DATABASE[weaponType];
  const weaponBaseName = weaponData?.name || '武器';
  
  // 获取元素的中文名（用于经典命名）
  const elementColorKey = Object.keys(PIXEL_COLORS).find(k => PIXEL_COLORS[k].element === element);
  const elementChineseName = PIXEL_COLORS[elementColorKey]?.name || '神秘';
  
  // 所有风格平等随机
  const style = Math.random();
  
  if (style < 0.15) {
    // 15% 概率: 传说级/中二名称
    return LEGENDARY_NAMES[Math.floor(Math.random() * LEGENDARY_NAMES.length)];
  } else if (style < 0.30) {
    // 15% 概率: 趣味/meme名称
    return QUIRKY_NAMES[Math.floor(Math.random() * QUIRKY_NAMES.length)];
  } else if (style < 0.50) {
    // 20% 概率: 经典风格 "元素+武器名" (如：火焰剑、冰霜弓)
    return `${elementChineseName}${weaponBaseName}`;
  } else if (style < 0.65 && elementData.full) {
    // 15% 概率: 使用预设的完整酷炫名称 (如：霜之哀伤)
    return elementData.full[Math.floor(Math.random() * elementData.full.length)];
  } else if (style < 0.80) {
    // 15% 概率: 使用 "前缀+中+后缀" 格式 (如：炎之高兴)
    const prefix = elementData.prefix[Math.floor(Math.random() * elementData.prefix.length)];
    const middle = elementData.middle[Math.floor(Math.random() * elementData.middle.length)];
    const suffix = elementData.suffix[Math.floor(Math.random() * elementData.suffix.length)];
    return `${prefix}${middle}${suffix}`;
  } else if (style < 0.90) {
    // 10% 概率: 使用武器类型相关名称 (如：炎·斩龙者)
    const typeNames = WEAPON_TYPE_NAMES[weaponType];
    if (typeNames) {
      const prefix = elementData.prefix[Math.floor(Math.random() * elementData.prefix.length)];
      const typeName = typeNames[Math.floor(Math.random() * typeNames.length)];
      return `${prefix}·${typeName}`;
    }
    return `${elementChineseName}${weaponBaseName}`;
  } else {
    // 10% 概率: 品质前缀风格 (如：精良的火焰剑)
    const qualityPrefixes = pixelCount >= 40 
      ? ['传奇的', '史诗级', '远古的', '神圣的', '不朽的']
      : pixelCount >= 30 
        ? ['精良的', '大师级', '附魔的', '魔法的', '稀有的']
        : pixelCount >= 20
          ? ['优质的', '强化的', '锻造的', '改良的', '精制的']
          : ['普通的', '简陋的', '旧', '生锈的', '破旧的'];
    const qualityPrefix = qualityPrefixes[Math.floor(Math.random() * qualityPrefixes.length)];
    return `${qualityPrefix}${elementChineseName}${weaponBaseName}`;
  }
};

// 武器背景故事/简介词库
const WEAPON_LORE = {
  // 近战武器
  sword: [
    "据说这把剑曾经属于一位传奇骑士，但他用它切了一辈子的面包。",
    "铸剑师在打造这把剑时打了个喷嚏，所以剑身上有个奇怪的弯曲。他称之为'设计特色'。",
    "上一任主人用这把剑退休后开了一家剑道学校，现在他教小朋友用木剑。",
    "这把剑的剑鞘里藏着一张羊皮纸，上面写着：'如果你能读到这个，说明你已经拔出了剑，祝你好运。'",
    "传说只有纯洁之人才能挥舞这把剑。目前为止没有人能证明这个传说。",
    "锻造这把剑的矮人大师说：'这是我毕生最完美的作品。'然后他做了一百把一模一样的。",
  ],
  longsword: [
    "这把长剑太长了，以至于前任主人总是在门框上卡住。",
    "根据记载，这把剑曾经斩杀过一条巨龙。但更多的记载显示，它斩杀过更多的杂草。",
    "剑身上刻着古老的文字：'保修期已过'。",
    "据说这把剑会在月圆之夜发出微光。但也可能只是沾了萤火虫。",
  ],
  katana: [
    "这把太刀来自东方，带着神秘的异域风情，以及一股淡淡的拉面味。",
    "上一任主人是一位武士，他用这把刀切过无数敌人——主要是切成寿司。",
    "刀鞘内侧刻着：'请勿用于开快递'。",
    "传说拔出这把刀的人必须负责把它擦干净再放回去。",
  ],
  dagger: [
    "这把匕首小巧精致，非常适合...削苹果。",
    "上一任主人是个刺客，但他转行做了厨师。这把刀现在主要用来切洋葱。",
    "刀柄上刻着：'请勿用于背刺队友'。",
    "据说这把匕首喝过一千人的血。但更可能是番茄酱。",
  ],
  axe: [
    "这把战斧的前任主人是个伐木工，他砍了三十年的树，然后环保组织给他发了奖。",
    "斧刃上刻着：'本产品不支持七天无理由退换'。",
    "锻造这把斧头的矮人说：'它可以劈开任何东西！'但他没告诉你需要多少力气。",
  ],
  hammer: [
    "这把战锤重达一百磅。上一任主人主要用它来健身。",
    "锤头上刻着：'如果问题不能被砸碎，那就是锤子不够大。'",
    "据说这把锤子曾经属于一位铁匠之神。但他用它主要是敲钉子。",
    "使用说明：请确保在挥动前清空周围三米内的所有易碎物品和队友。",
  ],
  
  // 远程武器
  bow: [
    "这把弓的弓弦是用龙的胡须做的。那条龙到现在还在生气。",
    "上一任主人是神射手，百发百中。主要是因为他只在三米内射击。",
    "弓身上刻着：'瞄准的时候请闭一只眼。另一只也可以闭上，这样就不会看到自己射偏了。'",
  ],
  crossbow: [
    "这把弩附带了一本三百页的使用手册。前任主人在读完之前就退休了。",
    "机关精密复杂，需要三十秒才能上弦。但打出去的箭很帅。",
    "弩身上贴着一张标签：'危险！请勿对准脸部。尤其是自己的。'",
  ],
  
  // 枪械
  pistol: [
    "这把手枪来自一个遥远的时代，那时候人们觉得用火药推动金属块是个好主意。",
    "枪柄上刻着十七道刻痕。没人知道代表什么，前任主人只是喜欢在上面画画。",
    "使用说明：请先确认这是一把真枪，而不是打火机。",
    "据说这把枪从不走火。因为它经常哑火。",
  ],
  rifle: [
    "这把步枪的瞄准镜上贴着一张纸条：'物体比看起来更近'。",
    "前任主人是个猎人，但他近视八百度，所以主要负责吓唬猎物。",
    "枪托上有磨损痕迹，显示它被当作拐杖用了很长时间。",
  ],
  sniper: [
    "这把狙击枪可以在一公里外打中目标。瞄准需要十分钟，喝杯咖啡再来。",
    "枪身上刻着：'不是每一枪都要射中，但每一枪都要帅。'",
    "前任主人是个狙击手，现在他开了一家眼镜店。",
  ],
  shotgun: [
    "这把霰弹枪的射击范围很广，意味着你不需要瞄太准。非常适合懒人。",
    "枪管上写着：'近距离社交工具'。",
    "使用这把枪的时候，请确保你站在安全距离——最好是另一个房间。",
  ],
  
  // 魔法武器
  staff: [
    "这根法杖的前任主人是个巫师，他用它敲过无数次自己的脑袋来思考问题。",
    "杖身上的水晶是假的，但魔法是真的。大概。",
    "使用说明：请不要把它当成普通的棍子使用。它会生气。",
    "这根法杖曾经属于一位大魔法师。他用它主要是当拐杖。",
  ],
  wand: [
    "这根魔杖是用凤凰羽毛做芯的。那只凤凰至今还在追讨版权费。",
    "挥舞的时候请说'阿布拉卡达布拉'。不说也可以，但会少很多仪式感。",
    "前任主人是个魔法师，他用这根魔杖主要是指挥交通。",
  ],
  orb: [
    "这个水晶球可以预见未来。但它预见到的主要是'你会继续盯着我看'。",
    "球体内部似乎有东西在游动。可能是魔法能量，也可能是气泡。",
    "使用说明：请勿用于保龄球。",
  ],
  
  // 忍者武器
  shuriken: [
    "这些手里剑来自东方，每一枚都是忍者大师亲手打造的。那个大师现在开了淘宝店。",
    "投掷时请喊出技能名。虽然不影响效果，但会很帅。",
    "一共有七枚。如果你数出来只有六枚，请检查你的背后。",
  ],
  kunai: [
    "这把苦无是忍者的标志性武器。但大多数时候它被用来开罐头。",
    "刃上刻着：'请勿用于削铅笔'。",
    "前任主人是个忍者，他现在经营着一家很成功的飞刀表演团。",
  ],
  
  // 防具
  shield: [
    "这面盾牌上的凹痕告诉我们，前任主人非常擅长用脸接攻击。用盾的话就差一点。",
    "盾牌背面刻着：'这一面朝向自己'。很贴心的提醒。",
    "据说这面盾牌曾经挡住过龙息。但更多的时候它挡住的是雨。",
  ],
  
  // 特殊武器
  guitar: [
    "这把战斗吉他可以同时摇滚和杀敌。前任主人是个吟游诗人兼冒险者。",
    "每次攻击都会自动播放一段即兴solo。敌人倒下时BGM会达到高潮。",
    "琴弦是用巨龙的筋腱做的。所以弹奏的时候偶尔会有龙吼声。",
  ],
  umbrella: [
    "这把伞在下雨时是伞，战斗时是剑。但如果战斗时下雨...情况会有点复杂。",
    "绅士的选择。即使在杀敌的时候也要保持优雅和干爽。",
    "伞柄上刻着：'即使世界末日，也不能忘记带伞'。",
  ],
  yo_yo: [
    "不要小看这个溜溜球。前任主人用它打败过三个恶魔领主和一个甜甜圈。",
    "使用时请确保线不会缠到自己。已经有七个勇者因此而亡。",
    "这个溜溜球曾经是玩具，直到有人发现往里面塞炸药效果不错。",
  ],
  cards: [
    "这副飞牌一共54张。如果你用了一张，战斗结束后请记得捡回来。",
    "每张牌都附有魔法。大小王的魔法特别强，但没人知道具体是什么。",
    "前任主人是个赌徒，他发现用牌打人比打牌更赚钱。",
  ],
  
  // 传说武器
  excalibur: [
    "这把圣剑只有真正的王者才能拔出。所以它一直插在石头里，直到有人带了电锯。",
    "剑身会发光，但亮度取决于使用者的高尚程度。目前它是夜灯亮度。",
    "湖中女神亲自赠予的神器。发票已丢失，不支持退换。",
  ],
  mjolnir: [
    "只有'有资格的人'才能举起这把锤子。资格认证需要填表并等待3-5个工作日。",
    "每次落地都会召唤雷电。所以请不要在室内使用，会跳闸。",
    "锤子自带回旋功能。但如果接不住，后果自负。",
  ],
  lightsaber: [
    "这把光剑的颜色取决于使用者的心灵。目前它是灰色的，因为大多数人内心都挺复杂。",
    "使用前请确保关闭。已经有太多新手在开关的时候伤到自己了。",
    "虽然叫'光剑'，但它不能照明。这是个设计失误。",
  ],
};

// 通用后备简介
const GENERIC_LORE = [
  "这件武器的历史已经无从考证，但它看起来很厉害的样子。",
  "据说制作者在完成后说了一句：'凑合着用吧。'",
  "这件武器曾经很普通，直到它被像素锻造术重新打造。",
  "上一任主人把它留在了酒馆里。可能是喝多了忘拿了。",
  "关于这件武器的传说有很多版本，但它们都是编的。",
  "锻造师在制作时非常用心，但他也承认'是骡子是马拉出来遛遛'。",
  "这件武器经过了严格的质量检测。检测员说：'还行吧'。",
  "原产地不明，但看起来不像是这个世界的东西。可能是穿越过来的。",
];

/**
 * 生成武器简介/背景故事
 * @param {string} weaponType - 武器类型ID
 * @returns {string} 武器简介
 */
const generateWeaponLore = (weaponType) => {
  const loreList = WEAPON_LORE[weaponType] || GENERIC_LORE;
  return loreList[Math.floor(Math.random() * loreList.length)];
};

/* ============================================================================
 * 第3部分: UI 组件
 * ============================================================================
 * 
 * 包含游戏中使用的所有 UI 组件:
 * - GothicTitle: 哥特风格的标题文字
 * - RuneButton: 带有符文效果的按钮
 * - ScrollPanel: 羊皮纸卷轴风格的面板
 */

/**
 * 哥特风格标题组件
 * @param {string} size - 大小: 'lg' | 'md' | 'sm'
 */
const GothicTitle = ({ children, size = 'lg' }) => (
  <h1 style={{
    fontFamily: "'Cinzel Decorative', 'MedievalSharp', serif",
    fontSize: size === 'lg' ? '2.5rem' : size === 'md' ? '1.8rem' : '1.2rem',
    background: 'linear-gradient(180deg, #ffd700 0%, #b8860b 50%, #8b6914 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
    letterSpacing: '0.1em',
    margin: 0,
    textAlign: 'center',
  }}>
    {children}
  </h1>
);

/**
 * 符文按钮组件
 * @param {string} variant - 样式变体: 'primary' | 'secondary'
 * @param {boolean} disabled - 是否禁用
 */
const RuneButton = ({ children, onClick, variant = 'primary', disabled = false, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '12px 24px',
      fontSize: '1rem',
      fontFamily: "'Cinzel', serif",
      fontWeight: 600,
      border: 'none',
      borderRadius: '4px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      opacity: disabled ? 0.5 : 1,
      background: variant === 'primary' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : variant === 'danger'
        ? 'linear-gradient(135deg, #4a0000 0%, #8b0000 100%)'
        : 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
      color: variant === 'primary' ? '#ffd700' : '#fff',
      boxShadow: variant === 'primary'
        ? '0 0 20px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        : '0 4px 15px rgba(0,0,0,0.3)',
      ...style,
    }}
  >
    <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)',
      transform: 'translateX(-100%)',
      animation: 'shimmer 3s infinite',
    }} />
  </button>
);

const ScrollPanel = ({ children, title, style = {} }) => (
  <div style={{
    background: 'linear-gradient(180deg, rgba(20, 15, 10, 0.95) 0%, rgba(30, 20, 15, 0.98) 100%)',
    border: '2px solid #8b7355',
    borderRadius: '8px',
    padding: '20px',
    position: 'relative',
    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.5)',
    ...style,
  }}>
    {title && (
      <div style={{
        position: 'absolute',
        top: '-12px',
        left: '20px',
        background: '#1a1510',
        padding: '0 15px',
        borderRadius: '4px',
        border: '1px solid #8b7355',
      }}>
        <span style={{ color: '#ffd700', fontFamily: "'Cinzel', serif", fontSize: '0.9rem' }}>
          {title}
        </span>
      </div>
    )}
    {children}
  </div>
);

/* ============================================================================
 * 第4部分: 像素武器编辑器
 * ============================================================================
 * 
 * 包含:
 * - 16x16 像素绘制网格
 * - 形状特征提取算法 (宽度、高度、对称性、密度等)
 * - 本地武器匹配算法 (基于特征评分)
 * - AI 智能识别 (调用大模型 API 进行分析)
 * - 自定义命名功能 (玩家可以手动指定武器类型)
 */

/**
 * 像素武器编辑器组件
 * 
 * @param {Array} weapon - 16x16 的二维数组，存储每个像素的颜色
 * @param {Function} setWeapon - 更新武器数据的函数
 * @param {number} pixelCount - 可用的像素点数量
 * @param {Function} onWeaponAnalyzed - 武器分析完成时的回调
 */
const PixelWeaponEditor = ({ weapon, setWeapon, pixelCount, onWeaponAnalyzed }) => {
  const [selectedColor, setSelectedColor] = useState('red');
  const [isErasing, setIsErasing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiWeaponResult, setAiWeaponResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  
  // 自定义命名相关状态
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customWeaponName, setCustomWeaponName] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  const gridSize = 16;
  
  // 计算已使用的像素数量
  const countUsedPixels = () => {
    return weapon.filter(row => row.some(cell => cell !== null)).flat().filter(c => c !== null).length;
  };

  /**
   * 处理像素点击事件
   * - 擦除模式: 清除该像素
   * - 绘制模式: 填充选中的颜色
   */
  const handlePixelClick = (row, col) => {
    const used = countUsedPixels();
    const currentPixel = weapon[row][col];
    
    if (isErasing) {
      const newWeapon = weapon.map((r, ri) => 
        r.map((c, ci) => ri === row && ci === col ? null : c)
      );
      setWeapon(newWeapon);
      setAiWeaponResult(null); // 武器改变时重置 AI 分析结果
    } else if (currentPixel === null && used < pixelCount) {
      const newWeapon = weapon.map((r, ri) => 
        r.map((c, ci) => ri === row && ci === col ? selectedColor : c)
      );
      setWeapon(newWeapon);
      setAiWeaponResult(null);
    } else if (currentPixel !== null) {
      const newWeapon = weapon.map((r, ri) => 
        r.map((c, ci) => ri === row && ci === col ? selectedColor : c)
      );
      setWeapon(newWeapon);
      setAiWeaponResult(null);
    }
  };

  /**
   * 从像素网格中提取形状特征
   * 用于武器类型识别
   * 
   * @returns {Object} 形状特征对象
   */
  const extractShapeFeatures = () => {
    const colors = {};
    let totalPixels = 0;
    let minRow = gridSize, maxRow = 0, minCol = gridSize, maxCol = 0;
    const pixelPositions = [];
    
    weapon.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell) {
          totalPixels++;
          colors[cell] = (colors[cell] || 0) + 1;
          minRow = Math.min(minRow, ri);
          maxRow = Math.max(maxRow, ri);
          minCol = Math.min(minCol, ci);
          maxCol = Math.max(maxCol, ci);
          pixelPositions.push({ row: ri, col: ci, color: cell });
        }
      });
    });

    if (totalPixels === 0) return null;

    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    const aspectRatio = height / width;
    const density = totalPixels / (width * height);
    
    // 计算对称性
    let horizontalSymmetry = 0;
    let verticalSymmetry = 0;
    const centerCol = (minCol + maxCol) / 2;
    const centerRow = (minRow + maxRow) / 2;
    
    pixelPositions.forEach(pos => {
      const mirrorCol = Math.round(2 * centerCol - pos.col);
      const mirrorRow = Math.round(2 * centerRow - pos.row);
      if (weapon[pos.row]?.[mirrorCol]) horizontalSymmetry++;
      if (weapon[mirrorRow]?.[pos.col]) verticalSymmetry++;
    });
    
    horizontalSymmetry = horizontalSymmetry / totalPixels;
    verticalSymmetry = verticalSymmetry / totalPixels;

    // 检测特定图案
    const hasHandle = pixelPositions.some(p => p.row > maxRow - 3);
    const hasHead = pixelPositions.filter(p => p.row < minRow + 4).length > 4;
    const hasCurve = checkForCurve(pixelPositions, minRow, maxRow, minCol, maxCol);
    const hasHole = checkForHole(weapon, minRow, maxRow, minCol, maxCol);
    const isBranched = checkForBranches(pixelPositions, minRow, maxRow, minCol, maxCol);
    const hasPointyEnd = checkPointyEnd(pixelPositions, minRow, maxRow, minCol, maxCol);
    const hasTriggerShape = checkTriggerShape(weapon, minRow, maxRow, minCol, maxCol);
    const starPattern = checkStarPattern(pixelPositions, centerRow, centerCol);
    
    return {
      width, height, aspectRatio, density, totalPixels,
      horizontalSymmetry, verticalSymmetry,
      hasHandle, hasHead, hasCurve, hasHole, isBranched, 
      hasPointyEnd, hasTriggerShape, starPattern,
      colors: Object.entries(colors).map(([c, count]) => ({ color: c, count, info: PIXEL_COLORS[c] })),
      dominantColor: Object.entries(colors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'gray',
      boundingBox: { minRow, maxRow, minCol, maxCol }
    };
  };

  /** 检测弧形图案 (如弓) */
  const checkForCurve = (positions, minRow, maxRow, minCol, maxCol) => {
    const midRow = (minRow + maxRow) / 2;
    const topPositions = positions.filter(p => p.row < midRow);
    const bottomPositions = positions.filter(p => p.row >= midRow);
    
    if (topPositions.length === 0 || bottomPositions.length === 0) return false;
    
    const topAvgCol = topPositions.reduce((sum, p) => sum + p.col, 0) / topPositions.length;
    const bottomAvgCol = bottomPositions.reduce((sum, p) => sum + p.col, 0) / bottomPositions.length;
    
    return Math.abs(topAvgCol - bottomAvgCol) > 2;
  };

  const checkForHole = (grid, minRow, maxRow, minCol, maxCol) => {
    // Check for empty spaces surrounded by pixels (like trigger guard)
    for (let r = minRow + 1; r < maxRow; r++) {
      for (let c = minCol + 1; c < maxCol; c++) {
        if (!grid[r][c] && grid[r-1]?.[c] && grid[r+1]?.[c] && grid[r]?.[c-1] && grid[r]?.[c+1]) {
          return true;
        }
      }
    }
    return false;
  };

  const checkForBranches = (positions, minRow, maxRow, minCol, maxCol) => {
    // Check for branching patterns (like axe head, trident)
    const topHalf = positions.filter(p => p.row < (minRow + maxRow) / 2);
    const bottomHalf = positions.filter(p => p.row >= (minRow + maxRow) / 2);
    
    const topWidth = topHalf.length > 0 ? 
      Math.max(...topHalf.map(p => p.col)) - Math.min(...topHalf.map(p => p.col)) : 0;
    const bottomWidth = bottomHalf.length > 0 ?
      Math.max(...bottomHalf.map(p => p.col)) - Math.min(...bottomHalf.map(p => p.col)) : 0;
    
    return topWidth > bottomWidth * 1.5 || bottomWidth > topWidth * 1.5;
  };

  const checkPointyEnd = (positions, minRow, maxRow, minCol, maxCol) => {
    // Check if top or bottom tapers to a point
    const topRow = positions.filter(p => p.row === minRow);
    const bottomRow = positions.filter(p => p.row === maxRow);
    return topRow.length <= 2 || bottomRow.length <= 2;
  };

  const checkTriggerShape = (grid, minRow, maxRow, minCol, maxCol) => {
    // Look for L-shaped or gun-like trigger pattern
    const height = maxRow - minRow;
    const midRow = Math.floor((minRow + maxRow) / 2);
    
    // Check for protrusion in lower half (trigger/grip)
    let hasProtrusion = false;
    for (let r = midRow; r <= maxRow; r++) {
      let rowPixels = 0;
      for (let c = minCol; c <= maxCol; c++) {
        if (grid[r]?.[c]) rowPixels++;
      }
      if (rowPixels < 3) hasProtrusion = true;
    }
    return hasProtrusion && height > 4;
  };

  const checkStarPattern = (positions, centerRow, centerCol) => {
    // Check for star/shuriken pattern (points radiating from center)
    if (positions.length < 8) return false;
    
    const distancesFromCenter = positions.map(p => 
      Math.sqrt(Math.pow(p.row - centerRow, 2) + Math.pow(p.col - centerCol, 2))
    );
    
    const avgDistance = distancesFromCenter.reduce((a, b) => a + b, 0) / distancesFromCenter.length;
    const variance = distancesFromCenter.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distancesFromCenter.length;
    
    // High variance indicates star pattern
    return variance > 2;
  };

  // Local shape matching (fast, no API)
  const matchShapeLocally = (features) => {
    if (!features) return null;
    
    const { aspectRatio, density, horizontalSymmetry, verticalSymmetry,
            hasHandle, hasHead, hasCurve, hasHole, isBranched, 
            hasPointyEnd, hasTriggerShape, starPattern, totalPixels, width, height } = features;
    
    // Score each weapon type
    const scores = {};
    
    // Gun patterns (pistol, rifle, etc.)
    if (hasTriggerShape && hasHole && aspectRatio < 1.5 && aspectRatio > 0.3) {
      if (width > 10) {
        scores.rifle = 90;
        scores.smg = 85;
        scores.shotgun = 80;
      } else {
        scores.pistol = 95;
        scores.revolver = 85;
      }
    }
    
    // Long vertical = swords, spears, staffs
    if (aspectRatio > 3) {
      if (density < 0.3) {
        scores.spear = 90;
        scores.staff = 85;
      } else if (hasPointyEnd) {
        scores.longsword = 90;
        scores.katana = 85;
        scores.sword = 80;
      } else {
        scores.staff = 85;
        scores.spear = 80;
      }
    }
    
    // Star pattern = shuriken
    if (starPattern && horizontalSymmetry > 0.6 && verticalSymmetry > 0.6) {
      scores.shuriken = 95;
      scores.chakram = 80;
    }
    
    // Curved shape = bow
    if (hasCurve && aspectRatio > 1.5 && density < 0.4) {
      scores.bow = 90;
      scores.longbow = 85;
    }
    
    // Wide top with handle = axe, hammer
    if (isBranched && hasHandle) {
      if (density > 0.5) {
        scores.hammer = 90;
        scores.mace = 85;
      } else {
        scores.axe = 90;
        scores.halberd = 85;
      }
    }
    
    // Trident pattern (3 points)
    if (isBranched && aspectRatio > 2 && hasPointyEnd) {
      scores.trident = 90;
      scores.halberd = 80;
    }
    
    // Small and compact = dagger, kunai
    if (totalPixels < 15 && aspectRatio > 1.5 && aspectRatio < 3) {
      scores.dagger = 85;
      scores.kunai = 80;
    }
    
    // Large block = shield
    if (aspectRatio > 0.8 && aspectRatio < 1.3 && density > 0.6 && totalPixels > 30) {
      scores.shield = 90;
      scores.towershield = 80;
    }
    
    // Wide horizontal = bow, crossbow
    if (aspectRatio < 0.5 && hasCurve) {
      scores.bow = 85;
      scores.crossbow = 80;
    }
    
    // Circular/orb pattern
    if (horizontalSymmetry > 0.8 && verticalSymmetry > 0.8 && density > 0.5 && aspectRatio > 0.8 && aspectRatio < 1.2) {
      scores.orb = 90;
      scores.bomb = 75;
    }
    
    // Find best match
    const bestMatch = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    
    if (bestMatch && bestMatch[1] > 60) {
      return bestMatch[0];
    }
    
    // Fallback based on basic shape
    if (aspectRatio > 2) return 'sword';
    if (aspectRatio < 0.5) return 'bow';
    if (density > 0.7) return 'shield';
    return 'unknown';
  };

  /**
   * AI 智能武器识别
   * 调用大模型 API 分析像素图案，识别武器类型
   * 支持多种 API 后端 (通过 API_CONFIG 配置)
   */
  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    const features = extractShapeFeatures();
    if (!features) {
      setIsAnalyzing(false);
      return;
    }

    // 首先使用本地匹配作为备选
    const localMatch = matchShapeLocally(features);
    
    try {
      // 构建武器形状描述文本
      const shapeDescription = `
        像素武器形状分析:
        - 尺寸: ${features.width}x${features.height} 像素
        - 长宽比: ${features.aspectRatio.toFixed(2)} (>2是长条形, <0.5是扁平形)
        - 像素密度: ${(features.density * 100).toFixed(0)}%
        - 总像素数: ${features.totalPixels}
        - 水平对称性: ${(features.horizontalSymmetry * 100).toFixed(0)}%
        - 垂直对称性: ${(features.verticalSymmetry * 100).toFixed(0)}%
        - 特征: ${[
          features.hasHandle ? '有握柄' : '',
          features.hasHead ? '顶部有大块' : '',
          features.hasCurve ? '有弧度' : '',
          features.hasHole ? '有孔洞(可能是扳机护圈)' : '',
          features.isBranched ? '有分叉' : '',
          features.hasPointyEnd ? '有尖端' : '',
          features.hasTriggerShape ? '类似枪械形状' : '',
          features.starPattern ? '星形/放射状' : '',
        ].filter(Boolean).join(', ')}
        - 主要颜色: ${PIXEL_COLORS[features.dominantColor]?.name || features.dominantColor}
        - 本地匹配建议: ${localMatch}
      `;

      // 武器识别系统提示词 - 支持生成 meme 风格的名称和简介
      const systemPrompt = `你是一个武器识别专家，同时也是一个网络meme爱好者。根据像素艺术的形状特征，判断这可能是什么武器，并给它起一个有趣的名字和编写一段搞笑/有梗的简介。

可选的武器类型包括但不限于:
近战: sword, longsword, katana, dagger, axe, hammer, mace, spear, halberd, scythe, whip, claws, gauntlet, nunchaku, sai
远程: bow, longbow, crossbow, slingshot, javelin, chakram
忍者: shuriken, kunai, kusarigama, blowgun
枪械: pistol, revolver, rifle, shotgun, smg, machinegun, sniper
重型: cannon, rocketlauncher, minigun, flamethrower, railgun
魔法: staff, wand, orb, tome, scepter
防具: shield, buckler, towershield
特殊: boomerang, bomb, grenade, mine, net, hook, fan, umbrella, guitar, cards, yo_yo
传说: excalibur, mjolnir, trident, gunblade, chainsword, lightsaber
科技: lasergun, plasmarifle, taser, drone, mech_arm

命名风格参考（随机选择一种）:
- 经典风格: "火焰剑"、"冰霜弓"
- 中二风: "霜之哀伤"、"命运裁决者"、"深渊凝视"
- 网络meme: "六边形战士"、"遥遥领先"、"芭比Q了"、"CPU烧了"
- 职场梗: "KPI收割者"、"DDL粉碎机"、"甲方需求毁灭者"
- 生活梗: "妈妈的拖鞋"、"外卖的温度"、"闹钟的绝望"
- 游戏梗: "原神启动"、"一刀999"、"是兄弟就来砍我"

简介风格: 可以搞笑、讽刺、玩梗、打破第四面墙、吐槽，也可以正经地扩展世界观。

请返回JSON格式:
{
  "weapon": "武器英文ID",
  "confidence": 0-100的置信度,
  "reasoning": "简短的判断理由",
  "alternates": ["备选武器1", "备选武器2"],
  "suggestedName": "建议的武器名称（可选，如果你想到了特别有趣的名字）",
  "suggestedLore": "建议的武器简介（可选，1-2句话，要有趣或有梗）"
}`;

      // 使用通用 API 调用函数 (支持多种后端)
      const response = await callAIAPI(systemPrompt, shapeDescription, { includeWebSearch: true });

      if (response) {
        try {
          const cleanText = response.replace(/```json|```/g, '').trim();
          const result = JSON.parse(cleanText);
          
          const weaponData = WEAPON_DATABASE[result.weapon] || WEAPON_DATABASE.unknown;
          const colorInfo = PIXEL_COLORS[features.dominantColor];
          
          // 如果 AI 提供了建议的名称就用 AI 的，否则用本地生成
          const generatedName = result.suggestedName || generateWeaponName(result.weapon, colorInfo.element, features.totalPixels);
          const generatedLore = result.suggestedLore || generateWeaponLore(result.weapon);
          
          const finalResult = {
            ...weaponData,
            id: result.weapon,
            name: generatedName,
            baseName: weaponData.name,
            lore: generatedLore,
            element: colorInfo.element,
            elementEmoji: colorInfo.emoji,
            effect: colorInfo.effect,
            damage: Math.floor((weaponData.baseAtk + colorInfo.damage) * (1 + features.totalPixels * 0.03)),
            confidence: result.confidence,
            reasoning: result.reasoning,
            alternates: result.alternates,
            pixelCount: features.totalPixels,
            colors: features.colors,
            aiAnalyzed: true
          };
          
          setAiWeaponResult(finalResult);
          if (onWeaponAnalyzed) onWeaponAnalyzed(finalResult);
        } catch (parseError) {
          // JSON 解析失败，使用本地结果
          useLocalResult(localMatch, features);
        }
      } else {
        // API 调用失败，使用本地结果
        useLocalResult(localMatch, features);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      useLocalResult(localMatch, features);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 使用本地结果 (当 API 调用失败时的备选方案)
   */
  const useLocalResult = (localMatch, features) => {
    const weaponData = WEAPON_DATABASE[localMatch] || WEAPON_DATABASE.unknown;
    const colorInfo = PIXEL_COLORS[features.dominantColor];
    
    // 生成独特的武器名称和简介
    const generatedName = generateWeaponName(localMatch, colorInfo.element, features.totalPixels);
    const generatedLore = generateWeaponLore(localMatch);
    
    const result = {
      ...weaponData,
      id: localMatch,
      name: generatedName,
      baseName: weaponData.name,
      lore: generatedLore,
      element: colorInfo.element,
      elementEmoji: colorInfo.emoji,
      effect: colorInfo.effect,
      damage: Math.floor((weaponData.baseAtk + colorInfo.damage) * (1 + features.totalPixels * 0.03)),
      confidence: 70,
      reasoning: '基于形状特征的本地分析',
      pixelCount: features.totalPixels,
      colors: features.colors,
      aiAnalyzed: false
    };
    
    setAiWeaponResult(result);
    if (onWeaponAnalyzed) onWeaponAnalyzed(result);
  };

  /**
   * 自定义武器命名
   * 玩家可以输入想要的武器类型，系统会尝试匹配或让 AI 理解
   */
  const handleCustomWeapon = async () => {
    if (!customWeaponName.trim()) return;
    
    const features = extractShapeFeatures();
    if (!features) return;
    
    setIsCustomizing(true);
    
    // 武器名称映射表 (支持中文和英文)
    const weaponNameMap = {
      // 枪械
      '手枪': 'pistol', 'pistol': 'pistol', '左轮': 'revolver', 'revolver': 'revolver',
      '步枪': 'rifle', 'rifle': 'rifle', '狙击枪': 'sniper', 'sniper': 'sniper',
      '冲锋枪': 'smg', 'smg': 'smg', '机枪': 'machinegun', '霰弹枪': 'shotgun',
      '加特林': 'minigun', 'minigun': 'minigun', '火箭筒': 'rocketlauncher',
      '大炮': 'cannon', 'cannon': 'cannon', '激光枪': 'lasergun',
      
      // 近战
      '剑': 'sword', 'sword': 'sword', '长剑': 'longsword', '太刀': 'katana', 'katana': 'katana',
      '匕首': 'dagger', 'dagger': 'dagger', '斧': 'axe', '战斧': 'axe', 'axe': 'axe',
      '锤': 'hammer', '战锤': 'hammer', 'hammer': 'hammer', '矛': 'spear', '长矛': 'spear',
      '戟': 'halberd', '镰刀': 'scythe', '鞭子': 'whip', '爪': 'claws', '拳套': 'gauntlet',
      '双截棍': 'nunchaku', '链锯剑': 'chainsword', '光剑': 'lightsaber',
      
      // 远程
      '弓': 'bow', 'bow': 'bow', '长弓': 'longbow', '弩': 'crossbow', '弹弓': 'slingshot',
      
      // 忍者
      '手里剑': 'shuriken', 'shuriken': 'shuriken', '苦无': 'kunai', 'kunai': 'kunai',
      '飞镖': 'shuriken', '忍者镖': 'shuriken',
      
      // 魔法
      '法杖': 'staff', 'staff': 'staff', '魔杖': 'wand', 'wand': 'wand',
      '法球': 'orb', 'orb': 'orb', '魔法书': 'tome', '权杖': 'scepter',
      
      // 防具
      '盾': 'shield', '盾牌': 'shield', 'shield': 'shield', '塔盾': 'towershield',
      
      // 特殊
      '回旋镖': 'boomerang', '炸弹': 'bomb', '手雷': 'grenade', '地雷': 'mine',
      '钩爪': 'hook', '扇子': 'fan', '战扇': 'fan', '伞': 'umbrella', '吉他': 'guitar',
      '飞牌': 'cards', '扑克': 'cards', '溜溜球': 'yo_yo',
      
      // 传说
      '圣剑': 'excalibur', '雷神之锤': 'mjolnir', '三叉戟': 'trident', '枪刃': 'gunblade',
      
      // 科技
      '无人机': 'drone', '机械臂': 'mech_arm', '电击枪': 'taser',
    };
    
    const inputLower = customWeaponName.toLowerCase().trim();
    let matchedWeaponId = null;
    
    // 1. 先尝试直接匹配
    for (const [key, value] of Object.entries(weaponNameMap)) {
      if (inputLower.includes(key.toLowerCase())) {
        matchedWeaponId = value;
        break;
      }
    }
    
    // 2. 如果没有匹配，尝试用 AI 理解
    if (!matchedWeaponId) {
      try {
        const systemPrompt = `你是一个武器识别助手。玩家想要创建一个武器，请根据他的描述判断最接近的武器类型。

可选的武器ID:
近战: sword, longsword, katana, dagger, axe, hammer, mace, spear, halberd, scythe, whip, claws, gauntlet, nunchaku, sai
远程: bow, longbow, crossbow, slingshot, javelin, chakram
忍者: shuriken, kunai, kusarigama, blowgun
枪械: pistol, revolver, rifle, shotgun, smg, machinegun, sniper
重型: cannon, rocketlauncher, minigun, flamethrower, railgun
魔法: staff, wand, orb, tome, scepter
防具: shield, buckler, towershield
特殊: boomerang, bomb, grenade, mine, net, hook, fan, umbrella, guitar, cards, yo_yo
传说: excalibur, mjolnir, trident, gunblade, chainsword, lightsaber
科技: lasergun, plasmarifle, taser, drone, mech_arm

请只返回JSON: {"weapon": "武器ID", "reasoning": "简短理由"}`;

        const response = await callAIAPI(systemPrompt, `玩家想要创建的武器是: ${customWeaponName}`);
        
        if (response) {
          try {
            const cleanText = response.replace(/```json|```/g, '').trim();
            const result = JSON.parse(cleanText);
            if (result.weapon && WEAPON_DATABASE[result.weapon]) {
              matchedWeaponId = result.weapon;
            }
          } catch (e) {
            // 解析失败，使用默认
          }
        }
      } catch (e) {
        // API 失败，使用默认
      }
    }
    
    // 3. 如果还是没有匹配，使用 unknown
    if (!matchedWeaponId) {
      matchedWeaponId = 'unknown';
    }
    
    // 4. 生成武器结果 (使用名称和简介生成系统)
    const weaponData = WEAPON_DATABASE[matchedWeaponId] || WEAPON_DATABASE.unknown;
    const colorInfo = PIXEL_COLORS[features.dominantColor];
    
    // 生成独特的武器名称和简介
    const generatedName = generateWeaponName(matchedWeaponId, colorInfo.element, features.totalPixels, customWeaponName);
    const generatedLore = generateWeaponLore(matchedWeaponId);
    
    const finalResult = {
      ...weaponData,
      id: matchedWeaponId,
      name: generatedName,
      baseName: weaponData.name, // 保存基础武器名称
      customName: customWeaponName, // 保存玩家的自定义输入
      lore: generatedLore, // 武器简介/背景故事
      element: colorInfo.element,
      elementEmoji: colorInfo.emoji,
      effect: colorInfo.effect,
      damage: Math.floor((weaponData.baseAtk + colorInfo.damage) * (1 + features.totalPixels * 0.03)),
      confidence: 100, // 玩家自定义的置信度为100
      reasoning: `玩家自定义: "${customWeaponName}" → ${weaponData.name}`,
      pixelCount: features.totalPixels,
      colors: features.colors,
      aiAnalyzed: false,
      isCustom: true
    };
    
    setAiWeaponResult(finalResult);
    if (onWeaponAnalyzed) onWeaponAnalyzed(finalResult);
    setShowCustomInput(false);
    setCustomWeaponName('');
    setIsCustomizing(false);
  };

  /**
   * 随机生成武器
   * 为懒人玩家提供一键生成随机武器的功能
   */
  const generateRandomWeapon = () => {
    // 随机选择要使用的像素数量 (在可用范围内)
    const pixelsToUse = Math.min(pixelCount, Math.floor(Math.random() * 20) + 10); // 10-30个像素
    
    // 清空当前武器
    const newWeapon = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    // 随机选择一种武器形状模式
    const patterns = ['sword', 'axe', 'bow', 'staff', 'shield', 'gun', 'shuriken', 'dagger', 'hammer'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // 随机选择颜色
    const colorKeys = Object.keys(PIXEL_COLORS);
    const mainColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    const secondColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    
    // 根据模式生成像素
    let pixelsPlaced = 0;
    const centerX = 8;
    const centerY = 8;
    
    switch (pattern) {
      case 'sword':
        // 长条形，从上到下
        for (let y = 2; y < 14 && pixelsPlaced < pixelsToUse; y++) {
          newWeapon[y][centerX] = pixelsPlaced % 3 === 0 ? secondColor : mainColor;
          pixelsPlaced++;
          if (y > 10 && pixelsPlaced < pixelsToUse) {
            newWeapon[y][centerX - 1] = mainColor;
            newWeapon[y][centerX + 1] = mainColor;
            pixelsPlaced += 2;
          }
        }
        break;
        
      case 'axe':
        // 斧头形状
        for (let y = 3; y < 13 && pixelsPlaced < pixelsToUse; y++) {
          newWeapon[y][centerX] = mainColor;
          pixelsPlaced++;
        }
        for (let x = centerX - 3; x <= centerX + 1 && pixelsPlaced < pixelsToUse; x++) {
          newWeapon[4][x] = secondColor;
          newWeapon[5][x] = secondColor;
          pixelsPlaced += 2;
        }
        break;
        
      case 'bow':
        // 弓形
        for (let y = 2; y < 14 && pixelsPlaced < pixelsToUse; y++) {
          const offset = Math.abs(y - 8) < 3 ? 2 : (Math.abs(y - 8) < 5 ? 1 : 0);
          newWeapon[y][centerX - offset] = mainColor;
          pixelsPlaced++;
        }
        break;
        
      case 'staff':
        // 法杖
        for (let y = 1; y < 15 && pixelsPlaced < pixelsToUse; y++) {
          newWeapon[y][centerX] = mainColor;
          pixelsPlaced++;
        }
        // 顶部装饰
        if (pixelsPlaced < pixelsToUse) {
          newWeapon[1][centerX - 1] = secondColor;
          newWeapon[1][centerX + 1] = secondColor;
          newWeapon[2][centerX - 1] = secondColor;
          newWeapon[2][centerX + 1] = secondColor;
          pixelsPlaced += 4;
        }
        break;
        
      case 'shield':
        // 盾牌 - 方块形
        for (let y = 4; y < 12 && pixelsPlaced < pixelsToUse; y++) {
          for (let x = 5; x < 11 && pixelsPlaced < pixelsToUse; x++) {
            newWeapon[y][x] = (x + y) % 2 === 0 ? mainColor : secondColor;
            pixelsPlaced++;
          }
        }
        break;
        
      case 'gun':
        // 枪形 - L形
        for (let x = 3; x < 13 && pixelsPlaced < pixelsToUse; x++) {
          newWeapon[7][x] = mainColor;
          pixelsPlaced++;
        }
        for (let y = 7; y < 12 && pixelsPlaced < pixelsToUse; y++) {
          newWeapon[y][5] = secondColor;
          pixelsPlaced++;
        }
        break;
        
      case 'shuriken':
        // 手里剑 - 星形
        const points = [[8, 3], [8, 13], [3, 8], [13, 8], [5, 5], [11, 5], [5, 11], [11, 11]];
        for (const [y, x] of points) {
          if (pixelsPlaced < pixelsToUse) {
            newWeapon[y][x] = mainColor;
            pixelsPlaced++;
          }
        }
        newWeapon[8][8] = secondColor;
        pixelsPlaced++;
        break;
        
      case 'dagger':
        // 匕首 - 短剑
        for (let y = 5; y < 12 && pixelsPlaced < pixelsToUse; y++) {
          newWeapon[y][centerX] = mainColor;
          pixelsPlaced++;
        }
        break;
        
      case 'hammer':
        // 锤子
        for (let y = 5; y < 14 && pixelsPlaced < pixelsToUse; y++) {
          newWeapon[y][centerX] = mainColor;
          pixelsPlaced++;
        }
        for (let x = centerX - 2; x <= centerX + 2 && pixelsPlaced < pixelsToUse; x++) {
          newWeapon[5][x] = secondColor;
          newWeapon[6][x] = secondColor;
          pixelsPlaced += 2;
        }
        break;
    }
    
    setWeapon(newWeapon);
    setAiWeaponResult(null);
  };

  /**
   * 快速本地分析 (用于实时显示)
   */
  const getQuickAnalysis = () => {
    const features = extractShapeFeatures();
    if (!features) return null;
    
    const localMatch = matchShapeLocally(features);
    const weaponData = WEAPON_DATABASE[localMatch] || WEAPON_DATABASE.unknown;
    const colorInfo = PIXEL_COLORS[features.dominantColor];
    
    // 为快速分析也生成名称和简介 (但使用缓存避免每次渲染都变化)
    // 注意：这里简化处理，实际武器名使用基础格式
    return {
      ...weaponData,
      id: localMatch,
      name: `${colorInfo.name}${weaponData.name}`,
      baseName: weaponData.name,
      lore: weaponData.desc, // 快速预览时使用默认描述
      element: colorInfo.element,
      elementEmoji: colorInfo.emoji,
      effect: colorInfo.effect,
      damage: Math.floor((weaponData.baseAtk + colorInfo.damage) * (1 + features.totalPixels * 0.03)),
      pixelCount: features.totalPixels,
      colors: features.colors,
    };
  };

  const quickStats = aiWeaponResult || getQuickAnalysis();

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#ffd700', fontFamily: "'Cinzel', serif" }}>选择元素:</span>
          {Object.entries(PIXEL_COLORS).map(([color, info]) => (
            <button
              key={color}
              onClick={() => { setSelectedColor(color); setIsErasing(false); }}
              title={`${info.name} - ${info.emoji}`}
              style={{
                width: '28px',
                height: '28px',
                background: color === 'white' ? '#f0f0f0' : color,
                border: selectedColor === color && !isErasing ? '3px solid #ffd700' : '2px solid #444',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: selectedColor === color && !isErasing ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
              }}
            />
          ))}
          <button
            onClick={() => setIsErasing(!isErasing)}
            style={{
              padding: '5px 15px',
              background: isErasing ? '#8b0000' : '#333',
              color: '#fff',
              border: isErasing ? '2px solid #ff4444' : '2px solid #555',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
            }}
          >
            🗑️ 擦除
          </button>
          <button
            onClick={generateRandomWeapon}
            style={{
              padding: '5px 15px',
              background: 'linear-gradient(135deg, #2a2a4a 0%, #4a4a6a 100%)',
              color: '#aaccff',
              border: '2px solid #5555aa',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
            }}
            title="随机生成一个武器形状"
          >
            🎲 随机
          </button>
          <button
            onClick={() => {
              setWeapon(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
              setAiWeaponResult(null);
            }}
            style={{
              padding: '5px 15px',
              background: '#333',
              color: '#ff8888',
              border: '2px solid #663333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
            }}
            title="清空画布"
          >
            🧹 清空
          </button>
        </div>
        
        <div style={{ color: '#aaa', marginBottom: '10px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <span>像素点: {countUsedPixels()} / {pixelCount}</span>
          <button
            onClick={analyzeWithAI}
            disabled={isAnalyzing || countUsedPixels() < 5}
            style={{
              padding: '8px 16px',
              background: isAnalyzing 
                ? 'linear-gradient(135deg, #333 0%, #222 100%)'
                : 'linear-gradient(135deg, #1a3a1a 0%, #2a5a2a 100%)',
              color: isAnalyzing ? '#888' : '#7fff00',
              border: '2px solid #3a5a3a',
              borderRadius: '6px',
              cursor: isAnalyzing || countUsedPixels() < 5 ? 'not-allowed' : 'pointer',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isAnalyzing ? (
              <>
                <span style={{ animation: 'pulse 1s infinite' }}>🔍</span>
                AI分析中...
              </>
            ) : (
              <>🤖 AI智能识别</>
            )}
          </button>
        </div>

        {/* 自定义命名区域 */}
        <div style={{ 
          marginBottom: '10px', 
          padding: '10px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '6px',
          border: '1px solid #3a3020'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: showCustomInput ? '10px' : '0'
          }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>
              🎯 识别不准？告诉我你想做什么:
            </span>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              disabled={countUsedPixels() < 3}
              style={{
                padding: '4px 12px',
                background: showCustomInput ? '#4a3020' : '#2a2a2a',
                color: showCustomInput ? '#ffd700' : '#aaa',
                border: '1px solid #4a4030',
                borderRadius: '4px',
                cursor: countUsedPixels() < 3 ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {showCustomInput ? '收起' : '✏️ 自定义'}
            </button>
          </div>
          
          {showCustomInput && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customWeaponName}
                onChange={(e) => setCustomWeaponName(e.target.value)}
                placeholder="输入武器名称，如：手枪、光剑、手里剑..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid #4a4030',
                  borderRadius: '4px',
                  color: '#e0d0c0',
                  fontSize: '0.9rem',
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomWeapon()}
              />
              <button
                onClick={handleCustomWeapon}
                disabled={isCustomizing || !customWeaponName.trim()}
                style={{
                  padding: '8px 16px',
                  background: isCustomizing 
                    ? '#333' 
                    : 'linear-gradient(135deg, #3a2a00 0%, #5a4a00 100%)',
                  color: isCustomizing ? '#888' : '#ffd700',
                  border: '1px solid #6a5a00',
                  borderRadius: '4px',
                  cursor: isCustomizing || !customWeaponName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: "'Cinzel', serif",
                }}
              >
                {isCustomizing ? '识别中...' : '确定'}
              </button>
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 20px)`,
          gap: '1px',
          background: '#222',
          padding: '10px',
          borderRadius: '8px',
          border: '2px solid #4a4030',
        }}>
          {weapon.map((row, ri) => 
            row.map((cell, ci) => (
              <div
                key={`${ri}-${ci}`}
                onClick={() => handlePixelClick(ri, ci)}
                style={{
                  width: '20px',
                  height: '20px',
                  background: cell ? (cell === 'white' ? '#f0f0f0' : cell) : 'rgba(50, 50, 50, 0.5)',
                  border: '1px solid rgba(100,100,100,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  boxShadow: cell ? `0 0 5px ${cell === 'white' ? '#fff' : cell}` : 'none',
                }}
              />
            ))
          )}
        </div>
        
        <div style={{ marginTop: '10px', color: '#666', fontSize: '0.8rem' }}>
          💡 提示: 画好后可以点"AI智能识别"或输入你想要的武器名称
        </div>
      </div>

      {quickStats && (
        <ScrollPanel title="⚔️ 武器属性" style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ color: '#e0d0c0', lineHeight: 1.8 }}>
            <div style={{ 
              fontSize: '1.5rem', 
              color: '#ffd700', 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span>{quickStats.emoji}</span>
              <span>{quickStats.name}</span>
              {aiWeaponResult?.aiAnalyzed && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  background: '#2a5a2a', 
                  color: '#7fff00',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}>
                  AI✓
                </span>
              )}
              {aiWeaponResult?.isCustom && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  background: '#5a4a00', 
                  color: '#ffd700',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}>
                  ✏️ 自定义
                </span>
              )}
            </div>
            
            {/* 显示玩家的自定义名称 */}
            {aiWeaponResult?.customName && (
              <div style={{ 
                color: '#ffd700', 
                fontSize: '0.85rem', 
                marginBottom: '8px',
                padding: '5px 10px',
                background: 'rgba(100,80,0,0.2)',
                borderRadius: '4px',
                borderLeft: '3px solid #ffd700'
              }}>
                🎨 玩家设定: "{aiWeaponResult.customName}"
              </div>
            )}
            
            {/* 武器简介/背景故事 */}
            {(quickStats.lore || quickStats.desc) && (
              <div style={{ 
                color: '#a0a0a0', 
                fontSize: '0.85rem', 
                marginBottom: '12px',
                padding: '10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                fontStyle: 'italic',
                lineHeight: 1.6,
                borderLeft: '3px solid #4a4030'
              }}>
                📜 {quickStats.lore || quickStats.desc}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>📊 攻击力: <span style={{ color: '#ff6b6b' }}>{quickStats.damage}</span></div>
              <div>🎯 类型: <span style={{ color: '#6bff6b' }}>{quickStats.type || 'melee'}</span></div>
              <div>✨ 元素: <span style={{ color: '#6b9fff' }}>{quickStats.elementEmoji} {PIXEL_COLORS[quickStats.colors?.[0]?.color]?.name}</span></div>
              <div>💫 特效: <span style={{ color: '#ff6bff' }}>{quickStats.effect}</span></div>
            </div>
            
            {/* 武器特殊属性 */}
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #3a3020' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '8px' }}>特殊属性:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {quickStats.range && (
                  <span style={{ background: '#2a3a4a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    📏 射程 +{quickStats.range}
                  </span>
                )}
                {quickStats.crit && (
                  <span style={{ background: '#4a2a2a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    💥 暴击 x{quickStats.crit}
                  </span>
                )}
                {quickStats.attackSpeed && (
                  <span style={{ background: '#3a4a2a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    ⚡ 攻速 x{quickStats.attackSpeed}
                  </span>
                )}
                {quickStats.ammo && (
                  <span style={{ background: '#3a3a2a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🔫 弹药 {quickStats.ammo}
                  </span>
                )}
                {quickStats.aoe && (
                  <span style={{ background: '#4a3a2a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    💥 范围 {quickStats.aoe}
                  </span>
                )}
                {quickStats.magic && (
                  <span style={{ background: '#3a2a4a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🔮 魔力 +{quickStats.magic}
                  </span>
                )}
                {quickStats.defense && (
                  <span style={{ background: '#2a4a4a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🛡️ 防御 +{quickStats.defense}
                  </span>
                )}
                {quickStats.stun && (
                  <span style={{ background: '#4a4a2a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    😵 眩晕 {Math.round(quickStats.stun * 100)}%
                  </span>
                )}
                {quickStats.lifesteal && (
                  <span style={{ background: '#4a2a3a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🩸 吸血 {Math.round(quickStats.lifesteal * 100)}%
                  </span>
                )}
                {quickStats.poison && (
                  <span style={{ background: '#2a4a2a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🧪 毒素
                  </span>
                )}
                {quickStats.pierce && (
                  <span style={{ background: '#3a3a4a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🎯 穿透
                  </span>
                )}
                {quickStats.multiHit && (
                  <span style={{ background: '#4a3a3a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    ✴️ 多重打击 x{quickStats.multiHit}
                  </span>
                )}
                {quickStats.legendary && (
                  <span style={{ 
                    background: 'linear-gradient(90deg, #ffd700, #ff8c00)', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    color: '#000',
                    fontWeight: 'bold'
                  }}>
                    ⭐ 传说
                  </span>
                )}
              </div>
            </div>

            {/* AI 分析结果 */}
            {aiWeaponResult?.reasoning && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: 'rgba(0,50,0,0.3)', 
                borderRadius: '6px',
                border: '1px solid #3a5a3a'
              }}>
                <div style={{ color: '#7fff00', fontSize: '0.85rem', marginBottom: '5px' }}>
                  🤖 AI 分析 (置信度: {aiWeaponResult.confidence}%)
                </div>
                <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                  {aiWeaponResult.reasoning}
                </div>
                {aiWeaponResult.alternates?.length > 0 && (
                  <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '5px' }}>
                    其他可能: {aiWeaponResult.alternates.map(a => WEAPON_DATABASE[a]?.name || a).join(', ')}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#888' }}>
              元素组成: {quickStats.colors?.map(c => `${c.info?.emoji}×${c.count}`).join(' ')}
            </div>
          </div>
        </ScrollPanel>
      )}
    </div>
  );
};

/* ============================================================================
 * 第5部分: 角色系统
 * ============================================================================
 * 
 * 包含:
 * - CharacterCreation: 角色创建界面
 * - CharacterSelect: 角色选择界面
 */

/**
 * 角色创建组件
 * 允许玩家创建新角色，选择职业和填写背景故事
 */
const CharacterCreation = ({ onComplete, existingCharacters }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [backstory, setBackstory] = useState('');

  const handleCreate = () => {
    if (!name || !selectedClass) return;
    const classInfo = CHARACTER_CLASSES.find(c => c.id === selectedClass);
    onComplete({
      id: Date.now(),
      name,
      class: selectedClass,
      classInfo,
      backstory,
      level: 1,
      exp: 0,
      hp: classInfo.hp,
      maxHp: classInfo.hp,
      mp: classInfo.mp,
      maxMp: classInfo.mp,
      stats: { str: classInfo.str, int: classInfo.int, agi: classInfo.agi },
      pixelCount: 20,
      weapon: Array(16).fill(null).map(() => Array(16).fill(null)),
      inventory: [],
      gold: 100,
    });
  };

  return (
    <ScrollPanel title="📜 创建角色" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ color: '#ffd700', display: 'block', marginBottom: '8px', fontFamily: "'Cinzel', serif" }}>
            角色名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入你的英雄之名..."
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0,0,0,0.5)',
              border: '2px solid #4a4030',
              borderRadius: '6px',
              color: '#e0d0c0',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label style={{ color: '#ffd700', display: 'block', marginBottom: '12px', fontFamily: "'Cinzel', serif" }}>
            选择职业
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {CHARACTER_CLASSES.map(cls => (
              <div
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                style={{
                  padding: '15px',
                  background: selectedClass === cls.id 
                    ? 'linear-gradient(135deg, #2a2000 0%, #4a3800 100%)' 
                    : 'rgba(0,0,0,0.4)',
                  border: selectedClass === cls.id ? '2px solid #ffd700' : '2px solid #3a3020',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem' }}>{cls.emoji}</div>
                <div style={{ color: '#ffd700', fontWeight: 'bold', marginTop: '5px' }}>{cls.name}</div>
                <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '5px' }}>{cls.desc}</div>
                <div style={{ color: '#6a6a6a', fontSize: '0.7rem', marginTop: '8px' }}>
                  HP:{cls.hp} MP:{cls.mp} 力:{cls.str} 智:{cls.int} 敏:{cls.agi}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={{ color: '#ffd700', display: 'block', marginBottom: '8px', fontFamily: "'Cinzel', serif" }}>
            背景故事 (可选)
          </label>
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="描述你的角色背景..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0,0,0,0.5)',
              border: '2px solid #4a4030',
              borderRadius: '6px',
              color: '#e0d0c0',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <RuneButton onClick={handleCreate} disabled={!name || !selectedClass}>
          ⚔️ 创建角色
        </RuneButton>
      </div>
    </ScrollPanel>
  );
};

/* ============================================================================
 * 第6部分: 世界导入系统
 * ============================================================================
 * 
 * 支持导入预设世界观或自定义故事背景:
 * - 斗罗大陆、火影忍者、哈利波特等预设
 * - 自定义世界观文本导入
 */

/**
 * 世界观导入组件
 * 允许玩家选择预设世界或输入自定义世界观
 */
const StoryImport = ({ onImport }) => {
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState('custom');

  // 预设世界观列表
  const presets = [
    { id: 'douluo', name: '斗罗大陆', desc: '魂师世界的冒险' },
    { id: 'naruto', name: '火影忍者', desc: '忍者世界的传奇' },
    { id: 'hp', name: '哈利波特', desc: '魔法世界的奇遇' },
    { id: 'lotr', name: '魔戒', desc: '中土世界的史诗' },
    { id: 'wuxia', name: '江湖武侠', desc: '刀光剑影的江湖' },
    { id: 'custom', name: '自定义', desc: '输入你的世界观' },
  ];

  return (
    <ScrollPanel title="📖 导入世界观" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {presets.map(preset => (
            <div
              key={preset.id}
              onClick={() => setImportType(preset.id)}
              style={{
                padding: '15px 10px',
                background: importType === preset.id 
                  ? 'linear-gradient(135deg, #1a2a00 0%, #2a4000 100%)' 
                  : 'rgba(0,0,0,0.4)',
                border: importType === preset.id ? '2px solid #7fff00' : '2px solid #3a3020',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#7fff00', fontWeight: 'bold' }}>{preset.name}</div>
              <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '5px' }}>{preset.desc}</div>
            </div>
          ))}
        </div>

        {importType === 'custom' && (
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="粘贴小说章节、世界观设定、或描述你想要的故事背景...&#10;&#10;AI 将根据你的输入自动扩展设定并开始剧情。"
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0,0,0,0.5)',
              border: '2px solid #4a4030',
              borderRadius: '6px',
              color: '#e0d0c0',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        )}

        <RuneButton onClick={() => onImport(importType, importText)}>
          🌍 加载世界
        </RuneButton>
      </div>
    </ScrollPanel>
  );
};

/* ============================================================================
 * 第7部分: 主游戏组件
 * ============================================================================
 * 
 * 游戏核心逻辑，包含:
 * - 游戏状态管理 (screen, characters, storyHistory 等)
 * - AI 剧情生成 (调用大模型 API)
 * - 离线模式备用剧情
 * - 战斗系统与奖励计算
 * - 游戏界面渲染
 */

/**
 * 主游戏组件
 * 管理整个游戏的状态和流程
 */
const DNDGame = () => {
  // ==================== 游戏状态 ====================
  const [screen, setScreen] = useState('title'); // title, characters, create, import, game
  const [characters, setCharacters] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [worldSetting, setWorldSetting] = useState(null);
  const [storyHistory, setStoryHistory] = useState([]);
  const [currentStory, setCurrentStory] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWeaponEditor, setShowWeaponEditor] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const storyEndRef = useRef(null);
  
  // ==================== API 设置状态 ====================
  const [showSettings, setShowSettings] = useState(false);
  const [apiProvider, setApiProvider] = useState(API_CONFIG.provider);
  const [apiKey, setApiKey] = useState('');
  const [apiModel, setApiModel] = useState('');
  
  // 初始化 API 设置
  useEffect(() => {
    const config = API_CONFIG[apiProvider];
    if (config) {
      setApiModel(config.model);
      setApiKey(config.apiKey || '');
    }
  }, [apiProvider]);
  
  // 保存 API 设置
  const saveApiSettings = () => {
    API_CONFIG.provider = apiProvider;
    if (API_CONFIG[apiProvider]) {
      API_CONFIG[apiProvider].apiKey = apiKey;
      API_CONFIG[apiProvider].model = apiModel;
    }
    setShowSettings(false);
  };

  // 自动滚动到最新剧情
  useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyHistory]);

  /**
   * 分析当前装备的武器
   * 根据像素图案计算武器属性
   */
  const analyzeCurrentWeapon = () => {
    if (!currentCharacter) return null;
    const weaponGrid = currentCharacter.weapon;
    const colors = {};
    let totalPixels = 0;
    let minRow = 16, maxRow = 0, minCol = 16, maxCol = 0;
    
    weaponGrid.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell) {
          totalPixels++;
          colors[cell] = (colors[cell] || 0) + 1;
          minRow = Math.min(minRow, ri);
          maxRow = Math.max(maxRow, ri);
          minCol = Math.min(minCol, ci);
          maxCol = Math.max(maxCol, ci);
        }
      });
    });

    if (totalPixels === 0) return null;

    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    const aspectRatio = height / width;
    const density = totalPixels / (width * height);
    
    // Enhanced shape detection
    let shape = 'sword';
    
    // Check for gun-like shapes
    const hasHole = (() => {
      for (let r = minRow + 1; r < maxRow; r++) {
        for (let c = minCol + 1; c < maxCol; c++) {
          if (!weaponGrid[r][c] && weaponGrid[r-1]?.[c] && weaponGrid[r+1]?.[c] && weaponGrid[r]?.[c-1] && weaponGrid[r]?.[c+1]) {
            return true;
          }
        }
      }
      return false;
    })();
    
    // Determine weapon type
    if (hasHole && aspectRatio < 1.5 && aspectRatio > 0.3) {
      shape = width > 10 ? 'rifle' : 'pistol';
    } else if (aspectRatio > 3) {
      shape = density < 0.3 ? 'spear' : 'longsword';
    } else if (aspectRatio < 0.5) {
      shape = 'bow';
    } else if (density > 0.7 && aspectRatio > 0.8 && aspectRatio < 1.3) {
      shape = totalPixels > 30 ? 'shield' : 'orb';
    } else if (aspectRatio > 2) {
      shape = 'sword';
    } else if (width > height * 1.5) {
      shape = 'axe';
    } else if (totalPixels < 15) {
      shape = 'dagger';
    }

    const dominantColor = Object.entries(colors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'gray';
    const colorInfo = PIXEL_COLORS[dominantColor];
    const weaponData = WEAPON_DATABASE[shape] || WEAPON_DATABASE.sword;

    return {
      name: `${colorInfo.name}${weaponData.name}`,
      element: colorInfo.element,
      emoji: weaponData.emoji,
      damage: Math.floor((weaponData.baseAtk + colorInfo.damage) * (1 + totalPixels * 0.03)),
      effect: colorInfo.effect,
      type: weaponData.type,
      ...weaponData, // Include all special properties
    };
  };

  /**
   * 离线剧情生成
   * 当 API 调用失败时使用的备用剧情模板
   * 
   * @param {string} type - 世界类型 (douluo/naruto/hp/lotr/wuxia/custom)
   * @param {string} action - 玩家行动 (可选)
   * @returns {string} 生成的剧情文本
   */
  const generateOfflineStory = (type, action = null) => {
    const weaponInfo = analyzeCurrentWeapon();
    const charName = currentCharacter?.name || '冒险者';
    const className = currentCharacter?.classInfo?.name || '战士';
    const weaponDesc = weaponInfo ? `${weaponInfo.emoji}${weaponInfo.name}` : '简陋的武器';
    
    // 各世界观的开场剧情模板
    const worldStarters = {
      douluo: `【斗罗大陆】\n\n晨曦的光芒洒落在史莱克学院的广场上。你，${charName}，一名年轻的魂师，刚刚觉醒了自己的武魂。\n\n学院的钟声敲响，今天是新生入学测试的日子。你感受着体内流动的魂力，握紧了手中的${weaponDesc}，准备迎接即将到来的挑战。\n\n远处，一位身穿紫袍的老者正注视着你——那是学院的大师，据说他能看穿每个人的魂环潜力。\n\n【选项A】主动走向大师，请求指点\n【选项B】先去训练场热身\n【选项C】寻找其他新生组队\n【选项D】独自探索学院\n\n🎲 请做出你的选择，或描述你想要的行动。\n\n✨ 提示：锻造你的像素武器可以获得更强的战斗力！`,
      
      naruto: `【火影忍者世界】\n\n木叶村的清晨，阳光穿透树叶间的缝隙。你，${charName}，是忍者学院的一名学员，今天将进行毕业考试。\n\n你调整着手中的${weaponDesc}，这是你亲手打造的忍具。查克拉在经络中流动，你感受到了前所未有的力量。\n\n考场外，其他学员们正在紧张地练习。远处，一位戴着面具的暗部忍者似乎在观察着什么...\n\n【选项A】进入考场，展示你的忍术\n【选项B】找同伴进行最后的练习\n【选项C】偷偷跟踪那个暗部忍者\n【选项D】去一乐拉面补充体力\n\n🎲 忍者之路从这里开始！`,
      
      hp: `【魔法世界】\n\n霍格沃茨特快列车的汽笛声响起。你，${charName}，第一次踏上前往魔法学校的旅程。\n\n你的口袋里装着新买的魔杖，行李中还有那件神秘的${weaponDesc}——据说是家族传承的魔法道具。\n\n车厢外，苏格兰高地的风景飞速掠过。隔壁座位的学生正在讨论关于分院帽的传说...\n\n【选项A】加入他们的讨论\n【选项B】独自阅读《标准咒语》\n【选项C】去车厢末尾探索\n【选项D】买些巧克力蛙\n\n🎲 魔法冒险即将展开！`,
      
      lotr: `【中土世界】\n\n夏尔的阳光温暖而慵懒，但你，${charName}，心中却燃烧着冒险的渴望。\n\n你整理好行囊，${weaponDesc}被仔细地系在腰间。灰袍巫师甘道夫的故事在脑海中回响——远方有龙，有宝藏，有等待书写的传奇。\n\n村口的老橡树下，一个神秘的旅人正在休息，他的斗篷下似乎藏着什么...\n\n【选项A】上前与旅人交谈\n【选项B】去绿龙酒馆打听消息\n【选项C】先回家告别家人\n【选项D】直接踏上东去的大路\n\n🎲 伟大的冒险始于第一步！`,
      
      wuxia: `【江湖】\n\n风起云涌的武林，从来不缺少传奇。你，${charName}，一名${className}，手持${weaponDesc}，站在人生的十字路口。\n\n江湖传言，武林盟主之位即将更迭，各大门派蠢蠢欲动。而你收到了一封神秘的请帖，邀你参加三日后的华山论剑。\n\n客栈中，几个江湖人士正在低声议论着什么关于"天下第一"的秘密...\n\n【选项A】凑近偷听他们的谈话\n【选项B】向店小二打听江湖近况\n【选项C】在客栈后院练习武功\n【选项D】立即启程前往华山\n\n🎲 刀光剑影，江湖路远！`,
      
      custom: `【冒险开始】\n\n${charName}，一名${className}，站在命运的起点。\n\n你检查了一下装备：${weaponDesc}在手中闪烁着微光，似乎蕴含着不凡的力量。远方的地平线上，未知的冒险正在等待。\n\n你所在的小镇最近发生了一些奇怪的事情——夜晚有神秘的光芒从北方的森林中传来，失踪的旅人越来越多，镇上的人们开始变得不安。\n\n镇长正在广场上召集冒险者，似乎准备悬赏解决这个问题。\n\n【选项A】去广场应召\n【选项B】独自前往森林调查\n【选项C】先在酒馆收集情报\n【选项D】检查装备，锻造武器\n\n🎲 你的传奇从这里开始！`
    };
    
    // 玩家行动后的响应模板
    const actionResponses = [
      `${charName}的行动引起了注意！\n\n你握紧${weaponDesc}，感受到其中${weaponInfo?.element || '神秘'}的力量在涌动。周围的空气似乎都凝固了。\n\n🎲 投掷判定... 结果：${Math.floor(Math.random() * 20) + 1}！\n\n${Math.random() > 0.5 ? '成功！你的行动取得了效果。' : '局势变得复杂起来...'}\n\n【选项A】继续进攻\n【选项B】观察敌人的反应\n【选项C】使用特殊技能\n【选项D】寻找掩护\n\n✨ 获得 ${Math.floor(Math.random() * 10) + 5} 经验！`,
      
      `战斗的气息弥漫在空气中！\n\n${charName}举起${weaponDesc}，${weaponInfo?.emoji || '⚔️'} ${weaponInfo?.effect || '强大'}的力量开始显现！\n\n🎲 攻击判定：造成 ${weaponInfo?.damage || 10} 点${weaponInfo?.element || '物理'}伤害！\n\n敌人发出一声怒吼，但还没有倒下。你注意到它的动作开始变得迟缓——也许是${weaponInfo?.effect || '你的攻击'}生效了。\n\n【选项A】趁胜追击\n【选项B】保持距离观察\n【选项C】尝试沟通\n【选项D】寻求同伴支援\n\n✨ 获得 ${Math.floor(Math.random() * 5) + 1} 像素点！`,
      
      `你的决定改变了局势！\n\n作为一名${className}，${charName}展现出了非凡的能力。${weaponDesc}在你手中如同有了生命。\n\n周围的人开始对你投来不同的目光——有敬畏，有好奇，也有警惕。\n\n一个神秘的身影从阴影中走出："有趣...很久没见过这样的新人了。"\n\n【选项A】询问对方的身份\n【选项B】保持警惕，准备战斗\n【选项C】友好地自我介绍\n【选项D】假装没看见，继续前行\n\n🎲 命运的齿轮开始转动...`
    ];
    
    if (action) {
      return actionResponses[Math.floor(Math.random() * actionResponses.length)];
    }
    
    return worldStarters[type] || worldStarters.custom;
  };

  /**
   * 调用 AI 生成剧情
   * 使用 API_CONFIG 中配置的大模型服务
   * 
   * @param {string} prompt - 玩家输入的行动描述
   * @param {boolean} includeSearch - 是否启用网络搜索
   * @returns {Promise<string|null>} AI 生成的剧情文本，失败返回 null
   */
  const callAI = async (prompt, includeSearch = false) => {
    setIsLoading(true);
    try {
      const weaponInfo = analyzeCurrentWeapon();
      
      // 构建 DND 地下城主系统提示词
      const systemPrompt = `你是一个专业的DND地下城主(Dungeon Master)，正在主持一场跑团游戏。

当前世界观: ${worldSetting ? JSON.stringify(worldSetting) : '经典DND奇幻世界'}

当前玩家角色:
- 名字: ${currentCharacter?.name || '冒险者'}
- 职业: ${currentCharacter?.classInfo?.name || '战士'} ${currentCharacter?.classInfo?.emoji || '⚔️'}
- 等级: ${currentCharacter?.level || 1}
- HP: ${currentCharacter?.hp || 100}/${currentCharacter?.maxHp || 100}
- MP: ${currentCharacter?.mp || 50}/${currentCharacter?.maxMp || 50}
- 属性: 力量${currentCharacter?.stats?.str || 10} 智力${currentCharacter?.stats?.int || 10} 敏捷${currentCharacter?.stats?.agi || 10}
${weaponInfo ? `- 武器: ${weaponInfo.emoji} ${weaponInfo.name} (攻击力:${weaponInfo.damage}, 元素:${weaponInfo.element}, 特效:${weaponInfo.effect})` : '- 武器: 无'}
- 背景: ${currentCharacter?.backstory || '神秘的冒险者'}

之前的故事:
${storyHistory.slice(-5).map(s => s.content).join('\n\n')}

规则:
1. 用生动、沉浸式的第二人称叙述推进剧情
2. 根据玩家的武器属性来描述战斗效果(如火焰武器会造成灼烧)
3. 给玩家2-4个选择，用【选项A】【选项B】格式
4. 适时进行骰子判定，如"你需要进行一次敏捷检定(DC 15)"
5. 战斗时计算伤害要考虑武器的攻击力和元素效果
6. 保持世界观的一致性
7. 回复用中文，保持在300-500字左右
8. 玩家做出有创意的行动时可以奖励经验值和像素点`;

      // 使用通用 API 调用函数
      const response = await callAIAPI(systemPrompt, prompt, { includeWebSearch: includeSearch });
      
      return response || null;  // 返回 null 表示需要使用离线模式
    } catch (error) {
      console.error('AI Error:', error);
      return null; // 返回 null 触发离线模式
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorldImport = async (type, customText) => {
    setIsLoading(true);
    
    let story = null;
    
    // Try API first
    try {
      let prompt = '';
      if (type === 'custom' && customText) {
        prompt = `玩家想要在以下设定中开始冒险:\n\n"${customText}"\n\n请基于这个设定创建一个开场场景，介绍世界观并给玩家一个冒险的起点。`;
      } else {
        const worldNames = {
          douluo: '斗罗大陆(魂师、魂环、魂兽、武魂)',
          naruto: '火影忍者世界(忍者、查克拉、忍术)',
          hp: '哈利波特魔法世界(魔法师、魔杖、霍格沃茨)',
          lotr: '魔戒中土世界(精灵、矮人、魔戒)',
          wuxia: '武侠江湖(武功、门派、江湖恩怨)',
        };
        prompt = `请搜索并了解${worldNames[type] || type}的详细设定，然后创建一个融合DND规则的开场场景。描述这个世界的特色，并给玩家一个冒险的起点。`;
      }

      story = await callAI(prompt, type !== 'custom');
    } catch (e) {
      console.error('API failed, using offline mode');
    }
    
    // Fallback to offline mode if API fails
    if (!story) {
      story = generateOfflineStory(type);
    }
    
    setWorldSetting({ type, customText, initialized: true });
    setStoryHistory([{ role: 'dm', content: story, timestamp: Date.now() }]);
    setCurrentStory(story);
    setScreen('game');
    setIsLoading(false);
  };

  const handlePlayerAction = async () => {
    if (!playerInput.trim() || isLoading) return;
    
    const action = playerInput;
    setPlayerInput('');
    setStoryHistory(prev => [...prev, { role: 'player', content: action, timestamp: Date.now() }]);
    
    let response = await callAI(`玩家的行动: "${action}"\n\n请继续推进剧情，描述这个行动的结果。`);
    
    // Fallback to offline mode if API fails
    if (!response) {
      response = generateOfflineStory(worldSetting?.type || 'custom', action);
    }
    
    // Check for rewards in response
    if (response.includes('像素点') || response.includes('经验')) {
      const pixelMatch = response.match(/获得\s*(\d+)\s*像素点/);
      const expMatch = response.match(/获得\s*(\d+)\s*经验/);
      
      if (pixelMatch || expMatch) {
        setCurrentCharacter(prev => ({
          ...prev,
          pixelCount: prev.pixelCount + (pixelMatch ? parseInt(pixelMatch[1]) : 0),
          exp: prev.exp + (expMatch ? parseInt(expMatch[1]) : 0),
        }));
        
        setGameLog(prev => [...prev, {
          type: 'reward',
          message: `${pixelMatch ? `+${pixelMatch[1]}像素点 ` : ''}${expMatch ? `+${expMatch[1]}经验` : ''}`,
          timestamp: Date.now(),
        }]);
      }
    }
    
    setStoryHistory(prev => [...prev, { role: 'dm', content: response, timestamp: Date.now() }]);
    setCurrentStory(response);
  };

  const handleCreateCharacter = (character) => {
    setCharacters(prev => [...prev, character]);
    setCurrentCharacter(character);
    setScreen('import');
  };

  const selectCharacter = (char) => {
    setCurrentCharacter(char);
    if (worldSetting) {
      setScreen('game');
    } else {
      setScreen('import');
    }
  };

  const updateWeapon = (newWeapon) => {
    setCurrentCharacter(prev => ({ ...prev, weapon: newWeapon }));
    setCharacters(prev => prev.map(c => c.id === currentCharacter.id ? { ...c, weapon: newWeapon } : c));
  };

  // Title Screen
  if (screen === 'title') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: "'Noto Serif SC', 'Cinzel', serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            @keyframes pixelFall {
              0% { transform: translateY(-20px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(100vh); opacity: 0; }
            }
            @keyframes pixelGlow {
              0%, 100% { box-shadow: 0 0 2px currentColor; }
              50% { box-shadow: 0 0 8px currentColor, 0 0 12px currentColor; }
            }
            @keyframes swordSwing {
              0%, 100% { transform: rotate(-10deg); }
              50% { transform: rotate(10deg); }
            }
            @keyframes shieldPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes dragonBreath {
              0%, 100% { filter: hue-rotate(0deg); }
              50% { filter: hue-rotate(30deg); }
            }
          `}
        </style>
        
        {/* 动态像素背景 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {/* 像素网格背景 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }} />
          
          {/* 飘落的像素粒子 */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                background: ['#ff6b6b', '#ffd700', '#7fff00', '#00bfff', '#ff69b4', '#9370db'][Math.floor(Math.random() * 6)],
                animation: `pixelFall ${8 + Math.random() * 12}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: 0.6,
                imageRendering: 'pixelated',
              }}
            />
          ))}
          
          {/* 角落装饰像素块 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`corner-${i}`}
              style={{
                position: 'absolute',
                left: i < 10 ? `${Math.random() * 15}%` : `${85 + Math.random() * 15}%`,
                top: `${Math.random() * 100}%`,
                width: '6px',
                height: '6px',
                background: ['#2a2a4a', '#3a2a4a', '#2a3a4a', '#4a3a2a'][Math.floor(Math.random() * 4)],
                animation: `pixelGlow ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        {/* 像素风格图标 */}
        <div style={{
          animation: 'float 4s ease-in-out infinite',
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* 像素剑 */}
          <svg width="64" height="64" viewBox="0 0 16 16" style={{ 
            imageRendering: 'pixelated',
            animation: 'swordSwing 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))',
          }}>
            <rect x="7" y="0" width="2" height="2" fill="#c0c0c0"/>
            <rect x="7" y="2" width="2" height="2" fill="#a0a0a0"/>
            <rect x="7" y="4" width="2" height="2" fill="#87ceeb"/>
            <rect x="7" y="6" width="2" height="2" fill="#4169e1"/>
            <rect x="7" y="8" width="2" height="2" fill="#4169e1"/>
            <rect x="5" y="10" width="6" height="2" fill="#8b4513"/>
            <rect x="6" y="12" width="4" height="2" fill="#654321"/>
            <rect x="7" y="14" width="2" height="2" fill="#ffd700"/>
          </svg>
          
          {/* 像素龙 */}
          <svg width="80" height="80" viewBox="0 0 20 20" style={{ 
            imageRendering: 'pixelated',
            animation: 'dragonBreath 4s ease-in-out infinite',
            filter: 'drop-shadow(0 0 15px rgba(255,100,50,0.5))',
          }}>
            {/* 龙头 */}
            <rect x="12" y="2" width="2" height="2" fill="#ff4500"/>
            <rect x="14" y="2" width="2" height="2" fill="#ff4500"/>
            <rect x="10" y="4" width="2" height="2" fill="#ff6347"/>
            <rect x="12" y="4" width="4" height="2" fill="#ff6347"/>
            <rect x="16" y="4" width="2" height="2" fill="#ff4500"/>
            <rect x="8" y="6" width="2" height="2" fill="#dc143c"/>
            <rect x="10" y="6" width="6" height="2" fill="#dc143c"/>
            <rect x="16" y="6" width="2" height="2" fill="#ffd700"/>
            {/* 龙身 */}
            <rect x="6" y="8" width="2" height="2" fill="#8b0000"/>
            <rect x="8" y="8" width="6" height="2" fill="#b22222"/>
            <rect x="4" y="10" width="2" height="2" fill="#8b0000"/>
            <rect x="6" y="10" width="6" height="2" fill="#dc143c"/>
            <rect x="12" y="10" width="2" height="2" fill="#ff6347"/>
            {/* 龙翼 */}
            <rect x="10" y="4" width="2" height="2" fill="#ff8c00"/>
            <rect x="8" y="2" width="2" height="2" fill="#ff8c00"/>
            <rect x="6" y="0" width="2" height="2" fill="#ffa500"/>
            {/* 龙尾 */}
            <rect x="2" y="12" width="2" height="2" fill="#8b0000"/>
            <rect x="4" y="12" width="4" height="2" fill="#b22222"/>
            <rect x="0" y="14" width="2" height="2" fill="#ff4500"/>
            <rect x="2" y="14" width="2" height="2" fill="#8b0000"/>
            {/* 火焰 */}
            <rect x="18" y="6" width="2" height="2" fill="#ffd700"/>
            <rect x="18" y="8" width="2" height="2" fill="#ff8c00"/>
          </svg>
          
          {/* 像素盾牌 */}
          <svg width="64" height="64" viewBox="0 0 16 16" style={{ 
            imageRendering: 'pixelated',
            animation: 'shieldPulse 2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 10px rgba(100,149,237,0.5))',
          }}>
            <rect x="2" y="0" width="12" height="2" fill="#4169e1"/>
            <rect x="1" y="2" width="14" height="2" fill="#4169e1"/>
            <rect x="1" y="4" width="14" height="2" fill="#6495ed"/>
            <rect x="1" y="6" width="14" height="2" fill="#6495ed"/>
            <rect x="7" y="4" width="2" height="6" fill="#ffd700"/>
            <rect x="5" y="6" width="6" height="2" fill="#ffd700"/>
            <rect x="2" y="8" width="12" height="2" fill="#4169e1"/>
            <rect x="3" y="10" width="10" height="2" fill="#4169e1"/>
            <rect x="4" y="12" width="8" height="2" fill="#6495ed"/>
            <rect x="6" y="14" width="4" height="2" fill="#6495ed"/>
          </svg>
        </div>
        
        <GothicTitle>像素锻造纪元</GothicTitle>

        <div style={{ 
          marginTop: '50px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          width: '280px',
          position: 'relative',
          zIndex: 1,
        }}>
          <RuneButton onClick={() => setScreen('create')}>
            ✨ 新的冒险
          </RuneButton>
          {characters.length > 0 && (
            <RuneButton onClick={() => setScreen('characters')} variant="secondary">
              📜 继续旅程 ({characters.length}个角色)
            </RuneButton>
          )}
          <RuneButton onClick={() => setShowSettings(true)} variant="secondary">
            ⚙️ API 设置
          </RuneButton>
        </div>

        {/* API 设置弹窗 */}
        {showSettings && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1520 0%, #2a2030 100%)',
              border: '2px solid #4a4030',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '25px',
              }}>
                <h2 style={{ color: '#ffd700', margin: 0, fontFamily: "'Cinzel', serif" }}>
                  ⚙️ AI 模型设置
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
              
              {/* 模型选择 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                  选择 AI 服务商
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a2a',
                    border: '2px solid #3a3040',
                    borderRadius: '6px',
                    color: '#e0d0c0',
                    fontSize: '1rem',
                  }}
                >
                  <option value="anthropic">Anthropic Claude (默认)</option>
                  <option value="deepseek">DeepSeek 深度求索</option>
                  <option value="openai">OpenAI GPT</option>
                  <option value="qwen">通义千问</option>
                  <option value="ollama">Ollama (本地)</option>
                  <option value="openai-compatible">OpenAI 兼容 API</option>
                </select>
              </div>
              
              {/* 模型名称 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                  模型名称
                </label>
                <input
                  type="text"
                  value={apiModel}
                  onChange={(e) => setApiModel(e.target.value)}
                  placeholder={
                    apiProvider === 'anthropic' ? 'claude-sonnet-4-20250514' :
                    apiProvider === 'deepseek' ? 'deepseek-chat' :
                    apiProvider === 'openai' ? 'gpt-4-turbo' :
                    apiProvider === 'qwen' ? 'qwen-max' :
                    apiProvider === 'ollama' ? 'llama3' : 'your-model-name'
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a2a',
                    border: '2px solid #3a3040',
                    borderRadius: '6px',
                    color: '#e0d0c0',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px' }}>
                  {apiProvider === 'deepseek' && '可选: deepseek-chat (V3) 或 deepseek-reasoner (R1)'}
                  {apiProvider === 'anthropic' && '在 claude.ai 中运行时无需填写'}
                  {apiProvider === 'ollama' && '填写本地部署的模型名称'}
                </div>
              </div>
              
              {/* API Key */}
              {apiProvider !== 'anthropic' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#ccc', display: 'block', marginBottom: '8px' }}>
                    API Key {apiProvider === 'ollama' && '(可选)'}
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxx"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#1a1a2a',
                      border: '2px solid #3a3040',
                      borderRadius: '6px',
                      color: '#e0d0c0',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px' }}>
                    {apiProvider === 'deepseek' && '在 platform.deepseek.com 获取'}
                    {apiProvider === 'openai' && '在 platform.openai.com 获取'}
                    {apiProvider === 'qwen' && '在阿里云控制台获取'}
                  </div>
                </div>
              )}
              
              {/* 当前状态 */}
              <div style={{
                padding: '15px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '6px',
                marginBottom: '20px',
              }}>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                  当前配置: <span style={{ color: '#ffd700' }}>{apiProvider}</span>
                  {apiModel && <> / <span style={{ color: '#7fff00' }}>{apiModel}</span></>}
                </div>
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px' }}>
                  {apiKey ? '✅ 已设置 API Key' : (apiProvider === 'anthropic' || apiProvider === 'ollama' ? '✅ 无需 API Key' : '⚠️ 未设置 API Key')}
                </div>
              </div>
              
              {/* 按钮 */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <RuneButton onClick={saveApiSettings} style={{ flex: 1 }}>
                  💾 保存设置
                </RuneButton>
                <RuneButton onClick={() => setShowSettings(false)} variant="secondary" style={{ flex: 1 }}>
                  取消
                </RuneButton>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Character Select Screen
  if (screen === 'characters') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a12 0%, #1a1520 50%, #0a0810 100%)',
        padding: '40px 20px',
        fontFamily: "'Noto Serif SC', 'Cinzel', serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');`}</style>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <GothicTitle size="md">选择角色</GothicTitle>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {characters.map(char => (
              <ScrollPanel key={char.id}>
                <div 
                  onClick={() => selectCharacter(char)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '2.5rem' }}>{char.classInfo.emoji}</span>
                    <div>
                      <div style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>{char.name}</div>
                      <div style={{ color: '#888' }}>Lv.{char.level} {char.classInfo.name}</div>
                    </div>
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                    HP: {char.hp}/{char.maxHp} | MP: {char.mp}/{char.maxMp}
                  </div>
                  <div style={{ color: '#7a7a8a', fontSize: '0.8rem', marginTop: '5px' }}>
                    像素点: {char.pixelCount}
                  </div>
                </div>
              </ScrollPanel>
            ))}
            
            <div 
              onClick={() => setScreen('create')}
              style={{
                border: '2px dashed #4a4030',
                borderRadius: '8px',
                padding: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6a6a7a',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '2rem' }}>+ 创建新角色</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <RuneButton onClick={() => setScreen('title')} variant="secondary">
              ← 返回主菜单
            </RuneButton>
          </div>
        </div>
      </div>
    );
  }

  // Character Creation Screen
  if (screen === 'create') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a12 0%, #1a1520 50%, #0a0810 100%)',
        padding: '40px 20px',
        fontFamily: "'Noto Serif SC', 'Cinzel', serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');`}</style>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <GothicTitle size="md">创建你的英雄</GothicTitle>
        </div>
        
        <CharacterCreation onComplete={handleCreateCharacter} existingCharacters={characters} />
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <RuneButton onClick={() => setScreen('title')} variant="secondary">
            ← 返回
          </RuneButton>
        </div>
      </div>
    );
  }

  // World Import Screen
  if (screen === 'import') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a12 0%, #1a1520 50%, #0a0810 100%)',
        padding: '40px 20px',
        fontFamily: "'Noto Serif SC', 'Cinzel', serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');`}</style>
        
        {currentCharacter && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            color: '#aaa',
          }}>
            角色: {currentCharacter.classInfo.emoji} {currentCharacter.name}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <GothicTitle size="md">选择世界观</GothicTitle>
        </div>
        
        <StoryImport onImport={handleWorldImport} />
        
        {isLoading && (
          <div style={{ textAlign: 'center', marginTop: '30px', color: '#ffd700' }}>
            <div style={{ fontSize: '2rem', animation: 'pulse 1.5s infinite' }}>🌍</div>
            <p>正在构建世界...</p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <RuneButton onClick={() => setScreen('characters')} variant="secondary">
            ← 返回
          </RuneButton>
        </div>
      </div>
    );
  }

  // Main Game Screen
  const weaponStats = analyzeCurrentWeapon();
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a12 0%, #1a1520 50%, #0a0810 100%)',
      fontFamily: "'Noto Serif SC', 'Cinzel', serif",
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>

      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(20,15,10,0.95) 0%, rgba(30,20,15,0.9) 50%, rgba(20,15,10,0.95) 100%)',
        borderBottom: '2px solid #4a3820',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '1.5rem' }}>{currentCharacter?.classInfo?.emoji}</span>
          <div>
            <div style={{ color: '#ffd700', fontWeight: 'bold' }}>{currentCharacter?.name}</div>
            <div style={{ color: '#888', fontSize: '0.8rem' }}>
              Lv.{currentCharacter?.level} {currentCharacter?.classInfo?.name}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', color: '#ccc', fontSize: '0.9rem' }}>
          <span style={{ color: '#ff6b6b' }}>❤️ {currentCharacter?.hp}/{currentCharacter?.maxHp}</span>
          <span style={{ color: '#6b9fff' }}>💧 {currentCharacter?.mp}/{currentCharacter?.maxMp}</span>
          <span style={{ color: '#ffd700' }}>💰 {currentCharacter?.gold}</span>
          <span style={{ color: '#7fff00' }}>🔷 {currentCharacter?.pixelCount}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <RuneButton 
            onClick={() => setShowWeaponEditor(!showWeaponEditor)}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            ⚔️ 武器锻造
          </RuneButton>
          <RuneButton 
            onClick={() => setScreen('title')}
            variant="secondary"
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            🏠
          </RuneButton>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* Main Content */}
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 80px)',
        }}>
          {/* Weapon Editor Panel */}
          {showWeaponEditor && (
            <ScrollPanel title="🔨 像素武器锻造台" style={{ marginBottom: '20px' }}>
              <PixelWeaponEditor 
                weapon={currentCharacter?.weapon || Array(16).fill(null).map(() => Array(16).fill(null))}
                setWeapon={updateWeapon}
                pixelCount={currentCharacter?.pixelCount || 20}
              />
            </ScrollPanel>
          )}

          {/* Story Area */}
          <ScrollPanel 
            title="📜 冒险历程" 
            style={{ 
              flex: 1, 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ 
              flex: 1, 
              overflow: 'auto',
              paddingRight: '10px',
            }}>
              {storyHistory.map((entry, idx) => (
                <div 
                  key={idx}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    borderRadius: '8px',
                    background: entry.role === 'player' 
                      ? 'linear-gradient(135deg, rgba(0,50,80,0.3) 0%, rgba(0,30,50,0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(50,40,20,0.3) 0%, rgba(30,25,15,0.3) 100%)',
                    borderLeft: entry.role === 'player' 
                      ? '3px solid #4a9fff'
                      : '3px solid #ffd700',
                  }}
                >
                  <div style={{ 
                    color: entry.role === 'player' ? '#4a9fff' : '#ffd700',
                    fontSize: '0.8rem',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                  }}>
                    {entry.role === 'player' ? `🎭 ${currentCharacter?.name}` : '🎲 地下城主'}
                  </div>
                  <div style={{ 
                    color: '#d0c8b8',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {entry.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: '#ffd700',
                }}>
                  <div style={{ fontSize: '1.5rem', animation: 'pulse 1.5s infinite' }}>🎲</div>
                  <p>命运之轮转动中...</p>
                </div>
              )}
              <div ref={storyEndRef} />
            </div>
          </ScrollPanel>

          {/* Input Area */}
          <div style={{ 
            marginTop: '15px',
            display: 'flex',
            gap: '10px',
          }}>
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePlayerAction()}
              placeholder="描述你的行动... (例如: 我举起武器冲向敌人)"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '15px 20px',
                background: 'rgba(0,0,0,0.5)',
                border: '2px solid #4a3820',
                borderRadius: '8px',
                color: '#e0d0c0',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
            <RuneButton onClick={handlePlayerAction} disabled={isLoading || !playerInput.trim()}>
              ⚔️ 行动
            </RuneButton>
          </div>
        </div>

        {/* Right Sidebar - Weapon Display */}
        <div style={{
          width: '280px',
          padding: '20px',
          borderLeft: '2px solid #3a2810',
          background: 'rgba(15,10,8,0.5)',
        }}>
          <ScrollPanel title="⚔️ 当前武器">
            {weaponStats ? (
              <div style={{ color: '#d0c8b8' }}>
                <div style={{ 
                  fontSize: '1.3rem', 
                  color: '#ffd700', 
                  marginBottom: '15px',
                  textAlign: 'center',
                }}>
                  {weaponStats.emoji} {weaponStats.name}
                </div>
                
                {/* Mini pixel preview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(16, 8px)',
                  gap: '0px',
                  margin: '10px auto',
                  width: 'fit-content',
                  background: '#111',
                  padding: '5px',
                  borderRadius: '4px',
                }}>
                  {currentCharacter?.weapon?.map((row, ri) => 
                    row.map((cell, ci) => (
                      <div
                        key={`${ri}-${ci}`}
                        style={{
                          width: '8px',
                          height: '8px',
                          background: cell ? (cell === 'white' ? '#f0f0f0' : cell) : 'transparent',
                        }}
                      />
                    ))
                  )}
                </div>

                <div style={{ marginTop: '15px', lineHeight: 1.8, fontSize: '0.9rem' }}>
                  <div>📊 攻击: <span style={{ color: '#ff6b6b' }}>{weaponStats.damage}</span></div>
                  <div>🎯 类型: <span style={{ color: '#6bff6b' }}>{weaponStats.type || 'melee'}</span></div>
                  <div>✨ 元素: <span style={{ color: '#6b9fff' }}>{PIXEL_COLORS[Object.keys(PIXEL_COLORS).find(c => PIXEL_COLORS[c].element === weaponStats.element)]?.name}</span></div>
                  <div>💫 特效: <span style={{ color: '#ff6bff' }}>{weaponStats.effect}</span></div>
                </div>
                
                {/* Special properties */}
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {weaponStats.range && (
                    <span style={{ background: '#2a3a4a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      📏+{weaponStats.range}
                    </span>
                  )}
                  {weaponStats.ammo && (
                    <span style={{ background: '#3a3a2a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      🔫{weaponStats.ammo}
                    </span>
                  )}
                  {weaponStats.magic && (
                    <span style={{ background: '#3a2a4a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      🔮+{weaponStats.magic}
                    </span>
                  )}
                  {weaponStats.defense && (
                    <span style={{ background: '#2a4a4a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      🛡️+{weaponStats.defense}
                    </span>
                  )}
                  {weaponStats.crit && (
                    <span style={{ background: '#4a2a2a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      💥x{weaponStats.crit}
                    </span>
                  )}
                  {weaponStats.attackSpeed && (
                    <span style={{ background: '#3a4a2a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      ⚡x{weaponStats.attackSpeed}
                    </span>
                  )}
                  {weaponStats.aoe && (
                    <span style={{ background: '#4a3a2a', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' }}>
                      💥范围{weaponStats.aoe}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔨</div>
                <p>尚未锻造武器</p>
                <p style={{ fontSize: '0.8rem' }}>点击上方"武器锻造"开始创造</p>
              </div>
            )}
          </ScrollPanel>

          <ScrollPanel title="📊 角色属性" style={{ marginTop: '15px' }}>
            <div style={{ color: '#d0c8b8', lineHeight: 2, fontSize: '0.9rem' }}>
              <div>⚔️ 力量: <span style={{ color: '#ff8866' }}>{currentCharacter?.stats?.str}</span></div>
              <div>🔮 智力: <span style={{ color: '#66aaff' }}>{currentCharacter?.stats?.int}</span></div>
              <div>💨 敏捷: <span style={{ color: '#66ff88' }}>{currentCharacter?.stats?.agi}</span></div>
              <div style={{ marginTop: '10px', borderTop: '1px solid #3a3020', paddingTop: '10px' }}>
                <div>📈 经验: {currentCharacter?.exp || 0}</div>
                <div>🔷 像素点: {currentCharacter?.pixelCount}</div>
              </div>
            </div>
          </ScrollPanel>

          {/* Game Log */}
          {gameLog.length > 0 && (
            <ScrollPanel title="📋 事件日志" style={{ marginTop: '15px' }}>
              <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                {gameLog.slice(-5).reverse().map((log, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      color: log.type === 'reward' ? '#7fff00' : '#aaa',
                      fontSize: '0.85rem',
                    }}
                  >
                    {log.message}
                  </div>
                ))}
              </div>
            </ScrollPanel>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 第8部分: 导出
 * ============================================================================
 */


