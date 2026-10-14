import React from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Fuel, 
  ShieldAlert, 
  ArrowRight,
  Hash
} from 'lucide-react';

export const TxDetailModal = ({ tx, onClose }) => {
  if (!tx) return null;

  const isFailed = tx.Status === 'FAILED' || tx.IsError === 1;
  const hasAnomaly = Boolean(tx.AnomalyFlags);
  const chainName = tx.ChainId === 56 ? 'BNB Smart Chain (BSC)' : tx.ChainId === 204 ? 'opBNB Mainnet' : tx.ChainId === 1 ? 'Ethereum' : `Chain ${tx.ChainId}`;
  const explorerUrl = tx.ChainId === 204 
    ? `https://opbnb.bscscan.com/tx/${tx.TxHash}` 
    : tx.ChainId === 1 
    ? `https://etherscan.io/tx/${tx.TxHash}` 
    : `https://bscscan.com/tx/${tx.TxHash}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2.5 rounded-xl ${isFailed ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {isFailed ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Transaction Forensics</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                isFailed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {tx.Status}
              </span>
            </h3>
            <p className="text-xs text-cyber-textMuted">{chainName}</p>
          </div>
        </div>

        {/* Revert / Error Banner if Failed */}
        {isFailed && (
          <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-3 mb-4 text-xs">
            <div className="font-bold text-red-400 flex items-center space-x-1.5 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Execution Reverted</span>
            </div>
            <div className="text-red-200">
              {tx.RevertReason || tx.ErrCode || 'Transaction reverted during EVM opcode execution.'}
            </div>
          </div>
        )}

        {/* Anomaly Flag Banner */}
        {hasAnomaly && (
          <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 mb-4 text-xs">
            <div className="font-bold text-amber-400 flex items-center space-x-1.5 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Anomaly Detected: {tx.AnomalyFlags}</span>
            </div>
            <p className="text-amber-200/90 text-[11px]">
              This transaction triggered forensic security triggers (e.g., gas price spike or unlimited allowance).
            </p>
          </div>
        )}

        {/* Details List */}
        <div className="space-y-3 text-xs bg-slate-900/70 p-4 rounded-xl border border-cyber-border mb-5">
          {/* Hash */}
          <div>
            <span className="text-slate-400 block mb-0.5">Transaction Hash:</span>
            <div className="flex items-center justify-between font-mono text-slate-200 bg-slate-950 p-2 rounded-lg break-all">
              <span>{tx.TxHash}</span>
              <button 
                onClick={() => copyToClipboard(tx.TxHash)}
                className="ml-2 p-1 hover:text-amber-400 text-slate-400 shrink-0" 
                title="Copy Hash"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* From -> To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block mb-0.5">From:</span>
              <span className="font-mono text-slate-300 text-[11px] block truncate">{tx.FromAddress}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">To / Contract:</span>
              <span className="font-mono text-slate-300 text-[11px] block truncate">{tx.ToAddress || 'Contract Creation'}</span>
            </div>
          </div>

          {/* Method and Block */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cyber-border/60">
            <div>
              <span className="text-slate-400 block">Method:</span>
              <span className="font-mono font-bold text-white">{tx.MethodName || 'Transfer'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Block Height:</span>
              <span className="font-mono text-slate-200">#{tx.BlockNumber?.toLocaleString()}</span>
            </div>
          </div>

          {/* Gas & Fee Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyber-border/60">
            <div>
              <span className="text-slate-400 block">Gas Price:</span>
              <span className="font-mono text-amber-300 font-bold">{tx.GasPriceGwei} Gwei</span>
            </div>
            <div>
              <span className="text-slate-400 block">Gas Used:</span>
              <span className="font-mono text-slate-200">{tx.GasUsed?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Fee (USD):</span>
              <span className="font-mono text-slate-200 font-bold">${(tx.GasFeeUsd || 0).toFixed(4)}</span>
            </div>
          </div>

          {/* Value USD */}
          <div className="pt-2 border-t border-cyber-border/60 flex justify-between items-center">
            <span className="text-slate-400">Transaction Value:</span>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-sm">
                ${(tx.ValueUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-slate-400 text-[11px] ml-1">
                ({tx.ValueEth || 0} Native)
              </span>
            </div>
          </div>
        </div>

        {/* View on Explorer Link Button */}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition border border-cyber-border"
        >
          <span>View on Official Block Explorer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
