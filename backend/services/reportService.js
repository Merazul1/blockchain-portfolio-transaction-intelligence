const PDFDocument = require('pdfkit');

class ReportService {
  /**
   * Generate CSV format string from transactions
   */
  generateCsv(walletAddress, transactions = []) {
    const headers = [
      'Tx Hash',
      'Chain ID',
      'Block Number',
      'Timestamp (UTC)',
      'From Address',
      'To Address',
      'Method',
      'Value (Native)',
      'Value (USD)',
      'Gas Used',
      'Gas Price (Gwei)',
      'Gas Fee (USD)',
      'Status',
      'Risk Score',
      'Anomaly Flags'
    ];

    const rows = transactions.map((t) => [
      `"${t.TxHash || ''}"`,
      t.ChainId || '',
      t.BlockNumber || '',
      `"${t.Timestamp ? new Date(t.Timestamp).toISOString() : ''}"`,
      `"${t.FromAddress || ''}"`,
      `"${t.ToAddress || ''}"`,
      `"${t.MethodName || 'Transfer'}"`,
      t.ValueEth || 0,
      t.ValueUsd || 0,
      t.GasUsed || 0,
      t.GasPriceGwei || 0,
      t.GasFeeUsd || 0,
      `"${t.Status || 'SUCCESS'}"`,
      t.RiskScore || 0,
      `"${t.AnomalyFlags || 'None'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    return csvContent;
  }

  /**
   * Stream a professional PDF intelligence audit report
   */
  generatePdfReport(walletData, transactions = [], anomalies = [], resStream) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    doc.pipe(resStream);

    // Color palette
    const darkBg = '#0B0E14';
    const goldColor = '#D97706'; // BSC gold-amber
    const greenColor = '#059669'; // opBNB green
    const redColor = '#DC2626';
    const textGray = '#4B5563';

    // Header Title
    doc.fillColor(darkBg)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('BLOCKCHAIN PORTFOLIO & TRANSACTION INTELLIGENCE', { align: 'center' });

    doc.moveDown(0.3);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(textGray)
       .text(`Executive Security Audit & Ledger Report | Generated: ${new Date().toUTCString()}`, { align: 'center' });

    doc.moveDown(1);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Wallet Profile Card
    doc.fillColor('#1F2937')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Wallet Profile & Health Summary');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica');
    doc.fillColor('#111827').text(`Address: `, { continued: true })
       .font('Courier').text(`${walletData.Address || 'N/A'}`);
    
    doc.font('Helvetica').text(`Label: `, { continued: true })
       .font('Helvetica-Bold').text(`${walletData.Label || 'Monitored Crypto Account'}`);

    const safetyScore = walletData.RiskScore !== undefined ? walletData.RiskScore : 15;
    const safetyText = safetyScore > 70 ? 'CRITICAL RISK' : safetyScore > 40 ? 'MODERATE RISK' : 'LOW RISK / HEALTHY';
    const safetyColor = safetyScore > 70 ? redColor : safetyScore > 40 ? goldColor : greenColor;

    doc.font('Helvetica').text(`Security Risk Score: `, { continued: true })
       .fillColor(safetyColor).font('Helvetica-Bold').text(`${safetyScore} / 100 (${safetyText})`);

    doc.fillColor('#111827').font('Helvetica').text(`Calculated Net Worth: `, { continued: true })
       .font('Helvetica-Bold').text(`$${(walletData.CalculatedNetWorthUsd || walletData.TotalUsdValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD`);

    doc.font('Helvetica').text(`Total Transactions Analyzed: `, { continued: true })
       .text(`${transactions.length} total | ${anomalies.length} anomaly flags identified`);

    doc.moveDown(1.2);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Anomalies & Threat Radar Section
    doc.fillColor('#1F2937').fontSize(14).font('Helvetica-Bold').text('Threat Radar & Forensics Log');
    doc.moveDown(0.5);

    if (anomalies.length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor(greenColor).text('✓ No severe security anomalies or gas irregularities detected for this address.');
    } else {
      anomalies.slice(0, 5).forEach((item, index) => {
        const itemColor = item.Severity === 'CRITICAL' ? redColor : item.Severity === 'HIGH' ? redColor : goldColor;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(itemColor)
           .text(`[${item.Severity}] ${item.Title || item.AnomalyType}`);
        doc.fontSize(9.5).font('Helvetica').fillColor('#374151')
           .text(`${item.Description}`);
        if (item.RecommendedAction) {
          doc.fontSize(9).font('Helvetica-Oblique').fillColor(textGray)
             .text(`Recommendation: ${item.RecommendedAction}`);
        }
        doc.moveDown(0.6);
      });
    }

    doc.moveDown(1);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Recent Transactions Ledger
    doc.fillColor('#1F2937').fontSize(14).font('Helvetica-Bold').text('Recent Transaction Ledger (Sample)');
    doc.moveDown(0.5);

    transactions.slice(0, 8).forEach((tx) => {
      const isFailed = tx.Status === 'FAILED' || tx.IsError === 1;
      const statusColor = isFailed ? redColor : greenColor;

      doc.fontSize(9).font('Courier-Bold').fillColor('#1F2937')
         .text(`${(tx.TxHash || '').substring(0, 22)}... `, { continued: true })
         .font('Helvetica-Bold').fillColor(statusColor).text(`[${tx.Status || 'SUCCESS'}] `, { continued: true })
         .font('Helvetica').fillColor('#374151').text(`Chain: ${tx.ChainId} | Method: ${tx.MethodName || 'Transfer'} | Value: $${(tx.ValueUsd || 0).toFixed(2)} | Fee: $${(tx.GasFeeUsd || 0).toFixed(3)}`);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF').text(
      'Report powered by Blockchain Portfolio & Transaction Intelligence Engine. Data sourced from BSC & opBNB RPCs + SQL Server.',
      { align: 'center' }
    );

    doc.end();
  }
}

module.exports = new ReportService();
