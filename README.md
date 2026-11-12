# CombineBidsphere Monorepo

Unified repository containing the **Bidsphere (Procure-to-Pay)** system and the **PDM Frontend** application.

---

## Workspace Structure

```
CombineBidsphere/
├── apps/
│   ├── bidsphere/        # Vite + React 19 + TypeScript Procure-to-Pay frontend & serverless API
│   └── pdm/              # Next.js PMO / Product Data Management frontend
├── package.json          # Monorepo root workspace configuration
└── README.md
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Running Applications

- **Bidsphere (Procure-to-Pay)**:
  ```bash
  npm run dev:bidsphere
  # Runs Vite dev server on http://localhost:5175
  ```

- **PDM Frontend**:
  ```bash
  npm run dev:pdm
  # Runs Next.js dev server on http://localhost:3000
  ```

---

## Building

- **Build Bidsphere**:
  ```bash
  npm run build:bidsphere
  ```

- **Build PDM Frontend**:
  ```bash
  npm run build:pdm
  ```

- **Build All Applications**:
  ```bash
  npm run build
  ```
