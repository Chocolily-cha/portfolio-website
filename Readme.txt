### 1. 配置自定义域名（可选）
如果您有自有域名（如 yourname.com ），可以在 Netlify 上配置：

- 进入 Domain management → Add custom domain
- 按照提示配置 DNS 记录

### 2. 更新作品内容
您可以在本地修改 src/data/mockData.ts 文件来：

- 添加/修改/删除作品
- 更新作品描述和信息
- 修改分类名称
修改后只需推送到 GitHub，Netlify 会自动重新部署。

### 3. 管理后台
访问 https://chocolilysportfolio.netlify.app/admin 可以管理：

- 作品分类
- 作品列表
默认密码 ： admin123



## 解决方案2：创建新文件替换
由于 GitHub 网页编辑有时不稳定，您可以尝试：

1. 在 GitHub 仓库中点击 "Add file" → "Create new file"
2. 文件名输入 src/pages/Admin_new.tsx
3. 复制粘贴完整的 Admin.tsx 代码
4. 提交后，再删除原来的 Admin.tsx