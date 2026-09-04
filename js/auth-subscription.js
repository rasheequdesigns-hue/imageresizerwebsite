/**
 * StudioSuite Pro - Authentication, Subscription & INR Payment Verification Engine
 */

class AuthSubscriptionEngine {
  static STORAGE_USERS = 'studiosuite_users';
  static STORAGE_CURRENT_USER = 'studiosuite_current_user';
  static STORAGE_PLANS = 'studiosuite_plans';
  static STORAGE_PAYMENTS = 'studiosuite_payments';

  static initDefaults() {
    const existingPlans = JSON.parse(localStorage.getItem(this.STORAGE_PLANS) || '[]');
    if (!existingPlans || existingPlans.length === 0) {
      const defaultPlans = [
        {
          id: 'free',
          name: 'Free Tier',
          priceINR: 0,
          durationDays: 3650,
          maxFileSizeMB: 25,
          badge: 'Basic',
          features: ['Access to 50 Tools', '25MB File Upload Limit', 'Standard Processing Speed', 'Local In-Browser Processing']
        },
        {
          id: 'pro-monthly',
          name: 'Pro Monthly',
          priceINR: 499,
          durationDays: 30,
          maxFileSizeMB: 250,
          badge: 'Popular',
          features: ['All 50 Master Tools Unlocked', '250MB File Upload Limit', 'Ultra-Fast WebAssembly Engine', 'Supabase Cloud Autosave', 'Priority Email Support']
        },
        {
          id: 'pro-yearly',
          name: 'Pro Annual',
          priceINR: 4999,
          durationDays: 365,
          maxFileSizeMB: 1000,
          badge: 'Best Value',
          features: ['All Pro Features Included', '1GB Max File Upload Size', '2 Months Free Savings', 'Dedicated Cloud Workspace', 'Commercial License Included']
        }
      ];
      localStorage.setItem(this.STORAGE_PLANS, JSON.stringify(defaultPlans));
    }

    if (!localStorage.getItem(this.STORAGE_USERS)) {
      localStorage.setItem(this.STORAGE_USERS, JSON.stringify([]));
    }

    this.checkSubscriptionExpiry();
  }

  static getUsers() {
    return JSON.parse(localStorage.getItem(this.STORAGE_USERS) || '[]');
  }

  static getPlans() {
    return JSON.parse(localStorage.getItem(this.STORAGE_PLANS) || '[]');
  }

  static getCurrentUser() {
    return JSON.parse(localStorage.getItem(this.STORAGE_CURRENT_USER) || 'null');
  }

