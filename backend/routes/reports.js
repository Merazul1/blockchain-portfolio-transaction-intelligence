const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const reportService = require('../services/reportService');

/**
 * GET /api/reports/export
 * Download CSV ledger or PDF intelligence audit report
 */
router.get('/export', async (req, res) => {
  const { walletAddress, format = 'csv', chainId } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ success: false, error: 'walletAddress query parameter is required' });
  }

  try {
    // 1. Fetch wallet data
    const walletRes = await query('SELECT * FROM Wallets WHERE LOWER(Address) = LOWER(@addr)', { addr: walletAddress });
    const wallet = walletRes.recordset[0] || { Address: walletAddress, Label: 'Portfolio Monitored Wallet', RiskScore: 18 };

    // 2. Fetch transactions
    let txSql = 'SELECT * FROM Transactions WHERE (LOWER(FromAddress) = LOWER(@addr) OR LOWER(ToAddress) = LOWER(@addr))';
    const txParams = { addr: walletAddress };
    if (chainId) {
      txSql += ' AND ChainId = @chainId';
      txParams.chainId = parseInt(chainId, 10);
    }
    txSql += ' ORDER BY Timestamp DESC';
    const txRes = await query(txSql, txParams);
    const transactions = txRes.recordset;

    // 3. Fetch anomalies
    const anomalyRes = await query('SELECT * FROM TransactionAnomalies WHERE LOWER(WalletAddress) = LOWER(@addr) ORDER BY DetectedAt DESC', { addr: walletAddress });
    const anomalies = anomalyRes.recordset;

    // 4. Handle Format
    if (format.toLowerCase() === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Blockchain_Intelligence_Audit_${walletAddress.substring(0, 8)}.pdf"`);
      return reportService.generatePdfReport(wallet, transactions, anomalies, res);
    }

    if (format.toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="Blockchain_Ledger_${walletAddress.substring(0, 8)}.json"`);
      return res.json({
        exportDate: new Date().toISOString(),
        wallet,
        transactionCount: transactions.length,
        transactions,
        anomalies,
      });
    }

    // Default: CSV
    const csvData = reportService.generateCsv(walletAddress, transactions);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Blockchain_Transactions_${walletAddress.substring(0, 8)}.csv"`);
    return res.send(csvData);

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reports/history
 * List generated audit reports stored in DB
 */
router.get('/history', async (req, res) => {
  try {
    const result = await query('SELECT * FROM AuditReports ORDER BY GeneratedAt DESC');
    res.json({
      success: true,
      reports: result.recordset,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
