/**
 * Forensic & Intelligence Engine
 * Performs automated risk analysis, anomaly detection, and security grading
 */

const BASELINE_GAS_GWEI = {
  56: 3.0,     // BSC standard
  204: 0.00001, // opBNB standard
  1: 20.0,     // Ethereum standard
  137: 35.0,   // Polygon standard
  42161: 0.1,  // Arbitrum standard
};

class IntelligenceService {
  /**
   * Analyze an array of transactions to extract anomalies and forensic findings
   */
  analyzeTransactions(transactions, walletAddress) {
    const anomalies = [];
    let failedCount = 0;
    let gasSpikeCount = 0;
    let unlimitedApprovalCount = 0;
    let largeOutflowCount = 0;
    let totalGasSpentUsd = 0;

    for (const tx of transactions) {
      totalGasSpentUsd += (tx.GasFeeUsd || 0);

      // 1. Detect Failed Transactions
      if (tx.Status === 'FAILED' || tx.IsError === 1) {
        failedCount++;
        anomalies.push({
          txHash: tx.TxHash,
          chainId: tx.ChainId,
          walletAddress: walletAddress || tx.FromAddress,
          anomalyType: 'FAILED_TX',
          severity: 'HIGH',
          title: `Execution Reverted: ${tx.MethodName || 'Transaction'}`,
          description: `Transaction execution failed with code '${tx.ErrCode || 'REVERTED'}'. Gas fee of $${(tx.GasFeeUsd || 0).toFixed(4)} was expended with no state change.`,
          recommendedAction: 'Verify input parameters, increase slippage tolerance, or ensure sufficient liquidity exists in pool before retrying.',
          metricDetails: {
            gasFeeUsd: tx.GasFeeUsd,
            errCode: tx.ErrCode,
            revertReason: tx.RevertReason,
            method: tx.MethodName,
          },
          detectedAt: tx.Timestamp || new Date().toISOString(),
        });
      }

      // 2. Detect Gas Spikes (> 3x network baseline)
      const baseline = BASELINE_GAS_GWEI[tx.ChainId] || 5.0;
      if (tx.GasPriceGwei && tx.GasPriceGwei > (baseline * 3.0)) {
        gasSpikeCount++;
        const multiplier = (tx.GasPriceGwei / baseline).toFixed(1);
        anomalies.push({
          txHash: tx.TxHash,
          chainId: tx.ChainId,
          walletAddress: walletAddress || tx.FromAddress,
          anomalyType: 'GAS_SPIKE',
          severity: tx.GasPriceGwei > (baseline * 10) ? 'HIGH' : 'WARNING',
          title: `Gas Overpayment Anomaly (${multiplier}x Baseline)`,
          description: `Transaction paid ${tx.GasPriceGwei} Gwei, which is ${multiplier}x higher than standard ${baseline} Gwei baseline on Chain ID ${tx.ChainId}. Total fee: $${(tx.GasFeeUsd || 0).toFixed(2)}.`,
          recommendedAction: 'Review gas setting presets in MetaMask or wallet client to avoid overpaying during network congestion.',
          metricDetails: {
            gasPriceGwei: tx.GasPriceGwei,
            baselineGwei: baseline,
            multiplier: parseFloat(multiplier),
            gasFeeUsd: tx.GasFeeUsd,
          },
          detectedAt: tx.Timestamp || new Date().toISOString(),
        });
      }

      // 3. Detect Unlimited Approvals (Security Hazard)
      if (
        tx.MethodName &&
        tx.MethodName.toLowerCase().includes('approve') &&
        (tx.TokenAmount === -1 || (tx.TokenAmount && tx.TokenAmount > 1000000000))
      ) {
        unlimitedApprovalCount++;
        anomalies.push({
          txHash: tx.TxHash,
          chainId: tx.ChainId,
          walletAddress: walletAddress || tx.FromAddress,
          anomalyType: 'UNLIMITED_APPROVAL',
          severity: 'CRITICAL',
          title: `Unlimited Allowance Granted (${tx.TokenTransferred || 'ERC-20'})`,
          description: `Spender contract was granted infinite access to withdraw ${tx.TokenTransferred || 'tokens'}. If this spender protocol is compromised, your balance is vulnerable.`,
          recommendedAction: 'Revoke allowance immediately via Revoke.cash or send an approve transaction with amount 0.',
          metricDetails: {
            token: tx.TokenTransferred,
            spender: tx.ToAddress,
            allowance: 'Unlimited (Max Uint256)',
          },
          detectedAt: tx.Timestamp || new Date().toISOString(),
        });
      }

      // 4. Large Outflow (> $10,000 USD or > 100 BNB/ETH)
      if (
        (tx.ValueUsd && tx.ValueUsd > 10000) ||
        (tx.ValueEth && tx.ValueEth > 100)
      ) {
        largeOutflowCount++;
        anomalies.push({
          txHash: tx.TxHash,
          chainId: tx.ChainId,
          walletAddress: walletAddress || tx.FromAddress,
          anomalyType: 'LARGE_OUTFLOW',
          severity: 'WARNING',
          title: `High-Value Outflow: $${(tx.ValueUsd || 0).toLocaleString()}`,
          description: `Substantial transfer of ${tx.ValueEth || 0} Native / ${tx.TokenAmount || ''} ${tx.TokenTransferred || ''} ($${(tx.ValueUsd || 0).toLocaleString()}) to ${tx.ToAddress}.`,
          recommendedAction: 'Verify that this transaction was intentional and destination address matches known counterparty.',
          metricDetails: {
            valueUsd: tx.ValueUsd,
            valueEth: tx.ValueEth,
            recipient: tx.ToAddress,
          },
          detectedAt: tx.Timestamp || new Date().toISOString(),
        });
      }
    }

    // Calculate Comprehensive Security Risk Score (0 = Safe, 100 = Critical)
    let riskScore = 10; // Baseline healthy score
    if (unlimitedApprovalCount > 0) riskScore += Math.min(unlimitedApprovalCount * 25, 45);
    if (failedCount > 0) riskScore += Math.min(failedCount * 12, 30);
    if (gasSpikeCount > 0) riskScore += Math.min(gasSpikeCount * 8, 20);
    if (largeOutflowCount > 0) riskScore += 5;
    riskScore = Math.min(Math.max(riskScore, 0), 100);

    let safetyRating = 'Low Risk';
    if (riskScore >= 75) safetyRating = 'Critical Risk';
    else if (riskScore >= 50) safetyRating = 'High Risk';
    else if (riskScore >= 25) safetyRating = 'Moderate Risk';

    return {
      riskScore,
      safetyRating,
      stats: {
        totalTx: transactions.length,
        failedCount,
        gasSpikeCount,
        unlimitedApprovalCount,
        largeOutflowCount,
        totalGasSpentUsd: parseFloat(totalGasSpentUsd.toFixed(4)),
      },
      anomalies,
    };
  }

