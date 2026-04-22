import { useMemo, useState } from 'react';

export default function FourMemeLaunchKit({ projectName = 'EduOS', tokenName = 'Learn Token', tokenSymbol = 'LEARN' }) {
  const [copied, setCopied] = useState(false);

  const launchPayload = useMemo(
    () => ({
      tokenName,
      tickerSymbol: tokenSymbol,
      description:
        `${projectName} turns curriculum study into a learn-quiz-earn loop with AI-generated topic pages and onchain rewards on BNB Chain.`,
      raisedToken: 'BNB',
      logo: `${projectName.toLowerCase()}-logo.png`,
      socials: {
        website: 'local-demo',
        x: 'local-demo',
        telegram: 'local-demo'
      }
    }),
    [projectName, tokenName, tokenSymbol]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(launchPayload, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="edu-card p-5 bg-black/20 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono text-xs text-secondary uppercase tracking-wider">Four.meme Integration</p>
          <h3 className="display-font text-2xl font-bold mt-2">Launch Kit</h3>
          <p className="text-muted mt-2 text-sm">
            Four.meme docs show token creation metadata fields like name, symbol, description, raised token, logo, and socials.
            This card packages those fields for your demo and launch flow.
          </p>
        </div>

        <a
          href="https://four.meme"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 px-4 py-2 rounded-xl border border-primary text-primary"
        >
          Open Four.meme
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-5 text-sm">
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Token Name</p>
          <p className="font-semibold mt-1">{launchPayload.tokenName}</p>
        </div>
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Ticker Symbol</p>
          <p className="font-semibold mt-1">{launchPayload.tickerSymbol}</p>
        </div>
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Raised Token</p>
          <p className="font-semibold mt-1">{launchPayload.raisedToken}</p>
        </div>
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Launch Mode</p>
          <p className="font-semibold mt-1">Meme Token / BNB Chain</p>
        </div>
      </div>

      <p className="mono text-xs text-muted mt-4 break-all">
        {JSON.stringify(launchPayload)}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={handleCopy} className="glow-button rounded-xl px-4 py-2 font-semibold">
          {copied ? 'Copied payload' : 'Copy launch payload'}
        </button>
        <span className="text-xs text-muted">Use this payload when creating the token in Four.meme.</span>
      </div>
    </div>
  );
}
