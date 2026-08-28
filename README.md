本目录包含用于 GitHub Pages 部署的静态站点内容。

结构说明：

index.html - 主页
report.html - 项目源码分析报告页（通俗版）
history.html - 历史项目归档与分类总结页
assets/ - CSS 与脚本
data/projects.json - 当前精选项目（每周轮换）
data/backlog.json - 精选候选池（补位来源）
data/archive.json - 历史精选项目（自动分类归档）
data/summary.json - 分类总结（自动生成）
data/reports/ - 项目分析报告缓存（勿手编）
data/analysis-status.json - 分析进度实时状态
CNAME - 自定义域（lumeup.cn）

## 每周精选轮换

- 每周一 03:00 UTC，`weekly.yml` 自动执行：刷新精选项目元数据 → 展示满 4 周的项目移入历史（自动分类）→ 从 backlog.json 按星数补位 → 分析新项目 → 生成分类总结 → 部署。
- 历史项目永远保留在 archive.json，可在 history.html 按分类浏览、随时生成总结。
- 想让某个项目尽快上精选：把它加进 site/data/backlog.json。
- 也可在 Actions → Weekly Update → Run workflow 手动触发（可选强制重析）。

## 自动克隆与源码分析

仓库内置一个「源码阅读机器人」：

- `tools/analyze.mjs`：克隆仓库（浅克隆）→ 扫描目录 → 抽样读源码 → 生成通俗易懂的分析报告 JSON。报告 v2 共 19 个板块：项目概述、技术栈、目录结构、核心模块、**适用场景**、**输出格式/接口规范**、**效果演示**、**依赖分析**、**数据流（含流程图）**、设计模式、作者原话、**社区活跃度与版本迭代**、**同类竞品对比**、**常见改造方向（入门/进阶/硬核）**、阅读建议、**高频踩坑清单**，并支持**一键下载/复制报告与克隆命令**。
- `.github/workflows/analyze.yml`：每周一自动运行，也可在 Actions 页面手动触发（可勾选 force 强制重新分析）。分析过程中会阶段性推送进度，报告页实时显示进度条。
- 已分析过的项目自动缓存（报告文件存在即跳过）；超大仓库克隆失败时自动降级为 GitHub API 元数据轻量档案。
- 依赖清单只认仓库根目录的 manifest（package.json / requirements.txt / pyproject.toml / go.mod / Cargo.toml / setup.py）。

触发分析的三种方式：

1. 等每周一的定时任务
2. Actions → Analyze Projects → Run workflow（可选 force）
3. 首页点项目卡片上的「🤖 分析这个项目」——第一次点击进入报告页会显示排队/进行中状态，机器人跑完后（页面每 10 秒轮询）自动展示

如何禁用自动部署：

删除或注释掉 .github/workflows/pages.yml，或在仓库设置中禁用 GitHub Actions。注意：这会停止自动发布到 GitHub Pages。

常见问题：

自定义域（lumeup.cn）DNS 配置如未生效，请确保已按文档添加四条 A 记录并（可选）添加 www 的 CNAME 指向 gitdolores.github.io。
HTTPS 证书由 GitHub 自动申请，需等 DNS 生效后自动启用（通常几分钟到一小时）。
分析报告由静态启发式生成（不调用大模型），对语言/框架的识别基于依赖清单与文件特征，个别项目可能有偏差。
