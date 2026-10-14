const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const rpcService = require('../services/rpcService');
const priceService = require('../services/priceService');
const intelligenceService = require('../services/intelligenceService');
const { SUPPORTED_NETWORKS } = require('../config/networks');

/**
 * GET /api/wallets
 * List all watched / demo wallets from SQL Server
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        w.WalletId,
        w.Address,
        w.Label,
        w.EnsName,
        w.PrimaryChainId,
        w.RiskScore,
        w.SafetyRating,
        w.IsWatchlist,
        w.TotalUsdValue,
        w.TotalTxCount,
        w.FailedTxCount,
        w.LastSyncedAt,
        ISNULL(SUM(tb.UsdValue), w.TotalUsdValue) AS CalculatedUsdValue
      FROM Wallets w
      LEFT JOIN TokenBalances tb ON w.Address = tb.WalletAddress
      GROUP BY 
        w.WalletId, w.Address, w.Label, w.EnsName, w.PrimaryChainId, 
        w.RiskScore, w.SafetyRating, w.IsWatchlist, w.TotalUsdValue, 
        w.TotalTxCount, w.FailedTxCount, w.LastSyncedAt
      ORDER BY w.WalletId ASC
    `);

    res.json({
      success: true,
      wallets: result.recordset,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wallets/:address
 * Get portfolio metrics, balance summary, and risk score for a single wallet
 */
