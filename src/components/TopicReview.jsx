export default function TopicReview({
  className,
  subject,
  topics,
  onChangeTopic,
  onMoveTopic,
  onDeleteTopic,
  onAddTopic,
  onGenerate,
  generating,
  error,
  aiProviderLabel
}) {
  return (
    <section className="screen max-w-5xl mx-auto py-10">
      <div className="edu-card p-8">
        <p className="mono text-sm text-secondary">Class {className} • {subject}</p>
        <p className="mt-2 text-xs text-primary">Active AI: {aiProviderLabel}</p>
        <h2 className="display-font text-4xl font-bold mt-2">Review Topics</h2>
        <p className="text-muted mt-2">
          Edit the extracted topic list before we generate the study pages. Keep it between 3 and 6 items.
        </p>

        <div className="mt-6 grid gap-4">
          {topics.map((topic, index) => (
            <div key={`${topic}-${index}`} className="edu-card p-4 bg-black/20 border border-border">
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  value={topic}
                  onChange={(event) => onChangeTopic(index, event.target.value)}
                  className="flex-1 bg-transparent outline-none border-b border-border focus:border-primary pb-2"
                />
                <button
                  type="button"
                  onClick={() => onMoveTopic(index, -1)}
                  disabled={index === 0}
                  className="px-3 py-2 rounded-lg border border-border disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => onMoveTopic(index, 1)}
                  disabled={index === topics.length - 1}
                  className="px-3 py-2 rounded-lg border border-border disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTopic(index)}
                  disabled={topics.length <= 3}
                  className="px-3 py-2 rounded-lg border border-secondary text-secondary disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button type="button" onClick={onAddTopic} disabled={topics.length >= 6} className="text-primary disabled:opacity-40">
            + Add Topic
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="action-button rounded-2xl px-8 py-4 font-bold inline-flex items-center gap-3 disabled:opacity-55"
          >
            {generating ? <span className="loader" /> : null}
            {generating ? 'Preparing Study Deck...' : 'Open Study Deck'}
          </button>
        </div>

        {error ? <p className="text-red-400 mt-4">{error}</p> : null}
      </div>
    </section>
  );
}
