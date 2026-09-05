/**
 * StudioSuite Pro â€” Authentication, Subscription & INR Payment Verification Engine
 * Data layer: Neon Postgres via NeonEngine API calls.
 * Session (current logged-in user) is still kept in localStorage for client-side access.
 */

class AuthSubscriptionEngine {
  // â”€â”€ Only localStorage key kept â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static STORAGE_CURRENT_USER = 'studiosuite_current_user';

  // â”€â”€ In-memory caches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  static _plansCache = null;   // Array of plan objects loaded from DB
  static pendingPlanId = null;

  // â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Called on page load. Loads plans from DB into cache.
   * Also checks if current session user's subscription has expired.
   */
  static async initDefaults() {
    try {
      const plans = await NeonEngine.call('/api/plans', 'GET');
      this._plansCache = plans;
    } catch (e) {
      console.warn('[Auth] initDefaults: could not load plans:', e.message);
      // Fall back to hard-coded defaults so UI still works offline
      this._plansCache = [
        { id: 'free',        name: 'Free Tier',   priceINR: 0,    durationDays: 3650, maxFileSizeMB: 25,   badge: 'Basic',      features: ['Access to 50 Tools', '25MB File Upload Limit', 'Standard Processing Speed'] },
        { id: 'pro-monthly', name: 'Pro Monthly',  priceINR: 499,  durationDays: 30,   maxFileSizeMB: 250,  badge: 'Popular',    features: ['All 50 Master Tools Unlocked', '250MB File Upload Limit', 'Priority Email Support'] },
        { id: 'pro-yearly',  name: 'Pro Annual',   priceINR: 4999, durationDays: 365,  maxFileSizeMB: 1000, badge: 'Best Value', features: ['All Pro Features Included', '1GB Max File Upload Size', '2 Months Free Savings'] },
      ];
    }
    this.checkSubscriptionExpiry();
    this.renderHeaderAuthControls();
  }

  // â”€â”€ Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Returns plans from cache synchronously, or triggers async fetch.
   * Always returns an array (may be empty on first call before cache is warm).
   */
  static getPlans() {
    if (this._plansCache) return this._plansCache;
    // Trigger async load if cache is cold (shouldn't normally happen after initDefaults)
    NeonEngine.call('/api/plans', 'GET').then(plans => {
      this._plansCache = plans;
    }).catch(() => {});
    return [];
  }

  /** Async version â€” always fresh from DB */
  static async fetchPlans() {
    try {
      const plans = await NeonEngine.call('/api/plans', 'GET');
      this._plansCache = plans;
      return plans;
    } catch (e) {
      console.warn('[Auth] fetchPlans failed:', e.message);
      return this._plansCache || [];
    }
  }

  // â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Admin: fetch all users from DB */
  static async getUsers() {
    try {
      return await NeonEngine.call('/api/users', 'GET');
    } catch (e) {
      console.warn('[Auth] getUsers failed:', e.message);
      return [];
    }
  }

