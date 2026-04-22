function formatMaterial(raw) {
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<span class="key-concept">$1</span>')
    .split('\n\n')
    .map((chunk) => `<p>${chunk}</p>`)
    .join('');
}

export default function StudyMaterial({
  className,
  subject,
  studyMaterial,
  studyPages,
  pageIndex,
  topics,
  loadingTopicIndex,
  onSelectTopic,
  onGenerateTopic,
  onPrevPage,
  onNextPage,
  onTakeQuiz,
  aiProviderLabel,
  loadingQuiz
}) {
  const pages = Array.isArray(studyPages) && studyPages.length > 0 ? studyPages : [];
  const topicList = Array.isArray(topics) && topics.length > 0 ? topics : pages.map((page) => page.title);
  const currentPage = pages[pageIndex] || pages[0] || { title: 'Study Guide', studyMaterial: '', keyTakeaways: [] };
  const totalPages = pages.length || 1;
  const hasContent = Boolean(currentPage.studyMaterial && currentPage.studyMaterial.trim());
  const isGeneratingCurrent = loadingTopicIndex === pageIndex;

  return (
    <section className="screen max-w-5xl mx-auto pb-24">
      <div className="edu-card p-8 scroll-card leading-8 text-[1.04rem]">
        <p className="mono text-sm text-secondary">Class {className} • {subject}</p>
        <p className="mt-2 text-xs text-primary">Active AI: {aiProviderLabel}</p>
        <div className="flex items-start justify-between gap-4 mt-2 mb-6">
          <div>
            <h2 className="display-font text-4xl font-bold">Study Material</h2>
            <p className="mono text-sm text-muted mt-2">
              Page {Math.min(pageIndex + 1, totalPages)}/{totalPages}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={pageIndex <= 0}
              className="px-4 py-2 rounded-xl border border-border text-muted disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={pageIndex >= totalPages - 1}
              className="px-4 py-2 rounded-xl border border-primary text-primary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 mb-6">
          {topicList.map((topic, index) => {
            const page = pages[index];
            const status = page?.status || (page?.studyMaterial ? 'ready' : 'idle');
            const active = index === pageIndex;
            const ready = status === 'ready';
            return (
              <button
                key={`${topic}-${index}`}
                type="button"
                onClick={() => onSelectTopic(index)}
                className={`text-left rounded-2xl border p-4 transition ${
                  active ? 'border-primary bg-primary/10 shadow-glow' : 'border-border bg-black/20 hover:border-secondary'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-text">{topic}</span>
                  <span className={`mono text-[10px] px-2 py-1 rounded-full ${ready ? 'text-primary border border-primary/40' : 'text-muted border border-border'}`}>
                    {ready ? 'READY' : status === 'loading' ? 'LOADING' : 'OPEN'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="edu-card p-5 mb-5 bg-black/20 border border-border">
          <p className="mono text-xs text-muted">Topic</p>
          <h3 className="display-font text-2xl font-bold mt-2">{currentPage.title}</h3>
          {Array.isArray(currentPage.keyTakeaways) && currentPage.keyTakeaways.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-4">
              {currentPage.keyTakeaways.map((item) => (
                <span key={item} className="px-3 py-1 rounded-full border border-primary/40 text-primary text-xs">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {hasContent ? (
          <div
            className="space-y-4 text-text/95"
            dangerouslySetInnerHTML={{ __html: formatMaterial(currentPage.studyMaterial) }}
          />
        ) : (
          <div className="edu-card p-6 bg-black/20 border border-border">
            <p className="text-muted">
              This topic has not been generated yet. Open the topic card or press the button below to load a detailed study page.
            </p>
            <button
              type="button"
              onClick={() => onGenerateTopic(pageIndex)}
              disabled={isGeneratingCurrent}
              className="action-button mt-4 rounded-2xl px-6 py-3 font-bold inline-flex items-center gap-3 disabled:opacity-55"
            >
              {isGeneratingCurrent ? <span className="loader" /> : null}
              {isGeneratingCurrent ? 'Generating Topic...' : `Generate ${currentPage.title}`}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onTakeQuiz}
        disabled={loadingQuiz}
        className="fixed right-10 bottom-10 pulse glow-button px-8 py-4 rounded-2xl font-bold text-lg disabled:opacity-55"
      >
        {loadingQuiz ? 'Preparing Quiz...' : 'Take Quiz →'}
      </button>
    </section>
  );
}
