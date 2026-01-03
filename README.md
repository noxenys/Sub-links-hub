# SubLinks Hub - 隐秘订阅链接导航平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.13.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-MySQL-orange.svg)](https://www.mysql.com/)

## 📖 项目介绍

**SubLinks Hub** 是一个专为代理订阅链接优化的导航平台。该项目精选了来自 GitHub、Telegram、技术论坛和公益资源的 **14 个极冷门但高活跃度的订阅链接**，旨在为用户提供稳定、隐秘、难以被封锁的代理节点资源。

与大众化的订阅汇总不同，SubLinks Hub 关注那些使用人数极少、但维护者活跃、更新频繁的小众项目。这些资源因为知名度低，通常能够避免大规模封锁和拥堵，为用户提供更稳定的连接体验。

### 🎯 核心特性

- **精选冷门资源**：汇集 GitHub 极冷门项目（Star 数 < 100）、Telegram 小众频道、技术论坛分享和 Warp+ 公益资源
- **数据库驱动**：所有订阅链接存储在 MySQL 数据库中，支持实时更新和动态管理
- **一键复制**：简洁的 UI 设计，支持一键复制订阅链接到剪贴板
- **分类导航**：按来源分为 4 个分类，快速定位所需资源
- **实时搜索**：支持按协议、标签、标题进行全文搜索
- **稳定性标签**：每个链接都标注稳定性等级（高/中/低），帮助用户快速判断
- **响应式设计**：完美适配桌面和移动设备

## 🚀 快速开始

### 前置要求

- Node.js 22.13.0 或更高版本
- pnpm 10.4.1 或更高版本
- MySQL 8.0 或更高版本

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/sub-links-hub.git
cd sub-links-hub
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# 数据库连接
DATABASE_URL="mysql://user:password@localhost:3306/sub_links_hub"

# OAuth 配置（可选，用于用户认证）
OAUTH_SERVER_URL="your_oauth_server_url"
JWT_SECRET="your_jwt_secret"

# 应用配置
VITE_APP_TITLE="SubLinks Hub"
VITE_APP_LOGO="/logo.svg"
```

#### 4. 初始化数据库

```bash
# 执行数据库迁移
pnpm db:push