  // â”€â”€ Current session user (localStorage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_CURRENT_USER) || 'null');
    } catch {
      return null;
    }
  }

  static _setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_CURRENT_USER);
    }
  }

  // â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async register(email, password, name = 'User') {
    const user = await NeonEngine.call('/api/auth/register', 'POST', { email, password, name });
    this._setCurrentUser(user);
    return user;
  }

  static async login(email, password) {
    const user = await NeonEngine.call('/api/auth/login', 'POST', { email, password });
    this._setCurrentUser(user);
    return user;
  }

  static logout() {
    this._setCurrentUser(null);
    this.renderHeaderAuthControls();
    if (window.showToast) window.showToast('Logged out successfully', 'info');
  }

  // â”€â”€ Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async subscribeUser(userId, planId, transactionId = '') {
    const user = await NeonEngine.call('/api/subscribe', 'POST', {
      user_id: userId,
      plan_id: planId,
      utr: transactionId || ('UPI_INR_' + Date.now()),
    });
    // Update session if it's the current user
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this._setCurrentUser(user);
    }
    // Refresh admin page if open
    if (window.location.hash === '#admin-page' && window.renderFullAdminPage) {
      window.renderFullAdminPage();
    }
    return user;
  }

  /**
   * Admin: update a single user's plan (calls /api/users/:id/plan).
   * Also used by saveUser() when changing plan.
   */
  static async saveUser(userData) {
    try {
      if (userData.planId) {
        const updated = await NeonEngine.call(`/api/users/${userData.id}/plan`, 'POST', { plan_id: userData.planId });
        const current = this.getCurrentUser();
        if (current && current.id === userData.id) {
          this._setCurrentUser({ ...current, ...updated });
        }
        return updated;
      }
      // Profile fields (name, email, phone, org) â€” use profile endpoint
      if (userData.name || userData.email) {
        const updated = await NeonEngine.call(`/api/users/${userData.id}/profile`, 'POST', {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          org: userData.org || '',
        });
        const current = this.getCurrentUser();
        if (current && current.id === userData.id) {
          this._setCurrentUser({ ...current, ...updated });
        }
        return updated;
      }
    } catch (e) {
      throw new Error(e.message || 'Failed to save user');
    }
  }

  static async deleteUser(userId) {
    try {
      return await NeonEngine.call(`/api/users/${userId}`, 'DELETE');
    } catch (e) {
      throw new Error(e.message || 'Failed to delete user');
    }
  }

  static async deleteOwnAccount() {
    const user = this.getCurrentUser();
    if (!user) return;
    await this.deleteUser(user.id);
    this._setCurrentUser(null);
    this.renderHeaderAuthControls();
    if (window.showToast) window.showToast('Account deleted.', 'info');
  }

  // â”€â”€ Expiry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static checkSubscriptionExpiry() {
    const user = this.getCurrentUser();
    if (!user) return;
    if (user.planId !== 'free' && user.expiresAt && new Date(user.expiresAt) <= new Date()) {
      const expired = { ...user, planId: 'free', status: 'expired' };
      this._setCurrentUser(expired);
    }
  }

  // â”€â”€ Tool access control â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * CRITICAL: Subscription enforcement.
   * - Not logged in â†’ false (no access)
   * - Free plan    â†’ false (no access â€” must subscribe)
   * - Pro plans & active â†’ true (full access)
   */
  static isToolAllowedForUser(toolId) {
    const user = this.getCurrentUser();
    if (!user) return false;                          // not logged in
    if (!user.planId || user.planId === 'free') return false; // free plan = no tools
    if (user.status !== 'active') return false;       // expired

    // Pro users get all tools
    const plan = (this._plansCache || []).find(p => p.id === user.planId);
    if (!plan) return true; // plan data not loaded yet â€” allow to avoid blocking

    if (plan.allowedToolIds === 'all' || !plan.allowedToolIds) return true;
    if (Array.isArray(plan.allowedToolIds)) {
      return plan.allowedToolIds.includes(toolId);
    }
    return true;
  }

  /**
   * PRO Plan Upgrade Lock Modal for Restricted Free User Tools
   */

  /** Returns the name of the cheapest plan granting access to toolId, for use in locked badge labels */
  static getRequiredPlanName(toolId) {
    const plans = this._plansCache || [];
    const sorted = [...plans].sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
    for (const plan of sorted) {
      if (!plan || plan.id === 'free') continue;
      const allowed = plan.allowedToolIds;
      if (!allowed || allowed === 'all' || allowed === '"all"') return plan.name;
      if (Array.isArray(allowed) && allowed.includes(toolId)) return plan.name;
      try {
        const parsed = JSON.parse(allowed);
        if (parsed === 'all') return plan.name;
        if (Array.isArray(parsed) && parsed.includes(toolId)) return plan.name;
      } catch {}
    }
    const firstPaid = sorted.find(p => p.id !== 'free' && (p.priceINR || 0) > 0);
    return firstPaid ? firstPaid.name : 'PRO';
  }
  static openProUpgradeLockModal(toolOrId) {
    const tools = window.TOOLS || [];
    const tool = typeof toolOrId === 'string' ? tools.find(t => t.id === toolOrId) : toolOrId;
    const toolName = tool ? tool.name : 'this feature';

    const modalId = 'pro-upgrade-lock-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-5 relative overflow-hidden">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i class="fa-solid fa-lock"></i>
        </div>

        <div class="space-y-2">
          <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
            <i class="fa-solid fa-crown text-amber-500"></i> PRO Plan Required
          </span>
          <h3 class="text-xl font-extrabold text-slate-900">No Access on Free Tier</h3>
          <p class="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            <strong>${toolName}</strong> is a PRO subscription feature. Upgrade your subscription plan to unlock full access to this tool and all master features.
          </p>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <p class="font-extrabold text-slate-800 flex items-center gap-1.5">
            <i class="fa-solid fa-sparkles text-indigo-600"></i> What you unlock with PRO:
          </p>
          <ul class="space-y-1.5 text-slate-600 font-medium text-[11px]">
            <li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500"></i> Full access to all 50+ master tools & AI features</li>
            <li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500"></i> Up to 1GB Max File Upload limits</li>
            <li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500"></i> High-speed WebAssembly processing engine</li>
          </ul>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <button onclick="document.getElementById('${modalId}').remove(); AuthSubscriptionEngine.openSubscriptionModal();" class="w-full btn-gradient py-3 text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-crown text-amber-300"></i> Upgrade Subscription Plan Now
          </button>
          <button onclick="document.getElementById('${modalId}').remove()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
            Dismiss
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // â”€â”€ Header Auth Controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static renderHeaderAuthControls() {
    const container = document.getElementById('header-auth-controls');
    if (!container) return;

    const user = this.getCurrentUser();
    const plans = this.getPlans();
    const currentPlan = user ? plans.find(p => p.id === user.planId) : null;
    const isSubscribed = user && user.planId !== 'free' && user.status === 'active';

    const workHistoryNav = document.getElementById('nav-work-history');
    if (workHistoryNav) {
      workHistoryNav.classList.toggle('hidden', !isSubscribed);
    }

    if (user) {
      const planName = currentPlan ? currentPlan.name : (user.planId === 'free' ? 'Free Plan' : user.planId);
      const isPro = user.planId !== 'free';

      container.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="AuthSubscriptionEngine.openSubscriptionModal()" class="px-3 py-1.5 rounded-xl ${isPro ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'} font-extrabold text-xs flex items-center gap-1.5 transition hover:scale-105">
            <i class="fa-solid fa-crown text-amber-400"></i>
            <span>${isPro ? planName : 'Upgrade to PRO'}</span>
          </button>

          <div class="relative group">
            <button class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold text-xs border border-slate-200 transition">
              <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-extrabold uppercase shadow-sm">
                ${(user.name || user.email)[0]}
              </div>
              <span class="max-w-[100px] truncate hidden sm:inline">${user.name || user.email.split('@')[0]}</span>
              <i class="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>

            <div class="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50 animate-fade-in">
              <div class="px-4 py-2 border-b border-slate-100">
                <p class="font-extrabold text-slate-900 text-xs truncate">${user.name || 'User'}</p>
                <p class="text-[11px] text-slate-500 truncate">${user.email}</p>
                <div class="mt-1 flex items-center justify-between">
                  <span class="text-[10px] px-2 py-0.5 rounded-full ${isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'} font-bold">
                    ${planName}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">${user.status || 'active'}</span>
                </div>
              </div>

              <button onclick="AuthSubscriptionEngine.openProfileModal()" class="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <i class="fa-solid fa-user-circle mr-2 text-indigo-500"></i> Profile
              </button>

              ${isSubscribed ? `
                <a href="#history" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                  <i class="fa-solid fa-clock-rotate-left mr-2 text-indigo-500"></i> Work History
                </a>
              ` : ''}

              <button onclick="AuthSubscriptionEngine.openSubscriptionModal()" class="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50">
                <i class="fa-solid fa-crown mr-2 text-amber-500"></i> Subscription Plans
              </button>

              <div class="border-t border-slate-100 mt-1 pt-1">
                <button onclick="AuthSubscriptionEngine.logout()" class="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                  <i class="fa-solid fa-right-from-bracket mr-2"></i> Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="AuthSubscriptionEngine.openAuthModal('login')" class="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition">
            Sign In
          </button>
          <button onclick="AuthSubscriptionEngine.openAuthModal('register')" class="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-sm transition">
            Create Account
          </button>
          <button onclick="AuthSubscriptionEngine.openSubscriptionModal()" class="px-3.5 py-1.5 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5">
            <i class="fa-solid fa-crown text-amber-300"></i>
            <span class="hidden sm:inline">Subscribe</span>
          </button>
        </div>
      `;
    }
  }

  // â”€â”€ Profile Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static openProfileModal() {
    const user = this.getCurrentUser();
    if (!user) return;
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === user.planId);
    const planName = plan ? plan.name : 'Free Plan';
    const isPro = user.planId !== 'free';
    const expiresAt = user.expiresAt ? new Date(user.expiresAt) : null;
    const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 86400000)) : null;

    const planOrder = ['free', 'pro-monthly', 'pro-yearly'];
    const currentIdx = planOrder.indexOf(user.planId);
    const nextPlan = plans.find(p => p.id === planOrder[currentIdx + 1]);

    const modalId = 'profile-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const initials = (user.name || user.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = ['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600'];
    const avatarColor = avatarColors[user.id ? user.id.charCodeAt(4) % avatarColors.length : 0];

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg mx-auto overflow-hidden relative flex flex-col" style="max-height:95vh;">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-3 right-3 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white px-6 pt-8 pb-6 text-center space-y-3 shrink-0">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center mx-auto text-2xl font-extrabold shadow-lg shadow-indigo-900/40 border-2 border-white/20">
            ${initials}
          </div>
          <div>
            <h3 class="text-lg font-extrabold text-white">${user.name || 'User'}</h3>
            <p class="text-xs text-slate-400">${user.email}</p>
          </div>
          <div class="flex justify-center gap-2 flex-wrap">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${isPro ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-600/60 text-slate-300 border border-slate-500/30'}">
              <i class="fa-solid ${isPro ? 'fa-crown' : 'fa-user'} mr-1"></i>${planName}
            </span>
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}">
              ${user.status || 'active'}
            </span>
            ${daysLeft !== null && isPro ? `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">${daysLeft}d left</span>` : ''}
          </div>
        </div>

        <div class="flex border-b border-slate-200 shrink-0">
          <button onclick="switchProfileTab('edit')" id="ptab-edit" class="flex-1 py-2.5 text-xs font-extrabold border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-user-pen"></i> Edit Profile
          </button>
          <button onclick="switchProfileTab('plan')" id="ptab-plan" class="flex-1 py-2.5 text-xs font-extrabold border-b-2 border-transparent text-slate-500 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-crown"></i> Plan & Upgrade
          </button>
          <button onclick="switchProfileTab('security')" id="ptab-security" class="flex-1 py-2.5 text-xs font-extrabold border-b-2 border-transparent text-slate-500 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-shield-halved"></i> Security
          </button>
        </div>

        <div class="overflow-y-auto flex-1">

          <!-- Edit Profile Tab -->
          <div id="ptab-content-edit" class="p-5 space-y-4">
            <form onsubmit="AuthSubscriptionEngine.handleProfileSave(event)" class="space-y-4">
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Full Name</label>
                <input type="text" id="profile-name" class="custom-input w-full text-sm font-semibold" value="${(user.name || '').replace(/"/g, '&quot;')}" placeholder="Your full name" required>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Email Address</label>
                <input type="email" id="profile-email" class="custom-input w-full text-sm" value="${(user.email || '').replace(/"/g, '&quot;')}" placeholder="your@email.com" required>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Phone Number <span class="text-slate-300 font-normal">(optional)</span></label>
                <input type="tel" id="profile-phone" class="custom-input w-full text-sm" value="${(user.phone || '').replace(/"/g, '&quot;')}" placeholder="+91 98765 43210">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Organisation / Company <span class="text-slate-300 font-normal">(optional)</span></label>
                <input type="text" id="profile-org" class="custom-input w-full text-sm" value="${(user.org || '').replace(/"/g, '&quot;')}" placeholder="Your organisation or company name">
              </div>
              <div id="profile-save-msg" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <i class="fa-solid fa-circle-check mr-1"></i> Profile updated successfully!
              </div>
              <div id="profile-err-msg" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold"></div>
              <button type="submit" class="w-full btn-gradient py-3 text-xs font-extrabold rounded-xl shadow-lg">
                <i class="fa-solid fa-floppy-disk mr-1.5"></i> Save Profile Changes
              </button>
            </form>
          </div>

          <!-- Plan & Upgrade Tab -->
          <div id="ptab-content-plan" class="p-5 space-y-4 hidden">
            <div class="p-4 rounded-2xl border ${isPro ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50'} space-y-2">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-crown text-amber-500 text-lg"></i>
                <span class="font-extrabold text-slate-900 text-sm">Current Plan: ${planName}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2 bg-white rounded-lg border border-slate-200">
                  <div class="text-slate-500 text-[10px] font-bold uppercase">Status</div>
                  <div class="font-extrabold text-slate-900 mt-0.5 capitalize">${user.status || 'active'}</div>
                </div>
                ${expiresAt ? `<div class="p-2 bg-white rounded-lg border border-slate-200">
                  <div class="text-slate-500 text-[10px] font-bold uppercase">${isPro ? 'Expires' : 'Renews'}</div>
                  <div class="font-extrabold text-slate-900 mt-0.5">${expiresAt.toLocaleDateString()}</div>
                </div>` : ''}
                <div class="p-2 bg-white rounded-lg border border-slate-200">
                  <div class="text-slate-500 text-[10px] font-bold uppercase">File Limit</div>
                  <div class="font-extrabold text-slate-900 mt-0.5">${plan ? plan.maxFileSizeMB + ' MB' : '25 MB'}</div>
                </div>
                ${isPro && daysLeft !== null ? `<div class="p-2 bg-white rounded-lg border border-slate-200">
                  <div class="text-slate-500 text-[10px] font-bold uppercase">Days Remaining</div>
                  <div class="font-extrabold ${daysLeft < 7 ? 'text-red-600' : 'text-emerald-700'} mt-0.5">${daysLeft} days</div>
                </div>` : ''}
              </div>
              ${plan && Array.isArray(plan.features) ? `
              <div class="border-t border-slate-200 pt-2 mt-1">
                <p class="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Your Plan Includes</p>
                <ul class="space-y-1">
                  ${plan.features.slice(0, 4).map(f => `<li class="text-xs text-slate-700 flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500"></i>${f}</li>`).join('')}
                </ul>
              </div>` : ''}
            </div>

            ${nextPlan ? `
            <div class="p-4 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-arrow-up text-indigo-600"></i>
                <span class="font-extrabold text-indigo-900 text-sm">Upgrade to ${nextPlan.name}</span>
                <span class="ml-auto text-xs font-extrabold text-indigo-700">â‚¹${nextPlan.priceINR}</span>
              </div>
              ${Array.isArray(nextPlan.features) ? `
              <ul class="space-y-1.5">
                ${nextPlan.features.slice(0, 4).map(f => `<li class="text-xs text-indigo-800 flex items-center gap-1.5"><i class="fa-solid fa-sparkles text-amber-500"></i>${f}</li>`).join('')}
              </ul>` : ''}
              <button onclick="document.getElementById('${modalId}').remove(); AuthSubscriptionEngine.openPaymentModal('${nextPlan.id}');" class="w-full btn-gradient py-3 text-xs font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2">
                <i class="fa-solid fa-crown text-amber-300"></i> Upgrade to ${nextPlan.name} â€” â‚¹${nextPlan.priceINR}
              </button>
            </div>
            ` : `
            <div class="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-center space-y-2">
              <i class="fa-solid fa-trophy text-emerald-600 text-2xl"></i>
              <p class="font-extrabold text-emerald-800 text-sm">You're on the highest plan!</p>
              <p class="text-xs text-emerald-700">Enjoy all premium features with your ${planName}.</p>
            </div>
            `}

            <div class="space-y-2 pt-1">
              <p class="text-[10px] font-extrabold text-slate-500 uppercase">All Available Plans</p>
              ${plans.map(p => {
                const isCur = user.planId === p.id;
                return `<div class="flex items-center justify-between p-3 rounded-xl border ${isCur ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'} transition">
                  <div>
                    <span class="font-extrabold text-xs text-slate-900">${p.name}</span>
                    <span class="text-[10px] text-slate-500 ml-2">â‚¹${p.priceINR} / ${p.durationDays >= 365 ? 'year' : 'month'}</span>
                  </div>
                  ${isCur
                    ? `<span class="text-[10px] font-extrabold px-2 py-1 rounded-full bg-indigo-600 text-white">Active</span>`
                    : `<button onclick="document.getElementById('${modalId}').remove(); AuthSubscriptionEngine.openPaymentModal('${p.id}');" class="text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-700 text-white transition">${p.priceINR === 0 ? 'Select' : 'Switch'}</button>`
                  }
                </div>`;
              }).join('')}
            </div>
          </div>

          <!-- Security Tab -->
          <div id="ptab-content-security" class="p-5 space-y-4 hidden">
            <form onsubmit="AuthSubscriptionEngine.handlePasswordChange(event)" class="space-y-4">
              <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
                <i class="fa-solid fa-triangle-exclamation text-amber-500 mr-1"></i>
                Password is stored securely. Choose a strong, unique password.
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Current Password</label>
                <input type="password" id="profile-current-pw" class="custom-input w-full text-sm" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">New Password</label>
                <input type="password" id="profile-new-pw" class="custom-input w-full text-sm" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required minlength="6">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Confirm New Password</label>
                <input type="password" id="profile-confirm-pw" class="custom-input w-full text-sm" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required minlength="6">
              </div>
              <div id="profile-pw-msg" class="hidden p-3 rounded-xl text-xs font-bold"></div>
              <button type="submit" class="w-full py-3 text-xs font-extrabold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow">
                <i class="fa-solid fa-lock mr-1.5"></i> Update Password
              </button>
            </form>

            <div class="pt-3 border-t border-slate-200">
              <button onclick="if(confirm('Are you sure you want to delete your account? This cannot be undone.')) { AuthSubscriptionEngine.deleteOwnAccount(); document.getElementById('${modalId}').remove(); }" class="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-extrabold text-xs hover:bg-red-50 transition">
                <i class="fa-solid fa-trash-can mr-1.5"></i> Delete My Account
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(modal);

    window.switchProfileTab = function(tab) {
      ['edit', 'plan', 'security'].forEach(t => {
        const btn = document.getElementById(`ptab-${t}`);
        const content = document.getElementById(`ptab-content-${t}`);
        if (btn) {
          btn.className = `flex-1 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center justify-center gap-1.5 ${t === tab ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`;
        }
        if (content) content.classList.toggle('hidden', t !== tab);
      });
    };
  }

  static async handleProfileSave(e) {
    e.preventDefault();
    const user = this.getCurrentUser();
    if (!user) return;
    const name = document.getElementById('profile-name')?.value?.trim();
    const email = document.getElementById('profile-email')?.value?.trim();
    const phone = document.getElementById('profile-phone')?.value?.trim();
    const org = document.getElementById('profile-org')?.value?.trim();
    const errDiv = document.getElementById('profile-err-msg');
    const msgDiv = document.getElementById('profile-save-msg');
    if (errDiv) errDiv.classList.add('hidden');

    try {
      const updated = await NeonEngine.call(`/api/users/${user.id}/profile`, 'POST', { name, email, phone, org });
      this._setCurrentUser({ ...user, ...updated });
      this.renderHeaderAuthControls();
      if (msgDiv) { msgDiv.classList.remove('hidden'); setTimeout(() => msgDiv.classList.add('hidden'), 3000); }
    } catch (ex) {
      if (errDiv) { errDiv.textContent = ex.message || 'Failed to update profile.'; errDiv.classList.remove('hidden'); }
    }
  }

  static async handlePasswordChange(e) {
    e.preventDefault();
    const user = this.getCurrentUser();
    const msgDiv = document.getElementById('profile-pw-msg');
    const currentPw = document.getElementById('profile-current-pw')?.value;
    const newPw = document.getElementById('profile-new-pw')?.value;
    const confirmPw = document.getElementById('profile-confirm-pw')?.value;

    const setMsg = (text, success) => {
      if (!msgDiv) return;
      msgDiv.textContent = text;
      msgDiv.className = `p-3 rounded-xl text-xs font-bold ${success ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`;
      msgDiv.classList.remove('hidden');
    };

    if (newPw !== confirmPw) { setMsg('New passwords do not match.', false); return; }
    if (newPw.length < 6) { setMsg('Password must be at least 6 characters.', false); return; }

    try {
      await NeonEngine.call(`/api/users/${user.id}/password`, 'POST', {
        current_password: currentPw,
        new_password: newPw,
      });
      setMsg('Password updated successfully!', true);
      document.getElementById('profile-current-pw').value = '';
      document.getElementById('profile-new-pw').value = '';
      document.getElementById('profile-confirm-pw').value = '';
    } catch (ex) {
      setMsg(ex.message || 'Failed to update password.', false);
    }
  }

  // â”€â”€ Auth Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static openAuthModal(initialTab = 'login', pendingPlanId = null) {
    this.pendingPlanId = pendingPlanId;
    const modalId = 'studiosuite-auth-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-100 text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl mx-auto shadow-md shadow-indigo-500/20">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <h3 class="text-2xl font-extrabold text-slate-900">StudioSuite Account</h3>
          <p class="text-xs text-slate-500">Sign in to save your files, track subscriptions, and sync history.</p>
        </div>

        <div class="flex border-b border-slate-200">
          <button type="button" id="tab-btn-login" onclick="AuthSubscriptionEngine.switchAuthTab('login')" class="flex-1 py-3 text-xs font-extrabold text-center border-b-2 ${initialTab === 'login' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'} transition">
            Sign In
          </button>
          <button type="button" id="tab-btn-register" onclick="AuthSubscriptionEngine.switchAuthTab('register')" class="flex-1 py-3 text-xs font-extrabold text-center border-b-2 ${initialTab === 'register' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'} transition">
            Create Account
          </button>
        </div>

        <div class="p-6">
          <form id="auth-form" onsubmit="AuthSubscriptionEngine.handleAuthSubmit(event)" class="space-y-4">
            <input type="hidden" id="auth-tab-mode" value="${initialTab}">

            <div id="auth-name-group" class="${initialTab === 'register' ? '' : 'hidden'} space-y-1">
              <label class="text-xs font-bold text-slate-600">Full Name</label>
              <input type="text" id="auth-name" class="custom-input w-full text-xs" placeholder="John Doe">
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600">Email Address</label>
              <input type="email" id="auth-email" class="custom-input w-full text-xs" placeholder="name@domain.com" required>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600">Password</label>
              <input type="password" id="auth-password" class="custom-input w-full text-xs" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required>
            </div>

            <div id="auth-error-msg" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold"></div>

            <button type="submit" id="auth-submit-btn" class="w-full btn-gradient py-3 text-xs rounded-xl font-extrabold shadow-lg shadow-indigo-500/20">
              ${initialTab === 'login' ? 'Sign In to Account' : 'Create & Subscribe'}
            </button>
          </form>

          <p class="text-[11px] text-slate-400 text-center mt-4">
            By continuing, you agree to StudioSuite's 100% In-Browser Privacy Shield.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static switchAuthTab(tab) {
    const tabMode = document.getElementById('auth-tab-mode');
    const nameGroup = document.getElementById('auth-name-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');

    if (tabMode) tabMode.value = tab;

    if (tab === 'register') {
      if (nameGroup) nameGroup.classList.remove('hidden');
      if (submitBtn) submitBtn.textContent = 'Create & Register Account';
      if (tabRegister) tabRegister.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition';
      if (tabLogin) tabLogin.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-500 transition';
    } else {
      if (nameGroup) nameGroup.classList.add('hidden');
      if (submitBtn) submitBtn.textContent = 'Sign In to Account';
      if (tabLogin) tabLogin.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition';
      if (tabRegister) tabRegister.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-500 transition';
    }
  }

  static async handleAuthSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('auth-tab-mode')?.value;
    const name = document.getElementById('auth-name')?.value || 'User';
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    const errorDiv = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (errorDiv) errorDiv.classList.add('hidden');

    // Disable button during request
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Processing...'; }

    try {
      if (mode === 'register') {
        await this.register(email, password, name);
        if (window.showToast) window.showToast('Account created successfully!', 'success');
      } else {
        await this.login(email, password);
        if (window.showToast) window.showToast('Welcome back!', 'success');
      }

      document.getElementById('studiosuite-auth-modal')?.remove();
      this.renderHeaderAuthControls();
      // Re-render tools to apply access control for newly logged in user
      if (window.renderTools) window.renderTools();
      // Hide gate screen if now subscribed
      this.checkAndShowGateScreen();
      document.body.style.overflow = '';

      const pending = this.pendingPlanId;
      this.pendingPlanId = null;
      if (pending) {
        setTimeout(() => this.openPaymentModal(pending), 200);
      }
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Authentication failed.';
        errorDiv.classList.remove('hidden');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'register' ? 'Create & Register Account' : 'Sign In to Account';
      }
    }
  }

  // â”€â”€ Subscription Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static openSubscriptionModal() {
    const modalId = 'studiosuite-sub-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const plans = this.getPlans();
    const user = this.getCurrentUser();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-[98vw] sm:max-w-2xl md:max-w-4xl mx-auto overflow-hidden relative flex flex-col" style="max-height:95vh;">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:bg-white/30 w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 transition z-30 shadow-md" aria-label="Close">
          <i class="fa-solid fa-xmark text-base"></i>
        </button>

        <div class="px-4 py-5 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white text-center space-y-2 relative shrink-0 overflow-hidden pr-12 sm:pr-16">
          <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl font-black pointer-events-none select-none">PRO</div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs font-bold">
            <i class="fa-solid fa-shield-check"></i>
            <span class="hidden xs:inline">100% In-Browser &bull; Private &amp; Secure</span>
            <span class="xs:hidden">Private &amp; Secure</span>
          </div>
          <h2 class="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">Choose Your Premium Plan</h2>
          <p class="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto hidden sm:block">
            Scan UPI QR Code to upgrade instantly. 100% Client-side privacy &amp; unlimited WebAssembly processing.
          </p>
        </div>

        <div class="p-3 sm:p-6 md:p-8 bg-slate-50 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            ${plans.map(plan => {
              const isCurrent = user && user.planId === plan.id;
              const isPopular = plan.badge === 'Popular' || plan.id === 'pro-monthly';
              const featuresList = Array.isArray(plan.features) ? plan.features : [];
              const featuresHtml = featuresList.map((feat, fi) => `
                <li class="flex items-start gap-2 ${fi >= 3 ? 'hidden sm:flex plan-feat-extra' : ''}">
                  <i class="fa-solid fa-circle-check text-emerald-500 mt-0.5 flex-shrink-0"></i>
                  <span>${feat}</span>
                </li>
              `).join('');
              return `
                <div class="bg-white rounded-xl sm:rounded-2xl border ${isPopular ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl' : 'border-slate-200 shadow-sm'} p-4 sm:p-6 flex flex-col justify-between relative hover:shadow-md transition">
                  ${plan.badge ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isPopular ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'} shadow-sm whitespace-nowrap">${plan.badge}</span>` : ''}
                  <div>
                    <h3 class="font-extrabold text-base sm:text-lg text-slate-900">${plan.name}</h3>
                    <div class="mt-2 flex items-baseline gap-1">
                      <span class="text-2xl sm:text-3xl font-black text-slate-900">â‚¹${plan.priceINR}</span>
                      <span class="text-xs text-slate-500 font-bold">/ ${plan.durationDays >= 365 ? 'year' : plan.durationDays > 1 ? 'month' : 'lifetime'}</span>
                    </div>
                    <ul class="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">${featuresHtml}</ul>
                  </div>
                  <div class="mt-5 pt-3 border-t border-slate-100">
                    ${isCurrent ? `
                      <button disabled class="w-full py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-default">
                        <i class="fa-solid fa-check"></i> Current Active Plan
                      </button>
                    ` : `
                      <button onclick="AuthSubscriptionEngine.openPaymentModal('${plan.id}')" class="w-full ${isPopular ? 'btn-gradient' : 'bg-slate-900 hover:bg-slate-800 text-white'} py-2.5 sm:py-3 rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2">
                        <i class="fa-solid fa-qrcode"></i>
                        <span>${plan.priceINR === 0 ? 'Select Free Plan' : `Pay â‚¹${plan.priceINR} via UPI`}</span>
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <p class="text-center text-xs text-slate-400 mt-5 pb-2">
            <i class="fa-solid fa-shield-check text-indigo-600 mr-1"></i> All payments in â‚¹ INR. Verified via UTR reference &amp; recorded in Admin Panel.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // â”€â”€ Payment Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static openPaymentModal(planId) {
    let user = this.getCurrentUser();
    if (!user) {
      document.getElementById('studiosuite-sub-modal')?.remove();
      this.openAuthModal('register', planId);
      if (window.showToast) window.showToast('Please sign in or create an account to subscribe', 'info');
      return;
    }

    const plans = this.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.priceINR === 0) {
      this.subscribeUser(user.id, plan.id, 'FREE_TIER').then(() => {
        document.getElementById('studiosuite-sub-modal')?.remove();
        this.renderHeaderAuthControls();
        if (window.renderTools) window.renderTools();
        if (window.showToast) window.showToast('Activated Free Tier successfully!', 'success');
      }).catch(ex => {
        if (window.showToast) window.showToast(ex.message || 'Failed to activate plan.', 'error');
      });
      return;
    }

    const adminUpi = (window.AdminPanelEngine && AdminPanelEngine.getAdminUpi())
      || (window.NeonEngine?._settingsCache?.admin_upi)
      || 'merchant@upi';
    const rawUpiUri = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=StudioSuitePRO&am=${plan.priceINR}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(rawUpiUri)}`;

    const modalId = 'studiosuite-pay-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full my-2 sm:my-6 overflow-hidden relative flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-3 right-3 text-white hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 transition z-30 shadow-md" aria-label="Close">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <div class="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white text-center space-y-2 shrink-0 relative overflow-hidden pr-10">
          <div class="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl mx-auto shadow-inner">
            <i class="fa-solid fa-qrcode"></i>
          </div>
          <h3 class="text-xl font-extrabold">Pay via UPI QR & Activate Premium</h3>
          <p class="text-xs text-emerald-100">Scan QR Code or Pay to UPI ID to unlock ${plan.name}</p>
        </div>

        <div class="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div class="flex justify-between font-bold text-slate-700">
              <span>Selected Plan:</span>
              <span class="text-indigo-600 font-extrabold">${plan.name}</span>
            </div>
            <div class="flex justify-between font-bold text-slate-700 pt-2 border-t border-slate-200 text-sm">
              <span>Total Payable:</span>
              <span class="text-emerald-600 font-black text-base">â‚¹${plan.priceINR} INR</span>
            </div>
          </div>

          <div class="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-center space-y-3">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span><i class="fa-solid fa-camera mr-1"></i> Scan with UPI App</span>
              <span class="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">GPay / PhonePe / Paytm</span>
            </div>
            <div class="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
              <img src="${qrUrl}" alt="UPI QR Code" class="w-full h-full object-contain">
            </div>
            <a href="${rawUpiUri}" class="sm:hidden block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md text-center">
              <i class="fa-solid fa-mobile-screen mr-1"></i> Tap to Open UPI App on Mobile
            </a>
            <div class="pt-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Admin Receiving UPI ID:</label>
              <div class="flex gap-2">
                <input type="text" id="pay-upi-id-input" class="custom-input w-full text-xs font-mono font-bold text-slate-900 bg-white" value="${adminUpi}" readonly>
                <button type="button" onclick="AuthSubscriptionEngine.copyAdminUpi()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm transition">
                  <i class="fa-solid fa-copy"></i> Copy
                </button>
              </div>
            </div>
          </div>

          <form onsubmit="AuthSubscriptionEngine.handlePaymentSubmit(event, '${user.id}', '${plan.id}')" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                Enter 12-Digit UPI Payment UTR / RRN Ref No <span class="text-red-500">*</span>
              </label>
              <input type="text" id="pay-utr-number" required placeholder="e.g. 424589012345" maxlength="16" class="custom-input w-full text-sm font-mono font-bold text-slate-900 tracking-wider">
              <p class="text-[11px] text-slate-500 mt-1">
                <i class="fa-solid fa-circle-info text-indigo-500 mr-1"></i> Check your UPI app for the 12-digit Ref / UTR / RRN number.
              </p>
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white py-3.5 text-xs rounded-2xl font-extrabold shadow-lg transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-shield-check"></i> Verify UTR & Activate Premium (â‚¹${plan.priceINR})
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static copyAdminUpi() {
    const input = document.getElementById('pay-upi-id-input');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      if (window.showToast) window.showToast('Admin UPI ID copied to clipboard!', 'success');
    }
  }

  static async handlePaymentSubmit(e, userId, planId) {
    e.preventDefault();
    const utr = document.getElementById('pay-utr-number')?.value?.trim();
    if (!utr || utr.length < 8) {
      alert('Please enter a valid 12-digit UPI Payment UTR / RRN Reference Number.');
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Verifying...'; }

    try {
      await this.subscribeUser(userId, planId, utr);
      document.getElementById('studiosuite-pay-modal')?.remove();
      document.getElementById('studiosuite-sub-modal')?.remove();
      this.renderHeaderAuthControls();
      if (window.renderTools) window.renderTools();
      this.checkAndShowGateScreen();
      document.body.style.overflow = '';
      if (window.showToast) window.showToast(`Payment verified via UTR ${utr}! Your subscription is now ACTIVE.`, 'success');
    } catch (err) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Verify UTR & Activate Premium'; }
      alert(err.message || 'Payment processing failed.');
    }
  }
}

  /** Show or hide the subscription gate screen based on user auth state */
  static checkAndShowGateScreen() {
    const gate = document.getElementById('subscription-gate-screen');
    if (!gate) return;
    const user = this.getCurrentUser();
    const isSubscribed = user && user.planId !== 'free' && user.status === 'active';
    const isAdmin = window.AdminPanelEngine && AdminPanelEngine.isAdminLoggedIn();
    const hash = window.location.hash;
    // Bypass gate for admin/quiz pages
    if (hash === '#admin-page' || hash === '#admin' || hash.startsWith('#quiz/') || hash.startsWith('#take-quiz/') || hash.startsWith('#quiz-dashboard/')) {
      gate.classList.add('hidden');
      return;
    }
    if (!user || (!isSubscribed && !isAdmin)) {
      gate.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      gate.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
window.AuthSubscriptionEngine = AuthSubscriptionEngine;

// Boot: load plans from DB (async), then render header
AuthSubscriptionEngine.initDefaults().catch(e => {
  console.warn('[Auth] initDefaults error:', e);
});

// Show gate screen to visitors who are not subscribed
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    AuthSubscriptionEngine.checkAndShowGateScreen();
  }, 400);
});
window.addEventListener('hashchange', function() {
  const h = window.location.hash;
  // Don't show gate on admin/quiz pages
  if (h === '#admin-page' || h === '#admin' || h.startsWith('#quiz/') || h.startsWith('#take-quiz/') || h.startsWith('#quiz-dashboard/')) return;
  AuthSubscriptionEngine.checkAndShowGateScreen();
});
