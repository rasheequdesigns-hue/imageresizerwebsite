/**
 * StudioSuite Pro â€” Admin Panel Engine & Dashboard UI
 * Data layer: Supabase via SupabaseEngine. Admin session in localStorage.
 */

class AdminPanelEngine {
  static STORAGE_ADMIN_SESSION      = 'studiosuite_admin_session';
  static STORAGE_FEATURES_FALLBACK  = 'studiosuite_features_cache';
  static _featuresCache  = null;
  static _settingsCache  = null;

  static _saveFeaturesToStorage(cache) {
    try { localStorage.setItem(this.STORAGE_FEATURES_FALLBACK, JSON.stringify(cache)); } catch {}
  }
  static _loadFeaturesFromStorage() {
    try { const raw = localStorage.getItem(this.STORAGE_FEATURES_FALLBACK); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  // â”€â”€ Session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static isAdminLoggedIn() { return localStorage.getItem(this.STORAGE_ADMIN_SESSION) === 'true'; }
  static async adminLogin(passcode) {
    try {
      const settings = await this._fetchFreshSettings();
      const stored = settings['admin_passcode'] || 'admin123';
      if (passcode === stored) { localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true'); return true; }
      return false;
    } catch {
      if (passcode === 'admin123') { localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true'); return true; }
      return false;
    }
  }
  static adminLogout() { localStorage.removeItem(this.STORAGE_ADMIN_SESSION); }

  // â”€â”€ Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static async _fetchFreshSettings() {
    try {
      const settings = await SupabaseEngine.getSettings();
      this._settingsCache = settings;
      if (window.SupabaseEngine) SupabaseEngine._settingsCache = settings;
      return settings;
    } catch (e) {
      console.warn('[Admin] _fetchFreshSettings failed:', e.message);
      return this._settingsCache || {};
    }
  }
  static async _loadSettings() { return this._fetchFreshSettings(); }

  static async _saveSetting(key, value) {
    await SupabaseEngine.setSetting(key, value);
    if (!this._settingsCache) this._settingsCache = {};
    this._settingsCache[key] = value;
  }

  static getAdminUpi()   { return this._settingsCache?.['admin_upi'] || 'merchant@upi'; }
  static getPasscode()   { return this._settingsCache?.['admin_passcode'] || 'admin123'; }
  static getContactInfo() {
    try {
      const raw = this._settingsCache?.['footer_contact'];
      if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {}
    return { company: 'StudioSuite PRO', address: '', phone: '', email: '', hours: '' };
  }

  static async setAdminUpi(v)     { await this._saveSetting('admin_upi', (v || '').trim()); }
  static async setPasscode(v)     { await this._saveSetting('admin_passcode', v); }
  static async saveContactInfo(i) { await this._saveSetting('footer_contact', JSON.stringify(i)); }

  // â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static getAllToolIds() { return (window.TOOLS || []).map(t => t.id); }

  static getEnabledFeatures() {
    let cache = this._featuresCache || (window.SupabaseEngine ? SupabaseEngine._featuresCache : null);
    if (!cache) cache = this._loadFeaturesFromStorage();
    if (!cache) {
      // Default: all tools enabled
      cache = {};
      (window.TOOLS || []).forEach(t => { cache[t.id] = true; });
    }
    this._featuresCache = cache;
    if (window.SupabaseEngine && !SupabaseEngine._featuresCache) SupabaseEngine._featuresCache = cache;
    const tools = this.getAllToolIds();
    if (!tools.length) return [];
    return tools.filter(id => cache[id] !== false); // enabled unless explicitly false
  }

  static isFeatureEnabled(toolId) {
    let cache = this._featuresCache || (window.SupabaseEngine ? SupabaseEngine._featuresCache : null);
    if (!cache) cache = this._loadFeaturesFromStorage();
    if (!cache) return true; // Default: enabled
    this._featuresCache = cache;
    return cache[toolId] !== false; // enabled unless explicitly set to false
  }

  static async setFeatureEnabled(toolId, enabled) {
    await SupabaseEngine.setFeatureEnabled(toolId, enabled);
    const cache = this._featuresCache || SupabaseEngine._featuresCache || this._loadFeaturesFromStorage() || {};
    cache[toolId] = !!enabled;
    this._featuresCache = cache;
    SupabaseEngine._featuresCache = cache;
    this._saveFeaturesToStorage(cache);
  }

  static async enableAllFeatures() {
    const all = this.getAllToolIds();
    if (!all.length) return [];
    await SupabaseEngine.enableAllFeatures(all);
    const cache = {};
    all.forEach(id => { cache[id] = true; });
    this._featuresCache = cache;
    SupabaseEngine._featuresCache = cache;
    this._saveFeaturesToStorage(cache);
    return all;
  }

  static async disableAllFeatures() {
    const all = this.getAllToolIds();
    if (!all.length) return [];
    await SupabaseEngine.disableAllFeatures(all);
    const cache = {};
    all.forEach(id => { cache[id] = false; });
    this._featuresCache = cache;
    SupabaseEngine._featuresCache = cache;
    this._saveFeaturesToStorage(cache);
    return [];
  }

  // â”€â”€ Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static async savePlan(planData) {
    const payload = {
      id: planData.id || ('plan_' + Date.now()),
      name: planData.name,
      priceINR: planData.priceINR ?? 0,
      durationDays: planData.durationDays || 30,
      maxFileSizeMB: planData.maxFileSizeMB || 25,
      badge: planData.badge || '',
      features: planData.features || [],
      allowedToolIds: planData.allowedToolIds ?? 'all',
    };
    await SupabaseEngine.savePlan(payload);
    const plans = AuthSubscriptionEngine._plansCache || [];
    const idx = plans.findIndex(p => p.id === payload.id);
    if (idx !== -1) plans[idx] = payload; else plans.push(payload);
    AuthSubscriptionEngine._plansCache = [...plans].sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
    return payload;
  }

  static async deletePlan(planId) {
    if (planId === 'free') throw new Error('Cannot delete the default free plan');
    await SupabaseEngine.deletePlan(planId);
    if (AuthSubscriptionEngine._plansCache) {
      AuthSubscriptionEngine._plansCache = AuthSubscriptionEngine._plansCache.filter(p => p.id !== planId);
    }
  }

  // â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static async getPayments()        { return SupabaseEngine.getPayments(); }
  static async deletePayment(id)    { return SupabaseEngine.deletePayment(id); }
  static async clearAllPayments()   {
    const payments = await this.getPayments();
    await Promise.all(payments.map(p => SupabaseEngine.deletePayment(p.id)));
  }

  /** Verify a UTR payment and activate the user's subscription */
  static async verifyPayment(paymentId, userId, planType) {
    return SupabaseEngine.verifyPayment(paymentId, userId, planType);
  }
}

window.AdminPanelEngine = AdminPanelEngine;

// â”€â”€ Feature toggle global helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Full Admin Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                  <input type="password" id="admin-page-passcode" class="custom-input w-full text-sm pr-10 tracking-widest font-mono" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required autofocus>
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

  // Load data
  let users = [], plans = AuthSubscriptionEngine.getPlans() || [], payments = [], settings = AdminPanelEngine._settingsCache || {};

  if (!plans || plans.length === 0) plans = SupabaseEngine.DEFAULT_PLANS;

  const results = await Promise.allSettled([
    AdminPanelEngine._fetchFreshSettings(),
    AuthSubscriptionEngine.getUsers(),
    AuthSubscriptionEngine.fetchPlans(),
    AdminPanelEngine.getPayments(),
  ]);
  settings = results[0].status === 'fulfilled' ? results[0].value : {};
  users    = results[1].status === 'fulfilled' ? results[1].value : [];
  plans    = results[2].status === 'fulfilled' ? results[2].value : plans;
  payments = results[3].status === 'fulfilled' ? results[3].value : [];

  const pendingPayments = payments.filter(p => !p.isVerified);
  const verifiedPayments = payments.filter(p => p.isVerified);
  const contactInfo = AdminPanelEngine.getContactInfo();
  const adminUpi    = AdminPanelEngine.getAdminUpi();
  const totalRevenue = verifiedPayments.reduce((a, p) => a + (parseFloat(p.amountINR) || 0), 0);
  const proUsers     = users.filter(u => u.planId !== 'free' && u.subscriptionVerified).length;
  const enabledCount = (AdminPanelEngine.getEnabledFeatures() || (window.TOOLS || []).map(t => t.id)).length;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50">
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
              { id: 'overview',  icon: 'fa-gauge-high',  label: 'Overview'  },
              { id: 'payments',  icon: 'fa-receipt',      label: 'Payments', badge: pendingPayments.length > 0 ? pendingPayments.length : null },
              { id: 'users',     icon: 'fa-users',        label: 'Users'     },
              { id: 'plans',     icon: 'fa-crown',        label: 'Plans'     },
              { id: 'tools',     icon: 'fa-toggle-on',    label: 'Tools'     },
              { id: 'settings',  icon: 'fa-sliders',      label: 'Settings'  },
            ].map((t, i) => `
              <button onclick="adminSwitchTab('${t.id}')" id="admin-tab-btn-${t.id}"
                class="admin-tab-btn relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                  ${i === 0 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}">
                <i class="fa-solid ${t.icon} text-[10px]"></i>
                <span class="hidden sm:inline">${t.label}</span>
                ${t.badge ? `<span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">${t.badge}</span>` : ''}
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

        <!-- â•â• OVERVIEW â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <div id="admin-tab-overview" class="admin-tab-content space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${[
              { label: 'Verified Revenue', value: 'â‚¹' + totalRevenue.toLocaleString(), icon: 'fa-indian-rupee-sign', grad: 'from-emerald-500 to-teal-600', txt: 'text-emerald-700' },
              { label: 'Registered Users', value: users.length, icon: 'fa-users', grad: 'from-indigo-500 to-violet-600', txt: 'text-indigo-700' },
              { label: 'Active Subscribers', value: proUsers, icon: 'fa-crown', grad: 'from-amber-500 to-orange-500', txt: 'text-amber-700' },
              { label: 'Pending UTRs', value: pendingPayments.length, icon: 'fa-clock', grad: 'from-red-500 to-rose-600', txt: 'text-red-700' },
            ].map(s => `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center text-lg shadow-md flex-shrink-0"><i class="fa-solid ${s.icon}"></i></div>
                <div><p class="text-[10px] font-extrabold text-slate-400 uppercase">${s.label}</p><p class="text-2xl font-black ${s.txt}">${s.value}</p></div>
              </div>`).join('')}
          </div>

