本目录包含用于 GitHub Pages 部署的静态站点内容。

结构说明：

index.html - 主页
assets/ - CSS 与脚本
data/projects.json - 精选项目列表（编辑此文件以更新项目展示）
CNAME - 自定义域（lumeup.cn）
如何更新精选项目：

编辑 site/data/projects.json（保持有效的 JSON 格式）。
提交到 main 分支，GitHub Actions 将自动构建并部署站点。
如何禁用自动部署：

删除或注释掉 .github/workflows/pages.yml，或在仓库设置中禁用 GitHub Actions。注意：这会停止自动发布到 GitHub Pages。
常见问题：

自定义域（lumeup.cn）DNS 配置如未生效，请确保已按文档添加四条 A 记录并（可选）添加 www 的 CNAME 指向 gitdolores.github.io。
HTTPS 证书由 GitHub 自动申请，需等 DNS 生效后自动启用（通常几分钟到一小时）。
