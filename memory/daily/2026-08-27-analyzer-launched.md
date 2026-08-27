---
title: 源码自动分析机器人上线
date: 2026-08-27
tags: [analyzer, automation, milestone]
source: task
---

# 源码自动分析机器人上线

## What changed
- `tools/analyze.mjs` + `tools/dictionaries.mjs`：浅克隆仓库 → 扫描 → 抽样读码 → 生成通俗版报告 JSON（概述/技术栈人话/目录导览/核心模块/数据流/设计模式/阅读建议）
- `.github/workflows/analyze.yml`：每周一 03:00 UTC 定时 + 手动 dispatch（可 force）；运行中每 45s 提交进度快照，报告页轮询显示实时进度条；结束后触发 Pages 重部署
- `site/report.html` + `assets/report.js`：报告查看页；报告不存在时自动进入进度轮询模式（10s 间隔）
- 首页卡片：已缓存项目显示「📖 查看分析报告」，未分析显示「🤖 分析这个项目」

## 关键设计
- 缓存：`site/data/reports/<owner__repo>.json` 存在即跳过（`--force` 重析）
- 降级：clone 超时（8min）→ GitHub API 元数据轻量档案
- 纯静态启发式（不调大模型），知识字典在 dictionaries.mjs 可持续扩充

## 踩坑记录
- 语言检测初版永远为空：LANGUAGES 键是全名（python），查的是扩展名（py）——加了 EXT2LANG 映射表修复
- CI 运行 #2 与修复推送只差 1 分钟，跑的还是旧代码；重新 dispatch 后验证通过（Python x4794、入口 src/transformers/__init__.py）
- 本地与 CI 同时生成报告会产生 merge 冲突：规则是 CI 版本优先（checkout --theirs）

## 结果
- 三轮 CI 全绿：Analyze #1/#2/#3 + Pages 部署 #7–#12 均成功
- 线上报告示例：http://www.lumeup.cn/report.html?repo=huggingface/transformers
