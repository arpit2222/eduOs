import { useCallback, useEffect, useState } from 'react';
import Landing from './components/Landing';
import Upload from './components/Upload';
import TopicReview from './components/TopicReview';
import StudyMaterial from './components/StudyMaterial';
import Quiz from './components/Quiz';
import Results from './components/Results';
import WalletMint from './components/WalletMint';
import { extractStudyTopics, generateQuiz, generateStudyPage, getAiProviderSummary } from './lib/ai';
import { clearCurriculumCache, getCurriculum, setCurriculum } from './lib/storage';

function providerLabel(provider) {
  if (provider === 'dgrid') return 'DGrid AI Gateway';
  if (provider === 'azure') return 'Azure OpenAI';
  return 'Local fallback';
}

function buildPageShells(topics) {
  return topics.map((topic) => ({
    title: topic,
    studyMaterial: '',
    keyTakeaways: [],
    status: 'idle'
  }));
}

function serializeStudyMaterialPages(pages) {
  return pages
    .map((page, index) => {
      const body = page?.studyMaterial?.trim()
        ? page.studyMaterial
        : `This topic is queued for generation. Open page ${index + 1} to load its study note.`;
      return `Page ${index + 1}: ${page?.title || `Topic ${index + 1}`}\n\n${body}`;
    })
    .join('\n\n---\n\n');
}

