# CombineBidsphere Monorepo — Unified Enterprise Platform

Unified enterprise repository containing **BidSphere (Procure-to-Pay)** and **Project Management (PDM)** with an integrated **Enterprise Gateway** and **Unified Login System**.

---

## 1. Architecture Overview

```text
                                  User Enters Credentials
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │   Unified Login Screen    │
                               │        (/ or /login)      │
                               └─────────────┬─────────────┘
                                             │
                   Concurrent Authentication against both ERPNext Instances
                                             │
                 ┌───────────────────────────┴───────────────────────────┐
                 ▼                                                       ▼
   ┌───────────────────────────┐                           ┌───────────────────────────┐
   │    BidSphere ERPNext      │                           │      PDM ERPNext          │
   │  http://80.225.204.210:8090│                           │  http://80.225.204.210:8083│
   └─────────────┬─────────────┘                           └─────────────┬─────────────┘
                 │                                                       │
                 ▼                                                       ▼
   ┌───────────────────────────┐                           ┌───────────────────────────┐
   │    BidSphere Session      │                           │        PDM Session        │
   │      bidsphere_session    │                           │        pdm_session        │
   └─────────────┬─────────────┘                           └─────────────┬─────────────┘
                 │                                                       │
                 ▼                                                       ▼
     BidSphere User Only                     Both Accounts               PDM User Only
                 │                                 │                           │
                 ▼                                 ▼                           ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
   │   /bidsphere/dashboard    │     │    /select-application    │     │/project-management/dash...│
   └───────────────────────────┘     └───────────────────────────┘     └───────────────────────────┘
```

---

## 2. Repository Structure

```text
Bidsphere-main/
├── apps/
│   ├── bidsphere/           # BidSphere (Vite + React 19 SPA, scoped to /bidsphere/*)
│   └── pdm/                 # Project Management (Next.js 16, scoped to /project-management/*)
├── gateway/
│   ├── server.mjs           # Enterprise Unified Gateway & Reverse Proxy
│   ├── auth-service.mjs     # Server-side Dual ERPNext Authentication Engine
│   ├── config.mjs           # Configuration loader
│   ├── ui/
│   │   ├── login-html.mjs   # Enterprise Unified Login Page
│   │   └── select-app-html.mjs # Application Selector for dual-access accounts
│   └── tests/
│       ├── unified-auth.test.mjs  # Auth engine & UI unit tests
│       └── gateway-server.test.mjs# HTTP routing & guard tests
├── scripts/
│   ├── dev.mjs              # Multi-process dev orchestrator
│   └── start.mjs            # Production multi-process launcher
├── package.json
└── tsconfig.json
```

---

## 3. Application Routing

| Route | Handler / Target | Description |
|---|---|---|
| `/` | Gateway | Unified Login screen (or redirect if authenticated) |
| `/login` | Gateway | Unified Login screen |
| `/select-application` | Gateway | Application selection for dual-access users |
| `/api/unified-auth/login` | Gateway | Server-side dual-instance credential verification |
| `/api/unified-auth/session` | Gateway | Active session verification |
| `/api/unified-auth/logout` | Gateway | Clears all sessions and signs out |
| `/bidsphere/*` | `apps/bidsphere` (Vite) | Complete BidSphere Procure-to-Pay application |
| `/project-management/*` | `apps/pdm` (Next.js) | Complete Project Management application |

---

## 4. Environment Variables

Create `.env` at root using `.env.example`:

```env
# BidSphere ERPNext Configuration
BIDSPHERE_ERP_URL=http://80.225.204.210:8090/
BIDSPHERE_ERP_API_KEY=d38c611ab48e170
BIDSPHERE_ERP_API_SECRET=9aac303194dc746
VITE_BIDSPHERE_ERP_URL=http://80.225.204.210:8090/
VITE_BIDSPHERE_COMPANY_NAME=Netlink

# Project Management (PDM) ERPNext Configuration
PDM_ERP_URL=http://80.225.204.210:8083
PDM_ERP_API_KEY=df5d2dc4b819ad2
PDM_ERP_API_SECRET=25c592ffee48809
NEXT_PUBLIC_PDM_ERP_URL=http://80.225.204.210:8083

# Unified Gateway & Cryptographic Secret
SESSION_SECRET=bidsphere-pdm-enterprise-unified-session-secret-2026
PORT=3000
PDM_PORT=3001
BIDSPHERE_PORT=5173
```

---

## 5. Development & Running

### Run the Complete Unified System (Recommended)

```bash
npm run dev
```

Spawns:
- BidSphere (Vite) on port `5173`
- Project Management (Next.js) on port `3001`
- Unified Gateway on port `3000`

Open **http://localhost:3000/** in your browser.

### Run Applications Individually

```bash
npm run dev:bidsphere     # Runs BidSphere standalone
npm run dev:pdm           # Runs PDM standalone
npm run gateway           # Runs Gateway standalone
```

---

## 6. Testing & Validation

```bash
# Run Gateway & Unified Auth Unit Tests
npm run test:gateway

# Run BidSphere Tests
npm run test:bidsphere

# Run Full Monorepo Tests
npm run test
```

---

## 7. Production Deployment & Build

```bash
# Build all workspaces
npm run build

# Start production unified server
npm run start
```
