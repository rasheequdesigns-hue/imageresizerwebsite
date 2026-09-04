/**
 * StudioSuite Pro - Full Dedicated Admin Page & Management Dashboard
 * Data layer: Neon Postgres via NeonEngine API calls.
 * Only admin session (logged-in state) is kept in localStorage.
 */

class AdminPanelEngine {
  static STORAGE_ADMIN_SESSION = 'studiosuite_admin_session';

  // ── Features cache (populated by NeonEngine.initFeatures) ─────────────────
  /** { toolId: boolean } map, shared with NeonEngine._featuresCache */
  static _featuresCache = null;

  // ── Settings cache (loaded async) ─────────────────────────────────────────
  static _settingsCache = null;

  // ── Admin session ─────────────────────────────────────────────────────────

  static isAdminLoggedIn() {
    return localStorage.getItem(this.STORAGE_ADMIN_SESSION) === 'true';
  }

  static async adminLogin(passcode) {
    try {
      const settings = await this._loadSettings();
      const stored = settings['admin_passcode'] || 'admin123';
      if (passcode === stored) {
        localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true');
        return true;
      }
      return false;
    } catch {
      // Fallback: allow default passcode
      if (passcode === 'admin123') {
        localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true');
        return true;
      }
      return false;
    }
  }

  static adminLogout() {
    localStorage.removeItem(this.STORAGE_ADMIN_SESSION);
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  static async _loadSettings() {
    if (this._settingsCache) return this._settingsCache;
    try {
      const settings = await NeonEngine.call('/api/settings', 'GET');
      this._settingsCache = settings;
      // Keep NeonEngine cache in sync
      NeonEngine._settingsCache = settings;
      return settings;
    } catch (e) {
      console.warn('[Admin] _loadSettings failed:', e.message);
      this._settingsCache = {};
      return {};
    }
  }

  static async _saveSetting(key, value) {
    try {
      await NeonEngine.call('/api/settings', 'POST', { key, value });
      if (!this._settingsCache) this._settingsCache = {};
      this._settingsCache[key] = value;
      if (NeonEngine._settingsCache) NeonEngine._settingsCache[key] = value;
    } catch (e) {
      console.warn('[Admin] _saveSetting failed:', e.message);
      throw e;
    }
  }

  // ── UPI ───────────────────────────────────────────────────────────────────

  static getAdminUpi() {
    return this._settingsCache?.['admin_upi'] || 'merchant@upi';
  }

  static async setAdminUpi(upiId) {
    const val = (upiId || 'merchant@upi').trim();
    await this._saveSetting('admin_upi', val);
    return val;
  }

  // ── Passcode ──────────────────────────────────────────────────────────────

  static getPasscode() {
    return this._settingsCache?.['admin_passcode'] || 'admin123';
  }

  static async setPasscode(newPasscode) {
    await this._saveSetting('admin_passcode', newPasscode);
  }

  // ── Contact / Footer ──────────────────────────────────────────────────────

  static getContactInfo() {
    try {
      const raw = this._settingsCache?.['footer_contact'];
      if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {}
    return {
      company: 'StudioSuite PRO Platform Inc.',
      address: '100 Innovation Parkway, Suite 400, Tech Park',
      phone: '+91 98765 43210',
      email: 'support@studiosuitepro.com',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM IST',
    };
  }

  static async saveContactInfo(info) {
    await this._saveSetting('footer_contact', JSON.stringify(info));
  }

  // ── Features / Tool visibility ────────────────────────────────────────────

  static getAllToolIds() {
    if (window.TOOLS && Array.isArray(window.TOOLS)) {
      return window.TOOLS.map(t => t.id);
    }
    return [];
  }

  /**
   * Returns enabled feature IDs synchronously from cache.
   * Returns null if cache not yet populated (treated as "all enabled" by callers).
   */
  static getEnabledFeatures() {
    const cache = this._featuresCache || NeonEngine._featuresCache;
    if (!cache) return null;

    // Cache is { toolId: boolean } — return array of enabled tool IDs
    const tools = this.getAllToolIds();
    if (tools.length === 0) return null;

    return tools.filter(id => {
      // If the tool is not in cache, default to enabled
      return cache[id] !== false;
    });
  }

  static isFeatureEnabled(toolId) {
    const cache = this._featuresCache || NeonEngine._featuresCache;
    if (!cache) return true; // cache not ready → default allow
    // If toolId not in cache at all, default to enabled
    return cache[toolId] !== false;
  }

  static async setFeatureEnabled(toolId, enabled) {
    try {
      await NeonEngine.call('/api/features/toggle', 'POST', { tool_id: toolId, enabled: !!enabled });
      // Update cache
      const cache = this._featuresCache || NeonEngine._featuresCache || {};
      cache[toolId] = !!enabled;
      this._featuresCache = cache;
      NeonEngine._featuresCache = cache;
    } catch (e) {
      console.warn('[Admin] setFeatureEnabled failed:', e.message);
      throw e;
    }
    return this.getEnabledFeatures();
  }

  static async enableAllFeatures() {
    const all = this.getAllToolIds();
    if (!all.length) return [];
    try {
      await NeonEngine.call('/api/features/enable-all', 'POST', { tool_ids: all });
      const cache = this._featuresCache || NeonEngine._featuresCache || {};
      all.forEach(id => { cache[id] = true; });
      this._featuresCache = cache;
      NeonEngine._featuresCache = cache;
    } catch (e) {
      console.warn('[Admin] enableAllFeatures failed:', e.message);
      throw e;
    }
    return all;
  }

  static async disableAllFeatures() {
    const all = this.getAllToolIds();
    if (!all.length) return [];
    try {
      await NeonEngine.call('/api/features/disable-all', 'POST', { tool_ids: all });
      const cache = this._featuresCache || NeonEngine._featuresCache || {};
      all.forEach(id => { cache[id] = false; });
      this._featuresCache = cache;
      NeonEngine._featuresCache = cache;
    } catch (e) {
      console.warn('[Admin] disableAllFeatures failed:', e.message);
      throw e;
    }
    return [];
  }

  // -- Plans CRUD -- persisted to Neon DB via API ---------------------------------

  static async savePlan(planData) {
    const payload = {
      id:               planData.id || ('plan_' + Date.now()),
      name:             planData.name,
      price_inr:        planData.priceINR != null ? planData.priceINR : 0,
      duration_days:    planData.durationDays || 30,
      max_file_size_mb: planData.maxFileSizeMB || 25,
      badge:            planData.badge || '',
      features:         planData.features || [],
      allowed_tool_ids: planData.allowedToolIds != null ? planData.allowedToolIds : 'all',
      currency:         '\u20b9',
    };
    const saved = await NeonEngine.call('/api/plans', 'POST', payload);
    // Refresh local cache
    const plans = AuthSubscriptionEngine._plansCache || [];
    const idx = plans.findIndex(p => p.id === saved.id);
    if (idx !== -1) plans[idx] = saved; else plans.push(saved);
    AuthSubscriptionEngine._plansCache = [...plans].sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
    return saved;
  }

  static async deletePlan(planId) {
    if (planId === 'free') throw new Error('Cannot delete the default free plan');
    await NeonEngine.call('/api/plans/' + encodeURIComponent(planId), 'DELETE');
    if (AuthSubscriptionEngine._plansCache) {
      AuthSubscriptionEngine._plansCache = AuthSubscriptionEngine._plansCache.filter(p => p.id !== planId);
    }
  }
  // ── Payments (read from DB, delete via API) ────────────────────────────────

  static async getPayments() {
    try {
      return await NeonEngine.call('/api/payments', 'GET');
    } catch (e) {
      console.warn('[Admin] getPayments failed:', e.message);
      return [];
    }
  }

  static async deletePayment(txId) {
    await NeonEngine.call(`/api/payments/${encodeURIComponent(txId)}`, 'DELETE');
  }

  static async clearAllPayments() {
    await NeonEngine.call('/api/payments/all', 'DELETE');
  }
}

window.AdminPanelEngine = AdminPanelEngine;

// ── Feature toggle global helpers (called from inline onclick in admin UI) ────

window.adminToggleFeature = async function(toolId, enabled) {
  try {
    await AdminPanelEngine.setFeatureEnabled(toolId, enabled);
  } catch (e) {
    if (window.showToast) showToast('Failed to update feature: ' + e.message, 'error');
  }
  const list = document.getElementById('admin-feature-list');
  if (list) list.innerHTML = renderAdminFeatureList();
  window.dispatchEvent(new CustomEvent('featuresUpdated'));
  if (window.renderTools) window.renderTools();
};

window.adminEnableAllFeatures = async function() {
  try {
    await AdminPanelEngine.enableAllFeatures();
    const list = document.getElementById('admin-feature-list');
    if (list) list.innerHTML = renderAdminFeatureList();
    window.dispatchEvent(new CustomEvent('featuresUpdated'));
    if (window.showToast) showToast('All tools enabled!', 'success');
    if (window.renderTools) window.renderTools();
  } catch (e) {
    if (window.showToast) showToast('Failed: ' + e.message, 'error');
  }
};

window.adminDisableAllFeatures = async function() {
  if (!confirm('Disable all tools? Users will see an empty tools page.')) return;
  try {
    await AdminPanelEngine.disableAllFeatures();
    const list = document.getElementById('admin-feature-list');
    if (list) list.innerHTML = renderAdminFeatureList();
    window.dispatchEvent(new CustomEvent('featuresUpdated'));
    if (window.showToast) showToast('All tools disabled.', 'info');
    if (window.renderTools) window.renderTools();
  } catch (e) {
    if (window.showToast) showToast('Failed: ' + e.message, 'error');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN PANEL — Full tabbed dashboard UI
// ═══════════════════════════════════════════════════════════════════════════

async function renderFullAdminPage() {
  const container = document.getElementById('admin-page-view');
  if (!container) return;

  // ── Login gate ─────────────────────────────────────────────────────────
  if (!AdminPanelEngine.isAdminLoggedIn()) {
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 px-4 py-12">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div class="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-3xl mx-auto mb-4 backdrop-blur-sm">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-white">Admin Portal</h2>
            <p class="text-xs text-indigo-200 mt-1">Enter your passcode to access the control dashboard</p>
          </div>
          <div class="p-8 space-y-5">
            <form onsubmit="handleFullAdminLogin(event)" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-key text-indigo-500"></i> Admin Passcode
                </label>
                <div class="relative">
                  <input type="password" id="admin-page-passcode"
                    class="custom-input w-full text-sm pr-10 tracking-widest font-mono"
                    placeholder="••••••••" required autofocus>
                  <button type="button"
                    onclick="const i=document.getElementById('admin-page-passcode');i.type=i.type==='password'?'text':'password'"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition">
                    <i class="fa-solid fa-eye text-xs"></i>
                  </button>
                </div>
                <p class="text-[10px] text-slate-400">Default passcode: <code class="font-mono bg-slate-100 px-1 rounded">admin123</code></p>
              </div>
              <button type="submit" class="w-full btn-gradient py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
                <i class="fa-solid fa-unlock"></i> Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>`;
    return;
  }

  // ── Load data concurrently ──────────────────────────────────────────────
  container.innerHTML = `<div class="flex items-center justify-center min-h-screen"><div class="text-indigo-600"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i><p class="text-xs font-bold mt-3 text-slate-500">Loading dashboard...</p></div></div>`;

  let users = [], plans = [], payments = [], contactInfo = AdminPanelEngine.getContactInfo();

  // Ensure settings are loaded first (needed for contactInfo, UPI, passcode)
  await AdminPanelEngine._loadSettings();
  contactInfo = AdminPanelEngine.getContactInfo();

  try { users    = await AuthSubscriptionEngine.getUsers(); }    catch {}
  try { plans    = AuthSubscriptionEngine.getPlans();       }    catch {}
  try { payments = await AdminPanelEngine.getPayments();    }    catch {}

  const supaConfig   = window.NeonEngine ? NeonEngine.getConfig() : {};
  const totalRevenue = payments.reduce((acc, p) => acc + (parseFloat(p.amountINR) || 0), 0);
  const activeUsers  = users.filter(u => u.status === 'active').length;
  const proUsers     = users.filter(u => u.planId !== 'free').length;
  const enabledTools = (AdminPanelEngine.getEnabledFeatures() || (window.TOOLS || []).map(t => t.id)).length;

  // ── Shell ───────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50">

      <!-- Top Bar -->
      <header class="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-sm shadow-md">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <h1 class="font-extrabold text-slate-900 text-sm leading-none">Admin Dashboard</h1>
              <p class="text-[10px] text-slate-400 leading-none mt-0.5">StudioSuite PRO — Control Panel</p>
            </div>
          </div>

          <nav class="flex items-center gap-1 ml-4 overflow-x-auto" id="admin-tab-nav">
            ${[
              { id: 'overview',  icon: 'fa-gauge-high',  label: 'Overview'  },
              { id: 'users',     icon: 'fa-users',        label: 'Users'     },
              { id: 'payments',  icon: 'fa-receipt',      label: 'Payments'  },
              { id: 'plans',     icon: 'fa-crown',        label: 'Plans'     },
              { id: 'tools',     icon: 'fa-toggle-on',    label: 'Tools'     },
              { id: 'settings',  icon: 'fa-sliders',      label: 'Settings'  },
            ].map((tab, i) => `
              <button onclick="adminSwitchTab('${tab.id}')"
                id="admin-tab-btn-${tab.id}"
                class="admin-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}">
                <i class="fa-solid ${tab.icon} text-[11px]"></i>${tab.label}
              </button>`).join('')}
          </nav>

          <div class="ml-auto flex items-center gap-2 flex-shrink-0">
            <a href="#" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-eye"></i><span class="hidden sm:inline">View Site</span>
            </a>
            <button onclick="handleFullAdminLogout()"
              class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition flex items-center gap-1.5">
              <i class="fa-solid fa-right-from-bracket"></i><span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Tab Content -->
      <main class="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">

        <!-- ══ OVERVIEW TAB ═════════════════════════════════════════════ -->
        <div id="admin-tab-overview" class="admin-tab-content space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${[
              { label:'Total Revenue',    value:`₹${totalRevenue.toLocaleString()}`, icon:'fa-indian-rupee-sign', color:'from-emerald-500 to-teal-600',   bg:'bg-emerald-50', text:'text-emerald-700' },
              { label:'Registered Users', value:users.length,                        icon:'fa-users',             color:'from-indigo-500 to-violet-600',   bg:'bg-indigo-50',  text:'text-indigo-700' },
              { label:'PRO Subscribers',  value:proUsers,                             icon:'fa-crown',             color:'from-amber-500 to-orange-500',    bg:'bg-amber-50',   text:'text-amber-700'  },
              { label:'Active Tools',     value:enabledTools,                         icon:'fa-toolbox',           color:'from-purple-500 to-pink-600',     bg:'bg-purple-50',  text:'text-purple-700' },
            ].map(s => `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center text-xl shadow-md flex-shrink-0">
                  <i class="fa-solid ${s.icon}"></i>
                </div>
                <div>
                  <p class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">${s.label}</p>
                  <p class="text-2xl font-black ${s.text} mt-0.5">${s.value}</p>
                </div>
              </div>`).join('')}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-users text-indigo-600"></i> Recent Users</h3>
                <button onclick="adminSwitchTab('users')" class="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
              </div>
              <div class="space-y-2">
                ${users.slice(0, 5).map(u => `
                  <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      ${(u.name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-900 truncate">${u.name || u.email}</p>
                      <p class="text-[10px] text-slate-400 truncate">${u.email}</p>
                    </div>
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${u.planId !== 'free' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">${u.planId}</span>
                  </div>`).join('') || '<p class="text-xs text-slate-400 italic text-center py-4">No users yet</p>'}
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-receipt text-emerald-600"></i> Recent Payments</h3>
                <button onclick="adminSwitchTab('payments')" class="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
              </div>
              <div class="space-y-2">
                ${payments.slice(0, 5).map(p => `
                  <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">₹</div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-900 truncate">${p.userEmail}</p>
                      <p class="text-[10px] text-slate-400">${new Date(p.timestamp).toLocaleDateString()} · ${p.planName || p.planId}</p>
                    </div>
                    <span class="text-sm font-black text-emerald-700 flex-shrink-0">₹${p.amountINR}</span>
                  </div>`).join('') || '<p class="text-xs text-slate-400 italic text-center py-4">No payments yet</p>'}
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl ${supaConfig && supaConfig.url ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center text-lg flex-shrink-0">
              <i class="fa-solid ${supaConfig && supaConfig.url ? 'fa-database' : 'fa-exclamation-triangle'}"></i>
            </div>
            <div>
              <p class="text-xs font-extrabold text-slate-900">Neon Postgres API</p>
              <p class="text-[11px] text-slate-500">${supaConfig && supaConfig.url ? `Connected — ${supaConfig.url.slice(0, 60)}` : 'Not configured.'}</p>
            </div>
            <button onclick="adminSwitchTab('settings')" class="ml-auto text-xs font-bold text-indigo-600 hover:underline flex-shrink-0">Settings →</button>
          </div>
        </div>

        <!-- ══ USERS TAB ════════════════════════════════════════════════ -->
        <div id="admin-tab-users" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex flex-wrap justify-between items-center p-5 border-b border-slate-100 gap-3">
              <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-users text-indigo-600"></i> User Accounts
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">${users.length} total</span>
              </h3>
              <button onclick="openAddUserModal()" class="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                <i class="fa-solid fa-user-plus"></i> Add User
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th class="p-4">User</th>
                    <th class="p-4">Plan</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Expires</th>
                    <th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${users.length > 0 ? users.map(u => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                            ${(u.name || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p class="font-extrabold text-slate-900">${u.name || '—'}</p>
                            <p class="text-[10px] text-slate-400 font-normal">${u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${u.planId !== 'free' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                          ${u.planId !== 'free' ? '<i class="fa-solid fa-crown text-amber-500"></i>' : '<i class="fa-solid fa-user"></i>'} ${u.planId}
                        </span>
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${u.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}">
                          <span class="w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'} flex-shrink-0"></span>
                          ${u.status || 'active'}
                        </span>
                      </td>
                      <td class="p-4 text-slate-500 font-medium">${u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : '—'}</td>
                      <td class="p-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button onclick="changeAdminUserPlan('${u.id}')"
                            class="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition">
                            <i class="fa-solid fa-pen mr-1"></i>Plan
                          </button>
                          <button onclick="deleteAdminUser('${u.id}')"
                            class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition">
                            <i class="fa-solid fa-trash-can mr-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>`).join('') : `
                    <tr><td colspan="5" class="p-8 text-center text-slate-400 italic text-xs">
                      <i class="fa-solid fa-users text-slate-300 text-3xl mb-3 block"></i>
                      No users registered yet.
                    </td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ══ PAYMENTS TAB ═════════════════════════════════════════════ -->
        <div id="admin-tab-payments" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex flex-wrap justify-between items-center p-5 border-b border-slate-100 gap-3">
              <div class="flex items-center gap-3">
                <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-receipt text-emerald-600"></i> Payment Transactions (₹ INR)
                </h3>
                <div class="flex gap-2">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${payments.length} transactions</span>
                  <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white text-slate-900 border border-slate-200">₹${totalRevenue.toLocaleString()} total</span>
                </div>
              </div>
              ${payments.length > 0 ? `
              <button onclick="if(confirm('Delete ALL payment records? This is permanent.')) { AdminPanelEngine.clearAllPayments().then(() => renderFullAdminPage()); }"
                class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5">
                <i class="fa-solid fa-trash-can"></i> Clear All
              </button>` : ''}
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th class="p-4">Transaction ID</th>
                    <th class="p-4">Subscriber</th>
                    <th class="p-4">Plan</th>
                    <th class="p-4">Amount</th>
                    <th class="p-4">Date</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${payments.length > 0 ? payments.map(p => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4 font-mono text-[10px] text-slate-600 max-w-[120px] truncate">${p.txId || 'N/A'}</td>
                      <td class="p-4 font-semibold text-slate-900">${p.userEmail}</td>
                      <td class="p-4"><span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">${p.planName || p.planId}</span></td>
                      <td class="p-4 font-extrabold text-emerald-700 text-sm">₹${p.amountINR}</td>
                      <td class="p-4 text-slate-500">${new Date(p.timestamp).toLocaleString()}</td>
                      <td class="p-4"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[10px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Verified</span></td>
                      <td class="p-4 text-right">
                        <button onclick="if(confirm('Delete this transaction record?')) { AdminPanelEngine.deletePayment('${p.txId}').then(() => renderFullAdminPage()); }"
                          class="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-100 transition flex items-center gap-1 ml-auto">
                          <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                      </td>
                    </tr>`).join('') : `
                    <tr><td colspan="7" class="p-8 text-center text-slate-400 italic text-xs">
                      <i class="fa-solid fa-receipt text-slate-300 text-3xl mb-3 block"></i>
                      No payment records yet.
                    </td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ══ PLANS TAB ════════════════════════════════════════════════ -->
        <div id="admin-tab-plans" class="admin-tab-content hidden space-y-5">
          <div class="flex justify-between items-center">
            <h3 class="font-extrabold text-base text-slate-900">Subscription Plans (₹ INR)</h3>
            <button onclick="openAddPlanModal()" class="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md">
              <i class="fa-solid fa-plus"></i> New Plan
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${plans.map(p => `
              <div class="bg-white rounded-2xl border ${p.id === 'pro-monthly' ? 'border-indigo-300 ring-2 ring-indigo-200 shadow-lg' : 'border-slate-200 shadow-sm'} p-5 space-y-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.id !== 'free' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">${p.badge || p.id}</span>
                    <h4 class="font-extrabold text-slate-900 text-sm mt-1.5">${p.name}</h4>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-black text-slate-900">₹${p.priceINR}</p>
                    <p class="text-[10px] text-slate-400">${p.durationDays >= 365 ? 'per year' : p.durationDays > 1 ? 'per month' : 'one-time'}</p>
                  </div>
                </div>
                <div class="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
                  <div class="flex items-center gap-2"><i class="fa-solid fa-calendar text-indigo-500 w-4"></i> ${p.durationDays} days duration</div>
                  <div class="flex items-center gap-2"><i class="fa-solid fa-upload text-indigo-500 w-4"></i> ${p.maxFileSizeMB} MB max file size</div>
                </div>
                ${Array.isArray(p.features) && p.features.length ? `
                <ul class="text-[11px] text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  ${p.features.slice(0, 3).map(f => `<li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500 flex-shrink-0"></i>${f}</li>`).join('')}
                  ${p.features.length > 3 ? `<li class="text-slate-400 text-[10px]">+${p.features.length - 3} more features…</li>` : ''}
                </ul>` : ''}
                <div class="flex gap-2 pt-2 border-t border-slate-100">
                  <button onclick="openAddPlanModal('${p.id}')"
                    class="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  ${p.id !== 'free' ? `
                  <button onclick="if(confirm('Delete plan ${p.name}?')) { AdminPanelEngine.deletePlan('${p.id}'); renderFullAdminPage(); }"
                    class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>` : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- ══ TOOLS TAB ════════════════════════════════════════════════ -->
        <div id="admin-tab-tools" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-toggle-on text-indigo-600"></i> Tool Visibility
                </h3>
                <p class="text-[11px] text-slate-500 mt-0.5">Toggle which tools are visible to users on the main website.</p>
              </div>
              <div class="flex gap-2">
                <button onclick="adminEnableAllFeatures()"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm">
                  <i class="fa-solid fa-check-double"></i> Enable All
                </button>
                <button onclick="adminDisableAllFeatures()"
                  class="px-4 py-2 bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5">
                  <i class="fa-solid fa-ban"></i> Disable All
                </button>
              </div>
            </div>
            <div id="admin-feature-list" class="max-h-[520px] overflow-y-auto pr-1 space-y-1">
              ${renderAdminFeatureList()}
            </div>
          </div>
        </div>

        <!-- ══ SETTINGS TAB ═════════════════════════════════════════════ -->
        <div id="admin-tab-settings" class="admin-tab-content hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- UPI Settings -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <i class="fa-solid fa-qrcode text-emerald-600"></i> Payment UPI Settings
              </h3>
              <form onsubmit="handleSaveAdminUpi(event)" class="space-y-3">
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Receiving UPI ID (VPA)</label>
                  <input type="text" id="admin-upi-input" class="custom-input w-full text-sm font-mono font-bold"
                    value="${AdminPanelEngine.getAdminUpi()}" placeholder="merchant@upi or 9876543210@paytm" required>
                  <p class="text-[10px] text-slate-400 mt-1">Subscribers scan a QR for this UPI ID when paying for plans.</p>
                </div>
                <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                  <i class="fa-solid fa-floppy-disk"></i> Save UPI ID
                </button>
              </form>
            </div>

            <!-- Admin passcode -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <i class="fa-solid fa-lock text-indigo-600"></i> Admin Passcode
              </h3>
              <form onsubmit="handleChangeAdminPasscode(event)" class="space-y-3">
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">New Passcode</label>
                  <input type="password" id="admin-new-passcode" class="custom-input w-full text-sm font-mono" placeholder="Enter new passcode" required minlength="4">
                </div>
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Confirm Passcode</label>
                  <input type="password" id="admin-confirm-passcode" class="custom-input w-full text-sm font-mono" placeholder="Confirm new passcode" required minlength="4">
                </div>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                  <i class="fa-solid fa-key"></i> Update Passcode
                </button>
              </form>
            </div>

            <!-- Contact / Footer settings -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-2">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <i class="fa-solid fa-location-dot text-indigo-600"></i> Website Footer & Contact Details
              </h3>
              <form onsubmit="handleSaveContactInfo(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Company Name</label>
                  <input type="text" id="contact-company" class="custom-input w-full text-xs" value="${contactInfo.company || ''}" required>
                </div>
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Support Email</label>
                  <input type="email" id="contact-email" class="custom-input w-full text-xs" value="${contactInfo.email || ''}" required>
                </div>
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Phone Number</label>
                  <input type="text" id="contact-phone" class="custom-input w-full text-xs" value="${contactInfo.phone || ''}" required>
                </div>
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Operating Hours</label>
                  <input type="text" id="contact-hours" class="custom-input w-full text-xs" value="${contactInfo.hours || ''}" required>
                </div>
                <div class="sm:col-span-2">
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Physical Address</label>
                  <input type="text" id="contact-address" class="custom-input w-full text-xs" value="${contactInfo.address || ''}" required>
                </div>
                <div class="sm:col-span-2">
                  <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5">
                    <i class="fa-solid fa-floppy-disk"></i> Save Contact Details
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </main>
    </div>`;

  // Wire up tab switching
  window.adminSwitchTab = function(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
      btn.classList.add('text-slate-500');
    });
    const content = document.getElementById(`admin-tab-${tabId}`);
    const btn     = document.getElementById(`admin-tab-btn-${tabId}`);
    if (content) content.classList.remove('hidden');
    if (btn) {
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
      btn.classList.remove('text-slate-500');
    }
  };
  window.adminSwitchTab('overview');
}

window.renderFullAdminPage = renderFullAdminPage;

// ── Admin event handlers ───────────────────────────────────────────────────

window.handleChangeAdminPasscode = async function(e) {
  e.preventDefault();
  const newPc  = document.getElementById('admin-new-passcode')?.value?.trim();
  const confPc = document.getElementById('admin-confirm-passcode')?.value?.trim();
  if (!newPc || newPc.length < 4) { alert('Passcode must be at least 4 characters.'); return; }
  if (newPc !== confPc) { alert('Passcodes do not match.'); return; }
  try {
    await AdminPanelEngine.setPasscode(newPc);
    if (window.showToast) showToast('Admin passcode updated!', 'success');
    else alert('Passcode updated successfully!');
  } catch (e) { alert('Failed to save passcode: ' + e.message); }
};

window.handleFullAdminLogin = async function(e) {
  e.preventDefault();
  const code = document.getElementById('admin-page-passcode')?.value;
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Verifying...'; }

  const ok = await AdminPanelEngine.adminLogin(code);
  if (ok) {
    renderFullAdminPage();
  } else {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-unlock"></i> Unlock Dashboard'; }
    const input = document.getElementById('admin-page-passcode');
    if (input) { input.value = ''; input.classList.add('border-red-400', 'bg-red-50'); setTimeout(() => input.classList.remove('border-red-400', 'bg-red-50'), 1500); }
    if (window.showToast) showToast('Incorrect passcode.', 'error');
    else alert('Incorrect passcode');
  }
};

window.handleFullAdminLogout = function() {
  AdminPanelEngine.adminLogout();
  renderFullAdminPage();
};

window.handleSaveAdminUpi = async function(e) {
  e.preventDefault();
  const upi = document.getElementById('admin-upi-input')?.value?.trim();
  if (!upi) return;
  try {
    await AdminPanelEngine.setAdminUpi(upi);
    if (window.showToast) showToast('UPI ID saved!', 'success');
  } catch (err) { alert('Failed to save UPI: ' + err.message); }
};

window.handleSaveContactInfo = async function(e) {
  e.preventDefault();
  try {
    await AdminPanelEngine.saveContactInfo({
      company: document.getElementById('contact-company')?.value?.trim() || '',
      email:   document.getElementById('contact-email')?.value?.trim()   || '',
      phone:   document.getElementById('contact-phone')?.value?.trim()   || '',
      hours:   document.getElementById('contact-hours')?.value?.trim()   || '',
      address: document.getElementById('contact-address')?.value?.trim() || '',
    });
    if (window.renderFooterContact) renderFooterContact();
    if (window.showToast) showToast('Contact info updated!', 'success');
  } catch (err) { alert('Failed to save contact info: ' + err.message); }
};

window.deleteAdminUser = async function(userId) {
  if (!confirm('Permanently delete this user? This cannot be undone.')) return;
  try {
    await AuthSubscriptionEngine.deleteUser(userId);
    const current = AuthSubscriptionEngine.getCurrentUser();
    if (current && current.id === userId) {
      AuthSubscriptionEngine._setCurrentUser(null);
      if (AuthSubscriptionEngine.renderHeaderAuthControls) AuthSubscriptionEngine.renderHeaderAuthControls();
    }
    renderFullAdminPage();
    if (window.showToast) showToast('User deleted.', 'success');
  } catch (err) { alert(err.message || 'Delete failed'); }
};

window.changeAdminUserPlan = async function(userId) {
  const plans = AuthSubscriptionEngine.getPlans();
  const planOptions = plans.map(p => `${p.id} — ${p.name} (₹${p.priceINR})`).join('\n');
  const selectedPlanId = prompt(`Change user plan.\n\nAvailable plans:\n${planOptions}\n\nEnter plan ID:`);
  if (selectedPlanId) {
    try {
      await AuthSubscriptionEngine.subscribeUser(userId, selectedPlanId, 'ADMIN_MANUAL_ASSIGN');
      renderFullAdminPage();
      if (AuthSubscriptionEngine.renderHeaderAuthControls) AuthSubscriptionEngine.renderHeaderAuthControls();
      if (window.showToast) showToast(`Plan updated to ${selectedPlanId}!`, 'success');
    } catch (err) { alert(err.message || 'Failed to assign plan'); }
  }
};

window.openAddUserModal = function() {
  const email = prompt('Enter User Email:');
  if (!email) return;
  const name = prompt('Enter Full Name:', 'User');
  const planId = prompt('Select Plan ID (free, pro-monthly, pro-yearly):', 'pro-monthly');
  if (window.AuthSubscriptionEngine) {
    AuthSubscriptionEngine.register(email, 'password123', name).then(user => {
      if (planId && planId !== 'free') {
        return AuthSubscriptionEngine.subscribeUser(user.id, planId, 'ADMIN_MANUAL');
      }
    }).then(() => {
      renderFullAdminPage();
      if (window.showToast) showToast('User added!', 'success');
    }).catch(e => { alert(e.message); });
  }
};

// ── Feature list renderer ─────────────────────────────────────────────────

function renderAdminFeatureList() {
  const tools = window.TOOLS || [];
  if (!tools || tools.length === 0) {
    return `<p class="text-xs text-slate-400 italic text-center py-4">Loading tools list...</p>`;
  }

  const categories = {};
  tools.forEach(t => {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category].push(t);
  });

  const catLabels = {
    'pdf-core': 'Core PDF',
    'pdf-convert': 'Conversions',
    'image-tools': 'Image & Raster',
    'design-prepress': 'Vector & Design',
    'print-packaging': 'Prepress & Packaging',
    'video-motion': 'Video & Motion',
    'fonts-typography': 'Typography & Fonts',
    'developer-tools': 'Web & Developer',
    'cad-blueprints': 'CAD & Architectural',
    'legal-medical': 'Legal & Medical',
    'publishing-ebooks': 'E-Books & Publishing',
    'threed-motion': '3D & Motion Assets',
    'security-ai-data': 'Security & AI',
  };

  let html = '';
  Object.keys(categories).forEach(cat => {
    html += `<div class="mt-3 first:mt-0">
      <div class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 px-1">${catLabels[cat] || cat}</div>`;
    categories[cat].forEach(tool => {
      const isEnabled = AdminPanelEngine.isFeatureEnabled(tool.id);
      html += `<label class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-r ${tool.color} text-white flex items-center justify-center text-[10px] shadow-sm flex-shrink-0">
            <i class="fa-solid ${tool.icon}"></i>
          </div>
          <div class="min-w-0">
            <div class="text-[11px] font-bold text-slate-800 truncate">${tool.name}</div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="adminToggleFeature('${tool.id}', this.checked)" class="sr-only peer">
          <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </label>`;
    });
    html += `</div>`;
  });

  const enabledIds = AdminPanelEngine.getEnabledFeatures() || [];
  const totalCount = tools.length;
  html = `<div class="text-[11px] font-bold text-slate-600 mb-2 px-1 flex justify-between">
    <span><i class="fa-solid fa-sliders text-indigo-600"></i> ${enabledIds.length} / ${totalCount} tools enabled</span>
  </div>` + html;

  return html;
}

window.renderAdminFeatureList = renderAdminFeatureList;

// ── Plan CRUD modal ────────────────────────────────────────────────────────


// -----------------------------------------------------------------------------
// Plan Create / Edit Modal � full tool assignment + DB-persisted save/delete
// -----------------------------------------------------------------------------

window.openAddPlanModal = function(planIdToEdit) {
  planIdToEdit = planIdToEdit || null;
  var modalId = 'admin-plan-crud-modal';
  var existing = document.getElementById(modalId);
  if (existing) existing.remove();

  var plans = AuthSubscriptionEngine.getPlans();
  var editPlan = planIdToEdit ? plans.find(function(p){ return p.id === planIdToEdit; }) : null;
  var tools = window.TOOLS || [];

  var initialFeatures = (editPlan && Array.isArray(editPlan.features))
    ? editPlan.features.join('\n') : '';

  var rawAllowed = editPlan ? editPlan.allowedToolIds : 'all';
  var isAllAll = (!rawAllowed || rawAllowed === 'all');
  var allowedSet = Array.isArray(rawAllowed) ? new Set(rawAllowed) : new Set();

  var catLabels = {
    'pdf-core':'Core PDF','pdf-convert':'Conversions','image-tools':'Image & Raster',
    'design-prepress':'Vector & Design','print-packaging':'Prepress & Packaging',
    'video-motion':'Video & Motion','fonts-typography':'Typography & Fonts',
    'developer-tools':'Web & Developer','cad-blueprints':'CAD & Architectural',
    'legal-medical':'Legal & Medical','publishing-ebooks':'E-Books & Publishing',
    'threed-motion':'3D & Motion','security-ai-data':'Security & AI'
  };
  var cats = {};
  tools.forEach(function(t){ if (!cats[t.category]) cats[t.category] = []; cats[t.category].push(t); });

  var toolHtml = Object.keys(cats).map(function(cat){
    var rows = cats[cat].map(function(tool){
      var chk = (isAllAll || allowedSet.has(tool.id)) ? 'checked' : '';
      return '<label class="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-[11px] font-medium text-slate-700 plan-tool-row-'+cat+'">' +
        '<input type="checkbox" name="plan-tool-ids" value="'+tool.id+'" '+chk+
        ' class="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0 plan-chk-'+cat+'">' +
        '<span class="truncate" title="'+tool.name+'">'+tool.name+'</span></label>';
    }).join('');
    return '<div class="mb-3"><div class="flex items-center justify-between mb-1">'+
      '<span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">'+(catLabels[cat]||cat)+'</span>'+
      '<span class="flex gap-1 text-[9px]">'+
      '<button type="button" onclick="adminPlanSelCat(\''+cat+'\',true)" class="text-indigo-600 font-bold hover:underline">All</button>'+
      '&nbsp;/&nbsp;'+
      '<button type="button" onclick="adminPlanSelCat(\''+cat+'\',false)" class="text-slate-400 font-bold hover:underline">None</button>'+
      '</span></div>'+
      '<div class="grid grid-cols-2 gap-0.5">'+rows+'</div></div>';
  }).join('');

  var editName    = editPlan ? (editPlan.name||'') : '';
  var editPrice   = editPlan ? (editPlan.priceINR||0) : '499';
  var editDur     = editPlan ? (editPlan.durationDays||30) : '30';
  var editSize    = editPlan ? (editPlan.maxFileSizeMB||25) : '250';
  var editBadge   = editPlan ? (editPlan.badge||'') : 'PRO';
  var deleteBtnHtml = (editPlan && editPlan.id !== 'free')
    ? '<button type="button" onclick="if(confirm(\'Delete plan '+editName+'? This is permanent.\')){ adminDeletePlan(\''+editPlan.id+'\'); document.getElementById(\''+modalId+'\').remove(); }" class="text-xs font-bold text-red-500 hover:text-red-700 underline flex items-center gap-1"><i class="fa-solid fa-trash-can"></i> Delete Plan</button>'
    : '<div></div>';

  var modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in';
  modal.innerHTML =
    '<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden relative">' +
      '<button onclick="document.getElementById(\''+modalId+'\').remove()" class="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition"><i class="fa-solid fa-xmark"></i></button>' +
      // Header
      '<div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex-shrink-0">' +
        '<h3 class="text-base font-extrabold flex items-center gap-2"><i class="fa-solid fa-crown text-amber-400"></i> ' +
        (editPlan ? 'Edit Plan � '+editPlan.name : 'Create New Subscription Plan') + '</h3>' +
        '<p class="text-[11px] text-indigo-300 mt-0.5">Changes are saved directly to Neon Postgres.</p>' +
      '</div>' +
      // Form
      '<form id="plan-edit-form" onsubmit="handleSavePlanSubmit(event,\''+( editPlan ? editPlan.id : '' )+'\')" class="flex flex-col flex-1 overflow-hidden">' +
        '<div class="flex-1 overflow-y-auto">' +
          '<div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">' +
            // Left: plan details
            '<div class="p-5 space-y-4">' +
              '<h4 class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-pen-to-square text-indigo-500"></i> Plan Details</h4>' +
              '<div class="grid grid-cols-2 gap-3">' +
                '<div class="col-span-2"><label class="text-[10px] font-bold text-slate-500 uppercase">Plan Name *</label><input type="text" id="plan-input-name" required value="'+editName+'" placeholder="e.g. Pro Monthly" class="custom-input w-full text-sm font-bold mt-1"></div>' +
                '<div><label class="text-[10px] font-bold text-slate-500 uppercase">Price (INR ?) *</label><div class="relative mt-1"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">?</span><input type="number" id="plan-input-price" required min="0" step="1" value="'+editPrice+'" class="custom-input w-full pl-7 text-sm font-extrabold"></div></div>' +
                '<div><label class="text-[10px] font-bold text-slate-500 uppercase">Duration (days) *</label><input type="number" id="plan-input-duration" required min="1" value="'+editDur+'" class="custom-input w-full text-sm font-bold mt-1"></div>' +
                '<div><label class="text-[10px] font-bold text-slate-500 uppercase">Max File Size (MB)</label><input type="number" id="plan-input-maxsize" required min="1" value="'+editSize+'" class="custom-input w-full text-sm font-bold mt-1"></div>' +
                '<div><label class="text-[10px] font-bold text-slate-500 uppercase">Badge Label</label><input type="text" id="plan-input-badge" value="'+editBadge+'" placeholder="Popular" class="custom-input w-full text-sm mt-1"></div>' +
              '</div>' +
              '<div><label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Marketing Features <span class="text-slate-400 font-normal normal-case">(one per line)</span></label>' +
              '<textarea id="plan-input-features" rows="5" placeholder="All 50 Tools Unlocked&#10;250MB File Limit&#10;Priority Support" class="custom-input w-full text-xs font-mono resize-y">'+initialFeatures+'</textarea></div>' +
            '</div>' +
            // Right: tool access
            '<div class="p-5">' +
              '<div class="flex items-center justify-between mb-2">' +
                '<h4 class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-toolbox text-indigo-500"></i> Tool Access for this Plan</h4>' +
                '<div class="flex gap-1.5"><button type="button" onclick="adminPlanSelAll(true)" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">All</button>' +
                '<button type="button" onclick="adminPlanSelAll(false)" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200">None</button></div>' +
              '</div>' +
              '<div class="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-[11px] text-indigo-800 font-semibold mb-3"><i class="fa-solid fa-circle-info text-indigo-500 mr-1"></i> Checked = accessible. Unchecked = shows locked badge with plan name.</div>' +
              '<div id="plan-tool-checkboxes" class="max-h-[380px] overflow-y-auto pr-1">'+toolHtml+'</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        // Footer
        '<div class="flex-shrink-0 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3 bg-slate-50/80">' +
          deleteBtnHtml +
          '<div class="flex gap-3 items-center">' +
            '<button type="button" onclick="document.getElementById(\''+modalId+'\').remove()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition">Cancel</button>' +
            '<button type="submit" id="plan-save-btn" class="btn-gradient px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2"><i class="fa-solid fa-floppy-disk"></i> '+(editPlan?'Save Changes':'Create Plan')+'</button>' +
          '</div>' +
        '</div>' +
      '</form>' +
    '</div>';
  document.body.appendChild(modal);

  window.adminPlanSelAll = function(val) {
    modal.querySelectorAll('input[name="plan-tool-ids"]').forEach(function(cb){ cb.checked = val; });
  };
  window.adminPlanSelCat = function(cat, val) {
    modal.querySelectorAll('input.plan-chk-'+cat+'[name="plan-tool-ids"]').forEach(function(cb){ cb.checked = val; });
  };
};

window.handleSavePlanSubmit = async function(e, editPlanId) {
  e.preventDefault();
  var btn = document.getElementById('plan-save-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Saving...'; }

  var name          = (document.getElementById('plan-input-name')?.value || '').trim();
  var priceINR      = parseFloat(document.getElementById('plan-input-price')?.value || 0);
  var durationDays  = parseInt(document.getElementById('plan-input-duration')?.value || 30);
  var maxFileSizeMB = parseInt(document.getElementById('plan-input-maxsize')?.value || 25);
  var badge         = (document.getElementById('plan-input-badge')?.value || '').trim();
  var featuresText  = document.getElementById('plan-input-features')?.value || '';
  var features      = featuresText.split('\n').map(function(f){ return f.trim(); }).filter(Boolean);

  var checkedBoxes = Array.from(document.querySelectorAll('input[name="plan-tool-ids"]:checked'));
  var allBoxes     = Array.from(document.querySelectorAll('input[name="plan-tool-ids"]'));
  var allowedToolIds = (checkedBoxes.length === allBoxes.length)
    ? 'all'
    : checkedBoxes.map(function(cb){ return cb.value; });

  var planData = {
    id: editPlanId || ('plan_' + Date.now()),
    name, priceINR, durationDays, maxFileSizeMB, badge, features, allowedToolIds
  };

  try {
    await AdminPanelEngine.savePlan(planData);
    document.getElementById('admin-plan-crud-modal')?.remove();
    if (window.showToast) showToast('Plan "'+name+'" saved!', 'success');
    renderFullAdminPage().then(function(){ if (window.adminSwitchTab) adminSwitchTab('plans'); });
  } catch(err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Changes'; }
    if (window.showToast) showToast('Save failed: '+(err.message||err), 'error');
    else alert('Save failed: '+(err.message||err));
  }
};

window.adminDeletePlan = async function(planId) {
  try {
    await AdminPanelEngine.deletePlan(planId);
    if (window.showToast) showToast('Plan deleted.', 'success');
    renderFullAdminPage().then(function(){ if (window.adminSwitchTab) adminSwitchTab('plans'); });
  } catch(err) {
    if (window.showToast) showToast('Delete failed: '+(err.message||err), 'error');
    else alert('Delete failed: '+(err.message||err));
  }
};