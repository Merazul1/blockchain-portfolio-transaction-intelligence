import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  ShieldCheck, 
  X,
  Layers
} from 'lucide-react';

export const ReportsModal = ({ wallet = {}, transactions = [], anomalies = [], onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [targetChain, setTargetChain] = useState('ALL');

  const handleDownload = () => {
    const chainParam = targetChain === 'ALL' ? null : targetChain;
    const downloadUrl = api.getReportDownloadUrl(wallet.Address, selectedFormat, chainParam);
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Export Intelligence Reports</h3>
            <p className="text-xs text-cyber-textMuted">Auditor-grade ledger and forensic security documents</p>
          </div>
        </div>

        {/* Report Overview Preview */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-cyber-border text-xs space-y-2 mb-5">
          <div className="flex justify-between text-slate-300">
            <span>Target Wallet:</span>
            <span className="font-mono text-white">{wallet.Address ? `${wallet.Address.substring(0, 10)}...${wallet.Address.substring(wallet.Address.length - 8)}` : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Transactions Included:</span>
            <span className="font-mono text-emerald-400 font-bold">{transactions.length} records</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Security Flags & Anomalies:</span>
            <span className="font-mono text-amber-400 font-bold">{anomalies.length} items</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Net Portfolio Valuation:</span>
            <span className="font-mono text-white font-bold">${(wallet.CalculatedNetWorthUsd || wallet.TotalUsdValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
          </div>
        </div>

        {/* Filter Chain */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Network Scope</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setTargetChain('ALL')}
              className={`p-2 rounded-xl border font-medium transition ${
                targetChain === 'ALL' ? 'bg-slate-700 text-white border-slate-500 font-bold' : 'bg-slate-900 text-slate-400 border-cyber-border'
              }`}
            >
              All Chains
            </button>
            <button
              onClick={() => setTargetChain('56')}
              className={`p-2 rounded-xl border font-medium transition ${
                targetChain === '56' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-400 border-cyber-border'
              }`}
            >
              BSC Only
            </button>
            <button
              onClick={() => setTargetChain('204')}
              className={`p-2 rounded-xl border font-medium transition ${
                targetChain === '204' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-slate-900 text-slate-400 border-cyber-border'
              }`}
            >
              opBNB Only
            </button>
          </div>
        </div>

        {/* Format Selectors */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 ${
                selectedFormat === 'csv'
                  ? 'bg-amber-500/10 border-amber-400 text-amber-300 shadow-glow-bsc'
                  : 'bg-slate-900 border-cyber-border text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold">CSV Ledger</span>
              <span className="text-[10px] text-slate-500">Tax & Excel</span>
            </button>

            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 ${
                selectedFormat === 'pdf'
                  ? 'bg-red-500/10 border-red-400 text-red-300'
                  : 'bg-slate-900 border-cyber-border text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5 text-red-400" />
              <span className="text-xs font-bold">PDF Audit</span>
              <span className="text-[10px] text-slate-500">Security Report</span>
            </button>

            <button
              onClick={() => setSelectedFormat('json')}
              className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center space-y-1 ${
                selectedFormat === 'json'
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-cyber-border text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold">JSON Bundle</span>
              <span className="text-[10px] text-slate-500">Dev Forensics</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-glow-bsc"
        >
          <Download className="w-4 h-4" />
          <span>Download {selectedFormat.toUpperCase()} Intelligence Report</span>
        </button>
      </div>
    </div>
  );
};
