# 通知系统文档

## 概述

SubLinks Hub 现已集成完整的通知系统，允许用户接收和管理应用内通知。该系统支持多种通知类型、持久化存储和实时更新。

## 功能特性

### 1. 通知类型

系统支持以下通知类型：

| 类型 | 图标 | 颜色 | 用途 |
| :--- | :--- | :--- | :--- |
| **info** | ℹ️ | 蓝色 | 一般信息和提示 |
| **success** | ✓ | 绿色 | 操作成功 |
| **warning** | ⚠️ | 黄色 | 警告信息 |
| **error** | ✗ | 红色 | 错误提示 |
| **system** | ⚙️ | 蓝色 | 系统通知 |

### 2. 通知中心

右上角的通知铃铛图标提供以下功能：

- **实时通知计数**：显示未读通知数量
- **通知列表**：展示最近 20 条通知
- **标记为已读**：点击 ✓ 按钮标记单条通知为已读
- **删除通知**：点击 ✗ 按钮删除通知
- **自动刷新**：每 30 秒自动检查新通知

### 3. 通知持久化

所有通知都存储在数据库中，包括：

- 通知 ID
- 用户 ID
- 通知类型
- 标题和消息
- 操作链接（可选）
- 已读状态
- 创建时间

## API 接口

### tRPC 路由：`notifications`

#### 1. `getAll` - 获取所有通知

```typescript
trpc.notifications.getAll.useQuery({ limit: 20 })
```

**参数：**
- `limit` (可选): 返回通知数量，默认 20

**返回值：**
```typescript
Notification[]
```

#### 2. `getUnread` - 获取未读通知

```typescript
trpc.notifications.getUnread.useQuery()
```

**返回值：**
```typescript
Notification[]
```

#### 3. `markAsRead` - 标记为已读

```typescript
trpc.notifications.markAsRead.useMutation()
```

**参数：**
```typescript
{ id: number }
```

#### 4. `delete` - 删除通知

```typescript
trpc.notifications.delete.useMutation()
```

**参数：**
```typescript
{ id: number }
```

## 数据库架构

### notifications 表

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(255) NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  actionUrl VARCHAR(255),
  isRead TINYINT(1) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt)
);
```

## 使用示例

### 前端：获取和显示通知

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  // 获取所有通知
  const { data: notifications } = trpc.notifications.getAll.useQuery({ limit: 20 });

  // 获取未读通知
  const { data: unreadNotifications } = trpc.notifications.getUnread.useQuery();

  // 标记为已读
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  
  const handleMarkAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ id });
  };

  // 删除通知
  const deleteNotificationMutation = trpc.notifications.delete.useMutation();
  
  const handleDelete = async (id: number) => {
    await deleteNotificationMutation.mutateAsync({ id });
  };

  return (
    <div>
      {notifications?.map(notification => (
        <div key={notification.id}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <button onClick={() => handleMarkAsRead(notification.id)}>
            标记为已读
          </button>
          <button onClick={() => handleDelete(notification.id)}>
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 后端：创建通知

```typescript
import { createNotification } from '@/server/db-notifications';

// 创建一个成功通知
await createNotification({
  userId: 'user-123',
  type: 'success',
  title: '支付成功',
  message: '您的支付已成功处理',
  actionUrl: '/account/transactions',
});

// 创建一个系统通知
await createNotification({
  userId: 'user-123',
  type: 'system',
  title: '新链接已添加',
  message: '有 3 个新的订阅链接已添加到系统',
});
```

## 通知中心组件

### NotificationCenter 组件

位置：`client/src/components/NotificationCenter.tsx`

**功能：**
- 显示通知铃铛图标
- 显示未读通知计数
- 展示通知列表
- 支持标记为已读和删除操作
- 自动刷新（30 秒间隔）

**使用方式：**
```typescript
import { NotificationCenter } from '@/components/NotificationCenter';

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <NotificationCenter />
    </header>
  );
}
```

## 测试

### 运行通知系统测试

```bash
pnpm test server/__tests__/notifications.test.ts
```

### 测试覆盖

- ✅ 创建通知
- ✅ 获取通知
- ✅ 获取未读通知
- ✅ 标记为已读
- ✅ 删除通知
- ✅ 完整工作流

## 最佳实践

### 1. 通知类型选择

- 使用 `success` 表示操作成功（如支付完成）
- 使用 `error` 表示操作失败
- 使用 `warning` 表示需要注意的事项
- 使用 `info` 表示一般信息
- 使用 `system` 表示系统级通知

### 2. 通知消息

- 保持标题简洁（最多 50 字）
- 消息应清晰明了，说明发生了什么
- 提供 `actionUrl` 帮助用户快速跳转到相关页面

### 3. 性能优化

- 使用 `refetchInterval` 控制刷新频率
- 定期清理已读通知
- 在数据库中添加索引以加快查询

## 未来改进

### 1. Stripe 支付集成

当您添加 Stripe 账户时，系统将自动发送以下通知：

- 支付成功通知
- 订阅激活通知
- 订阅续费提醒
- 支付失败警告

### 2. 邮件通知

- 支持发送邮件通知
- 用户可以选择通知偏好
- 批量发送重要通知

### 3. 通知模板

- 预定义的通知模板
- 支持自定义变量
- 多语言支持

### 4. 通知规则引擎

- 基于条件的自动通知
- 通知分组和聚合
- 智能推荐时间

## 常见问题

### Q: 通知会永久保存吗？

A: 是的，所有通知都保存在数据库中。您可以根据需要清理旧通知。

### Q: 如何批量删除通知？

A: 目前需要逐个删除。未来版本将支持批量操作。

### Q: 能否自定义通知样式？

A: 可以。修改 `NotificationCenter.tsx` 中的 CSS 类名和颜色。

### Q: 通知有字数限制吗？

A: 标题最多 255 字，消息无限制（建议不超过 500 字）。

## 支持

如有问题或建议，请在 GitHub 上提交 Issue。
