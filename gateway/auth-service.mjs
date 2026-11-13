import crypto from "node:crypto";
import { config } from "./config.mjs";

/**
 * Sign a session payload using HMAC-SHA256 (compatible with both BidSphere and PDM).
 */
export function signSession(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const data = { ...payload, iat, exp };
  const payloadB64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", config.sessionSecret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 signed session token.
 * Returns null if tampered, malformed, or expired.
 */
export function verifySession(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  try {
    const expectedSig = crypto
      .createHmac("sha256", config.sessionSecret)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);

    if (!payload || !payload.exp) return null;
    if (Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Parse Cookie header into a key-value object.
 */
export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return cookies;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

/**
 * Serialize a cookie string with standard security attributes.
 */
export function serializeCookie(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);

  if (options.maxAge != null) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }
  if (options.secure || (options.secure === undefined && config.isProd)) {
    parts.push("Secure");
  }
  parts.push(`SameSite=${options.sameSite || "Lax"}`);

  return parts.join("; ");
}

/**
 * Derive Bidsphere AppRole from ERPNext roles.
 */
function deriveBidsphereRole(username, roles) {
  const lowerUser = username.toLowerCase().trim();
  const roleSet = new Set(roles.map((r) => r.trim()));

  if (
    lowerUser === "admin" ||
    lowerUser === "administrator" ||
    lowerUser.includes("admin@") ||
    roleSet.has("System Manager") ||
    roleSet.has("Administrator")
  ) {
    return "admin";
  }
  if (roleSet.has("Procurement Manager")) return "procurement";
  if (roleSet.has("Procurement Team") || roleSet.has("Purchase User")) return "procurement_team";
  if (roleSet.has("Stock Manager") || roleSet.has("Warehouse Manager") || roleSet.has("Stock User")) return "warehouse";
  if (roleSet.has("Engineering Manager")) return "engineering";
  if (roleSet.has("Engineer")) return "engineer";
  if (roleSet.has("Finance Manager") || roleSet.has("Accounts Manager")) return "finance";
  if (roleSet.has("Finance Executive") || roleSet.has("Accounts User")) return "finance_executive";
  if (roleSet.has("Legal Manager") || roleSet.has("Legal Reviewer")) return "legal";
  if (roleSet.has("Quality Manager")) return "quality";
  if (roleSet.has("Program Manager")) return "program_manager";
  if (roleSet.has("Manufacturing Manager") || roleSet.has("Production Manager")) return "manufacturing";
  if (roleSet.has("Department User")) return "department";

  return "staff";
}

/**
 * Derive PDM persona and permissions from ERPNext roles (exact match with apps/pdm).
 */
function derivePdmPersona(username, erpRoles) {
  const normUser = username.toLowerCase().trim();
  const roleSet = new Set(erpRoles.map((r) => r.trim()));

  if (
    normUser === "administrator" ||
    normUser === "admin" ||
    normUser.includes("admin@example.com") ||
    normUser.includes("pdm.admin") ||
    normUser.includes("pmo") ||
    roleSet.has("System Manager") ||
    roleSet.has("Administrator")
  ) {
    return {
      role: "admin",
      roleLabel: "PMO / Administrator",
      permissions: {
        manageUsers: false,
        manageProjects: true,
        manageTasks: true,
        manageDeliverables: true,
        manageTeamMembers: true,
        manageBoardMembers: true,
        manageProjectSettings: true,
        reviewGates: true,
        approveGates: true,
        reviewDesign: true,
        approveDesign: true,
        manageWarehouse: true,
        viewReports: true,
      },
    };
  }

  if (
    normUser.includes("it.admin") ||
    normUser.includes("it_admin") ||
    normUser.includes("itadmin") ||
    roleSet.has("PDM User Administrator") ||
    roleSet.has("User Manager")
  ) {
    return {
      role: "it_admin",
      roleLabel: "IT Admin",
      permissions: {
        manageUsers: true,
        manageProjects: false,
        manageTasks: false,
        manageDeliverables: false,
        manageTeamMembers: false,
        manageBoardMembers: false,
        manageProjectSettings: false,
        reviewGates: false,
        approveGates: false,
        reviewDesign: false,
        approveDesign: false,
        manageWarehouse: false,
        viewReports: true,
      },
    };
  }

  if (
    normUser.includes("reviewer") ||
    normUser.includes("gatereviewer") ||
    normUser.includes("approver") ||
    roleSet.has("Gate Reviewer") ||
    roleSet.has("Quality Manager")
  ) {
    return {
      role: "gate_reviewer",
      roleLabel: "Quality Manager / Gate Board Reviewer",
      permissions: {
        manageUsers: false,
        manageProjects: false,
        manageTasks: false,
        manageDeliverables: false,
        manageTeamMembers: false,
        manageBoardMembers: false,
        manageProjectSettings: false,
        reviewGates: true,
        approveGates: true,
        reviewDesign: true,
        approveDesign: true,
        manageWarehouse: false,
        viewReports: true,
      },
    };
  }

  if (
    normUser.includes("warehouse") ||
    normUser.includes("store") ||
    normUser.includes("stock") ||
    roleSet.has("Stock Manager") ||
    roleSet.has("Stock User")
  ) {
    return {
      role: "warehouse_user",
      roleLabel: "Stock Manager / Warehouse Officer",
      permissions: {
        manageUsers: false,
        manageProjects: false,
        manageTasks: false,
        manageDeliverables: false,
        manageTeamMembers: false,
        manageBoardMembers: false,
        manageProjectSettings: false,
        reviewGates: false,
        approveGates: false,
        reviewDesign: false,
        approveDesign: false,
        manageWarehouse: true,
        viewReports: true,
      },
    };
  }

  if (
    normUser.includes("manager") ||
    normUser.includes("lead") ||
    roleSet.has("Projects Manager")
  ) {
    return {
      role: "projectmanager",
      roleLabel: "Project Manager",
      permissions: {
        manageUsers: false,
        manageProjects: true,
        manageTasks: true,
        manageDeliverables: true,
        manageTeamMembers: false,
        manageBoardMembers: false,
        manageProjectSettings: false,
        reviewGates: true,
        approveGates: false,
        reviewDesign: true,
        approveDesign: false,
        manageWarehouse: true,
        viewReports: true,
      },
    };
  }

  // Default: Team Member
  return {
    role: "teammember",
    roleLabel: "Team Member",
    permissions: {
      manageUsers: false,
      manageProjects: false,
      manageTasks: false,
      manageDeliverables: true,
      manageTeamMembers: false,
      manageBoardMembers: false,
      manageProjectSettings: false,
      reviewGates: false,
      approveGates: false,
      reviewDesign: false,
      approveDesign: false,
      manageWarehouse: false,
      viewReports: false,
    },
  };
}

/**
 * Discard a temporary Frappe session cookie on an ERP server (so no browser collision occurs).
 */
async function discardErpSession(baseUrl, sid) {
  if (!sid) return;
  try {
    await fetch(`${baseUrl}/api/method/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `sid=${sid}`,
      },
      body: "{}",
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Authenticate against BidSphere ERPNext.
 */
async function authenticateBidSphere(usr, pwd) {
  const { erpUrl, apiKey, apiSecret } = config.bidsphere;
  try {
    const res = await fetch(`${erpUrl}/api/method/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ usr, pwd }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    // Extract sid to discard temporary ERP session
    const setCookie = res.headers.get("set-cookie") || "";
    const sidMatch = /sid=([^;]+)/i.exec(setCookie);
    const sid = sidMatch && sidMatch[1] !== "Guest" ? sidMatch[1].trim() : null;
    if (sid) {
      void discardErpSession(erpUrl, sid);
    }

    // Fetch user details from BidSphere ERPNext via master API Key
    let userData = null;
    let erpRoles = [];
    try {
      const uRes = await fetch(`${erpUrl}/api/resource/User/${encodeURIComponent(usr)}`, {
        headers: {
          Authorization: `token ${apiKey}:${apiSecret}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (uRes.ok) {
        const uJson = await uRes.json();
        userData = uJson.data;
        if (Array.isArray(userData?.roles)) {
          erpRoles = userData.roles.map((r) => r.role || r);
        }
      }
    } catch {
      // Non-blocking fallback
    }

    const canonicalName = userData?.name || usr;
    const fullName = userData?.full_name || userData?.name || usr.split("@")[0];
    const email = userData?.email || (usr.includes("@") ? usr : `${usr}@netlink.com`);
    const role = deriveBidsphereRole(canonicalName, erpRoles);

    const userProfile = {
      name: canonicalName,
      email,
      full_name: fullName,
      role,
      department: userData?.department || "Procurement",
      erpnext_roles: erpRoles,
    };

    // Issue internal access token for BidSphere API proxy
    const accessToken = signSession({
      typ: "internal",
      sub: canonicalName,
      email,
      role,
    });

    userProfile.access_token = accessToken;

    return {
      success: true,
      user: userProfile,
      accessToken,
      role,
    };
  } catch (err) {
    console.error("[BidSphere Auth Error]", err.message);
    return { success: false, error: err.message, networkError: true };
  }
}

/**
 * Authenticate against Project Management (PDM) ERPNext.
 */
async function authenticatePdm(usr, pwd) {
  const { erpUrl, apiKey, apiSecret } = config.pdm;
  try {
    let loginId = usr;
    const lower = usr.toLowerCase().trim();
    if (
      lower === "admin" ||
      lower === "administrator" ||
      lower === "admin@pdm.netlink.com" ||
      lower === "admin@example.com"
    ) {
      loginId = "Administrator";
    } else {
      // Look up user in PDM ERPNext by email or username to resolve canonical User record
      try {
        let foundName = null;
        if (usr.includes("@")) {
          const filterStr = JSON.stringify([["email", "=", usr.trim()]]);
          const searchRes = await fetch(
            `${erpUrl}/api/resource/User?filters=${encodeURIComponent(filterStr)}&fields=${encodeURIComponent(JSON.stringify(["name"]))}`,
            {
              headers: {
                Authorization: `token ${apiKey}:${apiSecret}`,
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(4000),
            }
          );
          if (searchRes.ok) {
            const sJson = await searchRes.json();
            if (sJson.data && sJson.data.length > 0 && sJson.data[0].name) {
              foundName = sJson.data[0].name;
            }
          }
        }
        if (!foundName) {
          const filterStr = JSON.stringify([["username", "=", usr.trim()]]);
          const searchRes = await fetch(
            `${erpUrl}/api/resource/User?filters=${encodeURIComponent(filterStr)}&fields=${encodeURIComponent(JSON.stringify(["name"]))}`,
            {
              headers: {
                Authorization: `token ${apiKey}:${apiSecret}`,
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(4000),
            }
          );
          if (searchRes.ok) {
            const sJson = await searchRes.json();
            if (sJson.data && sJson.data.length > 0 && sJson.data[0].name) {
              foundName = sJson.data[0].name;
            }
          }
        }
        if (foundName) {
          loginId = foundName;
        }
      } catch {
        // non-blocking
      }
    }

    let res = await fetch(`${erpUrl}/api/method/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ usr: loginId, pwd }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 401 && loginId !== usr) {
      res = await fetch(`${erpUrl}/api/method/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ usr, pwd }),
        signal: AbortSignal.timeout(8000),
      });
    }

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    // Extract sid to discard temporary ERP session
    const setCookie = res.headers.get("set-cookie") || "";
    const sidMatch = /sid=([^;]+)/i.exec(setCookie);
    const sid = sidMatch && sidMatch[1] !== "Guest" ? sidMatch[1].trim() : null;
    if (sid) {
      void discardErpSession(erpUrl, sid);
    }

    // Query user details from PDM ERPNext via master API Key
    let userData = null;
    let erpRoles = [];
    try {
      const uRes = await fetch(`${erpUrl}/api/resource/User/${encodeURIComponent(loginId)}`, {
        headers: {
          Authorization: `token ${apiKey}:${apiSecret}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (uRes.ok) {
        const uJson = await uRes.json();
        userData = uJson.data;
        if (Array.isArray(userData?.roles)) {
          erpRoles = userData.roles.map((r) => r.role || r);
        }
      }
    } catch {
      // Non-blocking fallback
    }

    const canonicalName = userData?.name || loginId;
    const { role, roleLabel, permissions } = derivePdmPersona(canonicalName, erpRoles);
    const fullName = userData?.full_name || canonicalName.split("@")[0];
    const email = userData?.email || (canonicalName.includes("@") ? canonicalName : `${canonicalName}@pdm.netlink.com`);
    const department = userData?.department || "Engineering";

    const pdmUserSession = {
      username: canonicalName,
      email,
      fullName,
      role,
      roleLabel,
      department,
      functionName: department,
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      permissions,
      roles: erpRoles.length > 0 ? erpRoles : ["Projects User", "Employee"],
    };

    const sessionToken = signSession({ user: pdmUserSession });

    return {
      success: true,
      user: pdmUserSession,
      sessionToken,
      role,
    };
  } catch (err) {
    console.error("[PDM Auth Error]", err.message);
    return { success: false, error: err.message, networkError: true };
  }
}

/**
 * Universal dual-instance authentication pipeline.
 * Evaluates credentials against both BidSphere ERPNext and PDM ERPNext concurrently.
 */
export async function authenticateUnified(username, password, rememberMe = false) {
  const cleanUser = String(username || "").trim();
  const cleanPass = String(password || "");

  if (!cleanUser || !cleanPass) {
    return {
      success: false,
      status: 400,
      message: "Username/email and password are required.",
    };
  }

  // Attempt authentication against both ERPNext instances concurrently
  const [bidsphereRes, pdmRes] = await Promise.all([
    authenticateBidSphere(cleanUser, cleanPass),
    authenticatePdm(cleanUser, cleanPass),
  ]);

  const bidsphereOk = bidsphereRes.success;
  const pdmOk = pdmRes.success;

  const ttl = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;

  // Scenario 3: Credentials match BOTH ERPNext instances
  if (bidsphereOk && pdmOk) {
    const multiAppToken = signSession(
      {
        user: {
          username: cleanUser,
          fullName: bidsphereRes.user.full_name || pdmRes.user.fullName,
          email: bidsphereRes.user.email || pdmRes.user.email,
        },
        apps: ["bidsphere", "procurement", "pdm"],
        bidsphereUser: bidsphereRes.user,
        pdmUser: pdmRes.user,
        procurementUser: pdmRes.user,
      },
      ttl
    );

    const bidsphereSessionToken = signSession({ user: bidsphereRes.user }, ttl);
    const pdmSessionToken = signSession({ user: pdmRes.user }, ttl);

    return {
      success: true,
      targetApp: "both",
      redirectUrl: "/select-application",
      availableApps: ["bidsphere", "procurement", "pdm"],
      multiAppToken,
      bidsphereSessionToken,
      pdmSessionToken,
      procurementSessionToken: pdmSessionToken,
      bidsphereUser: bidsphereRes.user,
      pdmUser: pdmRes.user,
      procurementUser: pdmRes.user,
      message: "Authenticated successfully with both platforms.",
    };
  }

  // Scenario 1: BidSphere User only
  if (bidsphereOk && !pdmOk) {
    const bidsphereSessionToken = signSession({ user: bidsphereRes.user }, ttl);
    return {
      success: true,
      targetApp: "bidsphere",
      app: "bidsphere",
      redirectUrl: "/bidsphere/dashboard",
      availableApps: ["bidsphere"],
      bidsphereSessionToken,
      bidsphereUser: bidsphereRes.user,
      message: "Authenticated with BidSphere ERPNext successfully.",
    };
  }

  // Scenario 2: Project Management / Procurement User only
  if (!bidsphereOk && pdmOk) {
    const pdmSessionToken = signSession({ user: pdmRes.user }, ttl);
    return {
      success: true,
      targetApp: "procurement",
      app: "procurement",
      redirectUrl: "/project-management/dashboard",
      availableApps: ["procurement", "pdm"],
      pdmSessionToken,
      procurementSessionToken: pdmSessionToken,
      pdmUser: pdmRes.user,
      procurementUser: pdmRes.user,
      user: pdmRes.user,
      message: "Authenticated with Project Management ERPNext successfully.",
    };
  }

  // Check for ERPNext connectivity errors before claiming invalid credentials
  if (bidsphereRes.networkError && pdmRes.networkError) {
    return {
      success: false,
      status: 503,
      message: "Unable to connect to ERPNext authentication servers. Please verify network connectivity.",
    };
  }
  if (bidsphereRes.networkError) {
    return {
      success: false,
      status: 503,
      message: "BidSphere ERPNext instance is temporarily unreachable. Please verify connection.",
    };
  }
  if (pdmRes.networkError) {
    return {
      success: false,
      status: 503,
      message: "Project Management ERPNext instance is temporarily unreachable. Please verify connection.",
    };
  }

  // Neither succeeded
  return {
    success: false,
    status: 401,
    message: "Invalid username or password. Please verify your credentials.",
  };
}

