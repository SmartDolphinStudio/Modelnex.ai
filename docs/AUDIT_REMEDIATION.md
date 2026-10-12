# Audit remediation record

Original audit: 2026-10-12. This record maps the original finding IDs to changes in the new maintenance baseline. Historical facts retain their provenance limitations; code changes do not retrospectively authenticate old dates or commit titles.

## Repository policy

The maintained branch uses the `Verify` CI check. Branch policy requires PRs, zero additional approvals for the single maintainer, resolved conversations and a current passing CI check, and rejects force pushes/deletion. Remote enforcement and exact new commit/CI IDs are verified after the audit push and recorded in the delivered cross-repository report. Security scan language scope is in `docs/SECURITY_SCAN_SCOPE.md`.

## GIT-001 — 六个默认分支均无保护规则或仓库 ruleset

Original evidence: GitHub branches API 对六个默认分支返回 protected=false；rulesets API 均返回空数组。分支保护 API 的 404 与这两个成功响应交叉印证。

Changes: Remote branch rules described above are enabled after the successful audit CI run.

Source references: workflow/configuration and history documents.

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## GIT-002 — 远端没有验证项目代码的自定义 CI 工作流

Original evidence: 六个默认分支均没有已跟踪的 .github/workflows 文件。DolphinPort Actions 中的动态 Dependabot Updates 不构成 Flutter/Rust/Android 构建验证；其余仓库 workflows 列表为空。DolphinPort 本地有被忽略的工作流，详见 DP-GIT-002。

Changes: 六仓库提交固定action SHA/Node/npm/pnpm/Go/Rust/Flutter/Foundry版本的可运行CI; CI包含构建、安全回归、官方依赖审计和Android APK原生payload检查

Source references: workflow/configuration and history documents.

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## GIT-003 — 安全告警 API 存在权限或功能缺口，不能以“无告警”判定安全

Original evidence: 六个仓库 Dependabot alerts 查询均失败，响应包含功能未启用和权限要求；多个 code-scanning/secret-scanning 查询返回 403/404。evm-patterns、MiniEVM 的 secret-scanning 查询成功且返回空列表，code-scanning 返回 no analysis found。逐接口状态在各项目远端表中完整列出。

Changes: 使用各仓库实际owner凭据消除安全告警读取权限缺口，启用Dependabot/secret scanning/push protection; 提交固定SHA CodeQL Actions/JS/Go/Rust扫描，明确Solidity/Dart不在CodeQL覆盖范围，区分404未配置与200无告警

Source references: workflow/configuration and history documents.

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## DEP-ENV-001 — 默认 npm 镜像不支持本次 audit 接口

Original evidence: 初次 npm audit 使用本机 registry.npmmirror.com，返回 404 Not Found / NOT_IMPLEMENTED。切换官方 registry.npmjs.org 后得到实际漏洞结果。该配置属于本机环境，不是六个项目均写入了此设置。

Changes: npm用户默认registry改官方npmjs，六仓库提交.npmrc并由CI显式审计; 移除冲突用户级GOROOT，默认go1.25.12与机器GOROOT一致；服务CI和本地验证显式使用Go1.26.5

Source references: workflow/configuration and history documents.

Validation: 默认go version/ go env GOROOT一致; npm config get registry=https://registry.npmjs.org/

## ENV-GO-001 — 默认 Go 可执行文件与 GOROOT 不匹配

Original evidence: 默认 go 是 1.25.12，但本机 GOROOT 指向 1.26.5，导致标准库 compile: version mismatch。改用 1.25.12 的目录后又出现标准库源码缺失。使用 C:\Dev\Go\1.26.5\bin\go.exe 并匹配 GOROOT 后，HerbTable API 和 UI captcha 后端 go vet 成功，HerbTable captcha 的未使用 import 被明确检出。

Changes: npm用户默认registry改官方npmjs，六仓库提交.npmrc并由CI显式审计; 移除冲突用户级GOROOT，默认go1.25.12与机器GOROOT一致；服务CI和本地验证显式使用Go1.26.5

Source references: workflow/configuration and history documents.

Validation: 默认go version/ go env GOROOT一致; npm config get registry=https://registry.npmjs.org/

## MODEL-GIT-001 — 2023 年 package.json 引用 2026 年发布版本，HEAD 时间也在快照之后

Original evidence: 官方 npm 时间交叉核对得到26条历史版本矛盾：8ef9e6f1b771144d9f29bea32f46a0791cfee106 日期2023-01-05，已要求 katex ^0.18.5（2026-08-31）、mermaid ^11.17.2（2026-08-25）等。HEAD committer time 为2026-10-12 10:30 UTC，晚于采集时刻。

Changes: 逐仓库提交历史可信边界/维护与发布基线文档，不改写或美化旧时间戳; Dolphin master唯一维护分支、旧main只读与新tag来源检查；EVM悬空commit建立本地保留ref; 疑点原因仍未知，不伪造迁移说明；未来开发事实以修复commit/CI/产物校验为据

