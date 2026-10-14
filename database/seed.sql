-- =====================================================================
-- Seed Data for Blockchain Intelligence Database
-- Populates Networks, Default Alert Rules, and Demo Wallet Intel
-- =====================================================================

USE BlockchainIntelligenceDB;
GO

-- 1. Insert Supported Networks
MERGE INTO dbo.Networks AS Target
USING (VALUES
    (56, 'BNB Smart Chain (BSC)', 'BSC', 'BNB', 'https://binance.llamarpc.com', 'https://bsc-dataseed.binance.org', 'https://bscscan.com', 'https://api.bscscan.com/api', 1, 0, '#F3BA2F', 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
    (204, 'opBNB Mainnet', 'opBNB', 'BNB', 'https://opbnb-mainnet-rpc.bnbchain.org', 'https://opbnb.blockpi.network/v1/rpc/public', 'https://opbnb.bscscan.com', 'https://api-opbnb.bscscan.com/api', 1, 0, '#00E676', 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
    (1, 'Ethereum Mainnet', 'Ethereum', 'ETH', 'https://eth.llamarpc.com', 'https://cloudflare-eth.com', 'https://etherscan.io', 'https://api.etherscan.io/api', 1, 0, '#627EEA', 'https://cryptologos.cc/logos/ethereum-eth-logo.png'),
    (137, 'Polygon Mainnet', 'Polygon', 'POL', 'https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com', 'https://polygonscan.com', 'https://api.polygonscan.com/api', 1, 0, '#8247E5', 'https://cryptologos.cc/logos/polygon-matic-logo.png'),
    (42161, 'Arbitrum One', 'Arbitrum', 'ETH', 'https://arb1.arbitrum.io/rpc', 'https://arbitrum.llamarpc.com', 'https://arbiscan.io', 'https://api.arbiscan.io/api', 1, 0, '#28A0F0', 'https://cryptologos.cc/logos/arbitrum-arb-logo.png'),
    (97, 'BSC Testnet', 'BSC Testnet', 'tBNB', 'https://data-seed-prebsc-1-s1.binance.org:8545', NULL, 'https://testnet.bscscan.com', NULL, 1, 1, '#F3BA2F', 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
    (5611, 'opBNB Testnet', 'opBNB Testnet', 'tBNB', 'https://opbnb-testnet-rpc.bnbchain.org', NULL, 'https://opbnb-testnet.bscscan.com', NULL, 1, 1, '#00E676', 'https://cryptologos.cc/logos/bnb-bnb-logo.png')
) AS Source (ChainId, Name, ShortName, NativeSymbol, RpcUrl, FallbackRpcUrl, ExplorerUrl, ExplorerApiUrl, IsActive, IsTestnet, ColorHex, IconUrl)
ON Target.ChainId = Source.ChainId
WHEN MATCHED THEN
    UPDATE SET 
        Name = Source.Name,
        ShortName = Source.ShortName,
        NativeSymbol = Source.NativeSymbol,
        RpcUrl = Source.RpcUrl,
        FallbackRpcUrl = Source.FallbackRpcUrl,
        ExplorerUrl = Source.ExplorerUrl,
        ExplorerApiUrl = Source.ExplorerApiUrl,
        IsActive = Source.IsActive,
        IsTestnet = Source.IsTestnet,
        ColorHex = Source.ColorHex,
        IconUrl = Source.IconUrl
WHEN NOT MATCHED THEN
    INSERT (ChainId, Name, ShortName, NativeSymbol, RpcUrl, FallbackRpcUrl, ExplorerUrl, ExplorerApiUrl, IsActive, IsTestnet, ColorHex, IconUrl)
    VALUES (Source.ChainId, Source.Name, Source.ShortName, Source.NativeSymbol, Source.RpcUrl, Source.FallbackRpcUrl, Source.ExplorerUrl, Source.ExplorerApiUrl, Source.IsActive, Source.IsTestnet, Source.ColorHex, Source.IconUrl);

-- 2. Demo & Tracked Wallets
DECLARE @DemoWallet NVARCHAR(66) = '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3';
DECLARE @TraderWallet NVARCHAR(66) = '0x534631Bcf33BDb069fB20A75d2791C861145b238';

IF NOT EXISTS (SELECT 1 FROM dbo.Wallets WHERE Address = @DemoWallet)
BEGIN
    INSERT INTO dbo.Wallets (Address, Label, EnsName, PrimaryChainId, RiskScore, SafetyRating, IsWatchlist, TotalUsdValue, TotalTxCount, FailedTxCount, LastSyncedAt)
    VALUES (@DemoWallet, 'Binance Hot Vault & opBNB Bridge', 'binance-vault.eth', 56, 18, 'Low Risk', 1, 384590.50, 42, 3, SYSUTCDATETIME());
END

IF NOT EXISTS (SELECT 1 FROM dbo.Wallets WHERE Address = @TraderWallet)
BEGIN
    INSERT INTO dbo.Wallets (Address, Label, EnsName, PrimaryChainId, RiskScore, SafetyRating, IsWatchlist, TotalUsdValue, TotalTxCount, FailedTxCount, LastSyncedAt)
    VALUES (@TraderWallet, 'DeFi Arbitrage & Yield Trader', 'defi-alpha.eth', 204, 62, 'Moderate Risk', 1, 89450.25, 68, 8, SYSUTCDATETIME());
END

-- 3. Token Balances for Demo Wallet
DELETE FROM dbo.TokenBalances WHERE WalletAddress IN (@DemoWallet, @TraderWallet);

INSERT INTO dbo.TokenBalances (WalletAddress, ChainId, TokenAddress, Symbol, Name, Decimals, RawBalance, FormattedBalance, UsdPrice, UsdValue, Price24hChange, LogoUrl)
VALUES 
-- Demo Wallet on BSC
(@DemoWallet, 56, '0x0000000000000000000000000000000000000000', 'BNB', 'BNB Native', 18, '245500000000000000000', 245.50000000, 582.40, 142979.20, 2.45, 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
(@DemoWallet, 56, '0x55d398326f99059fF775485246999027B3197955', 'USDT', 'Tether USD (BSC-USD)', 18, '115420000000000000000000', 115420.00000000, 1.00, 115420.00, 0.01, 'https://cryptologos.cc/logos/tether-usdt-logo.png'),
(@DemoWallet, 56, '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', 'CAKE', 'PancakeSwap Token', 18, '12400000000000000000000', 12400.00000000, 2.74, 33976.00, -1.82, 'https://cryptologos.cc/logos/pancakeswap-cake-logo.png'),
(@DemoWallet, 56, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 'BTCB', 'Binance-Peg BTCB', 18, '0.850000000000000000', 0.85000000, 64200.00, 54570.00, 3.12, 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'),

-- Demo Wallet on opBNB
(@DemoWallet, 204, '0x0000000000000000000000000000000000000000', 'BNB', 'opBNB Native', 18, '52.300000000000000000', 52.30000000, 582.40, 30459.52, 2.45, 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
(@DemoWallet, 204, '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3', 'USDT', 'opBNB Tether USD', 18, '7185000000000000000000', 7185.00000000, 1.00, 7185.00, 0.00, 'https://cryptologos.cc/logos/tether-usdt-logo.png'),

-- Trader Wallet
(@TraderWallet, 204, '0x0000000000000000000000000000000000000000', 'BNB', 'opBNB Gas Asset', 18, '18.450000000000000000', 18.45000000, 582.40, 10745.28, 2.45, 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
(@TraderWallet, 56, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 'USDC', 'USD Coin (BSC)', 18, '45200000000000000000000', 45200.00000000, 1.00, 45200.00, 0.02, 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'),
(@TraderWallet, 1, '0x0000000000000000000000000000000000000000', 'ETH', 'Ethereum Native', 18, '9.800000000000000000', 9.80000000, 3420.00, 33516.00, 1.78, 'https://cryptologos.cc/logos/ethereum-eth-logo.png');

-- 4. Transactions Data for Demo Wallet (Including Successful, Failed, and Anomalous)
DELETE FROM dbo.Transactions WHERE FromAddress IN (@DemoWallet, @TraderWallet) OR ToAddress IN (@DemoWallet, @TraderWallet);

INSERT INTO dbo.Transactions (
    TxHash, ChainId, BlockNumber, FromAddress, ToAddress, ValueEth, ValueUsd, 
    GasLimit, GasUsed, GasPriceGwei, GasFeeEth, GasFeeUsd, Nonce, Status, 
    IsError, ErrCode, RevertReason, MethodName, ContractAddress, TokenTransferred, 
    TokenAmount, RiskScore, AnomalyFlags, Timestamp
) VALUES
-- 1: Large Safe Transfer on BSC
('0x7a29e1c4501a349887b2bc2bbd2242cb6d94443b7156976ba292bfcb7008101a', 56, 38102914, @DemoWallet, '0x10ED43C718714eb63d5aA57B78B54704E256024E', 0.0, 0.0, 250000, 142000, 3.0, 0.000426, 0.248, 104, 'SUCCESS', 0, NULL, NULL, 'swapExactTokensForTokens', '0x10ED43C718714eb63d5aA57B78B54704E256024E', 'CAKE', 2500.0, 12, NULL, DATEADD(MINUTE, -24, SYSUTCDATETIME())),

-- 2: Gas Spike Anomaly on BSC (Gas price was 65 Gwei instead of typical 3 Gwei)
('0x9d4b68923a10fe9923849bbba2034980a9117cf4826189ea711d9482b819280b', 56, 38098102, @DemoWallet, '0x55d398326f99059fF775485246999027B3197955', 0.0, 0.0, 180000, 120500, 68.5, 0.008254, 4.807, 103, 'SUCCESS', 0, NULL, NULL, 'transfer', '0x55d398326f99059fF775485246999027B3197955', 'USDT', 15000.0, 48, 'GAS_SPIKE', DATEADD(HOUR, -2, SYSUTCDATETIME())),

-- 3: FAILED TRANSACTION on BSC (Slippage / Out of Gas)
('0x3f18a99281a94bb2e118bbfa1029482718102837bcde20918738129038bca81c', 56, 38089410, @DemoWallet, '0x10ED43C718714eb63d5aA57B78B54704E256024E', 12.5, 7280.0, 300000, 300000, 3.2, 0.000960, 0.559, 102, 'FAILED', 1, 'INSUFFICIENT_OUTPUT_AMOUNT', 'PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT', 'swapExactETHForTokens', '0x10ED43C718714eb63d5aA57B78B54704E256024E', 'BNB', 12.5, 75, 'FAILED_TX,SLIPPAGE_EXCEEDED', DATEADD(HOUR, -6, SYSUTCDATETIME())),

-- 4: opBNB Ultra-low Gas Transaction
('0x18ab7219cba00182740928374019283740192830192837401928374019283740', 204, 19482019, @DemoWallet, '0x4200000000000000000000000000000000000015', 5.0, 2912.0, 45000, 21000, 0.00001, 0.00000021, 0.00012, 101, 'SUCCESS', 0, NULL, NULL, 'Transfer', NULL, 'BNB', 5.0, 5, NULL, DATEADD(HOUR, -14, SYSUTCDATETIME())),

-- 5: Unlimited Token Approval Anomaly (Security risk: infinite allowance to untrusted spender)
('0x5e12891bb2049182374019283740192837401928374019283740192837401928', 56, 38071002, @DemoWallet, '0x55d398326f99059fF775485246999027B3197955', 0.0, 0.0, 65000, 46120, 3.1, 0.000142, 0.083, 100, 'SUCCESS', 0, NULL, NULL, 'approve', '0x55d398326f99059fF775485246999027B3197955', 'USDT', -1.0, 85, 'UNLIMITED_APPROVAL,HIGH_RISK_SPENDER', DATEADD(DAY, -1, SYSUTCDATETIME())),

-- 6: Large Outflow Transfer
('0xc918239019283019283019283019283019283019283019283019283019283019', 56, 38050991, @DemoWallet, '0x4892c19201920192019201920192019201920192', 150.0, 87360.0, 21000, 21000, 3.0, 0.000063, 0.036, 99, 'SUCCESS', 0, NULL, NULL, 'Transfer', NULL, 'BNB', 150.0, 40, 'LARGE_OUTFLOW', DATEADD(DAY, -2, SYSUTCDATETIME())),

-- 7: opBNB Cross-Chain Deposit
('0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b', 204, 19460293, '0x4200000000000000000000000000000000000010', @DemoWallet, 25.0, 14560.0, 85000, 52000, 0.00001, 0.00000052, 0.0003, 54, 'SUCCESS', 0, NULL, NULL, 'finalizeDeposit', NULL, 'BNB', 25.0, 5, NULL, DATEADD(DAY, -3, SYSUTCDATETIME())),

-- 8: Trader Wallet Failed Revert on opBNB
('0xbf81928374019283740192837401928374019283740192837401928374019283', 204, 19441029, @TraderWallet, '0x2918239019283019283019283019283019283019', 1.0, 582.4, 250000, 182000, 0.00002, 0.00000364, 0.002, 38, 'FAILED', 1, 'EXECUTION_REVERTED', 'OpSwap: K_CONSTANT_FAILED', 'swapExactTokensForTokens', NULL, 'BNB', 1.0, 68, 'FAILED_TX,DEX_SLIPPAGE', DATEADD(DAY, -4, SYSUTCDATETIME()));

-- 5. Forensics & Anomalies Table
DELETE FROM dbo.TransactionAnomalies WHERE WalletAddress IN (@DemoWallet, @TraderWallet);

INSERT INTO dbo.TransactionAnomalies (
    TxHash, ChainId, WalletAddress, AnomalyType, Severity, Title, Description, RecommendedAction, MetricDetails, DetectedAt
) VALUES
('0x3f18a99281a94bb2e118bbfa1029482718102837bcde20918738129038bca81c', 56, @DemoWallet, 'FAILED_TX', 'HIGH', 'Execution Reverted on PancakeSwap V2', 'Transaction reverted with reason INSUFFICIENT_OUTPUT_AMOUNT. Gas of $0.56 was consumed without successful token receipt.', 'Increase slippage tolerance or split trade across multiple blocks to avoid frontrunning.', '{"gasFeeUsd": 0.56, "reason": "PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT", "valueEth": 12.5}', DATEADD(HOUR, -6, SYSUTCDATETIME())),

('0x9d4b68923a10fe9923849bbba2034980a9117cf4826189ea711d9482b819280b', 56, @DemoWallet, 'GAS_SPIKE', 'WARNING', 'Severe Gas Overpayment (68.5 Gwei)', 'Gas price was 68.5 Gwei compared to the 3.0 Gwei network baseline (2,183% higher). Paid $4.81 in gas fees for simple transfer.', 'Configure dynamic EIP-1559 gas limits or adjust baseFee multiplier in wallet settings.', '{"gasPriceGwei": 68.5, "baselineGwei": 3.0, "multiplier": 22.8}', DATEADD(HOUR, -2, SYSUTCDATETIME())),

('0x5e12891bb2049182374019283740192837401928374019283740192837401928', 56, @DemoWallet, 'UNLIMITED_APPROVAL', 'CRITICAL', 'Infinite ERC-20 Allowance Granted', 'Approved Max Uint256 (unlimited) USDT to spender contract. If the spender protocol suffers an exploit, your USDT balance can be drained.', 'Use Revoke.cash or send an approval transaction setting allowance to 0 immediately.', '{"token": "USDT", "allowance": "Infinite (2^256 - 1)", "spender": "0x55d3...7955"}', DATEADD(DAY, -1, SYSUTCDATETIME())),

('0xc918239019283019283019283019283019283019283019283019283019283019', 56, @DemoWallet, 'LARGE_OUTFLOW', 'WARNING', 'Large Outflow: 150 BNB ($87,360)', 'Substantial transfer leaving wallet exceeding normal average volume ($2,500/tx).', 'Verify destination address against whitelist. Ensure 2FA hardware wallet signature was intentional.', '{"amountBnb": 150.0, "amountUsd": 87360.0}', DATEADD(DAY, -2, SYSUTCDATETIME())),

('0xbf81928374019283740192837401928374019283740192837401928374019283', 204, @TraderWallet, 'FAILED_TX', 'HIGH', 'opBNB AMM Pool Execution Failure', 'Swap call failed on opBNB pool due to pool invariant error (K_CONSTANT_FAILED).', 'Ensure correct pool liquidity depth and route through trusted aggregator.', '{"reason": "OpSwap: K_CONSTANT_FAILED"}', DATEADD(DAY, -4, SYSUTCDATETIME()));

-- 6. Default Alert Rules
DELETE FROM dbo.AlertRules;
INSERT INTO dbo.AlertRules (WalletAddress, ChainId, RuleName, AlertType, ThresholdValue, ComparisonOperator, IsActive, NotifyOnDashboard)
VALUES
(NULL, NULL, 'Transaction Failure Alert', 'TX_FAILED', 1.0, '>=', 1, 1),
(NULL, NULL, 'Whale Outflow Alert (> $10,000)', 'LARGE_TRANSFER', 10000.00, '>=', 1, 1),
(NULL, 56, 'BSC Gas Spike (> 20 Gwei)', 'GAS_SPIKE', 20.00, '>=', 1, 1),
(NULL, NULL, 'High Risk Contract Interaction', 'RISK_SCORE_HIGH', 70.00, '>=', 1, 1),
(NULL, NULL, 'Unlimited Token Approval Detector', 'TOKEN_APPROVAL', 0.00, '>=', 1, 1);

-- 7. Triggered Notifications
DELETE FROM dbo.AlertNotifications WHERE WalletAddress IN (@DemoWallet, @TraderWallet);
INSERT INTO dbo.AlertNotifications (RuleId, WalletAddress, ChainId, TxHash, Severity, Title, Message, IsRead, CreatedAt)
VALUES
(3, @DemoWallet, 56, '0x9d4b68923a10fe9923849bbba2034980a9117cf4826189ea711d9482b819280b', 'WARNING', 'Gas Spike Detected on BSC', 'Transaction paid 68.5 Gwei gas fee, exceeding your 20 Gwei threshold.', 0, DATEADD(HOUR, -2, SYSUTCDATETIME())),
(1, @DemoWallet, 56, '0x3f18a99281a94bb2e118bbfa1029482718102837bcde20918738129038bca81c', 'HIGH', 'Failed Transaction on BSC', 'Swap transaction reverted: INSUFFICIENT_OUTPUT_AMOUNT. $0.56 gas lost.', 0, DATEADD(HOUR, -6, SYSUTCDATETIME())),
(5, @DemoWallet, 56, '0x5e12891bb2049182374019283740192837401928374019283740192837401928', 'CRITICAL', 'Unlimited USDT Approval Granted', 'Infinite token approval detected. Spender contract can withdraw tokens without restriction.', 1, DATEADD(DAY, -1, SYSUTCDATETIME())),
(2, @DemoWallet, 56, '0xc918239019283019283019283019283019283019', 'WARNING', 'Large Outflow Detected', 'Outbound transfer of $87,360 (150 BNB) triggered Whale Outflow Alert.', 1, DATEADD(DAY, -2, SYSUTCDATETIME()));
