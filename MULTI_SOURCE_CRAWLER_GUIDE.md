# 多平台爬虫系统指南

## 概述

SubLinks Hub 现已集成完整的多平台爬虫系统，可以从以下来源自动爬取订阅链接：

- **Telegram 频道**：SSRSUB、FreeSSRCloud、ProxySub、ClashSub 等
- **V2EX 论坛**：搜索 proxy、vpn、clash、v2ray 等关键词
- **HostLoc 论坛**：免费资源板块
- **Pastebin**：搜索 clash、v2ray、trojan、vless、vmess 等
- **Rentry**：clash-sub-links、proxy-links、v2ray-config 等页面

## 快速开始

### 运行爬虫脚本

```bash
cd /home/ubuntu/sub-links-hub
node scripts/multi-source-crawler.mjs
```

### 爬虫输出

爬虫脚本会生成 `crawler-results.json` 文件，包含：

```json
{
  "timestamp": "2026-01-06T02:43:09.993Z",
  "totalFound": 21,
  "afterDedup": 21,
  "validLinks": 1,
  "bySource": {
    "telegram": 1
  },
  "links": [
    {
      "url": "https://raw.githubusercontent.com/ssrsub/ssr/master/clash.yaml",
      "source": "telegram",
      "channel": "SSRSUB",
      "type": "http",
      "statusCode": 200,
      "valid": true
    }
  ]
}
```

## 爬虫配置

### Telegram 频道

在 `scripts/multi-source-crawler.mjs` 中修改 `channels` 数组：

```javascript
const channels = [
  'SSRSUB',
  'FreeSSRCloud',
  'ProxySub',
  'ClashSub',
  'V2raySub',
  'TrojanSub',
  'VlessSub',
  'freenode',
  'freevpnnet',
];
```

### V2EX 搜索关键词

修改 `keywords` 数组：

```javascript
const keywords = ['proxy', 'vpn', 'clash', 'v2ray', 'subscription', 'trojan'];
```

### Pastebin 搜索关键词

修改 `searchTerms` 数组：

```javascript
const searchTerms = ['clash', 'v2ray', 'trojan', 'vless', 'vmess'];
```

## 链接验证

爬虫系统会自动验证所有找到的链接：

- **有效**：HTTP 200-399 状态码
- **无效**：HTTP 402、404、502、503、504 等错误码
- **超时**：请求超过 10 秒

## 数据库集成

### 添加新链接到数据库

```bash
# 1. 运行爬虫获取新链接
node scripts/multi-source-crawler.mjs

# 2. 查看 crawler-results.json 中的有效链接

# 3. 使用 SQL 添加到数据库
# 示例：
INSERT INTO subscription_links (title, url, description, protocol, stability, categoryId, isActive, tags) 
VALUES (
  'Telegram SSRSUB 频道',
  'https://raw.githubusercontent.com/ssrsub/ssr/master/clash.yaml',
  '从 Telegram SSRSUB 频道爬取的 Clash 配置',
  'clash',
  'high',
  1,
  1,
  '["telegram","ssrsub","clash"]'
);
```

## 自动化部署

### 方案 1：GitHub Actions（推荐）

创建 `.github/workflows/crawler.yml`：

```yaml
name: Multi-Source Crawler

on:
  schedule:
    - cron: '0 0 * * *'  # 每天午夜运行
  workflow_dispatch:

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run crawler
        run: node scripts/multi-source-crawler.mjs
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: crawler-results
          path: crawler-results.json
```

### 方案 2：Manus 定时任务

在 Manus Management UI 中配置定时任务，每天运行爬虫脚本。

### 方案 3：Railway/Render

部署为后台服务，定期运行爬虫脚本。

## 链接提取规则

爬虫支持以下链接格式：

| 协议 | 正则表达式 | 示例 |
| :--- | :--- | :--- |
| VMess | `vmess://[A-Za-z0-9+/=\-_]+` | `vmess://eyJhZGQiOiJ...` |
| VLESS | `vless://[A-Za-z0-9+/=\-_:@.]+` | `vless://uuid@host:port` |
| Trojan | `trojan://[A-Za-z0-9+/=\-_:@.]+` | `trojan://password@host:port` |
| SS | `ss://[A-Za-z0-9+/=\-_:@.]+` | `ss://method:password@host:port` |
| SSR | `ssr://[A-Za-z0-9+/=\-_:@.]+` | `ssr://host:port:protocol:method:obfs:password` |
| HTTP | `https?://.*\.(txt\|yaml\|yml\|json\|conf)` | `https://example.com/config.yaml` |

## 故障排除

### 爬虫找不到链接

1. 检查网络连接
2. 验证目标网站是否可访问
3. 检查正则表达式是否匹配
4. 增加超时时间

### 链接验证失败

1. 检查链接格式是否正确
2. 验证链接是否已过期
3. 尝试使用代理访问

### 数据库错误

1. 检查 tags 字段格式是否为有效 JSON
2. 验证 categoryId 是否存在
3. 检查 URL 是否重复

## 性能优化

- **并行爬取**：同时爬取多个平台
- **请求延迟**：避免频繁请求导致 IP 被封
- **去重**：自动去除重复链接
- **缓存**：缓存已验证的链接

## 安全建议

1. **User-Agent**：使用浏览器 User-Agent 避免被识别为爬虫
2. **延迟**：在请求之间添加延迟
3. **代理**：如果被封 IP，使用代理
4. **遵守 robots.txt**：尊重网站爬虫协议

## 常见问题

**Q: 爬虫多久运行一次？**
A: 默认每天运行一次。可根据需要调整频率。

**Q: 如何添加新的爬虫来源？**
A: 在 `multi-source-crawler.mjs` 中添加新的爬虫函数。

**Q: 爬虫支持代理吗？**
A: 支持。修改 axios 配置添加代理。

**Q: 如何处理失效链接？**
A: 爬虫自动验证链接，失效链接不会被添加到数据库。

## 许可证

MIT
