/**
 * StudioSuite Pro — Admin Panel Engine & Dashboard UI
 * All data: Neon Postgres via NeonEngine API. Only admin session in localStorage.
 */

class AdminPanelEngine {
  static STORAGE_ADMIN_SESSION = 'studiosuite_admin_session';
  static _featuresCache = null;
  static _settingsCache = null;

  // ── Session ───────────────────────────────────────────────────────────────
  static isAdminLoggedIn() {
    return localStorage.getItem(this.STORAGE_ADMIN_SESSION) === 'true';
  }
  static async adminLogin(passcode) {
    try {
      const settings = await this._fetchFreshSettings();
      const stored = settings['admin_passcode'] || 'admin123';
      if (passcode === stored) { localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true'); return true; }
      return false;
    } catch { if (passcode === 'admin123') { localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true'); return true; } return false; }
  }
  static adminLogout() { localStorage.removeItem(this.STORAGE_ADMIN_SESSION); }

  // ── Settings: always fetch fresh from DB (no stale cache on admin pages) ──
  static async _fetchFreshSettings() {
    try {
      const settings = await NeonEngine.call('/api/settings', 'GET');
      this._settingsCache = settings;
      NeonEngine._settingsCache = settings;
      return settings;
    } catch (e) {
      console.warn('[Admin] _fetchFreshSettings failed:', e.message);
      return this._settingsCache || {};
    }
  }
  /** Used by non-admin code that just needs a cached read */
  static async _loadSettings() { return this._fetchFreshSettings(); }

  static async _saveSetting(key, value) {
    await NeonEngine.call('/api/settings', 'POST', { key, value });
    if (!this._settingsCache) this._settingsCache = {};
    this._settingsCache[key] = value;
    if (NeonEngine._settingsCache) NeonEngine._settingsCache[key] = value;
  }

  static getAdminUpi()  { return this._settingsCache?.['admin_upi'] || 'merchant@upi'; }
  static getPasscode()  { return this._settingsCache?.['admin_passcode'] || 'admin123'; }
  static getContactInfo() {
    try {
      const raw = this._settingsCache?.['footer_contact'];
      if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {}
    return { company:'StudioSuite PRO',address:'',phone:'',email:'',hours:'' };
  }

  static async setAdminUpi(v)     { await this._saveSetting('admin_upi', (v||'').trim()); }
  static async setPasscode(v)     { await this._saveSetting('admin_passcode', v); }
  static async saveContactInfo(i) { await this._saveSetting('footer_contact', JSON.stringify(i)); }

  // ── Features ──────────────────────────────────────────────────────────────
  static getAllToolIds() { return (window.TOOLS||[]).map(t=>t.id); }

  static getEnabledFeatures() {
    const cache = this._featuresCache || NeonEngine._featuresCache;
    if (!cache) return null;
    const tools = this.getAllToolIds();
    if (!tools.length) return null;
    return tools.filter(id => cache[id] !== false);
  }
  static isFeatureEnabled(toolId) {
    const cache = this._featuresCache || NeonEngine._featuresCache;
    if (!cache) return true;
    return cache[toolId] !== false;
  }
  static async setFeatureEnabled(toolId, enabled) {
    await NeonEngine.call('/api/features/toggle', 'POST', { tool_id: toolId, enabled: !!enabled });
    const cache = this._featuresCache || NeonEngine._featuresCache || {};
    cache[toolId] = !!enabled;
    this._featuresCache = cache; NeonEngine._featuresCache = cache;
  }
  static async enableAllFeatures() {
    const all = this.getAllToolIds(); if (!all.length) return [];
    await NeonEngine.call('/api/features/enable-all', 'POST', { tool_ids: all });
    const cache = {}; all.forEach(id=>{ cache[id]=true; });
    this._featuresCache = cache; NeonEngine._featuresCache = cache;
    return all;
  }
  static async disableAllFeatures() {
    const all = this.getAllToolIds(); if (!all.length) return [];
    await NeonEngine.call('/api/features/disable-all', 'POST', { tool_ids: all });
    const cache = {}; all.forEach(id=>{ cache[id]=false; });
    this._featuresCache = cache; NeonEngine._featuresCache = cache;
    return [];
  }

  // ── Plans CRUD → Neon DB ──────────────────────────────────────────────────
  static async savePlan(planData) {
    const payload = {
      id: planData.id || ('plan_' + Date.now()),
      name: planData.name,
      price_inr: planData.priceINR ?? 0,
      duration_days: planData.durationDays || 30,
      max_file_size_mb: planData.maxFileSizeMB || 25,
      badge: planData.badge || '',
      features: planData.features || [],
      allowed_tool_ids: planData.allowedToolIds ?? 'all',
      currency: '₹',
    };
    const saved = await NeonEngine.call('/api/plans', 'POST', payload);
    const plans = AuthSubscriptionEngine._plansCache || [];
    const idx = plans.findIndex(p => p.id === saved.id);
    if (idx !== -1) plans[idx] = saved; else plans.push(saved);
    AuthSubscriptionEngine._plansCache = [...plans].sort((a,b) => (a.priceINR||0)-(b.priceINR||0));
    return saved;
  }
  static async deletePlan(planId) {
    if (planId === 'free') throw new Error('Cannot delete the default free plan');
    await NeonEngine.call('/api/plans/' + encodeURIComponent(planId), 'DELETE');
    if (AuthSubscriptionEngine._plansCache) {
      AuthSubscriptionEngine._plansCache = AuthSubscriptionEngine._plansCache.filter(p => p.id !== planId);
    }
  }

  // ── Payments → Neon DB ────────────────────────────────────────────────────
  static async getPayments() {
    try { return await NeonEngine.call('/api/payments', 'GET'); }
    catch (e) { console.warn('[Admin] getPayments:', e.message); return []; }
  }
  static async deletePayment(txId) {
    await NeonEngine.call('/api/payments/' + encodeURIComponent(txId), 'DELETE');
  }
  static async clearAllPayments() {
    await NeonEngine.call('/api/payments/all', 'DELETE');
  }
}

window.AdminPanelEngine = AdminPanelEngine;

// ── Feature toggle global helpers ─────────────────────────────────────────

window.adminToggleFeature = async function(toolId, enabled) {
  const cb = event && event.target;
  if (cb) cb.disabled = true;
  try {
    await AdminPanelEngine.setFeatureEnabled(toolId, enabled);
    if (window.renderTools) window.renderTools();
    window.dispatchEvent(new CustomEvent('featuresUpdated'));
    if (window.showToast) showToast((enabled ? 'Enabled: ' : 'Disabled: ') + toolId, 'success');
  } catch (e) {
    if (cb) { cb.checked = !enabled; cb.disabled = false; }
    if (window.showToast) showToast('Failed: ' + e.message, 'error');
  }
  if (cb) cb.disabled = false;
};

window.adminEnableAllFeatures = async function() {
  const btn = document.querySelector('[onclick="adminEnableAllFeatures()"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>Enabling...'; }
  try {
    await AdminPanelEngine.enableAllFeatures();
    const list = document.getElementById('admin-feature-list');
    if (list) list.innerHTML = renderAdminFeatureList();
    window.dispatchEvent(new CustomEvent('featuresUpdated'));
    if (window.renderTools) window.renderTools();
    if (window.showToast) showToast('All tools enabled!', 'success');
  } catch (e) { if (window.showToast) showToast('Failed: ' + e.message, 'error'); }
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check-double mr-1"></i> Enable All'; }
};

window.adminDisableAllFeatures = async function() {
  if (!confirm('Disable all tools? Users will see an empty tools page.')) return;
  const btn = document.querySelector('[onclick="adminDisableAllFeatures()"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>Disabling...'; }
  try {
    await AdminPanelEngine.disableAllFeatures();
    const list = document.getElementById('admin-feature-list');
    if (list) list.innerHTML = renderAdminFeatureList();
    window.dispatchEvent(new CustomEvent('featuresUpdated'));
    if (window.renderTools) window.renderTools();
    if (window.showToast) showToast('All tools disabled.', 'info');
  } catch (e) { if (window.showToast) showToast('Failed: ' + e.message, 'error'); }
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-ban mr-1"></i> Disable All'; }
};

// ── Full Admin Dashboard ──────────────────────────────────────────────────

async function renderFullAdminPage() {
  const container = document.getElementById('admin-page-view');
  if (!container) return;

  if (!AdminPanelEngine.isAdminLoggedIn()) {
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 px-4 py-12">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div class="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-3xl mx-auto mb-4">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-white">Admin Portal</h2>
            <p class="text-xs text-indigo-200 mt-1">Enter your passcode to access the control dashboard</p>
          </div>
          <div class="p-8 space-y-5">
            <form onsubmit="handleFullAdminLogin(event)" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <i class="fa-solid fa-key text-indigo-500 mr-1"></i> Admin Passcode
                </label>
                <div class="relative">
                  <input type="password" id="admin-page-passcode" class="custom-input w-full text-sm pr-10 tracking-widest font-mono" placeholder="••••••••" required autofocus>
                  <button type="button" onclick="const i=document.getElementById('admin-page-passcode');i.type=i.type==='password'?'text':'password'" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition">
                    <i class="fa-solid fa-eye text-xs"></i>
                  </button>
                </div>
                <p class="text-[10px] text-slate-400">Default: <code class="font-mono bg-slate-100 px-1 rounded">admin123</code></p>
              </div>
              <button type="submit" class="w-full btn-gradient py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg">
                <i class="fa-solid fa-unlock"></i> Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>`;
    return;
  }

  // Loading spinner
  container.innerHTML = `<div class="flex items-center justify-center min-h-screen"><div class="text-center text-indigo-600"><i class="fa-solid fa-circle-notch fa-spin text-4xl"></i><p class="text-sm font-bold mt-4 text-slate-500">Loading dashboard data from Neon…</p></div></div>`;

  // ── Fetch everything fresh from Neon DB ──────────────────────────────────
  // Force-clear caches so we always get live data
  AdminPanelEngine._settingsCache = null;
  NeonEngine._settingsCache = null;

  let users = [], plans = [], payments = [], settings = {};
  const results = await Promise.allSettled([
    AdminPanelEngine._fetchFreshSettings(),
    AuthSubscriptionEngine.getUsers(),
    AuthSubscriptionEngine.fetchPlans(),
    AdminPanelEngine.getPayments(),
  ]);
  settings = results[0].status === 'fulfilled' ? results[0].value : {};
  users    = results[1].status === 'fulfilled' ? results[1].value : [];
  plans    = results[2].status === 'fulfilled' ? results[2].value : (AuthSubscriptionEngine._plansCache || []);
  payments = results[3].status === 'fulfilled' ? results[3].value : [];

  // Re-read contact info from freshly loaded settings
  const contactInfo = AdminPanelEngine.getContactInfo();
  const adminUpi    = AdminPanelEngine.getAdminUpi();

  const totalRevenue = payments.reduce((a,p) => a+(parseFloat(p.amountINR)||0), 0);
  const proUsers     = users.filter(u => u.planId !== 'free').length;
  const enabledCount = (AdminPanelEngine.getEnabledFeatures() || (window.TOOLS||[]).map(t=>t.id)).length;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50">

      <!-- Sticky header -->
      <header class="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs shadow">
              <i class="fa-solid fa-crown"></i>
            </div>
            <span class="font-extrabold text-slate-900 text-sm hidden sm:inline">Admin Dashboard</span>
          </div>

          <nav id="admin-tab-nav" class="flex items-center gap-0.5 ml-2 overflow-x-auto flex-1">
            ${[
              { id:'overview', icon:'fa-gauge-high',  label:'Overview'  },
              { id:'users',    icon:'fa-users',        label:'Users'     },
              { id:'payments', icon:'fa-receipt',      label:'Payments'  },
              { id:'plans',    icon:'fa-crown',        label:'Plans'     },
              { id:'tools',    icon:'fa-toggle-on',    label:'Tools'     },
              { id:'settings', icon:'fa-sliders',      label:'Settings'  },
            ].map((t,i) => `
              <button onclick="adminSwitchTab('${t.id}')" id="admin-tab-btn-${t.id}"
                class="admin-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                  ${i===0 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}">
                <i class="fa-solid ${t.icon} text-[10px]"></i><span class="hidden sm:inline">${t.label}</span>
              </button>`).join('')}
          </nav>

          <div class="flex items-center gap-2 ml-auto flex-shrink-0">
            <a href="#" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition hidden sm:flex items-center gap-1">
              <i class="fa-solid fa-eye"></i> View Site
            </a>
            <button onclick="handleFullAdminLogout()" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition flex items-center gap-1">
              <i class="fa-solid fa-right-from-bracket"></i><span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">

        <!-- ══ OVERVIEW ══════════════════════════════════════════════════ -->
        <div id="admin-tab-overview" class="admin-tab-content space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${[
              { label:'Total Revenue',    value:'₹'+totalRevenue.toLocaleString(), icon:'fa-indian-rupee-sign', grad:'from-emerald-500 to-teal-600', txt:'text-emerald-700' },
              { label:'Registered Users', value:users.length,                       icon:'fa-users',             grad:'from-indigo-500 to-violet-600', txt:'text-indigo-700' },
              { label:'PRO Subscribers',  value:proUsers,                            icon:'fa-crown',             grad:'from-amber-500 to-orange-500',  txt:'text-amber-700'  },
              { label:'Active Tools',     value:enabledCount,                        icon:'fa-toolbox',           grad:'from-purple-500 to-pink-600',   txt:'text-purple-700' },
            ].map(s=>`
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center text-lg shadow-md flex-shrink-0"><i class="fa-solid ${s.icon}"></i></div>
                <div><p class="text-[10px] font-extrabold text-slate-400 uppercase">${s.label}</p><p class="text-2xl font-black ${s.txt}">${s.value}</p></div>
              </div>`).join('')}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- recent users -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-users text-indigo-600"></i> Recent Users</h3>
                <button onclick="adminSwitchTab('users')" class="text-xs text-indigo-600 font-bold hover:underline">All →</button>
              </div>
              ${users.slice(0,5).map(u=>`
                <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center">${(u.name||u.email||'U')[0].toUpperCase()}</div>
                  <div class="flex-1 min-w-0"><p class="text-xs font-bold text-slate-900 truncate">${u.name||u.email}</p><p class="text-[10px] text-slate-400 truncate">${u.email}</p></div>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${u.planId!=='free'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-600'}">${u.planId}</span>
                </div>`).join('')||'<p class="text-xs text-slate-400 italic text-center py-4">No users yet</p>'}
            </div>
            <!-- recent payments -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-receipt text-emerald-600"></i> Recent Payments</h3>
                <button onclick="adminSwitchTab('payments')" class="text-xs text-indigo-600 font-bold hover:underline">All →</button>
              </div>
              ${payments.slice(0,5).map(p=>`
                <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center">₹</div>
                  <div class="flex-1 min-w-0"><p class="text-xs font-bold text-slate-900 truncate">${p.userEmail||p.user_email||''}</p><p class="text-[10px] text-slate-400">${new Date(p.timestamp||p.verified_at||Date.now()).toLocaleDateString()} · ${p.planName||p.plan_name||p.planId||''}</p></div>
                  <span class="text-sm font-black text-emerald-700">₹${p.amountINR||p.amount_inr||0}</span>
                </div>`).join('')||'<p class="text-xs text-slate-400 italic text-center py-4">No payments yet</p>'}
            </div>
          </div>

          <!-- DB status -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i class="fa-solid fa-database"></i></div>
            <div><p class="text-xs font-extrabold text-slate-900">Neon Postgres — Live</p><p class="text-[11px] text-slate-400">All data reads/writes go directly to your Neon database.</p></div>
            <button onclick="adminSwitchTab('settings')" class="ml-auto text-xs text-indigo-600 font-bold hover:underline">Settings →</button>
          </div>
        </div>

        <!-- ══ USERS ══════════════════════════════════════════════════════ -->
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
                    <th class="p-4">User</th><th class="p-4">Plan</th><th class="p-4">Status</th><th class="p-4">Expires</th><th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${users.length ? users.map(u=>`
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4"><div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">${(u.name||u.email||'U')[0].toUpperCase()}</div>
                        <div><p class="font-extrabold text-slate-900">${u.name||'—'}</p><p class="text-[10px] text-slate-400">${u.email}</p></div>
                      </div></td>
                      <td class="p-4"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${u.planId!=='free'?'bg-amber-50 text-amber-800 border border-amber-200':'bg-slate-100 text-slate-600 border border-slate-200'}">
                        ${u.planId!=='free'?'<i class="fa-solid fa-crown text-amber-500"></i>':'<i class="fa-solid fa-user"></i>'} ${u.planId}
                      </span></td>
                      <td class="p-4"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${u.status==='active'?'bg-emerald-50 text-emerald-800 border border-emerald-200':'bg-red-50 text-red-700 border border-red-200'}">
                        <span class="w-1.5 h-1.5 rounded-full ${u.status==='active'?'bg-emerald-500':'bg-red-500'}"></span>${u.status||'active'}
                      </span></td>
                      <td class="p-4 text-slate-500">${u.expiresAt?new Date(u.expiresAt).toLocaleDateString():'—'}</td>
                      <td class="p-4 text-right"><div class="flex items-center justify-end gap-2">
                        <button onclick="changeAdminUserPlan('${u.id}')" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition"><i class="fa-solid fa-pen mr-1"></i>Plan</button>
                        <button onclick="deleteAdminUser('${u.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition"><i class="fa-solid fa-trash-can mr-1"></i>Delete</button>
                      </div></td>
                    </tr>`).join('') : `<tr><td colspan="5" class="p-10 text-center text-slate-400 italic text-xs"><i class="fa-solid fa-users text-slate-300 text-4xl mb-3 block"></i>No users registered yet.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ══ PAYMENTS ═══════════════════════════════════════════════════ -->
        <div id="admin-tab-payments" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex flex-wrap justify-between items-center p-5 border-b border-slate-100 gap-3">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2"><i class="fa-solid fa-receipt text-emerald-600"></i> Payment Transactions (₹ INR)</h3>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${payments.length} records</span>
                <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white text-slate-900 border border-slate-200">₹${totalRevenue.toLocaleString()} total</span>
              </div>
              ${payments.length ? `<button onclick="if(confirm('Delete ALL payment records?')){ AdminPanelEngine.clearAllPayments().then(()=>renderFullAdminPage()); }" class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5"><i class="fa-solid fa-trash-can"></i> Clear All</button>` : ''}
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th class="p-4">Tx ID</th><th class="p-4">User</th><th class="p-4">Plan</th><th class="p-4">Amount</th><th class="p-4">Date</th><th class="p-4">Status</th><th class="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${payments.length ? payments.map(p=>`
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4 font-mono text-[10px] text-slate-600 max-w-[110px] truncate">${p.txId||p.tx_id||p.utr_rrn||'N/A'}</td>
                      <td class="p-4 font-semibold text-slate-900">${p.userEmail||p.user_email||''}</td>
                      <td class="p-4"><span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">${p.planName||p.plan_name||p.planId||''}</span></td>
                      <td class="p-4 font-extrabold text-emerald-700">₹${p.amountINR||p.amount_inr||0}</td>
                      <td class="p-4 text-slate-500">${new Date(p.timestamp||p.verified_at||p.created_at||Date.now()).toLocaleString()}</td>
                      <td class="p-4"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[10px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Verified</span></td>
                      <td class="p-4 text-right"><button onclick="if(confirm('Delete this record?')){ AdminPanelEngine.deletePayment('${p.txId||p.tx_id||p.utr_rrn}').then(()=>renderFullAdminPage()); }" class="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-100 transition flex items-center gap-1 ml-auto"><i class="fa-solid fa-trash-can"></i> Delete</button></td>
                    </tr>`).join('') : `<tr><td colspan="7" class="p-10 text-center text-slate-400 italic text-xs"><i class="fa-solid fa-receipt text-slate-300 text-4xl mb-3 block"></i>No payment records yet.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ══ PLANS ══════════════════════════════════════════════════════ -->
        <div id="admin-tab-plans" class="admin-tab-content hidden space-y-5">
          <div class="flex justify-between items-center">
            <div><h3 class="font-extrabold text-base text-slate-900">Subscription Plans (₹ INR)</h3><p class="text-xs text-slate-500 mt-0.5">Create, edit, delete plans and assign which tools each plan unlocks.</p></div>
            <button onclick="openAddPlanModal()" class="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"><i class="fa-solid fa-plus"></i> New Plan</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${plans.length ? plans.map(p=>`
              <div class="bg-white rounded-2xl border ${p.id==='pro-monthly'?'border-indigo-300 ring-2 ring-indigo-200 shadow-lg':'border-slate-200 shadow-sm'} p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.id!=='free'?'bg-amber-50 text-amber-700 border border-amber-200':'bg-slate-100 text-slate-600 border border-slate-200'}">${p.badge||p.id}</span>
                    <h4 class="font-extrabold text-slate-900 text-sm mt-1.5">${p.name}</h4>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-black text-slate-900">₹${p.priceINR}</p>
                    <p class="text-[10px] text-slate-400">${p.durationDays>=365?'/ year':p.durationDays>1?'/ month':'one-time'}</p>
                  </div>
                </div>
                <div class="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                  <div class="flex items-center gap-2"><i class="fa-solid fa-calendar text-indigo-400 w-4"></i>${p.durationDays} days</div>
                  <div class="flex items-center gap-2"><i class="fa-solid fa-upload text-indigo-400 w-4"></i>${p.maxFileSizeMB} MB max upload</div>
                  <div class="flex items-center gap-2"><i class="fa-solid fa-toolbox text-indigo-400 w-4"></i>${(!p.allowedToolIds||p.allowedToolIds==='all'||p.allowedToolIds==='"all"')?'All tools':'Custom tool set'}</div>
                </div>
                ${Array.isArray(p.features)&&p.features.length?`<ul class="text-[11px] text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  ${p.features.slice(0,3).map(f=>`<li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500 flex-shrink-0"></i>${f}</li>`).join('')}
                  ${p.features.length>3?`<li class="text-slate-400 text-[10px]">+${p.features.length-3} more…</li>`:''}
                </ul>`:''}
                <div class="flex gap-2 pt-2 border-t border-slate-100 mt-auto">
                  <button onclick="openAddPlanModal('${p.id}')" class="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                  ${p.id!=='free'?`<button onclick="adminDeletePlanConfirm('${p.id}','${p.name}')" class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-1.5"><i class="fa-solid fa-trash-can"></i></button>`:''}
                </div>
              </div>`).join('') : `<div class="col-span-3 text-center py-12 text-slate-400"><i class="fa-solid fa-crown text-slate-300 text-4xl mb-3 block"></i>No plans found. Click "New Plan" to create one.</div>`}
          </div>
        </div>

        <!-- ══ TOOLS ══════════════════════════════════════════════════════ -->
        <div id="admin-tab-tools" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2"><i class="fa-solid fa-toggle-on text-indigo-600"></i> Tool Visibility</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">Toggle which tools appear on the main website. Saved to Neon DB instantly.</p>
              </div>
              <div class="flex gap-2">
                <button onclick="adminEnableAllFeatures()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-check-double"></i> Enable All</button>
                <button onclick="adminDisableAllFeatures()" class="px-4 py-2 bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5"><i class="fa-solid fa-ban"></i> Disable All</button>
              </div>
            </div>
            <div id="admin-feature-list" class="max-h-[540px] overflow-y-auto pr-1">${renderAdminFeatureList()}</div>
          </div>
        </div>

        <!-- ══ SETTINGS ═══════════════════════════════════════════════════ -->
        <div id="admin-tab-settings" class="admin-tab-content hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- UPI -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3"><i class="fa-solid fa-qrcode text-emerald-600"></i> Payment UPI ID</h3>
              <form onsubmit="handleSaveAdminUpi(event)" class="space-y-3">
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Receiving UPI ID (VPA)</label>
                  <input type="text" id="admin-upi-input" class="custom-input w-full text-sm font-mono font-bold" value="${adminUpi}" placeholder="merchant@upi" required>
                  <p class="text-[10px] text-slate-400 mt-1">Saved to Neon DB. Subscribers pay to this UPI ID when subscribing.</p>
                </div>
                <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"><i class="fa-solid fa-floppy-disk"></i> Save UPI ID to Database</button>
              </form>
            </div>

            <!-- Passcode -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3"><i class="fa-solid fa-lock text-indigo-600"></i> Admin Passcode</h3>
              <form onsubmit="handleChangeAdminPasscode(event)" class="space-y-3">
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">New Passcode</label>
                  <input type="password" id="admin-new-passcode" class="custom-input w-full text-sm font-mono" placeholder="Enter new passcode" required minlength="4">
                </div>
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Confirm Passcode</label>
                  <input type="password" id="admin-confirm-passcode" class="custom-input w-full text-sm font-mono" placeholder="Confirm new passcode" required minlength="4">
                </div>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"><i class="fa-solid fa-key"></i> Update Passcode in Database</button>
              </form>
            </div>

            <!-- Contact / Footer — full width -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-2">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3"><i class="fa-solid fa-location-dot text-indigo-600"></i> Website Footer & Contact Details</h3>
              <form onsubmit="handleSaveContactInfo(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Company Name</label><input type="text" id="contact-company" class="custom-input w-full text-xs" value="${contactInfo.company||''}" required></div>
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Support Email</label><input type="email" id="contact-email" class="custom-input w-full text-xs" value="${contactInfo.email||''}" required></div>
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Phone Number</label><input type="text" id="contact-phone" class="custom-input w-full text-xs" value="${contactInfo.phone||''}" required></div>
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Operating Hours</label><input type="text" id="contact-hours" class="custom-input w-full text-xs" value="${contactInfo.hours||''}" required></div>
                <div class="sm:col-span-2"><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Physical Address</label><input type="text" id="contact-address" class="custom-input w-full text-xs" value="${contactInfo.address||''}" required></div>
                <div class="sm:col-span-2"><button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-floppy-disk"></i> Save to Database</button></div>
              </form>
            </div>

          </div>
        </div>

      </main>
    </div>`;

  // Tab switcher
  window.adminSwitchTab = function(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => { btn.classList.remove('bg-indigo-600','text-white','shadow-md'); btn.classList.add('text-slate-500'); });
    const content = document.getElementById('admin-tab-' + tabId);
    const btn = document.getElementById('admin-tab-btn-' + tabId);
    if (content) content.classList.remove('hidden');
    if (btn) { btn.classList.add('bg-indigo-600','text-white','shadow-md'); btn.classList.remove('text-slate-500'); }
  };
  window.adminSwitchTab('overview');
}

window.renderFullAdminPage = renderFullAdminPage;

// ── Event handlers ────────────────────────────────────────────────────────

window.handleFullAdminLogin = async function(e) {
  e.preventDefault();
  const code = document.getElementById('admin-page-passcode')?.value;
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Verifying…'; }
  const ok = await AdminPanelEngine.adminLogin(code);
  if (ok) { renderFullAdminPage(); }
  else {
    if (btn) { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-unlock"></i> Unlock Dashboard'; }
    const inp = document.getElementById('admin-page-passcode');
    if (inp) { inp.value=''; inp.classList.add('border-red-400','bg-red-50'); setTimeout(()=>inp.classList.remove('border-red-400','bg-red-50'),1500); }
    if (window.showToast) showToast('Incorrect passcode.','error'); else alert('Incorrect passcode');
  }
};

window.handleFullAdminLogout = function() { AdminPanelEngine.adminLogout(); renderFullAdminPage(); };

window.handleSaveAdminUpi = async function(e) {
  e.preventDefault();
  const upi = document.getElementById('admin-upi-input')?.value?.trim();
  if (!upi) return;
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Saving…'; }
  try {
    await AdminPanelEngine.setAdminUpi(upi);
    if (window.showToast) showToast('UPI ID saved to database!','success');
  } catch(err) { alert('Failed: '+err.message); }
  finally { if (btn) { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Save UPI ID to Database'; } }
};

window.handleChangeAdminPasscode = async function(e) {
  e.preventDefault();
  const newPc  = document.getElementById('admin-new-passcode')?.value?.trim();
  const confPc = document.getElementById('admin-confirm-passcode')?.value?.trim();
  if (!newPc||newPc.length<4) { alert('Passcode must be at least 4 characters.'); return; }
  if (newPc!==confPc) { alert('Passcodes do not match.'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Saving…'; }
  try {
    await AdminPanelEngine.setPasscode(newPc);
    document.getElementById('admin-new-passcode').value='';
    document.getElementById('admin-confirm-passcode').value='';
    if (window.showToast) showToast('Passcode updated in database!','success');
  } catch(err) { alert('Failed: '+err.message); }
  finally { if (btn) { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-key"></i> Update Passcode in Database'; } }
};

window.handleSaveContactInfo = async function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Saving…'; }
  try {
    await AdminPanelEngine.saveContactInfo({
      company: document.getElementById('contact-company')?.value?.trim()||'',
      email:   document.getElementById('contact-email')?.value?.trim()||'',
      phone:   document.getElementById('contact-phone')?.value?.trim()||'',
      hours:   document.getElementById('contact-hours')?.value?.trim()||'',
      address: document.getElementById('contact-address')?.value?.trim()||'',
    });
    if (window.renderFooterContact) renderFooterContact();
    if (window.showToast) showToast('Contact info saved to database!','success');
  } catch(err) { alert('Failed: '+err.message); }
  finally { if (btn) { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Save to Database'; } }
};

window.deleteAdminUser = async function(userId) {
  if (!confirm('Permanently delete this user? This cannot be undone.')) return;
  try {
    await AuthSubscriptionEngine.deleteUser(userId);
    const cur = AuthSubscriptionEngine.getCurrentUser();
    if (cur&&cur.id===userId) { AuthSubscriptionEngine._setCurrentUser(null); if (AuthSubscriptionEngine.renderHeaderAuthControls) AuthSubscriptionEngine.renderHeaderAuthControls(); }
    renderFullAdminPage();
    if (window.showToast) showToast('User deleted.','success');
  } catch(err) { alert(err.message||'Delete failed'); }
};

window.changeAdminUserPlan = async function(userId) {
  const plans = AuthSubscriptionEngine.getPlans();
  const opts = plans.map(p=>`${p.id} — ${p.name} (₹${p.priceINR})`).join('\n');
  const sel = prompt('Change user plan.\n\nPlans:\n'+opts+'\n\nEnter plan ID:');
  if (!sel) return;
  try {
    await AuthSubscriptionEngine.subscribeUser(userId, sel, 'ADMIN_MANUAL_ASSIGN');
    renderFullAdminPage();
    if (AuthSubscriptionEngine.renderHeaderAuthControls) AuthSubscriptionEngine.renderHeaderAuthControls();
    if (window.showToast) showToast('Plan updated to '+sel+'!','success');
  } catch(err) { alert(err.message||'Failed'); }
};

window.openAddUserModal = function() {
  const email = prompt('User Email:'); if (!email) return;
  const name  = prompt('Full Name:','User');
  const plan  = prompt('Plan ID (free, pro-monthly, pro-yearly):','pro-monthly');
  AuthSubscriptionEngine.register(email,'password123',name)
    .then(u => plan&&plan!=='free' ? AuthSubscriptionEngine.subscribeUser(u.id,plan,'ADMIN_MANUAL') : u)
    .then(()=>{ renderFullAdminPage(); if (window.showToast) showToast('User added!','success'); })
    .catch(e=>alert(e.message));
};

window.adminDeletePlanConfirm = async function(planId, planName) {
  if (!confirm('Delete plan "'+planName+'"? This is permanent.')) return;
  await adminDeletePlan(planId);
};

// ── Feature list renderer ──────────────────────────────────────────────────

function renderAdminFeatureList() {
  const tools = window.TOOLS || [];
  if (!tools.length) return `<p class="text-xs text-slate-400 italic text-center py-6">Loading tools list…</p>`;

  const catLabels = {
    'pdf-core':'Core PDF','pdf-convert':'Conversions','image-tools':'Image & Raster',
    'design-prepress':'Vector & Design','print-packaging':'Prepress & Packaging',
    'video-motion':'Video & Motion','fonts-typography':'Typography & Fonts',
    'developer-tools':'Web & Developer','cad-blueprints':'CAD & Architectural',
    'legal-medical':'Legal & Medical','publishing-ebooks':'E-Books & Publishing',
    'threed-motion':'3D & Motion','security-ai-data':'Security & AI',
  };
  const cats = {};
  tools.forEach(t=>{ if (!cats[t.category]) cats[t.category]=[]; cats[t.category].push(t); });

  const enabledIds = AdminPanelEngine.getEnabledFeatures()||[];
  let html = `<div class="text-[11px] font-bold text-slate-500 mb-3 px-1 flex items-center justify-between">
    <span><i class="fa-solid fa-sliders text-indigo-500 mr-1"></i> ${enabledIds.length} / ${tools.length} tools enabled</span>
    <span class="text-[10px] text-slate-400">Toggles save to Neon DB instantly</span>
  </div>`;

  Object.keys(cats).forEach(cat => {
    html += `<div class="mb-3">
      <div class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
        <span>${catLabels[cat]||cat}</span>
        <span class="text-[9px] text-slate-400 font-normal">${cats[cat].filter(t=>AdminPanelEngine.isFeatureEnabled(t.id)).length}/${cats[cat].length}</span>
      </div>`;
    cats[cat].forEach(tool => {
      const on = AdminPanelEngine.isFeatureEnabled(tool.id);
      html += `<label class="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200 group">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-r ${tool.color} text-white flex items-center justify-center text-[10px] shadow-sm flex-shrink-0">
            <i class="fa-solid ${tool.icon}"></i>
          </div>
          <div class="min-w-0">
            <div class="text-[11px] font-semibold text-slate-800 truncate">${tool.name}</div>
          </div>
        </div>
        <div class="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input type="checkbox" ${on?'checked':''} onchange="adminToggleFeature('${tool.id}', this.checked)" class="sr-only peer">
          <div class="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
        </div>
      </label>`;
    });
    html += `</div>`;
  });
  return html;
}
window.renderAdminFeatureList = renderAdminFeatureList;

// ── Plan CRUD modal ────────────────────────────────────────────────────────
window.openAddPlanModal = function(planIdToEdit) {
  planIdToEdit = planIdToEdit || null;
  var mid = 'admin-plan-crud-modal';
  var ex = document.getElementById(mid); if (ex) ex.remove();
  var plans = AuthSubscriptionEngine.getPlans();
  var ep = planIdToEdit ? plans.find(function(p){ return p.id===planIdToEdit; }) : null;
  var tools = window.TOOLS || [];
  var feats = ep && Array.isArray(ep.features) ? ep.features.join('\n') : '';
  var raw = ep ? ep.allowedToolIds : 'all';
  var isAll = (!raw || raw==='all' || raw==='"all"');
  var aSet = Array.isArray(raw) ? new Set(raw) : new Set();
  var catL = {'pdf-core':'Core PDF','pdf-convert':'Conversions','image-tools':'Image & Raster','design-prepress':'Vector & Design','print-packaging':'Prepress & Packaging','video-motion':'Video & Motion','fonts-typography':'Typography & Fonts','developer-tools':'Web & Developer','cad-blueprints':'CAD & Architectural','legal-medical':'Legal & Medical','publishing-ebooks':'E-Books & Publishing','threed-motion':'3D & Motion','security-ai-data':'Security & AI'};
  var cats = {};
  tools.forEach(function(t){ if (!cats[t.category]) cats[t.category]=[]; cats[t.category].push(t); });
  var toolHtml = Object.keys(cats).map(function(cat){
    var rows = cats[cat].map(function(t){
      var chk = (isAll||aSet.has(t.id)) ? 'checked' : '';
      return '<label class="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-[11px] text-slate-700"><input type="checkbox" name="plan-tool-ids" value="'+t.id+'" '+chk+' class="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0 ptchk-'+cat+'"><span class="truncate" title="'+t.name+'">'+t.name+'</span></label>';
    }).join('');
    return '<div class="mb-3"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-extrabold text-slate-500 uppercase">'+(catL[cat]||cat)+'</span><span class="text-[9px] flex gap-1"><button type="button" onclick="ptSelCat(\''+cat+'\',true)" class="text-indigo-600 font-bold hover:underline">All</button>&nbsp;/&nbsp;<button type="button" onclick="ptSelCat(\''+cat+'\',false)" class="text-slate-400 font-bold hover:underline">None</button></span></div><div class="grid grid-cols-2 gap-0.5">'+rows+'</div></div>';
  }).join('');
  var en = ep?ep.name||'':'', ep2=ep?ep.priceINR||0:'499', ed=ep?ep.durationDays||30:'30', es=ep?ep.maxFileSizeMB||25:'250', eb=ep?ep.badge||'':'PRO';
  var delBtn = (ep&&ep.id!=='free') ? '<button type="button" onclick="if(confirm(\'Delete plan '+en+'?\')){ adminDeletePlan(\''+ep.id+'\'); document.getElementById(\''+mid+'\').remove(); }" class="text-xs font-bold text-red-500 hover:text-red-700 underline flex items-center gap-1"><i class="fa-solid fa-trash-can"></i> Delete</button>' : '<div></div>';
  var m = document.createElement('div');
  m.id = mid; m.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in';
  m.innerHTML = '<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden relative">'
    +'<button onclick="document.getElementById(\''+mid+'\').remove()" class="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"><i class="fa-solid fa-xmark"></i></button>'
    +'<div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex-shrink-0"><h3 class="text-base font-extrabold flex items-center gap-2"><i class="fa-solid fa-crown text-amber-400"></i>'+(ep?'Edit Plan — '+ep.name:'Create New Plan')+'</h3><p class="text-[11px] text-indigo-300 mt-0.5">Saved directly to Neon Postgres.</p></div>'
    +'<form id="plan-edit-form" onsubmit="handleSavePlanSubmit(event,\''+(ep?ep.id:'')+'\');" class="flex flex-col flex-1 overflow-hidden">'
      +'<div class="flex-1 overflow-y-auto"><div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">'
        // Left
        +'<div class="p-5 space-y-4"><h4 class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-pen-to-square text-indigo-500"></i> Plan Details</h4>'
        +'<div class="grid grid-cols-2 gap-3">'
          +'<div class="col-span-2"><label class="text-[10px] font-bold text-slate-500 uppercase">Plan Name *</label><input type="text" id="plan-input-name" required value="'+en+'" placeholder="e.g. Pro Monthly" class="custom-input w-full text-sm font-bold mt-1"></div>'
          +'<div><label class="text-[10px] font-bold text-slate-500 uppercase">Price (₹) *</label><div class="relative mt-1"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span><input type="number" id="plan-input-price" required min="0" step="1" value="'+ep2+'" class="custom-input w-full pl-7 text-sm font-extrabold"></div></div>'
          +'<div><label class="text-[10px] font-bold text-slate-500 uppercase">Duration (days) *</label><input type="number" id="plan-input-duration" required min="1" value="'+ed+'" class="custom-input w-full text-sm font-bold mt-1"></div>'
          +'<div><label class="text-[10px] font-bold text-slate-500 uppercase">Max File (MB)</label><input type="number" id="plan-input-maxsize" required min="1" value="'+es+'" class="custom-input w-full text-sm font-bold mt-1"></div>'
          +'<div><label class="text-[10px] font-bold text-slate-500 uppercase">Badge</label><input type="text" id="plan-input-badge" value="'+eb+'" placeholder="Popular" class="custom-input w-full text-sm mt-1"></div>'
        +'</div>'
        +'<div><label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Marketing Features <span class="font-normal text-slate-400 normal-case">(one per line)</span></label><textarea id="plan-input-features" rows="5" placeholder="All 50 Tools Unlocked&#10;250MB File Limit" class="custom-input w-full text-xs font-mono resize-y">'+feats+'</textarea></div>'
        +'</div>'
        // Right
        +'<div class="p-5"><div class="flex items-center justify-between mb-2">'
          +'<h4 class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-toolbox text-indigo-500"></i> Tool Access</h4>'
          +'<div class="flex gap-1.5"><button type="button" onclick="ptSelAll(true)" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">All</button><button type="button" onclick="ptSelAll(false)" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">None</button></div>'
        +'</div>'
        +'<div class="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-[11px] text-indigo-800 font-semibold mb-3"><i class="fa-solid fa-circle-info text-indigo-500 mr-1"></i> Checked = accessible to plan subscribers. Unchecked = shows lock badge.</div>'
        +'<div id="plan-tool-checkboxes" class="max-h-[380px] overflow-y-auto pr-1">'+toolHtml+'</div>'
        +'</div>'
      +'</div></div>'
      +'<div class="flex-shrink-0 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3 bg-slate-50/80">'
        +delBtn
        +'<div class="flex gap-3 items-center"><button type="button" onclick="document.getElementById(\''+mid+'\').remove()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">Cancel</button><button type="submit" id="plan-save-btn" class="btn-gradient px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2"><i class="fa-solid fa-floppy-disk"></i>'+(ep?'Save Changes':'Create Plan')+'</button></div>'
      +'</div>'
    +'</form></div>';
  document.body.appendChild(m);
  window.ptSelAll = function(v){ m.querySelectorAll('input[name="plan-tool-ids"]').forEach(function(cb){ cb.checked=v; }); };
  window.ptSelCat = function(cat,v){ m.querySelectorAll('input.ptchk-'+cat).forEach(function(cb){ cb.checked=v; }); };
};

window.handleSavePlanSubmit = async function(e, editId) {
  e.preventDefault();
  var btn = document.getElementById('plan-save-btn');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Saving to Neon…'; }
  var name=document.getElementById('plan-input-name')?.value?.trim()||'';
  var price=parseFloat(document.getElementById('plan-input-price')?.value||0);
  var dur=parseInt(document.getElementById('plan-input-duration')?.value||30);
  var size=parseInt(document.getElementById('plan-input-maxsize')?.value||25);
  var badge=document.getElementById('plan-input-badge')?.value?.trim()||'';
  var ftext=document.getElementById('plan-input-features')?.value||'';
  var features=ftext.split('\n').map(function(f){ return f.trim(); }).filter(Boolean);
  var cbs=Array.from(document.querySelectorAll('input[name="plan-tool-ids"]:checked'));
  var all=Array.from(document.querySelectorAll('input[name="plan-tool-ids"]'));
  var allowedToolIds=(cbs.length===all.length)?'all':cbs.map(function(cb){ return cb.value; });
  try {
    await AdminPanelEngine.savePlan({ id:editId||('plan_'+Date.now()), name, priceINR:price, durationDays:dur, maxFileSizeMB:size, badge, features, allowedToolIds });
    document.getElementById('admin-plan-crud-modal')?.remove();
    if (window.showToast) showToast('Plan "'+name+'" saved!','success');
    renderFullAdminPage().then(function(){ if (window.adminSwitchTab) adminSwitchTab('plans'); });
  } catch(err) {
    if (btn) { btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Changes'; }
    if (window.showToast) showToast('Save failed: '+(err.message||err),'error'); else alert('Save failed: '+(err.message||err));
  }
};

window.adminDeletePlan = async function(planId) {
  try {
    await AdminPanelEngine.deletePlan(planId);
    if (window.showToast) showToast('Plan deleted.','success');
    renderFullAdminPage().then(function(){ if (window.adminSwitchTab) adminSwitchTab('plans'); });
  } catch(err) {
    if (window.showToast) showToast('Delete failed: '+(err.message||err),'error'); else alert('Delete failed: '+(err.message||err));
  }
};
