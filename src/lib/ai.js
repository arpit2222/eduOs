const CURRICULUM_SYSTEM_PROMPT = `You are an expert curriculum designer and educator. When given a syllabus 
or curriculum document, you will:
1. Generate exactly 5 multiple choice questions that test understanding, 
   not just memorization. Each question must have exactly 4 options 
   labeled A, B, C, D with exactly one correct answer.

Return ONLY valid JSON in this exact format:
{
  "studyMaterial": "full study summary here with **key concepts** in bold",
  "quiz": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0
    }
  ]
}`;

const TOPIC_SYSTEM_PROMPT = `You are an expert curriculum analyst for school exam preparation. You must extract the most important study topics from a curriculum.
Return ONLY valid JSON in this exact format:
{
  "topics": [
    "topic 1",
    "topic 2"
  ]
}

Rules:
- Return between 3 and 6 topics.
- Topics must be short, specific, and ordered from foundational to advanced.
- Prefer syllabus units, chapters, and exam-relevant subtopics over vague themes.
- Avoid duplicate or overlapping topics.
- Do not add extra commentary.`;

const TOPIC_SECTION_SYSTEM_PROMPT = `You are an expert curriculum designer and educator for class 6-12 exam prep.
Write one study page for a single topic from a curriculum.
Return ONLY valid JSON in this exact format:
{
  "title": "Topic title",
  "studyMaterial": "550-900 words of detailed explanation with **key concepts** in bold",
  "keyTakeaways": [
    "short takeaway 1",
    "short takeaway 2",
    "short takeaway 3"
  ]
}

Rules:
- Focus only on the given topic.
- Explain the topic in plain language with strong conceptual depth.
- Structure the page with sections equivalent to: Overview, Key Ideas, Worked Example, Exam Notes, Common Mistakes, Quick Revision.
- Include examples, formulas, proof sketches, application patterns, or memory hooks where useful.
- Make the page detailed enough that a student could revise the topic without needing the original syllabus in front of them.
- Do not add commentary outside the JSON.`;

const QUIZ_SYSTEM_PROMPT = `You are an expert curriculum designer and educator.
Create exactly 5 multiple choice questions from the study notes.
Return ONLY valid JSON in this exact format:
{
  "studyMaterial": "brief internal summary not used by the app",
  "quiz": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0
    }
  ]
}

Rules:
- Questions must test understanding, not memorization.
- Use school exam style wording where appropriate.
- Each question must have exactly 4 options.
- Exactly one option must be correct.
- Distractors should be plausible and require real understanding to eliminate.
- Prefer scenario-based, application-oriented questions over definition recall.
- Return only JSON.`;

function getAiProviderConfig(overrides = {}) {
  const dgridKey = (overrides.dgridApiKey || import.meta.env.VITE_DGRID_API_KEY || '').trim();
  const dgridModel = (overrides.dgridModel || import.meta.env.VITE_DGRID_MODEL || '').trim() || 'openai/gpt-4o-mini';
  const azureKey = (overrides.azureApiKey || import.meta.env.VITE_AZURE_OPENAI_KEY || '').trim();
  const azureEndpoint = (overrides.azureEndpoint || import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '').trim();
  const azureDeployment = (overrides.azureDeployment || import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || '').trim();
  const azureApiVersion =
    (overrides.azureApiVersion || import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '').trim() || '2024-12-01-preview';

  return {
    primary: dgridKey ? 'dgrid' : azureKey ? 'azure' : 'local',
    dgrid: {
      apiKey: dgridKey,
      model: dgridModel
    },
    azure: {
      apiKey: azureKey,
      endpoint: azureEndpoint,
      deployment: azureDeployment,
      apiVersion: azureApiVersion
    }
  };
}

