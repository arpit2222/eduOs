function Confetti() {
  const pieces = new Array(28).fill(0);
  return (
    <div className="confetti-wrap">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 13) % 100}%`,
            animationDelay: `${(i % 9) * 0.12}s`
          }}
        />
      ))}
    </div>
  );
}

import FourMemeLaunchKit from './FourMemeLaunchKit';

export default function Results({ score, total, passed, onRetry, onClaim, aiProviderLabel }) {
  return (
    <section className="screen max-w-3xl mx-auto py-16 relative">
      {passed ? <Confetti /> : null}

      <div className="edu-card p-10 text-center relative overflow-hidden">
        <p className={`mono text-sm ${passed ? 'text-primary' : 'text-secondary'}`}>{passed ? 'MISSION PASSED' : 'TRY AGAIN'}</p>
        <p className="mt-2 text-xs text-muted">AI Provider: {aiProviderLabel}</p>

        <h2 className="display-font text-6xl font-bold mt-3">{score}/{total}</h2>

        <p className="text-lg text-muted mt-4">
          {passed
            ? 'Outstanding. You passed the quiz and unlocked your meme reward.'
            : 'You are close. Review the material and run it back stronger.'}
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {passed ? (
            <button type="button" onClick={onClaim} className="glow-button pulse rounded-2xl px-8 py-4 font-bold">
              Connect Wallet to Claim $LEARN
            </button>
          ) : (
            <button type="button" onClick={onRetry} className="action-button rounded-2xl px-8 py-4 font-bold">
              Try Again
            </button>
          )}
        </div>
      </div>

      {passed ? (
        <div className="mt-6">
          <FourMemeLaunchKit projectName="EduOS" />
        </div>
      ) : null}
    </section>
  );
}
