import http from "node:http";
import { config } from "./config.mjs";
import {
  authenticateUnified,
  parseCookies,
  serializeCookie,
  verifySession,
} from "./auth-service.mjs";
import { renderLoginHtml } from "./ui/login-html.mjs";
import { renderSelectAppHtml } from "./ui/select-app-html.mjs";

/**
 * Read request body as parsed JSON or URL-encoded object.
 */
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});

      const contentType = (req.headers["content-type"] || "").toLowerCase();
      if (contentType.includes("application/json")) {
        try {
          return resolve(JSON.parse(raw));
        } catch (e) {
          return reject(e);
        }
      }

      if (contentType.includes("application/x-www-form-urlencoded")) {
        const params = new URLSearchParams(raw);
        const obj = {};
        for (const [k, v] of params.entries()) {
          obj[k] = v;
        }
        return resolve(obj);
      }

      // Default try parse JSON
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ raw });
      }
    });
    req.on("error", reject);
  });
}

/**
 * Stream an HTTP proxy request to an upstream server.
 */
function proxyHttpRequest(targetUrl, req, res) {
  const target = new URL(targetUrl);
  const upstreamPort = Number(target.port || (target.protocol === "https:" ? 443 : 80));

  const headers = {
    ...req.headers,
    host: target.host,
    "x-forwarded-host": req.headers.host || `localhost:${config.port}`,
    "x-forwarded-proto": req.headers["x-forwarded-proto"] || "http",
    "x-forwarded-for": req.socket.remoteAddress || "127.0.0.1",
  };

  const proxyReq = http.request(
    {
      hostname: target.hostname,
      port: upstreamPort,
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      proxyRes.on("error", () => {
        // Handle socket disconnects gracefully
      });
      if (!res.headersSent) {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      }
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Upstream application service is temporarily unavailable.",
          details: err.message,
        })
      );
    }
  });

  req.on("error", () => {
    proxyReq.destroy();
  });

  res.on("error", () => {
    proxyReq.destroy();
  });

  req.pipe(proxyReq, { end: true });
}

/**
 * The Enterprise Unified Gateway HTTP Server
 */
