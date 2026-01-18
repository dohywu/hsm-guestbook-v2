const STORAGE_KEY = 'guestbook_entries_v2';

/** 로고 URL 넣으면 상단 중앙에 표시됨 */
const LOGO_SRC = 'https://dohywu.github.io/hsm-guestbook-v2/src/logo.png';

const form = document.getElementById('entryForm');
const hintText = document.getElementById('hintText');

const logoImg = document.getElementById('logoImg');
const logoFallback = document.getElementById('logoFallback');

// logo
if (LOGO_SRC && typeof LOGO_SRC === 'string' && LOGO_SRC.trim()) {
  logoImg.src = LOGO_SRC;
  logoImg.onload = () => {
    logoImg.style.display = 'block';
    logoFallback.style.display = 'none';
  };
  logoImg.onerror = () => {
    logoImg.style.display = 'none';
    logoFallback.style.display = 'block';
  };
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function makeId() {
  return 'e_' + Date.now() + '_' + Math.random().toString(16).slice(2);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const target = (form.target.value || '').trim();
  const name = (form.name.value || '').trim();
  const message = (form.message.value || '').trim();

  if (!target || !name || !message) {
    hintText.textContent = 'FOR / NAME / MESSAGE 다 입력해줘.';
    return;
  }

  if (name.length > 30) {
    hintText.textContent = '이름은 30자 이하로 부탁.';
    return;
  }
  if (message.length > 400) {
    hintText.textContent = '메시지는 400자 이하로 부탁.';
    return;
  }

  const entries = loadEntries();
  entries.unshift({
    id: makeId(),
    target, // hyeonwoo | subin | both
    name,
    message,
    createdAt: Date.now(),
  });

  saveEntries(entries);
  form.reset();
  form.target.value = 'hyeonwoo';
  hintText.textContent = 'Saved.';
});