Source references: workflow/configuration and history documents.

Validation: original Git object/metadata evidence is preserved; see HISTORY_PROVENANCE.md.

## MODEL-GIT-002 — 唯一 pnpm-lock.yaml 未跟踪

Original evidence: 本地 pnpm-lock.yaml 存在但 git status 为 untracked，远端树没有它；大量 dependencies 使用 ^ 范围。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `package.json`, `pnpm-lock.yaml`

Validation: original Git object/metadata evidence is preserved; see HISTORY_PROVENANCE.md.

## MODEL-DOC-001 — README 两次宣称已归档，但 GitHub archived=false 且有后续提交

Original evidence: README 重复“Archived Dec 1, 2025 / no longer maintained”说明，GitHub repo archived=false，历史存在2026年提交。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `README.md`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-001 — 邮箱和密码过滤会静默删除合法字符

Original evidence: filterEmailInput 只保留 A-Za-z0-9.@；filterPasswordInput 只保留 A-Za-z0-9@.。邮箱 + _ - 等合法字符、密码符号和 Unicode 会被输入时删除。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/LoginPage.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-002 — 链地址和钱包连接方式不匹配，多个地址格式无效

Original evidence: Ethereum 示例地址只有32个hex字符；Arbitrum/Base/Polygon等含非hex字符。Bitcoin/Solana 选项仍统一调用 window.ethereum.eth_requestAccounts，不验证 chainId。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/PaymentPage.tsx`, `apps/web/src/pages/PaymentPage.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-003 — 付款签名标为 HMAC-SHA256/Rust，实际只是浏览器 mockHash

Original evidence: createPreviewIntent 的 signature/canonicalHash/nonce 等由32位整数 mockHash 扩展输出；guardEngine 却标 rust-payment-core/hmac-sha256/v1-preview，没有 Rust 后端或 HMAC 密钥。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/PaymentPage.tsx`, `apps/web/src/pages/PaymentPage.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-004 — 支付成功文案声称写入 Credit，但没有更新账户余额

Original evidence: confirmPayment 只延时360ms、将 intent.status 改 paid、清锁和显示成功；未调用充值接口或本地账本更新。成功页却写“Credit已写入账户”，console 仍是 STATIC_SHOWCASE 数据。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/PaymentPage.tsx`, `apps/web/src/pages/PaymentPage.tsx`, `apps/web/src/features/console/store.ts`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-005 — 恢复付款锁只恢复 intent，金额/币种/方式状态另行初始化

Original evidence: readLockedOrder 恢复 intent 和 expiresAt；selectedTier/apiAmount/tab/currency/chainId 等仍按初始路由或默认值初始化，refreshIntentPayload 又基于当前 UI 状态重算 payload。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/PaymentPage.tsx`, `apps/web/src/pages/PaymentPage.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-006 — 聊天记录没有按用户隔离，退出不清除记录

Original evidence: 聊天和使用量使用固定 localStorage key，logout 仅移除 logged-in/username/user-id/session-token，保留聊天数据。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/ChatPage.tsx`, `apps/web/src/pages/ChatPage.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-007 — 聊天 localStorage 只做浅校验且写入无异常处理

Original evidence: 读取只核验 session id 和 messages 数组，未验证每条 message role/content；写入 JSON 没有捕获 quota/security 错误，也未限制历史容量。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/src/pages/ChatPage.tsx`, `apps/web/src/pages/ChatPage.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-008 — Vite 放行的 docs/log 域名与 App/Nginx 判定不同

Original evidence: Vite allowedHosts 包含 doc.localhost.com 和 logs.localhost.com；App 文档域名判定是 docs.modelnex.ai，log 域名也存在单复数/本地域名差异。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `apps/web/vite.config.ts`, `apps/web/src/App.tsx`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.

## MODEL-009 — 认证、API Key、用量和付款主要为静态展示

Original evidence: README 明确 static showcase；RequireAuth 使用浏览器 localStorage 标志，STATIC_SHOWCASE=true 下 console 返回模拟数据，快速登录和支付不构成真实身份/资金处理。

Changes: 保留登录输入；收款地址和钱包改明确无交易能力演示，移除伪HMAC/Rust和到账宣称; 完整按账号保存checkout snapshot；金额/币种/付款方式变化创建新订单ID; 聊天账号隔离、退出清理、深schema/容量检查和存储错误提示; 统一host映射及nginx，更新维护状态和demo界面；锁文件纳入提交

Source references: `README.md`, `apps/web/src/App.tsx`, `apps/web/src/features/console/store.ts`

Validation: applicable local builds/regression checks completed before committing; the committed Audit CI reproduces the build and tests on GitHub. Exact results are in the cross-repository delivery report.
