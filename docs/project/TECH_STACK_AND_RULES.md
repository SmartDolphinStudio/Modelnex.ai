# ModelNex.AI Technical Stack And Engineering Rules

Allowed Technology Categories

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
