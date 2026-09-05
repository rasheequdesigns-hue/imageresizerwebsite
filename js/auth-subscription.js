/**
 * StudioSuite Pro — Authentication, Subscription & UTR Payment Engine
 * Data layer: Supabase Auth + Postgres via SupabaseEngine.
 * Session is kept in localStorage + Supabase's own session storage.
 */

class AuthSubscriptionEngine {
  // ── Storage keys ──────────────────────────────────────────────────────────
  static STORAGE_CURRENT_USER = 'studiosuite_current_user';

  // ── In-memory caches ──────────────────────────────────────────────────────
  static _plansCache  = null;
  static pendingPlanId = null;

  // ── Init ──────────────────────────────────────────────────────────────────

  /**
   * Called on page load. Loads plans, restores session, checks expiry.
   */
  static async initDefaults() {
    try {
      const plans = await SupabaseEngine.getPlans();
      this._plansCache = plans;
    } catch (e) {
      console.warn('[Auth] initDefaults: could not load plans:', e.message);
      this._plansCache = SupabaseEngine.DEFAULT_PLANS;
    }

    // Restore session from Supabase (auto-refresh token)
    try {
      const session = await SupabaseEngine.getSession();
      if (session && session.user) {
        const profile = await SupabaseEngine.getProfile(session.user.id);
        if (profile) {
          this._setCurrentUser(profile);
        } else {
          this._setCurrentUser(null);
        }
      } else {
        // No Supabase session → ensure localStorage is also cleared
        const stored = this.getCurrentUser();
        if (stored) this._setCurrentUser(null);
      }
    } catch (e) {
      console.warn('[Auth] session restore failed:', e.message);
    }

    this.checkSubscriptionExpiry();
    this.renderHeaderAuthControls();
  }

  // ── Plans ─────────────────────────────────────────────────────────────────

  static getPlans() {
    if (this._plansCache) return this._plansCache;
    SupabaseEngine.getPlans().then(plans => { this._plansCache = plans; }).catch(() => {});
    return SupabaseEngine.DEFAULT_PLANS;
  }