const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${config.port}`;
  const url = new URL(req.url || "/", `http://${host}`);
  const pathname = url.pathname;
  const cookies = parseCookies(req.headers.cookie);

  // Parse active sessions
  const bidsphereSession = verifySession(cookies.bidsphere_session);
  const pdmSession = verifySession(cookies.pdm_session);
  const isBidsphereAuthed = !!bidsphereSession;
  const isPdmAuthed = !!pdmSession;

  // Intercept any direct legacy login paths and redirect to root unified login
  if (
    pathname === "/bidsphere/login" ||
    pathname === "/bidsphere/warehouse/login" ||
    pathname === "/bidsphere/procurement/login" ||
    pathname === "/bidsphere/department/login" ||
    pathname === "/project-management/login"
  ) {
    const search = url.search || "";
    res.writeHead(302, { Location: `/login${search}` });
    res.end();
    return;
  }

  // ---------------------------------------------------------------------------
  // 1. Unified Authentication API Routes
  // ---------------------------------------------------------------------------

  // POST /api/unified-auth/login
  if (pathname === "/api/unified-auth/login") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    try {
      const body = await readRequestBody(req);
      const username = body.usr || body.username || "";
      const password = body.pwd || body.password || "";
      const rememberMe = Boolean(body.rememberMe);

      const authResult = await authenticateUnified(username, password, rememberMe);

      if (!authResult.success) {
        res.writeHead(authResult.status || 401, { "Content-Type": "application/json" });
        res.end(JSON.stringify(authResult));
        return;
      }

      const cookieList = [];
      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;

      if (authResult.bidsphereSessionToken) {
        cookieList.push(
          serializeCookie("bidsphere_session", authResult.bidsphereSessionToken, {
            maxAge,
            httpOnly: true,
            sameSite: "Lax",
          })
        );
      }

      if (authResult.pdmSessionToken) {
        cookieList.push(
          serializeCookie("pdm_session", authResult.pdmSessionToken, {
            maxAge,
            httpOnly: true,
            sameSite: "Lax",
          })
        );
      }

      if (authResult.multiAppToken) {
        cookieList.push(
          serializeCookie("unified_app_choice", authResult.multiAppToken, {
            maxAge,
            httpOnly: true,
            sameSite: "Lax",
          })
        );
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": cookieList,
      });
      res.end(JSON.stringify(authResult));
      return;
    } catch (err) {
      console.error("[Login Handler Error]", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Authentication internal error." }));
      return;
    }
  }

  // GET /api/unified-auth/session
  if (pathname === "/api/unified-auth/session") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        authenticated: isBidsphereAuthed || isPdmAuthed,
        bidsphere: {
          authenticated: isBidsphereAuthed,
          user: bidsphereSession?.user || null,
        },
        pdm: {
          authenticated: isPdmAuthed,
          user: pdmSession?.user || null,
        },
      })
    );
    return;
  }



  // POST /api/unified-auth/logout or GET /logout
  if (
    pathname === "/api/unified-auth/logout" ||
    pathname === "/logout" ||
    pathname === "/bidsphere/logout" ||
    pathname === "/project-management/logout"
  ) {
    const expiredCookies = [
      serializeCookie("bidsphere_session", "", { maxAge: 0 }),
      serializeCookie("pdm_session", "", { maxAge: 0 }),
      serializeCookie("unified_app_choice", "", { maxAge: 0 }),
      serializeCookie("inteva-auth-remember", "", { maxAge: 0 }),
    ];

    if (req.method === "POST" && pathname.startsWith("/api/")) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": expiredCookies,
      });
      res.end(JSON.stringify({ success: true, message: "Signed out successfully." }));
      return;
    }

    res.writeHead(302, {
      Location: "/login?logout=success",
      "Set-Cookie": expiredCookies,
    });
    res.end();
    return;
  }



  // ---------------------------------------------------------------------------
  // 2. Select Application Page (/select-application)
  // ---------------------------------------------------------------------------
  if (pathname === "/select-application") {
    const choiceSession = verifySession(cookies.unified_app_choice);
    const activeUser =
      choiceSession?.user ||
      bidsphereSession?.user ||
      pdmSession?.user ||
      null;

    if (!activeUser && !isBidsphereAuthed && !isPdmAuthed) {
      res.writeHead(302, { Location: "/login" });
      res.end();
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      renderSelectAppHtml({
        user: activeUser || {},
        bidsphereUser: bidsphereSession?.user || {},
        pdmUser: pdmSession?.user || {},
      })
    );
    return;
  }



  // ---------------------------------------------------------------------------
  // 3. Unified Login Page (/ and /login)
  // ---------------------------------------------------------------------------
  if (pathname === "/" || pathname === "/login") {
    // If user is already authenticated on both -> redirect to application selection
    if (isBidsphereAuthed && isPdmAuthed) {
      res.writeHead(302, { Location: "/select-application" });
      res.end();
      return;
    }

    // If user is already authenticated on BidSphere only -> redirect to BidSphere
    if (isBidsphereAuthed && !url.searchParams.has("logout")) {
      res.writeHead(302, { Location: "/bidsphere/dashboard" });
      res.end();
      return;
    }

    // If user is already authenticated on PDM only -> redirect to PDM
    if (isPdmAuthed && !url.searchParams.has("logout")) {
      res.writeHead(302, { Location: "/project-management/dashboard" });
      res.end();
      return;
    }

    // Render Unified Login page
    const unauthorizedParam = url.searchParams.get("unauthorized") || "";
    const errorParam = url.searchParams.get("error") || "";
    const redirectParam = url.searchParams.get("redirect") || "";
    const isExpired = url.searchParams.has("session_expired");
    const isLogout = url.searchParams.has("logout");

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      renderLoginHtml({
        unauthorized: unauthorizedParam,
        error: errorParam,
        redirect: redirectParam,
        session_expired: isExpired,
        logout: isLogout,
      })
    );
    return;
  }



  // ---------------------------------------------------------------------------
  // 4. Project Management Application Routing & Access Control (/project-management/*)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/project-management")) {
    const isPublicStatic =
      pathname.startsWith("/project-management/_next/") ||
      pathname.includes("/favicon.") ||
      pathname.startsWith("/project-management/api/auth/");

    // Check authorization for protected PDM pages/endpoints
    if (!isPublicStatic && !isPdmAuthed) {
      const isHtmlRequest = (req.headers.accept || "").includes("text/html");
      if (isHtmlRequest) {
        // Cross-application protection
        if (isBidsphereAuthed) {
          res.writeHead(302, { Location: "/login?unauthorized=pdm" });
          res.end();
          return;
        }
        res.writeHead(302, {
          Location: `/login?redirect=${encodeURIComponent(req.url)}&app=pdm`,
        });
        res.end();
        return;
      }

      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Unauthorized: Active Project Management session required.",
          code: "UNAUTHORIZED_PDM",
        })
      );
      return;
    }

    // Proxy request to Next.js instance
    proxyHttpRequest(`http://127.0.0.1:${config.pdmPort}`, req, res);
    return;
  }



  // ---------------------------------------------------------------------------
  // 5. BidSphere Application Routing & Access Control (/bidsphere/*)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/bidsphere")) {
    const isPublicAsset =
      pathname.startsWith("/bidsphere/assets/") ||
      pathname.includes("/favicon.") ||
      pathname.startsWith("/bidsphere/supplier/");

    // Check authorization for protected BidSphere pages/endpoints
    if (!isPublicAsset && !isBidsphereAuthed) {
      const isHtmlRequest = (req.headers.accept || "").includes("text/html");
      if (isHtmlRequest) {
        // Cross-application protection
        if (isPdmAuthed) {
          res.writeHead(302, { Location: "/login?unauthorized=bidsphere" });
          res.end();
          return;
        }
        res.writeHead(302, {
          Location: `/login?redirect=${encodeURIComponent(req.url)}&app=bidsphere`,
        });
        res.end();
        return;
      }

      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Unauthorized: Active BidSphere session required.",
          code: "UNAUTHORIZED_BIDSPHERE",
        })
      );
      return;
    }

    // Proxy request to BidSphere instance
    proxyHttpRequest(`http://127.0.0.1:${config.bidspherePort}`, req, res);
    return;
  }



  // ---------------------------------------------------------------------------
  // 6. Generic API / Static Proxying
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    const referer = req.headers.referer || "";
    const isPdmClient = referer.includes("/project-management") || (isPdmAuthed && !isBidsphereAuthed);

    if (isPdmClient) {
      // Forward to PDM with Next.js basePath prefix
      req.url = `/project-management${req.url}`;
      proxyHttpRequest(`http://127.0.0.1:${config.pdmPort}`, req, res);
      return;
    }

    // Forward general ERPNext / proxy calls to BidSphere server
    proxyHttpRequest(`http://127.0.0.1:${config.bidspherePort}`, req, res);
    return;
  }



  // Static files or root fallback
  if (pathname.startsWith("/assets/") || pathname.endsWith(".js") || pathname.endsWith(".css")) {
    proxyHttpRequest(`http://127.0.0.1:${config.bidspherePort}`, req, res);
    return;
  }



  // Fallback: Redirect to Unified Login
  res.writeHead(302, { Location: "/login" });
  res.end();
});

