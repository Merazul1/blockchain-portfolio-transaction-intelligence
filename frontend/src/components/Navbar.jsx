import React, { useState } from 'react';
import { useWeb3, DEMO_WALLETS } from '../context/Web3Context';
import { 
  ShieldAlert, 
  Wallet, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  Bell, 
  Download,
  Activity,
  Layers
} from 'lucide-react';

export const Navbar = ({ onOpenReports, onOpenAlerts, unreadAlertsCount = 0 }) => {
  const { 
    account, 
    activeAddress, 
    walletLabel, 
    chainId, 
    switchNetwork, 
    connectMetaMask, 
    disconnectMetaMask, 
    isConnecting, 
    isMetaMaskAvailable,
    selectDemoWallet,
    setCustomAddress
  } = useWeb3();

  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim().startsWith('0x') && customInput.trim().length === 42) {
      setCustomAddress(customInput.trim());
      setShowCustomModal(false);
      setCustomInput('');
    } else {
      alert('Please enter a valid 42-character Ethereum/BSC hex address starting with 0x');
    }
  };

  return (
    <header className="border-b border-cyber-border bg-[#0B0E14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-glow-bsc">
            <Activity className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-white tracking-tight">ChainIntel</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live RPC & SQL Server
              </span>
            </div>
            <p className="text-xs text-cyber-textMuted hidden sm:block">
              Portfolio & Transaction Forensics Engine
            </p>
          </div>
        </div>

        {/* Center: Supported Network Quick Switch */}
        <div className="hidden md:flex items-center space-x-1.5 bg-cyber-card p-1 rounded-xl border border-cyber-border">
          <button
            onClick={() => switchNetwork(56)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              chainId === 56 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-bsc' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F3BA2F]"></span>
            <span>BSC</span>
          </button>

          <button
            onClick={() => switchNetwork(204)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              chainId === 204 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-opbnb' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
            <span>opBNB</span>
          </button>

          <button
            onClick={() => switchNetwork(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              chainId === 1 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#627EEA]"></span>
            <span>Ethereum</span>
          </button>
        </div>

        {/* Right Actions: Wallet Selector & MetaMask Connect */}
        <div className="flex items-center space-x-3">
          {/* Notification Alert Trigger */}
          <button 
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-white hover:border-slate-600 transition"
            title="Threat Alerts & Rule Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Export Report Action */}
          <button
            onClick={onOpenReports}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyber-card border border-cyber-border text-slate-300 hover:text-white hover:border-slate-600 transition text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Reports</span>
          </button>

          {/* Wallet Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyber-card border border-cyber-border hover:border-slate-600 transition text-xs text-slate-200"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold">{walletLabel}</div>
                <div className="text-[10px] font-mono text-cyber-textMuted">{shortenAddress(activeAddress)}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isWalletMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-cyber-card border border-cyber-border shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Preset Monitored Wallets
                </div>
                {DEMO_WALLETS.map((w) => (
                  <button
                    key={w.address}
                    onClick={() => {
                      selectDemoWallet(w);
                      setIsWalletMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between ${
                      activeAddress.toLowerCase() === w.address.toLowerCase()
                        ? 'bg-slate-800 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div>{w.label}</div>
                      <div className="text-[10px] font-mono text-slate-400">{shortenAddress(w.address)}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">{w.type}</span>
                  </button>
                ))}

                <div className="border-t border-cyber-border my-1"></div>

                <button
                  onClick={() => {
                    setIsWalletMenuOpen(false);
                    setShowCustomModal(true);
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs text-amber-400 hover:bg-slate-800/60 flex items-center space-x-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Custom Address...</span>
                </button>
              </div>
            )}
          </div>

          {/* Connect MetaMask Button */}
          {account ? (
            <button
              onClick={disconnectMetaMask}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition shadow-glow-opbnb"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono">{shortenAddress(account)}</span>
            </button>
          ) : (
            <button
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-glow-bsc active:scale-95 disabled:opacity-50"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="w-4 h-4" 
              />
              <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Address Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Track Any Blockchain Wallet</span>
            </h3>
            <p className="text-xs text-cyber-textMuted mb-4">
              Enter any EVM wallet address to fetch balances on BSC & opBNB, scan transaction history, and detect security anomalies.
            </p>
            <form onSubmit={handleCustomSubmit}>
              <input
                type="text"
                placeholder="0x..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full bg-slate-900 border border-cyber-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                >
                  Analyze Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