          ${pendingPayments.length > 0 ? `
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-extrabold text-sm text-amber-900 flex items-center gap-2"><i class="fa-solid fa-clock text-amber-600"></i> ${pendingPayments.length} Pending UTR Verification${pendingPayments.length > 1 ? 's' : ''}</h3>
              <button onclick="adminSwitchTab('payments')" class="text-xs text-amber-800 font-bold hover:underline">View All â†’</button>
            </div>
            ${pendingPayments.slice(0, 3).map(p => `
              <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200 mb-2 last:mb-0">
                <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 text-xs font-extrabold flex items-center justify-center flex-shrink-0">â‚¹</div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-slate-900 truncate">${p.userEmail || p.userName || 'Unknown'}</p>
                  <p class="text-[10px] text-slate-500">UTR: <span class="font-mono font-bold">${p.utrNumber}</span> Â· ${p.planType} Â· â‚¹${p.amountINR}</p>
                </div>
                <button onclick="adminVerifyPayment('${p.id}','${p.userId}','${p.planType}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-lg transition shadow-sm whitespace-nowrap">
                  <i class="fa-solid fa-check mr-1"></i> Verify
                </button>
              </div>`).join('')}
          </div>` : `
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><i class="fa-solid fa-check-circle"></i></div>
            <div><p class="text-xs font-extrabold text-emerald-900">All UTR payments verified</p><p class="text-[11px] text-emerald-700">No pending payment verifications at this time.</p></div>
          </div>`}

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-users text-indigo-600"></i> Recent Users</h3>
                <button onclick="adminSwitchTab('users')" class="text-xs text-indigo-600 font-bold hover:underline">All â†’</button>
              </div>
              ${users.slice(0, 5).map(u => `
                <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center">${(u.name || u.email || 'U')[0].toUpperCase()}</div>
                  <div class="flex-1 min-w-0"><p class="text-xs font-bold text-slate-900 truncate">${u.name || u.email}</p><p class="text-[10px] text-slate-400 truncate">${u.email}</p></div>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${u.subscriptionVerified ? 'bg-emerald-100 text-emerald-800' : u.planId !== 'free' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">${u.subscriptionVerified ? 'âœ“ Active' : u.planId !== 'free' ? 'â³ Pending' : 'Free'}</span>
                </div>`).join('') || '<p class="text-xs text-slate-400 italic text-center py-4">No users yet</p>'}
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div class="flex justify-between items-center">
                <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2"><i class="fa-solid fa-database text-indigo-600"></i> Supabase Status</h3>
                <button onclick="adminSwitchTab('settings')" class="text-xs text-indigo-600 font-bold hover:underline">Settings â†’</button>
              </div>
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p class="text-xs font-extrabold text-emerald-900">Supabase Connected</p>
                </div>
                <p class="text-[11px] text-emerald-700 mt-1">Auth, database, and storage connected to hpmsmhqdgzikbgaprcad.supabase.co</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p class="font-bold text-slate-800 mb-1">Quick Stats</p>
                <div class="grid grid-cols-2 gap-1.5">
                  <div>ðŸ‘¥ ${users.length} users</div>
                  <div>ðŸ’° ${payments.length} payments</div>
                  <div>âœ… ${verifiedPayments.length} verified</div>
                  <div>â³ ${pendingPayments.length} pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- â•â• PAYMENTS (UTR VERIFICATION QUEUE) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <div id="admin-tab-payments" class="admin-tab-content hidden space-y-5">
          <!-- Pending UTRs -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex flex-wrap justify-between items-center p-5 border-b border-slate-100 gap-3">
              <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-clock text-amber-600"></i> Pending UTR Verifications
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${pendingPayments.length > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'}">${pendingPayments.length} pending</span>
              </h3>
              <button onclick="renderFullAdminPage().then(() => adminSwitchTab('payments'))" class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1">
                <i class="fa-solid fa-rotate-right"></i> Refresh
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th class="p-4">User</th><th class="p-4">UTR Number</th><th class="p-4">Plan</th><th class="p-4">Amount</th><th class="p-4">Submitted</th><th class="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${pendingPayments.length ? pendingPayments.map(p => `
                    <tr class="hover:bg-amber-50/40 transition-colors">
                      <td class="p-4"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-extrabold text-xs flex items-center justify-center">${(p.userEmail || 'U')[0].toUpperCase()}</div><div><p class="font-bold text-slate-900 truncate max-w-[140px]">${p.userName || 'â€”'}</p><p class="text-[10px] text-slate-400 truncate max-w-[140px]">${p.userEmail}</p></div></div></td>
                      <td class="p-4"><span class="font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg text-[11px]">${p.utrNumber}</span></td>
                      <td class="p-4"><span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">${p.planType}</span></td>
                      <td class="p-4 font-extrabold text-emerald-700">â‚¹${p.amountINR}</td>
                      <td class="p-4 text-slate-500">${new Date(p.timestamp).toLocaleString()}</td>
                      <td class="p-4 text-right">
                        <button onclick="adminVerifyPayment('${p.id}','${p.userId}','${p.planType}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-1.5 ml-auto">
                          <i class="fa-solid fa-check"></i> Verify & Activate
                        </button>
                      </td>
                    </tr>`).join('')
                  : `<tr><td colspan="6" class="p-10 text-center text-slate-400 italic text-xs"><i class="fa-solid fa-check-circle text-emerald-300 text-4xl mb-3 block"></i>No pending UTR verifications. All payments are up to date.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Verified payments -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex flex-wrap justify-between items-center p-5 border-b border-slate-100 gap-3">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2"><i class="fa-solid fa-receipt text-emerald-600"></i> Verified Transactions (â‚¹ INR)</h3>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">${verifiedPayments.length} records</span>
                <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white text-slate-900 border border-slate-200">â‚¹${totalRevenue.toLocaleString()} total</span>
              </div>
              ${verifiedPayments.length ? `<button onclick="if(confirm('Clear ALL verified payment records?')){ AdminPanelEngine.clearAllPayments().then(()=>{renderFullAdminPage().then(()=>adminSwitchTab('payments'))}); }" class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5"><i class="fa-solid fa-trash-can"></i> Clear All</button>` : ''}
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th class="p-4">UTR</th><th class="p-4">User</th><th class="p-4">Plan</th><th class="p-4">Amount</th><th class="p-4">Verified At</th><th class="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${verifiedPayments.length ? verifiedPayments.map(p => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4 font-mono text-[10px] text-slate-600 max-w-[110px] truncate">${p.utrNumber}</td>
                      <td class="p-4 font-semibold text-slate-900">${p.userEmail || ''}</td>
                      <td class="p-4"><span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">${p.planType}</span></td>
                      <td class="p-4 font-extrabold text-emerald-700">â‚¹${p.amountINR}</td>
                      <td class="p-4 text-slate-500">${p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : 'â€”'}</td>
                      <td class="p-4 text-right">${p.isVerified ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[10px]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Verified</span>` : `<button onclick="adminVerifyPayment('${p.id}','${p.userId}','${p.planType||p.planId}')" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-300 text-[10px] hover:bg-amber-100 transition"><i class="fa-solid fa-check-circle"></i> Verify Now</button>`}
                    </tr>`).join('')
                  : `<tr><td colspan="6" class="p-10 text-center text-slate-400 italic text-xs"><i class="fa-solid fa-receipt text-slate-300 text-4xl mb-3 block"></i>No verified payment records yet.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- â•â• USERS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <div id="admin-tab-users" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex flex-wrap justify-between items-center p-5 border-b border-slate-100 gap-3">
              <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-users text-indigo-600"></i> User Accounts
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">${users.length} total</span>
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th class="p-4">User</th><th class="p-4">Plan</th><th class="p-4">Status</th><th class="p-4">Expires</th><th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${users.length ? users.map(u => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4"><div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">${(u.name || u.email || 'U')[0].toUpperCase()}</div>
                        <div><p class="font-extrabold text-slate-900">${u.name || 'â€”'}</p><p class="text-[10px] text-slate-400">${u.email}</p></div>
                      </div></td>
                      <td class="p-4"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${u.planId !== 'free' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                        ${u.planId !== 'free' ? '<i class="fa-solid fa-crown text-amber-500"></i>' : '<i class="fa-solid fa-user"></i>'} ${u.planId}
                      </span></td>
                      <td class="p-4"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] ${u.subscriptionVerified ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : u.planId !== 'free' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                        <span class="w-1.5 h-1.5 rounded-full ${u.subscriptionVerified ? 'bg-emerald-500' : u.planId !== 'free' ? 'bg-amber-500' : 'bg-slate-400'}"></span>
                        ${u.subscriptionVerified ? 'Active' : u.planId !== 'free' ? 'Pending' : 'Free'}
                      </span></td>
                      <td class="p-4 text-slate-500">${u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : 'â€”'}</td>
                      <td class="p-4 text-right"><div class="flex items-center justify-end gap-2">
                        <button onclick="changeAdminUserPlan('${u.id}')" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition"><i class="fa-solid fa-pen mr-1"></i>Plan</button>
                        <button onclick="deleteAdminUser('${u.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition"><i class="fa-solid fa-trash-can mr-1"></i>Delete</button>
                      </div></td>
                    </tr>`).join('')
                  : `<tr><td colspan="5" class="p-10 text-center text-slate-400 italic text-xs"><i class="fa-solid fa-users text-slate-300 text-4xl mb-3 block"></i>No users registered yet.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- â•â• PLANS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <div id="admin-tab-plans" class="admin-tab-content hidden space-y-5">
          <div class="flex justify-between items-center">
            <div><h3 class="font-extrabold text-base text-slate-900">Subscription Plans (â‚¹ INR)</h3><p class="text-xs text-slate-500 mt-0.5">Create, edit, delete plans. Saved to Supabase.</p></div>
            <button onclick="openAddPlanModal()" class="btn-gradient px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"><i class="fa-solid fa-plus"></i> New Plan</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${plans.length ? plans.map(p => `
              <div class="bg-white rounded-2xl border ${p.id === 'pro-monthly' ? 'border-indigo-300 ring-2 ring-indigo-200 shadow-lg' : 'border-slate-200 shadow-sm'} p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.id !== 'free' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">${p.badge || p.id}</span>
                    <h4 class="font-extrabold text-slate-900 text-sm mt-1.5">${p.name}</h4>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-black text-slate-900">â‚¹${p.priceINR}</p>
                    <p class="text-[10px] text-slate-400">${p.durationDays >= 365 ? '/ year' : p.durationDays > 1 ? '/ month' : 'one-time'}</p>
                  </div>
                </div>
                <div class="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                  <div class="flex items-center gap-2"><i class="fa-solid fa-calendar text-indigo-400 w-4"></i>${p.durationDays} days</div>
                  <div class="flex items-center gap-2"><i class="fa-solid fa-upload text-indigo-400 w-4"></i>${p.maxFileSizeMB} MB max upload</div>
                  <div class="flex items-center gap-2"><i class="fa-solid fa-toolbox text-indigo-400 w-4"></i>${(!p.allowedToolIds || p.allowedToolIds === 'all') ? 'All tools' : 'Custom tool set'}</div>
                </div>
                ${Array.isArray(p.features) && p.features.length ? `<ul class="text-[11px] text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  ${p.features.slice(0, 3).map(f => `<li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500 flex-shrink-0"></i>${f}</li>`).join('')}
                  ${p.features.length > 3 ? `<li class="text-slate-400 text-[10px]">+${p.features.length - 3} moreâ€¦</li>` : ''}
                </ul>` : ''}
                <div class="flex gap-2 pt-2 border-t border-slate-100 mt-auto">
                  <button onclick="openAddPlanModal('${p.id}')" class="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                  ${p.id !== 'free' ? `<button onclick="adminDeletePlanConfirm('${p.id}','${p.name}')" class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-1.5"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                </div>
              </div>`).join('')
            : `<div class="col-span-3 text-center py-12 text-slate-400"><i class="fa-solid fa-crown text-slate-300 text-4xl mb-3 block"></i>No plans found. Click "New Plan" to create one.</div>`}
          </div>
        </div>

        <!-- â•â• TOOLS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <div id="admin-tab-tools" class="admin-tab-content hidden space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 class="font-extrabold text-base text-slate-900 flex items-center gap-2"><i class="fa-solid fa-toggle-on text-indigo-600"></i> Tool Visibility</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">Toggle which tools appear on the main website. Saved to Supabase instantly.</p>
              </div>
              <div class="flex gap-2">
                <button onclick="adminEnableAllFeatures()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"><i class="fa-solid fa-check-double"></i> Enable All</button>
                <button onclick="adminDisableAllFeatures()" class="px-4 py-2 bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5"><i class="fa-solid fa-ban"></i> Disable All</button>
              </div>
            </div>
            <div id="admin-feature-list" class="max-h-[540px] overflow-y-auto pr-1">${renderAdminFeatureList()}</div>
          </div>
        </div>

        <!-- â•â• SETTINGS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <div id="admin-tab-settings" class="admin-tab-content hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3"><i class="fa-solid fa-qrcode text-emerald-600"></i> Payment UPI ID</h3>
              <form onsubmit="handleSaveAdminUpi(event)" class="space-y-3">
                <div>
                  <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">Receiving UPI ID (VPA)</label>
                  <input type="text" id="admin-upi-input" class="custom-input w-full text-sm font-mono font-bold" value="${adminUpi}" placeholder="merchant@upi" required>
                  <p class="text-[10px] text-slate-400 mt-1">Subscribers pay to this UPI ID. Shown as QR code on landing page.</p>
                </div>
                <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"><i class="fa-solid fa-floppy-disk"></i> Save UPI ID</button>
              </form>
            </div>

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
                <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"><i class="fa-solid fa-key"></i> Update Passcode</button>
              </form>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-2">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3"><i class="fa-solid fa-location-dot text-indigo-600"></i> Footer & Contact Details</h3>
              <form onsubmit="handleSaveContactInfo(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Company Name</label><input type="text" id="contact-company" class="custom-input w-full text-xs" value="${contactInfo.company || ''}" required></div>
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Support Email</label><input type="email" id="contact-email" class="custom-input w-full text-xs" value="${contactInfo.email || ''}" required></div>
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Phone Number</label><input type="text" id="contact-phone" class="custom-input w-full text-xs" value="${contactInfo.phone || ''}" required></div>
                <div><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Operating Hours</label><input type="text" id="contact-hours" class="custom-input w-full text-xs" value="${contactInfo.hours || ''}" required></div>
                <div class="sm:col-span-2"><label class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1.5">Physical Address</label><input type="text" id="contact-address" class="custom-input w-full text-xs" value="${contactInfo.address || ''}" required></div>
                <div class="sm:col-span-2"><button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-floppy-disk"></i> Save to Supabase</button></div>
              </form>
            </div>
          </div>
        </div>

      </main>
    </div>`;

  // Tab switcher
  window.adminSwitchTab = function(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(btn => { btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md'); btn.classList.add('text-slate-500'); });
    const content = document.getElementById('admin-tab-' + tabId);
    const btn = document.getElementById('admin-tab-btn-' + tabId);
    if (content) content.classList.remove('hidden');
    if (btn) { btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md'); btn.classList.remove('text-slate-500'); }
  };
  window.adminSwitchTab('overview');
}

window.renderFullAdminPage = renderFullAdminPage;

// â”€â”€ UTR Verify handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

window.adminVerifyPayment = async function(paymentId, userId, planType) {
  if (!confirm(`Verify this UTR payment and activate "${planType}" for this user?`)) return;
  const btn = event && event.target;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>Verifying...'; }
  try {
    await AdminPanelEngine.verifyPayment(paymentId, userId, planType);
    if (window.showToast) showToast('âœ… Payment verified! User subscription activated.', 'success');
    renderFullAdminPage().then(() => adminSwitchTab('payments'));
  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Verify & Activate'; }
    if (window.showToast) showToast('Failed: ' + err.message, 'error');
    else alert('Verify failed: ' + err.message);
  }
};

// â”€â”€ Event handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

window.handleFullAdminLogin = async function(e) {
  e.preventDefault();
  const code = document.getElementById('admin-page-passcode')?.value;
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Verifyingâ€¦'; }
  const ok = await AdminPanelEngine.adminLogin(code);
  if (ok) { renderFullAdminPage(); }
  else {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-unlock"></i> Unlock Dashboard'; }
    const inp = document.getElementById('admin-page-passcode');
    if (inp) { inp.value = ''; inp.classList.add('border-red-400', 'bg-red-50'); setTimeout(() => inp.classList.remove('border-red-400', 'bg-red-50'), 1500); }
    if (window.showToast) showToast('Incorrect passcode.', 'error'); else alert('Incorrect passcode');
  }
};

window.handleFullAdminLogout = function() { AdminPanelEngine.adminLogout(); renderFullAdminPage(); };

window.handleSaveAdminUpi = async function(e) {
  e.preventDefault();
  const upi = document.getElementById('admin-upi-input')?.value?.trim();
  if (!upi) return;
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Savingâ€¦'; }
  try { await AdminPanelEngine.setAdminUpi(upi); if (window.showToast) showToast('UPI ID saved!', 'success'); }
  catch(err) { alert('Failed: ' + err.message); }
  finally { if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save UPI ID'; } }
};

window.handleChangeAdminPasscode = async function(e) {
  e.preventDefault();
  const newPc  = document.getElementById('admin-new-passcode')?.value?.trim();
  const confPc = document.getElementById('admin-confirm-passcode')?.value?.trim();
  if (!newPc || newPc.length < 4) { alert('Passcode must be at least 4 characters.'); return; }
  if (newPc !== confPc) { alert('Passcodes do not match.'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Savingâ€¦'; }
  try {
    await AdminPanelEngine.setPasscode(newPc);
    document.getElementById('admin-new-passcode').value = '';
    document.getElementById('admin-confirm-passcode').value = '';
    if (window.showToast) showToast('Passcode updated!', 'success');
  } catch(err) { alert('Failed: ' + err.message); }
  finally { if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-key"></i> Update Passcode'; } }
};

window.handleSaveContactInfo = async function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Savingâ€¦'; }
  try {
    await AdminPanelEngine.saveContactInfo({
      company: document.getElementById('contact-company')?.value?.trim() || '',
      email:   document.getElementById('contact-email')?.value?.trim() || '',
      phone:   document.getElementById('contact-phone')?.value?.trim() || '',
      hours:   document.getElementById('contact-hours')?.value?.trim() || '',
      address: document.getElementById('contact-address')?.value?.trim() || '',
    });
    if (window.renderFooterContact) renderFooterContact();
    if (window.showToast) showToast('Contact info saved!', 'success');
  } catch(err) { alert('Failed: ' + err.message); }
  finally { if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save to Supabase'; } }
};

window.deleteAdminUser = async function(userId) {
  if (!confirm('Permanently delete this user? This cannot be undone.')) return;
  try {
    await AuthSubscriptionEngine.deleteUser(userId);
    const cur = AuthSubscriptionEngine.getCurrentUser();
    if (cur && cur.id === userId) { AuthSubscriptionEngine._setCurrentUser(null); AuthSubscriptionEngine.renderHeaderAuthControls(); }
    renderFullAdminPage();
    if (window.showToast) showToast('User deleted.', 'success');
  } catch(err) { alert(err.message || 'Delete failed'); }
};

window.changeAdminUserPlan = async function(userId) {
  const plans = AuthSubscriptionEngine.getPlans();
  const opts = plans.map(p => `${p.id} â€” ${p.name} (â‚¹${p.priceINR})`).join('\n');
  const sel = prompt('Change user plan.\n\nPlans:\n' + opts + '\n\nEnter plan ID:');
  if (!sel) return;
  try {
    await AuthSubscriptionEngine.subscribeUser(userId, sel, 'ADMIN_MANUAL_ASSIGN');
    renderFullAdminPage();
    if (AuthSubscriptionEngine.renderHeaderAuthControls) AuthSubscriptionEngine.renderHeaderAuthControls();
    if (window.showToast) showToast('Plan updated to ' + sel + '!', 'success');
  } catch(err) { alert(err.message || 'Failed'); }
};

// â”€â”€ Feature list renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderAdminFeatureList() {
  const tools = window.TOOLS || [];
  if (!tools.length) return `<p class="text-xs text-slate-400 italic text-center py-6">Loading tools listâ€¦</p>`;

  const catLabels = {
    'pdf-core': 'Core PDF', 'pdf-convert': 'Conversions', 'image-tools': 'Image & Raster',
    'design-prepress': 'Vector & Design', 'print-packaging': 'Prepress & Packaging',
    'video-motion': 'Video & Motion', 'fonts-typography': 'Typography & Fonts',
    'developer-tools': 'Web & Developer', 'cad-blueprints': 'CAD & Architectural',
    'legal-medical': 'Legal & Medical', 'publishing-ebooks': 'E-Books & Publishing',
    'threed-motion': '3D & Motion', 'security-ai-data': 'Security & AI',
  };
  const cats = {};
  tools.forEach(t => { if (!cats[t.category]) cats[t.category] = []; cats[t.category].push(t); });

  const enabledIds = AdminPanelEngine.getEnabledFeatures() || [];
  let html = `<div class="text-[11px] font-bold text-slate-500 mb-3 px-1 flex items-center justify-between">
    <span><i class="fa-solid fa-sliders text-indigo-500 mr-1"></i> ${enabledIds.length} / ${tools.length} tools enabled</span>
    <span class="text-[10px] text-slate-400">Toggles save to Supabase instantly</span>
  </div>`;

  Object.keys(cats).forEach(cat => {
    html += `<div class="mb-3">
      <div class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
        <span>${catLabels[cat] || cat}</span>
        <span class="text-[9px] text-slate-400 font-normal">${cats[cat].filter(t => AdminPanelEngine.isFeatureEnabled(t.id)).length}/${cats[cat].length}</span>
      </div>`;
    cats[cat].forEach(tool => {
      const on = AdminPanelEngine.isFeatureEnabled(tool.id);
      html += `<label class="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200 group">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-r ${tool.color} text-white flex items-center justify-center text-[10px] shadow-sm flex-shrink-0">
            <i class="fa-solid ${tool.icon}"></i>
          </div>
          <div class="min-w-0"><div class="text-[11px] font-semibold text-slate-800 truncate">${tool.name}</div></div>
        </div>
        <div class="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input type="checkbox" ${on ? 'checked' : ''} onchange="adminToggleFeature('${tool.id}', this.checked)" class="sr-only peer">
          <div class="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
        </div>
      </label>`;
    });
    html += `</div>`;
  });
  return html;
}
window.renderAdminFeatureList = renderAdminFeatureList;

// â”€â”€ Plan CRUD modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.openAddPlanModal = function(planIdToEdit) {
  planIdToEdit = planIdToEdit || null;
  const mid = 'admin-plan-crud-modal';
  document.getElementById(mid)?.remove();
  const plans = AuthSubscriptionEngine.getPlans();
  const ep = planIdToEdit ? plans.find(p => p.id === planIdToEdit) : null;
  const tools = window.TOOLS || [];
  const feats = ep && Array.isArray(ep.features) ? ep.features.join('\n') : '';
  const raw = ep ? ep.allowedToolIds : 'all';
  const isAll = (!raw || raw === 'all' || raw === '"all"');
  const aSet = Array.isArray(raw) ? new Set(raw) : new Set();
  const catL = { 'pdf-core': 'Core PDF', 'pdf-convert': 'Conversions', 'image-tools': 'Image & Raster', 'design-prepress': 'Vector & Design', 'print-packaging': 'Prepress', 'video-motion': 'Video', 'fonts-typography': 'Typography', 'developer-tools': 'Developer', 'cad-blueprints': 'CAD', 'legal-medical': 'Legal', 'publishing-ebooks': 'E-Books', 'threed-motion': '3D', 'security-ai-data': 'Security & AI' };
  const cats = {};
  tools.forEach(t => { if (!cats[t.category]) cats[t.category] = []; cats[t.category].push(t); });
  const toolHtml = Object.keys(cats).map(cat => {
    const rows = cats[cat].map(t => `<label class="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-[11px] text-slate-700"><input type="checkbox" name="plan-tool-ids" value="${t.id}" ${(isAll || aSet.has(t.id)) ? 'checked' : ''} class="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0 ptchk-${cat}"><span class="truncate">${t.name}</span></label>`).join('');
    return `<div class="mb-3"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-extrabold text-slate-500 uppercase">${catL[cat] || cat}</span><span class="text-[9px] flex gap-1"><button type="button" onclick="ptSelCat('${cat}',true)" class="text-indigo-600 font-bold hover:underline">All</button>&nbsp;/&nbsp;<button type="button" onclick="ptSelCat('${cat}',false)" class="text-slate-400 font-bold hover:underline">None</button></span></div><div class="grid grid-cols-2 gap-0.5">${rows}</div></div>`;
  }).join('');

  const m = document.createElement('div');
  m.id = mid;
  m.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in';
  m.innerHTML = `<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden relative">
    <button onclick="document.getElementById('${mid}').remove()" class="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"><i class="fa-solid fa-xmark"></i></button>
    <div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex-shrink-0"><h3 class="text-base font-extrabold flex items-center gap-2"><i class="fa-solid fa-crown text-amber-400"></i>${ep ? 'Edit Plan â€” ' + ep.name : 'Create New Plan'}</h3></div>
    <form id="plan-edit-form" onsubmit="handleSavePlanSubmit(event,'${ep ? ep.id : ''}');" class="flex flex-col flex-1 overflow-hidden">
      <div class="flex-1 overflow-y-auto"><div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        <div class="p-5 space-y-4">
          <h4 class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Plan Details</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2"><label class="text-[10px] font-bold text-slate-500 uppercase">Plan Name *</label><input type="text" id="plan-input-name" required value="${ep ? ep.name || '' : ''}" placeholder="e.g. Pro Monthly" class="custom-input w-full text-sm font-bold mt-1"></div>
            <div><label class="text-[10px] font-bold text-slate-500 uppercase">Price (â‚¹) *</label><div class="relative mt-1"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">â‚¹</span><input type="number" id="plan-input-price" required min="0" step="1" value="${ep ? ep.priceINR || 0 : '499'}" class="custom-input w-full pl-7 text-sm font-extrabold"></div></div>
            <div><label class="text-[10px] font-bold text-slate-500 uppercase">Duration (days) *</label><input type="number" id="plan-input-duration" required min="1" value="${ep ? ep.durationDays || 30 : '30'}" class="custom-input w-full text-sm font-bold mt-1"></div>
            <div><label class="text-[10px] font-bold text-slate-500 uppercase">Max File (MB)</label><input type="number" id="plan-input-maxsize" required min="1" value="${ep ? ep.maxFileSizeMB || 25 : '250'}" class="custom-input w-full text-sm font-bold mt-1"></div>
            <div><label class="text-[10px] font-bold text-slate-500 uppercase">Badge</label><input type="text" id="plan-input-badge" value="${ep ? ep.badge || '' : 'Popular'}" placeholder="Popular" class="custom-input w-full text-sm mt-1"></div>
          </div>
          <div><label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Marketing Features <span class="font-normal text-slate-400 normal-case">(one per line)</span></label><textarea id="plan-input-features" rows="5" placeholder="All 50 Tools Unlocked&#10;250MB File Limit" class="custom-input w-full text-xs font-mono resize-y">${feats}</textarea></div>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tool Access</h4>
            <div class="flex gap-1.5"><button type="button" onclick="ptSelAll(true)" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">All</button><button type="button" onclick="ptSelAll(false)" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">None</button></div>
          </div>
          <div id="plan-tool-checkboxes" class="max-h-[380px] overflow-y-auto pr-1">${toolHtml}</div>
        </div>
      </div></div>
      <div class="flex-shrink-0 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3 bg-slate-50/80">
        ${ep && ep.id !== 'free' ? `<button type="button" onclick="if(confirm('Delete plan ${ep.name}?')){ adminDeletePlan('${ep.id}'); document.getElementById('${mid}').remove(); }" class="text-xs font-bold text-red-500 hover:text-red-700 underline flex items-center gap-1"><i class="fa-solid fa-trash-can"></i> Delete</button>` : '<div></div>'}
        <div class="flex gap-3 items-center">
          <button type="button" onclick="document.getElementById('${mid}').remove()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">Cancel</button>
          <button type="submit" id="plan-save-btn" class="btn-gradient px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2"><i class="fa-solid fa-floppy-disk"></i>${ep ? 'Save Changes' : 'Create Plan'}</button>
        </div>
      </div>
    </form>
  </div>`;
  document.body.appendChild(m);
  window.ptSelAll = v => m.querySelectorAll('input[name="plan-tool-ids"]').forEach(cb => { cb.checked = v; });
  window.ptSelCat = (cat, v) => m.querySelectorAll(`input.ptchk-${cat}`).forEach(cb => { cb.checked = v; });
};

window.handleSavePlanSubmit = async function(e, editId) {
  e.preventDefault();
  const btn = document.getElementById('plan-save-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Savingâ€¦'; }
  const name    = document.getElementById('plan-input-name')?.value?.trim() || '';
  const price   = parseFloat(document.getElementById('plan-input-price')?.value || 0);
  const dur     = parseInt(document.getElementById('plan-input-duration')?.value || 30);
  const size    = parseInt(document.getElementById('plan-input-maxsize')?.value || 25);
  const badge   = document.getElementById('plan-input-badge')?.value?.trim() || '';
  const ftext   = document.getElementById('plan-input-features')?.value || '';
  const features = ftext.split('\n').map(f => f.trim()).filter(Boolean);
  const cbs = Array.from(document.querySelectorAll('input[name="plan-tool-ids"]:checked'));
  const all = Array.from(document.querySelectorAll('input[name="plan-tool-ids"]'));
  const allowedToolIds = cbs.length === all.length ? 'all' : cbs.map(cb => cb.value);
  try {
    await AdminPanelEngine.savePlan({ id: editId || ('plan_' + Date.now()), name, priceINR: price, durationDays: dur, maxFileSizeMB: size, badge, features, allowedToolIds });
    document.getElementById('admin-plan-crud-modal')?.remove();
    if (window.showToast) showToast('Plan "' + name + '" saved!', 'success');
    renderFullAdminPage().then(() => { if (window.adminSwitchTab) adminSwitchTab('plans'); });
  } catch(err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Changes'; }
    if (window.showToast) showToast('Save failed: ' + (err.message || err), 'error');
    else alert('Save failed: ' + (err.message || err));
  }
};

window.adminDeletePlanConfirm = async function(planId, planName) {
  if (!confirm('Delete plan "' + planName + '"? This is permanent.')) return;
  await adminDeletePlan(planId);
};

window.adminDeletePlan = async function(planId) {
  try {
    await AdminPanelEngine.deletePlan(planId);
    if (window.showToast) showToast('Plan deleted.', 'success');
    renderFullAdminPage().then(() => { if (window.adminSwitchTab) adminSwitchTab('plans'); });
  } catch(err) {
    if (window.showToast) showToast('Delete failed: ' + (err.message || err), 'error');
    else alert('Delete failed: ' + (err.message || err));
  }
};
