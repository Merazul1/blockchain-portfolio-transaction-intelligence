/**
 * Network Configurations and Popular Token Registries
 * Focused on BSC (ChainId 56) and opBNB (ChainId 204), plus ETH and Polygon
 */

const SUPPORTED_NETWORKS = {
  56: {
    chainId: 56,
    name: 'BNB Smart Chain (BSC)',
    shortName: 'BSC',
    nativeSymbol: 'BNB',
    nativeDecimals: 18,
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://binance.llamarpc.com',
      'https://rpc.ankr.com/bsc'
    ],
    explorerUrl: 'https://bscscan.com',
    color: '#F3BA2F',
    isTestnet: false,
    tokens: [
      {
        address: '0x55d398326f99059fF775485246999027B3197955',
        symbol: 'USDT',
        name: 'Tether USD (BSC-USD)',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
      },
      {
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        symbol: 'USDC',
        name: 'USD Coin (BSC)',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      },
      {
        address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        symbol: 'CAKE',
        name: 'PancakeSwap Token',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/pancakeswap-cake-logo.png'
      },
      {
        address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        symbol: 'BTCB',
        name: 'Binance-Peg BTCB',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
      },
      {
        address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        symbol: 'ETH',
        name: 'Binance-Peg Ethereum',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
      }
    ]
  },
  204: {
    chainId: 204,
    name: 'opBNB Mainnet',
    shortName: 'opBNB',
    nativeSymbol: 'BNB',
    nativeDecimals: 18,
    rpcUrls: [
      'https://opbnb-mainnet-rpc.bnbchain.org',
      'https://opbnb.blockpi.network/v1/rpc/public',
      'https://opbnb-rpc.publicnode.com'
    ],
    explorerUrl: 'https://opbnb.bscscan.com',
    color: '#00E676',
    isTestnet: false,
    tokens: [
      {
        address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
        symbol: 'USDT',
        name: 'opBNB Tether USD',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
      },
      {
        address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        symbol: 'WBNB',
        name: 'Wrapped BNB',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
      }
    ]
  },
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeDecimals: 18,
    rpcUrls: [
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://cloudflare-eth.com'
    ],
    explorerUrl: 'https://etherscan.io',
    color: '#627EEA',
    isTestnet: false,
    tokens: [
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
      },
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      }
    ]
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    shortName: 'Polygon',
    nativeSymbol: 'POL',
    nativeDecimals: 18,
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.maticvigil.com'
    ],
    explorerUrl: 'https://polygonscan.com',
    color: '#8247E5',
    isTestnet: false,
    tokens: []
  },
  97: {
    chainId: 97,
    name: 'BSC Testnet',
    shortName: 'BSC Testnet',
    nativeSymbol: 'tBNB',
    nativeDecimals: 18,
    rpcUrls: [
      'https://data-seed-prebsc-1-s1.binance.org:8545',
      'https://bsc-testnet.publicnode.com'
    ],
    explorerUrl: 'https://testnet.bscscan.com',
    color: '#F3BA2F',
    isTestnet: true,
    tokens: []
  },
  5611: {
    chainId: 5611,
    name: 'opBNB Testnet',
    shortName: 'opBNB Testnet',
    nativeSymbol: 'tBNB',
    nativeDecimals: 18,
    rpcUrls: [
      'https://opbnb-testnet-rpc.bnbchain.org'
    ],
    explorerUrl: 'https://opbnb-testnet.bscscan.com',
    color: '#00E676',
    isTestnet: true,
    tokens: []
  }
};

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

module.exports = {
  SUPPORTED_NETWORKS,
  ERC20_ABI,
};
