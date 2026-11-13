export function renderLoginHtml(options = {}) {
  const { error = "", message = "", redirect = "", unauthorized = "" } = options;

  let alertMessage = error || message;
  let alertType = error ? "error" : "info";

  if (unauthorized === "bidsphere") {
    alertMessage = "Your account is authorized for Project Management only. To access BidSphere, please sign in with an authorized BidSphere account.";
    alertType = "error";
  } else if (unauthorized === "pdm") {
    alertMessage = "Your account is authorized for BidSphere only. To access Project Management, please sign in with an authorized Project Management account.";
    alertType = "error";
  } else if (options.session_expired) {
    alertMessage = "Your session has expired. Please sign in again to continue.";
    alertType = "info";
  } else if (options.logout) {
    alertMessage = "You have been safely signed out.";
    alertType = "success";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In — Netlink Enterprise Portal</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      min-height: 100vh;
      background-color: #030712;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    body {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }
    /* Ambient backdrop glow */
    .ambient-glow-1 {
      position: fixed;
      top: -120px;
      left: -120px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0) 70%);
      pointer-events: none;
      z-index: 0;
    }
    .ambient-glow-2 {
      position: fixed;
      bottom: -120px;
      right: -120px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 70%);
      pointer-events: none;
      z-index: 0;
    }
    /* Header */
    .header {
      position: relative;
      z-index: 10;
      width: 100%;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(31, 41, 55, 0.8);
      background-color: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(12px);
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .brand-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
      color: #ffffff;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #ffffff;
      line-height: 1.2;
    }
    .brand-subtitle {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #60a5fa;
      display: block;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background-color: #111827;
      border: 1px solid #1f2937;
      font-size: 0.75rem;
      color: #9ca3af;
      font-weight: 500;
    }
    .status-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
    }
    /* Main Content */
    .main-wrap {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card-wrap {
      width: 100%;
      max-width: 440px;
    }
    .card {
      background-color: rgba(17, 24, 39, 0.92);
      border: 1px solid rgba(55, 65, 81, 0.6);
      border-radius: 1.25rem;
      padding: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(37, 99, 235, 0.15);
      backdrop-filter: blur(16px);
    }
    .card-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .badge-unified {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background-color: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(37, 99, 235, 0.25);
      color: #60a5fa;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }
    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }
    .card-desc {
      font-size: 0.875rem;
      color: #9ca3af;
    }
    /* Alert Notification */
    .alert {
      margin-bottom: 1.25rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      border: 1px solid transparent;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      line-height: 1.4;
    }
    .alert.hidden {
      display: none !important;
    }
    .alert-error {
      background-color: rgba(225, 29, 72, 0.12);
      border-color: rgba(225, 29, 72, 0.35);
      color: #fda4af;
    }
    .alert-success {
      background-color: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
    }
    .alert-info {
      background-color: rgba(37, 99, 235, 0.12);
      border-color: rgba(37, 99, 235, 0.35);
      color: #93c5fd;
    }
    /* Form */
    .form-group {
      margin-bottom: 1rem;
    }
    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #d1d5db;
      margin-bottom: 0.375rem;
    }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .form-input {
      width: 100%;
      padding: 0.6875rem 1rem 0.6875rem 2.625rem;
      border-radius: 0.75rem;
      background-color: rgba(3, 7, 18, 0.7);
      border: 1px solid #374151;
      color: #ffffff;
      font-size: 0.9375rem;
      outline: none;
      transition: all 0.15s ease-in-out;
    }
    .form-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }
    .form-input::placeholder {
      color: #4b5563;
    }
    .toggle-pwd {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.25rem;
      transition: color 0.15s;
    }
    .toggle-pwd:hover {
      color: #ffffff;
    }
    .checkbox-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.8125rem;
      color: #d1d5db;
      user-select: none;
    }
    .form-checkbox {
      width: 1rem;
      height: 1rem;
      accent-color: #2563eb;
      cursor: pointer;
      border-radius: 0.25rem;
    }
    /* Submit Button */
    .btn-submit {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      border: none;
      color: #ffffff;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8, #4338ca);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
      transform: translateY(-1px);
    }
    .btn-submit:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    /* Card Footer Info */
    .card-footer {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(55, 65, 81, 0.6);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: #9ca3af;
      line-height: 1.4;
    }
    .info-icon {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.5rem;
      background-color: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(37, 99, 235, 0.25);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    /* Application Badges */
    .app-badges {
      margin-top: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    .app-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background-color: #111827;
      border: 1px solid #1f2937;
    }
    .dot-bidsphere {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: #3b82f6;
    }
    .dot-pdm {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: #818cf8;
    }
    /* Footer */
    .footer {
      position: relative;
      z-index: 10;
      width: 100%;
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(31, 41, 55, 0.8);
      background-color: rgba(3, 7, 18, 0.85);
      font-size: 0.75rem;
      color: #6b7280;
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    @media (min-width: 640px) {
      .footer-inner {
        flex-direction: row;
      }
    }
  </style>
</head>
<body>
  <!-- Ambient background lighting -->
  <div class="ambient-glow-1"></div>
  <div class="ambient-glow-2"></div>

  <!-- Header -->
  <header class="header">
    <div class="header-inner">
      <div class="brand-wrap">
        <div class="brand-icon">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <span class="brand-title">NETLINK</span>
          <span class="brand-subtitle">Enterprise Unified Portal</span>
        </div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        <span>Dual ERPNext Gateway Online</span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-wrap">
    <div class="card-wrap">
      <!-- Card Container -->
      <div class="card">
        
        <!-- Header Text -->
        <div class="card-header">
          <div class="badge-unified">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Unified Sign In
          </div>
          <h1 class="card-title">Welcome back</h1>
          <p class="card-desc">Enter your ERPNext credentials to continue</p>
        </div>

        <!-- Alert Notification Box -->
        <div id="alertBox" class="alert ${alertMessage ? (alertType === 'error' ? 'alert-error' : alertType === 'success' ? 'alert-success' : 'alert-info') : 'hidden'}">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="flex-shrink:0; margin-top:1px;">
            ${alertType === 'error'
              ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'
              : alertType === 'success'
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            }
          </svg>
          <span id="alertMessage" style="flex:1;">${alertMessage}</span>
        </div>

        <!-- Login Form -->
        <form id="loginForm" onsubmit="handleLogin(event)">
          <!-- Username / Email Input -->
          <div class="form-group">
            <label for="username" class="form-label">Username or Email</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="username"
                name="username"
                type="text"
                required
                autocomplete="username"
                placeholder="username or email@company.com"
                class="form-input"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••••••"
                class="form-input"
                style="padding-right: 2.75rem;"
              />
              <button
                type="button"
                id="togglePassword"
                onclick="togglePasswordVisibility()"
                tabindex="-1"
                class="toggle-pwd"
                aria-label="Toggle password visibility"
              >
                <!-- Eye Icon (Hidden by default) -->
                <svg id="eyeIcon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="display:none;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye-Off Icon (Visible by default) -->
                <svg id="eyeOffIcon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="checkbox-wrap">
            <label class="checkbox-label">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                class="form-checkbox"
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            id="submitButton"
            class="btn-submit"
          >
            <span id="buttonText">Sign In to Enterprise</span>
            <!-- Spinner Icon (hidden by default) -->
            <svg id="buttonSpinner" class="spinner" width="18" height="18" fill="none" viewBox="0 0 24 24" style="display:none;">
              <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <!-- Information footer note -->
        <div class="card-footer">
          <div class="info-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p>
            <strong style="color: #e5e7eb;">Automatic Routing:</strong> Your credentials automatically authenticate against your ERPNext instance and navigate to your authorized application.
          </p>
        </div>

      </div>

      <!-- Application Badges -->
      <div class="app-badges">
        <span class="app-pill">
          <span class="dot-bidsphere"></span>
          BidSphere Procure-to-Pay (P2P)
        </span>
        <span class="app-pill">
          <span class="dot-pdm"></span>
          Project Management (PDM)
        </span>
      </div>

    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-inner">
      <p>© 2026 Netlink Software Group. All rights reserved.</p>
      <p>Enterprise Dual-Instance Architecture • Secure Unified Gateway</p>
    </div>
  </footer>

  <script>
    function togglePasswordVisibility() {
      const passwordInput = document.getElementById('password');
      const eyeIcon = document.getElementById('eyeIcon');
      const eyeOffIcon = document.getElementById('eyeOffIcon');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      } else {
        passwordInput.type = 'password';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      }
    }

    function showAlert(text, type) {
      if (!type) type = 'error';
      const alertBox = document.getElementById('alertBox');
      const alertMsg = document.getElementById('alertMessage');
      alertMsg.textContent = text;

      alertBox.className = 'alert ' + (
        type === 'error'
          ? 'alert-error'
          : type === 'success'
          ? 'alert-success'
          : 'alert-info'
      );
    }

    async function handleLogin(event) {
      event.preventDefault();
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const rememberMeInput = document.getElementById('rememberMe');
      const submitBtn = document.getElementById('submitButton');
      const btnText = document.getElementById('buttonText');
      const spinner = document.getElementById('buttonSpinner');

      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      const rememberMe = rememberMeInput.checked;

      if (!username || !password) {
        showAlert('Please enter both username and password.');
        return;
      }

      // Enter loading state
      submitBtn.disabled = true;
      btnText.textContent = 'Verifying credentials…';
      spinner.style.display = 'inline-block';

      try {
        const response = await fetch('/api/unified-auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            usr: username,
            pwd: password,
            rememberMe: rememberMe
          })
        });

        const data = await response.json().catch(function() { return {}; });

        if (!response.ok || !data.success) {
          showAlert(data.message || 'Invalid username or password. Please verify your credentials.');
          submitBtn.disabled = false;
          btnText.textContent = 'Sign In to Enterprise';
          spinner.style.display = 'none';
          return;
        }

        // Authentication succeeded!
        btnText.textContent = 'Routing to authorized platform…';

        // 1. If BidSphere user: persist client session state with valid sessionProof
        if (data.bidsphereUser) {
          try {
            const user = data.bidsphereUser;
            const now = Date.now();
            const proof = {
              version: 2,
              userId: user.name,
              issuedAt: now,
              expiresAt: now + (rememberMe ? 7 * 24 * 3600 * 1000 : 12 * 3600 * 1000),
              nonce: 'proof_' + Math.random().toString(36).substring(2)
            };

            const storePayload = {
              state: {
                user: user,
                isAuthenticated: true,
                isLoading: false,
                isVerifying: false,
                hasHydrated: true,
                rememberMe: rememberMe,
                mfaPending: null,
                sessionProof: proof, // Always include proof to satisfy purgeStaleAuthStorage
                sessionRestoreError: null
              },
              version: 0
            };

            sessionStorage.setItem('inteva-auth', JSON.stringify(storePayload));
            sessionStorage.setItem('bidsphere-session-proof', JSON.stringify(proof));
            if (rememberMe) {
              localStorage.setItem('inteva-auth', JSON.stringify(storePayload));
              localStorage.setItem('bidsphere-session-proof', JSON.stringify(proof));
            }
            localStorage.setItem('inteva-auth-remember', rememberMe ? 'true' : 'false');

            if (user.access_token) {
              sessionStorage.setItem('bidsphere-access-token', user.access_token);
              localStorage.setItem('bidsphere-access-token', user.access_token);
              if (rememberMe) {
                localStorage.setItem('bidsphere-access-token-remember', user.access_token);
              }
            }
          } catch (e) {
            console.warn('BidSphere storage sync note:', e);
          }
        }

        // 2. If PDM user: persist PDM user session
        if (data.pdmUser) {
          try {
            localStorage.setItem('pdm_user_session', JSON.stringify(data.pdmUser));
          } catch (e) {
            console.warn('PDM storage sync note:', e);
          }
        }

        // Redirect to resolved destination or requested return URL
        const urlParams = new URLSearchParams(window.location.search);
        const explicitRedirect = urlParams.get('redirect');
        let destination = data.redirectUrl || '/';

        if (explicitRedirect && explicitRedirect.startsWith('/')) {
          if (data.targetApp === 'bidsphere' && explicitRedirect.startsWith('/bidsphere')) {
            destination = explicitRedirect;
          } else if (data.targetApp === 'pdm' && explicitRedirect.startsWith('/project-management')) {
            destination = explicitRedirect;
          }
        }

        window.location.replace(destination);

      } catch (err) {
        console.error('Login error:', err);
        showAlert('Unable to connect to authentication server. Please verify your connection.');
        submitBtn.disabled = false;
        btnText.textContent = 'Sign In to Enterprise';
        spinner.style.display = 'none';
      }
    }
  </script>
</body>
</html>`;
}
