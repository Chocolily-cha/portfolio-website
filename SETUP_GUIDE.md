# GitHub & Vercel 部署详细指南

## 第一部分：准备工作

### 1.1 安装 Git

**Windows:**
1. 访问 https://git-scm.com/download/win
2. 下载 Windows 安装包
3. 运行安装程序，一路点击 "Next"
4. 安装完成后，右键点击桌面任意位置，选择 "Git Bash Here"

**Mac:**
1. 打开终端
2. 运行: `xcode-select --install`
3. 或安装 Homebrew 后运行: `brew install git`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

### 1.2 创建 GitHub 账号

1. 访问 https://github.com
2. 点击 "Sign up"
3. 输入邮箱、密码、用户名
4. 完成验证
5. 验证邮箱

### 1.3 创建 Personal Access Token

由于 GitHub 已不允许使用密码推送，我们需要创建 Token：

1. 登录 GitHub
2. 点击右上角头像 → Settings
3. 左侧菜单选择 "Developer settings"
4. 选择 "Personal access tokens" → "Tokens (classic)"
5. 点击 "Generate new token (classic)"
6. 设置：
   - Name: `Git Bash Token`（任意名称）
   - Expiration: 选择 30 天或 90 天
   - 勾选 `repo` 全部权限
7. 点击 "Generate token"
8. **立即复制并保存 Token**（关闭页面后将无法查看）

---

## 第二部分：创建 GitHub 仓库

### 2.1 创建新仓库

1. 访问 https://github.com/new
2. 填写信息：
   - **Repository name**: `portfolio-website`
   - **Description**: `我的创意作品集网站`
   - **Visibility**: 选择 Public 或 Private
   - **不要勾选** "Add a README file"
   - **不要选择** .gitignore
3. 点击 "Create repository"

### 2.2 记录仓库地址

创建成功后，页面会显示仓库地址，例如：
```
https://github.com/yourusername/portfolio-website
```
**请记录下来备用。**

---

## 第三部分：推送代码到 GitHub

### 3.1 打开 Git Bash

在 PortfolioWebsite 文件夹上右键，选择 "Git Bash Here"
或者打开终端，进入项目目录：
```bash
cd d:/AI/TraeProjects/projects/PortfolioWebsite
```

### 3.2 执行以下命令

```bash
# 1. 初始化 Git 仓库
git init

# 2. 配置默认分支名
git branch -M main

# 3. 添加所有文件
git add .

# 4. 提交代码
git commit -m "Initial commit - Portfolio Website"

# 5. 添加远程仓库（将 yourusername 替换为您的 GitHub 用户名）
git remote add origin https://github.com/yourusername/portfolio-website.git

# 6. 推送到 GitHub（首次推送）
git push -u origin main
```

### 3.3 输入认证信息

当提示输入用户名时，输入您的 GitHub 用户名。

当提示输入密码时，**输入刚才创建的 Personal Access Token**（不是 GitHub 密码）。

### 3.4 推送成功

如果看到类似以下信息，说明推送成功：
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Delta compression using up to 8 threads
Compressing objects: 100% (30/30), done.
Writing objects: 100% (50/50), 5.35 MiB | 2.10 MiB/s, done.
Total 50 (delta 10), reused 0 (delta 0)
remote: Resolving deltas: 100% (10/10), done.
To https://github.com/yourusername/portfolio-website.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 第四部分：在 Vercel 部署

### 4.1 登录 Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问您的 GitHub 仓库

### 4.2 导入项目

1. 点击 "Add New..." → "Project"
2. 在 "Import Git Repository" 页面找到您的仓库
3. 点击 "Import"

### 4.3 配置项目

Vercel 通常会自动检测配置，确认以下设置：
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

点击 "Deploy" 开始部署。

### 4.4 等待部署

部署通常需要 1-2 分钟。完成后会显示：
- **Preview URL**: `https://your-project.vercel.app`
- **Production URL**: `https://your-project.vercel.app`

---

## 第五部分：配置自定义域名（可选）

### 5.1 购买域名

推荐平台：
- 阿里云：https://wanwang.aliyun.com
- 腾讯云：https://dnspod.cloud.tencent.com
- GoDaddy：https://www.godaddy.com

域名价格：约 $10-15/年

### 5.2 在 Vercel 添加域名

1. 进入项目 Dashboard
2. 点击 "Settings"
3. 左侧选择 "Domains"
4. 输入您的域名
5. 点击 "Add"

### 5.3 配置 DNS

在您的域名服务商处添加 DNS 记录：

**方式一：CNAME 记录**
```
类型: CNAME
主机记录: www
记录值: cname.vercel-dns.com
```

**方式二：A 记录（Vercel 会显示具体 IP）**
```
类型: A
主机记录: @
记录值: [Vercel 提供的 IP]
```

### 5.4 等待生效

DNS 更改可能需要几分钟到 48 小时生效。
Vercel 会自动配置 SSL 证书。

---

## 第六部分：更新代码

以后更新网站内容后，执行：

```bash
git add .
git commit -m "更新内容"
git push
```

Vercel 会自动检测并重新部署。

---

## 常见问题

### Q: 推送时提示 "Authentication failed"
A: 需要使用 Personal Access Token 而不是密码。确保 Token 有 repo 权限且未过期。

### Q: Vercel 部署失败
A: 检查：
1. 本地 `npm run build` 是否成功
2. package.json 中的依赖是否完整
3. 查看 Vercel 构建日志

### Q: 域名无法访问
A:
1. 确认 DNS 记录已添加
2. 等待几分钟让 DNS 生效
3. 检查域名是否已正确解析

---

## 联系支持

- GitHub 文档: https://docs.github.com
- Vercel 文档: https://vercel.com/docs
- 我的项目仓库: [请填写您的仓库地址]
