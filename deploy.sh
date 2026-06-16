#!/bin/bash

# Portfolio Website - GitHub & Vercel 部署脚本

echo "==================================="
echo "  Portfolio Website 部署脚本"
echo "==================================="
echo ""

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装"
    echo ""
    echo "请先安装 Git："
    echo "  Windows: https://git-scm.com/download/win"
    echo "  Mac: https://git-scm.com/download/mac"
    echo "  Linux: sudo apt install git"
    exit 1
fi

echo "✅ Git 已安装"
echo ""

# 获取用户输入
read -p "请输入您的 GitHub 用户名: " GITHUB_USERNAME
read -p "请输入仓库名称 (默认: portfolio-website): " REPO_NAME
REPO_NAME=${REPO_NAME:-portfolio-website}

echo ""
echo "==================================="
echo "  1. 在 GitHub 创建仓库"
echo "==================================="
echo ""
echo "请在浏览器中打开以下链接创建仓库："
echo "  https://github.com/new"
echo ""
echo "填写信息："
echo "  - Repository name: $REPO_NAME"
echo "  - Description: 我的创意作品集"
echo "  - 选择 Public 或 Private"
echo "  - 不要勾选 'Add a README file'"
echo "  - 不要选择 .gitignore"
echo ""
read -p "创建仓库后，按 Enter 继续..."

echo ""
echo "==================================="
echo "  2. 初始化 Git 并推送代码"
echo "==================================="
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 初始化Git
echo "初始化 Git 仓库..."
git init

# 配置默认分支名
git branch -M main

# 添加所有文件
echo "添加文件..."
git add .

# 提交
echo "提交代码..."
git commit -m "Initial commit - Portfolio Website"

# 添加远程仓库
echo "添加远程仓库..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 推送到GitHub
echo "推送到 GitHub..."
echo "可能需要输入 GitHub 用户名和 Personal Access Token"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "==================================="
    echo "  ✅ 代码已成功推送到 GitHub！"
    echo "==================================="
    echo ""
    echo "下一步：在 Vercel 部署"
    echo "  1. 访问 https://vercel.com"
    echo "  2. 使用 GitHub 账号登录"
    echo "  3. 点击 'Add New Project'"
    echo "  4. 选择 '$REPO_NAME' 仓库"
    echo "  5. 点击 'Deploy'"
    echo "  6. 等待部署完成，获取部署链接！"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "  1. GitHub 用户名和仓库名称是否正确"
    echo "  2. 是否创建了 GitHub Personal Access Token"
    echo ""
    echo "创建 Token 步骤："
    echo "  1. 访问 https://github.com/settings/tokens"
    echo "  2. 点击 'Generate new token (classic)'"
    echo "  3. 设置名称，选择 'repo' 权限"
    echo "  4. 创建后复制 Token"
    echo "  5. 推送时使用 Token 作为密码"
    echo ""
fi
