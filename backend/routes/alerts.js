const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

/**
 * GET /api/alerts/rules
 * Get configured alert rules
 */
router.get('/rules', async (req, res) => {
  try {
    const result = await query('SELECT * FROM AlertRules ORDER BY RuleId DESC');
    res.json({
      success: true,
      rules: result.recordset,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/alerts/rules
 * Create new alert rule
 */
router.post('/rules', async (req, res) => {
  const { ruleName, alertType, thresholdValue, comparisonOperator = '>=', chainId, walletAddress } = req.body;

  if (!ruleName || !alertType) {
    return res.status(400).json({ success: false, error: 'ruleName and alertType are required' });
  }

  try {
    const result = await query(`
      INSERT INTO AlertRules (RuleName, AlertType, ThresholdValue, ComparisonOperator, ChainId, WalletAddress, IsActive, NotifyOnDashboard, CreatedAt)
      OUTPUT INSERTED.*
      VALUES (@name, @type, @val, @op, @chain, @wallet, 1, 1, SYSUTCDATETIME())
    `, {
      name: ruleName,
      type: alertType,
      val: thresholdValue !== undefined && thresholdValue !== null ? parseFloat(thresholdValue) : null,
      op: comparisonOperator,
      chain: chainId ? parseInt(chainId, 10) : null,
      wallet: walletAddress || null,
    });

    res.json({
      success: true,
      rule: result.recordset[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/alerts/rules/:id
 * Delete alert rule
 */
router.delete('/rules/:id', async (req, res) => {
  const ruleId = parseInt(req.params.id, 10);

  try {
    await query('DELETE FROM AlertRules WHERE RuleId = @id', { id: ruleId });
    res.json({ success: true, message: 'Alert rule deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/alerts/notifications
 * Fetch triggered alert feed
 */
router.get('/notifications', async (req, res) => {
  const { walletAddress, unreadOnly } = req.query;

  try {
    let sqlText = 'SELECT * FROM AlertNotifications WHERE 1=1';
    const params = {};

    if (walletAddress) {
      sqlText += ' AND LOWER(WalletAddress) = LOWER(@addr)';
      params.addr = walletAddress;
    }

    if (unreadOnly === 'true' || unreadOnly === '1') {
      sqlText += ' AND IsRead = 0';
    }

    sqlText += ' ORDER BY CreatedAt DESC';

    const result = await query(sqlText, params);

    // Unread count
    const unreadCountRes = await query('SELECT COUNT(*) AS UnreadCount FROM AlertNotifications WHERE IsRead = 0');
    const unreadCount = unreadCountRes.recordset[0]?.UnreadCount || 0;

    res.json({
      success: true,
      unreadCount,
      notifications: result.recordset,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/alerts/notifications/:id/read
 * Mark notification as read
 */
router.post('/notifications/:id/read', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await query('UPDATE AlertNotifications SET IsRead = 1 WHERE NotificationId = @id', { id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/alerts/notifications/read-all
 * Mark all notifications as read
 */
router.post('/notifications/read-all', async (req, res) => {
  try {
    await query('UPDATE AlertNotifications SET IsRead = 1');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
