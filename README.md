# LumeClaw

**用 Claw 抓取开源项目，用 Lume 点亮 AI 学习之路。**

LumeClaw 是一个 AI 项目学习库：自动抓取并分析精选开源 AI 项目，提供通俗版源码分析报告、学习路线与成长数据。本目录包含用于 GitHub Pages 部署的静态站点内容（[lumeup.cn](https://lumeup.cn)）。

## 站点结构

```
site/
├── index.html        # 主页：精选项目、路线图、更新日志、增长趋势
├── report.html       # 项目源码分析报告页（通俗版，支持实时进度条）
├── history.html      # 历史项目归档与分类总结页
├── assets/           # CSS / 主题系统 / 渲染脚本
└── data/
    ├── projects.json          # 当前精选项目（每周轮换）
    ├── backlog.json           # 精选候选池（补位来源）
    ├── archive.json           # 历史精选项目（自动分类归档）
    ├── summary.json           # 分类总结（自动生成）
    ├── reports/               # 项目分析报告缓存（勿手编）
    └── analysis-status.json   # 分析进度实时状态
```

## 主题系统

站点内置 4 套可切换主题（右上角按钮，localStorage 持久化 + 跨页同步）：

| 主题 | 风格 | 主题形象 |
|------|------|----------|
| Lume 深空 | 默认 · 深蓝紫科技风 | 星空小狐娘（狐耳 + 尾巴 + 星点） |
| Miku 马卡龙 | 初音主题 · 粉蓝渐变 | 初音未来（青葱长双马尾 + 01 编号 + 耳机） |
| Sakura 樱花 | 柔和粉白 · 春日清新 | 樱花精灵（粉发 + 发饰花瓣 + 飘落花瓣） |
| Terminal 终端 | 极客绿 · 黑底护眼 | 终端娘（绿发 + coder 护目镜 + 闪烁代码） |

每切换一个主题，hero 区形象随之切换（CSS `data-theme` × `data-mascot` 匹配，无 JS 依赖）。

## 每周精选轮换

- 每周一 03:00 UTC，`weekly.yml` 自动执行：刷新精选项目元数据 → 展示满 4 周的项目移入历史（自动分类）→ 从 backlog.json 按星数补位 → 分析新项目 → 生成分类总结 → 部署。
- 历史项目永远保留在 archive.json，可在 history.html 按分类浏览、随时生成总结。
- 想让某个项目尽快上精选：把它加进 `site/data/backlog.json`。
- 也可在 Actions → Weekly Update → Run workflow 手动触发（可选强制重析）。

## 自动克隆与源码分析

仓库内置一个「源码阅读机器人」：

- `tools/analyze.mjs`：克隆仓库（浅克隆）→ 扫描目录 → 抽样读源码 → 生成通俗易懂的分析报告 JSON。报告共 17 个板块：项目概述、技术栈（用人话解释）、目录结构导览、核心模块、适用场景、输出格式/接口规范、效果演示、依赖分析、数据流（含流程图）、设计模式与代码套路、作者原话、社区活跃度与版本迭代、同类竞品对比、常见改造方向（入门/进阶/硬核）、阅读建议、高频踩坑清单、原始数据与源码，并支持一键下载/复制报告与克隆命令。
- 网络重试策略：克隆或 API 调用遇到网络类失败（超时/断连/SSL）时，先隔 5 分钟重试（最多 3 次）；仍失败改为隔 1 小时重试（最多 3 次）；再失败则放弃该项目、继续下一个。重试等待期间进度文件会写入 `retry-wait` 状态，报告页可见。
- `.github/workflows/analyze.yml`：可手动触发（可勾选 force 强制重新分析），分析过程中每 45 秒阶段性推送进度，报告页实时显示进度条。
- 已分析过的项目自动缓存（报告文件存在即跳过）；超大仓库克隆失败时自动降级为 GitHub API 元数据轻量档案。
- 依赖清单只认仓库根目录的 manifest（package.json / requirements.txt / pyproject.toml / go.mod / Cargo.toml / setup.py）。

触发分析的三种方式：

1. 等每周一的定时任务
2. Actions → Analyze Projects → Run workflow（可选 force）
3. 首页点项目卡片上的「🤖 分析这个项目」——第一次点击进入报告页会显示排队/进行中状态，机器人跑完后（页面每 10 秒轮询）自动展示

## 工具链

| 脚本 | 作用 |
|------|------|
| `tools/weekly.mjs` | 精选轮换：刷新元数据、满 4 周归档、backlog 补位（`--dry-run` 预览） |
| `tools/analyze.mjs` | 源码分析：浅克隆 → 扫描 → 生成通俗报告（`--force` 忽略缓存） |
| `tools/summarize.mjs` | 生成分类总结 summary.json（`--print` 同时输出到终端） |
| `tools/dictionaries.mjs` | 知识词典：语言/框架/模式/竞品的通俗解释映射 |

工作流：`weekly.yml`（每周一 03:00 UTC 全流程）→ `analyze.yml`（手动/临时分析）→ `pages.yml`（push main 或手动触发部署）。

## 如何禁用自动部署

删除或注释掉 `.github/workflows/pages.yml`，或在仓库设置中禁用 GitHub Actions。注意：这会停止自动发布到 GitHub Pages。

## 常见问题

- **自定义域（lumeup.cn）DNS 未生效**：确保已添加四条 A 记录并（可选）添加 www 的 CNAME 指向 gitdolores.github.io。
- **HTTPS 证书**：由 GitHub 自动申请，DNS 生效后自动启用（通常几分钟到一小时）。
- **报告偏差**：分析报告由静态启发式生成（不调用大模型），对语言/框架的识别基于依赖清单与文件特征，个别项目可能有偏差。

## License

MIT
