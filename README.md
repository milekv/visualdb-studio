# VisualDB Studio

A local-first visual PostgreSQL schema designer.

[Polska wersja](README.pl.md) | [Open the app](https://milekv.github.io/visualdb-studio/)

[![CI](https://github.com/milekv/visualdb-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/milekv/visualdb-studio/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

![VisualDB Studio guided database setup](assets/screenshots/06-guided-setup.png)

VisualDB Studio lets you design tables and relationships on an interactive canvas, review schema quality, and generate PostgreSQL DDL. It needs no account or backend. Projects stay in browser storage.

## Quick start

1. Open the [live app](https://milekv.github.io/visualdb-studio/).
2. Complete the guided setup: project, use case, core data, capabilities, rules, and review.
3. Review the live table and relationship count before creating the schema.
4. Refine columns and relationships, with undo and redo available for local edits.
5. Run validation, review the schema score, and download the generated SQL.

## What it includes

- Interactive React Flow table canvas.
- PostgreSQL columns with PK, FK, UNIQUE, INDEX, NOT NULL, and DEFAULT options.
- Relationships with `ON DELETE` behavior.
- Deterministic relationship suggestions based on column names.
- Checks for missing keys, duplicate names, FK type mismatches, and missing indexes.
- Schema scoring with concrete recommendations.
- A six-step guided setup for commerce, automotive services, SaaS billing, and booking systems.
- Optional payments, inventory, shipping, accounts, attachments, notifications, comments, locations, tags, and audit events.
- Configurable audit timestamps and soft delete columns.
- Undo and redo for schema edits.
- `CREATE TABLE`, constraint, and index generation.
- SQL and project export.
- Automatic project persistence in `localStorage`.

## Real application screenshots

| Guided setup                                            | Schema canvas                                             |
| ------------------------------------------------------- | --------------------------------------------------------- |
| ![Guided setup](assets/screenshots/01-guided-setup.png) | ![Schema canvas](assets/screenshots/02-schema-canvas.png) |

| SQL preview                                           | Schema score                                            |
| ----------------------------------------------------- | ------------------------------------------------------- |
| ![SQL preview](assets/screenshots/03-sql-preview.png) | ![Schema score](assets/screenshots/04-schema-score.png) |

## Local development

Node.js 22 is recommended.

```bash
git clone https://github.com/milekv/visualdb-studio.git
cd visualdb-studio
npm ci
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

```text
src/components   canvas, panels, and editing flows
src/lib          SQL generation, validation, scoring, and suggestions
src/store        Zustand project state and browser persistence
src/types        tables, columns, and relationship model
```

All design logic runs in the browser. The app does not upload schema data.

## Current limits

- SQL generation targets PostgreSQL.
- Guided generation currently covers four reviewed workflow families.
- Suggestions are deterministic heuristics and still require human review.
- The app does not connect directly to a production database.

## License

MIT. See [LICENSE](LICENSE).
