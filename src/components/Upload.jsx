import { useMemo, useState } from 'react';
import { extractPdfText } from '../lib/pdf';

export default function Upload({ selectedClass, selectedSubject, onGenerate, generating, error, aiProviderLabel, aiFallbackLabel }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('eduos_azure_openai_key') || localStorage.getItem('edumeme_azure_openai_key') || import.meta.env.VITE_AZURE_OPENAI_KEY || ''
  );
  const [endpoint, setEndpoint] = useState(
    localStorage.getItem('eduos_azure_openai_endpoint') ||
      localStorage.getItem('edumeme_azure_openai_endpoint') ||
      import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ||
      ''
  );
  const [deployment, setDeployment] = useState(
    localStorage.getItem('eduos_azure_openai_deployment') ||
      localStorage.getItem('edumeme_azure_openai_deployment') ||
      import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT ||
      ''
  );
  const [apiVersion, setApiVersion] = useState(
    localStorage.getItem('eduos_azure_openai_api_version') ||
      localStorage.getItem('edumeme_azure_openai_api_version') ||
      import.meta.env.VITE_AZURE_OPENAI_API_VERSION ||
      '2024-12-01-preview'
  );
  const [localError, setLocalError] = useState('');

  const hasInput = useMemo(() => file || text.trim().length > 0, [file, text]);

  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped) return;

    if (dropped.type !== 'application/pdf') {
      setLocalError('Only PDF files are supported for upload.');
      return;
    }

    setLocalError('');
    setFile(dropped);
  };

  const handleGenerate = async () => {
    setLocalError('');

    if (!hasInput) {
      setLocalError('Upload a PDF or paste syllabus text.');
      return;
    }

    try {
      localStorage.setItem('eduos_azure_openai_key', apiKey.trim());
      localStorage.setItem('eduos_azure_openai_endpoint', endpoint.trim());
      localStorage.setItem('eduos_azure_openai_deployment', deployment.trim());
      localStorage.setItem('eduos_azure_openai_api_version', apiVersion.trim());
      localStorage.setItem('edumeme_azure_openai_key', apiKey.trim());
      localStorage.setItem('edumeme_azure_openai_endpoint', endpoint.trim());
      localStorage.setItem('edumeme_azure_openai_deployment', deployment.trim());
      localStorage.setItem('edumeme_azure_openai_api_version', apiVersion.trim());

      if (file) {
        const extractedText = await extractPdfText(file);
        await onGenerate({
          className: selectedClass,
          subject: selectedSubject,
          type: 'pdf',
          content: extractedText,
          fallbackText: extractedText,
          apiKey: apiKey.trim(),
          endpoint: endpoint.trim(),
          deployment: deployment.trim(),
          apiVersion: apiVersion.trim()
        });
      } else {
        await onGenerate({
          className: selectedClass,
          subject: selectedSubject,
          type: 'text',
          content: text,
          fallbackText: text,
          apiKey: apiKey.trim(),
          endpoint: endpoint.trim(),
          deployment: deployment.trim(),
          apiVersion: apiVersion.trim()
        });
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to generate study pack.');
    }
  };

  return (
    <section className="screen max-w-4xl mx-auto py-10">
      <div className="edu-card p-8">
        <h2 className="display-font text-4xl font-bold">Upload Curriculum</h2>
        <p className="text-muted mt-2">
          Class {selectedClass} • {selectedSubject}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full border border-primary/40 text-primary">
            Configured primary: {aiProviderLabel}
          </span>
          <span className="px-2 py-1 rounded-full border border-border text-muted">
            Fallback: {aiFallbackLabel}
          </span>
        </div>
        <p className="text-xs text-muted mt-2">
          First we extract topics from your syllabus. You can review and reorder them before generating study pages.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-sm text-muted">Azure OpenAI Endpoint</label>
            <input
              type="text"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder="https://dehix-openai-01.openai.azure.com"
              className="w-full mt-2 edu-card px-4 py-3 bg-black/20 outline-none border border-border focus:border-primary"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted">Deployment Name</label>
              <input
                type="text"
                value={deployment}
                onChange={(event) => setDeployment(event.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full mt-2 edu-card px-4 py-3 bg-black/20 outline-none border border-border focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted">API Version</label>
              <input
                type="text"
                value={apiVersion}
                onChange={(event) => setApiVersion(event.target.value)}
                placeholder="2024-12-01-preview"
                className="w-full mt-2 edu-card px-4 py-3 bg-black/20 outline-none border border-border focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted">Azure OpenAI API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="your-azure-openai-key"
              className="w-full mt-2 edu-card px-4 py-3 bg-black/20 outline-none border border-border focus:border-primary"
            />
          </div>

          <p className="text-xs text-muted">
            DGrid AI Gateway is primary when configured. Azure OpenAI is the fallback if DGrid fails or is not set.
          </p>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="drop-zone edu-card mt-6 p-8 text-center"
        >
          <p className="display-font text-xl">Drag & Drop PDF Here</p>
          <p className="text-muted mt-2">or</p>
          <label className="inline-block mt-3 cursor-pointer glow-button rounded-xl px-5 py-2 font-semibold">
            Choose PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (!selected) return;
                setLocalError('');
                setFile(selected);
              }}
            />
          </label>
          {file ? <p className="mono text-sm mt-3 text-primary">{file.name}</p> : null}
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="mono text-sm text-muted">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste syllabus text here..."
          className="w-full min-h-52 rounded-2xl p-4 bg-black/20 border border-border focus:border-secondary outline-none resize-y"
        />

        {localError || error ? <p className="text-red-400 mt-4">{localError || error}</p> : null}

        <button
          type="button"
          disabled={!hasInput || generating}
          onClick={handleGenerate}
          className="action-button mt-6 rounded-2xl px-8 py-4 font-bold text-lg inline-flex items-center gap-3 disabled:opacity-55"
        >
          {generating ? <span className="loader" /> : null}
          {generating ? 'Analyzing Curriculum...' : 'Extract Topics'}
        </button>
      </div>
    </section>
  );
}
