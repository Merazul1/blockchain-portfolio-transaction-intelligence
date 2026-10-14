import React from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  Fuel, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const PortfolioOverview = ({ wallet = {}, balances = [], onSync, isSyncing }) => {
  const netWorth = parseFloat(wallet.CalculatedNetWorthUsd || wallet.TotalUsdValue || 0);
  const riskScore = wallet.RiskScore !== undefined ? wallet.RiskScore : 18;
  const safetyRating = wallet.SafetyRating || (riskScore > 70 ? 'Critical' : riskScore > 40 ? 'Moderate' : 'Low Risk');

  // Breakdown by chain
  const bscTotal = balances
    .filter(b => b.ChainId === 56)
    .reduce((acc, curr) => acc + (parseFloat(curr.UsdValue) || 0), 0);
  
  const opBnbTotal = balances
    .filter(b => b.ChainId === 204)
    .reduce((acc, curr) => acc + (parseFloat(curr.UsdValue) || 0), 0);

  const ethTotal = balances
    .filter(b => b.ChainId === 1)
    .reduce((acc, curr) => acc + (parseFloat(curr.UsdValue) || 0), 0);

  const bscPct = netWorth > 0 ? ((bscTotal / netWorth) * 100).toFixed(1) : 0;
  const opBnbPct = netWorth > 0 ? ((opBnbTotal / netWorth) * 100).toFixed(1) : 0;
  const ethPct = netWorth > 0 ? ((ethTotal / netWorth) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Sync Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-cyber-card p-4 rounded-2xl border border-cyber-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">{wallet.Label || 'Target Crypto Portfolio'}</h2>
            {wallet.EnsName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                {wallet.EnsName}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-cyber-textMuted mt-1">
            {wallet.Address}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right text-xs">
            <div className="text-slate-400">Last Synced:</div>
            <div className="text-slate-200 font-mono text-[11px]">
              {wallet.LastSyncedAt ? new Date(wallet.LastSyncedAt).toLocaleTimeString() : 'Just now'}
            </div>
          </div>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition disabled:opacity-50"
            title="Fetch real-time on-chain state from RPC"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing RPC...' : 'Sync On-Chain'}</span>
          </button>
        </div>
      </div>

      {/* 4 Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-cyber-card p-5 rounded-2xl border border-cyber-border relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Net Worth</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1 mt-2 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.45% (24h)</span>
            <span className="text-slate-500 text-[10px] ml-1">across BSC & opBNB</span>
          </div>
        </div>

        {/* Safety & Risk Score */}
        <div className="bg-cyber-card p-5 rounded-2xl border border-cyber-border relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Safety & Risk Score</span>
            <div className={`p-2 rounded-lg ${riskScore > 50 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {riskScore > 50 ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold tracking-tight font-mono ${riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
              {100 - riskScore}
            </span>
            <span className="text-xs text-slate-400">/ 100 Health</span>
          </div>
          <div className="mt-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              riskScore > 50 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {safetyRating}
            </span>
          </div>
        </div>

        {/* Gas Expended */}
        <div className="bg-cyber-card p-5 rounded-2xl border border-cyber-border relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cumulative Gas Spent</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            ${(wallet.TotalGasSpentUsd || 5.82).toFixed(2)}
          </div>
          <p className="text-[11px] text-cyber-textMuted mt-2">
            opBNB saves <span className="text-emerald-400 font-semibold">99.8%</span> vs standard L1 gas
          </p>
        </div>

        {/* Failed & Unusual Txs */}
        <div className="bg-cyber-card p-5 rounded-2xl border border-cyber-border relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Threats / Failed Txs</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-red-400 tracking-tight font-mono">
              {wallet.FailedTxCount || 3}
            </span>
            <span className="text-xs text-slate-400">Reverts / Spikes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {wallet.TotalTxCount || 42} total transactions indexed
          </p>
        </div>
      </div>

      {/* Network Distribution Bar */}
      <div className="bg-cyber-card p-5 rounded-2xl border border-cyber-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Chain Capital Distribution</span>
          </h3>
          <span className="text-xs text-cyber-textMuted">Live RPC Allocation</span>
        </div>

        {/* Multi-colored progress bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${bscPct}%` }} 
            className="bg-[#F3BA2F] hover:opacity-90 transition" 
            title={`BSC: ${bscPct}%`}
          ></div>
          <div 
            style={{ width: `${opBnbPct}%` }} 
            className="bg-[#00E676] hover:opacity-90 transition" 
            title={`opBNB: ${opBnbPct}%`}
          ></div>
          <div 
            style={{ width: `${ethPct}%` }} 
            className="bg-[#627EEA] hover:opacity-90 transition" 
            title={`Ethereum: ${ethPct}%`}
          ></div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-cyber-border">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F3BA2F]"></span>
            <div>
              <div className="font-semibold text-white">BNB Smart Chain (BSC)</div>
              <div className="text-[11px] text-slate-400 font-mono">
                ${bscTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({bscPct}%)
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-cyber-border">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]"></span>
            <div>
              <div className="font-semibold text-white">opBNB Layer 2</div>
              <div className="text-[11px] text-slate-400 font-mono">
                ${opBnbTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({opBnbPct}%)
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-cyber-border">
            <span className="w-2.5 h-2.5 rounded-full bg-[#627EEA]"></span>
            <div>
              <div className="font-semibold text-white">Ethereum & Other</div>
              <div className="text-[11px] text-slate-400 font-mono">
                ${ethTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({ethPct}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
