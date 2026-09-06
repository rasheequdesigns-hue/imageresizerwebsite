/**
 * StudioSuite 50 PRO - Full Admin Management Panel Engine
 * Multi-tenant Paywall Admin Dashboard, Feature Toggles, Plan CRUD,
 * User Overrides, Statement Uploader & Real-time Settings Engine.
 */

class AdminPanelEngine {
  static _activeTab = 'overview';
  static _featuresCache = {};
  static _settingsCache = {};
  static _statsCache = null;

  // ── Authentication & Gate ──────────────────────────────────────────────────
  static isAdminLoggedIn() {
    const user = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
    if (!user) return false;
    return user.isAdmin === true || user.email === 'rasheequ.designs@gmail.com';
  }

  static getAdminUpi() {
    if (this._settingsCache && this._settingsCache.admin_upi) {
      return String(this._settingsCache.admin_upi).replace(/^"|^'|"$|'$/g, '');
    }
    return '9526569313@upi';
  }

  static getContactInfo() {
    try {
      const c = this._settingsCache && this._settingsCache.footer_contact;
      if (c) return typeof c === 'string' ? JSON.parse(c) : c;
    } catch (e) { }
    return {
      company: 'StudioSuite PRO Platform Inc.',
      address: '100 Innovation Parkway, Suite 400, Tech Park',
      phone: '+91 98765 43210',
      email: 'support@studiosuitepro.com',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM IST'
    };
  }

  static async init() {
    try {
      if (window.SupabaseEngine) {
        this._settingsCache = await SupabaseEngine.getSettings();
        this._featuresCache = await SupabaseEngine.initFeatures();
      }
    } catch (e) {
      console.warn('[AdminPanel] Init settings/features error:', e);
    }
  }

  // ── Main Page Render ───────────────────────────────────────────────────────
  static async renderAdminPage() {
    const container = document.getElementById('admin-page-view');
    if (!container) return;

    const user = window.AuthSubscriptionEngine ? AuthSubscriptionEngine.getCurrentUser() : null;
    const isAuthorized = this.isAdminLoggedIn();

    if (!user) {
      container.innerHTML = `
        <div class="min-h-[80vh] flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-md w-full text-center space-y-5">
            <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <i class="fa-solid fa-lock"></i>
            </div>
            <div class="space-y-2">
              <h2 class="text-2xl font-black text-slate-900">Admin Portal Restricted</h2>
              <p class="text-xs text-slate-500 leading-relaxed">
                You must be authenticated as an administrator to access the StudioSuite PRO Admin Portal.
              </p>
            </div>
            <div class="flex gap-3">
              <button onclick="window.location.hash='#'; AuthSubscriptionEngine.openAuthModal('login');" class="btn-gradient flex-1 py-3 text-xs font-extrabold rounded-xl shadow-md">
                <i class="fa-solid fa-right-to-bracket mr-1"></i> Admin Sign In
              </button>
              <a href="#" class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center">
                Back Home
              </a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (!isAuthorized) {
      container.innerHTML = `
        <div class="min-h-[80vh] flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl border border-red-200 shadow-2xl p-8 max-w-md w-full text-center space-y-5">
            <div class="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <i class="fa-solid fa-shield-xmark"></i>
            </div>
            <div class="space-y-2">
              <h2 class="text-2xl font-black text-slate-900">Access Denied</h2>
              <p class="text-xs text-slate-500 leading-relaxed">
                Signed in as <strong>${user.email}</strong>. This account does not possess administrator privileges.
              </p>
            </div>
            <a href="#" class="btn-gradient inline-flex items-center justify-center px-6 py-3 text-xs font-extrabold rounded-xl shadow-md">
              Return to Studio Tools
            </a>
          </div>
        </div>
      `;
      return;
    }

    // Render Full Admin Shell
    container.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        
        <!-- Top Admin Header -->
        <header class="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/20">
              <i class="fa-solid fa-gauge-high"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-sm sm:text-base font-black tracking-tight text-white">StudioSuite Admin</h1>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <i class="fa-solid fa-circle-check mr-1"></i>PRO Active
                </span>
              </div>
              <p class="text-[10px] text-slate-400">Master Paywall &amp; Subscription Controller</p>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <a href="#" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/80 transition flex items-center gap-1.5">
              <i class="fa-solid fa-arrow-left"></i>
              <span class="hidden sm:inline">Exit to Portal</span>
            </a>
            <button onclick="AdminPanelEngine.refreshCurrentTab()" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700/80 transition" title="Refresh Data">
              <i class="fa-solid fa-rotate text-xs"></i>
            </button>
          </div>
        </header>

        <!-- Admin Navigation Tabs -->
        <nav class="border-b border-slate-800/80 bg-slate-900/50 px-4 sm:px-6 overflow-x-auto">
          <div class="flex gap-1 sm:gap-2 max-w-7xl mx-auto py-2">
            ${[
        { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
        { id: 'payments', icon: 'fa-receipt', label: 'Pending Payments' },
        { id: 'users', icon: 'fa-users', label: 'Users & Subscriptions' },
        { id: 'plans', icon: 'fa-crown', label: 'Subscription Plans' },
        { id: 'features', icon: 'fa-toggle-on', label: 'Tool Toggles (50)' },
        { id: 'statement', icon: 'fa-file-invoice-dollar', label: 'CSV Statement Uploader' },
        { id: 'settings', icon: 'fa-sliders', label: 'Site Settings' },
      ].map(tab => `
              <button onclick="AdminPanelEngine.switchTab('${tab.id}')" id="admin-tab-btn-${tab.id}" class="px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 ${this._activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}">
                <i class="fa-solid ${tab.icon}"></i>
                <span>${tab.label}</span>
              </button>
            `).join('')}
          </div>
        </nav>

        <!-- Tab Body Container -->
        <main id="admin-tab-body" class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-center py-20 text-slate-500">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500 mr-3"></i>
            <span>Loading admin module...</span>
          </div>
        </main>
      </div>
    `;

    await this.renderTabContent(this._activeTab);
  }

  static async switchTab(tabId) {
    this._activeTab = tabId;
    document.querySelectorAll('[id^="admin-tab-btn-"]').forEach(btn => {
      btn.className = 'px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60';
    });
    const activeBtn = document.getElementById(`admin-tab-btn-${tabId}`);
    if (activeBtn) activeBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30';
    await this.renderTabContent(tabId);
  }

  static async refreshCurrentTab() {
    await this.renderTabContent(this._activeTab);
    if (window.showToast) window.showToast('Admin data refreshed!', 'success');
  }

  // ── Tab Router & Renderers ─────────────────────────────────────────────────
  static async renderTabContent(tabId) {
    const main = document.getElementById('admin-tab-body');
    if (!main) return;

    main.innerHTML = `
      <div class="flex items-center justify-center py-16 text-slate-400">
        <i class="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500 mr-2"></i>
        <span>Loading...</span>
      </div>
    `;

    try {
      if (tabId === 'overview') await this._renderOverviewTab(main);
      else if (tabId === 'payments') await this._renderPaymentsTab(main);
      else if (tabId === 'users') await this._renderUsersTab(main);
      else if (tabId === 'plans') await this._renderPlansTab(main);
      else if (tabId === 'features') await this._renderFeaturesTab(main);
      else if (tabId === 'statement') await this._renderStatementTab(main);
      else if (tabId === 'settings') await this._renderSettingsTab(main);
    } catch (e) {
      main.innerHTML = `
        <div class="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
          <p class="font-bold mb-1"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Failed to render ${tabId}:</p>
          <p class="font-mono">${e.message}</p>
        </div>
      `;
    }
  }

  // ── 1. Overview Tab ────────────────────────────────────────────────────────
  static async _renderOverviewTab(container) {
    let stats = { totalUsers: 0, activeSubs: 0, pendingPayments: 0, totalRevenueINR: 0, totalFeatures: 50, enabledFeatures: 50 };
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.ok && data.stats) stats = data.stats;
    } catch (e) {
      console.warn('[Admin Overview] Stats API fetch error:', e);
    }

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Welcome Hero -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 relative overflow-hidden">
          <div class="relative z-10 space-y-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 inline-flex items-center gap-1.5">
              <i class="fa-solid fa-bolt"></i> Live Realtime Telemetry
            </span>
            <h2 class="text-2xl sm:text-3xl font-black text-white">System &amp; Subscription Command Center</h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of UPI payments, automated email-to-UTR verification webhooks, 50 site-wide tool toggles, and subscriber management.
            </p>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Total Revenue (INR)</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm"><i class="fa-solid fa-indian-rupee-sign"></i></div>
            </div>
            <div class="text-2xl font-black text-white">₹${stats.totalRevenueINR.toLocaleString('en-IN')}</div>
            <p class="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Verified via UPI</p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Active Subscriptions</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm"><i class="fa-solid fa-crown"></i></div>
            </div>
            <div class="text-2xl font-black text-white">${stats.activeSubs} <span class="text-xs text-slate-500 font-normal">/ ${stats.totalUsers} users</span></div>
            <p class="text-[11px] text-indigo-400 font-semibold flex items-center gap-1"><i class="fa-solid fa-shield-check"></i> Active Paywall Pass</p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 ${stats.pendingPayments > 0 ? 'ring-2 ring-amber-500/40 bg-amber-950/10' : ''}">
            <div class="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Pending Verifications</span>
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm"><i class="fa-solid fa-clock"></i></div>
            </div>
            <div class="text-2xl font-black ${stats.pendingPayments > 0 ? 'text-amber-400' : 'text-white'}">${stats.pendingPayments}</div>
            <p class="text-[11px] text-amber-400 font-semibold flex items-center gap-1"><i class="fa-solid fa-hourglass-half"></i> UTRs awaiting review</p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Active Tools</span>
              <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm"><i class="fa-solid fa-layer-group"></i></div>
            </div>
            <div class="text-2xl font-black text-white">${stats.enabledFeatures} <span class="text-xs text-slate-500 font-normal">/ 50 Tools</span></div>
            <p class="text-[11px] text-purple-400 font-semibold flex items-center gap-1"><i class="fa-solid fa-toggle-on"></i> Site-wide feature engine</p>
          </div>

        </div>

        <!-- Quick Action Shortcuts -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onclick="AdminPanelEngine.switchTab('payments')" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left transition space-y-2 group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i class="fa-solid fa-receipt"></i></div>
              <div>
                <h4 class="font-extrabold text-sm text-white">Review Pending Payments</h4>
                <p class="text-[11px] text-slate-400">1-click approve or reject submitted UTR references</p>
              </div>
            </div>
          </button>

          <button onclick="AdminPanelEngine.switchTab('statement')" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left transition space-y-2 group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i class="fa-solid fa-file-csv"></i></div>
              <div>
                <h4 class="font-extrabold text-sm text-white">Upload Bank Statement</h4>
                <p class="text-[11px] text-slate-400">Batch match 12-digit UTRs from CSV/Excel</p>
              </div>
            </div>
          </button>

          <button onclick="AdminPanelEngine.switchTab('features')" class="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left transition space-y-2 group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i class="fa-solid fa-toggle-on"></i></div>
              <div>
                <h4 class="font-extrabold text-sm text-white">Toggle Studio Tools</h4>
                <p class="text-[11px] text-slate-400">Instantly enable/disable any tool site-wide</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Webhook Integration Card -->
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
              <i class="fa-solid fa-satellite-dish text-indigo-400"></i> Automated Email Verification Webhook Endpoint
            </h3>
            <span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-bold">Ready</span>
          </div>
          <p class="text-xs text-slate-400">
            Forward your bank credit alert emails (via Zapier, Make, or Mailgun) to this webhook URL for instant, automated UTR extraction and subscription activation:
          </p>
          <div class="flex gap-2">
            <input class="custom-input flex-1 text-xs font-mono bg-slate-950 text-indigo-300 border-slate-700" value="${window.location.origin}/api/v1/payments/verify-email" readonly id="webhook-url-input">
            <button onclick="navigator.clipboard.writeText(document.getElementById('webhook-url-input').value); if(window.showToast) showToast('Webhook URL copied!','success');" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition">
              <i class="fa-solid fa-copy mr-1"></i> Copy
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // ── 2. Pending Payments Tab ────────────────────────────────────────────────
  static async _renderPaymentsTab(container) {
    const payments = window.SupabaseEngine ? await SupabaseEngine.getPayments() : [];

    container.innerHTML = `
      <div class="space-y-5 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold text-white">Payment Audit &amp; Verification</h2>
            <p class="text-xs text-slate-400">Review submitted UTR reference numbers and activate subscriptions.</p>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" id="payments-search" placeholder="Search UTR, email, plan..." class="custom-input text-xs bg-slate-900 text-white border-slate-700 rounded-xl px-3 py-2 w-full sm:w-64" oninput="AdminPanelEngine._filterPaymentsTable(this.value)">
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-800">
                <tr>
                  <th class="p-3.5">User / Email</th>
                  <th class="p-3.5">12-Digit UTR / Reference</th>
                  <th class="p-3.5">Plan Type</th>
                  <th class="p-3.5">Amount</th>
                  <th class="p-3.5">Submitted At</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="payments-table-body" class="divide-y divide-slate-800/60">
                ${payments.length === 0 ? `
                  <tr>
                    <td colspan="7" class="text-center py-12 text-slate-500">
                      <i class="fa-solid fa-inbox text-3xl mb-2 block"></i>
                      No payment submissions found in database.
                    </td>
                  </tr>
                ` : payments.map(p => `
                  <tr class="hover:bg-slate-800/40 transition payment-row" data-search="${(p.userEmail + ' ' + p.utrNumber + ' ' + p.planType).toLowerCase()}">
                    <td class="p-3.5">
                      <div class="font-bold text-white">${p.userName || 'User'}</div>
                      <div class="text-[11px] text-slate-400 font-mono">${p.userEmail || p.userId}</div>
                    </td>
                    <td class="p-3.5">
                      <span class="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 select-all">
                        ${p.utrNumber}
                      </span>
                    </td>
                    <td class="p-3.5 capitalize font-bold text-slate-200">${p.planType || 'pro-monthly'}</td>
                    <td class="p-3.5 font-black text-white">₹${p.amountINR || 0}</td>
                    <td class="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">${p.timestamp ? new Date(p.timestamp).toLocaleString() : 'N/A'}</td>
                    <td class="p-3.5">
                      ${p.isVerified ? `
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                          <i class="fa-solid fa-check"></i> Verified
                        </span>
                      ` : `
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 animate-pulse">
                          <i class="fa-solid fa-clock"></i> Pending
                        </span>
                      `}
                    </td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                      ${!p.isVerified ? `
                        <button onclick="AdminPanelEngine.approvePayment('${p.id}', '${p.userId}', '${p.planType}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition mr-1.5">
                          <i class="fa-solid fa-check mr-1"></i> Approve
                        </button>
                      ` : ''}
                      <button onclick="AdminPanelEngine.deletePaymentRecord('${p.id}')" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 border border-slate-700 transition" title="Delete record">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  static _filterPaymentsTable(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.payment-row').forEach(row => {
      const search = row.dataset.search || '';
      row.style.display = search.includes(q) ? '' : 'none';
    });
  }

  static async approvePayment(paymentId, userId, planType) {
    try {
      if (window.SupabaseEngine) {
        await SupabaseEngine.verifyPayment(paymentId, userId, planType);
        if (window.showToast) window.showToast('Payment verified & subscription activated!', 'success');
        await this.renderTabContent('payments');
      }
    } catch (e) {
      if (window.showToast) window.showToast('Verification failed: ' + e.message, 'error');
    }
  }

  static async deletePaymentRecord(paymentId) {
    if (!confirm('Delete this payment record?')) return;
    try {
      if (window.SupabaseEngine) {
        await SupabaseEngine.deletePayment(paymentId);
        if (window.showToast) window.showToast('Payment record deleted.', 'info');
        await this.renderTabContent('payments');
      }
    } catch (e) {
      if (window.showToast) window.showToast(e.message, 'error');
    }
  }

  // ── 3. Users & Subscriptions Tab ───────────────────────────────────────────
  static async _renderUsersTab(container) {
    const users = window.SupabaseEngine ? await SupabaseEngine.getUsers() : [];

    container.innerHTML = `
      <div class="space-y-5 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold text-white">User Accounts &amp; Subscription Override</h2>
            <p class="text-xs text-slate-400">View registered users, manually grant/extend subscriptions, or assign admin rights.</p>
          </div>
          <input type="text" placeholder="Search user name or email..." class="custom-input text-xs bg-slate-900 text-white border-slate-700 rounded-xl px-3 py-2 w-full sm:w-64" oninput="AdminPanelEngine._filterUsersTable(this.value)">
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-800">
                <tr>
                  <th class="p-3.5">User</th>
                  <th class="p-3.5">Current Plan</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5">Plan Expiry</th>
                  <th class="p-3.5">Role</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="users-table-body" class="divide-y divide-slate-800/60">
                ${users.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-500">No user accounts found in profiles table.</td></tr>
                ` : users.map(u => {
      const isPro = u.planId !== 'free';
      const isExpired = u.expiresAt && new Date(u.expiresAt) <= new Date();
      return `
                    <tr class="hover:bg-slate-800/40 transition user-row" data-search="${(u.name + ' ' + u.email).toLowerCase()}">
                      <td class="p-3.5">
                        <div class="font-bold text-white flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-extrabold uppercase">
                            ${(u.name || u.email || 'U')[0]}
                          </div>
                          <span>${u.name || 'User'}</span>
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono mt-0.5">${u.email}</div>
                      </td>
                      <td class="p-3.5 font-bold capitalize text-slate-200">
                        <span class="px-2 py-0.5 rounded-md ${isPro ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}">
                          ${u.planId}
                        </span>
                      </td>
                      <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.subscriptionVerified && !isExpired ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                          ${u.subscriptionVerified && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Free / Pending'}
                        </span>
                      </td>
                      <td class="p-3.5 text-slate-300 whitespace-nowrap text-[11px]">
                        ${u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td class="p-3.5">
                        ${u.isAdmin ? `
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500/20 text-pink-400 border border-pink-500/30">
                            Admin
                          </span>
                        ` : `
                          <span class="text-slate-500 text-[10px]">User</span>
                        `}
                      </td>
                      <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="AdminPanelEngine.openUserOverrideModal('${u.id}', '${(u.name || '').replace(/'/g, "\\'")}', '${u.email}', '${u.planId}', ${u.isAdmin})" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition mr-1">
                          <i class="fa-solid fa-pen-to-square mr-1"></i> Override
                        </button>
                      </td>
                    </tr>
                  `;
    }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  static _filterUsersTable(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.user-row').forEach(row => {
      const search = row.dataset.search || '';
      row.style.display = search.includes(q) ? '' : 'none';
    });
  }

  static openUserOverrideModal(userId, name, email, currentPlan, isAdmin) {
    const modalId = 'user-override-modal';
    document.getElementById(modalId)?.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-white">Override User Subscription</h3>
          <button onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="space-y-1 text-xs">
          <p class="font-bold text-slate-300">${name} (${email})</p>
          <p class="text-slate-500 font-mono text-[10px]">${userId}</p>
        </div>

        <form onsubmit="AdminPanelEngine.handleUserOverrideSave(event, '${userId}')" class="space-y-3 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase text-[10px]">Assign Plan</label>
            <select id="override-plan-id" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
              <option value="free" ${currentPlan === 'free' ? 'selected' : ''}>Free Tier</option>
              <option value="pro-monthly" ${currentPlan === 'pro-monthly' ? 'selected' : ''}>Pro Monthly (30 Days)</option>
              <option value="pro-yearly" ${currentPlan === 'pro-yearly' ? 'selected' : ''}>Pro Annual (365 Days)</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase text-[10px]">Extend Days</label>
            <input type="number" id="override-days" value="30" min="1" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="override-is-admin" ${isAdmin ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700">
            <label for="override-is-admin" class="font-bold text-slate-300">Grant Administrator Role</label>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="override-verify-sub" checked class="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700">
            <label for="override-verify-sub" class="font-bold text-emerald-400">Set Subscription Verified = True</label>
          </div>

          <div class="pt-3 flex gap-2">
            <button type="submit" class="btn-gradient flex-1 py-2.5 text-xs font-extrabold rounded-xl shadow-md">
              <i class="fa-solid fa-floppy-disk mr-1"></i> Save Changes
            </button>
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static async handleUserOverrideSave(e, userId) {
    e.preventDefault();
    const planId = document.getElementById('override-plan-id')?.value;
    const days = parseInt(document.getElementById('override-days')?.value || '30', 10);
    const isAdmin = document.getElementById('override-is-admin')?.checked || false;
    const isVerified = document.getElementById('override-verify-sub')?.checked || false;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    try {
      if (window.SupabaseEngine) {
        await SupabaseEngine.updateProfile(userId, {
          current_plan: planId,
          plan_expiry: expiry.toISOString(),
          subscription_verified: isVerified,
          is_admin: isAdmin
        });
        document.getElementById('user-override-modal')?.remove();
        if (window.showToast) window.showToast('User subscription updated!', 'success');
        await this.renderTabContent('users');
      }
    } catch (ex) {
      if (window.showToast) window.showToast(ex.message, 'error');
    }
  }

  // ── 4. Subscription Plans Tab ──────────────────────────────────────────────
  static async _renderPlansTab(container) {
    const plans = window.SupabaseEngine ? await SupabaseEngine.getPlans() : SupabaseEngine.DEFAULT_PLANS;

    container.innerHTML = `
      <div class="space-y-5 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold text-white">Subscription Plans CRUD</h2>
            <p class="text-xs text-slate-400">Manage pricing, durations, max file sizes, and tool allowances for plans.</p>
          </div>
          <button onclick="AdminPanelEngine.openPlanEditModal()" class="btn-gradient px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 self-start sm:self-auto">
            <i class="fa-solid fa-plus"></i> Add New Plan
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          ${plans.map(plan => `
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-black text-white">${plan.name}</h3>
                  ${plan.badge ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">${plan.badge}</span>` : ''}
                </div>
                <div class="text-2xl font-black text-white">₹${plan.priceINR} <span class="text-xs text-slate-400 font-normal">/ ${plan.durationDays} days</span></div>
                <div class="text-[11px] text-slate-400">Upload Limit: <strong class="text-slate-200">${plan.maxFileSizeMB} MB</strong></div>
                <ul class="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  ${(Array.isArray(plan.features) ? plan.features : []).map(f => `<li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-400 text-[10px]"></i><span>${f}</span></li>`).join('')}
                </ul>
              </div>
              <div class="pt-3 border-t border-slate-800 flex gap-2">
                <button onclick="AdminPanelEngine.openPlanEditModal('${plan.id}')" class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition">
                  <i class="fa-solid fa-pen mr-1"></i> Edit Plan
                </button>
                ${plan.id !== 'free' ? `
                  <button onclick="AdminPanelEngine.deletePlan('${plan.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  static async openPlanEditModal(planId = null) {
    const plans = window.SupabaseEngine ? await SupabaseEngine.getPlans() : [];
    const plan = planId ? plans.find(p => p.id === planId) : {
      id: 'pro-custom',
      name: 'Custom Plan',
      priceINR: 299,
      durationDays: 30,
      maxFileSizeMB: 100,
      badge: '',
      features: ['All 50 Tools Unlocked', 'Priority Speed'],
      allowedToolIds: 'all'
    };

    const modalId = 'plan-edit-modal';
    document.getElementById(modalId)?.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-white">${planId ? 'Edit Plan' : 'Create New Plan'}</h3>
          <button onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form onsubmit="AdminPanelEngine.handlePlanSave(event, '${planId || ''}')" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Plan Identifier</label>
              <input type="text" id="plan-id" value="${plan.id}" ${planId ? 'readonly' : ''} class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl" required>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Display Name</label>
              <input type="text" id="plan-name" value="${plan.name}" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl" required>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Price (₹ INR)</label>
              <input type="number" id="plan-price" value="${plan.priceINR}" min="0" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl" required>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Duration (Days)</label>
              <input type="number" id="plan-days" value="${plan.durationDays}" min="1" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl" required>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-400 uppercase text-[10px]">Max File (MB)</label>
              <input type="number" id="plan-filesize" value="${plan.maxFileSizeMB}" min="1" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl" required>
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase text-[10px]">Badge (Optional)</label>
            <input type="text" id="plan-badge" value="${plan.badge || ''}" placeholder="e.g. Popular, Best Value" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-400 uppercase text-[10px]">Features (comma separated)</label>
            <textarea id="plan-features" rows="3" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">${(Array.isArray(plan.features) ? plan.features : []).join(', ')}</textarea>
          </div>

          <div class="pt-3 flex gap-2">
            <button type="submit" class="btn-gradient flex-1 py-2.5 text-xs font-extrabold rounded-xl shadow-md">
              <i class="fa-solid fa-floppy-disk mr-1"></i> Save Plan
            </button>
            <button type="button" onclick="document.getElementById('${modalId}').remove()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static async handlePlanSave(e, isEdit) {
    e.preventDefault();
    const id = document.getElementById('plan-id')?.value?.trim();
    const name = document.getElementById('plan-name')?.value?.trim();
    const priceINR = parseFloat(document.getElementById('plan-price')?.value || '0');
    const durationDays = parseInt(document.getElementById('plan-days')?.value || '30', 10);
    const maxFileSizeMB = parseInt(document.getElementById('plan-filesize')?.value || '25', 10);
    const badge = document.getElementById('plan-badge')?.value?.trim() || '';
    const featuresRaw = document.getElementById('plan-features')?.value || '';
    const features = featuresRaw.split(',').map(s => s.trim()).filter(Boolean);

    try {
      if (window.SupabaseEngine) {
        await SupabaseEngine.savePlan({
          id,
          name,
          priceINR,
          durationDays,
          maxFileSizeMB,
          badge,
          features,
          allowedToolIds: 'all'
        });
        document.getElementById('plan-edit-modal')?.remove();
        if (window.showToast) window.showToast('Plan saved successfully!', 'success');
        await this.renderTabContent('plans');
      }
    } catch (ex) {
      if (window.showToast) window.showToast(ex.message, 'error');
    }
  }

  static async deletePlan(planId) {
    if (!confirm(`Are you sure you want to delete plan "${planId}"?`)) return;
    try {
      if (window.SupabaseEngine) {
        await SupabaseEngine.deletePlan(planId);
        if (window.showToast) window.showToast('Plan deleted.', 'info');
        await this.renderTabContent('plans');
      }
    } catch (e) {
      if (window.showToast) window.showToast(e.message, 'error');
    }
  }

  // ── 5. Tool Feature Toggles Tab (50 Tools) ─────────────────────────────────
  static async _renderFeaturesTab(container) {
    const tools = window.TOOLS || [];
    const features = this._featuresCache || {};

    container.innerHTML = `
      <div class="space-y-5 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold text-white">50 Tool Feature Toggles</h2>
            <p class="text-xs text-slate-400">Dynamically enable or disable any studio tool site-wide in real-time.</p>
          </div>
          <div class="flex gap-2">
            <button onclick="AdminPanelEngine.toggleAllFeatures(true)" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-md">
              <i class="fa-solid fa-check-double mr-1"></i> Enable All
            </button>
            <button onclick="AdminPanelEngine.toggleAllFeatures(false)" class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold transition shadow-md">
              <i class="fa-solid fa-ban mr-1"></i> Disable All
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${tools.map(tool => {
      const isEnabled = features[tool.id] !== false;
      return `
              <div class="p-4 rounded-2xl bg-slate-900 border ${isEnabled ? 'border-slate-800' : 'border-red-900/40 bg-red-950/10'} flex items-center justify-between gap-3 transition">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center text-sm shrink-0">
                    <i class="fa-solid ${tool.icon}"></i>
                  </div>
                  <div class="overflow-hidden">
                    <h4 class="font-bold text-xs text-white truncate">${tool.name}</h4>
                    <span class="text-[10px] text-slate-500 uppercase">${tool.category}</span>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="AdminPanelEngine.toggleSingleFeature('${tool.id}', this.checked)" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }

  static async toggleSingleFeature(toolId, enabled) {
    this._featuresCache[toolId] = enabled;
    try {
      if (window.SupabaseEngine) {
        await SupabaseEngine.setFeatureEnabled(toolId, enabled);
        if (window.showToast) window.showToast(`Tool "${toolId}" ${enabled ? 'enabled' : 'disabled'} site-wide.`, 'info');
      }
    } catch (e) {
      if (window.showToast) window.showToast(e.message, 'error');
    }
  }

  static async toggleAllFeatures(enabled) {
    const tools = window.TOOLS || [];
    const toolIds = tools.map(t => t.id);
    toolIds.forEach(id => { this._featuresCache[id] = enabled; });
    try {
      if (window.SupabaseEngine) {
        if (enabled) await SupabaseEngine.enableAllFeatures(toolIds);
        else await SupabaseEngine.disableAllFeatures(toolIds);
        if (window.showToast) window.showToast(`All 50 tools ${enabled ? 'enabled' : 'disabled'}!`, 'success');
        await this.renderTabContent('features');
      }
    } catch (e) {
      if (window.showToast) window.showToast(e.message, 'error');
    }
  }

  // ── 6. Bank Statement CSV / Text Uploader Tab ──────────────────────────────
  static async _renderStatementTab(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h2 class="text-xl font-extrabold text-white">Bank Statement Batch Uploader</h2>
          <p class="text-xs text-slate-400">Upload bank statement CSV / Excel or paste raw transaction text to automatically extract 12-digit UTR references and batch-activate matching subscriber accounts.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          
          <!-- Dropzone file input -->
          <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition bg-slate-950/40" onclick="document.getElementById('statement-file-input').click()">
            <input type="file" id="statement-file-input" accept=".csv,.txt,.xlsx,.xls" class="hidden" onchange="AdminPanelEngine.handleStatementFileSelect(this)">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mx-auto">
              <i class="fa-solid fa-file-csv"></i>
            </div>
            <h4 class="font-extrabold text-sm text-white">Select Bank Statement CSV / TXT File</h4>
            <p class="text-xs text-slate-400">Supports HDFC, ICICI, SBI, Axis, Paytm Bank Statements</p>
          </div>

          <div class="text-center text-[10px] text-slate-500 uppercase font-extrabold">OR PASTE RAW STATEMENT TEXT</div>

          <!-- Raw text input -->
          <div class="space-y-1">
            <textarea id="statement-raw-text" rows="5" placeholder="Paste bank transaction lines or email dump here... (e.g. UPI/424589012345/CR/499.00)" class="custom-input w-full bg-slate-950 text-white font-mono text-xs border-slate-700 rounded-xl p-3"></textarea>
          </div>

          <button onclick="AdminPanelEngine.processStatementUpload()" id="process-statement-btn" class="btn-gradient w-full py-3.5 rounded-xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Scan Statement &amp; Batch Activate Subscriptions
          </button>

        </div>

        <!-- Result Box -->
        <div id="statement-results-box" class="hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"></div>

      </div>
    `;
  }

  static handleStatementFileSelect(input) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const textArea = document.getElementById('statement-raw-text');
      if (textArea) textArea.value = text;
      if (window.showToast) window.showToast(`Loaded ${file.name} (${text.length} bytes)`, 'info');
    };
    reader.readAsText(file);
  }

  static async processStatementUpload() {
    const rawText = document.getElementById('statement-raw-text')?.value?.trim();
    const btn = document.getElementById('process-statement-btn');
    const resBox = document.getElementById('statement-results-box');

    if (!rawText) {
      if (window.showToast) window.showToast('Please select a statement file or paste text first.', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Processing Statement...';
    }

    try {
      const res = await fetch('/api/v1/admin/upload-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement: rawText })
      });
      const data = await res.json();

      if (resBox) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl ${data.activatedCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'} flex items-center justify-center text-xl">
              <i class="fa-solid ${data.activatedCount > 0 ? 'fa-circle-check' : 'fa-info-circle'}"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-sm text-white">${data.message || 'Statement Processed'}</h4>
              <p class="text-xs text-slate-400">Scanned ${data.scannedUtrCount || 0} UTR reference numbers.</p>
            </div>
          </div>
          ${data.matchedUtrs && data.matchedUtrs.length > 0 ? `
            <div class="pt-3 border-t border-slate-800 space-y-1 text-xs">
              <p class="font-bold text-slate-300">Activated Accounts:</p>
              ${data.matchedUtrs.map(m => `
                <div class="p-2 rounded-lg bg-slate-950 flex items-center justify-between font-mono text-[11px]">
                  <span class="text-amber-400">UTR: ${m.utr}</span>
                  <span class="text-emerald-400 font-bold capitalize">Plan: ${m.plan}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        `;
      }

      if (window.showToast) window.showToast(`Activated ${data.activatedCount || 0} subscriptions!`, 'success');
    } catch (err) {
      if (window.showToast) window.showToast('Upload failed: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Scan Statement &amp; Batch Activate Subscriptions';
      }
    }
  }

  // ── 7. Site Settings Tab ───────────────────────────────────────────────────
  static async _renderSettingsTab(container) {
    const settings = this._settingsCache || {};
    const adminUpi = settings.admin_upi || 'merchant@upi';
    const contact = this.getContactInfo();

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h2 class="text-xl font-extrabold text-white">Platform Configuration &amp; UPI Settings</h2>
          <p class="text-xs text-slate-400">Configure receiving UPI address, passcode, and company footer contact details.</p>
        </div>

        <form onsubmit="AdminPanelEngine.handleSettingsSave(event)" class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
          
          <!-- UPI ID -->
          <div class="space-y-1.5">
            <label class="font-bold text-white uppercase text-[10px] flex items-center gap-1.5">
              <i class="fa-solid fa-qrcode text-emerald-400"></i> Admin UPI ID (for QR Generation) <span class="text-red-400">*</span>
            </label>
            <input type="text" id="setting-admin-upi" value="${adminUpi}" placeholder="e.g. merchant@okhdfcbank" class="custom-input w-full bg-slate-950 text-white font-mono font-bold border-slate-700 rounded-xl" required>
            <p class="text-[11px] text-slate-400">All checkout QR codes across the site dynamically route payments to this UPI address.</p>
          </div>

          <!-- Passcode -->
          <div class="space-y-1.5">
            <label class="font-bold text-white uppercase text-[10px] flex items-center gap-1.5">
              <i class="fa-solid fa-key text-amber-400"></i> Emergency Admin Passcode
            </label>
            <input type="text" id="setting-admin-passcode" value="${settings.admin_passcode || 'admin123'}" class="custom-input w-full bg-slate-950 text-white font-mono border-slate-700 rounded-xl">
          </div>

          <!-- Contact info JSON -->
          <div class="pt-4 border-t border-slate-800 space-y-3">
            <h4 class="font-bold text-sm text-white">Company Footer Information</h4>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-400 uppercase text-[10px]">Company Name</label>
                <input type="text" id="setting-contact-company" value="${contact.company || ''}" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-400 uppercase text-[10px]">Support Email</label>
                <input type="email" id="setting-contact-email" value="${contact.email || ''}" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-400 uppercase text-[10px]">Phone Number</label>
                <input type="text" id="setting-contact-phone" value="${contact.phone || ''}" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-400 uppercase text-[10px]">Office Address</label>
                <input type="text" id="setting-contact-address" value="${contact.address || ''}" class="custom-input w-full bg-slate-950 text-white border-slate-700 rounded-xl">
              </div>
            </div>
          </div>

          <button type="submit" class="btn-gradient w-full py-3 rounded-xl text-xs font-extrabold shadow-lg">
            <i class="fa-solid fa-floppy-disk mr-1.5"></i> Save Settings &amp; Sync Site-Wide
          </button>

        </form>
      </div>
    `;
  }

  static async handleSettingsSave(e) {
    e.preventDefault();
    const upi = document.getElementById('setting-admin-upi')?.value?.trim();
    const passcode = document.getElementById('setting-admin-passcode')?.value?.trim();
    const company = document.getElementById('setting-contact-company')?.value?.trim();
    const email = document.getElementById('setting-contact-email')?.value?.trim();
    const phone = document.getElementById('setting-contact-phone')?.value?.trim();
    const address = document.getElementById('setting-contact-address')?.value?.trim();

    try {
      if (window.SupabaseEngine) {
        if (upi) {
          await SupabaseEngine.setSetting('admin_upi', upi);
          this._settingsCache.admin_upi = upi;
        }
        if (passcode) {
          await SupabaseEngine.setSetting('admin_passcode', passcode);
          this._settingsCache.admin_passcode = passcode;
        }
        const contact = { company, email, phone, address, hours: 'Mon - Fri: 9:00 AM - 6:00 PM IST' };
        await SupabaseEngine.setSetting('footer_contact', JSON.stringify(contact));
        this._settingsCache.footer_contact = contact;

        if (window.renderFooterContact) window.renderFooterContact();
        if (window.showToast) window.showToast('Settings saved and synchronized!', 'success');
      }
    } catch (ex) {
      if (window.showToast) window.showToast(ex.message, 'error');
    }
  }
}

// Global Exports
window.AdminPanelEngine = AdminPanelEngine;
window.renderFullAdminPage = () => AdminPanelEngine.renderAdminPage();

// Boot Settings
AdminPanelEngine.init().catch(e => console.warn('[AdminPanel] Boot init error:', e));