  static async fetchPlans() {
    try {
      const plans = await SupabaseEngine.getPlans();
      this._plansCache = plans;
      return plans;
    } catch (e) {
      return this._plansCache || SupabaseEngine.DEFAULT_PLANS;
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  static async getUsers() {
    return SupabaseEngine.getUsers();
  }

  // ── Current session user (localStorage) ───────────────────────────────────

  static getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_CURRENT_USER) || 'null');
    } catch { return null; }
  }

  static _setCurrentUser(user) {
    if (user) localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(user));
    else       localStorage.removeItem(this.STORAGE_CURRENT_USER);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  static async register(email, password, name = 'User') {
    const { user } = await SupabaseEngine.signUp(email, password, name);
    if (!user) throw new Error('Account creation failed. Please try again.');

    // Fetch freshly created profile
    let profile = null;
    for (let i = 0; i < 5; i++) {
      profile = await SupabaseEngine.getProfile(user.id);
      if (profile) break;
      await new Promise(r => setTimeout(r, 500));
    }
    if (!profile) {
      profile = { id: user.id, email, name, planId: 'free', status: 'pending', subscriptionVerified: false };
    }

    this._setCurrentUser(profile);
    return profile;
  }

  static async login(email, password) {
    const { user } = await SupabaseEngine.signIn(email, password);
    if (!user) throw new Error('Login failed. Check your email and password.');

    const profile = await SupabaseEngine.getProfile(user.id);
    if (!profile) throw new Error('Account not found. Please register first.');

    this._setCurrentUser(profile);
    return profile;
  }

  static async logout() {
    await SupabaseEngine.signOut();
    this._setCurrentUser(null);
    this.renderHeaderAuthControls();
    if (window.showToast) window.showToast('Logged out successfully', 'info');
    // Show gate screen after logout
    this.checkAndShowGateScreen();
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  /**
   * Submit a UTR payment (admin must verify before plan is activated).
   */
  static async submitUTR(userId, planId, utrNumber) {
    const plans = this.getPlans();
    const plan  = plans.find(p => p.id === planId) || plans[1];

    const payment = await SupabaseEngine.submitPayment({
      userId,
      planType: plan.id,
      amountINR: plan.priceINR,
      utrNumber,
    });

    // Mark user as pending verification
    await SupabaseEngine.updateProfile(userId, { current_plan: planId, subscription_verified: false });
    const updated = await SupabaseEngine.getProfile(userId);
    const current = this.getCurrentUser();
    if (current && current.id === userId) this._setCurrentUser(updated);
    return { payment, user: updated };
  }

  /** Admin: activate a plan directly (legacy / free plan flow) */
  static async subscribeUser(userId, planId, transactionId = '') {
    const plans = this.getPlans();
    const plan  = plans.find(p => p.id === planId);
    const durationDays = plan ? plan.durationDays : 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);

    await SupabaseEngine.updateProfile(userId, {
      current_plan: planId,
      plan_expiry: expiry.toISOString(),
      subscription_verified: planId === 'free' ? false : true,
    });

    const updated = await SupabaseEngine.getProfile(userId);
    const current = this.getCurrentUser();
    if (current && current.id === userId) this._setCurrentUser(updated);

    if (window.location.hash === '#admin-page' && window.renderFullAdminPage) {
      window.renderFullAdminPage();
    }
    return updated;
  }

  static async saveUser(userData) {
    try {
      if (userData.planId) {
        const updated = await SupabaseEngine.call(`/api/users/${userData.id}/plan`, 'POST', { plan_id: userData.planId });
        const current = this.getCurrentUser();
        if (current && current.id === userData.id) this._setCurrentUser({ ...current, ...updated });
        return updated;
      }
      if (userData.name || userData.email) {
        await SupabaseEngine.updateProfile(userData.id, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          org: userData.org || '',
        });
        const updated = await SupabaseEngine.getProfile(userData.id);
        const current = this.getCurrentUser();
        if (current && current.id === userData.id) this._setCurrentUser({ ...current, ...updated });
        return updated;
      }
    } catch (e) {
      throw new Error(e.message || 'Failed to save user');
    }
  }

  static async deleteUser(userId) {
    return SupabaseEngine.deleteUser(userId);
  }

  static async deleteOwnAccount() {
    const user = this.getCurrentUser();
    if (!user) return;
    await this.deleteUser(user.id);
    await SupabaseEngine.signOut();
    this._setCurrentUser(null);
    this.renderHeaderAuthControls();
    if (window.showToast) window.showToast('Account deleted.', 'info');
    this.checkAndShowGateScreen();
  }

  // ── Expiry ────────────────────────────────────────────────────────────────

  static checkSubscriptionExpiry() {
    const user = this.getCurrentUser();
    if (!user) return;
    if (user.planId !== 'free' && user.expiresAt && new Date(user.expiresAt) <= new Date()) {
      const expired = { ...user, planId: 'free', status: 'expired', subscriptionVerified: false };
      this._setCurrentUser(expired);
    }
  }

  // ── Tool access control ───────────────────────────────────────────────────

  /**
   * CRITICAL: only verified, active subscribers get tool access.
   * - Not logged in → false
   * - Free plan → false
   * - Paid plan but NOT verified by admin → false (pending)
   * - Paid plan + verified → true
   */
  static isToolAllowedForUser(toolId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.isAdmin) return true;
    if (!user.planId || user.planId === 'free') return false;
    if (!user.subscriptionVerified) return false;
    if (user.status === 'expired') return false;
    return true;
  }

  static getRequiredPlanName(toolId) {
    const plans = this._plansCache || SupabaseEngine.DEFAULT_PLANS;
    const sorted = [...plans].sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
    const firstPaid = sorted.find(p => p.id !== 'free' && (p.priceINR || 0) > 0);
    return firstPaid ? firstPaid.name : 'PRO';
  }

  static openProUpgradeLockModal(toolOrId) {
    const tools = window.TOOLS || [];
    const tool = typeof toolOrId === 'string' ? tools.find(t => t.id === toolOrId) : toolOrId;
    const toolName = tool ? tool.name : 'this feature';
    const user = this.getCurrentUser();

    // If user is logged in but pending verification, show pending message instead
    if (user && user.planId !== 'free' && !user.subscriptionVerified) {
      this._showPendingVerificationToast();
      return;
    }

    const modalId = 'pro-upgrade-lock-modal';
    document.getElementById(modalId)?.remove();

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
          <h3 class="text-xl font-extrabold text-slate-900">Subscribe to Access</h3>
          <p class="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            <strong>${toolName}</strong> requires an active subscription. Pay via UPI, submit your UTR, and get admin verification to unlock all 50 tools.
          </p>
        </div>
        <div class="flex flex-col gap-2 pt-2">
          <button onclick="document.getElementById('${modalId}').remove(); AuthSubscriptionEngine.openSubscriptionModal();" class="w-full btn-gradient py-3 text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-qrcode"></i> Pay & Subscribe Now
          </button>
          <button onclick="document.getElementById('${modalId}').remove()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
            Dismiss
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static _showPendingVerificationToast() {
    if (window.showToast) {
      window.showToast('⏳ Your payment is pending admin verification. You will receive access once verified.', 'info');
    }
  }

  // ── Header Auth Controls ───────────────────────────────────────────────────

  static renderHeaderAuthControls() {
    const container = document.getElementById('header-auth-controls');
    if (!container) return;

    const user = this.getCurrentUser();
    const plans = this.getPlans();
    const currentPlan = user ? plans.find(p => p.id === user.planId) : null;
    const isSubscribed = user && user.planId !== 'free' && user.subscriptionVerified;
    const isPending = user && user.planId !== 'free' && !user.subscriptionVerified;

    const workHistoryNav = document.getElementById('nav-work-history');
    if (workHistoryNav) workHistoryNav.classList.toggle('hidden', !isSubscribed);

    if (user) {
      const planName = currentPlan ? currentPlan.name : (user.planId === 'free' ? 'Free Plan' : user.planId);
      const isPro = user.planId !== 'free';

      container.innerHTML = `
        <div class="flex items-center gap-2">
          ${isPending ? `
            <button onclick="AuthSubscriptionEngine.openPendingStatusModal()" class="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-xs flex items-center gap-1.5 transition hover:scale-105 animate-pulse">
              <i class="fa-solid fa-clock"></i> Pending Verification
            </button>
          ` : `
            <button onclick="AuthSubscriptionEngine.openSubscriptionModal()" class="px-3 py-1.5 rounded-xl ${isPro ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'} font-extrabold text-xs flex items-center gap-1.5 transition hover:scale-105">
              <i class="fa-solid fa-crown text-amber-400"></i>
              <span>${isPro ? planName : 'Subscribe'}</span>
            </button>
          `}

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
                  <span class="text-[10px] px-2 py-0.5 rounded-full ${isPending ? 'bg-amber-100 text-amber-800' : isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'} font-bold">
                    ${isPending ? '⏳ Pending' : planName}
                  </span>
                </div>
              </div>

              <button onclick="AuthSubscriptionEngine.openProfileModal()" class="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <i class="fa-solid fa-user-circle mr-2 text-indigo-500"></i> Profile
              </button>

              ${isPending ? `
                <button onclick="AuthSubscriptionEngine.openPendingStatusModal()" class="w-full text-left px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                  <i class="fa-solid fa-clock mr-2 text-amber-500"></i> Payment Status
                </button>
              ` : ''}

              ${isSubscribed ? `
                <a href="#history" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                  <i class="fa-solid fa-clock-rotate-left mr-2 text-indigo-500"></i> Work History
                </a>
              ` : ''}

              ${!isPro ? `
                <button onclick="AuthSubscriptionEngine.openSubscriptionModal()" class="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50">
                  <i class="fa-solid fa-crown mr-2 text-amber-500"></i> Subscribe & Unlock
                </button>
              ` : ''}

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
        </div>
      `;
    }
  }

  // ── Pending Status Modal ───────────────────────────────────────────────────

  static openPendingStatusModal() {
    const modalId = 'pending-status-modal';
    document.getElementById(modalId)?.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-5 relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center text-3xl mx-auto">
          <i class="fa-solid fa-clock"></i>
        </div>

        <div class="space-y-2">
          <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider inline-block">
            Pending Verification
          </span>
          <h3 class="text-xl font-extrabold text-slate-900">Payment Under Review</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            Your UTR payment reference has been received. The admin is reviewing your payment and will activate your subscription shortly.
          </p>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-check"></i></div>
            <div><p class="font-bold text-slate-900">Payment Submitted</p><p class="text-slate-500">UTR reference received successfully</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 animate-pulse"><i class="fa-solid fa-clock"></i></div>
            <div><p class="font-bold text-slate-900">Admin Verification</p><p class="text-slate-500">Usually within 1–4 hours</p></div>
          </div>
          <div class="flex items-center gap-3 opacity-40">
            <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-unlock"></i></div>
            <div><p class="font-bold text-slate-900">Full Access Granted</p><p class="text-slate-500">All 50 tools unlocked</p></div>
          </div>
        </div>

        <p class="text-xs text-slate-400">
          <i class="fa-solid fa-circle-info mr-1"></i>
          Sign in again after verification to refresh your account status.
        </p>

        <button onclick="document.getElementById('${modalId}').remove()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
          Got it
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // ── Profile Modal ──────────────────────────────────────────────────────────

  static openProfileModal() {
    const user = this.getCurrentUser();
    if (!user) return;
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === user.planId);
    const planName = plan ? plan.name : 'Free Plan';
    const isPro = user.planId !== 'free';
    const expiresAt = user.expiresAt ? new Date(user.expiresAt) : null;
    const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 86400000)) : null;
    const isPending = isPro && !user.subscriptionVerified;

    const planOrder = ['free', 'pro-monthly', 'pro-yearly'];
    const currentIdx = planOrder.indexOf(user.planId);
    const nextPlan = plans.find(p => p.id === planOrder[currentIdx + 1]);

    const modalId = 'profile-modal';
    document.getElementById(modalId)?.remove();

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
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center mx-auto text-2xl font-extrabold shadow-lg border-2 border-white/20">
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
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : user.subscriptionVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}">
              ${isPending ? '⏳ Pending' : user.subscriptionVerified ? 'Active' : 'Free'}
            </span>
            ${daysLeft !== null && isPro && user.subscriptionVerified ? `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">${daysLeft}d left</span>` : ''}
          </div>
        </div>

        <div class="flex border-b border-slate-200 shrink-0">
          <button onclick="switchProfileTab('edit')" id="ptab-edit" class="flex-1 py-2.5 text-xs font-extrabold border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-user-pen"></i> Edit Profile
          </button>
          <button onclick="switchProfileTab('plan')" id="ptab-plan" class="flex-1 py-2.5 text-xs font-extrabold border-b-2 border-transparent text-slate-500 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-crown"></i> Plan
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
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Phone <span class="text-slate-300 font-normal">(optional)</span></label>
                <input type="tel" id="profile-phone" class="custom-input w-full text-sm" value="${(user.phone || '').replace(/"/g, '&quot;')}" placeholder="+91 98765 43210">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-extrabold text-slate-500 uppercase">Organisation <span class="text-slate-300 font-normal">(optional)</span></label>
                <input type="text" id="profile-org" class="custom-input w-full text-sm" value="${(user.org || '').replace(/"/g, '&quot;')}" placeholder="Company name">
              </div>
              <div id="profile-save-msg" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <i class="fa-solid fa-circle-check mr-1"></i> Profile updated successfully!
              </div>
              <div id="profile-err-msg" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold"></div>
              <button type="submit" class="w-full btn-gradient py-3 text-xs font-extrabold rounded-xl shadow-lg">
                <i class="fa-solid fa-floppy-disk mr-1.5"></i> Save Changes
              </button>
            </form>
          </div>

          <!-- Plan Tab -->
          <div id="ptab-content-plan" class="p-5 space-y-4 hidden">
            ${isPending ? `
              <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-clock text-amber-600 text-lg"></i>
                  <span class="font-extrabold text-amber-900 text-sm">Payment Under Review</span>
                </div>
                <p class="text-xs text-amber-700">Your payment for <strong>${planName}</strong> has been submitted and is awaiting admin verification. Usually 1–4 hours.</p>
                <button onclick="AuthSubscriptionEngine.openPendingStatusModal()" class="text-xs text-amber-800 font-bold underline">View Status</button>
              </div>
            ` : `
              <div class="p-4 rounded-2xl border ${isPro ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50'} space-y-2">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-crown text-amber-500 text-lg"></i>
                  <span class="font-extrabold text-slate-900 text-sm">Current Plan: ${planName}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2 bg-white rounded-lg border border-slate-200">
                    <div class="text-slate-500 text-[10px] font-bold uppercase">Status</div>
                    <div class="font-extrabold text-slate-900 mt-0.5 capitalize">${user.subscriptionVerified ? 'Active' : 'Free'}</div>
                  </div>
                  <div class="p-2 bg-white rounded-lg border border-slate-200">
                    <div class="text-slate-500 text-[10px] font-bold uppercase">File Limit</div>
                    <div class="font-extrabold text-slate-900 mt-0.5">${plan ? plan.maxFileSizeMB + ' MB' : '25 MB'}</div>
                  </div>
                  ${expiresAt ? `<div class="p-2 bg-white rounded-lg border border-slate-200">
                    <div class="text-slate-500 text-[10px] font-bold uppercase">Expires</div>
                    <div class="font-extrabold text-slate-900 mt-0.5">${expiresAt.toLocaleDateString()}</div>
                  </div>` : ''}
                  ${isPro && daysLeft !== null ? `<div class="p-2 bg-white rounded-lg border border-slate-200">
                    <div class="text-slate-500 text-[10px] font-bold uppercase">Days Left</div>
                    <div class="font-extrabold ${daysLeft < 7 ? 'text-red-600' : 'text-emerald-700'} mt-0.5">${daysLeft} days</div>
                  </div>` : ''}
                </div>
              </div>
            `}
            ${nextPlan && !isPending ? `
              <div class="p-4 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-3">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-arrow-up text-indigo-600"></i>
                  <span class="font-extrabold text-indigo-900 text-sm">Upgrade to ${nextPlan.name}</span>
                  <span class="ml-auto text-xs font-extrabold text-indigo-700">₹${nextPlan.priceINR}</span>
                </div>
                <button onclick="document.getElementById('${modalId}').remove(); AuthSubscriptionEngine.openPaymentModal('${nextPlan.id}');" class="w-full btn-gradient py-3 text-xs font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <i class="fa-solid fa-qrcode"></i> Pay ₹${nextPlan.priceINR} via UPI
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Security Tab -->
          <div id="ptab-content-security" class="p-5 space-y-4 hidden">
            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
              <i class="fa-solid fa-triangle-exclamation text-amber-500 mr-1"></i>
              Password is managed by Supabase Auth. Choose a strong, unique password.
            </div>
            <div id="profile-pw-msg" class="hidden p-3 rounded-xl text-xs font-bold"></div>
            <div class="pt-3 border-t border-slate-200">
              <button onclick="if(confirm('Delete your account permanently? This cannot be undone.')) { AuthSubscriptionEngine.deleteOwnAccount(); document.getElementById('${modalId}').remove(); }" class="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-extrabold text-xs hover:bg-red-50 transition">
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
        if (btn) btn.className = `flex-1 py-2.5 text-xs font-extrabold border-b-2 transition flex items-center justify-center gap-1.5 ${t === tab ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`;
        if (content) content.classList.toggle('hidden', t !== tab);
      });
    };
  }

  static async handleProfileSave(e) {
    e.preventDefault();
    const user = this.getCurrentUser();
    if (!user) return;
    const name  = document.getElementById('profile-name')?.value?.trim();
    const email = document.getElementById('profile-email')?.value?.trim();
    const phone = document.getElementById('profile-phone')?.value?.trim();
    const org   = document.getElementById('profile-org')?.value?.trim();
    const errDiv = document.getElementById('profile-err-msg');
    const msgDiv = document.getElementById('profile-save-msg');
    if (errDiv) errDiv.classList.add('hidden');

    try {
      await SupabaseEngine.updateProfile(user.id, { name, email, phone, org });
      const updated = await SupabaseEngine.getProfile(user.id);
      this._setCurrentUser({ ...user, ...updated });
      this.renderHeaderAuthControls();
      if (msgDiv) { msgDiv.classList.remove('hidden'); setTimeout(() => msgDiv.classList.add('hidden'), 3000); }
    } catch (ex) {
      if (errDiv) { errDiv.textContent = ex.message || 'Failed to update profile.'; errDiv.classList.remove('hidden'); }
    }
  }

  // ── Auth Modal ─────────────────────────────────────────────────────────────

  static openAuthModal(initialTab = 'login', pendingPlanId = null) {
    this.pendingPlanId = pendingPlanId;
    const modalId = 'studiosuite-auth-modal';
    document.getElementById(modalId)?.remove();

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
          <p class="text-xs text-slate-500">Sign in to access all 50 tools with your active subscription.</p>
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
              <input type="password" id="auth-password" class="custom-input w-full text-xs" placeholder="••••••••" required>
            </div>

            <div id="auth-error-msg" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold"></div>

            <button type="submit" id="auth-submit-btn" class="w-full btn-gradient py-3 text-xs rounded-xl font-extrabold shadow-lg shadow-indigo-500/20">
              ${initialTab === 'login' ? 'Sign In to Account' : 'Create Account & Register'}
            </button>
          </form>

          <p class="text-[11px] text-slate-400 text-center mt-4">
            By continuing you agree to StudioSuite's 100% In-Browser Privacy Shield.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static switchAuthTab(tab) {
    const tabMode     = document.getElementById('auth-tab-mode');
    const nameGroup   = document.getElementById('auth-name-group');
    const submitBtn   = document.getElementById('auth-submit-btn');
    const tabLogin    = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');

    if (tabMode) tabMode.value = tab;

    if (tab === 'register') {
      if (nameGroup)   nameGroup.classList.remove('hidden');
      if (submitBtn)   submitBtn.textContent = 'Create Account & Register';
      if (tabRegister) tabRegister.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition';
      if (tabLogin)    tabLogin.className    = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-500 transition';
    } else {
      if (nameGroup)   nameGroup.classList.add('hidden');
      if (submitBtn)   submitBtn.textContent = 'Sign In to Account';
      if (tabLogin)    tabLogin.className    = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition';
      if (tabRegister) tabRegister.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-500 transition';
    }
  }

  static async handleAuthSubmit(e) {
    e.preventDefault();
    const mode      = document.getElementById('auth-tab-mode')?.value;
    const name      = document.getElementById('auth-name')?.value || 'User';
    const email     = document.getElementById('auth-email')?.value;
    const password  = document.getElementById('auth-password')?.value;
    const errorDiv  = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (errorDiv) errorDiv.classList.add('hidden');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Processing...'; }

    try {
      let user;
      if (mode === 'register') {
        user = await this.register(email, password, name);
        document.getElementById('studiosuite-auth-modal')?.remove();
        this.renderHeaderAuthControls();
        // Show UTR submission prompt for new users
        this.openUTRSubmissionModal();
      } else {
        user = await this.login(email, password);
        document.getElementById('studiosuite-auth-modal')?.remove();
        this.renderHeaderAuthControls();
        if (window.renderTools) window.renderTools();
        this.checkAndShowGateScreen();
        document.body.style.overflow = '';
        if (window.showToast) window.showToast('Welcome back!', 'success');
      }

      const pending = this.pendingPlanId;
      this.pendingPlanId = null;
      if (pending && mode !== 'register') {
        setTimeout(() => this.openPaymentModal(pending), 200);
      }
    } catch (err) {
      if (errorDiv) { errorDiv.textContent = err.message || 'Authentication failed.'; errorDiv.classList.remove('hidden'); }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = mode === 'register' ? 'Create Account & Register' : 'Sign In to Account'; }
    }
  }

  // ── UTR Submission Modal (post-registration) ───────────────────────────────

  static openUTRSubmissionModal(planId = null) {
    const user = this.getCurrentUser();
    if (!user) { this.openAuthModal('register'); return; }

    const plans  = this.getPlans();
    const paidPlans = plans.filter(p => (p.priceINR || 0) > 0);

    const modalId = 'utr-submission-modal';
    document.getElementById(modalId)?.remove();

    // Get admin UPI from settings cache
    const adminUpi = (window.AdminPanelEngine && AdminPanelEngine.getAdminUpi())
      || (SupabaseEngine._settingsCache?.admin_upi)
      || 'merchant@upi';

    const selectedPlan = planId ? plans.find(p => p.id === planId) : paidPlans[0];
    const planToShow = selectedPlan || paidPlans[0] || plans[1];
    const rawUpiUri = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=StudioSuitePRO&am=${planToShow?.priceINR || ''}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(rawUpiUri)}`;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col" style="max-height:95vh;">
        <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-5 text-center space-y-1.5 shrink-0 relative">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mx-auto">
            <i class="fa-solid fa-qrcode"></i>
          </div>
          <h3 class="text-lg font-extrabold">Complete Your Payment</h3>
          <p class="text-xs text-emerald-100">Account created! Now pay via UPI and submit your UTR to unlock all 50 tools.</p>
        </div>

        <div class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">

          <!-- Plan selector -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-extrabold text-slate-500 uppercase">Select Plan</label>
            <select id="utr-plan-select" class="custom-input w-full text-sm font-bold" onchange="AuthSubscriptionEngine._updateUTRQR(this.value)">
              ${paidPlans.map(p => `<option value="${p.id}" ${planToShow?.id === p.id ? 'selected' : ''}>
                ${p.name} — ₹${p.priceINR}
              </option>`).join('')}
            </select>
          </div>

          <!-- QR Code -->
          <div class="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-center space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span><i class="fa-solid fa-camera mr-1"></i>Scan with UPI App</span>
              <span class="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">GPay / PhonePe / Paytm</span>
            </div>
            <div id="utr-qr-container" class="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
              <img id="utr-qr-img" src="${qrUrl}" alt="UPI QR Code" class="w-full h-full object-contain">
            </div>
            <a href="${rawUpiUri}" class="sm:hidden block w-full py-2 bg-emerald-600 text-white text-xs font-extrabold rounded-xl text-center">
              <i class="fa-solid fa-mobile-screen mr-1"></i> Open UPI App
            </a>
            <div>
              <label class="text-[10px] font-bold text-slate-500 block mb-1">UPI ID:</label>
              <div class="flex gap-2">
                <input id="utr-upi-id" class="custom-input w-full text-xs font-mono font-bold bg-white" value="${adminUpi}" readonly>
                <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('utr-upi-id').value); if(window.showToast) showToast('UPI ID copied!','success');" class="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold whitespace-nowrap">
                  <i class="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- UTR Input -->
          <form onsubmit="AuthSubscriptionEngine.handleUTRSubmit(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                12-Digit UTR / RRN Reference <span class="text-red-500">*</span>
              </label>
              <input type="text" id="utr-input" required placeholder="e.g. 424589012345" maxlength="16" class="custom-input w-full text-sm font-mono font-bold tracking-wider text-slate-900">
              <p class="text-[11px] text-slate-500 mt-1">
                <i class="fa-solid fa-circle-info text-indigo-500 mr-1"></i>Find this in your UPI app under payment history.
              </p>
            </div>
            <div id="utr-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold"></div>
            <button type="submit" id="utr-submit-btn" class="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white py-3.5 text-xs rounded-2xl font-extrabold shadow-lg transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-shield-check"></i> Submit UTR & Request Verification
            </button>
          </form>

          <p class="text-center text-[10px] text-slate-400">
            <i class="fa-solid fa-info-circle mr-1"></i> Admin will verify your payment within 1–4 hours. You'll have full access after verification.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Update QR code when plan changes
  static _updateUTRQR(planId) {
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const adminUpi = (window.AdminPanelEngine && AdminPanelEngine.getAdminUpi()) || 'merchant@upi';
    const rawUpiUri = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=StudioSuitePRO&am=${plan.priceINR}&cu=INR`;
    const qrImg = document.getElementById('utr-qr-img');
    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(rawUpiUri)}`;
  }

  static async handleUTRSubmit(e) {
    e.preventDefault();
    const user   = this.getCurrentUser();
    if (!user) return;
    const planId  = document.getElementById('utr-plan-select')?.value;
    const utr     = document.getElementById('utr-input')?.value?.trim();
    const errDiv  = document.getElementById('utr-error');
    const btn     = document.getElementById('utr-submit-btn');

    if (!utr || utr.length < 8) {
      if (errDiv) { errDiv.textContent = 'Please enter a valid 12-digit UTR / RRN number.'; errDiv.classList.remove('hidden'); }
      return;
    }
    if (errDiv) errDiv.classList.add('hidden');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Submitting...'; }

    try {
      await this.submitUTR(user.id, planId, utr);
      document.getElementById('utr-submission-modal')?.remove();
      this.renderHeaderAuthControls();
      if (window.renderTools) window.renderTools();
      this.checkAndShowGateScreen();
      document.body.style.overflow = '';
      // Show pending status modal
      setTimeout(() => this.openPendingStatusModal(), 300);
    } catch (err) {
      if (errDiv) { errDiv.textContent = err.message || 'Submission failed. Please try again.'; errDiv.classList.remove('hidden'); }
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Submit UTR & Request Verification'; }
    }
  }

  // ── Subscription Modal (plans overview) ────────────────────────────────────

  static openSubscriptionModal() {
    const modalId = 'studiosuite-sub-modal';
    document.getElementById(modalId)?.remove();

    const plans = this.getPlans();
    const user  = this.getCurrentUser();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-[98vw] sm:max-w-2xl md:max-w-4xl mx-auto overflow-hidden relative flex flex-col" style="max-height:95vh;">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:bg-white/30 w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 transition z-30 shadow-md">
          <i class="fa-solid fa-xmark text-base"></i>
        </button>

        <div class="px-4 py-5 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white text-center space-y-2 relative shrink-0 overflow-hidden pr-12 sm:pr-16">
          <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl font-black pointer-events-none select-none">PRO</div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <i class="fa-solid fa-shield-check"></i> 100% In-Browser · Private & Secure
          </div>
          <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight">Choose Your Premium Plan</h2>
          <p class="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto hidden sm:block">
            Pay via UPI → Submit UTR → Admin verifies → Full access to all 50 tools.
          </p>
        </div>

        <div class="p-3 sm:p-6 md:p-8 bg-slate-50 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            ${plans.map(plan => {
              const isCurrent = user && user.planId === plan.id;
              const isPopular = plan.badge === 'Popular' || plan.id === 'pro-monthly';
              const featuresList = Array.isArray(plan.features) ? plan.features : [];
              return `
                <div class="bg-white rounded-xl sm:rounded-2xl border ${isPopular ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl' : 'border-slate-200 shadow-sm'} p-4 sm:p-6 flex flex-col justify-between relative hover:shadow-md transition">
                  ${plan.badge ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isPopular ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'} shadow-sm whitespace-nowrap">${plan.badge}</span>` : ''}
                  <div>
                    <h3 class="font-extrabold text-base sm:text-lg text-slate-900">${plan.name}</h3>
                    <div class="mt-2 flex items-baseline gap-1">
                      <span class="text-2xl sm:text-3xl font-black text-slate-900">₹${plan.priceINR}</span>
                      <span class="text-xs text-slate-500 font-bold">/ ${plan.durationDays >= 365 ? 'year' : plan.durationDays > 1 ? 'month' : 'lifetime'}</span>
                    </div>
                    <ul class="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      ${featuresList.map(f => `<li class="flex items-start gap-2"><i class="fa-solid fa-circle-check text-emerald-500 mt-0.5"></i><span>${f}</span></li>`).join('')}
                    </ul>
                  </div>
                  <div class="mt-5 pt-3 border-t border-slate-100">
                    ${isCurrent
                      ? `<button disabled class="w-full py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-default"><i class="fa-solid fa-check"></i> Current Plan</button>`
                      : plan.priceINR === 0
                        ? `<button onclick="AuthSubscriptionEngine.openAuthModal('register')" class="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-extrabold transition shadow-md">${user ? 'Already Free' : 'Create Account'}</button>`
                        : `<button onclick="AuthSubscriptionEngine.openPaymentModal('${plan.id}')" class="w-full ${isPopular ? 'btn-gradient' : 'bg-slate-900 hover:bg-slate-800 text-white'} py-2.5 sm:py-3 rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2">
                             <i class="fa-solid fa-qrcode"></i> Pay ₹${plan.priceINR} via UPI
                           </button>`
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <p class="text-center text-xs text-slate-400 mt-5 pb-2">
            <i class="fa-solid fa-shield-check text-indigo-600 mr-1"></i>
            All payments in ₹ INR. Verified via UTR reference by admin.
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // ── Payment Modal ──────────────────────────────────────────────────────────

  static openPaymentModal(planId) {
    const user = this.getCurrentUser();
    if (!user) {
      document.getElementById('studiosuite-sub-modal')?.remove();
      this.openAuthModal('register', planId);
      return;
    }

    const plans = this.getPlans();
    const plan  = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.priceINR === 0) {
      this.subscribeUser(user.id, plan.id, 'FREE_TIER').then(() => {
        document.getElementById('studiosuite-sub-modal')?.remove();
        this.renderHeaderAuthControls();
        if (window.renderTools) window.renderTools();
        if (window.showToast) window.showToast('Free tier activated!', 'success');
      }).catch(ex => { if (window.showToast) window.showToast(ex.message || 'Failed.', 'error'); });
      return;
    }

    document.getElementById('studiosuite-sub-modal')?.remove();
    this.openUTRSubmissionModal(planId);
  }

  // ── Gate Screen ────────────────────────────────────────────────────────────

  static checkAndShowGateScreen() {
    const gate = document.getElementById('subscription-gate-screen');
    if (!gate) return;
    const user         = this.getCurrentUser();
    const isSubscribed = user && user.planId !== 'free' && user.subscriptionVerified;
    const isAdmin      = window.AdminPanelEngine && AdminPanelEngine.isAdminLoggedIn();
    const hash         = window.location.hash;

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
}

window.AuthSubscriptionEngine = AuthSubscriptionEngine;

// Boot
AuthSubscriptionEngine.initDefaults().catch(e => { console.warn('[Auth] initDefaults error:', e); });

window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    AuthSubscriptionEngine.checkAndShowGateScreen();
  }, 500);
});

window.addEventListener('hashchange', function() {
  const h = window.location.hash;
  if (h === '#admin-page' || h === '#admin' || h.startsWith('#quiz/') || h.startsWith('#take-quiz/') || h.startsWith('#quiz-dashboard/')) return;
  AuthSubscriptionEngine.checkAndShowGateScreen();
});
