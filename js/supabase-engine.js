/**
 * StudioSuite Pro — NeonEngine
 * All data is fetched/saved via the Neon Functions serverless API.
 * window.SupabaseEngine is aliased to NeonEngine for backward compatibility.
 */

class NeonEngine {
  static API_BASE =
    (typeof window !== 'undefined' && window.NEON_API_URL)
      ? window.NEON_API_URL
      : 'https://br-curly-term-ayxbe0h1-api.compute.c-5.us-east-2.aws.neon.tech';

  /**
   * Central fetch helper.
   * @param {string} path - e.g. '/api/work-history'
   * @param {'GET'|'POST'|'DELETE'} method
   * @param {object|null} body - JSON body for POST
   * @returns {Promise<any>} - parsed JSON response
   */
  static async call(path, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== null) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${this.API_BASE}${path}`, opts);
    } catch (networkErr) {
      throw new Error('Network error: ' + (networkErr.message || 'Could not reach API'));
    }

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid JSON response from API');
    }

    if (!res.ok) {
      throw new Error(data.error || `API error ${res.status}`);
    }
    return data;
  }

  // ── Work History ──────────────────────────────────────────────────────────

  /**
   * Save a work history record to the DB.
   * Falls back silently on error so tool processing never breaks.
   */
  static async saveWorkHistory(userId, toolId, toolName, filename, fileSize) {
    try {
      return await this.call('/api/work-history', 'POST', {
        user_id: userId || 'guest',
        tool_id: toolId,
        tool_name: toolName,
        filename,
        file_size: fileSize || 0,
      });
    } catch (e) {
      console.warn('[NeonEngine] saveWorkHistory failed (non-fatal):', e.message);
      return null;
    }
  }

  /**
   * Fetch work history for a user (last 50 records).
   */
  static async getWorkHistory(userId) {
    try {
      const id = userId || 'guest';
      return await this.call(`/api/work-history/${encodeURIComponent(id)}`, 'GET');
    } catch (e) {
      console.warn('[NeonEngine] getWorkHistory failed:', e.message);
      return [];
    }
  }

  // ── Features cache ─────────────────────────────────────────────────────────

  /** Populated by initFeatures() — { toolId: boolean } */
  static _featuresCache = null;

  /**
   * Fetch enabled_features from DB and populate _featuresCache.
   * Called once on page load by app.js.
   */
  static async initFeatures() {
    try {
      const rows = await this.call('/api/features', 'GET');
      const cache = {};
      for (const row of rows) {
        cache[row.toolId] = row.enabled;
      }
      this._featuresCache = cache;

      // Also make available on AdminPanelEngine for sync access
      if (window.AdminPanelEngine) {
        window.AdminPanelEngine._featuresCache = cache;
      }

      return cache;
    } catch (e) {
      console.warn('[NeonEngine] initFeatures failed:', e.message);
      this._featuresCache = {};
      return {};
    }
  }

  // ── Settings cache ─────────────────────────────────────────────────────────

  /** Populated after first fetch — { key: value } */
  static _settingsCache = null;

  static async getSettings() {
    if (this._settingsCache) return this._settingsCache;
    try {
      this._settingsCache = await this.call('/api/settings', 'GET');
      return this._settingsCache;
    } catch (e) {
      console.warn('[NeonEngine] getSettings failed:', e.message);
      return {};
    }
  }

  static async setSetting(key, value) {
    try {
      const res = await this.call('/api/settings', 'POST', { key, value });
      if (!this._settingsCache) this._settingsCache = {};
      this._settingsCache[key] = value;
      return res;
    } catch (e) {
      console.warn('[NeonEngine] setSetting failed:', e.message);
      return null;
    }
  }

  // ── Compat: getConfig() used by old code that checked Supabase status ──────

  static getConfig() {
    return { url: this.API_BASE, key: '' };
  }
}

window.NeonEngine    = NeonEngine;
window.SupabaseEngine = NeonEngine; // backward compat alias
