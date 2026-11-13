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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              950: '#0f172a',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    .bg-grid-pattern {
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    }
    .glow-effect {
      box-shadow: 0 0 50px -10px rgba(59, 130, 246, 0.25);
    }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
  <!-- Subtle ambient decorative glow -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
  </div>

  <!-- Header -->
  <header class="relative z-10 w-full px-6 py-5 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <span class="text-xl font-bold tracking-tight text-white">NETLINK</span>
          <span class="text-xs uppercase tracking-wider block text-blue-400 font-semibold">Enterprise Unified Portal</span>
        </div>
      </div>
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Dual ERPNext Gateway Online</span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
    <div class="w-full max-w-md">
      <!-- Card Container -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl glow-effect">
        
        <!-- Header Text -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Unified Sign In
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p class="text-sm text-slate-400 mt-1">Enter your ERPNext credentials to continue</p>
        </div>

        <!-- Alert Notification Box -->
        <div id="alertBox" class="${alertMessage ? '' : 'hidden'} mb-5 p-3.5 rounded-xl text-sm border flex items-start gap-3 ${
          alertType === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : alertType === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        }">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            ${
              alertType === 'error'
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'
                : alertType === 'success'
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            }
          </svg>
          <span id="alertMessage" class="flex-1">${alertMessage}</span>
        </div>

        <!-- Login Form -->
        <form id="loginForm" class="space-y-4" onsubmit="handleLogin(event)">
          <!-- Username / Email Input -->
          <div>
            <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Username or Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                autocomplete="username"
                placeholder="username or email@company.com"
                class="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••••••"
                class="w-full pl-11 pr-11 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
              <button
                type="button"
                id="togglePassword"
                onclick="togglePasswordVisibility()"
                tabindex="-1"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                aria-label="Toggle password visibility"
              >
                <!-- Eye Icon (Hidden by default) -->
                <svg id="eyeIcon" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye-Off Icon (Visible by default) -->
                <svg id="eyeOffIcon" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span class="text-xs text-slate-300 font-medium">Keep me signed in</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            id="submitButton"
            class="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <span id="buttonText">Sign In to Enterprise</span>
            <!-- Spinner Icon (hidden by default) -->
            <svg id="buttonSpinner" class="w-5 h-5 animate-spin hidden text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <!-- Information footer note -->
        <div class="mt-6 pt-5 border-t border-slate-800/80">
          <div class="flex items-center gap-2.5 text-xs text-slate-400">
            <div class="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="leading-relaxed">
              <span class="text-slate-300 font-medium">Automatic Routing:</span> Your credentials automatically identify your ERPNext instance and launch your authorized platform.
            </p>
          </div>
        </div>

      </div>

      <!-- Application Badges -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          BidSphere Procure-to-Pay (P2P)
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          Project Management (PDM)
        </span>
      </div>

    </div>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 w-full py-4 text-center text-xs text-slate-400 border-t border-slate-800/60 bg-slate-950/70">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>© 2026 Netlink Software Group. All rights reserved.</p>
      <p class="text-slate-400">Enterprise Dual-Instance Architecture • Secure Unified Gateway</p>
    </div>
  </footer>

  <script>
    function togglePasswordVisibility() {
      const passwordInput = document.getElementById('password');
      const eyeIcon = document.getElementById('eyeIcon');
      const eyeOffIcon = document.getElementById('eyeOffIcon');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
      } else {
        passwordInput.type = 'password';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
      }
    }

    function showAlert(text, type = 'error') {
      const alertBox = document.getElementById('alertBox');
      const alertMsg = document.getElementById('alertMessage');
      alertMsg.textContent = text;

      alertBox.className = 'mb-5 p-3.5 rounded-xl text-sm border flex items-start gap-3 ' + (
        type === 'error'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : type === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      );
      alertBox.classList.remove('hidden');
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
      spinner.classList.remove('hidden');

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

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          showAlert(data.message || 'Invalid username or password. Please verify your credentials.');
          submitBtn.disabled = false;
          btnText.textContent = 'Sign In to Enterprise';
          spinner.classList.add('hidden');
          return;
        }

        // Authentication succeeded!
        btnText.textContent = 'Routing to authorized platform…';

        // 1. If BidSphere user: persist BidSphere client session state
        if (data.bidsphereUser) {
          try {
            const user = data.bidsphereUser;
            const proof = {
              version: 2,
              userId: user.name,
              issuedAt: Date.now(),
              expiresAt: Date.now() + (rememberMe ? 7 * 24 * 3600 * 1000 : 12 * 3600 * 1000),
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
                sessionProof: rememberMe ? proof : null,
                sessionRestoreError: null
              },
              version: 0
            };

            const targetStorage = rememberMe ? localStorage : sessionStorage;
            targetStorage.setItem('inteva-auth', JSON.stringify(storePayload));
            targetStorage.setItem('bidsphere-session-proof', JSON.stringify(proof));
            if (user.access_token) {
              targetStorage.setItem('bidsphere_access_token', user.access_token);
            }
            localStorage.setItem('inteva-auth-remember', rememberMe ? 'true' : 'false');
          } catch (e) {
            console.warn('Storage sync note:', e);
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
        spinner.classList.add('hidden');
      }
    }
  </script>
</body>
</html>`;
}