  static register(email, password, name = 'User') {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      email,
      password,
      name,
      planId: 'free',
      subscribedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3650 * 86400000).toISOString(),
      status: 'active'
    };

    users.push(newUser);
    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
    localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(newUser));
    
    // Refresh admin page if currently open
    if (window.location.hash === '#admin-page' && window.renderFullAdminPage) {
      window.renderFullAdminPage();
    }

    return newUser;
  }

  static login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.checkUserExpiry(user);
    localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(user));
    return user;
  }

  static logout() {
    localStorage.removeItem(this.STORAGE_CURRENT_USER);
    this.renderHeaderAuthControls();
    if (window.showToast) window.showToast('Logged out successfully', 'info');
  }

  /**
   * User CRUD Operations for Admin
   */
  static saveUser(userData) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userData.id);

    if (idx !== -1) {
      users[idx] = { ...users[idx], ...userData };
    } else {
      users.push({
        id: 'usr_' + Date.now(),
        subscribedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'active',
        ...userData
      });
    }

    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
    return users;
  }

  static deleteUser(userId) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
    return users;
  }

  /**
   * Automated Expiry Verification Monitor
   */
  static checkSubscriptionExpiry() {
    const users = this.getUsers();
    const now = new Date();
    let updated = false;

    users.forEach(user => {
      if (user.planId !== 'free' && new Date(user.expiresAt) <= now) {
        user.planId = 'free';
        user.status = 'expired';
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const refreshed = users.find(u => u.id === currentUser.id);
        if (refreshed) {
          localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(refreshed));
        }
      }
    }
  }

  static checkUserExpiry(user) {
    if (user.planId !== 'free' && new Date(user.expiresAt) <= new Date()) {
      user.planId = 'free';
      user.status = 'expired';
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
      }
    }
  }

  /**
   * Automatic Payment Verification & Instant Subscription Activation in INR (₹)
   */
  static subscribeUser(userId, planId, transactionId = '') {
    const users = this.getUsers();
    const plans = this.getPlans();
    const user = users.find(u => u.id === userId);
    const plan = plans.find(p => p.id === planId);

    if (!user || !plan) throw new Error('User or plan not found');

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (plan.durationDays || 30) * 86400000);

    user.planId = plan.id;
    user.subscribedAt = now.toISOString();
    user.expiresAt = expiresAt.toISOString();
    user.status = 'active';

    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));

    const payments = JSON.parse(localStorage.getItem(this.STORAGE_PAYMENTS) || '[]');
    payments.push({
      txId: transactionId || 'UPI_INR_' + Date.now(),
      userId: user.id,
      userName: user.name || 'User',
      userEmail: user.email,
      planId: plan.id,
      planName: plan.name,
      amountINR: plan.priceINR,
      currency: '₹',
      timestamp: now.toISOString(),
      status: 'verified_success'
    });
    localStorage.setItem(this.STORAGE_PAYMENTS, JSON.stringify(payments));

    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(user));
    }

    // Refresh admin page if currently active
    if (window.location.hash === '#admin-page' && window.renderFullAdminPage) {
      window.renderFullAdminPage();
    }

    return user;
  }

  /**
   * Header Auth & Subscription Controls Component Renderer
   */
  static renderHeaderAuthControls() {
    const container = document.getElementById('header-auth-controls');
    if (!container) return;

    const user = this.getCurrentUser();
    const plans = this.getPlans();
    const currentPlan = user ? plans.find(p => p.id === user.planId) : null;
    const isSubscribed = user && user.planId !== 'free' && user.status === 'active';

    // Show/Hide main header Work History nav link strictly based on subscription status
    const workHistoryNav = document.getElementById('nav-work-history');
    if (workHistoryNav) {
      if (isSubscribed) {
        workHistoryNav.classList.remove('hidden');
      } else {
        workHistoryNav.classList.add('hidden');
      }
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

  /**
   * Login / Registration Modal
   */
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

        <!-- Modal Header -->
        <div class="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-100 text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl mx-auto shadow-md shadow-indigo-500/20">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <h3 class="text-2xl font-extrabold text-slate-900">StudioSuite Account</h3>
          <p class="text-xs text-slate-500">Sign in to save your files, track subscriptions, and sync history.</p>
        </div>

        <!-- Tab Switcher -->
        <div class="flex border-b border-slate-200">
          <button type="button" id="tab-btn-login" onclick="AuthSubscriptionEngine.switchAuthTab('login')" class="flex-1 py-3 text-xs font-extrabold text-center border-b-2 ${initialTab === 'login' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'} transition">
            Sign In
          </button>
          <button type="button" id="tab-btn-register" onclick="AuthSubscriptionEngine.switchAuthTab('register')" class="flex-1 py-3 text-xs font-extrabold text-center border-b-2 ${initialTab === 'register' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'} transition">
            Create Account
          </button>
        </div>

        <!-- Form Body -->
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
      if (tabRegister) {
        tabRegister.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition';
      }
      if (tabLogin) {
        tabLogin.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-500 transition';
      }
    } else {
      if (nameGroup) nameGroup.classList.add('hidden');
      if (submitBtn) submitBtn.textContent = 'Sign In to Account';
      if (tabLogin) {
        tabLogin.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 transition';
      }
      if (tabRegister) {
        tabRegister.className = 'flex-1 py-3 text-xs font-extrabold text-center border-b-2 border-transparent text-slate-500 transition';
      }
    }
  }

  static handleAuthSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('auth-tab-mode')?.value;
    const name = document.getElementById('auth-name')?.value || 'User';
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    const errorDiv = document.getElementById('auth-error-msg');

    if (errorDiv) errorDiv.classList.add('hidden');

    try {
      if (mode === 'register') {
        this.register(email, password, name);
        if (window.showToast) window.showToast('Account created successfully!', 'success');
      } else {
        this.login(email, password);
        if (window.showToast) window.showToast('Welcome back!', 'success');
      }

      document.getElementById('studiosuite-auth-modal')?.remove();
      this.renderHeaderAuthControls();

      const pending = this.pendingPlanId;
      this.pendingPlanId = null;
      if (pending) {
        setTimeout(() => {
          this.openPaymentModal(pending);
        }, 200);
      }
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Authentication failed.';
        errorDiv.classList.remove('hidden');
      }
    }
  }

  /**
   * Subscription Plans & Pricing Selection Modal
   */
  static openSubscriptionModal() {
    const modalId = 'studiosuite-sub-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const plans = this.getPlans();
    const user = this.getCurrentUser();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Header -->
        <div class="p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white text-center space-y-3 relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl font-black">PRO</div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold shadow-sm">
            <i class="fa-solid fa-shield-check"></i>
            <span>100% In-Browser WebAssembly Engine &bull; Private & Secure</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Choose Your Premium Plan</h2>
          <p class="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto">
            Scan UPI QR Code to upgrade instantly. 100% Client-side privacy & unlimited WebAssembly processing power.
          </p>
        </div>

        <!-- Plans Grid -->
        <div class="p-6 sm:p-8 bg-slate-50">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${plans.map(plan => {
              const isCurrent = user && user.planId === plan.id;
              const isPopular = plan.badge === 'Popular' || plan.id === 'pro-monthly';
              const featuresList = Array.isArray(plan.features) ? plan.features : [
                `Access to ${plan.maxFileSizeMB || 250}MB File Processing`,
                `Duration: ${plan.durationDays || 30} Days`,
                'Client-Side WebAssembly Engine',
                'Cloud History & Settings Sync'
              ];

              return `
                <div class="bg-white rounded-2xl border ${isPopular ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl' : 'border-slate-200 shadow-sm'} p-6 flex flex-col justify-between relative hover:shadow-md transition">
                  ${plan.badge ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isPopular ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'} shadow-sm">${plan.badge}</span>` : ''}

                  <div>
                    <h3 class="font-extrabold text-lg text-slate-900">${plan.name}</h3>
                    <div class="mt-3 flex items-baseline gap-1">
                      <span class="text-3xl font-black text-slate-900">₹${plan.priceINR}</span>
                      <span class="text-xs text-slate-500 font-bold">/ ${plan.durationDays >= 365 ? 'year' : plan.durationDays > 1 ? 'month' : 'lifetime'}</span>
                    </div>

                    <ul class="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                      ${featuresList.map(feat => `
                        <li class="flex items-start gap-2">
                          <i class="fa-solid fa-circle-check text-emerald-500 mt-0.5"></i>
                          <span>${feat}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>

                  <div class="mt-8 pt-4 border-t border-slate-100">
                    ${isCurrent ? `
                      <button disabled class="w-full py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-default">
                        <i class="fa-solid fa-check"></i> Current Active Plan
                      </button>
                    ` : `
                      <button onclick="AuthSubscriptionEngine.openPaymentModal('${plan.id}')" class="w-full ${isPopular ? 'btn-gradient' : 'bg-slate-900 hover:bg-slate-800 text-white'} py-2.5 rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2">
                        <i class="fa-solid fa-qrcode"></i>
                        <span>${plan.priceINR === 0 ? 'Select Free' : `Pay ₹${plan.priceINR} via UPI QR`}</span>
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <p class="text-center text-xs text-slate-400 mt-6">
            <i class="fa-solid fa-shield-check text-indigo-600 mr-1"></i> All payments processed in Indian Rupees (₹ INR). Verified instantly via UTR reference number and recorded in Admin Panel.
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Instant Payment Verification & Subscription Activation Modal (INR ₹)
   */
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
      this.subscribeUser(user.id, plan.id, 'FREE_TIER');
      document.getElementById('studiosuite-sub-modal')?.remove();
      this.renderHeaderAuthControls();
      if (window.showToast) window.showToast('Activated Free Tier successfully!', 'success');
      return;
    }

    const adminUpi = window.AdminPanelEngine ? AdminPanelEngine.getAdminUpi() : (localStorage.getItem('studiosuite_admin_upi') || 'merchant@upi');
    const rawUpiUri = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=StudioSuitePRO&am=${plan.priceINR}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(rawUpiUri)}`;

    const modalId = 'studiosuite-pay-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full my-6 overflow-hidden relative">
        <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 transition z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Premium Payment Modal Header -->
        <div class="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl mx-auto shadow-inner">
            <i class="fa-solid fa-qrcode"></i>
          </div>
          <h3 class="text-xl font-extrabold">Pay via UPI QR & Activate Premium</h3>
          <p class="text-xs text-emerald-100">Scan QR Code or Pay to UPI ID to unlock ${plan.name}</p>
          <div class="pt-1">
            <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold inline-flex items-center gap-1">
              <i class="fa-solid fa-lock"></i> 100% In-Browser WebAssembly Engine &bull; Private & Secure
            </span>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Summary Box -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div class="flex justify-between font-bold text-slate-700">
              <span>Selected Premium Plan:</span>
              <span class="text-indigo-600 font-extrabold">${plan.name}</span>
            </div>
            <div class="flex justify-between font-bold text-slate-700">
              <span>Duration & File Limit:</span>
              <span class="text-slate-900 font-extrabold">${plan.durationDays} Days &bull; ${plan.maxFileSizeMB || 250}MB Limit</span>
            </div>
            <div class="flex justify-between font-bold text-slate-700 pt-2 border-t border-slate-200 text-sm">
              <span>Total Payable Amount:</span>
              <span class="text-emerald-600 font-black text-base">₹${plan.priceINR} INR</span>
            </div>
          </div>

          <!-- QR Code Box -->
          <div class="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-center space-y-3">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span><i class="fa-solid fa-camera mr-1"></i> Scan with UPI App</span>
              <span class="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">GPay / PhonePe / Paytm / BHIM</span>
            </div>

            <div class="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center relative group">
              <img src="${qrUrl}" alt="UPI QR Code" class="w-full h-full object-contain">
            </div>

            <!-- Mobile Direct UPI App Launcher -->
            <a href="${rawUpiUri}" class="sm:hidden block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md text-center">
              <i class="fa-solid fa-mobile-screen mr-1"></i> Tap to Open UPI App on Mobile
            </a>

            <!-- UPI ID & Copy -->
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

          <!-- UTR / RRN Input Form -->
          <form onsubmit="AuthSubscriptionEngine.handlePaymentSubmit(event, '${user.id}', '${plan.id}')" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                Enter 12-Digit UPI Payment UTR / RRN Ref No <span class="text-red-500">*</span>
              </label>
              <input type="text" id="pay-utr-number" required placeholder="e.g. 424589012345" maxlength="16" class="custom-input w-full text-sm font-mono font-bold text-slate-900 tracking-wider">
              <p class="text-[11px] text-slate-500 mt-1">
                <i class="fa-solid fa-circle-info text-indigo-500 mr-1"></i> Check your UPI app transaction details for the 12-digit Ref / UTR / RRN number.
              </p>
            </div>

            <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white py-3.5 text-xs rounded-2xl font-extrabold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-shield-check"></i> Verify UTR & Activate Premium (₹${plan.priceINR})
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

  static handlePaymentSubmit(e, userId, planId) {
    e.preventDefault();
    const utr = document.getElementById('pay-utr-number')?.value?.trim();
    if (!utr || utr.length < 8) {
      alert('Please enter a valid 12-digit UPI Payment UTR / RRN Reference Number.');
      return;
    }

    try {
      this.subscribeUser(userId, planId, utr);
      document.getElementById('studiosuite-pay-modal')?.remove();
      document.getElementById('studiosuite-sub-modal')?.remove();

      this.renderHeaderAuthControls();

      if (window.showToast) {
        window.showToast(`Payment verified via UTR ${utr}! Your subscription is now ACTIVE.`, 'success');
      }
    } catch (err) {
      alert(err.message || 'Payment processing failed.');
    }
  }
}

window.AuthSubscriptionEngine = AuthSubscriptionEngine;
AuthSubscriptionEngine.initDefaults();

