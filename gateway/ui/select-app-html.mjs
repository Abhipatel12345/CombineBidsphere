export function renderSelectAppHtml(options = {}) {
  const { user = {}, bidsphereUser = {}, pdmUser = {} } = options;
  const displayName = user.fullName || bidsphereUser.full_name || pdmUser.fullName || user.username || "Authorized User";
  const email = user.email || bidsphereUser.email || pdmUser.email || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Select Application — Netlink Enterprise Portal</title>
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
        }
      }
    }
  </script>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
  <!-- Decorative ambient lighting -->
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
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <span class="text-sm font-semibold text-white block">${displayName}</span>
          <span class="text-xs text-slate-400">${email}</span>
        </div>
        <a href="/api/unified-auth/logout" class="px-3.5 py-1.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors">
          Sign Out
        </a>
      </div>
    </div>
  </header>

  <!-- Main Body -->
  <main class="relative z-10 flex-1 flex items-center justify-center p-6 md:p-12">
    <div class="w-full max-w-4xl">
      <!-- Title Section -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Dual Enterprise Access Verified
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Select Application</h1>
        <p class="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Your credentials have authorized access to both enterprise platforms. Choose which workspace you want to launch.
        </p>
      </div>

      <!-- Application Selection Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        <!-- Card 1: BidSphere Procure-to-Pay -->
        <a href="/bidsphere/dashboard" class="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 sm:p-8 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between">
          <div class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-blue-600 text-[11px] font-bold text-white uppercase tracking-wider shadow-sm">
            Procure-to-Pay (P2P)
          </div>
          <div>
            <div class="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">BidSphere</h2>
            <p class="text-xs text-blue-400 font-medium mt-0.5">Enterprise Procurement & Sourcing Platform</p>
            <p class="text-slate-400 text-sm mt-3 leading-relaxed">
              Complete procure-to-pay lifecycle management: Material Requisitions, RFQs, Reverse Bidding, Contract CLM with E-Signatures, Purchase Orders, and Invoicing.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs text-slate-400">
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Sourcing & RFQ</span>
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Contract CLM</span>
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Purchase Orders</span>
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Supplier Portal</span>
            </div>
          </div>
          <div class="mt-8 flex items-center justify-between pt-4 border-t border-slate-800/80 text-blue-400 group-hover:text-blue-300 font-semibold text-sm">
            <span>Launch BidSphere</span>
            <svg class="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </a>

        <!-- Card 2: Project Management (PDM) -->
        <a href="/project-management/dashboard" class="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 sm:p-8 transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between">
          <div class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-indigo-600 text-[11px] font-bold text-white uppercase tracking-wider shadow-sm">
            Product Lifecycle (PDM)
          </div>
          <div>
            <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">Project Management</h2>
            <p class="text-xs text-indigo-400 font-medium mt-0.5">Product Data Management & Governance</p>
            <p class="text-slate-400 text-sm mt-3 leading-relaxed">
              Engineering project lifecycle governance: Project Charters, Stage-Gate 0 to 5 Reviews, Deliverable Audits, Gantt Schedule Tracking, Design Reviews, and Flawless Launch.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs text-slate-400">
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Stage-Gate Reviews</span>
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Gantt Schedules</span>
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Design Reviews</span>
              <span class="px-2 py-1 rounded bg-slate-950 border border-slate-800">Quality Governance</span>
            </div>
          </div>
          <div class="mt-8 flex items-center justify-between pt-4 border-t border-slate-800/80 text-indigo-400 group-hover:text-indigo-300 font-semibold text-sm">
            <span>Launch Project Management</span>
            <svg class="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </a>

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
</body>
</html>`;
}

