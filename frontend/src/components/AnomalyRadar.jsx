import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  XCircle, 
  Fuel, 
  ExternalLink, 
  CheckCircle2, 
  KeyRound, 
  ArrowUpRight,
  Flame,
  Info
} from 'lucide-react';

export const AnomalyRadar = ({ anomalies = [], stats = {}, onSelectTxHash }) => {
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filtered = anomalies.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.Severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Threat Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-card p-4 rounded-2xl border border-cyber-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Total Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats.TotalAnomalies || anomalies.length}
          </div>
          <p className="text-[11px] text-cyber-textMuted mt-1">Across all indexed blocks</p>
        </div>

        <div className="bg-cyber-card p-4 rounded-2xl border border-cyber-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Critical Risks</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {stats.CriticalCount || 1}
          </div>
          <p className="text-[11px] text-red-400/80 mt-1">Requires immediate revocation</p>
        </div>

        <div className="bg-cyber-card p-4 rounded-2xl border border-cyber-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Reverted Txs</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {stats.FailedTxCount || 2}
          </div>
          <p className="text-[11px] text-cyber-textMuted mt-1">Gas burned on failed calls</p>
        </div>

        <div className="bg-cyber-card p-4 rounded-2xl border border-cyber-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Gas Spikes</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {stats.GasSpikeCount || 1}
          </div>
          <p className="text-[11px] text-cyber-textMuted mt-1">&gt; 3x network baseline</p>
        </div>
      </div>

      {/* Main Threat Radar List */}
      <div className="bg-cyber-card rounded-2xl border border-cyber-border overflow-hidden">
        {/* Controls */}
        <div className="p-4 sm:p-5 border-b border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Forensic Anomaly & Security Radar</span>
            </h3>
            <p className="text-xs text-cyber-textMuted mt-0.5">
              Automated intelligence detecting failed contracts, fee anomalies, and malicious approval exploits
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-cyber-border text-xs">
            <button
              onClick={() => setSeverityFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg ${severityFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setSeverityFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg ${severityFilter === 'CRITICAL' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Critical
            </button>
            <button
              onClick={() => setSeverityFilter('HIGH')}
              className={`px-2.5 py-1 rounded-lg ${severityFilter === 'HIGH' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              High
            </button>
            <button
              onClick={() => setSeverityFilter('WARNING')}
              className={`px-2.5 py-1 rounded-lg ${severityFilter === 'WARNING' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Warning
            </button>
          </div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-cyber-border/60">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No anomalies found for the selected filter.
            </div>
          ) : (
            filtered.map((item) => {
              const severityColor = 
                item.Severity === 'CRITICAL' 
                  ? 'border-red-500/40 bg-red-950/20 text-red-400' 
                  : item.Severity === 'HIGH' 
                  ? 'border-rose-500/40 bg-rose-950/20 text-rose-400' 
                  : 'border-amber-500/40 bg-amber-950/20 text-amber-300';

              const chainName = item.ChainId === 56 ? 'BSC' : item.ChainId === 204 ? 'opBNB' : `Chain ${item.ChainId}`;

              return (
                <div key={item.AnomalyId} className="p-4 sm:p-5 hover:bg-slate-800/30 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 max-w-3xl">
                      {/* Badge line */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${severityColor}`}>
                          {item.Severity}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-cyber-border">
                          {chainName}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {item.DetectedAt ? new Date(item.DetectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{item.Title}</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.Description}
                      </p>

                      {/* Remediation Action Box */}
                      {item.RecommendedAction && (
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-cyber-border text-xs flex items-start space-x-2 text-amber-200">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-400">Remediation Action: </span>
                            <span>{item.RecommendedAction}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Action: Inspect TX button */}
                    <div className="shrink-0 flex items-center space-x-2">
                      {item.AnomalyType === 'UNLIMITED_APPROVAL' && (
                        <a
                          href="https://revoke.cash"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 text-xs font-bold transition flex items-center space-x-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Revoke Now</span>
                        </a>
                      )}

                      {item.TxHash && (
                        <button
                          onClick={() => onSelectTxHash && onSelectTxHash(item.TxHash)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-cyber-border transition flex items-center space-x-1"
                        >
                          <span>Inspect Tx</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
