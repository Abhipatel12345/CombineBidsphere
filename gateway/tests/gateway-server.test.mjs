import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { config } from "../config.mjs";
import { signSession, serializeCookie } from "../auth-service.mjs";

describe("Gateway Server HTTP Integration Suite", () => {
  let serverInstance;
  let testPort;
  let baseUrl;

  before(async () => {
    const { server } = await import("../server.mjs");
    serverInstance = server;

    await new Promise((resolve) => {
      serverInstance.listen(0, "127.0.0.1", () => {
        testPort = serverInstance.address().port;
        baseUrl = `http://127.0.0.1:${testPort}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (serverInstance && serverInstance.listening) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
  });

  // Test 1: GET / serves Unified Login
  it("GET / serves the Unified Login HTML page", async () => {
    const res = await fetch(`${baseUrl}/`, { redirect: "manual" });
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("NETLINK"));
    assert.ok(text.includes("Unified Sign In"));
    assert.ok(text.includes("Sign In to Enterprise"));
  });

  // Test 2: GET /login serves Unified Login
  it("GET /login serves the Unified Login HTML page", async () => {
    const res = await fetch(`${baseUrl}/login`, { redirect: "manual" });
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("Unified Sign In"));
  });

  // Test 3: Unauthorized direct URL access to /bidsphere/dashboard
  it("redirects unauthenticated user accessing /bidsphere/dashboard to /login", async () => {
    const res = await fetch(`${baseUrl}/bidsphere/dashboard`, {
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    assert.equal(res.status, 302);
    const location = res.headers.get("location");
    assert.ok(location.includes("/login"));
    assert.ok(location.includes("app=bidsphere"));
  });

  // Test 4: Unauthorized direct URL access to /project-management/dashboard
  it("redirects unauthenticated user accessing /project-management/dashboard to /login", async () => {
    const res = await fetch(`${baseUrl}/project-management/dashboard`, {
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    assert.equal(res.status, 302);
    const location = res.headers.get("location");
    assert.ok(location.includes("/login"));
    assert.ok(location.includes("app=pdm"));
  });

  // Test 5: Cross-Application Isolation - PDM user cannot access BidSphere
  it("prevents PDM-only user from accessing /bidsphere/dashboard", async () => {
    const pdmToken = signSession({ user: { username: "yash", role: "teammember" } });
    const res = await fetch(`${baseUrl}/bidsphere/dashboard`, {
      redirect: "manual",
      headers: {
        Accept: "text/html",
        Cookie: `pdm_session=${pdmToken}`,
      },
    });
    assert.equal(res.status, 302);
    const location = res.headers.get("location");
    assert.equal(location, "/login?unauthorized=bidsphere");
  });

  // Test 6: Cross-Application Isolation - BidSphere user cannot access PDM
  it("prevents BidSphere-only user from accessing /project-management/dashboard", async () => {
    const bidsphereToken = signSession({ user: { username: "procurement", role: "procurement" } });
    const res = await fetch(`${baseUrl}/project-management/dashboard`, {
      redirect: "manual",
      headers: {
        Accept: "text/html",
        Cookie: `bidsphere_session=${bidsphereToken}`,
      },
    });
    assert.equal(res.status, 302);
    const location = res.headers.get("location");
    assert.equal(location, "/login?unauthorized=pdm");
  });

  // Test 7: Unauthenticated access to /select-application redirects to /login
  it("redirects unauthenticated access to /select-application to /login", async () => {
    const res = await fetch(`${baseUrl}/select-application`, { redirect: "manual" });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/login");
  });

  // Test 8: Authenticated dual-access user can view /select-application
  it("serves /select-application to authenticated dual-instance users", async () => {
    const multiAppToken = signSession({
      user: { fullName: "Administrator", email: "admin@example.com" },
      apps: ["bidsphere", "pdm"],
    });

    const res = await fetch(`${baseUrl}/select-application`, {
      headers: {
        Cookie: `unified_app_choice=${multiAppToken}`,
      },
    });
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("Select Application"));
    assert.ok(text.includes("BidSphere"));
    assert.ok(text.includes("Project Management"));
  });

  // Test 9: Logout clears session cookies and redirects
  it("GET /logout clears all session cookies and redirects to /login", async () => {
    const res = await fetch(`${baseUrl}/logout`, { redirect: "manual" });
    assert.equal(res.status, 302);
    assert.ok(res.headers.get("location").includes("/login?logout=success"));

    const setCookies = res.headers.getSetCookie();
    assert.ok(setCookies.some((c) => c.includes("bidsphere_session=") && c.includes("Max-Age=0")));
    assert.ok(setCookies.some((c) => c.includes("pdm_session=") && c.includes("Max-Age=0")));
  });

  // Test 10: POST /api/unified-auth/login with invalid credentials returns 401
  it("POST /api/unified-auth/login returns 401 on failed authentication", async () => {
    const res = await fetch(`${baseUrl}/api/unified-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usr: "bad_user@netlink.com", pwd: "bad_password" }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.includes("Invalid username or password"));
  });

  // Test 11: Direct access to legacy login URLs must redirect to the Common Login
  it("redirects all legacy BidSphere and PDM login URLs to /login", async () => {
    const legacyPaths = [
      "/bidsphere/login",
      "/bidsphere/warehouse/login",
      "/bidsphere/procurement/login",
      "/bidsphere/department/login",
      "/project-management/login",
    ];

    for (const p of legacyPaths) {
      const res = await fetch(`${baseUrl}${p}`, { redirect: "manual" });
      assert.equal(res.status, 302, `Path ${p} should return 302 redirect`);
      assert.equal(res.headers.get("location"), "/login", `Path ${p} should redirect to /login`);
    }
  });
});

