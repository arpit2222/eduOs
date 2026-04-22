export default function CredentialPanel() {
  return (
    <div className="edu-card p-5 bg-black/20 border border-border">
      <div>
        <p className="mono text-xs text-secondary uppercase tracking-wider">Onchain Credential Layer</p>
        <h3 className="display-font text-2xl font-bold mt-2">Whole Child Profile</h3>
        <p className="text-muted mt-2 text-sm leading-6">
          EduOS records verified learning progress, assessment milestones, and school achievements as a portable
          onchain profile. The token reward is one part of that system. The larger outcome is a durable record of
          growth that can move across schools, higher education, and future opportunities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-5 text-sm">
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Learning</p>
          <p className="font-semibold mt-1">Topic mastery and assessments</p>
        </div>
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Participation</p>
          <p className="font-semibold mt-1">Sessions, activities, and milestones</p>
        </div>
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Credentials</p>
          <p className="font-semibold mt-1">Verifiable, portable, onchain</p>
        </div>
        <div className="edu-card p-3 bg-black/25">
          <p className="text-muted text-xs">Rewards</p>
          <p className="font-semibold mt-1">$LEARN as merit, not speculation</p>
        </div>
      </div>
    </div>
  );
}
