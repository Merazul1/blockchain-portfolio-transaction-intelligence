import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Fuel, 
  DollarSign, 
  X
} from 'lucide-react';

export const AlertsManager = ({ 
  rules = [], 
  notifications = [], 
  unreadCount = 0,
  onCreateRule, 
  onDeleteRule, 
  onMarkRead, 
  onMarkAllRead,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('NOTIFICATIONS'); // 'NOTIFICATIONS' | 'RULES'
  const [showAddForm, setShowAddForm] = useState(false);

  // New rule form state
  const [ruleName, setRuleName] = useState('');
  const [alertType, setAlertType] = useState('GAS_SPIKE');
  const [thresholdValue, setThresholdValue] = useState('20');
  const [chainId, setChainId] = useState('56');

  const handleSubmitRule = (e) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    onCreateRule({
      ruleName: ruleName.trim(),
      alertType,
      thresholdValue: parseFloat(thresholdValue) || 0,
      chainId: chainId === 'ALL' ? null : parseInt(chainId, 10),
      comparisonOperator: '>=',
    });

    setShowAddForm(false);
    setRuleName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alerts & Threat Intelligence Hub</h3>
              <p className="text-xs text-cyber-textMuted">Automated triggers and notification feed</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-cyber-border bg-slate-900/60 px-5 pt-3">
          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'NOTIFICATIONS'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Live Inbox</span>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('RULES')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'RULES'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Configured Rules ({rules.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Triggered Alert Events</span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No alert notifications recorded yet.
                </div>
              ) : (
                notifications.map((item) => {
                  const severityBadge = 
                    item.Severity === 'CRITICAL' 
                      ? 'border-red-500/40 bg-red-950/30 text-red-400' 
                      : item.Severity === 'HIGH' 
                      ? 'border-rose-500/40 bg-rose-950/30 text-rose-300' 
                      : 'border-amber-500/40 bg-amber-950/30 text-amber-300';

                  return (
                    <div 
                      key={item.NotificationId}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                        item.IsRead ? 'bg-slate-900/30 border-cyber-border opacity-70' : 'bg-slate-900/80 border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${severityBadge}`}>
                            {item.Severity}
                          </span>
                          <span className="text-xs font-bold text-white">{item.Title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{item.Message}</p>
                      </div>

                      {!item.IsRead && (
                        <button
                          onClick={() => onMarkRead(item.NotificationId)}
                          className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'RULES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Custom Alert Rules</span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Rule</span>
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleSubmitRule} className="bg-slate-900 p-4 rounded-xl border border-cyber-border space-y-3">
                  <div className="text-xs font-bold text-white">Create New Alert Trigger</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Rule Name</label>
                      <input
                        type="text"
                        placeholder="e.g. BSC Gas Spike Alert"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-cyber-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Alert Condition</label>
                      <select
                        value={alertType}
                        onChange={(e) => setAlertType(e.target.value)}
                        className="w-full bg-slate-800 border border-cyber-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="GAS_SPIKE">Gas Price Spike (Gwei)</option>
                        <option value="TX_FAILED">Transaction Reverted / Failed</option>
                        <option value="LARGE_TRANSFER">Whale Outflow Transfer ($)</option>
                        <option value="RISK_SCORE_HIGH">Critical Risk Score &gt; Threshold</option>
                        <option value="TOKEN_APPROVAL">Unlimited Token Approval</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Threshold Value</label>
                      <input
                        type="number"
                        placeholder="20"
                        value={thresholdValue}
                        onChange={(e) => setThresholdValue(e.target.value)}
                        className="w-full bg-slate-800 border border-cyber-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Target Chain</label>
                      <select
                        value={chainId}
                        onChange={(e) => setChainId(e.target.value)}
                        className="w-full bg-slate-800 border border-cyber-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="ALL">All Supported Chains</option>
                        <option value="56">BNB Smart Chain (BSC)</option>
                        <option value="204">opBNB Mainnet</option>
                        <option value="1">Ethereum Mainnet</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
                    >
                      Save Rule
                    </button>
                  </div>
                </form>
              )}

              {/* Rules List */}
              <div className="space-y-2">
                {rules.map((r) => (
                  <div key={r.RuleId} className="p-3 rounded-xl bg-slate-900/60 border border-cyber-border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{r.RuleName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {r.AlertType}
                        </span>
                      </div>
                      <div className="text-[11px] text-cyber-textMuted mt-0.5">
                        Trigger: {r.ComparisonOperator} {r.ThresholdValue || 'N/A'} {r.ChainId ? `(Chain ${r.ChainId})` : '(Global)'}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteRule(r.RuleId)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
