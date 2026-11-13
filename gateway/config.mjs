import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load root .env file if available
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(path.join(rootDir, ".env"));
  }
} catch {
  // Ignore missing .env in production if env vars are passed in process.env
}

export const config = {
  rootDir,
  port: Number(process.env.PORT || 3000),
  pdmPort: Number(process.env.PDM_PORT || 3001),
  bidspherePort: Number(process.env.BIDSPHERE_PORT || 5173),
  isProd: process.env.NODE_ENV === "production",

  // BidSphere ERPNext Configuration
  bidsphere: {
    erpUrl: (
      process.env.BIDSPHERE_ERP_URL ||
      process.env.VITE_BIDSPHERE_ERP_URL ||
      "http://80.225.204.210:8090"
    ).replace(/\/+$/, ""),
    apiKey: process.env.BIDSPHERE_ERP_API_KEY || "d38c611ab48e170",
    apiSecret: process.env.BIDSPHERE_ERP_API_SECRET || "9aac303194dc746",
  },

  // Project Management (PDM) ERPNext Configuration
  pdm: {
    erpUrl: (
      process.env.PDM_ERP_URL ||
      process.env.ERP_URL ||
      process.env.NEXT_PUBLIC_PDM_ERP_URL ||
      process.env.NEXT_PUBLIC_ERP_URL ||
      "http://80.225.204.210:8083"
    ).replace(/\/+$/, ""),
    apiKey:
      process.env.PDM_ERP_API_KEY ||
      process.env.ERP_API_KEY ||
      process.env.NEXT_PUBLIC_API_KEY ||
      "df5d2dc4b819ad2",
    apiSecret:
      process.env.PDM_ERP_API_SECRET ||
      process.env.ERP_API_SECRET ||
      process.env.NEXT_PUBLIC_API_SECRET ||
      "25c592ffee48809",
  },

  // Cryptographic Session Secret
  sessionSecret:
    process.env.SESSION_SECRET ||
    process.env.PDM_ERP_API_SECRET ||
    process.env.BIDSPHERE_ERP_API_SECRET ||
    "bidsphere-pdm-enterprise-unified-session-secret-2026",
};