export function getAiProviderSummary(overrides = {}) {
  const config = getAiProviderConfig(overrides);
  const primaryLabel =
    config.primary === 'dgrid' ? 'DGrid AI Gateway' : config.primary === 'azure' ? 'Azure OpenAI' : 'Local fallback';
  const fallbackLabel =
    config.primary === 'dgrid' && config.azure.apiKey
      ? 'Azure OpenAI fallback'
      : config.primary === 'azure' && config.dgrid.apiKey
        ? 'DGrid AI Gateway fallback'
        : 'Local fallback';

  return {
    primary: config.primary,
    primaryLabel,
    fallbackLabel
  };
}

function normalizeText(content) {
  return content.replace(/\s+/g, ' ').trim();
}

function safeJsonParse(text) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  const candidate = first >= 0 && last > first ? text.slice(first, last + 1) : text;
  return JSON.parse(candidate);
}

function normalizeAzureEndpoint(endpoint) {
  if (!endpoint) {
    return '';
  }

  const trimmed = endpoint.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/openai\/deployments\/.*$/i, '');
}

function validatePayload(payload) {
  if (!payload || typeof payload.studyMaterial !== 'string' || !Array.isArray(payload.quiz)) {
    throw new Error('AI response missing required structure.');
  }

  if (payload.quiz.length !== 5) {
    throw new Error('Quiz must have exactly 5 questions.');
  }

  payload.quiz.forEach((q, idx) => {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number') {
      throw new Error(`Invalid quiz item at index ${idx}.`);
    }
  });

  return payload;
}

function validateTopicList(payload) {
  if (!payload || !Array.isArray(payload.topics)) {
    throw new Error('AI topic response missing required structure.');
  }

  const topics = payload.topics
    .map((topic) => String(topic || '').trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!topics.length) {
    throw new Error('AI topic response returned no usable topics.');
  }

  return topics;
}

function validateStudyPage(payload, fallbackTitle) {
  if (!payload || typeof payload.studyMaterial !== 'string') {
    throw new Error('AI study page response missing studyMaterial.');
  }

  return {
    title: String(payload.title || fallbackTitle || 'Topic').trim(),
    studyMaterial: payload.studyMaterial.trim(),
    keyTakeaways: Array.isArray(payload.keyTakeaways)
      ? payload.keyTakeaways.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 5)
      : []
  };
}

async function callAzureOpenAI({ className, subject, content, endpoint, deployment, apiVersion, apiKey }) {
  const baseEndpoint = normalizeAzureEndpoint(endpoint);
  if (!baseEndpoint || !deployment || !apiKey) {
    throw new Error('Azure OpenAI endpoint, deployment, and API key are required.');
  }

  const url = `${baseEndpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion || '2024-12-01-preview')}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CURRICULUM_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Class: ${className}\nSubject: ${subject}\nReturn JSON only. Generate study material and quiz from this curriculum.\n\nCurriculum:\n${content}`
        }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure OpenAI error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0] || {};
  const text = Array.isArray(choice?.message?.content)
    ? choice.message.content.map((part) => part?.text || '').join('\n')
    : choice?.message?.content || '';

  if (choice.finish_reason === 'length') {
    throw new Error('Azure OpenAI response was truncated. Increase max_tokens or shorten the input.');
  }

  const parsed = safeJsonParse(text);
  return validatePayload(parsed);
}

async function callDGridOpenAI({ prompt, model, apiKey }) {
  if (!apiKey || !model) {
    throw new Error('DGrid API key and model are required.');
  }

  const response = await fetch('https://api.dgrid.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'EduOS'
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DGrid AI Gateway error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0] || {};
  const text = Array.isArray(choice?.message?.content)
    ? choice.message.content.map((part) => part?.text || '').join('\n')
    : choice?.message?.content || '';

  if (choice.finish_reason === 'length') {
    throw new Error('DGrid response was truncated. Increase max_tokens or shorten the input.');
  }

  return safeJsonParse(text);
}