router.get('/:address', async (req, res) => {
  const address = req.params.address.toLowerCase();

  try {
    // 1. Fetch wallet metadata from DB
    const walletRes = await query('SELECT * FROM Wallets WHERE LOWER(Address) = @addr', { addr: address });
    let wallet = walletRes.recordset[0];

    // If wallet doesn't exist yet in DB, create on-the-fly placeholder so user can query any custom address
    if (!wallet) {
      await query(`
        INSERT INTO Wallets (Address, Label, PrimaryChainId, RiskScore, SafetyRating, IsWatchlist, CreatedAt)
        VALUES (@addr, 'Custom Monitored Wallet', 56, 15, 'Low Risk', 0, SYSUTCDATETIME())
      `, { addr: req.params.address });
      
      const newWalletRes = await query('SELECT * FROM Wallets WHERE LOWER(Address) = @addr', { addr: address });
      wallet = newWalletRes.recordset[0];
    }

    // 2. Fetch all token balances
    const balancesRes = await query('SELECT * FROM TokenBalances WHERE LOWER(WalletAddress) = @addr ORDER BY UsdValue DESC', { addr: address });
    const balances = balancesRes.recordset;

    // 3. Fetch transaction count & anomalies count
    const statsRes = await query(`
      SELECT 
        COUNT(*) AS TotalTransactions,
        SUM(CASE WHEN Status = 'FAILED' OR IsError = 1 THEN 1 ELSE 0 END) AS FailedTransactions,
        ISNULL(SUM(GasFeeUsd), 0) AS TotalGasSpentUsd,
        ISNULL(SUM(ValueUsd), 0) AS TotalVolumeUsd
      FROM Transactions
      WHERE LOWER(FromAddress) = @addr OR LOWER(ToAddress) = @addr
    `, { addr: address });

    const txStats = statsRes.recordset[0] || {};

    const calculatedNetWorth = balances.reduce((sum, b) => sum + (parseFloat(b.UsdValue) || 0), 0);

    res.json({
      success: true,
      wallet: {
        ...wallet,
        CalculatedNetWorthUsd: calculatedNetWorth > 0 ? calculatedNetWorth : wallet.TotalUsdValue,
        TotalTxCount: txStats.TotalTransactions || wallet.TotalTxCount,
        FailedTxCount: txStats.FailedTransactions || wallet.FailedTxCount,
        TotalGasSpentUsd: txStats.TotalGasSpentUsd || 0,
        TotalVolumeUsd: txStats.TotalVolumeUsd || 0,
        BalancesCount: balances.length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wallets/:address/balances
 * Fetch detailed token balances with chain breakdown and USD values
 */
router.get('/:address/balances', async (req, res) => {
  const address = req.params.address.toLowerCase();
  const chainId = req.query.chainId ? parseInt(req.query.chainId, 10) : null;

  try {
    let sqlText = 'SELECT * FROM TokenBalances WHERE LOWER(WalletAddress) = @addr';
    const params = { addr: address };

    if (chainId) {
      sqlText += ' AND ChainId = @chainId';
      params.chainId = chainId;
    }

    sqlText += ' ORDER BY UsdValue DESC';

    const result = await query(sqlText, params);
    let balances = result.recordset;

    // If no balances found in DB for this address, attempt live on-the-fly fetch for BSC and opBNB
    if (balances.length === 0) {
      const livePrices = await priceService.getLivePrices();
      const bscBalance = await rpcService.getNativeBalance(56, req.params.address);
      const opBnbBalance = await rpcService.getNativeBalance(204, req.params.address);

      balances = [
        {
          BalanceId: 9901,
          WalletAddress: req.params.address,
          ChainId: 56,
          TokenAddress: '0x0000000000000000000000000000000000000000',
          Symbol: 'BNB',
          Name: 'BNB Smart Chain Native',
          Decimals: 18,
          RawBalance: bscBalance.raw,
          FormattedBalance: bscBalance.formatted,
          UsdPrice: livePrices.BNB,
          UsdValue: bscBalance.formatted * livePrices.BNB,
          Price24hChange: 2.15,
          LogoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
        },
        {
          BalanceId: 9902,
          WalletAddress: req.params.address,
          ChainId: 204,
          TokenAddress: '0x0000000000000000000000000000000000000000',
          Symbol: 'BNB',
          Name: 'opBNB Native Asset',
          Decimals: 18,
          RawBalance: opBnbBalance.raw,
          FormattedBalance: opBnbBalance.formatted,
          UsdPrice: livePrices.BNB,
          UsdValue: opBnbBalance.formatted * livePrices.BNB,
          Price24hChange: 2.15,
          LogoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
        }
      ];
    }

    res.json({
      success: true,
      balances,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/wallets/sync
 * Trigger on-chain RPC synchronization for address
 */
router.post('/sync', async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ success: false, error: 'Address is required' });
  }

  try {
    const livePrices = await priceService.getLivePrices();
    const chainsToSync = [56, 204]; // BSC & opBNB

    let totalUsdValue = 0;

    for (const chainId of chainsToSync) {
      // 1. Native balance
      const native = await rpcService.getNativeBalance(chainId, address);
      const symbol = chainId === 1 ? 'ETH' : 'BNB';
      const price = livePrices[symbol] || 580;
      const usdVal = native.formatted * price;
      totalUsdValue += usdVal;

      await query(`
        MERGE INTO TokenBalances AS Target
        USING (VALUES (@wallet, @chainId, '0x0000000000000000000000000000000000000000', @symbol, @name, 18, @raw, @formatted, @price, @usdVal, 0.0, @logo))
        AS Source (WalletAddress, ChainId, TokenAddress, Symbol, Name, Decimals, RawBalance, FormattedBalance, UsdPrice, UsdValue, Price24hChange, LogoUrl)
        ON Target.WalletAddress = Source.WalletAddress AND Target.ChainId = Source.ChainId AND Target.TokenAddress = Source.TokenAddress
        WHEN MATCHED THEN
          UPDATE SET RawBalance = Source.RawBalance, FormattedBalance = Source.FormattedBalance, UsdPrice = Source.UsdPrice, UsdValue = Source.UsdValue, LastUpdatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (WalletAddress, ChainId, TokenAddress, Symbol, Name, Decimals, RawBalance, FormattedBalance, UsdPrice, UsdValue, Price24hChange, LogoUrl, LastUpdatedAt)
          VALUES (Source.WalletAddress, Source.ChainId, Source.TokenAddress, Source.Symbol, Source.Name, Source.Decimals, Source.RawBalance, Source.FormattedBalance, Source.UsdPrice, Source.UsdValue, Source.Price24hChange, Source.LogoUrl, SYSUTCDATETIME());
      `, {
        wallet: address,
        chainId,
        symbol,
        name: chainId === 204 ? 'opBNB Gas Asset' : 'BNB Native Coin',
        raw: native.raw,
        formatted: native.formatted,
        price,
        usdVal,
        logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
      });

      // 2. Fetch tokens on chain
      const tokenBalances = await rpcService.getTokenBalances(chainId, address);
      for (const tb of tokenBalances) {
        const tokenPrice = livePrices[tb.symbol] || 1.0;
        const tokenUsd = tb.formattedBalance * tokenPrice;
        totalUsdValue += tokenUsd;

        await query(`
          MERGE INTO TokenBalances AS Target
          USING (VALUES (@wallet, @chainId, @tokenAddr, @symbol, @name, @decimals, @raw, @formatted, @price, @usdVal, 0.0, @logo))
          AS Source (WalletAddress, ChainId, TokenAddress, Symbol, Name, Decimals, RawBalance, FormattedBalance, UsdPrice, UsdValue, Price24hChange, LogoUrl)
          ON Target.WalletAddress = Source.WalletAddress AND Target.ChainId = Source.ChainId AND Target.TokenAddress = Source.TokenAddress
          WHEN MATCHED THEN
            UPDATE SET RawBalance = Source.RawBalance, FormattedBalance = Source.FormattedBalance, UsdPrice = Source.UsdPrice, UsdValue = Source.UsdValue, LastUpdatedAt = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN
            INSERT (WalletAddress, ChainId, TokenAddress, Symbol, Name, Decimals, RawBalance, FormattedBalance, UsdPrice, UsdValue, Price24hChange, LogoUrl, LastUpdatedAt)
            VALUES (Source.WalletAddress, Source.ChainId, Source.TokenAddress, Source.Symbol, Source.Name, Source.Decimals, Source.RawBalance, Source.FormattedBalance, Source.UsdPrice, Source.UsdValue, Source.Price24hChange, Source.LogoUrl, SYSUTCDATETIME());
        `, {
          wallet: address,
          chainId,
          tokenAddr: tb.tokenAddress,
          symbol: tb.symbol,
          name: tb.name,
          decimals: tb.decimals,
          raw: tb.rawBalance,
          formatted: tb.formattedBalance,
          price: tokenPrice,
          usdVal: tokenUsd,
          logo: tb.logoUrl
        });
      }
    }

    // Update wallet master record
    await query(`
      UPDATE Wallets 
      SET TotalUsdValue = @totalVal, LastSyncedAt = SYSUTCDATETIME()
      WHERE LOWER(Address) = LOWER(@wallet)
    `, {
      wallet: address,
      totalVal: totalUsdValue
    });

    res.json({
      success: true,
      message: 'On-chain balances synchronized successfully',
      syncedChains: chainsToSync,
      totalUsdValue,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
