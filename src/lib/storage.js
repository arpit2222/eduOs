const STORAGE_KEY = 'eduos_curriculum_cache_v1';
const LEGACY_STORAGE_KEY = 'edumeme_curriculum_cache_v1';

function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function makeKey(className, subject) {
  return `${className}::${subject}`;
}

export function getCurriculum(className, subject) {
  const store = getStore();
  return store[makeKey(className, subject)] || null;
}

export function setCurriculum(className, subject, payload) {
  const store = getStore();
  store[makeKey(className, subject)] = {
    ...payload,
    updatedAt: new Date().toISOString()
  };
  saveStore(store);
}

export function clearCurriculumCache() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}
