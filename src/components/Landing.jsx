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

export default function Landing({ selectedClass, selectedSubject, onSelectClass, onSelectSubject, onContinue, loading, error }) {
  return (
    <section className="screen max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center gap-8">
      <div className="text-center">
        <p className="mono text-sm text-secondary tracking-wider uppercase">EduOS Protocol</p>
        <h1 className="display-font text-6xl md:text-7xl font-bold mt-2">Learn. Quiz. Earn.</h1>
        <p className="text-muted mt-4 max-w-2xl mx-auto text-lg">
          Pick your class and subject, generate an AI study pack, pass the quiz, and claim onchain rewards.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="edu-card p-6">
          <h2 className="display-font text-xl font-bold mb-4">Select Class</h2>
          <div className="grid grid-cols-4 gap-3">
            {CLASSES.map((classNo) => {
              const active = selectedClass === classNo;
              return (
                <button
                  key={classNo}
                  type="button"
                  onClick={() => onSelectClass(classNo)}
                  className={`rounded-xl py-4 font-bold text-lg border transition ${
                    active
                      ? 'border-primary bg-primary/10 shadow-glow'
                      : 'border-border bg-black/20 hover:border-secondary'
                  }`}
                >
                  {classNo}
                </button>
              );
            })}
          </div>
        </div>

        <div className="edu-card p-6">
          <h2 className="display-font text-xl font-bold mb-4">Select Subject</h2>
          <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {SUBJECTS.map((subject) => {
              const active = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onSelectSubject(subject)}
                  className={`rounded-xl py-3 px-3 text-sm font-semibold border text-left transition ${
                    active
                      ? 'border-secondary bg-secondary/10 shadow-pulse'
                      : 'border-border bg-black/20 hover:border-primary'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? <p className="text-red-400 text-center">{error}</p> : null}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedClass || !selectedSubject || loading}
          className="glow-button px-10 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span className="loader" /> : null}
          {loading ? 'Checking curriculum...' : 'Start Learning'}
        </button>
      </div>
    </section>
  );
}
