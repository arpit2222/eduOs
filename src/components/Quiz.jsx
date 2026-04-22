import { useMemo, useState } from 'react';

export default function Quiz({ quiz, onFinish, onExit }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(quiz.length).fill(null));
  const [animKey, setAnimKey] = useState(0);

  const current = quiz[index];
  const selected = answers[index];
  const progress = ((index + 1) / quiz.length) * 100;

  const canNext = selected !== null;
  const isLast = index === quiz.length - 1;

  const questionCounter = useMemo(() => `${index + 1}/${quiz.length}`, [index, quiz.length]);

  const handleSelect = (optionIndex) => {
    const clone = [...answers];
    clone[index] = optionIndex;
    setAnswers(clone);
  };

  const handleNext = () => {
    if (!canNext) return;

    if (isLast) {
      onFinish(answers);
      return;
    }

    setAnimKey((k) => k + 1);
    setIndex((i) => i + 1);
  };

  return (
    <section className="screen max-w-4xl mx-auto py-8">
      <div className="edu-card p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="mono text-sm text-muted">Progress</span>
          <span className="mono text-sm text-primary">{questionCounter}</span>
        </div>
        <div className="h-3 rounded-full bg-black/30 overflow-hidden border border-border">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={animKey} className="edu-card p-8 animate-[fadeUp_300ms_ease]">
        <h2 className="display-font text-3xl font-bold leading-tight text-center">{current.question}</h2>

        <div className="grid gap-4 mt-8">
          {current.options.map((option, idx) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`quiz-option edu-card text-left p-4 border ${selected === idx ? 'selected' : ''}`}
            >
              <span className="mono text-xs text-muted">{String.fromCharCode(65 + idx)}.</span>
              <p className="mt-1">{option}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button type="button" onClick={onExit} className="text-muted hover:text-text">
            Exit Quiz
          </button>

          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className="glow-button px-6 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {isLast ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </section>
  );
}
