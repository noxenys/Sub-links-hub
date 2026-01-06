# 自动化爬虫系统架构设计

## 系统概述

SubLinks Hub 爬虫系统是一个**企业级的多源自动化爬虫**，能够从 GitHub、Telegram、论坛等多个来源定期抓取订阅链接，并自动更新到数据库中。系统支持三种部署方式，确保高可用性和灵活性。

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                     数据来源（多源）                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   GitHub     │   Telegram   │  V2EX/论坛   │  Pastebin/其他 │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              爬虫引擎（Crawler Engine）                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ GitHub爬虫   │ Telegram爬虫 │ 论坛爬虫     │ 通用爬虫       │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              数据处理层（Data Processing）                   │
├──────────────┬──────────────┬──────────────┐────────────────┤
│ 链接提取     │ 链接验证     │ 重复检测     │ 数据规范化     │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              数据库（MySQL）                                 │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ subscription │ crawl_logs   │ link_sources │ validation_log │
│ _links       │              │              │                │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              通知系统（Notification）                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ 新链接通知   │ 失效链接警告 │ 爬虫错误告警 │ 统计信息       │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

## 数据流

### 1. 爬虫执行流程

```
开始
  ↓
加载爬虫配置
  ↓
┌─────────────────────────────┐
│ 遍历所有数据源              │
│ (GitHub, Telegram, 论坛等)  │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 执行特定来源的爬虫          │
│ - 获取数据                  │
│ - 提取链接                  │
│ - 解析元数据                │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 数据验证                    │
│ - 链接格式检查              │
│ - 协议验证                  │
│ - URL 有效性检查            │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 重复检测                    │
│ - 数据库查询                │
│ - 哈希比较                  │
│ - 相似度检测                │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 链接可用性检测              │
│ - HTTP 请求测试            │
│ - 超时处理                  │
│ - 重试机制                  │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 数据库操作                  │
│ - 插入新链接                │
│ - 更新现有链接              │
│ - 记录爬虫日志              │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 发送通知                    │
│ - 新链接通知                │
│ - 错误告警                  │
│ - 统计信息                  │
└─────────────────────────────┘
  ↓
结束
```

### 2. 链接生命周期

```
新发现的链接
  ↓
验证格式和有效性
  ↓
检查重复
  ↓
测试可用性
  ↓
┌─────────────────────────────┐
│ 有效 ──→ 添加到数据库       │
│ 无效 ──→ 记录失败原因       │
│ 重复 ──→ 更新来源信息       │
└─────────────────────────────┘
  ↓
定期验证（每周）
  ↓
┌─────────────────────────────┐
│ 可用 ──→ 更新最后检查时间   │
│ 失效 ──→ 标记为失效         │
│ 超时 ──→ 增加失败计数       │
└─────────────────────────────┘
  ↓
┌─────────────────────────────┐
│ 失败次数 > 3 ──→ 删除链接   │
│ 失败次数 ≤ 3 ──→ 保留链接   │
└─────────────────────────────┘
```

## 数据库扩展

### 新增表

#### 1. crawl_logs 表（爬虫日志）

```sql
CREATE TABLE crawl_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source VARCHAR(50) NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME,
  status ENUM('running', 'success', 'failed', 'partial') NOT NULL,
  totalFound INT DEFAULT 0,
  newAdded INT DEFAULT 0,
  updated INT DEFAULT 0,
  failed INT DEFAULT 0,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source (source),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

#### 2. link_sources 表（链接来源追踪）

```sql
CREATE TABLE link_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  linkId INT NOT NULL,
  source VARCHAR(50) NOT NULL,
  sourceUrl VARCHAR(500),
  sourceTitle VARCHAR(255),
  firstFoundAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  lastFoundAt DATETIME,
  occurrenceCount INT DEFAULT 1,
  FOREIGN KEY (linkId) REFERENCES subscription_links(id),
  UNIQUE KEY unique_link_source (linkId, source),
  INDEX idx_linkId (linkId),
  INDEX idx_source (source)
);
```

#### 3. validation_logs 表（验证日志）

```sql
CREATE TABLE validation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  linkId INT NOT NULL,
  validationType ENUM('format', 'connectivity', 'availability') NOT NULL,
  isValid TINYINT(1) NOT NULL,
  responseTime INT,
  errorMessage TEXT,
  validatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (linkId) REFERENCES subscription_links(id),
  INDEX idx_linkId (linkId),
  INDEX idx_validationType (validationType),
  INDEX idx_validatedAt (validatedAt)
);
```

#### 4. 更新 subscription_links 表

```sql
ALTER TABLE subscription_links ADD COLUMN (
  lastValidatedAt DATETIME,
  validationFailureCount INT DEFAULT 0,
  isActive TINYINT(1) DEFAULT 1,
  sourceCount INT DEFAULT 1,
  lastCrawledAt DATETIME
);
```

## 爬虫配置

### 爬虫配置文件结构

```typescript
interface CrawlerConfig {
  // GitHub 爬虫配置
  github: {
    enabled: boolean;
    interval: number; // 秒
    maxStars: number; // 最大 Star 数
    maxForks: number; // 最大 Fork 数
    keywords: string[];
    languages: string[];
    timeout: number;
  };

