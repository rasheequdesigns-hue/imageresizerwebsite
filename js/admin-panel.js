/**
 * StudioSuite Pro - Full Dedicated Admin Page & Management Dashboard
 */

class AdminPanelEngine {
  static STORAGE_ADMIN_SESSION = 'studiosuite_admin_session';
  static STORAGE_ADMIN_PASSCODE = 'studiosuite_admin_passcode';
  static STORAGE_FOOTER_CONTACT = 'studiosuite_footer_contact';

  static getPasscode() {
    return localStorage.getItem(this.STORAGE_ADMIN_PASSCODE) || 'admin123';
  }

  static setPasscode(newPasscode) {
    localStorage.setItem(this.STORAGE_ADMIN_PASSCODE, newPasscode);
  }

  static isAdminLoggedIn() {
    return localStorage.getItem(this.STORAGE_ADMIN_SESSION) === 'true';
  }

  static adminLogin(passcode) {
    if (passcode === this.getPasscode()) {
      localStorage.setItem(this.STORAGE_ADMIN_SESSION, 'true');
      return true;
    }
    return false;
  }

  static adminLogout() {
    localStorage.removeItem(this.STORAGE_ADMIN_SESSION);
  }

  /**
   * Contact Address Management
   */
  static getContactInfo() {
    return JSON.parse(localStorage.getItem(this.STORAGE_FOOTER_CONTACT) || JSON.stringify({
      company: 'StudioSuite PRO Platform Inc.',
      address: '100 Innovation Parkway, Suite 400, Tech Park',
      phone: '+91 98765 43210',
      email: 'support@studiosuitepro.com',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM IST'
    }));
  }

  static saveContactInfo(info) {
    localStorage.setItem(this.STORAGE_FOOTER_CONTACT, JSON.stringify(info));
  }

  /**
   * Plans CRUD
   */
  static savePlan(planData) {
    const plans = AuthSubscriptionEngine.getPlans();
    const existingIdx = plans.findIndex(p => p.id === planData.id);

    if (existingIdx !== -1) {
      plans[existingIdx] = { ...plans[existingIdx], ...planData };
    } else {
      plans.push({
        id: 'plan_' + Date.now(),
        currency: '₹',
        badge: 'Custom',
        ...planData
      });
    }

    localStorage.setItem(AuthSubscriptionEngine.STORAGE_PLANS, JSON.stringify(plans));
    return plans;
  }

  static deletePlan(planId) {
    if (planId === 'free') throw new Error('Cannot delete default free plan');
    let plans = AuthSubscriptionEngine.getPlans();
    plans = plans.filter(p => p.id !== planId);
    localStorage.setItem(AuthSubscriptionEngine.STORAGE_PLANS, JSON.stringify(plans));
    return plans;
  }
}

window.AdminPanelEngine = AdminPanelEngine;

