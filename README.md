# 🎮 像素锻造纪元 | Pixel Forge Era

一个像素风格的 DND RPG 游戏，在浏览器中直接运行！

![Game Preview](preview.png)

## ✨ 特色功能

- **🎨 像素武器锻造** - 在 16x16 的画布上绘制你的专属武器
- **🤖 AI 智能识别** - AI 自动识别你画的武器类型
- **📖 AI 剧情生成** - 动态生成冒险故事
- **⚔️ 70+ 种武器** - 从剑、弓、枪到魔法武器应有尽有
- **🎭 6 种职业** - 战士、法师、刺客、牧师、游侠、圣骑士
- **🌍 多种世界观** - 斗罗大陆、火影忍者、哈利波特等预设

## 🚀 快速开始

### 在线游玩

直接访问：**https://你的用户名.github.io/pixel-forge-era**

### 本地运行

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/pixel-forge-era.git
cd pixel-forge-era
```

2. 启动本地服务器（任选一种）
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# VS Code
# 安装 Live Server 扩展，右键 index.html -> Open with Live Server
```

3. 打开浏览器访问 `http://localhost:8000`

## ⚙️ API 配置

游戏支持多种 AI 服务商：

| 服务商 | 模型 | 备注 |
|--------|------|------|
| DeepSeek | deepseek-chat / deepseek-reasoner | 推荐国内用户 |
| OpenAI | gpt-4-turbo | 需要 API Key |
| 通义千问 | qwen-max | 阿里云 |
| Ollama | llama3 等 | 本地部署 |

在游戏封面点击 **⚙️ API 设置** 进行配置。

## 📁 项目结构

```
pixel-forge-era/
├── index.html      # 入口文件
├── game.jsx        # 游戏主代码
└── README.md       # 说明文档
```

## 🎮 游戏玩法

1. **创建角色** - 选择职业，起个名字
2. **锻造武器** - 用像素画出你的武器（或点击 🎲 随机生成）
3. **选择世界** - 挑选或自定义冒险背景
4. **开始冒险** - 输入你的行动，AI 会推进剧情

## 🛠️ 技术栈

- React 18
- 纯 CSS 动画
- AI API（Anthropic/OpenAI/DeepSeek 等）

## 📄 License

MIT License

## 🙏 致谢

- 灵感来自 DND 桌游
- 像素艺术风格致敬经典游戏

---

**锻造你的像素武器，书写你的传奇！** ⚔️🐉🛡️
