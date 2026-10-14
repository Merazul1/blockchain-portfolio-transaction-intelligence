import React from 'react';
import { Database, Server, Cpu, Zap } from 'lucide-react';

export const NetworkStatusBar = ({ networks = [], dbHealth = {}, cacheStatus = {} }) => {
  return (
    <div className="bg-cyber-card/70 border-b border-cyber-border py-2 px-4 text-[11px] overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-max">
        {/* Left: Chain Telemetry */}
        <div className="flex items-center space-x-4">
          <span className="text-cyber-textMuted font-medium flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>RPC Telemetry:</span>
          </span>

          {networks.filter(n => !n.isTestnet).map((net) => (
            <div key={net.chainId} className="flex items-center space-x-1.5 bg-slate-900/60 px-2 py-0.5 rounded-md border border-cyber-border">
              <span 
                className={`w-1.5 h-1.5 rounded-full ${
                  net.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="font-semibold text-slate-200">{net.shortName}</span>
              <span className="text-slate-400 font-mono">
                {net.blockNumber > 0 ? `#${net.blockNumber.toLocaleString()}` : `${net.latencyMs}ms`}
              </span>
              <span className="text-amber-400 font-mono text-[10px]">
                {net.gasPriceGwei} Gwei
              </span>
            </div>
          ))}
        </div>

        {/* Right: Infrastructure Status (SQL Server & Redis Cache) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-900/60 px-2 py-0.5 rounded-md border border-cyber-border">
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-300">SQL Server 2025:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {dbHealth?.connected ? 'Online (Connected)' : 'Connected'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900/60 px-2 py-0.5 rounded-md border border-cyber-border">
            <Server className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300">Cache Layer:</span>
            <span className="text-cyan-400 font-mono">
              {cacheStatus?.engine || 'TTL Cache Engine'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
