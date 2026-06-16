# 部署指南 - Vercel

## 快速部署步骤

### 1. 准备工作

1. **注册Vercel账号**
   - 访问 https://vercel.com
   - 使用GitHub、Google或邮箱注册

2. **安装Vercel CLI（可选）**
   ```bash
   npm install -g vercel
   ```

### 2. 部署方式

#### 方式一：通过GitHub部署（推荐）

1. **创建GitHub仓库**
   - 在GitHub上创建新仓库，命名为 `portfolio-website`
   - 将本地代码推送到仓库

2. **连接Vercel**
   - 登录 Vercel Dashboard
   - 点击 "Add New Project"
   - 选择刚刚创建的GitHub仓库
   - Vercel会自动检测到Vite项目

3. **配置项目**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **部署**
   - 点击 "Deploy"
   - Vercel会自动构建并部署

#### 方式二：使用Vercel CLI部署

```bash
# 登录Vercel
vercel login

# 进入项目目录
cd d:\AI\TraeProjects\projects\PortfolioWebsite

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 3. 配置自定义域名

1. **购买域名**
   - 建议：阿里云、腾讯云、GoDaddy等

2. **在Vercel中添加域名**
   - 进入项目 Dashboard
   - 点击 "Settings" → "Domains"
   - 输入您的域名（如 `yourname.com`）
   - 点击 "Add"

3. **配置DNS解析**
   - 登录您的域名服务商
   - 添加DNS记录：
     ```
     类型: CNAME
     名称: www (或 @)
     值: cname.vercel-dns.com
     ```
   - 或添加A记录（Vercel会提供具体的IP）

4. **等待SSL证书自动配置**
   - Vercel会自动申请和更新Let's Encrypt证书
   - 约几分钟后即可使用HTTPS访问

### 4. 验证部署

部署成功后，您可以：
- 访问 `https://your-project.vercel.app` 验证
- 访问 `https://your-domain.com` 验证自定义域名

## 项目结构

```
PortfolioWebsite/
├── vercel.json          # Vercel配置文件
├── package.json         # 项目依赖
├── tailwind.config.js   # Tailwind配置
├── vite.config.ts       # Vite配置
├── src/
│   ├── components/      # React组件
│   ├── pages/           # 页面组件
│   ├── data/           # 数据
│   └── types/          # TypeScript类型
└── public/             # 静态资源
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `vercel` | 部署到预览环境 |
| `vercel --prod` | 部署到生产环境 |
| `vercel logs` | 查看部署日志 |
| `vercel env pull` | 下载环境变量 |
| `vercel domains add` | 添加自定义域名 |

## 注意事项

1. **构建命令**：已配置为 `npm run build`
2. **输出目录**：已配置为 `dist`
3. **SPA路由**：已配置所有路径回退到 `index.html`
4. **HTTPS**：Vercel自动配置，无需手动操作
5. **CDN**：全球CDN自动加速

## 故障排除

### 部署失败
- 检查 `npm run build` 是否本地通过
- 查看Vercel构建日志
- 确保所有依赖在 `package.json` 中声明

### 域名验证失败
- 确认DNS解析已生效（可能需要等待几分钟）
- 检查域名拼写是否正确
- 确认DNS记录类型正确

### SSL证书问题
- 等待几分钟让证书自动签发
- 检查域名是否已正确解析

## 联系支持

- Vercel文档: https://vercel.com/docs
- GitHub Issues: https://github.com/vercel/vercel
