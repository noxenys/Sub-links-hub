# GitHub 发布指南

本文档将指导您如何将 SubLinks Hub 项目发布到 GitHub。

## 📋 前置准备

### 1. 创建 GitHub 账户

如果您还没有 GitHub 账户，请访问 [github.com](https://github.com) 注册。

### 2. 安装 Git

根据您的操作系统安装 Git：

- **Windows**：下载 [Git for Windows](https://git-scm.com/download/win)
- **macOS**：运行 `brew install git`
- **Linux**：运行 `sudo apt-get install git`

验证安装：
```bash
git --version
```

### 3. 配置 Git

```bash
# 配置用户名
git config --global user.name "Your Name"

# 配置邮箱
git config --global user.email "your.email@example.com"

# 验证配置
git config --global --list
```

## 🚀 发布步骤

### 第一步：在 GitHub 创建新仓库

1. 登录 GitHub 账户
2. 点击右上角的 **+** 图标，选择 **New repository**
3. 填写仓库信息：
   - **Repository name**：`sub-links-hub`
   - **Description**：`隐秘订阅链接导航平台 - 精选极冷门但活跃的代理订阅链接`
   - **Visibility**：选择 **Public**（公开）或 **Private**（私有）
   - **Initialize this repository with**：**不勾选**（我们将推送现有代码）

4. 点击 **Create repository**

### 第二步：初始化本地 Git 仓库

在项目根目录打开终端，执行以下命令：

```bash
cd /home/ubuntu/sub-links-hub

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建首次提交
git commit -m "feat: initial commit - SubLinks Hub subscription link navigator"
```

### 第三步：连接到远程仓库

将 `YOUR_USERNAME` 替换为您的 GitHub 用户名：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/sub-links-hub.git

# 验证远程仓库
git remote -v
```

### 第四步：推送代码到 GitHub

```bash
# 将代码推送到 GitHub（首次需要输入认证信息）
git branch -M main
git push -u origin main
```

**首次推送时的认证方式：**

#### 方式一：使用个人访问令牌（推荐）

1. 在 GitHub 上生成 Personal Access Token：
   - 点击右上角头像 → Settings
   - 选择 Developer settings → Personal access tokens → Tokens (classic)
   - 点击 Generate new token (classic)
   - 勾选 `repo` 权限
   - 点击 Generate token
   - **复制并保存 Token**（只会显示一次）

2. 推送时使用 Token：
   ```bash
   git push -u origin main
   # 提示输入用户名时，输入您的 GitHub 用户名
   # 提示输入密码时，粘贴刚才生成的 Token
   ```

#### 方式二：使用 SSH 密钥

1. 生成 SSH 密钥：
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   # 一直按 Enter 使用默认设置
   ```

2. 添加 SSH 密钥到 GitHub：
   - 复制公钥内容：`cat ~/.ssh/id_ed25519.pub`
   - 在 GitHub 上：Settings → SSH and GPG keys → New SSH key
   - 粘贴公钥内容，点击 Add SSH key

3. 修改远程仓库地址：
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/sub-links-hub.git
   ```

4. 推送代码：
   ```bash
   git push -u origin main
   ```

### 第五步：验证推送成功

访问 `https://github.com/YOUR_USERNAME/sub-links-hub`，确认代码已成功上传。

## 📝 仓库配置建议

### 1. 添加 README 徽章

在 README.md 顶部添加徽章，展示项目信息：

```markdown
[![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/sub-links-hub)](https://github.com/YOUR_USERNAME/sub-links-hub/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/sub-links-hub)](https://github.com/YOUR_USERNAME/sub-links-hub/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/sub-links-hub)](https://github.com/YOUR_USERNAME/sub-links-hub/network)
```

### 2. 启用 GitHub Pages（可选）

如果您想为项目创建文档网站：

1. 在仓库 Settings → Pages
2. 选择 Source 为 `main` 分支
3. 选择文件夹为 `/docs`（如果有）

### 3. 配置 Branch Protection Rules（可选）

保护主分支：

1. Settings → Branches
2. 点击 Add rule
3. 输入分支名称 `main`
4. 勾选以下选项：
   - Require a pull request before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

### 4. 设置 Issue 和 PR 模板

项目已包含 Issue 模板，它们会自动显示在：
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`

## 🔄 后续工作流

### 添加新功能

```bash
# 创建特性分支
git checkout -b feature/your-feature-name

# 进行修改并提交
git add .
git commit -m "feat: describe your feature"

# 推送到 GitHub
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
```

### 发布新版本

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签到 GitHub
git push origin v1.0.0
```

## 🐛 常见问题

### Q: 推送时出现 "fatal: could not read Username"

**A:** 使用 Personal Access Token 或 SSH 密钥进行认证。

### Q: 如何修改已推送的提交信息？

**A:** 不建议修改已推送的提交。如需修改，使用：
```bash
git commit --amend
git push origin main --force-with-lease
```

### Q: 如何删除已推送的文件？

**A:** 
```bash
git rm --cached filename
git commit -m "Remove filename"
git push origin main
```

### Q: 如何同步上游仓库的更新？

**A:**
```bash
git fetch upstream
git merge upstream/main
git push origin main
```

## 📚 相关资源

- [GitHub 官方文档](https://docs.github.com)
- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 流程指南](https://guides.github.com/introduction/flow/)

## 💡 提示

- 定期提交代码，保持提交历史清晰
- 使用有意义的提交信息
- 在推送前测试代码
- 定期更新依赖包

---

祝您发布顺利！如有问题，欢迎提交 Issue。
