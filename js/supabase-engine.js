/**
 * StudioSuite Pro - Supabase Integration & Cloud Work History Engine
 */

class SupabaseEngine {
  static STORAGE_SUPABASE_CONFIG = 'studiosuite_supabase_config';
  static STORAGE_WORK_HISTORY = 'studiosuite_work_history';

  static getConfig() {
    return JSON.parse(localStorage.getItem(this.STORAGE_SUPABASE_CONFIG) || '{"url":"","key":""}');
  }

  static saveConfig(url, key) {
    localStorage.setItem(this.STORAGE_SUPABASE_CONFIG, JSON.stringify({ url, key }));
  }

  /**
   * Save user work / document processing history (Cloud or Local fallback)
   */
  static async saveWorkHistory(userId, toolId, toolName, filename, fileSize) {
    const record = {
      id: 'work_' + Date.now(),
      userId: userId || 'guest',
      toolId,
      toolName,
      filename,
      fileSize: fileSize || 0,
      timestamp: new Date().toISOString()
    };

    // Save to local storage history
    const history = JSON.parse(localStorage.getItem(this.STORAGE_WORK_HISTORY) || '[]');
    history.unshift(record);
    // Keep last 50 entries
    if (history.length > 50) history.pop();
    localStorage.setItem(this.STORAGE_WORK_HISTORY, JSON.stringify(history));

    // Supabase Sync if configured
    const config = this.getConfig();
    if (config.url && config.key && window.supabase) {
      try {
        const client = window.supabase.createClient(config.url, config.key);
        await client.from('work_history').insert([record]);
      } catch (e) {
        console.warn('Supabase sync warning:', e);
      }
    }

    return record;
  }

  /**
   * Fetch User Work History
   */
  static getWorkHistory(userId = null) {
    const history = JSON.parse(localStorage.getItem(this.STORAGE_WORK_HISTORY) || '[]');
    if (userId) {
      return history.filter(h => h.userId === userId || h.userId === 'guest');
    }
    return history;
  }
}

window.SupabaseEngine = SupabaseEngine;
