/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BIDSPHERE_DEMO_MFA?: string;
  readonly BIDSPHERE_DEMO_MFA?: string;
  readonly VITE_BIDSPHERE_COMPANY_NAME?: string;
  readonly BIDSPHERE_COMPANY_NAME?: string;
  readonly VITE_BIDSPHERE_ERP_URL?: string;
  readonly BIDSPHERE_ERP_URL?: string;
  /**
   * Public origin for QR / verification links (no trailing slash).
   * Prefer opening the app via a LAN/public host; otherwise set this
   * so phones do not receive localhost URLs.
   */
  readonly VITE_BIDSPHERE_PUBLIC_URL?: string;
  /** TEMPORARY LEGACY MODE — PIN profile access. Remove after Account Login migration. */
  readonly VITE_BIDSPHERE_ENABLE_LEGACY_PIN_PROFILE?: string;
  readonly BIDSPHERE_ENABLE_LEGACY_PIN_PROFILE?: string;
  readonly VITE_BIDSPHERE_ANTHROPIC_MODEL?: string;
  readonly BIDSPHERE_ANTHROPIC_MODEL?: string;
  readonly BIDSPHERE_APP_ENV?: string;
  /** Optional URL for client error reporting from ErrorBoundary. */
  readonly VITE_ERROR_REPORTING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  const __DEMO_MFA_ENABLED__: boolean;
  const __DEMO_MFA_OTP__: string;
}

export {};

import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoPrint: (options?: { variant?: string }) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}