# 导入初始数据
node scripts/seed-db.mjs
```

#### 5. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

## 📁 项目结构

```
sub-links-hub/
├── client/                    # 前端应用（React + Vite）
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 可复用组件
│   │   ├── lib/              # 工具函数和常量
│   │   ├── App.tsx           # 主应用组件
│   │   └── index.css         # 全局样式
│   ├── public/               # 静态资源
│   └── index.html            # HTML 入口
├── server/                    # 后端服务（Express + tRPC）
│   ├── routers.ts            # API 路由定义
│   ├── db.ts                 # 数据库查询函数
│   └── _core/                # 核心配置
├── drizzle/                  # 数据库 Schema
│   ├── schema.ts             # 表定义
│   └── migrations/           # 数据库迁移文件
├── scripts/                  # 工具脚本
│   └── seed-db.mjs           # 数据库初始化脚本
├── package.json              # 项目配置
└── README.md                 # 本文件
```

## 🗄️ 数据库架构

### 表结构

#### subscription_categories（分类表）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INT | 主键 |
| name | VARCHAR(64) | 分类名称 |
| icon | VARCHAR(32) | 分类图标 |
| description | TEXT | 分类描述 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

#### subscription_links（链接表）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INT | 主键 |
| categoryId | INT | 分类 ID（外键） |
| title | VARCHAR(255) | 链接标题 |
| description | TEXT | 链接描述 |
| url | TEXT | 订阅链接 URL |
| protocol | VARCHAR(64) | 协议类型（Clash、VLESS 等） |
| stability | ENUM | 稳定性等级（high/medium/low） |
| tags | VARCHAR(500) | 标签（JSON 格式） |
| lastUpdated | TIMESTAMP | 最后更新时间 |
| isActive | INT | 是否激活（1/0） |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

## 🔌 API 接口

所有 API 通过 tRPC 框架提供，支持类型安全的调用。

### 获取所有分类

```typescript
const categories = await trpc.subscriptions.categories.query();
```

### 获取所有链接

```typescript
const links = await trpc.subscriptions.links.query();
```

### 按分类获取链接

```typescript
const links = await trpc.subscriptions.linksByCategory.query({ categoryId: 1 });
```

### 创建新链接

```typescript
const result = await trpc.subscriptions.createLink.mutate({
  categoryId: 1,
  title: "Example Link",
  description: "Example description",
  url: "https://example.com/sub",
  protocol: "Clash",
  stability: "high",
  tags: ["tag1", "tag2"],
});
```

### 更新链接

```typescript
const result = await trpc.subscriptions.updateLink.mutate({
  id: 1,
  title: "Updated Title",
  stability: "medium",
});
```

### 删除链接

```typescript
const result = await trpc.subscriptions.deleteLink.mutate({ id: 1 });
```

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
| :--- | :--- | :--- |
| **前端框架** | React | 19 |
| **构建工具** | Vite | 7.1.7 |
| **样式** | Tailwind CSS | 4 |
| **UI 组件** | shadcn/ui | 最新 |
| **路由** | Wouter | 3.3.5 |
| **后端框架** | Express | 4.21.2 |
| **API** | tRPC | 最新 |
| **数据库** | MySQL | 8.0+ |
| **ORM** | Drizzle | 最新 |
| **包管理** | pnpm | 10.4.1 |

## 📊 数据来源

SubLinks Hub 汇集的订阅链接来自以下来源：

### GitHub 极冷门项目
- **SnapdragonLee/SystemProxy**：Star 97，Fork 11，高频更新
- **zhongfly/clash-config**：极简命名，长期维护
- **kort0881/vpn-vless-configs-russia**：伪装命名，全球节点

### Telegram 公益频道
- **SSRSUB**：52K 订阅，每日更新
- **几鸡每日公告**：小圈子自用，稳定性高
- **马铃薯公益通知**：限速但稳定的公益套餐

### 技术论坛分享
- **V2EX Warp+ 分享**：基于 Cloudflare Warp+ 的无限流量节点
- **HostLoc 公益机场汇总**：论坛大佬整理的防失联列表

### Warp+ 特殊资源
- **Cloudflare Warp 官方项目**：官方配置，稳定性最高

## 📝 使用指南

### 1. 选择分类
点击顶部的分类按钮（GitHub 极冷门、Telegram 频道、论坛分享、Warp+ 资源），快速切换不同来源的链接。

### 2. 搜索链接
使用搜索框按链接标题、描述或标签进行全文搜索，快速找到所需资源。

### 3. 一键复制
点击任何链接卡片上的"复制链接"按钮，立即复制订阅 URL 到剪贴板。

### 4. 导入使用
将复制的链接粘贴到 Clash、Surge、Quantumult X 等代理工具中，即可使用。

## ⚠️ 免责声明

- 本项目仅为订阅链接导航工具，所有链接均来自公开渠道
- 使用这些链接产生的任何后果由用户自行承担
- 请遵守当地法律法规，理性使用
- 本项目不提供任何代理服务，仅作为信息汇总平台

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交新链接

如果您发现了稳定的订阅链接，欢迎通过以下方式贡献：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/add-new-link`)
3. 提交更改 (`git commit -m 'Add new subscription link'`)
4. 推送到分支 (`git push origin feature/add-new-link`)
5. 开启 Pull Request

### 报告问题

如果发现链接失效或其他问题，请提交 Issue，包含以下信息：

- 失效的链接 URL
- 发现时间
- 错误信息或截图

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。详见 LICENSE 文件。

## 👨‍💻 作者

**SubLinks Hub** 由 Manus AI 创建和维护。

## 🔗 相关资源

- [Clash 官方文档](https://clash.wiki/)
- [Cloudflare Warp](https://one.one.one.one/)
- [V2EX 社区](https://www.v2ex.com/)
- [HostLoc 论坛](https://hostloc.com/)

## 📞 联系方式

- 提交 Issue：[GitHub Issues](https://github.com/yourusername/sub-links-hub/issues)
- 讨论功能：[GitHub Discussions](https://github.com/yourusername/sub-links-hub/discussions)

---

**最后更新**：2026 年 1 月 3 日  
**维护者**：Manus AI
