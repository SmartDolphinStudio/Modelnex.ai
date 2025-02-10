# ModelNex.AI Project Structure

This repository contains the ModelNex.AI static frontend showcase. Keep the tree organized by responsibility, not by migration history.

## Root Directories

- `apps/web/` - ModelNex.AI public static site plus user console visual shell, built with React, TypeScript, Tailwind CSS, CSS, and JavaScript.
- `apps/web/src/features/console/` - React user console modules mounted by the web app.
- `apps/web/src/features/docs/` - Documentation workspace and localized documentation content.
- `apps/web/src/components/` - Reusable UI components shared across pages and features.
- `apps/web/src/lib/` - Utilities and non-UI engines (for example the Bloub bot engine).
- `infrastructure/` - static Nginx deployment assets.
- `docs/` - Product, architecture, implementation, and handoff documentation.
- `legal/` - ModelNex legal text and third-party license/copyright backups.

## Root Files

- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` - workspace metadata, root scripts, and lockfiles.
- `tsconfig.json` - root TypeScript base config.
- `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, `apps/web/package.json` - app build configuration.
- `.env.local` - local secrets and development-only environment values. Never stage or report its contents.

## Artifact Policy

Generated files must never be committed. The Vite build emits to the
repository-root `dist/` directory, which is ignored and disposable. TypeScript
emits `*.tsbuildinfo`, also ignored. Keep local screenshots, deployment
packages, logs, and temporary verification material outside the repository
(or in a transient, ignored local directory) and delete them after use.

## Static-Site Rule

Do not delete third-party copyright or license backups. No product API, gateway, payment, database, or background service is part of this repository or deployment. The public site is served as static files through Nginx.
