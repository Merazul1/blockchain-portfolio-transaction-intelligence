const API_BASE = 'http://localhost:5000/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getNetworks() {
    const res = await fetch(`${API_BASE}/networks`);
    return res.json();
  },

  async getWallets() {
    const res = await fetch(`${API_BASE}/wallets`);
    return res.json();
  },

  async getWallet(address) {
    const res = await fetch(`${API_BASE}/wallets/${address}`);
    return res.json();
  },

  async getBalances(address, chainId) {
    const url = chainId 
      ? `${API_BASE}/wallets/${address}/balances?chainId=${chainId}` 
      : `${API_BASE}/wallets/${address}/balances`;
    const res = await fetch(url);
    return res.json();
  },

  async syncWallet(address) {
    const res = await fetch(`${API_BASE}/wallets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    return res.json();
  },

  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getTransaction(hash) {
    const res = await fetch(`${API_BASE}/transactions/${hash}`);
    return res.json();
  },

  async getAnomalies(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/anomalies${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getAlertRules() {
    const res = await fetch(`${API_BASE}/alerts/rules`);
    return res.json();
  },

  async createAlertRule(rule) {
    const res = await fetch(`${API_BASE}/alerts/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return res.json();
  },

  async deleteAlertRule(ruleId) {
    const res = await fetch(`${API_BASE}/alerts/rules/${ruleId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/alerts/notifications${query ? `?${query}` : ''}`);
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/alerts/notifications/${id}/read`, {
      method: 'POST',
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/alerts/notifications/read-all`, {
      method: 'POST',
    });
    return res.json();
  },

  getReportDownloadUrl(walletAddress, format = 'csv', chainId = null) {
    let url = `${API_BASE}/reports/export?walletAddress=${walletAddress}&format=${format}`;
    if (chainId) url += `&chainId=${chainId}`;
    return url;
  },

  async getLivePrices() {
    const res = await fetch(`${API_BASE}/prices`);
    return res.json();
  }
};
