const STORAGE_KEY = 'guestbook_entries_v2';

/** 여기 비번 바꾸면 됨 */
const MASTER_PASSWORD = '1234';

/** 탭 닫으면 풀리게 (세션 저장) */
const SESSION_KEY = 'guestbook_admin_unlocked_v1';

const gate = document.getElementById('gate');
const content = document.getElementById('content');

const pwForm = document.getElementById('pwForm');
const pwHint = document.getElementById('pwHint');
const lockBtn = document.getElementById('lockBtn');

const listEl = document.getElementById('list');
const countText = document.getElementById('countText');

const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

const filterButtons = Array.from(document.querySelectorAll('.chip'));
let currentFilter = 'all';

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDate(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  const yy = String(d.getFullYear()).slice(2);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

function escapeHTML(str) {
  return String(str).replace(
    /[&<>"']/g,
    (m) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[m],
  );
}

function labelTarget(t) {
  if (t === 'hyeonwoo') return 'Hyeonwoo';
  if (t === 'subin') return 'Subin';
  if (t === 'both') return 'Both';
  return '—';
}

function applyFilter(entries) {
  if (currentFilter === 'all') return entries;
  return entries.filter((e) => e.target === currentFilter);
}

function render() {
  const all = loadEntries();
  const filtered = applyFilter(all);

  if (countText) countText.textContent = String(filtered.length);

  if (!listEl) return;

  if (!filtered.length) {
    listEl.innerHTML = `<div class="empty">해당 조건의 방명록이 없어.</div>`;
    return;
  }

  listEl.innerHTML = filtered
    .map((e) => {
      const name = escapeHTML(e.name || 'Anonymous');
      const msg = escapeHTML(e.message || '');
      const date = formatDate(e.createdAt);
      const tag = escapeHTML(labelTarget(e.target));

      return `
      <div class="item">
        <div class="item__head">
          <div class="item__left">
            <div class="item__name">${name}</div>
            <div class="item__tag">${tag}</div>
          </div>
          <div class="item__date">${date}</div>
        </div>
        <div class="item__msg">${msg}</div>
      </div>
    `;
    })
    .join('');
}

function setUnlocked(on) {
  if (on) sessionStorage.setItem(SESSION_KEY, '1');
  else sessionStorage.removeItem(SESSION_KEY);

  const unlocked = sessionStorage.getItem(SESSION_KEY) === '1';

  if (gate) gate.classList.toggle('hidden', unlocked);
  if (content) content.classList.toggle('hidden', !unlocked);

  if (pwHint) pwHint.textContent = '';
  if (unlocked) render();
}

/* Password submit */
if (pwForm) {
  pwForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pwInput = pwForm.querySelector('#pw');
    const pw = (pwInput?.value || '').trim();

    if (pw === MASTER_PASSWORD) {
      setUnlocked(true);
      if (pwInput) pwInput.value = '';
    } else {
      if (pwHint) pwHint.textContent = '비번 틀림.';
    }
  });
}

/* Lock */
if (lockBtn) {
  lockBtn.addEventListener('click', () => {
    setUnlocked(false);
  });
}

/* Filters */
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter || 'all';
    filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    render();
  });
});

/* Export helpers */
function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const s = String(value ?? '');
  const needs = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needs ? `"${escaped}"` : escaped;
}

/* Download JSON */
if (downloadJsonBtn) {
  downloadJsonBtn.addEventListener('click', () => {
    const entries = loadEntries();
    const payload = {
      exportedAt: new Date().toISOString(),
      count: entries.length,
      entries,
    };
    downloadBlob(
      `guestbook_${Date.now()}.json`,
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8',
    );
  });
}

/* Download CSV */
if (downloadCsvBtn) {
  downloadCsvBtn.addEventListener('click', () => {
    const entries = loadEntries();

    const header = ['id', 'target', 'name', 'message', 'createdAt'];
    const rows = entries.map((e) =>
      [
        csvEscape(e.id),
        csvEscape(e.target),
        csvEscape(e.name),
        csvEscape(e.message),
        csvEscape(e.createdAt ? formatDate(e.createdAt) : ''),
      ].join(','),
    );

    const bom = '\uFEFF'; // 한글 깨짐 방지
    const csv = bom + header.join(',') + '\n' + rows.join('\n');

    downloadBlob(`guestbook_${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
  });
}

/* Init */
setUnlocked(sessionStorage.getItem(SESSION_KEY) === '1');
