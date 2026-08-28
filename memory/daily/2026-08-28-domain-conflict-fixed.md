---
title: www.lumeup.cn 访问故障修复（域名被 ai-projects-learning 抢占）
date: 2026-08-28
tags: [pages, deployment, dns, incident]
source: task
---

# www.lumeup.cn 访问故障修复

## 故障现象
- https://www.lumeup.cn 浏览器报证书错误无法访问；服务器实际下发 `*.github.io` 默认证书
- http://www.lumeup.cn 返回 200 但内容是「AI项目学习助手」（ai-projects-learning 仓库的站点），不是 LumeClaw

## 根因
- 2026-08-28 上午给 `GitDolores/ai-projects-learning` 仓库启用 GitHub Pages 并（通过网页 UI）设置了自定义域 `www.lumeup.cn`
- GitHub 的机制：同一自定义域只能绑定一个 Pages 站点，新绑定会自动把域名从 `github-claw` 移除并抢占
- 新站点 HTTPS 证书未签发（`https_enforced=False`），且该仓库本地存在未跟踪的 `public/CNAME`（内容 `www.lumeup.cn`）——若将来提交部署会再次抢占域名

## 修复动作
1. API PUT `repos/GitDolores/ai-projects-learning/pages` `{"cname":null}` —— 解绑错误站点（该站退回 `gitdolores.github.io/ai-projects-learning`，https_enforced 自动恢复 True）
2. API PUT `repos/GitDolores/github-claw/pages` `{"cname":"www.lumeup.cn"}` —— 域名绑回本仓库
3. 手动 workflow_dispatch 触发 pages.yml 重新部署（run 33148331405，success）以推动证书重新签发
4. 裸域 lumeup.cn 301 → www 正常；HTTP 内容已切回 LumeClaw（`<title>LumeClaw · AI 项目学习库</title>`）

## 遗留事项
- HTTPS 证书（Let's Encrypt）重新签发中，重新绑定域名后最长需 ~1 小时
- 证书就绪后需重新开启 Enforce HTTPS（本次解绑操作把它重置为 False；无证书时 API 返回 "certificate does not exist yet"）
- **必须处理**：`ai-projects-learning/public/CNAME`（未跟踪文件，内容 www.lumeup.cn）需删除或改域名，否则下次部署会再次抢占

## Next steps
- 证书签发后：API PUT `{"https_enforced":true}` 或网页 Settings → Pages → Enforce HTTPS
- 决定 ai-projects-learning 的正式域名（如需上线）
