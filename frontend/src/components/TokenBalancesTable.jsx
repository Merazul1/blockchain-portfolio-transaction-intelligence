import React, { useState } from 'react';
import { Search, ExternalLink, Copy, Check, Filter } from 'lucide-react';

export const TokenBalancesTable = ({ balances = [] }) => {
  const [search, setSearch] = useState('');
  const [selectedChain, setSelectedChain] = useState('ALL');
  const [copiedAddress, setCopiedAddress] = useState(null);

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getExplorerTokenUrl = (chainId, address) => {
    if (address === '0x0000000000000000000000000000000000000000') {
      return chainId === 204 ? 'https://opbnb.bscscan.com' : 'https://bscscan.com';
    }
    if (chainId === 204) return `https://opbnb.bscscan.com/token/${address}`;
    if (chainId === 1) return `https://etherscan.io/token/${address}`;
    return `https://bscscan.com/token/${address}`;
  };

  const filtered = balances.filter(item => {
    const matchesSearch = 
      item.Symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.Name.toLowerCase().includes(search.toLowerCase()) ||
      item.TokenAddress.toLowerCase().includes(search.toLowerCase());

    const matchesChain = selectedChain === 'ALL' || item.ChainId.toString() === selectedChain;
    return matchesSearch && matchesChain;
  });

  return (
    <div className="bg-cyber-card rounded-2xl border border-cyber-border overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Token Asset Holdings</h3>
          <p className="text-xs text-cyber-textMuted mt-0.5">
            Real-time multi-chain balances verified via smart contract state
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Chain Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1.5 rounded-xl border border-cyber-border text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <button
              onClick={() => setSelectedChain('ALL')}
              className={`px-2 py-0.5 rounded-md ${selectedChain === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedChain('56')}
              className={`px-2 py-0.5 rounded-md ${selectedChain === '56' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              BSC
            </button>
            <button
              onClick={() => setSelectedChain('204')}
              className={`px-2 py-0.5 rounded-md ${selectedChain === '204' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              opBNB
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search token or symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-cyber-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/50 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-cyber-border">
            <tr>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4">Network</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4 text-right">Price (USD)</th>
              <th className="py-3 px-4 text-right">24h Change</th>
              <th className="py-3 px-4 text-right">Total Value (USD)</th>
              <th className="py-3 px-4 text-center">Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500">
                  No token holdings found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((token, idx) => {
                const chainName = token.ChainId === 56 ? 'BSC' : token.ChainId === 204 ? 'opBNB' : token.ChainId === 1 ? 'Ethereum' : `Chain ${token.ChainId}`;
                const chainBadgeColor = token.ChainId === 56 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                  : token.ChainId === 204 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30';

                return (
                  <tr key={`${token.ChainId}-${token.TokenAddress}-${idx}`} className="hover:bg-slate-800/40 transition">
                    {/* Asset Name & Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={token.LogoUrl || 'https://cryptologos.cc/logos/bnb-bnb-logo.png'} 
                          alt={token.Symbol}
                          className="w-7 h-7 rounded-full bg-slate-800 p-0.5 object-contain"
                          onError={(e) => {
                            e.target.src = 'https://cryptologos.cc/logos/bnb-bnb-logo.png';
                          }}
                        />
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{token.Symbol}</span>
                            {token.TokenAddress === '0x0000000000000000000000000000000000000000' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                Native
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-cyber-textMuted truncate max-w-[140px]">
                            {token.Name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Network Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${chainBadgeColor}`}>
                        {chainName}
                      </span>
                    </td>

                    {/* Formatted Balance */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200">
                      {parseFloat(token.FormattedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>

                    {/* Price USD */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ${parseFloat(token.UsdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        parseFloat(token.Price24hChange) >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                      }`}>
                        {parseFloat(token.Price24hChange) >= 0 ? '+' : ''}{token.Price24hChange}%
                      </span>
                    </td>

                    {/* Total USD Value */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ${parseFloat(token.UsdValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Explorer Link */}
                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={getExplorerTokenUrl(token.ChainId, token.TokenAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 inline-block transition"
                        title="View token on block explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
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
