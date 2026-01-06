# 自动化爬虫系统部署指南

## 📋 概述

本指南提供了三种部署方式来运行 SubLinks Hub 的自动化爬虫系统，用于定期从 GitHub、Telegram、论坛等多个来源抓取订阅链接。

---

## 🚀 部署方式 1：Manus 定时任务（推荐）

### 优点
- ✅ 与应用紧密集成
- ✅ 无需额外服务
- ✅ 自动扩展和备份
- ✅ 内置监控和告警

### 实现步骤

#### 1. 创建爬虫脚本

在 `server/cron/crawler.ts` 中创建爬虫脚本：

```typescript
import cron from 'node-cron';
import axios from 'axios';

// 爬虫配置
const CRAWLER_CONFIG = {
  github: {
    enabled: true,
    interval: '0 */6 * * *', // 每 6 小时执行一次
    maxStars: 100,
    maxForks: 50,
  },
  forum: {
    enabled: true,
    interval: '0 */12 * * *', // 每 12 小时执行一次
  },
  validation: {
    enabled: true,
    interval: '0 0 * * 0', // 每周日午夜执行
  },
};

/**
 * GitHub 爬虫
 */
async function crawlGitHub() {
  try {
    console.log('[GitHub Crawler] Starting...');

    const keywords = [
      'subscription',
      'proxy',
      'clash',
      'v2ray',
      'trojan',
      'vless',
      'vmess',
    ];

    for (const keyword of keywords) {
      const query = `${keyword} in:readme stars:<${CRAWLER_CONFIG.github.maxStars} forks:<${CRAWLER_CONFIG.github.maxForks}`;
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`;

      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'SubLinksHub-Crawler/1.0',
        },
      });

      const repos = response.data.items || [];

      for (const repo of repos) {
        // 提取链接逻辑
        console.log(`[GitHub Crawler] Processing ${repo.full_name}`);

        // 从 README 提取链接
        try {
          const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/README.md`;
          const readmeResponse = await axios.get(readmeUrl, { timeout: 10000 });
          const readmeContent = readmeResponse.data;

          // 使用正则表达式提取链接
          const linkRegex = /(https?:\/\/[^\s]+|vmess:\/\/[^\s]+|vless:\/\/[^\s]+|trojan:\/\/[^\s]+|ss:\/\/[^\s]+|ssr:\/\/[^\s]+)/gi;
          const links = readmeContent.match(linkRegex) || [];

          for (const link of links) {
            // 保存到数据库
            console.log(`[GitHub Crawler] Found link: ${link}`);
            // await saveLink(link, 'github', repo.html_url, repo.full_name);
          }
        } catch (error) {
          console.error(`[GitHub Crawler] Error processing ${repo.full_name}:`, error);
        }
      }

      // 避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('[GitHub Crawler] Completed');
  } catch (error) {
    console.error('[GitHub Crawler] Error:', error);
  }
}

/**
 * 论坛爬虫
 */
async function crawlForums() {
  try {
    console.log('[Forum Crawler] Starting...');

    // 实现论坛爬虫逻辑
    // 抓取 V2EX、HostLoc 等论坛中的链接

    console.log('[Forum Crawler] Completed');
  } catch (error) {
    console.error('[Forum Crawler] Error:', error);
  }
}

/**
 * 链接验证
 */
async function validateLinks() {
  try {
    console.log('[Link Validator] Starting...');

    // 实现链接验证逻辑
    // 检查所有链接的可用性

    console.log('[Link Validator] Completed');
  } catch (error) {
    console.error('[Link Validator] Error:', error);
  }
}

/**
 * 初始化定时任务
 */
export function initializeCrawlerTasks() {
  if (CRAWLER_CONFIG.github.enabled) {
    cron.schedule(CRAWLER_CONFIG.github.interval, crawlGitHub);
    console.log('[Cron] GitHub crawler scheduled');
  }

  if (CRAWLER_CONFIG.forum.enabled) {
    cron.schedule(CRAWLER_CONFIG.forum.interval, crawlForums);
    console.log('[Cron] Forum crawler scheduled');
  }

  if (CRAWLER_CONFIG.validation.enabled) {
    cron.schedule(CRAWLER_CONFIG.validation.interval, validateLinks);
    console.log('[Cron] Link validator scheduled');
  }
}
```

#### 2. 在应用启动时初始化爬虫

在 `server/index.ts` 中添加：

```typescript
import { initializeCrawlerTasks } from './cron/crawler';

// ... 其他代码 ...

async function startServer() {
  // ... 其他初始化代码 ...

  // 初始化爬虫定时任务
  if (process.env.NODE_ENV === 'production') {
    initializeCrawlerTasks();
    console.log('[Server] Crawler tasks initialized');
  }

  // ... 启动服务器 ...
}
```

#### 3. 安装依赖

```bash
pnpm add node-cron
```

#### 4. 配置环境变量

在 `.env` 中添加：

```env
CRAWLER_ENABLED=true
CRAWLER_GITHUB_ENABLED=true
CRAWLER_GITHUB_MAX_STARS=100
CRAWLER_GITHUB_MAX_FORKS=50
CRAWLER_FORUM_ENABLED=true
CRAWLER_VALIDATION_ENABLED=true
CRAWLER_VALIDATION_INTERVAL=604800
```

---

## 🔄 部署方式 2：GitHub Actions 工作流

### 优点
- ✅ 免费（GitHub 提供 2000 分钟/月）
- ✅ 与 GitHub 集成
- ✅ 易于版本控制
- ✅ 自动日志记录

### 实现步骤

#### 1. 创建工作流文件

在 `.github/workflows/crawler.yml` 中创建：

```yaml
name: Subscription Links Crawler

on:
  schedule:
    # GitHub 爬虫 - 每 6 小时执行一次
    - cron: '0 */6 * * *'
    # 论坛爬虫 - 每 12 小时执行一次
    - cron: '0 */12 * * *'
    # 链接验证 - 每周日午夜执行
    - cron: '0 0 * * 0'
  workflow_dispatch: # 允许手动触发

jobs:
  crawl:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run crawler
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: pnpm run crawler

      - name: Commit and push changes
        if: success()
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "chore: update subscription links from crawler" || true
          git push

      - name: Send notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Crawler job completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        continue-on-error: true
```

#### 2. 创建爬虫脚本

在 `scripts/crawler.mjs` 中创建：

```javascript
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const GITHUB_API_URL = 'https://api.github.com';
const KEYWORDS = [
  'subscription',
  'proxy',
  'clash',
  'v2ray',
  'trojan',
  'vless',
  'vmess',
];

async function crawlGitHub() {
  console.log('Starting GitHub crawler...');

  const links = [];

  for (const keyword of KEYWORDS) {
    try {
      const query = `${keyword} in:readme stars:<100 forks:<50`;
      const url = `${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'SubLinksHub-Crawler',
        },
        timeout: 15000,
      });

      const repos = response.data.items || [];

      for (const repo of repos) {
        console.log(`Processing ${repo.full_name}...`);

        try {
          // 获取 README
          const readmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/README.md`;
          const readmeResponse = await axios.get(readmeUrl, { timeout: 10000 });
          const content = readmeResponse.data;

          // 提取链接
          const linkRegex = /(https?:\/\/[^\s]+|vmess:\/\/[^\s]+|vless:\/\/[^\s]+|trojan:\/\/[^\s]+|ss:\/\/[^\s]+|ssr:\/\/[^\s]+)/gi;
          const matches = content.match(linkRegex) || [];

          for (const link of matches) {
            links.push({
              url: link.trim(),
              source: 'github',
              sourceUrl: repo.html_url,
              sourceTitle: repo.full_name,
              protocol: extractProtocol(link),
              stability: 'medium',
              tags: ['github', ...repo.topics],
            });
          }
        } catch (error) {
          console.error(`Error processing ${repo.full_name}:`, error.message);
        }
      }

      // 避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error searching for "${keyword}":`, error.message);
    }
  }

  return links;
}

