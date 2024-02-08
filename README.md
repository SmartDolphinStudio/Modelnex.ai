# ModelNex.AI

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

ModelNex.AI is a React + TypeScript frontend showcase for an AI model platform: the public product site, an AI chat workspace, a local console shell, and the documentation workspace served at `docs.modelnex.ai`.

> [!NOTE]
> This repository is currently a static presentation build. It does not run or connect to a production API, database, billing service, or background worker.

Links

- Website: <https://modelnex.ai>
- Documentation: <https://docs.modelnex.ai>


## Repository Layout

```text
apps/web/                 Public static site and console visual shell
  src/components/         Reusable UI components
  src/features/console/   User console feature module
  src/features/docs/      Documentation workspace and localized content
  src/pages/              Route-level page components
  src/lib/                Utilities and non-UI engines
  src/i18n/               Translation files
infrastructure/nginx/     Static-site Nginx configuration
docs/project/             Project structure, engineering rules, and handoff
legal/                    ModelNex legal files and third-party license backups
```

See `docs/project/PROJECT_STRUCTURE.md` and `docs/project/TECH_STACK_AND_RULES.md` before making structural changes.


## Development

```bash
pnpm install
pnpm dev
pnpm build
```
