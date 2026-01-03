# 1. 使用 Node.js 基础镜像（与您的项目要求一致）
FROM node:22-slim

# 2. 安装 pnpm 包管理器
RUN npm install -g pnpm

# 3. 设置工作目录
WORKDIR /app

# 4. 复制项目文件
COPY . .

# 5. 安装依赖并构建项目
# --production 只安装生产环境依赖
RUN pnpm install --production
# 假设您的 package.json 中有 "build" 脚本
RUN pnpm build

# 6. 暴露端口：Hugging Face Spaces 默认监听 7860 端口
EXPOSE 7860

# 7. 启动应用
# 假设您的 package.json 中有 "start" 脚本，并且该脚本会启动应用并监听 7860 端口
# 如果您的 start 脚本不监听 7860，您可能需要修改它或通过环境变量来配置
CMD ["pnpm", "start"]