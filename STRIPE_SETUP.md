# Stripe 支付集成指南

## 概述

SubLinks Hub 已为 Stripe 支付功能预留了完整的后端架构。当您获得 Stripe 账户后，可以按照本指南快速启用支付功能。

## 当前状态

✅ **已完成：**
- 数据库表设计（products, subscriptions, transactions）
- tRPC 路由架构（已注释）
- 前端支付组件框架

⏳ **待启用：**
- Stripe API 密钥配置
- Webhook 处理
- 支付流程集成

## 快速开始

### 第 1 步：获取 Stripe 账户

1. 访问 [stripe.com](https://stripe.com)
2. 点击 **Sign up**
3. 填写企业信息
4. 验证邮箱和手机号
5. 完成身份验证

### 第 2 步：获取 API 密钥

1. 登录 Stripe Dashboard
2. 进入 **Developers** → **API keys**
3. 复制 **Secret Key**（以 `sk_` 开头）
4. 复制 **Publishable Key**（以 `pk_` 开头）

### 第 3 步：配置环境变量

在 Manus Management UI 中添加以下环境变量：

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

### 第 4 步：启用 Stripe 功能

1. 在 `server/routers.ts` 中取消注释 `payments` 路由
2. 恢复 `server/stripe-service.ts` 文件
3. 更新 `server/_core/env.ts` 以包含 Stripe 密钥
4. 重启开发服务器

### 第 5 步：创建产品

在 Stripe Dashboard 中创建产品：

**示例：一次性购买产品**
```
名称: 高级链接包
价格: $9.99
描述: 获取 50 个高级订阅链接
```

**示例：订阅产品**
```
名称: 月度订阅
价格: $4.99/月
描述: 每月获得最新的订阅链接更新
```

## 数据库架构

### stripe_products 表

```sql
CREATE TABLE stripe_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stripeProductId VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('one-time', 'subscription') NOT NULL,
  stripePriceId VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  interval VARCHAR(50),
  isActive TINYINT(1) DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### stripe_subscriptions 表

```sql
CREATE TABLE stripe_subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(255) NOT NULL,
  stripeSubscriptionId VARCHAR(255) UNIQUE NOT NULL,
  stripeCustomerId VARCHAR(255) NOT NULL,
  productId INT,
  status ENUM('active', 'past_due', 'canceled', 'unpaid') NOT NULL,
  currentPeriodStart DATETIME,
  currentPeriodEnd DATETIME,
  canceledAt DATETIME,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES stripe_products(id),
  INDEX idx_userId (userId),
  INDEX idx_stripeSubscriptionId (stripeSubscriptionId)
);
```

### stripe_transactions 表

```sql
CREATE TABLE stripe_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(255) NOT NULL,
  stripePaymentIntentId VARCHAR(255) UNIQUE NOT NULL,
  stripeCustomerId VARCHAR(255),
  productId INT,
  amount INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('succeeded', 'processing', 'requires_action', 'failed') NOT NULL,
  receiptUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES stripe_products(id),
  INDEX idx_userId (userId),
  INDEX idx_stripePaymentIntentId (stripePaymentIntentId)
);
```

## API 端点

### 获取产品列表

```typescript
const { data: products } = trpc.payments.products.useQuery();
```

### 创建一次性支付

```typescript
const createCheckoutMutation = trpc.payments.createCheckout.useMutation();

const handleCheckout = async (priceId: string) => {
  const { url } = await createCheckoutMutation.mutateAsync({
    priceId,
    successUrl: 'https://yourdomain.com/success',
    cancelUrl: 'https://yourdomain.com/cancel',
  });
  
  window.location.href = url!;
};
```

### 创建订阅

```typescript
const createSubscriptionMutation = trpc.payments.createSubscriptionCheckout.useMutation();

const handleSubscribe = async (priceId: string) => {
  const { url } = await createSubscriptionMutation.mutateAsync({
    priceId,
    successUrl: 'https://yourdomain.com/success',
    cancelUrl: 'https://yourdomain.com/cancel',
  });
  
  window.location.href = url!;
};
```

### 获取用户订阅

```typescript
const { data: subscriptions } = trpc.payments.getSubscriptions.useQuery();
```

### 获取交易历史

```typescript
const { data: transactions } = trpc.payments.getTransactions.useQuery();
```

## Webhook 设置

### 配置 Webhook 端点

1. 在 Stripe Dashboard 进入 **Developers** → **Webhooks**
2. 点击 **Add endpoint**
3. 输入 Webhook URL：`https://yourdomain.com/api/webhooks/stripe`
4. 选择事件：
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 复制 **Signing secret**

### 处理 Webhook

```typescript
// server/api/webhooks/stripe.ts
import { verifyWebhookSignature } from '@/server/stripe-service';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  const event = verifyWebhookSignature(
    body,
    signature!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (!event) {
    return new Response('Invalid signature', { status: 400 });
  }

  // 处理不同的事件类型
  switch (event.type) {
    case 'payment_intent.succeeded':
      // 处理支付成功
      break;
    case 'checkout.session.completed':
      // 处理结账完成
      break;
    // ... 其他事件
  }

  return new Response('OK', { status: 200 });
}
```

## 测试支付流程

### 使用 Stripe 测试卡

```
卡号: 4242 4242 4242 4242
过期: 12/25
CVC: 123
```

### 测试不同场景

| 场景 | 卡号 |
| :--- | :--- |
| 成功 | 4242 4242 4242 4242 |
| 需要认证 | 4000 0025 0000 3155 |
| 被拒绝 | 4000 0000 0000 0002 |

## 通知集成

支付成功时，系统会自动发送通知：

```typescript
// 支付成功通知
await createNotification({
  userId: 'user-123',
  type: 'success',
  title: '支付成功',
  message: '您的支付已成功处理，感谢您的购买！',
  actionUrl: '/account/transactions',
});

// 订阅激活通知
await createNotification({
  userId: 'user-123',
  type: 'success',
  title: '订阅成功',
  message: '您已成功订阅，感谢您的支持！',
  actionUrl: '/account/subscriptions',
});
```

## 常见问题

### Q: 如何测试支付功能？

A: 使用 Stripe 提供的测试卡号。所有以 `4242` 开头的卡号在测试模式下都会成功。

### Q: 支付失败时会发生什么？

A: 系统会自动发送错误通知，用户可以重试支付。

### Q: 如何处理订阅续费？

A: Stripe 会自动处理续费。您可以通过 webhook 监听 `customer.subscription.updated` 事件。

### Q: 如何取消订阅？

A: 用户可以在账户页面取消订阅，系统会发送取消通知。

## 生产环境部署

### 切换到生产模式

1. 在 Stripe Dashboard 切换到 **Live mode**
2. 获取生产环境的 API 密钥
3. 更新环境变量
4. 更新 Webhook 端点 URL
5. 测试完整的支付流程

### 安全检查清单

- [ ] 使用生产环境 API 密钥
- [ ] 启用 HTTPS
- [ ] 配置 Webhook 签名验证
- [ ] 实现速率限制
- [ ] 添加日志记录
- [ ] 定期备份数据库
- [ ] 设置错误告警

## 支持

- [Stripe 文档](https://stripe.com/docs)
- [Stripe API 参考](https://stripe.com/docs/api)
- [Stripe 测试数据](https://stripe.com/docs/testing)

## 下一步

1. 创建 Stripe 账户
2. 获取 API 密钥
3. 配置环境变量
4. 启用 Stripe 功能
5. 创建产品
6. 配置 Webhook
7. 测试支付流程
8. 部署到生产环境
