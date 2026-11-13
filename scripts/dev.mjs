import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log(`
=============================================================================
  STARTING UNIFIED BIDSPHERE + PDM DEVELOPMENT ENVIRONMENT
=============================================================================
  1. BidSphere (Vite)            → http://localhost:5173/bidsphere/
  2. Project Management (Next)   → http://localhost:3001/project-management/
  3. Enterprise Gateway (Unified)→ http://localhost:3000/
=============================================================================
`);

const children = [];
let isShuttingDown = false;

function runProcess(name, command, args, cwd) {
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "cmd.exe" : command;
  const cmdArgs = isWindows ? ["/d", "/s", "/c", command, ...args] : args;

  const child = spawn(cmd, cmdArgs, {
    cwd: cwd || rootDir,
    stdio: ["inherit", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  child.stdout.on("data", (data) => {
    const lines = data.toString().trimEnd().split("\n");
    for (const line of lines) {
      console.log(`[${name}] ${line}`);
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().trimEnd().split("\n");
    for (const line of lines) {
      console.error(`[${name}:err] ${line}`);
    }
  });

  child.on("exit", (code, signal) => {
    console.log(`[${name}] exited with code ${code || signal}`);
    if (code !== 0 && !isShuttingDown) {
      console.log(`[${name}] Restarting in 1.5s...`);
      setTimeout(() => {
        if (!isShuttingDown) {
          runProcess(name, command, args, cwd);
        }
      }, 1500);
    }
  });

  children.push(child);
  return child;
}

// 1. Start PDM (Next.js on port 3001)
const pdm = runProcess("PDM", "npm", ["--prefix", "apps/pdm", "run", "dev", "--", "-p", "3001"]);

// 2. Start BidSphere (Vite on port 5173)
const bidsphere = runProcess("BidSphere", "npm", ["--prefix", "apps/bidsphere", "run", "dev", "--", "--port", "5173"]);

// 3. Start Unified Gateway (port 3000) with watch mode
const gateway = runProcess("Gateway", "node", ["--watch", "gateway/server.mjs"]);

function cleanup() {
  isShuttingDown = true;
  console.log("\nShutting down all development services...");
  for (const child of children) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", child.pid, "/f", "/t"]);
      } else {
        child.kill("SIGTERM");
      }
    } catch {
      // Ignore
    }
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

