import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const BSC_TESTNET_CHAIN_ID = '0x61';
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address) view returns (uint256)'
];

const NETWORK_CONFIG = {
  chainId: BSC_TESTNET_CHAIN_ID,
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18
  },
  rpcUrls: [BSC_TESTNET_RPC],
  blockExplorerUrls: ['https://testnet.bscscan.com']
};

function requireEthereum() {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask.');
  }
  return window.ethereum;
}

async function ensureBscTestnet(ethereum) {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_TESTNET_CHAIN_ID }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORK_CONFIG]
      });
      return;
    }

    throw switchError;
  }
}

function requireContractAddress() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === 'YOUR_DEPLOYED_CONTRACT_ADDRESS') {
    throw new Error('VITE_CONTRACT_ADDRESS is missing. Add deployed contract address in .env.');
  }
}

export async function connectWallet() {
  const ethereum = requireEthereum();
  await ensureBscTestnet(ethereum);

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || !accounts[0]) {
    throw new Error('No wallet account found.');
  }

  return accounts[0];
}

async function getContract(mode = 'write') {
  requireContractAddress();
  const ethereum = requireEthereum();
  const provider = new ethers.BrowserProvider(ethereum);

  if (mode === 'read') {
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }

  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function mintTokens(walletAddress) {
  const contract = await getContract('write');
  const amount = ethers.parseUnits('100', 18);

  console.log('============================');
  console.log('EduOS Contract Address:', CONTRACT_ADDRESS);
  console.log('Minting 100 LEARN to:', walletAddress);

  const tx = await contract.mint(walletAddress, amount);
  console.log('Mint TX Hash:', tx.hash);
  console.log('============================');

  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    receipt
  };
}

export async function getBalance(walletAddress) {
  const contract = await getContract('read');
  const rawBalance = await contract.balanceOf(walletAddress);
  return ethers.formatUnits(rawBalance, 18);
}

export function getContractAddress() {
  return CONTRACT_ADDRESS;
}
