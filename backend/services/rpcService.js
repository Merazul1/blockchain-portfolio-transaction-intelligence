const { ethers } = require('ethers');
const { SUPPORTED_NETWORKS, ERC20_ABI } = require('../config/networks');
const cacheService = require('./cacheService');

class RpcService {
  constructor() {
    this.providers = new Map(); // chainId -> ethers.JsonRpcProvider
    this.initProviders();
  }

  initProviders() {
    for (const [chainId, config] of Object.entries(SUPPORTED_NETWORKS)) {
      const primaryUrl = config.rpcUrls[0];
      try {
        const provider = new ethers.JsonRpcProvider(primaryUrl, {
          chainId: Number(chainId),
          name: config.shortName,
        }, { staticNetwork: true });
        this.providers.set(Number(chainId), provider);
      } catch (err) {
        console.error(`Failed to initialize provider for chain ${chainId}:`, err.message);
      }
    }
  }

  getProvider(chainId) {
    const id = Number(chainId);
    let provider = this.providers.get(id);
    if (!provider && SUPPORTED_NETWORKS[id]) {
      const primaryUrl = SUPPORTED_NETWORKS[id].rpcUrls[0];
      provider = new ethers.JsonRpcProvider(primaryUrl, {
        chainId: id,
        name: SUPPORTED_NETWORKS[id].shortName,
      }, { staticNetwork: true });
      this.providers.set(id, provider);
    }
    return provider;
  }

  /**
   * Ping network to get latency and latest block
   */
  async getNetworkHealth(chainId) {
    const config = SUPPORTED_NETWORKS[chainId];
    if (!config) return null;

    const cacheKey = `rpc:health:${chainId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const provider = this.getProvider(chainId);
    const start = Date.now();
    try {
      const blockNumber = await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 4000))
      ]);
      const latencyMs = Date.now() - start;
      const feeData = await provider.getFeeData().catch(() => null);

      const gasPriceGwei = feeData && feeData.gasPrice 
        ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) 
        : (chainId === 56 ? 3.0 : chainId === 204 ? 0.00001 : 20.0);

      const result = {
        chainId: Number(chainId),
        name: config.name,
        shortName: config.shortName,
        nativeSymbol: config.nativeSymbol,
        status: 'ONLINE',
        latencyMs,
        blockNumber,
        gasPriceGwei: parseFloat(gasPriceGwei.toFixed(4)),
        explorerUrl: config.explorerUrl,
      };

      await cacheService.set(cacheKey, result, 15); // cache 15s
      return result;
    } catch (err) {
      return {
        chainId: Number(chainId),
        name: config.name,
        shortName: config.shortName,
        nativeSymbol: config.nativeSymbol,
        status: 'DEGRADED',
        latencyMs: 999,
        blockNumber: 0,
        gasPriceGwei: (chainId === 56 ? 3.0 : chainId === 204 ? 0.00001 : 20.0),
        error: err.message,
      };
    }
  }

  /**
   * Fetch native balance for wallet address on specific chain
   */
  async getNativeBalance(chainId, address) {
    const id = Number(chainId);
    const provider = this.getProvider(id);
    if (!provider) return { balance: '0', formatted: 0 };

    const cacheKey = `balance:native:${id}:${address.toLowerCase()}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const balanceWei = await Promise.race([
        provider.getBalance(address),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
      ]);
      const formatted = parseFloat(ethers.formatEther(balanceWei));
      const result = {
        raw: balanceWei.toString(),
        formatted,
      };
      await cacheService.set(cacheKey, result, 30);
      return result;
    } catch (err) {
      console.warn(`Failed to fetch native balance on chain ${chainId}:`, err.message);
      return { raw: '0', formatted: 0 };
    }
  }

  /**
   * Fetch ERC20 token balances for standard tokens on chain
   */
  async getTokenBalances(chainId, address) {
    const id = Number(chainId);
    const config = SUPPORTED_NETWORKS[id];
    if (!config || !config.tokens || config.tokens.length === 0) {
      return [];
    }

    const provider = this.getProvider(id);
    if (!provider) return [];

    const cacheKey = `balance:tokens:${id}:${address.toLowerCase()}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const tokenBalances = [];

    for (const token of config.tokens) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const raw = await Promise.race([
          contract.balanceOf(address),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        const formatted = parseFloat(ethers.formatUnits(raw, token.decimals));

        tokenBalances.push({
          tokenAddress: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          rawBalance: raw.toString(),
          formattedBalance: formatted,
          logoUrl: token.logo,
        });
      } catch (err) {
        // Token contract might not exist on custom local dev or address empty
        tokenBalances.push({
          tokenAddress: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          rawBalance: '0',
          formattedBalance: 0,
          logoUrl: token.logo,
        });
      }
    }

    await cacheService.set(cacheKey, tokenBalances, 45);
    return tokenBalances;
  }
}

module.exports = new RpcService();
