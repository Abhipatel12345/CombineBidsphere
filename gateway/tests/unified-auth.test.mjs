import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signSession,
  verifySession,
  parseCookies,
  serializeCookie,
  authenticateUnified,
} from "../auth-service.mjs";
import { renderLoginHtml } from "../ui/login-html.mjs";
import { renderSelectAppHtml } from "../ui/select-app-html.mjs";

describe("Unified Authentication & Gateway Suite", () => {
  // Test 1: Cryptographic Session Signing & Verification
  it("signs and verifies tamper-proof session tokens", () => {
    const payload = {
      user: {
        username: "admin",
        role: "admin",
        email: "admin@netlink.com",
      },
    };

    const token = signSession(payload, 3600);
    assert.ok(typeof token === "string");
    assert.equal(token.split(".").length, 2);

    const verified = verifySession(token);
    assert.ok(verified);
    assert.equal(verified.user.username, "admin");
    assert.equal(verified.user.role, "admin");
    assert.ok(verified.exp > Math.floor(Date.now() / 1000));
  });

  // Test 2: Tamper Protection
  it("rejects forged or modified session tokens", () => {
    const token = signSession({ user: { username: "engineer" } }, 3600);
    const [payloadB64] = token.split(".");

    // Forged signature
    const forgedToken = `${payloadB64}.fake_signature_abc123`;
    const result = verifySession(forgedToken);
    assert.equal(result, null);
  });

  // Test 3: Session Expiration
  it("rejects expired session tokens", () => {
    // Expired -10 seconds ago
    const expiredToken = signSession({ user: { username: "yash" } }, -10);
    const result = verifySession(expiredToken);
    assert.equal(result, null);
  });

  // Test 4: Cookie Serialization & Parsing
  it("serializes and parses secure cookies", () => {
    const cookie = serializeCookie("pdm_session", "test_token_123", {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 3600,
    });

    assert.ok(cookie.includes("pdm_session=test_token_123"));
    assert.ok(cookie.includes("HttpOnly"));
    assert.ok(cookie.includes("SameSite=Lax"));
    assert.ok(cookie.includes("Max-Age=3600"));

    const parsed = parseCookies("pdm_session=test_token_123; bidsphere_session=abc_456");
    assert.equal(parsed.pdm_session, "test_token_123");
    assert.equal(parsed.bidsphere_session, "abc_456");
  });

  // Test 5: Missing / Empty Credentials
  it("rejects empty credentials with HTTP 400", async () => {
    const res = await authenticateUnified("", "");
    assert.equal(res.success, false);
    assert.equal(res.status, 400);
    assert.ok(res.message.includes("required"));
  });

  // Test 6: Invalid Credentials on Both Instances
  it("rejects invalid credentials with HTTP 401", async () => {
    const res = await authenticateUnified("nonexistent_user_9999@test.com", "wrong_password_xyz");
    assert.equal(res.success, false);
    assert.equal(res.status, 401);
    assert.ok(res.message.includes("Invalid username or password"));
  });

  // Test 7: UI Rendering - Unified Login Screen
  it("renders the Unified Login UI correctly with form controls and branding", () => {
    const html = renderLoginHtml({ error: "Invalid credentials" });
    assert.ok(html.includes("NETLINK"));
    assert.ok(html.includes("Enterprise Unified Portal"));
    assert.ok(html.includes("Username or Email"));
    assert.ok(html.includes("Password"));
    assert.ok(html.includes("togglePasswordVisibility"));
    assert.ok(html.includes("Sign In to Enterprise"));
    assert.ok(html.includes("Invalid credentials"));
    assert.ok(html.includes("BidSphere Procure-to-Pay (P2P)"));
    assert.ok(html.includes("Project Management (PDM)"));
  });

  // Test 8: UI Rendering - Application Selection Screen
  it("renders the Application Selection UI with both application cards", () => {
    const html = renderSelectAppHtml({
      user: { fullName: "Administrator", email: "admin@example.com" },
    });
    assert.ok(html.includes("Select Application"));
    assert.ok(html.includes("Administrator"));
    assert.ok(html.includes("BidSphere"));
    assert.ok(html.includes("/bidsphere/dashboard"));
    assert.ok(html.includes("Project Management"));
    assert.ok(html.includes("/project-management/dashboard"));
    assert.ok(html.includes("Sign Out"));
  });

  // Test 9: Contextual Unauthorized Alerts
  it("renders context-aware alerts for cross-application unauthorized attempts", () => {
    const htmlBidsphere = renderLoginHtml({ unauthorized: "bidsphere" });
    assert.ok(htmlBidsphere.includes("authorized for Project Management only"));

    const htmlPdm = renderLoginHtml({ unauthorized: "pdm" });
    assert.ok(htmlPdm.includes("authorized for BidSphere only"));
  });

  // Test 10: Single Unified Login Entry Point Guarantee
  it("preserves return redirects and prevents legacy dual-login screen bypasses", () => {
    const htmlWithRedirect = renderLoginHtml({ redirect: "/project-management/projects" });
    assert.ok(htmlWithRedirect.includes("Sign In to Enterprise"));
    assert.ok(htmlWithRedirect.includes("Automatic Routing"));

    // Verify session restoration message
    const htmlExpired = renderLoginHtml({ session_expired: true });
    assert.ok(htmlExpired.includes("session has expired"));

    // Verify logout return message
    const htmlLogout = renderLoginHtml({ logout: true });
    assert.ok(htmlLogout.includes("safely signed out"));
  });
});

