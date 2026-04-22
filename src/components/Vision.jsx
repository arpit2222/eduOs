const SIGNALS = [
  { value: '01', label: 'AI tutoring', note: 'Topic-level explanations and diagnostics' },
  { value: '02', label: 'Onchain profile', note: 'Portable proof of progress and achievement' },
  { value: '03', label: 'School economy', note: 'Merit-based incentives inside institutions' }
];

const STACK = [
  'AI academic engine',
  'Live learning network',
  'Activity network',
  'Industry gateway',
  'Career intelligence',
  'Whole child profile'
];

const SHIFT = [
  {
    title: 'From static schooling',
    points: [
      'Syllabus completion over mastery',
      'One pace for every student',
      'Achievements scattered across systems'
    ]
  },
  {
    title: 'To adaptive learning infrastructure',
    points: [
      'AI-guided chapter-level personalization',
      'Verified progress across academics and activities',
      'Portable onchain identity for long-term growth'
    ]
  }
];

const REWARD_SYSTEM = [
  {
    title: '$LEARN',
    text: 'A universal merit token earned through verified learning, assessment, and participation.'
  },
  {
    title: 'School tokens',
    text: 'Institution-level reputation tokens for attendance, houses, clubs, and internal challenges.'
  },
  {
    title: 'Credential layer',
    text: 'A durable onchain record that turns isolated achievements into a coherent student profile.'
  }
];

const FLOW = [
  'Read curriculum',
  'Build topic graph',
  'Generate study pages',
  'Verify understanding',
  'Mint merit',
  'Update profile'
];

export default function Vision({ onContinue }) {
  return (
    <section className="screen max-w-7xl mx-auto relative">
      <div className="landing-orb landing-orb-left" />
      <div className="landing-orb landing-orb-right" />

      <div className="vision-shell">
        <div className="vision-hero">
          <div className="hero-badge-row">
            <span className="hero-badge">Education infrastructure</span>
            <span className="hero-badge hero-badge-accent">AI + blockchain</span>
            <span className="hero-badge">Global K-12 platform</span>
          </div>

          <div className="vision-hero-copy">
            <p className="mono vision-kicker">EduOS</p>
            <h1 className="display-font vision-title">A serious operating layer for modern education.</h1>
            <p className="vision-summary">
              EduOS brings AI tutoring, structured school rewards, and onchain credentials into one system. The result
              is not more content. It is a school that can finally understand progress, personalize learning, and keep
              a durable record of how a student grows.
            </p>
          </div>

          <div className="vision-signal-grid">
            {SIGNALS.map((item) => (
              <div key={item.label} className="signal-card">
                <p className="signal-value mono">{item.value}</p>
                <p className="signal-label">{item.label}</p>
                <p className="signal-note">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="vision-system-grid">
          <div className="edu-card vision-panel">
            <div className="vision-panel-head">
              <p className="mono panel-kicker">System map</p>
              <h2 className="display-font panel-title">Six layers. One student record.</h2>
            </div>

            <div className="stack-rail">
              {STACK.map((item, index) => (
                <div key={item} className="stack-node">
                  <div className="stack-index mono">{index + 1}</div>
                  <div className="stack-body">
                    <p className="stack-title">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="edu-card vision-panel vision-panel-contrast">
            <div className="vision-panel-head">
              <p className="mono panel-kicker">Transformation</p>
              <h2 className="display-font panel-title">What changes when learning becomes legible.</h2>
            </div>

            <div className="shift-grid">
              {SHIFT.map((column) => (
                <div key={column.title} className="shift-card">
                  <p className="shift-title">{column.title}</p>
                  <div className="shift-list">
                    {column.points.map((point) => (
                      <div key={point} className="shift-item">
                        <span className="shift-mark" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="vision-lower-grid">
          <div className="edu-card vision-panel">
            <div className="vision-panel-head">
              <p className="mono panel-kicker">Reward architecture</p>
              <h2 className="display-font panel-title">Incentives without speculation.</h2>
            </div>

            <div className="reward-grid">
              {REWARD_SYSTEM.map((item) => (
                <div key={item.title} className="reward-card">
                  <p className="reward-title">{item.title}</p>
                  <p className="reward-text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="edu-card vision-panel vision-panel-action">
            <div className="vision-panel-head">
              <p className="mono panel-kicker">Product flow</p>
              <h2 className="display-font panel-title">A curriculum becomes a living system.</h2>
            </div>

            <div className="flow-track">
              {FLOW.map((item, index) => (
                <div key={item} className="flow-step-card">
                  <span className="flow-step-index mono">0{index + 1}</span>
                  <span className="flow-step-text">{item}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="glow-button w-full mt-6 px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center justify-center gap-3"
            >
              Continue to platform setup
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