// Render Full-Page Admin Dashboard when `#admin-page` or `/admin` route is active
function renderFullAdminPage() {
  const container = document.getElementById('admin-page-view');
  if (!container) return;

  if (!AdminPanelEngine.isAdminLoggedIn()) {
    container.innerHTML = `
      <div class="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i class="fa-solid fa-lock"></i>
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900">Admin Control Portal</h2>
          <p class="text-xs text-slate-500 mt-1">Enter your secure admin passcode to access full system management.</p>
        </div>

        <form onsubmit="handleFullAdminLogin(event)" class="space-y-4 text-left">
          <div>
            <label class="text-xs font-bold text-slate-600 uppercase">Admin Passcode</label>
            <input type="password" id="admin-page-passcode" class="custom-input w-full text-center text-sm font-mono mt-1" placeholder="Passcode (Default: admin123)" required>
          </div>
          <button type="submit" class="w-full btn-gradient py-3 text-sm rounded-xl font-bold">Unlock Admin Dashboard</button>
        </form>
      </div>
    `;
    return;
  }

  const users = AuthSubscriptionEngine.getUsers();
  const plans = AuthSubscriptionEngine.getPlans();
  const payments = JSON.parse(localStorage.getItem(AuthSubscriptionEngine.STORAGE_PAYMENTS) || '[]');
  const supaConfig = SupabaseEngine.getConfig();
  const contactInfo = AdminPanelEngine.getContactInfo();

  const totalRevenue = payments.reduce((acc, p) => acc + (parseFloat(p.amountINR) || 0), 0);

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      <!-- Top Bar -->
      <div class="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-extrabold text-slate-900">Platform Admin Dashboard</h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Session Persistent</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">Manage users, subscription plans in INR (₹), contact address details, and Supabase integration.</p>
        </div>

        <div class="flex gap-3">
          <a href="#" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
            <i class="fa-solid fa-house"></i> View Website
          </a>
          <button type="button" onclick="handleFullAdminLogout()" class="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200 transition">
            <i class="fa-solid fa-power-off"></i> Logout Admin
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
          <h3 class="text-3xl font-extrabold text-emerald-600">₹${totalRevenue.toLocaleString()}</h3>
        </div>
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
          <h3 class="text-3xl font-extrabold text-indigo-600">${users.length}</h3>
        </div>
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Subscription Plans</span>
          <h3 class="text-3xl font-extrabold text-purple-600">${plans.length}</h3>
        </div>
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Supabase Status</span>
          <h3 class="text-xl font-bold ${supaConfig.url ? 'text-emerald-600' : 'text-amber-500'}">
            ${supaConfig.url ? 'Connected' : 'Local Fallback'}
          </h3>
        </div>
      </div>

      <!-- Main Tabs Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column (8 Cols): Users & Payments -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- Users Table -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 class="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-users text-indigo-600"></i> User Accounts & Subscriptions
              </h3>
              <button onclick="openAddUserModal()" class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition">
                <i class="fa-solid fa-user-plus"></i> Add User
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th class="p-3">User Details</th>
                    <th class="p-3">Active Plan</th>
                    <th class="p-3">Expires At</th>
                    <th class="p-3">Status</th>
                    <th class="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  ${users.length > 0 ? users.map(u => `
                    <tr>
                      <td class="p-3 font-semibold text-slate-900">
                        <div class="font-extrabold text-slate-900">${u.name || 'User'}</div>
                        <div class="text-[11px] text-slate-400 font-normal">${u.email}</div>
                      </td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded ${u.planId !== 'free' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-700'} font-bold">
                          ${u.planId}
                        </span>
                      </td>
                      <td class="p-3 text-slate-500">${new Date(u.expiresAt).toLocaleDateString()}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} font-bold">
                          ${u.status}
                        </span>
                      </td>
                      <td class="p-3 text-right space-x-2">
                        <button onclick="changeAdminUserPlan('${u.id}')" class="text-indigo-600 font-bold hover:underline">Assign Plan</button>
                        <button onclick="deleteAdminUser('${u.id}')" class="text-red-500 font-bold hover:underline">Delete</button>
                      </td>
                    </tr>
                  `).join('') : `<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">No users registered yet. Users will appear here automatically when they log in or sign up.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Subscription Payments & Transactions Table -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 class="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-receipt text-emerald-600"></i> Payment & Subscription Transactions (INR ₹)
              </h3>
              <span class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-extrabold border border-emerald-200">
                ${payments.length} Verified Payments
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th class="p-3">Tx Ref ID</th>
                    <th class="p-3">Subscriber Email</th>
                    <th class="p-3">Plan</th>
                    <th class="p-3">Amount</th>
                    <th class="p-3">Date</th>
                    <th class="p-3">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  ${payments.length > 0 ? payments.map(p => `
                    <tr>
                      <td class="p-3 font-mono text-[11px] text-slate-800">${p.txId || 'N/A'}</td>
                      <td class="p-3 font-semibold text-slate-900">${p.userEmail}</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">${p.planName || p.planId}</span></td>
                      <td class="p-3 font-black text-emerald-600">₹${p.amountINR}</td>
                      <td class="p-3 text-slate-400">${new Date(p.timestamp).toLocaleString()}</td>
                      <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Verified</span></td>
                    </tr>
                  `).join('') : `<tr><td colspan="6" class="p-4 text-center text-slate-400 italic">No payments recorded yet. Subscriptions purchased by users will appear here.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Contact Address & Footer Settings Editor -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-extrabold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <i class="fa-solid fa-location-dot text-indigo-600"></i> Website Contact Address & Footer Details
            </h3>

            <form onsubmit="handleSaveContactInfo(event)" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase">Company Name</label>
                  <input type="text" id="contact-company" class="custom-input w-full text-xs" value="${contactInfo.company || ''}" required>
                </div>
                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase">Support Email</label>
                  <input type="email" id="contact-email" class="custom-input w-full text-xs" value="${contactInfo.email || ''}" required>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase">Contact Phone Number</label>
                  <input type="text" id="contact-phone" class="custom-input w-full text-xs" value="${contactInfo.phone || ''}" required>
                </div>
                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase">Operating Hours</label>
                  <input type="text" id="contact-hours" class="custom-input w-full text-xs" value="${contactInfo.hours || ''}" required>
                </div>
              </div>

              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase">Physical Address</label>
                <input type="text" id="contact-address" class="custom-input w-full text-xs" value="${contactInfo.address || ''}" required>
              </div>

              <button type="submit" class="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition">
                Update Footer Contact Info
              </button>
            </form>
          </div>

        </div>

        <!-- Right Column (4 Cols): Plans & Supabase -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Plans CRUD -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 class="font-extrabold text-base text-slate-900 uppercase">Subscription Plans (INR ₹)</h3>
              <button onclick="openAddPlanModal()" class="text-xs bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg">
                <i class="fa-solid fa-plus"></i> Add
              </button>
            </div>

            <div class="space-y-3">
              ${plans.length > 0 ? plans.map(p => `
                <div class="p-4 border rounded-xl bg-slate-50 space-y-2 relative">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-sm text-slate-900">${p.name}</span>
                    <span class="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-extrabold">₹${p.priceINR}</span>
                  </div>
                  <p class="text-xs text-slate-500">Duration: ${p.durationDays} days | Max File: ${p.maxFileSizeMB} MB</p>
                  <div class="pt-2 flex justify-end gap-2 border-t border-slate-200 text-xs">
                    <button onclick="AdminPanelEngine.deletePlan('${p.id}'); renderFullAdminPage();" class="text-red-500 hover:underline">Delete Plan</button>
                  </div>
                </div>
              `).join('') : `<p class="text-xs text-slate-400 italic text-center py-2">No subscription plans created yet. Click "+ Add" above.</p>`}
            </div>
          </div>

          <!-- Supabase Config Panel -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-extrabold text-base text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-3">
              <i class="fa-solid fa-database text-purple-600"></i> Supabase Integration
            </h3>

            <form onsubmit="handleSaveSupabaseConfig(event)" class="space-y-3">
              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase">Supabase Project URL</label>
                <input type="text" id="supa-url-input" class="custom-input w-full text-xs font-mono" value="${supaConfig.url || ''}" placeholder="https://xyz.supabase.co">
              </div>

              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase">Supabase Anon Key</label>
                <input type="password" id="supa-key-input" class="custom-input w-full text-xs font-mono" value="${supaConfig.key || ''}" placeholder="eyJhbGci...">
              </div>

              <button type="submit" class="w-full bg-purple-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-purple-700 transition">
                Save Supabase Credentials
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  `;
}

window.handleSaveContactInfo = function(e) {
  e.preventDefault();
  const company = document.getElementById('contact-company')?.value;
  const email = document.getElementById('contact-email')?.value;
  const phone = document.getElementById('contact-phone')?.value;
  const hours = document.getElementById('contact-hours')?.value;
  const address = document.getElementById('contact-address')?.value;

  AdminPanelEngine.saveContactInfo({ company, email, phone, hours, address });
  alert('Footer contact address updated successfully!');
  if (window.renderFooterContact) window.renderFooterContact();
};

window.handleFullAdminLogin = function(e) {
  e.preventDefault();
  const pass = document.getElementById('admin-page-passcode')?.value;
  if (AdminPanelEngine.adminLogin(pass)) {
    renderFullAdminPage();
  } else {
    alert('Incorrect passcode');
  }
};

window.handleFullAdminLogout = function() {
  AdminPanelEngine.adminLogout();
  renderFullAdminPage();
};

window.handleSaveSupabaseConfig = function(e) {
  e.preventDefault();
  const url = document.getElementById('supa-url-input')?.value;
  const key = document.getElementById('supa-key-input')?.value;
  SupabaseEngine.saveConfig(url, key);
  alert('Supabase credentials saved!');
  renderFullAdminPage();
};

window.openAddUserModal = function() {
  const email = prompt('Enter User Email:');
  if (!email) return;
  const name = prompt('Enter Full Name:', 'User');
  const planId = prompt('Select Plan ID (free, pro-monthly, pro-yearly):', 'pro-monthly');

  AuthSubscriptionEngine.saveUser({ email, name, planId, password: 'password123' });
  renderFullAdminPage();
};

window.deleteAdminUser = function(userId) {
  if (confirm('Delete this user account?')) {
    AuthSubscriptionEngine.deleteUser(userId);
    renderFullAdminPage();
  }
};

window.openAddPlanModal = function() {
  const name = prompt('Plan Name:', 'Pro Special');
  if (!name) return;
  const priceINR = parseFloat(prompt('Price in INR (₹):', '999'));
  const durationDays = parseInt(prompt('Duration in Days:', '30'));
  const maxFileSizeMB = parseInt(prompt('Max File Size (MB):', '300'));

  AdminPanelEngine.savePlan({ name, priceINR, durationDays, maxFileSizeMB });
  renderFullAdminPage();
};

window.changeAdminUserPlan = function(userId) {
  const plans = AuthSubscriptionEngine.getPlans();
  const planIds = plans.map(p => p.id).join(', ');
  const selectedPlanId = prompt(`Enter new Plan ID for user (${planIds}):`, 'pro-monthly');

  if (selectedPlanId) {
    try {
      AuthSubscriptionEngine.subscribeUser(userId, selectedPlanId, 'ADMIN_MANUAL_ASSIGN');
      alert(`User plan successfully updated to ${selectedPlanId}!`);
      renderFullAdminPage();
      if (AuthSubscriptionEngine.renderHeaderAuthControls) {
        AuthSubscriptionEngine.renderHeaderAuthControls();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign plan');
    }
  }
};