  // Telegram 爬虫配置
  telegram: {
    enabled: boolean;
    interval: number;
    channels: string[];
    keywords: string[];
    timeout: number;
  };

  // 论坛爬虫配置
  forum: {
    enabled: boolean;
    interval: number;
    sites: string[];
    keywords: string[];
    timeout: number;
  };

  // 通用爬虫配置
  general: {
    enabled: boolean;
    interval: number;
    sites: string[];
    timeout: number;
  };

  // 验证配置
  validation: {
    enabled: boolean;
    interval: number; // 多久验证一次
    timeout: number;
    maxRetries: number;
    failureThreshold: number; // 失败多少次后删除
  };

  // 通知配置
  notification: {
    enabled: boolean;
    notifyOnNewLinks: boolean;
    notifyOnFailedLinks: boolean;
    notifyOnErrors: boolean;
    dailySummary: boolean;
  };
}
```

## 部署方式

### 方式 1：Manus 定时任务

**优点：**
- 与应用紧密集成
- 无需额外服务
- 自动扩展

**缺点：**
- 受 Manus 平台限制
- 不适合长时间运行

**配置方式：**
在 `server/cron/crawler.ts` 中实现爬虫逻辑，使用 Node.js 的 `node-cron` 或 `agenda` 库。

### 方式 2：GitHub Actions

**优点：**
- 免费
- 与 GitHub 集成
- 易于版本控制

**缺点：**
- 受 GitHub 限制（每月 2000 分钟）
- 需要 Personal Access Token

**配置方式：**
在 `.github/workflows/crawler.yml` 中定义工作流。

### 方式 3：外部服务（Railway/Heroku）

**优点：**
- 完全独立
- 高度可定制
- 支持长时间运行

**缺点：**
- 需要额外成本
- 需要维护

**配置方式：**
部署独立的 Node.js 应用到 Railway 或 Heroku。

## 关键特性

### 1. 智能去重

- **哈希比较**：使用 MD5 哈希快速检测完全相同的链接
- **相似度检测**：使用 Levenshtein 距离检测相似链接
- **来源追踪**：记录链接在多个来源中的出现

### 2. 链接验证

- **格式验证**：检查 URL 格式是否正确
- **连接验证**：测试链接是否可访问
- **协议验证**：验证 VMess、Trojan、VLESS 等协议格式

### 3. 错误处理

- **重试机制**：失败自动重试（最多 3 次）
- **超时处理**：设置合理的超时时间
- **错误日志**：详细记录所有错误

### 4. 性能优化

- **并发爬虫**：使用 Promise.all() 并发执行多个爬虫
- **缓存机制**：缓存爬虫结果，避免重复请求
- **速率限制**：遵守 API 速率限制

## 监控和告警

### 监控指标

- 爬虫执行时间
- 发现的新链接数
- 链接验证成功率
- 数据库写入速度
- 错误率

### 告警规则

- 爬虫执行失败
- 发现失效链接数过多
- 验证成功率低于 80%
- 数据库连接失败

## 安全考虑

- **速率限制**：避免对目标网站造成压力
- **User-Agent 轮换**：使用多个 User-Agent
- **IP 轮换**：使用代理池避免 IP 被封
- **数据验证**：严格验证所有爬虫数据
- **日志审计**：记录所有爬虫活动

## 性能目标

| 指标 | 目标 |
| :--- | :--- |
| 单次爬虫执行时间 | < 5 分钟 |
| 新链接发现速度 | > 10 个/分钟 |
| 链接验证成功率 | > 90% |
| 数据库写入延迟 | < 100ms |
| 系统可用性 | > 99% |

## 扩展计划

### 第一阶段（已实现）
- 基础爬虫框架
- 多源爬虫模块
- 链接验证系统

### 第二阶段（计划中）
- 机器学习链接质量评分
- 用户反馈集成
- 高级分析仪表板

### 第三阶段（长期）
- 分布式爬虫
- 实时数据流
- AI 驱动的链接推荐