function extractProtocol(url) {
  const match = url.match(/^([a-z]+):\/\//i);
  return match ? match[1].toLowerCase() : 'unknown';
}

async function main() {
  try {
    const links = await crawlGitHub();

    // 保存结果
    const outputPath = path.join(process.cwd(), 'crawler-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(links, null, 2));

    console.log(`Crawler completed. Found ${links.length} links.`);
  } catch (error) {
    console.error('Crawler error:', error);
    process.exit(1);
  }
}

main();
```

#### 3. 在 package.json 中添加脚本

```json
{
  "scripts": {
    "crawler": "node scripts/crawler.mjs"
  }
}
```

---

## 🌐 部署方式 3：外部服务（Railway / Heroku）

### 优点
- ✅ 完全独立
- ✅ 高度可定制
- ✅ 支持长时间运行
- ✅ 可扩展性强

### 实现步骤（Railway 为例）

#### 1. 创建独立的爬虫应用

在 `crawler-app/` 目录下创建独立的 Node.js 应用：

```
crawler-app/
├── src/
│   ├── crawlers/
│   │   ├── github.js
│   │   ├── forum.js
│   │   └── pastebin.js
│   ├── utils/
│   │   ├── db.js
│   │   └── logger.js
│   └── index.js
├── package.json
├── .env.example
└── Dockerfile
```

#### 2. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "src/index.js"]
```

#### 3. 创建爬虫应用入口

在 `crawler-app/src/index.js` 中：

```javascript
import cron from 'node-cron';
import axios from 'axios';
import { connectDB, saveLink } from './utils/db.js';
import { logger } from './utils/logger.js';

const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  dbUrl: process.env.DATABASE_URL,
  crawlInterval: process.env.CRAWL_INTERVAL || '0 */6 * * *', // 每 6 小时
};

async function runCrawler() {
  try {
    logger.info('Crawler started');

    // 连接数据库
    const db = await connectDB(config.dbUrl);

    // 执行爬虫
    const links = await crawlGitHub();
    logger.info(`Found ${links.length} links`);

    // 保存链接
    for (const link of links) {
      await saveLink(db, link);
    }

    logger.info('Crawler completed successfully');
  } catch (error) {
    logger.error('Crawler error:', error);
  }
}

// 调度爬虫
cron.schedule(config.crawlInterval, runCrawler);

logger.info(`Crawler scheduled with interval: ${config.crawlInterval}`);

// 启动服务器（用于健康检查）
import express from 'express';
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3001, () => {
  logger.info('Health check server listening on port 3001');
});
```

#### 4. 部署到 Railway

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

#### 5. 配置环境变量

在 Railway 仪表板中设置：

```
DATABASE_URL=your_database_url
API_URL=https://your-app.manus.space
GITHUB_TOKEN=your_github_token
CRAWL_INTERVAL=0 */6 * * *
```

---

## 📊 监控和日志

### 日志位置

| 部署方式 | 日志位置 |
| :--- | :--- |
| Manus | 应用日志 / 控制台 |
| GitHub Actions | Actions 选项卡 / 工作流日志 |
| Railway | Railway 仪表板 / 日志标签 |

### 监控指标

- 爬虫执行时间
- 发现的新链接数
- 失败率
- 数据库写入速度

---

## 🔐 安全建议

1. **API 密钥管理**
   - 使用环境变量存储敏感信息
   - 定期轮换密钥
   - 不要在代码中硬编码密钥

2. **速率限制**
   - 遵守 API 速率限制
   - 实现指数退避重试
   - 使用代理池避免 IP 被封

3. **数据验证**
   - 验证所有爬虫数据
   - 检查链接格式
   - 过滤恶意内容

4. **监控和告警**
   - 监控爬虫执行状态
   - 设置失败告警
   - 记录所有异常

---

## 🚨 故障排除

### 问题 1：爬虫超时

**解决方案：**
- 增加超时时间
- 减少并发请求数
- 检查网络连接

### 问题 2：API 限制

**解决方案：**
- 使用 Personal Access Token
- 实现缓存机制
- 减少请求频率

### 问题 3：数据库连接失败

**解决方案：**
- 检查连接字符串
- 验证数据库凭证
- 检查防火墙规则

---

## 📈 性能优化

1. **并发爬虫**
   ```javascript
   const results = await Promise.all(crawlers.map(c => c.run()));
   ```

2. **缓存机制**
   ```javascript
   const cache = new Map();
   if (cache.has(url)) return cache.get(url);
   ```

3. **批量数据库操作**
   ```javascript
   await db.insertMany(links); // 而不是逐个插入
   ```

---

## 📚 参考资源

- [GitHub API 文档](https://docs.github.com/en/rest)
- [node-cron 文档](https://www.npmjs.com/package/node-cron)
- [Railway 文档](https://docs.railway.app)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 📞 支持

如有问题，请提交 Issue 或联系开发团队。
