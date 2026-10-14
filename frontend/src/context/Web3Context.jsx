import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const DEMO_WALLETS = [
  {
    address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    label: 'Binance Hot Vault & opBNB Bridge',
    ens: 'binance-vault.eth',
    type: 'Whale / Bridge'
  },
  {
    address: '0x534631Bcf33BDb069fB20A75d2791C861145b238',
    label: 'DeFi Arbitrage & Yield Trader',
    ens: 'defi-alpha.eth',
    type: 'Active Trader'
  }
];

const CHAIN_PARAMS = {
  56: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
  },
  204: {
    chainId: '0xcc',
    chainName: 'opBNB Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org'],
    blockExplorerUrls: ['https://opbnb.bscscan.com/']
  },
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io/']
  },
  137: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  }
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(56);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(DEMO_WALLETS[0].address);
  const [walletLabel, setWalletLabel] = useState(DEMO_WALLETS[0].label);

  const isMetaMaskAvailable = typeof window !== 'undefined' && Boolean(window.ethereum);

  // Monitor MetaMask account & chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setSelectedWallet(accounts[0]);
          setWalletLabel('Connected MetaMask');
        } else {
          setAccount(null);
          setSelectedWallet(DEMO_WALLETS[0].address);
          setWalletLabel(DEMO_WALLETS[0].label);
        }
      });

      window.ethereum.on('chainChanged', (hexChainId) => {
        setChainId(parseInt(hexChainId, 16));
      });
    }
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install the MetaMask extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainHex = await window.ethereum.request({ method: 'eth_chainId' });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setSelectedWallet(accounts[0]);
        setWalletLabel('Connected MetaMask');
        setChainId(parseInt(currentChainHex, 16));
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setError(err.message || 'Failed to connect MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectMetaMask = () => {
    setAccount(null);
    setSelectedWallet(DEMO_WALLETS[0].address);
    setWalletLabel(DEMO_WALLETS[0].label);
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;

    const hexChainId = `0x${Number(targetChainId).toString(16)}`;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      setChainId(Number(targetChainId));
    } catch (switchError) {
      // Error code 4902 indicates chain is not added to user's wallet
      if (switchError.code === 4902 && CHAIN_PARAMS[targetChainId]) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_PARAMS[targetChainId]],
          });
          setChainId(Number(targetChainId));
        } catch (addError) {
          console.error('Failed to add network to MetaMask:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  const selectDemoWallet = (wallet) => {
    setAccount(null);
    setSelectedWallet(wallet.address);
    setWalletLabel(wallet.label);
  };

  const setCustomAddress = (addr) => {
    setAccount(null);
    setSelectedWallet(addr);
    setWalletLabel('Custom Target');
  };

  const activeAddress = account || selectedWallet;

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isConnecting,
        error,
        isMetaMaskAvailable,
        activeAddress,
        walletLabel,
        connectMetaMask,
        disconnectMetaMask,
        switchNetwork,
        selectDemoWallet,
        setCustomAddress,
        selectedWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