  /**
   * Determine if a newly submitted transaction should trigger any alert rules
   */
  evaluateAlertRules(tx, alertRules = []) {
    const triggeredAlerts = [];

    for (const rule of alertRules) {
      if (!rule.IsActive) continue;
      if (rule.ChainId && rule.ChainId !== tx.ChainId) continue;

      let triggered = false;
      let message = '';
      let severity = 'WARNING';

      switch (rule.AlertType) {
        case 'TX_FAILED':
          if (tx.Status === 'FAILED' || tx.IsError === 1) {
            triggered = true;
            severity = 'HIGH';
            message = `Transaction reverted on Chain ${tx.ChainId}: ${tx.ErrCode || 'Failed execution'}. Fee: $${(tx.GasFeeUsd || 0).toFixed(3)}`;
          }
          break;

        case 'LARGE_TRANSFER':
          if ((tx.ValueUsd || 0) >= (rule.ThresholdValue || 10000)) {
            triggered = true;
            severity = 'WARNING';
            message = `Transfer value $${(tx.ValueUsd || 0).toLocaleString()} exceeded threshold of $${(rule.ThresholdValue || 10000).toLocaleString()}`;
          }
          break;

        case 'GAS_SPIKE':
          if ((tx.GasPriceGwei || 0) >= (rule.ThresholdValue || 20)) {
            triggered = true;
            severity = 'WARNING';
            message = `Gas price of ${tx.GasPriceGwei} Gwei exceeded rule threshold of ${rule.ThresholdValue} Gwei`;
          }
          break;

        case 'RISK_SCORE_HIGH':
          if ((tx.RiskScore || 0) >= (rule.ThresholdValue || 70)) {
            triggered = true;
            severity = 'HIGH';
            message = `Transaction risk score of ${tx.RiskScore}/100 exceeds critical threshold of ${rule.ThresholdValue}`;
          }
          break;

        case 'TOKEN_APPROVAL':
          if (tx.MethodName && tx.MethodName.toLowerCase().includes('approve') && (tx.TokenAmount === -1 || tx.TokenAmount > 10000000)) {
            triggered = true;
            severity = 'CRITICAL';
            message = `Dangerous unlimited ERC-20 token approval detected for contract ${tx.ToAddress}`;
          }
          break;
      }

      if (triggered) {
        triggeredAlerts.push({
          ruleId: rule.RuleId,
          ruleName: rule.RuleName,
          walletAddress: tx.FromAddress,
          chainId: tx.ChainId,
          txHash: tx.TxHash,
          severity,
          title: rule.RuleName,
          message,
        });
      }
    }

    return triggeredAlerts;
  }
}

module.exports = new IntelligenceService();
