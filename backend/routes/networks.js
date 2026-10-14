const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const rpcService = require('../services/rpcService');
const { SUPPORTED_NETWORKS } = require('../config/networks');

/**
 * GET /api/networks
 * Fetch supported networks from DB and live RPC health statuses
 */
router.get('/', async (req, res) => {
  try {
    let dbNetworks = [];
    try {
      const result = await query('SELECT * FROM Networks WHERE IsActive = 1 ORDER BY ChainId');
      dbNetworks = result.recordset;
    } catch (err) {
      console.warn('DB query failed, using static fallback networks:', err.message);
    }

    // Ping BSC (56), opBNB (204), ETH (1), Polygon (137) for live latency & block height
    const healthChecks = await Promise.all([
      rpcService.getNetworkHealth(56),
      rpcService.getNetworkHealth(204),
      rpcService.getNetworkHealth(1),
      rpcService.getNetworkHealth(137),
    ]);

    const healthMap = new Map();
    healthChecks.filter(Boolean).forEach(h => healthMap.set(h.chainId, h));

    const enrichedNetworks = (dbNetworks.length > 0 ? dbNetworks : Object.values(SUPPORTED_NETWORKS)).map(net => {
      const chainId = net.ChainId || net.chainId;
      const live = healthMap.get(chainId) || {};
      return {
        chainId,
        name: net.Name || net.name,
        shortName: net.ShortName || net.shortName,
        nativeSymbol: net.NativeSymbol || net.nativeSymbol,
        rpcUrl: net.RpcUrl || (net.rpcUrls && net.rpcUrls[0]),
        explorerUrl: net.ExplorerUrl || net.explorerUrl,
        isTestnet: net.IsTestnet || net.isTestnet || false,
        colorHex: net.ColorHex || net.color,
        iconUrl: net.IconUrl,
        status: live.status || 'ONLINE',
        latencyMs: live.latencyMs !== undefined ? live.latencyMs : 85,
        blockNumber: live.blockNumber || 0,
        gasPriceGwei: live.gasPriceGwei || (chainId === 56 ? 3.0 : chainId === 204 ? 0.00001 : 20.0),
      };
    });

    res.json({
      success: true,
      networks: enrichedNetworks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
