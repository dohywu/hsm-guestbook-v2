const STORAGE_KEY = 'guestbook_entries_v2';

/** 로고 URL */
const LOGO_SRC = 'https://dohywu.github.io/hsm-guestbook-v2/src/logo.png';

const form = document.getElementById('entryForm');
const hintText = document.getElementById('hintText');

const logoImg = document.getElementById('logoImg');
const logoFallback = document.getElementById('logoFallback');

let toastTimer = null;

function showToast(message, ms = 4000) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;

  toastEl.textContent = message;

  if (toastTimer) clearTimeout(toastTimer);

  toastEl.classList.remove('is-show');
  void toastEl.offsetWidth; // reflow
  toastEl.classList.add('is-show');

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('is-show');
  }, ms);
}

// logo
if (LOGO_SRC && typeof LOGO_SRC === 'string' && LOGO_SRC.trim()) {
  logoImg.src = LOGO_SRC;
  logoImg.onload = () => {
    logoImg.style.display = 'block';
    if (logoFallback) logoFallback.style.display = 'none';
  };
  logoImg.onerror = () => {
    logoImg.style.display = 'none';
    if (logoFallback) logoFallback.style.display = 'block';
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

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const target = (form.target.value || '').trim();
    const name = (form.name.value || '').trim();
    const message = (form.message.value || '').trim();

    if (!target || !name || !message) {
      if (hintText) hintText.textContent = 'FOR / NAME / MESSAGE 다 입력해줘.';
      showToast('필수 항목을 입력해줘.', 2500);
      return;
    }

    if (name.length > 30) {
      if (hintText) hintText.textContent = '이름은 30자 이하로 부탁.';
      showToast('이름은 30자 이하로!', 2500);
      return;
    }

    if (message.length > 400) {
      if (hintText) hintText.textContent = '메시지는 400자 이하로 부탁.';
      showToast('메시지는 400자 이하로!', 2500);
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

    if (hintText) hintText.textContent = '';
    showToast('Submitted.', 4000);
  });
}
