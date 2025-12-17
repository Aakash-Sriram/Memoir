# tui-app — Ink TUI starter

Minimal starter template for building terminal UIs using Ink (React for CLIs).

Quick start

1. Install dependencies:

```
pnpm install
```

2. Run in development (uses ts-node ESM loader):

```
pnpm run dev
```

3. Build and run the compiled app:

```
pnpm run build
node dist/index.js
```

What this template includes

- A basic `src/app.tsx` Ink application with a menu and input flow.
- `src/index.tsx` — entry that renders the Ink app.
- `tsconfig.json` configured for Node ESM / TypeScript to `dist`.

Notes

- This project expects Node 18+ and a package manager (pnpm/yarn/npm).
- The project uses `ink` v6+ and related helper packages already listed in `package.json`.

Next steps

- Expand screens under `src/screens` and components in `src/components`.
- Add tests, a CLI wrapper, and packaging if you want to distribute the binary.
