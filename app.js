const STORAGE_KEY = 'guestbook_entries_v2';

let toastTimer = null;

function ensureToast() {
  let el = document.getElementById('toast');
  if (el) return el;

  // Create toast element
  el = document.createElement('div');
  el.id = 'toast';
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  document.body.appendChild(el);

  // Inject minimal CSS (so it works even if styles.css misses it)
  const styleId = 'toast-style';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
      .toast{
        position: fixed;
        left: 50%;
        bottom: calc(110px + env(safe-area-inset-bottom)); /* fixed submit 위로 */
        transform: translateX(-50%);
        z-index: 999999;

        padding: 12px 14px;
        background: #000;
        color: #fff;
        font-size: 13px;
        letter-spacing: .02em;

        opacity: 0;
        pointer-events: none;
        transition: opacity 600ms ease;
      }
      .toast.is-show{ opacity: 1; }
    `;
    document.head.appendChild(s);
  }

  return el;
}

function showToast(message, ms = 4000) {
  const toastEl = ensureToast();
  toastEl.textContent = message;

  if (toastTimer) clearTimeout(toastTimer);

  // restart animation
  toastEl.classList.remove('is-show');
  void toastEl.offsetWidth;
  toastEl.classList.add('is-show');

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('is-show');
  }, ms);
}

const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(message, ms = 4000) {
  if (!toastEl) return;

  toastEl.textContent = message;

  // 기존 타이머 있으면 초기화
  if (toastTimer) clearTimeout(toastTimer);

  // 다시 보여주기(연속 클릭 대비)
  toastEl.classList.remove('is-show');
  // reflow로 transition 확실히 먹이기
  void toastEl.offsetWidth;
  toastEl.classList.add('is-show');

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('is-show');
  }, ms);
}

/** 로고 URL */
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
  showToast('Submitted.', 4000);
});
