const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

/**
 * GET /api/anomalies
 * Fetch detected security anomalies and threat radar items
 */
router.get('/', async (req, res) => {
  const { walletAddress, severity, chainId } = req.query;

  try {
    let sqlText = 'SELECT * FROM TransactionAnomalies WHERE 1=1';
    const params = {};

    if (walletAddress) {
      sqlText += ' AND LOWER(WalletAddress) = LOWER(@addr)';
      params.addr = walletAddress;
    }

    if (severity) {
      sqlText += ' AND Severity = @severity';
      params.severity = severity;
    }

    if (chainId) {
      sqlText += ' AND ChainId = @chainId';
      params.chainId = parseInt(chainId, 10);
    }

    sqlText += ' ORDER BY DetectedAt DESC';

    const result = await query(sqlText, params);

    // Get aggregated statistics
    const statsRes = await query(`
      SELECT 
        COUNT(*) AS TotalAnomalies,
        SUM(CASE WHEN Severity = 'CRITICAL' THEN 1 ELSE 0 END) AS CriticalCount,
        SUM(CASE WHEN Severity = 'HIGH' THEN 1 ELSE 0 END) AS HighCount,
        SUM(CASE WHEN Severity = 'WARNING' THEN 1 ELSE 0 END) AS WarningCount,
        SUM(CASE WHEN AnomalyType = 'FAILED_TX' THEN 1 ELSE 0 END) AS FailedTxCount,
        SUM(CASE WHEN AnomalyType = 'GAS_SPIKE' THEN 1 ELSE 0 END) AS GasSpikeCount,
        SUM(CASE WHEN AnomalyType = 'UNLIMITED_APPROVAL' THEN 1 ELSE 0 END) AS UnlimitedApprovalCount
      FROM TransactionAnomalies
    `);

    res.json({
      success: true,
      anomalies: result.recordset,
      stats: statsRes.recordset[0] || {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