/**
 * Handle WebSocket Upgrade for HMR (Vite & Turbopack)
 */
server.on("upgrade", (req, socket, head) => {
  const url = req.url || "/";
  const isPdm =
    url.startsWith("/project-management") ||
    url.startsWith("/_next") ||
    url.includes("turbopack");

  const targetPort = isPdm ? config.pdmPort : config.bidspherePort;

  const proxyReq = http.request({
    hostname: "127.0.0.1",
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${targetPort}`,
    },
  });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    let headerStr = `HTTP/1.1 101 Switching Protocols\r\n`;
    for (const [k, v] of Object.entries(proxyRes.headers)) {
      if (Array.isArray(v)) {
        for (const val of v) headerStr += `${k}: ${val}\r\n`;
      } else if (v) {
        headerStr += `${k}: ${v}\r\n`;
      }
    }
    headerStr += "\r\n";

    socket.write(headerStr);
    if (proxyHead && proxyHead.length) socket.write(proxyHead);

    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on("error", (err) => {
    socket.destroy();
  });

  proxyReq.end();
});

server.on("clientError", (err, socket) => {
  if (err.code === "ECONNRESET" || !socket.writable) {
    socket.destroy();
    return;
  }
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

export { server };
export default server;

// Start listening if run directly as script
const isMain = process.argv[1] && (process.argv[1].endsWith("server.mjs") || process.argv[1].endsWith("server"));
if (isMain) {
  server.listen(config.port, "0.0.0.0", () => {
    console.log(`
=============================================================================
  NETLINK UNIFIED PLATFORM GATEWAY ONLINE
=============================================================================
  Gateway URL:             http://localhost:${config.port}
  Unified Login:           http://localhost:${config.port}/login
  Application Selector:    http://localhost:${config.port}/select-application

  Proxying:
  - BidSphere (Vite):      http://localhost:${config.port}/bidsphere/* → :${config.bidspherePort}
  - Project Mgmt (Next):   http://localhost:${config.port}/project-management/* → :${config.pdmPort}

  ERPNext Instances:
  - BidSphere ERPNext:     ${config.bidsphere.erpUrl}
  - PDM ERPNext:           ${config.pdm.erpUrl}
=============================================================================
`);
  });
}

