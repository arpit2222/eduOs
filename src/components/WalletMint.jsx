import { useMemo, useState } from 'react';
import { connectWallet, getBalance, getContractAddress, mintTokens } from '../lib/web3';
import CredentialPanel from './CredentialPanel';

function shortAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletMint({ onBack, aiProviderLabel }) {
  const [wallet, setWallet] = useState('');
  const [balance, setBalance] = useState('0');
  const [txHash, setTxHash] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState('');

  const explorerBase = import.meta.env.VITE_BSC_EXPLORER_URL || 'https://testnet.bscscan.com/tx';
  const txUrl = useMemo(() => (txHash ? `${explorerBase}/${txHash}` : ''), [explorerBase, txHash]);

  const handleConnect = async () => {
    setError('');
    setConnecting(true);
    try {
      const address = await connectWallet();
      const currentBalance = await getBalance(address);
      setWallet(address);
      setBalance(Number(currentBalance).toFixed(2));
    } catch (err) {
      setError(err.message || 'Wallet connection failed.');
    } finally {
      setConnecting(false);
    }
  };

  const handleMint = async () => {
    setError('');
    setMinting(true);
    try {
      const { txHash: hash } = await mintTokens(wallet);
      setTxHash(hash);
      const updatedBalance = await getBalance(wallet);
      setBalance(Number(updatedBalance).toFixed(2));
    } catch (err) {
      setError(err.message || 'Mint failed.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <section className="screen max-w-3xl mx-auto py-12">
      <div className="edu-card p-8">
        <h2 className="display-font text-4xl font-bold">Claim Reward</h2>
        <p className="text-muted mt-2">Pass reward: 100 LEARN tokens on BSC Testnet</p>
        <p className="mt-2 text-xs text-primary">AI Provider: {aiProviderLabel}</p>

        <div className="mt-6 p-4 rounded-xl bg-black/20 border border-border">
          <p className="mono text-xs text-muted">Contract</p>
          <p className="mono text-sm text-primary break-all mt-1">{getContractAddress() || 'Set VITE_CONTRACT_ADDRESS in .env'}</p>
        </div>

        {!wallet ? (
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="glow-button mt-6 rounded-2xl px-8 py-4 font-bold inline-flex items-center gap-3 disabled:opacity-60"
          >
            {connecting ? <span className="loader" /> : null}
            {connecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-black/20 border border-border">
              <p className="text-muted text-sm">Connected Wallet</p>
              <p className="mono text-primary mt-1">{shortAddress(wallet)}</p>
              <p className="text-muted text-sm mt-1">Balance: {balance} LEARN</p>
            </div>

            <button
              type="button"
              onClick={handleMint}
              disabled={minting}
              className="action-button rounded-2xl px-8 py-4 font-bold inline-flex items-center gap-3 disabled:opacity-60"
            >
              {minting ? <span className="loader" /> : null}
              {minting ? 'Minting Tokens...' : 'Mint Tokens'}
            </button>
          </div>
        )}

        {txHash ? (
          <div className="mt-6 p-4 rounded-xl border border-primary bg-primary/10">
            <p className="text-primary font-bold">Mint Successful ✓</p>
            <p className="mt-1">You earned 100 LEARN tokens.</p>
            <a href={txUrl} target="_blank" rel="noreferrer" className="mono text-sm text-secondary underline break-all">
              {txHash}
            </a>
          </div>
        ) : null}

        <div className="mt-6">
          <CredentialPanel />
        </div>

        {error ? <p className="text-red-400 mt-4">{error}</p> : null}

        <button type="button" onClick={onBack} className="mt-8 text-muted hover:text-text">
          ← Back to Results
        </button>
      </div>
    </section>
  );
}
