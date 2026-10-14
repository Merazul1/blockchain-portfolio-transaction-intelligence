-- =====================================================================
-- Blockchain Portfolio & Transaction Intelligence Database Schema
-- Database: BlockchainIntelligenceDB
-- Target Engine: Microsoft SQL Server 2019 / 2022 / 2025
-- =====================================================================

USE BlockchainIntelligenceDB;
GO

-- 1. Networks Table (BSC, opBNB, Ethereum, Polygon, Arbitrum, Testnets)
IF OBJECT_ID('dbo.Networks', 'U') IS NOT NULL DROP TABLE dbo.Networks;
CREATE TABLE dbo.Networks (
    ChainId INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    ShortName NVARCHAR(20) NOT NULL,
    NativeSymbol NVARCHAR(10) NOT NULL,
    RpcUrl NVARCHAR(255) NOT NULL,
    FallbackRpcUrl NVARCHAR(255) NULL,
    ExplorerUrl NVARCHAR(255) NOT NULL,
    ExplorerApiUrl NVARCHAR(255) NULL,
    IsActive BIT DEFAULT 1,
    IsTestnet BIT DEFAULT 0,
    ColorHex NVARCHAR(20) DEFAULT '#F3BA2F',
    IconUrl NVARCHAR(255) NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- 2. Wallets Table
IF OBJECT_ID('dbo.Wallets', 'U') IS NOT NULL DROP TABLE dbo.Wallets;
CREATE TABLE dbo.Wallets (
    WalletId INT IDENTITY(1,1) PRIMARY KEY,
    Address NVARCHAR(66) NOT NULL UNIQUE,
    Label NVARCHAR(100) NULL,
    EnsName NVARCHAR(100) NULL,
    PrimaryChainId INT NULL,
    RiskScore INT DEFAULT 0, -- 0 to 100
    SafetyRating NVARCHAR(20) DEFAULT 'Low Risk', -- Low Risk, Moderate, High, Critical
    IsWatchlist BIT DEFAULT 1,
    TotalUsdValue DECIMAL(18, 4) DEFAULT 0.0,
    TotalTxCount INT DEFAULT 0,
    FailedTxCount INT DEFAULT 0,
    LastSyncedAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- 3. TokenBalances Table
IF OBJECT_ID('dbo.TokenBalances', 'U') IS NOT NULL DROP TABLE dbo.TokenBalances;
CREATE TABLE dbo.TokenBalances (
    BalanceId INT IDENTITY(1,1) PRIMARY KEY,
    WalletAddress NVARCHAR(66) NOT NULL,
    ChainId INT NOT NULL,
    TokenAddress NVARCHAR(66) NOT NULL, -- '0x0000000000000000000000000000000000000000' for native coin
    Symbol NVARCHAR(20) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Decimals INT DEFAULT 18,
    RawBalance NVARCHAR(100) NOT NULL DEFAULT '0',
    FormattedBalance DECIMAL(36, 8) DEFAULT 0.0,
    UsdPrice DECIMAL(18, 4) DEFAULT 0.0,
    UsdValue DECIMAL(18, 4) DEFAULT 0.0,
    Price24hChange DECIMAL(9, 4) DEFAULT 0.0,
    LogoUrl NVARCHAR(255) NULL,
    LastUpdatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Wallet_Chain_Token UNIQUE (WalletAddress, ChainId, TokenAddress)
);

-- 4. Transactions Table (Enriched with Gas, Value, Status, Decoded Method, Risk)
IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
CREATE TABLE dbo.Transactions (
    TxId INT IDENTITY(1,1) PRIMARY KEY,
    TxHash NVARCHAR(66) NOT NULL UNIQUE,
    ChainId INT NOT NULL,
    BlockNumber BIGINT NOT NULL,
    FromAddress NVARCHAR(66) NOT NULL,
    ToAddress NVARCHAR(66) NULL,
    ValueEth DECIMAL(36, 8) DEFAULT 0.0,
    ValueUsd DECIMAL(18, 4) DEFAULT 0.0,
    GasLimit BIGINT DEFAULT 21000,
    GasUsed BIGINT DEFAULT 21000,
    GasPriceGwei DECIMAL(18, 4) DEFAULT 0.0,
    GasFeeEth DECIMAL(36, 8) DEFAULT 0.0,
    GasFeeUsd DECIMAL(18, 4) DEFAULT 0.0,
    Nonce BIGINT DEFAULT 0,
    Status NVARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'PENDING'
    IsError BIT DEFAULT 0,
    ErrCode NVARCHAR(100) NULL,
    RevertReason NVARCHAR(MAX) NULL,
    MethodName NVARCHAR(100) DEFAULT 'Transfer',
    ContractAddress NVARCHAR(66) NULL,
    TokenTransferred NVARCHAR(20) NULL,
    TokenAmount DECIMAL(36, 8) NULL,
    RiskScore INT DEFAULT 0, -- 0 (Safe) to 100 (Extremely dangerous)
    AnomalyFlags NVARCHAR(255) NULL, -- 'GAS_SPIKE,REVERTED,UNLIMITED_APPROVAL'
    Timestamp DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- 5. TransactionAnomalies Table (Security and Forensic Intelligence)
IF OBJECT_ID('dbo.TransactionAnomalies', 'U') IS NOT NULL DROP TABLE dbo.TransactionAnomalies;
CREATE TABLE dbo.TransactionAnomalies (
    AnomalyId INT IDENTITY(1,1) PRIMARY KEY,
    TxHash NVARCHAR(66) NOT NULL,
    ChainId INT NOT NULL,
    WalletAddress NVARCHAR(66) NOT NULL,
    AnomalyType NVARCHAR(50) NOT NULL, -- 'FAILED_TX', 'GAS_SPIKE', 'UNLIMITED_APPROVAL', 'SUSPICIOUS_CONTRACT', 'LARGE_OUTFLOW', 'MEV_FRONT_RUN'
    Severity NVARCHAR(20) NOT NULL, -- 'INFO', 'WARNING', 'HIGH', 'CRITICAL'
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    RecommendedAction NVARCHAR(MAX) NULL,
    MetricDetails NVARCHAR(MAX) NULL, -- JSON string with specific numbers
    DetectedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- 6. AlertRules Table (Custom User Alerts)
IF OBJECT_ID('dbo.AlertRules', 'U') IS NOT NULL DROP TABLE dbo.AlertRules;
CREATE TABLE dbo.AlertRules (
    RuleId INT IDENTITY(1,1) PRIMARY KEY,
    WalletAddress NVARCHAR(66) NULL, -- NULL applies to all watched wallets
    ChainId INT NULL, -- NULL applies to all chains
    RuleName NVARCHAR(100) NOT NULL,
    AlertType NVARCHAR(50) NOT NULL, -- 'TX_FAILED', 'LARGE_TRANSFER', 'GAS_SPIKE', 'RISK_SCORE_HIGH', 'TOKEN_APPROVAL'
    ThresholdValue DECIMAL(18, 4) NULL,
    ComparisonOperator NVARCHAR(10) DEFAULT '>=', -- '>=', '<=', '=='
    IsActive BIT DEFAULT 1,
    NotifyOnDashboard BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- 7. AlertNotifications Table (Live notifications for triggered alerts)
IF OBJECT_ID('dbo.AlertNotifications', 'U') IS NOT NULL DROP TABLE dbo.AlertNotifications;
CREATE TABLE dbo.AlertNotifications (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    RuleId INT NULL,
    WalletAddress NVARCHAR(66) NOT NULL,
    ChainId INT NOT NULL,
    TxHash NVARCHAR(66) NULL,
    Severity NVARCHAR(20) NOT NULL DEFAULT 'WARNING',
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- 8. AuditReports Table (Stored snapshot reports)
IF OBJECT_ID('dbo.AuditReports', 'U') IS NOT NULL DROP TABLE dbo.AuditReports;
CREATE TABLE dbo.AuditReports (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    ReportTitle NVARCHAR(200) NOT NULL,
    WalletAddress NVARCHAR(66) NOT NULL,
    ChainId INT NULL,
    Format NVARCHAR(20) NOT NULL, -- 'CSV', 'PDF', 'JSON'
    DateFrom DATETIME2 NULL,
    DateTo DATETIME2 NULL,
    TotalTransactions INT DEFAULT 0,
    TotalVolumeUsd DECIMAL(18, 4) DEFAULT 0.0,
    FailedTransactions INT DEFAULT 0,
    TotalGasSpentUsd DECIMAL(18, 4) DEFAULT 0.0,
    ReportDataJson NVARCHAR(MAX) NULL,
    GeneratedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- Indexes for lightning fast queries
CREATE INDEX IX_Wallets_Address ON dbo.Wallets(Address);
CREATE INDEX IX_TokenBalances_Wallet_Chain ON dbo.TokenBalances(WalletAddress, ChainId);
CREATE INDEX IX_Transactions_FromAddress ON dbo.Transactions(FromAddress);
CREATE INDEX IX_Transactions_ToAddress ON dbo.Transactions(ToAddress);
CREATE INDEX IX_Transactions_Chain_Time ON dbo.Transactions(ChainId, Timestamp DESC);
CREATE INDEX IX_Anomalies_Wallet ON dbo.TransactionAnomalies(WalletAddress);
CREATE INDEX IX_Alerts_Wallet ON dbo.AlertNotifications(WalletAddress, IsRead);

-- Helper View: Portfolio Summary by Wallet
IF OBJECT_ID('dbo.vw_PortfolioSummary', 'V') IS NOT NULL DROP VIEW dbo.vw_PortfolioSummary;
GO
CREATE VIEW dbo.vw_PortfolioSummary AS
SELECT 
    w.Address,
    w.Label,
    w.RiskScore,
    w.SafetyRating,
    ISNULL(SUM(tb.UsdValue), 0.0) AS CalculatedNetWorthUsd,
    COUNT(DISTINCT tb.TokenAddress) AS AssetCount,
    COUNT(DISTINCT t.TxId) AS TotalTxCount,
    SUM(CASE WHEN t.IsError = 1 THEN 1 ELSE 0 END) AS FailedTxCount,
    ISNULL(SUM(t.GasFeeUsd), 0.0) AS TotalGasSpentUsd
FROM dbo.Wallets w
LEFT JOIN dbo.TokenBalances tb ON w.Address = tb.WalletAddress
LEFT JOIN dbo.Transactions t ON w.Address = t.FromAddress OR w.Address = t.ToAddress
GROUP BY w.Address, w.Label, w.RiskScore, w.SafetyRating;
GO
