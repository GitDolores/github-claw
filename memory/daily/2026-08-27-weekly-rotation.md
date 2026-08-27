---
title: 每周精选轮换功能上线
date: 2026-08-27
tags: [weekly-rotation, feature, ci]
source: session
author: agent
---

# 每周精选轮换功能完成

## 完成摘要

实现了「精选项目每周更新 + 历史归档分类 + 随时总结」完整管线：

- **tools/weekly.mjs**：每周一 03:00 UTC（weekly.yml）刷新精选元数据 → 展示满 4 周的项目移入 archive.json（自动分类）→ 从 backlog.json 按星数补位至 6 个。
- **tools/summarize.mjs**：聚合 projects.json + archive.json 生成 summary.json（分类统计、Top3、主线语言、一句话总结）。
- **site/history.html + assets/history.js**：历史归档页，按分类筛选，精选/已归档徽章，已缓存报告标注 📖。
- **weekly.yml**：rotate → analyze → summarize → commit [skip ci] → 触发 pages.yml 重部署。

## 验证结果

- Weekly Update #1 CI 运行成功（run ed547bb 自动提交 4 份新报告，共 9 份）。
- 线上验证：lumeup.cn/history.html、/data/summary.json、/data/reports/*.json 全部 HTTP 200。
- 总结 headline：「共收录 9 个项目：当前精选 6 个、历史 3 个，覆盖 5 个分类。星数最多的分类是「大模型 / LLM」。」

## 后续事项

- **backlog.json 已空**：演示轮换消耗了全部 6 个候选，下次应补充新候选项目。
- 分类规则在 tools/dictionaries.mjs 的 CATEGORY_RULES，新增分类需同步修改 classifyProject。

## 关键决策

- 分类用词边界正则（wordish）避免 supervision→vision 误判；强信号（repo/name/tags）优先于 description。
- 归档项目永久保留（不删除），历史页可随时按分类总结。
