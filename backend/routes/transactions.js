const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const intelligenceService = require('../services/intelligenceService');

/**
 * GET /api/transactions
 * Retrieve transactions with rich filtering
 */
router.get('/', async (req, res) => {
  const { address, chainId, status, isError, limit = 50 } = req.query;

  try {
    let sqlText = 'SELECT TOP (@limit) * FROM Transactions WHERE 1=1';
    const params = { limit: parseInt(limit, 10) || 50 };

    if (address) {
      sqlText += ' AND (LOWER(FromAddress) = LOWER(@addr) OR LOWER(ToAddress) = LOWER(@addr))';
      params.addr = address;
    }

    if (chainId) {
      sqlText += ' AND ChainId = @chainId';
      params.chainId = parseInt(chainId, 10);
    }

    if (status) {
      sqlText += ' AND Status = @status';
      params.status = status;
    }

    if (isError !== undefined) {
      sqlText += ' AND IsError = @isError';
      params.isError = isError === 'true' || isError === '1' ? 1 : 0;
    }

    sqlText += ' ORDER BY Timestamp DESC';

    const result = await query(sqlText, params);

    res.json({
      success: true,
      count: result.recordset.length,
      transactions: result.recordset,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/transactions/:hash
 * Single transaction forensic inspection
 */
router.get('/:hash', async (req, res) => {
  const hash = req.params.hash;

  try {
    const txRes = await query('SELECT * FROM Transactions WHERE LOWER(TxHash) = LOWER(@hash)', { hash });
    if (txRes.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const tx = txRes.recordset[0];

    // Fetch related anomaly records
    const anomalyRes = await query('SELECT * FROM TransactionAnomalies WHERE LOWER(TxHash) = LOWER(@hash)', { hash });

    res.json({
      success: true,
      transaction: tx,
      anomalies: anomalyRes.recordset,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
