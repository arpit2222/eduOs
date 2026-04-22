const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
  'English'
];

export default function Landing({
  selectedClass,
  selectedSubject,
  onSelectClass,
  onSelectSubject,
  onContinue,
  onBack,
  loading,
  error
}) {
  return (
    <section className="screen max-w-4xl mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="edu-card p-8 md:p-10 w-full hero-panel">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="mono text-xs text-primary uppercase tracking-[0.24em]">Step 2</p>
            <h1 className="display-font text-5xl md:text-6xl font-bold mt-2">Choose the student lane</h1>
            <p className="text-muted mt-4 max-w-2xl leading-7">
              Select the class and subject you want to activate. EduOS will read the curriculum, break it into topics,
              generate detailed study material on demand, and activate the assessment and credential flow from there.
            </p>
          </div>
          <div className="token-pills">
            <span className="token-pill token-pill-primary">$LEARN</span>
            <span className="token-pill token-pill-secondary">Onchain profile</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="edu-card p-6 bg-black/20">
            <h2 className="display-font text-xl font-bold mb-4">Select Class</h2>
            <div className="grid grid-cols-4 gap-3">
              {CLASSES.map((classNo) => {
                const active = selectedClass === classNo;
                return (
                  <button
                    key={classNo}
                    type="button"
                    onClick={() => onSelectClass(classNo)}
                    className={`selector-card ${active ? 'selector-card-active' : ''}`}
                  >
                    {classNo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="edu-card p-6 bg-black/20">
            <h2 className="display-font text-xl font-bold mb-4">Select Subject</h2>
            <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {SUBJECTS.map((subject) => {
                const active = selectedSubject === subject;
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => onSelectSubject(subject)}
                    className={`selector-card selector-card-subject ${active ? 'selector-card-active selector-card-secondary' : ''}`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error ? <p className="text-red-400 mt-5 text-sm">{error}</p> : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedClass || !selectedSubject || loading}
            className="glow-button px-10 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <span className="loader" /> : null}
            {loading ? 'Checking curriculum...' : 'Start Learning'}
          </button>
          <button type="button" onClick={onBack} className="text-sm text-muted hover:text-text">
            Read the vision again
          </button>
        </div>
      </div>
    </section>
  );
}
