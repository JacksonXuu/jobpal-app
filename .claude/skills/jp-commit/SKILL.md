---
name: jp-commit
description: Git 提交入口，自动运行 tester + quality 检查，全部通过后生成 commit message 弹窗确认并执行 git commit。当用户要提交代码、保存到本地仓库、或输入"提交"时使用此技能。
---

# 安全提交 `/jp-commit`

提交前强制运行 tester 和 quality 检查，全部通过后才允许 commit。

## 触发条件

- 用户输入 `/jp-commit`
- 用户说"提交代码"、"提交到本地"、"commit"、"保存到仓库"

## 执行

调用 `git-commit-check` agent 执行完整的提交前检查流程：

包含：检查标记文件有效期 → 运行 tester+quality → 验证结果 → 生成 commit message → 弹窗确认 → git commit
