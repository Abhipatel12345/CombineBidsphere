import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const pdmNextDir = path.join(rootDir, "apps", "pdm", ".next");
const rootNextDir = path.join(rootDir, ".next");
const pdmPublicDir = path.join(rootDir, "apps", "pdm", "public");
const rootPublicDir = path.join(rootDir, "public");

// Ensure .next is present at root for Vercel root-level deployments
if (fs.existsSync(pdmNextDir)) {
  console.log(`[build] Copying Next.js output from apps/pdm/.next to root .next...`);
  try {
    fs.cpSync(pdmNextDir, rootNextDir, { recursive: true, force: true });
    console.log(`[build] Successfully copied .next to root.`);
  } catch (err) {
    console.warn(`[build] Warning: failed to copy .next to root:`, err.message);
  }
} else {
  console.warn(`[build] Notice: apps/pdm/.next was not found. If this is a standalone app build, this is expected.`);
}

// Copy public assets if root does not already have them
if (fs.existsSync(pdmPublicDir) && !fs.existsSync(rootPublicDir)) {
  console.log(`[build] Copying public directory from apps/pdm/public to root public...`);
  try {
    fs.cpSync(pdmPublicDir, rootPublicDir, { recursive: true });
    console.log(`[build] Successfully copied public directory to root.`);
  } catch (err) {
    console.warn(`[build] Warning: failed to copy public to root:`, err.message);
  }
}