async function callAzureJsonOpenAI({ prompt, endpoint, deployment, apiVersion, apiKey }) {
  const baseEndpoint = normalizeAzureEndpoint(endpoint);
  if (!baseEndpoint || !deployment || !apiKey) {
    throw new Error('Azure OpenAI endpoint, deployment, and API key are required.');
  }

  const url = `${baseEndpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion || '2024-12-01-preview')}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      temperature: 0.2,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure OpenAI error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0] || {};
  const text = Array.isArray(choice?.message?.content)
    ? choice.message.content.map((part) => part?.text || '').join('\n')
    : choice?.message?.content || '';

  if (choice.finish_reason === 'length') {
    throw new Error('Azure OpenAI response was truncated. Increase max_tokens or shorten the input.');
  }

  return safeJsonParse(text);
}

async function callWithFallback({ prompt, azure, dgrid }) {
  if (dgrid.apiKey) {
    try {
      const payload = await callDGridOpenAI({ prompt, model: dgrid.model, apiKey: dgrid.apiKey });
      return { payload, providerUsed: 'dgrid' };
    } catch (error) {
      console.warn('DGrid failed, falling back to Azure/local:', error.message);
    }
  }

  if (azure.apiKey && azure.endpoint && azure.deployment) {
    const payload = await callAzureJsonOpenAI({
      endpoint: azure.endpoint,
      deployment: azure.deployment,
      apiVersion: azure.apiVersion,
      apiKey: azure.apiKey,
      prompt
    });
    return { payload, providerUsed: 'azure' };
  }

  throw new Error('No AI provider configured.');
}

async function extractTopicsFromProvider({ className, subject, content, providerConfig, fallbackText }) {
  const curriculumText = fallbackText || content || `${subject} for class ${className}`;
  const { payload, providerUsed } = await callWithFallback({
    prompt: {
      system: TOPIC_SYSTEM_PROMPT,
      user: `Class: ${className}\nSubject: ${subject}\nCurriculum:\n${curriculumText}`
    },
    azure: providerConfig.azure,
    dgrid: providerConfig.dgrid
  });

  return validateTopicList(payload);
}

async function generateStudyPageFromProvider({ className, subject, topic, content, providerConfig }) {
  const curriculumText = content || `${subject} for class ${className}`;
  const { payload, providerUsed } = await callWithFallback({
    prompt: {
      system: TOPIC_SECTION_SYSTEM_PROMPT,
      user: `Class: ${className}\nSubject: ${subject}\nTopic: ${topic}\nCurriculum context:\n${curriculumText}\n\nWrite the study page for this topic.`
    },
    azure: providerConfig.azure,
    dgrid: providerConfig.dgrid
  });

  return {
    page: validateStudyPage(payload, topic),
    providerUsed
  };
}

async function generateQuizFromProvider({ className, subject, notes, providerConfig }) {
  const { payload, providerUsed } = await callWithFallback({
    prompt: {
      system: QUIZ_SYSTEM_PROMPT,
      user: `Class: ${className}\nSubject: ${subject}\nStudy notes:\n${notes}`
    },
    azure: providerConfig.azure,
    dgrid: providerConfig.dgrid
  });

  return {
    ...validatePayload({
      studyMaterial: String(payload.studyMaterial || 'Quiz preparation notes').trim(),
      quiz: Array.isArray(payload.quiz) ? payload.quiz : []
    }),
    providerUsed
  };
}

function pickTopTerms(rawText, count = 12) {
  const stop = new Set([
    'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'your', 'into', 'about',
    'where', 'when', 'what', 'which', 'while', 'their', 'there', 'these', 'those', 'were',
    'being', 'each', 'also', 'than', 'such', 'will', 'would', 'could', 'should', 'class',
    'subject', 'chapter', 'topic', 'topics', 'students', 'learning', 'study', 'understand'
  ]);

  const words = normalizeText(rawText)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w));

  const freq = new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

function localGenerate({ className, subject, fallbackText }) {
  const text = normalizeText(fallbackText || `${subject} concepts for class ${className}`);
  const concepts = pickTopTerms(text);
  const fallbackTopics = concepts.length >= 3 ? concepts.slice(0, 5) : [`${subject} Foundations`, `${subject} Applications`, `${subject} Revision`];
  const studyMaterialPages = fallbackTopics.map((topic, index) => ({
    title: topic,
    studyMaterial: `Page ${index + 1}: ${topic}\n\n**Overview**\nFor Class ${className} ${subject}, this section explains ${topic.toLowerCase()} in a way that focuses on understanding, not memorization. Start by identifying the core rule, idea, or process, then ask how it connects to the rest of the syllabus.\n\n**Key Ideas**\nThe main goal is to recognize what ${topic} looks like in a question, how it is defined, and how it is applied in a different context. Strong students do not stop at the definition; they test the idea with examples, counterexamples, and short recall checks.\n\n**Worked Example**\nImagine a typical exam question on ${topic}. First identify the keyword in the question, then match it to the correct concept, and finally state the answer in one clear line. If the topic is formula-based, write the formula first and then substitute values carefully.\n\n**Exam Notes**\nTeachers often test ${topic} using application-based wording, mixed concepts, or small twists in phrasing. Keep track of the exact terms used in the syllabus and avoid confusing them with similar ideas.\n\n**Common Mistakes**\nStudents usually lose marks when they confuse definitions, skip steps, or memorize examples without understanding the rule behind them.\n\n**Quick Revision**\nExplain ${topic} in your own words, solve one related question, and list one real-life or syllabus-based example before moving to the next page.\n\n**Key Concepts:** ${topic}, Understanding, Application, Revision`,
    keyTakeaways: [
      `${topic} is a core part of the syllabus`,
      'Explain it in your own words',
      'Apply it to at least one example'
    ]
  }));

  const fallbackConcepts = concepts.length >= 5 ? concepts : ['Concept Mapping', 'Reasoning', 'Application', 'Practice', 'Revision'];
  const quiz = fallbackConcepts.slice(0, 5).map((concept, i) => ({
    question: `In Class ${className} ${subject}, what is the best way to apply ${concept}?`,
    options: [
      `Use ${concept} only for memorizing definitions without examples`,
      `Connect ${concept} to related ideas and practice with mixed questions`,
      `Skip ${concept} and revise only solved answers`,
      `Study ${concept} one day before the exam only`
    ],
    correct: 1
  }));

  return validatePayload({
    studyMaterial: studyMaterialPages.map((page) => `${page.title}\n\n${page.studyMaterial}`).join('\n\n---\n\n'),
    quiz,
    studyMaterialPages
  });
}

function localTopics({ subject, fallbackText }) {
  const concepts = pickTopTerms(fallbackText || subject, 6);
  const topics = concepts.length >= 3 ? concepts.slice(0, 5) : [`${subject} Foundations`, `${subject} Applications`, `${subject} Revision`];
  return [...new Set(topics)].slice(0, 6);
}

function localStudyPage({ className, subject, topic, index }) {
  return {
    title: topic,
    studyMaterial: `Page ${index + 1}: ${topic}\n\n**Overview**\nFor Class ${className} ${subject}, this topic is taught as a standalone study unit. The first step is to understand the central idea, then see how it appears in questions, examples, and revision notes.\n\n**Key Ideas**\nFocus on the definition, the reasoning behind the rule, and the way the concept connects to other parts of the syllabus. If there is a formula, process, or sequence, learn the logic before you memorize the steps.\n\n**Worked Example**\nTake one standard exam question on ${topic}. Identify the clue, choose the correct method, and write the answer in a clean sequence. This helps you avoid careless mistakes under time pressure.\n\n**Exam Notes**\nThe most common pattern is that examiners mix ${topic} with a related chapter or change the wording slightly. Understanding the concept deeply is better than memorizing a line from the textbook.\n\n**Common Mistakes**\nStudents often confuse similar terms, skip intermediate steps, or revise too late. A short daily recall cycle works better than passive rereading.\n\n**Quick Revision**\nIf you can explain ${topic} in simple language, solve one question, and give one example from the syllabus, you are ready to continue.\n\n**Key Concepts:** ${topic}, Understanding, Application, Revision`,
    keyTakeaways: [
      `${topic} is a core study unit`,
      'Use active recall after reading',
      'Apply it to one example'
    ]
  };
}

function localQuiz({ className, subject, fallbackText }) {
  const fallbackConcepts = pickTopTerms(fallbackText || `${subject} for class ${className}`, 5);
  const quizTerms = fallbackConcepts.length >= 5 ? fallbackConcepts : ['Concept Mapping', 'Reasoning', 'Application', 'Practice', 'Revision'];

  return validatePayload({
    studyMaterial: `Quiz prep for ${className} ${subject}\n\nFocus on how the ideas connect across topics, where the tricky distinctions are, and which option is correct for the right reason.`,
    quiz: quizTerms.map((concept) => ({
      question: `Which approach best shows real understanding of ${concept} in Class ${className} ${subject}?`,
      options: [
        `Memorize ${concept} without examples or application`,
        `Connect ${concept} to related ideas, practice questions, and reasoning`,
        `Skip ${concept} until the night before the exam`,
        `Study ${concept} only as isolated facts with no context`
      ],
      correct: 1
    }))
  });
}

export async function extractStudyTopics({
  className,
  subject,
  content,
  fallbackText,
  apiKey,
  endpoint,
  deployment,
  apiVersion,
  dgridApiKey,
  dgridModel
}) {
  const providerConfig = getAiProviderConfig({
    azureApiKey: apiKey,
    azureEndpoint: endpoint,
    azureDeployment: deployment,
    azureApiVersion: apiVersion,
    dgridApiKey,
    dgridModel
  });
  const curriculumText = fallbackText || content || `${subject} for class ${className}`;

  if (providerConfig.primary !== 'local') {
    try {
      const { payload, providerUsed } = await callWithFallback({
        prompt: {
          system: TOPIC_SYSTEM_PROMPT,
          user: `Class: ${className}\nSubject: ${subject}\nCurriculum:\n${curriculumText}`
        },
        azure: providerConfig.azure,
        dgrid: providerConfig.dgrid
      });

      return {
        topics: validateTopicList(payload),
        providerUsed
      };
    } catch (error) {
      console.warn('Topic extraction failed, falling back to local topics:', error.message);
    }
  }

  return {
    topics: localTopics({ subject, fallbackText: curriculumText }),
    providerUsed: 'local'
  };
}

export async function generateStudyPages({
  className,
  subject,
  topics,
  content,
  onProgress,
  apiKey,
  endpoint,
  deployment,
  apiVersion,
  dgridApiKey,
  dgridModel
}) {
  const providerConfig = getAiProviderConfig({
    azureApiKey: apiKey,
    azureEndpoint: endpoint,
    azureDeployment: deployment,
    azureApiVersion: apiVersion,
    dgridApiKey,
    dgridModel
  });
  const curriculumText = content || `${subject} for class ${className}`;
  const pages = [];

  for (let i = 0; i < topics.length; i += 1) {
    const topic = topics[i];
    if (typeof onProgress === 'function') {
      onProgress(i + 1, topics.length, topic);
    }

    if (providerConfig.primary !== 'local') {
      try {
        const result = await generateStudyPageFromProvider({
          className,
          subject,
          topic,
          content: curriculumText,
          providerConfig
        });
        pages.push(result.page);
        if (result.providerUsed) {
          pages.providerUsed = result.providerUsed;
        }
        continue;
      } catch (error) {
        console.warn(`AI page failed for "${topic}", using local fallback:`, error.message);
      }
    }

    pages.push(localStudyPage({ className, subject, topic, index: i }));
  }

  return {
    pages,
    providerUsed:
      pages.providerUsed ||
      (providerConfig.primary === 'dgrid' ? 'dgrid' : providerConfig.primary === 'azure' ? 'azure' : 'local')
  };
}

export async function generateStudyPage({
  className,
  subject,
  topic,
  content,
  index = 0,
  apiKey,
  endpoint,
  deployment,
  apiVersion,
  dgridApiKey,
  dgridModel
}) {
  const providerConfig = getAiProviderConfig({
    azureApiKey: apiKey,
    azureEndpoint: endpoint,
    azureDeployment: deployment,
    azureApiVersion: apiVersion,
    dgridApiKey,
    dgridModel
  });

  if (providerConfig.primary !== 'local') {
    try {
      const result = await generateStudyPageFromProvider({
        className,
        subject,
        topic,
        content,
        providerConfig
      });
      return {
        ...result.page,
        status: 'ready',
        providerUsed: result.providerUsed || providerConfig.primary
      };
    } catch (error) {
      console.warn(`AI page failed for "${topic}", using local fallback:`, error.message);
    }
  }

  return {
    ...localStudyPage({ className, subject, topic, index }),
    status: 'ready',
    providerUsed: 'local'
  };
}

export async function generateQuiz({
  className,
  subject,
  studyPages,
  content,
  apiKey,
  endpoint,
  deployment,
  apiVersion,
  dgridApiKey,
  dgridModel
}) {
  const providerConfig = getAiProviderConfig({
    azureApiKey: apiKey,
    azureEndpoint: endpoint,
    azureDeployment: deployment,
    azureApiVersion: apiVersion,
    dgridApiKey,
    dgridModel
  });
  const notes = [
    ...studyPages.map((page) => `${page.title}\n${page.studyMaterial}`),
    content || ''
  ].join('\n\n');

  if (providerConfig.primary !== 'local') {
    try {
      const quiz = await generateQuizFromProvider({
        className,
        subject,
        notes,
        providerConfig
      });
      return {
        ...quiz,
        providerUsed: providerConfig.primary
      };
    } catch (error) {
      console.warn('Quiz generation failed, falling back to local quiz:', error.message);
    }
  }

  return {
    ...localQuiz({ className, subject, fallbackText: notes }),
    providerUsed: 'local'
  };
}

export async function generateStudyPack({
  className,
  subject,
  type,
  content,
  fallbackText,
  apiKey,
  endpoint,
  deployment,
  apiVersion,
  dgridApiKey,
  dgridModel
}) {
  const curriculumText = type === 'pdf' ? (fallbackText || '') : content;
  const topicResult = await extractStudyTopics({
    className,
    subject,
    content: curriculumText,
    fallbackText,
    apiKey,
    endpoint,
    deployment,
    apiVersion,
    dgridApiKey,
    dgridModel
  });
  const pageResult = await generateStudyPages({
    className,
    subject,
    topics: topicResult.topics,
    content: curriculumText,
    apiKey,
    endpoint,
    deployment,
    apiVersion,
    dgridApiKey,
    dgridModel
  });
  const quizResult = await generateQuiz({
    className,
    subject,
    studyPages: pageResult.pages,
    content: curriculumText,
    apiKey,
    endpoint,
    deployment,
    apiVersion,
    dgridApiKey,
    dgridModel
  });

  return {
    studyMaterial: pageResult.pages.map((page, index) => `Page ${index + 1}: ${page.title}\n\n${page.studyMaterial}`).join('\n\n---\n\n'),
    studyMaterialPages: pageResult.pages,
    topics: topicResult.topics,
    quiz: quizResult.quiz,
    providerUsed: quizResult.providerUsed || pageResult.providerUsed || topicResult.providerUsed || 'local'
  };
}
