/**
 * StudioSuite Pro â€” SupabaseEngine
 * Real Supabase client wrapper. Replaces the old NeonEngine API proxy.
 * window.NeonEngine and window.SupabaseEngine are both aliased here for
 * backward compatibility with the rest of the codebase.
 */

// â”€â”€ Supabase configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SUPABASE_URL  = 'https://hpmsmhqdgzikbgaprcad.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXNtaHFkZ3ppa2JnYXByY2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NjYxMTgsImV4cCI6MjEwNDE0MjExOH0._IHf7Ydxwv8gJitn44JtftdS5uqP03-y3WMrqj_0C40';

// Initialise the Supabase JS client (CDN loaded via index.html)
const _sbClient = (typeof supabase !== 'undefined' && supabase.createClient)
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    })
  : null;

if (!_sbClient) {
  console.error('[SupabaseEngine] Supabase JS SDK not loaded! Make sure the CDN script is in index.html.');
}

// â”€â”€ SupabaseEngine class â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class SupabaseEngine {

  // Expose the raw client so auth-subscription.js can call supabase.auth.*
  static get client() { return _sbClient; }

  // â”€â”€ Features cache (tool enabled/disabled states) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static _featuresCache = null;

  /**
   * Fetch enabled_features from Supabase and populate _featuresCache.
   * Falls back to localStorage cache, then all-enabled, on error.
   */
  static async initFeatures() {
    try {
      if (!_sbClient) throw new Error('No Supabase client');
      const { data, error } = await _sbClient
        .from('enabled_features')
        .select('tool_id, enabled');
      if (error) throw error;

      const cache = {};
      (data || []).forEach(row => { cache[row.tool_id] = row.enabled; });
      this._featuresCache = cache;

      // Sync to AdminPanelEngine and localStorage
      if (window.AdminPanelEngine) {
        window.AdminPanelEngine._featuresCache = cache;
        if (typeof window.AdminPanelEngine._saveFeaturesToStorage === 'function') {
          window.AdminPanelEngine._saveFeaturesToStorage(cache);
        }
      }
      return cache;
    } catch (e) {
      console.warn('[SupabaseEngine] initFeatures failed:', e.message);
      // Try localStorage fallback
      let cache = null;
      if (window.AdminPanelEngine && typeof window.AdminPanelEngine._loadFeaturesFromStorage === 'function') {
        cache = window.AdminPanelEngine._loadFeaturesFromStorage();
      }
      // Default: all tools enabled (prevents "All Tools Currently Disabled")
      if (!cache) {
        cache = {};
        (window.TOOLS || []).forEach(t => { cache[t.id] = true; });
      }
      this._featuresCache = cache;
      if (window.AdminPanelEngine) window.AdminPanelEngine._featuresCache = cache;
      return cache;
    }
  }

  /**
   * Toggle a single tool's enabled state in Supabase.
   */
  static async setFeatureEnabled(toolId, enabled) {
    if (!_sbClient) return;
    await _sbClient
      .from('enabled_features')
      .upsert({ tool_id: toolId, enabled: !!enabled, updated_at: new Date().toISOString() });
    const cache = this._featuresCache || {};
    cache[toolId] = !!enabled;
    this._featuresCache = cache;
  }

  /**
   * Enable all tools at once.
   */
  static async enableAllFeatures(toolIds) {
    if (!_sbClient || !toolIds || !toolIds.length) return;
    const rows = toolIds.map(id => ({ tool_id: id, enabled: true, updated_at: new Date().toISOString() }));
    await _sbClient.from('enabled_features').upsert(rows);
    const cache = {};
    toolIds.forEach(id => { cache[id] = true; });
    this._featuresCache = cache;
  }

  /**
   * Disable all tools at once.
   */
  static async disableAllFeatures(toolIds) {
    if (!_sbClient || !toolIds || !toolIds.length) return;
    const rows = toolIds.map(id => ({ tool_id: id, enabled: false, updated_at: new Date().toISOString() }));
    await _sbClient.from('enabled_features').upsert(rows);
    const cache = {};
    toolIds.forEach(id => { cache[id] = false; });
    this._featuresCache = cache;
  }

  // â”€â”€ Settings cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static _settingsCache = null;

  static async getSettings() {
    if (this._settingsCache) return this._settingsCache;
    try {
      if (!_sbClient) throw new Error('No Supabase client');
      const { data, error } = await _sbClient.from('site_settings').select('key, value');
      if (error) throw error;
      const cache = {};
      (data || []).forEach(row => {
        try { cache[row.key] = JSON.parse(row.value); } catch { cache[row.key] = row.value; }
      });
      this._settingsCache = cache;
      return cache;
    } catch (e) {
      console.warn('[SupabaseEngine] getSettings failed:', e.message);
      return this._settingsCache || {};
    }
  }

  static async setSetting(key, value) {
    if (!_sbClient) return;
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    const { error } = await _sbClient
      .from('site_settings')
      .upsert({ key, value: strValue, updated_at: new Date().toISOString() });
    if (error) throw error;
    if (!this._settingsCache) this._settingsCache = {};
    try { this._settingsCache[key] = JSON.parse(strValue); } catch { this._settingsCache[key] = strValue; }
    if (window.AdminPanelEngine) {
      if (!window.AdminPanelEngine._settingsCache) window.AdminPanelEngine._settingsCache = {};
      window.AdminPanelEngine._settingsCache[key] = this._settingsCache[key];
    }
  }

  // -- Settings convenience helpers --
  static getAdminUpi() { const s=this._settingsCache; return (s&&s.admin_upi)?String(s.admin_upi).replace(/^\"|^\'/,'').replace(/\"$|\'$/,''):'merchant@upi'; }
  static async setAdminUpi(v) { const val=(v||'merchant@upi').trim(); await this.setSetting('admin_upi',val); return val; }
  static getPasscode() { const s=this._settingsCache; return (s&&s.admin_passcode)?String(s.admin_passcode).replace(/^\"|^\'/,'').replace(/\"$|\'$/,''):'admin123'; }
  static async saveContactInfo(i) { await this.setSetting('footer_contact',JSON.stringify(i)); }
  static getContactInfo() { try { const r=this._settingsCache&&this._settingsCache.footer_contact; if(r) return typeof r==='string'?JSON.parse(r):r; } catch(e){} return {company:'StudioSuite PRO',address:'',phone:'',email:'',hours:''}; }


  // â”€â”€ Work History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async saveWorkHistory(userId, toolId, toolName, filename, fileSize) {
    try {
      if (!_sbClient || !userId || userId === 'guest') return null;
      const { error } = await _sbClient.from('work_history').insert({
        user_id: userId,
        tool_id: toolId,
        tool_name: toolName,
        filename: filename || '',
        file_size: fileSize || 0,
      });
      if (error) console.warn('[SupabaseEngine] saveWorkHistory error:', error.message);
    } catch (e) {
      console.warn('[SupabaseEngine] saveWorkHistory failed (non-fatal):', e.message);
    }
    return null;
  }

  static async getWorkHistory(userId) {
    try {
      if (!_sbClient) return [];
      const { data, error } = await _sbClient
        .from('work_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[SupabaseEngine] getWorkHistory failed:', e.message);
      return [];
    }
  }

  // â”€â”€ Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static DEFAULT_PLANS = [
    {
      id: 'free',
      name: 'Free Tier',
      priceINR: 0,
      durationDays: 3650,
      maxFileSizeMB: 25,
      badge: 'Basic',
      features: ['Access to 50 Tools', '25MB File Upload Limit', 'Standard Processing Speed'],
      allowedToolIds: 'all',
    },
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      priceINR: 499,
      durationDays: 30,
      maxFileSizeMB: 250,
      badge: 'Popular',
      features: ['All 50 Master Tools Unlocked', '250MB File Upload Limit', 'Priority Email Support'],
      allowedToolIds: 'all',
    },
    {
      id: 'pro-yearly',
      name: 'Pro Annual',
      priceINR: 4999,
      durationDays: 365,
      maxFileSizeMB: 1000,
      badge: 'Best Value',
      features: ['All Pro Features Included', '1GB Max File Upload Size', '2 Months Free Savings'],
      allowedToolIds: 'all',
    },
  ];

  static async getPlans() {
    try {
      if (!_sbClient) return this.DEFAULT_PLANS;
      const { data, error } = await _sbClient.from('plans').select('*').order('price_inr');
      if (error) throw error;
      if (!data || !data.length) return this.DEFAULT_PLANS;
      return data.map(p => ({
        id: p.id,
        name: p.name,
        priceINR: p.price_inr ?? 0,
        durationDays: p.duration_days ?? 30,
        maxFileSizeMB: p.max_file_size_mb ?? 25,
        badge: p.badge || '',
        features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features || '[]') : []),
        allowedToolIds: p.allowed_tool_ids ?? 'all',
      }));
    } catch (e) {
      console.warn('[SupabaseEngine] getPlans failed:', e.message);
      return this.DEFAULT_PLANS;
    }
  }

  static async savePlan(plan) {
    if (!_sbClient) return;
    const { error } = await _sbClient.from('plans').upsert({
      id: plan.id,
      name: plan.name,
      price_inr: plan.priceINR ?? 0,
      duration_days: plan.durationDays ?? 30,
      max_file_size_mb: plan.maxFileSizeMB ?? 25,
      badge: plan.badge || '',
      features: plan.features || [],
      allowed_tool_ids: plan.allowedToolIds ?? 'all',
    });
    if (error) throw error;
  }

  static async deletePlan(planId) {
    if (!_sbClient) return;
    const { error } = await _sbClient.from('plans').delete().eq('id', planId);
    if (error) throw error;
  }

  // â”€â”€ Users (admin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async getUsers() {
    try {
      if (!_sbClient) return [];
      const { data, error } = await _sbClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(p => this._profileToUser(p));
    } catch (e) {
      console.warn('[SupabaseEngine] getUsers failed:', e.message);
      return [];
    }
  }

  /** Map a Supabase profile row to the user object shape the rest of the app expects */
  static _profileToUser(p) {
    return {
      id: p.id,
      email: p.email || '',
      name: p.name || '',
      phone: p.phone || '',
      org: p.org || '',
      planId: p.current_plan || 'free',
      status: p.subscription_verified && p.current_plan !== 'free' ? 'active' : (p.current_plan !== 'free' ? 'pending' : 'free'),
      expiresAt: p.plan_expiry || null,
      isAdmin: p.is_admin || false,
      subscriptionVerified: p.subscription_verified || false,
    };
  }

  static async getProfile(userId) {
    if (!_sbClient) return null;
    const { data, error } = await _sbClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return this._profileToUser(data);
  }

  static async updateProfile(userId, fields) {
    if (!_sbClient) return;
    const updates = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.phone !== undefined) updates.phone = fields.phone;
    if (fields.org !== undefined) updates.org = fields.org;
    if (fields.current_plan !== undefined) updates.current_plan = fields.current_plan;
    if (fields.plan_expiry !== undefined) updates.plan_expiry = fields.plan_expiry;
    if (fields.subscription_verified !== undefined) updates.subscription_verified = fields.subscription_verified;
    updates.updated_at = new Date().toISOString();
    const { error } = await _sbClient.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
  }

  static async deleteUser(userId) {
    if (!_sbClient) return;
    const { error } = await _sbClient.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    // Note: deleting from auth.users requires service role â€” handled as best-effort
  }

  // â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async getPayments() {
    try {
      if (!_sbClient) return [];
      const { data, error } = await _sbClient
        .from('payments')
        .select('*, profiles(email, name, current_plan)')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        userId: p.user_id,
        userEmail: p.profiles?.email || '',
        userName: p.profiles?.name || '',
        utrNumber: p.utr_number,
        planType: p.plan_type,
        amountINR: p.amount_paid,
        isVerified: p.is_verified,
        verifiedAt: p.verified_at,
        timestamp: p.payment_date,
        // legacy field names kept for backward compat
        planName: p.plan_type,
        amountPaid: p.amount_paid,
      }));
    } catch (e) {
      console.warn('[SupabaseEngine] getPayments failed:', e.message);
      return [];
    }
  }

  static async submitPayment({ userId, planType, amountINR, utrNumber }) {
    if (!_sbClient) throw new Error('No Supabase client');
    const { data, error } = await _sbClient
      .from('payments')
      .insert({
        user_id: userId,
        utr_number: utrNumber,
        plan_type: planType,
        amount_paid: amountINR,
        is_verified: false,
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('This UTR number has already been submitted. Please check your UTR and try again.');
      throw error;
    }
    return data;
  }

  /**
   * Admin: verify a payment and activate the user's plan.
   */
  static async verifyPayment(paymentId, userId, planType) {
    if (!_sbClient) throw new Error('No Supabase client');

    // Find the plan to get duration
    const plans = await this.getPlans();
    const plan = plans.find(p => p.id === planType) || plans.find(p => p.id === 'pro-monthly');
    const durationDays = plan ? plan.durationDays : 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);

    // Mark payment as verified
    const { error: payErr } = await _sbClient
      .from('payments')
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq('id', paymentId);
    if (payErr) throw payErr;

    // Activate user's plan
    const { error: profErr } = await _sbClient
      .from('profiles')
      .update({
        current_plan: planType,
        plan_expiry: expiry.toISOString(),
        subscription_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (profErr) throw profErr;

    return { planType, planExpiry: expiry.toISOString() };
  }

  static async deletePayment(paymentId) {
    if (!_sbClient) return;
    const { error } = await _sbClient.from('payments').delete().eq('id', paymentId);
    if (error) throw error;
  }

  // â”€â”€ Compat: getConfig() used by old code â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static getConfig() {
    return { url: SUPABASE_URL, key: SUPABASE_ANON };
  }

  // â”€â”€ Legacy NeonEngine.call() shim â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Some older code calls NeonEngine.call('/api/...', ...) directly.
  // We map those legacy routes to Supabase equivalents.
  static async call(path, method = 'GET', body = null) {
    console.warn('[SupabaseEngine] Legacy .call() invoked for path:', path, 'â€” please migrate caller to direct Supabase methods.');

    // Feature flags
    if (path === '/api/features' && method === 'GET') {
      const cache = this._featuresCache || await this.initFeatures();
      return Object.entries(cache).map(([toolId, enabled]) => ({ toolId, enabled }));
    }
    if (path === '/api/features/toggle' && method === 'POST') {
      await this.setFeatureEnabled(body.tool_id, body.enabled);
      return { ok: true };
    }
    if (path === '/api/features/enable-all' && method === 'POST') {
      await this.enableAllFeatures(body.tool_ids);
      return { ok: true };
    }
    if (path === '/api/features/disable-all' && method === 'POST') {
      await this.disableAllFeatures(body.tool_ids);
      return { ok: true };
    }

    // Settings
    if (path === '/api/settings' && method === 'GET') return this.getSettings();
    if (path === '/api/settings' && method === 'POST') {
      await this.setSetting(body.key, body.value);
      return { ok: true };
    }

    // Plans
    if (path === '/api/plans' && method === 'GET') return this.getPlans();
    if (path === '/api/plans' && method === 'POST') {
      await this.savePlan(body);
      return body;
    }
    if (path.startsWith('/api/plans/') && method === 'DELETE') {
      const planId = decodeURIComponent(path.replace('/api/plans/', ''));
      await this.deletePlan(planId);
      return { ok: true };
    }

    // Users
    if (path === '/api/users' && method === 'GET') return this.getUsers();
    if (path.match(/\/api\/users\/[^/]+\/profile/) && method === 'POST') {
      const userId = path.split('/')[3];
      await this.updateProfile(userId, body);
      return this.getProfile(userId);
    }
    if (path.match(/\/api\/users\/[^/]+\/plan/) && method === 'POST') {
      const userId = path.split('/')[3];
      const plans = await this.getPlans();
      const plan = plans.find(p => p.id === body.plan_id);
      const durationDays = plan ? plan.durationDays : 30;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + durationDays);
      await this.updateProfile(userId, {
        current_plan: body.plan_id,
        plan_expiry: expiry.toISOString(),
        subscription_verified: body.plan_id !== 'free',
      });
      return this.getProfile(userId);
    }
    if (path.match(/\/api\/users\/[^/]+$/) && method === 'DELETE') {
      const userId = path.split('/')[3];
      await this.deleteUser(userId);
      return { ok: true };
    }

    // Payments
    if (path === '/api/payments' && method === 'GET') return this.getPayments();
    if (path.startsWith('/api/payments/') && method === 'DELETE') {
      const payId = path.replace('/api/payments/', '');
      if (payId !== 'all') await this.deletePayment(payId);
      return { ok: true };
    }

    // Work history
    if (path === '/api/work-history' && method === 'POST') {
      return this.saveWorkHistory(body.user_id, body.tool_id, body.tool_name, body.filename, body.file_size);
    }
    if (path.startsWith('/api/work-history/') && method === 'GET') {
      const userId = decodeURIComponent(path.replace('/api/work-history/', ''));
      return this.getWorkHistory(userId);
    }

    // Subscribe (legacy â€” now handled by UTR flow; kept for compat)
    if (path === '/api/subscribe' && method === 'POST') {
      await this.updateProfile(body.user_id, { current_plan: body.plan_id, subscription_verified: false });
      return this.getProfile(body.user_id);
    }

    throw new Error(`[SupabaseEngine] Unmapped legacy path: ${path}`);
  }

  // â”€â”€ Auth helpers (called by auth-subscription.js) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async signUp(email, password, name) {
    if (!_sbClient) throw new Error('No Supabase client');
    const { data, error } = await _sbClient.auth.signUp({ email, password });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      // Insert profile row
      await _sbClient.from('profiles').upsert({
        id: userId,
        email,
        name: name || email.split('@')[0],
        current_plan: 'free',
        subscription_verified: false,
        is_admin: false,
      });
    }
    return data;
  }

  static async signIn(email, password) {
    if (!_sbClient) throw new Error('No Supabase client');
    const { data, error } = await _sbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    if (!_sbClient) return;
    await _sbClient.auth.signOut();
  }

  static async getSession() {
    if (!_sbClient) return null;
    const { data } = await _sbClient.auth.getSession();
    return data?.session || null;
  }

  static async refreshProfile(userId) {
    return this.getProfile(userId);
  }
}

// â”€â”€ Global aliases for backward compatibility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
window.SupabaseEngine = SupabaseEngine;
window.NeonEngine     = SupabaseEngine;   // full backward compat alias
