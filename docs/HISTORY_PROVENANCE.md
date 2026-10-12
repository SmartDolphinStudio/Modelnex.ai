# History provenance and verifiable maintenance baseline

Audit baseline before remediation: `740cf9074cc24812991f725cae58b8b9b115114c`. Audit date: 2026-10-12. Maintained branch: `master`.

Git author/committer dates are user-controlled metadata. They do not independently establish when a project was written or first published. Original commits, tags and parent relationships are preserved. The cause of the discrepancies below is unknown; this document does not invent a migration explanation or attribute intent.

## MODEL-GIT-001 — 2023 年 package.json 引用 2026 年发布版本，HEAD 时间也在快照之后

官方 npm 时间交叉核对得到26条历史版本矛盾：8ef9e6f1b771144d9f29bea32f46a0791cfee106 日期2023-01-05，已要求 katex ^0.18.5（2026-08-31）、mermaid ^11.17.2（2026-08-25）等。HEAD committer time 为2026-10-12 10:30 UTC，晚于采集时刻。

Disposition: current-source errors are fixed in the new audit commit; earlier history is kept as evidence. Dates and titles in these commits must not be quoted as verified development/release events. Future releases identify their exact source commit, tested toolchain and CI run.

## MODEL-GIT-002 — 唯一 pnpm-lock.yaml 未跟踪

本地 pnpm-lock.yaml 存在但 git status 为 untracked，远端树没有它；大量 dependencies 使用 ^ 范围。

Disposition: current-source errors are fixed in the new audit commit; earlier history is kept as evidence. Dates and titles in these commits must not be quoted as verified development/release events. Future releases identify their exact source commit, tested toolchain and CI run.
