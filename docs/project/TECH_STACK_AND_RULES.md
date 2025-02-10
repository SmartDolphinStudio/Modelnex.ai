# ModelNex.AI Technical Stack And Engineering Rules

## Allowed Technology Categories

The project is allowed to use these categories:

1. CSS
2. Tailwind CSS
3. TypeScript
4. JavaScript
5. React
6. NodeJS build tooling

Do not introduce new language categories without an explicit decision. This repository is a static frontend showcase and must not add product backend services.

## Frontend

- Main site and ModelNex user console visual shell: `apps/web`, React + TypeScript + Tailwind CSS + CSS.
- UI behavior must match ModelNex.AI style: clean light mode by default, restrained colors, practical controls, readable tables, and no marketing landing-page treatment inside dashboards.
- The deployed site must not call a product API. API paths return an explicit static-site response and the frontend uses display-only data.

## Static Runtime

- No product API, gateway, payment, database, or background service is deployed.

## Security And Secrets

- Never commit or report API keys, tokens, passwords, signing keys, database passwords, or upstream credentials.
- Secrets belong only in ignored local environment files.
- Do not log tokens. Mask local credentials in screenshots and final reports.
- Keep `.env.local` ignored and unstaged.

## Legal And License Handling

- Preserve third-party license, copyright, CLA, README, and disclaimer backups.
- Third-party Sub2API legal backups live under `legal/third-party/sub2api/`.
- ModelNex-facing legal documents live under `legal/modelnex/`.
- Do not remove LGPL or original copyright notices.

## Deployment

- Docker is not allowed for the active ModelNex deployment path.
- Local VM deployment uses SSH to the Ubuntu VM and Nginx to serve built static files for public domains.
- Build and deployment packages are artifacts, not source. Keep them in local temporary directories and `/tmp` only transiently on the VM.

## Verification Standard

For meaningful completion, do all of the following:

- Run the relevant TypeScript/Vite builds.
- Deploy to the VM when the request includes deployment.
- Verify through a real browser screenshot for UI changes.
- Verify that API paths are disabled and do not proxy to a backend.
