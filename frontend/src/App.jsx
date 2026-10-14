import React, { useState, useEffect } from 'react';
import { useWeb3 } from './context/Web3Context';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { NetworkStatusBar } from './components/NetworkStatusBar';
import { PortfolioOverview } from './components/PortfolioOverview';
import { TokenBalancesTable } from './components/TokenBalancesTable';
import { TransactionHistoryTable } from './components/TransactionHistoryTable';
import { AnomalyRadar } from './components/AnomalyRadar';
import { AlertsManager } from './components/AlertsManager';
import { ReportsModal } from './components/ReportsModal';
import { TxDetailModal } from './components/TxDetailModal';
import { 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  Layers, 
  ExternalLink,
  Cpu,
  RefreshCw
} from 'lucide-react';

export function App() {
  const { activeAddress } = useWeb3();

  // Tab State: 'OVERVIEW' | 'TRANSACTIONS' | 'ANOMALIES' | 'NETWORKS'
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Backend Data
  const [walletData, setWalletData] = useState({});
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [anomalyStats, setAnomalyStats] = useState({});
  const [networks, setNetworks] = useState([]);
  const [dbHealth, setDbHealth] = useState({});
  const [cacheStatus, setCacheStatus] = useState({});
  const [rules, setRules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // UI Modals
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load infrastructure & networks on mount
  useEffect(() => {
    async function loadSystemHealth() {
      try {
        const healthRes = await api.getHealth();
        setDbHealth(healthRes.sqlServer || {});
        setCacheStatus(healthRes.cache || {});

        const netRes = await api.getNetworks();
        if (netRes.networks) setNetworks(netRes.networks);
      } catch (err) {
        console.warn('Health fetch error:', err);
      }
    }
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load wallet portfolio & intelligence data whenever activeAddress changes
  useEffect(() => {
    if (!activeAddress) return;
    loadWalletData(activeAddress);
  }, [activeAddress]);

  const loadWalletData = async (address) => {
    setIsLoading(true);
    try {
      // 1. Wallet Profile
      const walletRes = await api.getWallet(address);
      if (walletRes.wallet) setWalletData(walletRes.wallet);

      // 2. Balances
      const balanceRes = await api.getBalances(address);
      if (balanceRes.balances) setBalances(balanceRes.balances);

      // 3. Transactions
      const txRes = await api.getTransactions({ address, limit: 100 });
      if (txRes.transactions) setTransactions(txRes.transactions);

      // 4. Anomalies
      const anomalyRes = await api.getAnomalies({ walletAddress: address });
      if (anomalyRes.anomalies) setAnomalies(anomalyRes.anomalies);
      if (anomalyRes.stats) setAnomalyStats(anomalyRes.stats);

      // 5. Alerts & Notifications
      const rulesRes = await api.getAlertRules();
      if (rulesRes.rules) setRules(rulesRes.rules);

      const notifRes = await api.getNotifications({ walletAddress: address });
      if (notifRes.notifications) setNotifications(notifRes.notifications);
      if (notifRes.unreadCount !== undefined) setUnreadCount(notifRes.unreadCount);

    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncOnChain = async () => {
    if (!activeAddress || isSyncing) return;
    setIsSyncing(true);
    try {
      await api.syncWallet(activeAddress);
      await loadWalletData(activeAddress);
    } catch (err) {
      console.error('On-chain sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateRule = async (ruleData) => {
    try {
      await api.createAlertRule({ ...ruleData, walletAddress: activeAddress });
      const rulesRes = await api.getAlertRules();
      if (rulesRes.rules) setRules(rulesRes.rules);
    } catch (err) {
      console.error('Create rule error:', err);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.deleteAlertRule(ruleId);
      setRules(prev => prev.filter(r => r.RuleId !== ruleId));
    } catch (err) {
      console.error('Delete rule error:', err);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.NotificationId === id ? { ...n, IsRead: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleSelectTxByHash = async (hash) => {
    try {
      const res = await api.getTransaction(hash);
      if (res.transaction) {
        setSelectedTx(res.transaction);
      }
    } catch (err) {
      console.error('Fetch tx error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar 
        onOpenReports={() => setShowReportsModal(true)} 
        onOpenAlerts={() => setShowAlertsModal(true)}
        unreadAlertsCount={unreadCount}
      />

      {/* Network & Infrastructure Status Bar */}
      <NetworkStatusBar 
        networks={networks} 
        dbHealth={dbHealth} 
        cacheStatus={cacheStatus} 
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-cyber-border bg-cyber-card/60 rounded-xl p-1 max-w-fit">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-glow-bsc'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Portfolio & Holdings</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow-opbnb'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transactions ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ANOMALIES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'ANOMALIES'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Threat Radar ({anomalies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('NETWORKS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'NETWORKS'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Supported Networks</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <PortfolioOverview 
              wallet={walletData} 
              balances={balances} 
              onSync={handleSyncOnChain}
              isSyncing={isSyncing}
            />
            <TokenBalancesTable balances={balances} />
          </div>
        )}

        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-6">
            <TransactionHistoryTable 
              transactions={transactions} 
              onSelectTx={(tx) => setSelectedTx(tx)} 
            />
          </div>
        )}

        {activeTab === 'ANOMALIES' && (
          <div className="space-y-6">
            <AnomalyRadar 
              anomalies={anomalies} 
              stats={anomalyStats}
              onSelectTxHash={handleSelectTxByHash}
            />
          </div>
        )}

        {activeTab === 'NETWORKS' && (
          <div className="bg-cyber-card rounded-2xl border border-cyber-border p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>Multi-Chain RPC Registry</span>
              </h3>
              <p className="text-xs text-cyber-textMuted mt-1">
                Active blockchain RPC connections powering real-time balance queries and transaction telemetry
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {networks.map((net) => (
                <div key={net.chainId} className="bg-slate-900/70 p-4 rounded-xl border border-cyber-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{net.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      net.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300'
                    }`}>
                      {net.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chain ID:</span>
                      <span>{net.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Native Coin:</span>
                      <span>{net.nativeSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gas Price:</span>
                      <span className="text-amber-400">{net.gasPriceGwei} Gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Block Height:</span>
                      <span>#{net.blockNumber > 0 ? net.blockNumber.toLocaleString() : 'Live'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyber-border/60">
                    <a
                      href={net.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                    >
                      <span>Explore on {net.shortName}Scan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {showReportsModal && (
        <ReportsModal 
          wallet={walletData} 
          transactions={transactions} 
          anomalies={anomalies}
          onClose={() => setShowReportsModal(false)} 
        />
      )}

      {showAlertsModal && (
        <AlertsManager 
          rules={rules} 
          notifications={notifications}
          unreadCount={unreadCount}
          onCreateRule={handleCreateRule}
          onDeleteRule={handleDeleteRule}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClose={() => setShowAlertsModal(false)}
        />
      )}

      {selectedTx && (
        <TxDetailModal 
          tx={selectedTx} 
          onClose={() => setSelectedTx(null)} 
        />
      )}

      {/* Footer */}
      <footer className="border-t border-cyber-border py-4 text-center text-xs text-slate-500 bg-[#0B0E14]">
        Blockchain Portfolio & Transaction Intelligence Engine • Powered by BSC, opBNB, Ethers.js, SQL Server 2025 & Redis
      </footer>
    </div>
  );
}

export default App;