export default function App() {
  const providerSummary = getAiProviderSummary();
  const [screen, setScreen] = useState('landing');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [curriculumText, setCurriculumText] = useState('');
  const [topics, setTopics] = useState([]);
  const [studyMaterial, setStudyMaterial] = useState('');
  const [studyPages, setStudyPages] = useState([]);
  const [studyPageIndex, setStudyPageIndex] = useState(0);
  const [quiz, setQuiz] = useState([]);
  const [result, setResult] = useState({ score: 0, total: 5, passed: false });
  const [aiProvider, setAiProvider] = useState(providerSummary.primary);
  const [loadingTopicIndex, setLoadingTopicIndex] = useState(-1);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const persistProgress = useCallback(
    (nextPages, nextQuiz = quiz, nextProvider = aiProvider) => {
      const payload = {
        studyMaterial: serializeStudyMaterialPages(nextPages),
        studyMaterialPages: nextPages,
        topics,
        quiz: nextQuiz,
        providerUsed: nextProvider
      };
      setCurriculum(selectedClass, selectedSubject, payload);
      return payload;
    },
    [aiProvider, quiz, selectedClass, selectedSubject, topics]
  );

  const loadTopicPage = useCallback(
    async (index) => {
      const topic = topics[index];
      if (!topic) return;

      const currentPage = studyPages[index];
      if (currentPage?.status === 'loading' || currentPage?.status === 'ready') {
        return;
      }

      setLoadingTopicIndex(index);
      setError('');
      setStudyPages((current) =>
        current.map((page, i) =>
          i === index
            ? {
                ...page,
                status: 'loading'
              }
            : page
        )
      );

      try {
        const loadedPage = await generateStudyPage({
          className: selectedClass,
          subject: selectedSubject,
          topic,
          content: curriculumText,
          index,
          apiKey: import.meta.env.VITE_AZURE_OPENAI_KEY || '',
          endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
          deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || '',
          apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
          dgridApiKey: import.meta.env.VITE_DGRID_API_KEY || '',
          dgridModel: import.meta.env.VITE_DGRID_MODEL || ''
        });

        setStudyPages((current) => {
          const nextPages = current.map((page, i) => (i === index ? loadedPage : page));
          persistProgress(nextPages, quiz, loadedPage.providerUsed || aiProvider || providerSummary.primary);
          return nextPages;
        });
        setAiProvider(loadedPage.providerUsed || aiProvider || providerSummary.primary);
      } catch (err) {
        setStudyPages((current) =>
          current.map((page, i) =>
            i === index
              ? {
                  ...page,
                  status: 'error'
                }
              : page
          )
        );
        setError(err.message || 'Topic generation failed.');
      } finally {
        setLoadingTopicIndex(-1);
      }
    },
    [aiProvider, curriculumText, persistProgress, providerSummary.primary, quiz, selectedClass, selectedSubject, studyPages, topics]
  );

  useEffect(() => {
    if (screen !== 'study') return;
    if (!studyPages.length) return;
    const currentPage = studyPages[studyPageIndex];
    if (!currentPage) return;
    if (currentPage.status === 'ready' || currentPage.status === 'loading') return;
    void loadTopicPage(studyPageIndex);
  }, [loadTopicPage, screen, studyPageIndex, studyPages]);

  const handleBegin = async () => {
    setError('');
    if (!selectedClass || !selectedSubject) {
      setError('Select class and subject first.');
      return;
    }

    setChecking(true);
    try {
      const existing = getCurriculum(selectedClass, selectedSubject);
      if (existing) {
        setStudyMaterial(existing.studyMaterial);
        setStudyPages(
          (existing.studyMaterialPages || []).map((page, index) => ({
            title: page.title || `Topic ${index + 1}`,
            studyMaterial: page.studyMaterial || '',
            keyTakeaways: Array.isArray(page.keyTakeaways) ? page.keyTakeaways : [],
            status: page.status || (page.studyMaterial ? 'ready' : 'idle'),
            providerUsed: page.providerUsed || existing.providerUsed || providerSummary.primary
          }))
        );
        setStudyPageIndex(0);
        setTopics(existing.topics || []);
        setQuiz(existing.quiz || []);
        setAiProvider(existing.providerUsed || providerSummary.primary);
        setScreen('study');
        return;
      }

      setScreen('upload');
    } catch {
      setError('Failed to read local curriculum cache.');
    } finally {
      setChecking(false);
    }
  };

  const handleAnalyze = async ({ className, subject, type, content, fallbackText, apiKey, endpoint, deployment, apiVersion }) => {
    setGenerating(true);
    setError('');

    try {
      const curriculumSource = type === 'pdf' ? fallbackText || content : content;
      setCurriculumText(curriculumSource);
      const extractedTopics = await extractStudyTopics({
        className,
        subject,
        content: curriculumSource,
        fallbackText,
        apiKey,
        endpoint,
        deployment,
        apiVersion,
        dgridApiKey: import.meta.env.VITE_DGRID_API_KEY || '',
        dgridModel: import.meta.env.VITE_DGRID_MODEL || ''
      });

      setTopics(extractedTopics.topics);
      setAiProvider(extractedTopics.providerUsed || providerSummary.primary);
      setScreen('review');
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const handleStartStudy = async () => {
    setGenerating(true);
    setError('');

    try {
      const shells = buildPageShells(topics);
      setStudyMaterial(serializeStudyMaterialPages(shells));
      setStudyPages(shells);
      setStudyPageIndex(0);
      setQuiz([]);
      persistProgress(shells, [], aiProvider || providerSummary.primary);
      setScreen('study');
    } catch (err) {
      setError(err.message || 'Failed to prepare study pages.');
      setScreen('review');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const handleTakeQuiz = async () => {
    setError('');
    if (!quiz.length) {
      setLoadingQuiz(true);
      try {
        const readyPages = studyPages.filter((page) => page?.studyMaterial);
        const quizPack = await generateQuiz({
          className: selectedClass,
          subject: selectedSubject,
          studyPages: readyPages.length ? readyPages : buildPageShells(topics),
          content: curriculumText,
          apiKey: import.meta.env.VITE_AZURE_OPENAI_KEY || '',
          endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
          deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || '',
          apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
          dgridApiKey: import.meta.env.VITE_DGRID_API_KEY || '',
          dgridModel: import.meta.env.VITE_DGRID_MODEL || ''
        });
        setQuiz(quizPack.quiz);
        setAiProvider(quizPack.providerUsed || aiProvider || providerSummary.primary);
        persistProgress(studyPages, quizPack.quiz, quizPack.providerUsed || aiProvider || providerSummary.primary);
      } catch (err) {
        setError(err.message || 'Quiz generation failed.');
        setLoadingQuiz(false);
        return;
      } finally {
        setLoadingQuiz(false);
      }
    }

    setScreen('quiz');
  };

  const handleQuizFinish = (answers) => {
    const score = quiz.reduce((acc, q, i) => (q.correct === answers[i] ? acc + 1 : acc), 0);
    const total = quiz.length;
    const passed = score >= 3;

    setResult({ score, total, passed });
    setScreen('results');
  };

  return (
    <main className="app-shell">
      <div className="animated-grid" />
      <button
        type="button"
        onClick={() => {
          clearCurriculumCache();
          setScreen('landing');
          setSelectedClass('');
          setSelectedSubject('');
          setCurriculumText('');
          setTopics([]);
          setStudyMaterial('');
          setStudyPages([]);
          setStudyPageIndex(0);
          setQuiz([]);
          setResult({ score: 0, total: 5, passed: false });
          setAiProvider(providerSummary.primary);
          setError('');
          setLoadingTopicIndex(-1);
          setLoadingQuiz(false);
        }}
        className="fixed top-4 right-4 z-20 rounded-full border border-primary/50 bg-black/70 px-4 py-2 text-xs font-semibold text-primary backdrop-blur hover:bg-primary/10"
      >
        Clear Local Cache
      </button>

      {screen === 'landing' ? (
        <Landing
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          onSelectClass={setSelectedClass}
          onSelectSubject={setSelectedSubject}
          onContinue={handleBegin}
          loading={checking}
          error={error}
        />
      ) : null}

      {screen === 'upload' ? (
        <Upload
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          onGenerate={handleAnalyze}
          generating={generating}
          error={error}
          aiProviderLabel={providerSummary.primaryLabel}
          aiFallbackLabel={providerSummary.fallbackLabel}
        />
      ) : null}

      {screen === 'review' ? (
        <TopicReview
          className={selectedClass}
          subject={selectedSubject}
          topics={topics}
          onChangeTopic={(index, value) =>
            setTopics((current) => current.map((topic, i) => (i === index ? value : topic)))
          }
          onMoveTopic={(index, direction) =>
            setTopics((current) => {
              const next = [...current];
              const target = index + direction;
              if (target < 0 || target >= next.length) return next;
              [next[index], next[target]] = [next[target], next[index]];
              return next;
            })
          }
          onDeleteTopic={(index) =>
            setTopics((current) => (current.length <= 3 ? current : current.filter((_, i) => i !== index)))
          }
          onAddTopic={() => setTopics((current) => [...current, 'New Topic'])}
          onGenerate={handleStartStudy}
          generating={generating}
          error={error}
          aiProviderLabel={providerLabel(aiProvider)}
        />
      ) : null}

      {screen === 'study' ? (
        <StudyMaterial
          className={selectedClass}
          subject={selectedSubject}
          studyMaterial={studyMaterial}
          studyPages={studyPages}
          pageIndex={studyPageIndex}
          topics={topics}
          loadingTopicIndex={loadingTopicIndex}
          onSelectTopic={setStudyPageIndex}
          onGenerateTopic={loadTopicPage}
          onPrevPage={() => setStudyPageIndex((index) => Math.max(0, index - 1))}
          onNextPage={() =>
            setStudyPageIndex((index) => Math.min(Math.max((studyPages.length || 1) - 1, 0), index + 1))
          }
          onTakeQuiz={handleTakeQuiz}
          aiProviderLabel={providerLabel(aiProvider)}
          loadingQuiz={loadingQuiz}
        />
      ) : null}

      {screen === 'quiz' ? (
        <Quiz quiz={quiz} onFinish={handleQuizFinish} onExit={() => setScreen('study')} />
      ) : null}

      {screen === 'results' ? (
        <Results
          score={result.score}
          total={result.total}
          passed={result.passed}
          onRetry={() => setScreen('quiz')}
          onClaim={() => setScreen('wallet')}
          aiProviderLabel={providerLabel(aiProvider)}
        />
      ) : null}

      {screen === 'wallet' ? <WalletMint onBack={() => setScreen('results')} aiProviderLabel={providerLabel(aiProvider)} /> : null}
    </main>
  );
}
