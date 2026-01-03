# Windows 系统 GitHub 推送完整指南

本指南专为 Windows 用户设计，一步步教您如何将 SubLinks Hub 项目代码推送到 GitHub。

## 📋 前置准备

### 第一步：安装 Git

1. 访问 [Git 官方网站](https://git-scm.com/download/win)
2. 下载 **Git for Windows**（选择最新版本）
3. 运行安装程序，一路点击 **Next** 即可（保持默认设置）
4. 安装完成后，重启电脑

### 第二步：验证 Git 安装

1. 按 **Win + R** 打开运行窗口
2. 输入 `cmd` 并按 Enter，打开命令提示符
3. 输入以下命令：
   ```
   git --version
   ```
4. 如果显示版本号（如 `git version 2.42.0`），说明安装成功

### 第三步：配置 Git 用户信息

在命令提示符中输入以下命令（将用户名和邮箱替换为您的信息）：

```
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**示例**：
```
git config --global user.name "noxenys"
git config --global user.email "your.email@gmail.com"
```

## 🚀 推送项目代码

### 第一步：下载项目文件

1. 从 Manus 平台下载 SubLinks Hub 项目文件
2. 解压到您的电脑上，例如：`C:\Users\YourName\Documents\sub-links-hub`

### 第二步：打开命令提示符

1. 在项目文件夹中，按 **Shift + 右键**
2. 选择 **"在此处打开 PowerShell 窗口"** 或 **"在此处打开命令窗口"**

   或者：
   
3. 按 **Win + R**，输入 `cmd`，然后输入：
   ```
   cd C:\Users\YourName\Documents\sub-links-hub
   ```

### 第三步：初始化 Git 仓库

在命令提示符中输入：

```
git init
```

您应该看到类似的输出：
```
Initialized empty Git repository in C:\Users\YourName\Documents\sub-links-hub\.git\
```

### 第四步：添加所有文件

```
git add .
```

这个命令会将项目中的所有文件添加到 Git 暂存区。

### 第五步：创建首次提交

```
git commit -m "feat: initial commit - SubLinks Hub subscription link navigator"
```

您应该看到类似的输出：
```
[main (root-commit) abc1234] feat: initial commit - SubLinks Hub subscription link navigator
 150 files changed, 5000 insertions(+)
 create mode 100644 README.md
 ...
```

### 第六步：添加远程仓库

将 `noxenys` 替换为您的 GitHub 用户名：

```
git remote add origin https://github.com/noxenys/sub-links-hub.git
```

验证添加成功：
```
git remote -v
```

应该显示：
```
origin  https://github.com/noxenys/sub-links-hub.git (fetch)
origin  https://github.com/noxenys/sub-links-hub.git (push)
```

### 第七步：重命名分支为 main

```
git branch -M main
```

### 第八步：推送代码到 GitHub

```
git push -u origin main
```

**首次推送时会要求认证**，有两种方式：

#### 方式一：使用 Personal Access Token（推荐）

1. 在 GitHub 上生成 Token：
   - 登录 GitHub
   - 点击右上角头像 → **Settings**
   - 选择 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - 点击 **Generate new token (classic)**
   - 勾选 `repo` 权限
   - 点击 **Generate token**
   - **复制 Token**（只会显示一次，一定要保存好）

2. 推送时的认证：
   - 命令提示符会提示输入用户名，输入您的 GitHub 用户名
   - 提示输入密码时，粘贴刚才复制的 Token

#### 方式二：使用 GitHub Desktop（更简单）

如果觉得命令行复杂，可以使用 GitHub Desktop：

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. 安装并登录您的 GitHub 账户
3. 点击 **File** → **Clone repository**
4. 选择 `noxenys/sub-links-hub`
5. 选择本地路径
6. 点击 **Clone**
7. 在 GitHub Desktop 中修改文件后，点击 **Commit to main**
8. 点击 **Push origin** 推送到 GitHub

---

## ✅ 推送成功的标志

如果看到以下输出，说明推送成功：

```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 5.00 MiB | 1.00 MiB/s, done.
Total 150 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/noxenys/sub-links-hub.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

然后刷新 GitHub 页面，您应该能看到所有项目文件都已上传。

---

## 🐛 常见问题和解决方案

### Q1: 推送时出现 "fatal: could not read Username"

**原因**：Git 无法获取您的认证信息

**解决方案**：
1. 使用 Personal Access Token 而不是密码
2. 或者使用 GitHub Desktop 应用

### Q2: 推送时出现 "fatal: 'origin' does not appear to be a 'git' repository"

**原因**：没有正确添加远程仓库

**解决方案**：
```
git remote add origin https://github.com/noxenys/sub-links-hub.git
```

### Q3: 推送时出现 "fatal: The remote end hung up unexpectedly"

**原因**：网络连接问题

**解决方案**：
1. 检查网络连接
2. 等待几分钟后重试
3. 使用以下命令增加超时时间：
   ```
   git config --global http.postBuffer 524288000
   ```

### Q4: 如何修改已推送的代码？

**步骤**：
1. 在本地修改文件
2. 运行：
   ```
   git add .
   git commit -m "fix: your commit message"
   git push origin main
   ```

### Q5: 如何查看推送历史？

```
git log --oneline
```

---

## 📝 完整命令速查表

| 操作 | 命令 |
| :--- | :--- |
| 初始化仓库 | `git init` |
| 检查状态 | `git status` |
| 添加文件 | `git add .` |
| 创建提交 | `git commit -m "message"` |
| 添加远程仓库 | `git remote add origin URL` |
| 重命名分支 | `git branch -M main` |
| 推送代码 | `git push -u origin main` |
| 查看日志 | `git log --oneline` |
| 查看远程仓库 | `git remote -v` |

---

## 🎯 推送后的建议操作

### 1. 在 GitHub 上添加项目描述

1. 访问 https://github.com/noxenys/sub-links-hub
2. 点击右上角的 **About** 齿轮图标
3. 添加以下信息：
   - **Description**：隐秘订阅链接导航平台
   - **Website**：（如果有的话）
   - **Topics**：subscription-links, proxy, clash, telegram, react, nodejs

### 2. 启用 Discussions（讨论功能）

1. 进入仓库的 **Settings**
2. 找到 **Features** 部分
3. 勾选 **Discussions**

### 3. 创建第一个 Release

1. 点击 **Releases** → **Create a new release**
2. 填写以下信息：
   - **Tag version**：`v1.0.0`
   - **Release title**：`SubLinks Hub v1.0.0 - Initial Release`
   - **Description**：
     ```
     🎉 Initial release of SubLinks Hub!
     
     Features:
     - 14 curated subscription links
     - Database-driven architecture
     - One-click copy functionality
     - Real-time search and filtering
     ```
3. 点击 **Publish release**

---

## 💡 Windows 特定建议

### 使用 Visual Studio Code（推荐）

1. 下载 [Visual Studio Code](https://code.visualstudio.com/)
2. 安装 Git Graph 扩展
3. 在 VS Code 中打开项目文件夹
4. 使用集成终端（Ctrl + `）运行 Git 命令
5. 可视化查看提交历史

### 使用 TortoiseGit（图形界面）

1. 下载 [TortoiseGit](https://tortoisegit.org/)
2. 安装后在文件夹中右键即可看到 Git 选项
3. 无需命令行，全部通过图形界面操作

---

## 🎉 完成！

按照以上步骤操作后，您的 SubLinks Hub 项目就成功发布到 GitHub 了！

**您的项目链接**：https://github.com/noxenys/sub-links-hub

现在您可以：
- 📢 分享这个链接给其他人
- ⭐ 邀请他人 Star 您的项目
- 🤝 接受社区的 Pull Request
- 📝 在 Issues 中与用户讨论功能

祝贺您！🎊
