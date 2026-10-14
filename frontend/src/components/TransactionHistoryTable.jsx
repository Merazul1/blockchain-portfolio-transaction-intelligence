import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Fuel, 
  ExternalLink, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const TransactionHistoryTable = ({ transactions = [], onSelectTx }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [chainFilter, setChainFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const shortenHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  const getExplorerTxUrl = (chainId, hash) => {
    if (chainId === 204) return `https://opbnb.bscscan.com/tx/${hash}`;
    if (chainId === 1) return `https://etherscan.io/tx/${hash}`;
    return `https://bscscan.com/tx/${hash}`;
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.TxHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.MethodName && tx.MethodName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.FromAddress && tx.FromAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.ToAddress && tx.ToAddress.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesChain = chainFilter === 'ALL' || tx.ChainId.toString() === chainFilter;

    let matchesStatus = true;
    if (statusFilter === 'SUCCESS') matchesStatus = tx.Status === 'SUCCESS' && (!tx.AnomalyFlags);
    if (statusFilter === 'FAILED') matchesStatus = tx.Status === 'FAILED' || tx.IsError === 1;
    if (statusFilter === 'ANOMALY') matchesStatus = Boolean(tx.AnomalyFlags);

    return matchesSearch && matchesChain && matchesStatus;
  });

  return (
    <div className="bg-cyber-card rounded-2xl border border-cyber-border overflow-hidden">
      {/* Table Filters & Header */}
      <div className="p-4 sm:p-5 border-b border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Transaction Intelligence Ledger</h3>
          <p className="text-xs text-cyber-textMuted mt-0.5">
            Real-time forensic analysis with gas metrics and automated anomaly detection
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-cyber-border text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg ${statusFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setStatusFilter('SUCCESS')}
              className={`px-2.5 py-1 rounded-lg ${statusFilter === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Success
            </button>
            <button
              onClick={() => setStatusFilter('FAILED')}
              className={`px-2.5 py-1 rounded-lg ${statusFilter === 'FAILED' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Failed ({transactions.filter(t => t.Status === 'FAILED' || t.IsError === 1).length})
            </button>
            <button
              onClick={() => setStatusFilter('ANOMALY')}
              className={`px-2.5 py-1 rounded-lg ${statusFilter === 'ANOMALY' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Anomalies ({transactions.filter(t => t.AnomalyFlags).length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search hash or method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-cyber-border rounded-xl pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/50 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-cyber-border">
            <tr>
              <th className="py-3 px-4">Status & Risk</th>
              <th className="py-3 px-4">Tx Hash</th>
              <th className="py-3 px-4">Network</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Value (USD)</th>
              <th className="py-3 px-4 text-right">Gas Fee</th>
              <th className="py-3 px-4">Age</th>
              <th className="py-3 px-4 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-slate-500">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isFailed = tx.Status === 'FAILED' || tx.IsError === 1;
                const hasAnomaly = Boolean(tx.AnomalyFlags);
                const chainName = tx.ChainId === 56 ? 'BSC' : tx.ChainId === 204 ? 'opBNB' : tx.ChainId === 1 ? 'Ethereum' : `Chain ${tx.ChainId}`;
                
                return (
                  <tr 
                    key={tx.TxHash} 
                    onClick={() => onSelectTx && onSelectTx(tx)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    {/* Status & Risk Pill */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {isFailed ? (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-red-400" />
                            <span>FAILED</span>
                          </span>
                        ) : hasAnomaly ? (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>ANOMALY</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>SUCCESS</span>
                          </span>
                        )}

                        {tx.RiskScore > 40 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800 font-mono" title={`Risk Score: ${tx.RiskScore}/100`}>
                            {tx.RiskScore} RISK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tx Hash */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 group-hover:text-amber-400 transition">
                      <div className="flex items-center space-x-1.5">
                        <span>{shortenHash(tx.TxHash)}</span>
                      </div>
                    </td>

                    {/* Network Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.ChainId === 56 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : tx.ChainId === 204 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {chainName}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-cyber-border">
                        {tx.MethodName || 'Transfer'}
                      </span>
                    </td>

                    {/* Value USD */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200">
                      {tx.ValueUsd > 0 ? (
                        <span>${parseFloat(tx.ValueUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-slate-500">$0.00</span>
                      )}
                    </td>

                    {/* Gas Fee */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="text-slate-300 font-medium">
                        ${(tx.GasFeeUsd || 0).toFixed(4)}
                      </div>
                      <div className="text-[10px] text-cyber-textMuted">
                        {tx.GasPriceGwei} Gwei
                      </div>
                    </td>

                    {/* Timestamp / Age */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {tx.Timestamp ? new Date(tx.Timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>

                    {/* Action Icon */}
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
                        title="Open Forensics Inspection"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
