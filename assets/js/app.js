// ApexLogic - app.js
// Shared storage, global header, student dialog, sound generator

// --- Storage with in-memory fallback ---
class SafeStorage {
  constructor() {
    this.memoryMap = new Map();
  }

  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return fallback;
      return JSON.parse(val);
    } catch (e) {
      return this.memoryMap.has(key) ? this.memoryMap.get(key) : fallback;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      this.memoryMap.set(key, value);
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      this.memoryMap.delete(key);
    }
  }
}

export const store = new SafeStorage();

// --- Sound effects (AudioContext) ---
let audioCtx = null;

export function playClick() {
  const soundPref = store.get('apexlogic.sound', 'off');
  if (soundPref !== 'on') return;

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.008);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.008);
  } catch (e) {
    // Ignore audio failures
  }
}

// --- Student Dialog ---
export function openStudentDialog(onSave) {
  let dialog = document.getElementById('student-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'student-dialog';
    dialog.className = 'app-dialog';
    dialog.innerHTML = `
      <h3 class="dialog-title">Student Details</h3>
      <p class="dialog-desc">Enter your lab details for the lab record</p>
      <form method="dialog" class="dialog-form" id="student-form">
        <div class="form-group">
          <label class="form-label" for="student-name">Full Name</label>
          <input class="form-input" id="student-name" type="text" placeholder="e.g. John Doe" autocomplete="name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="student-usn">USN / Roll No.</label>
          <input class="form-input" id="student-usn" type="text" placeholder="e.g. 1MS23CS001" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label" for="student-sem">Semester / Section</label>
          <input class="form-input" id="student-sem" type="text" placeholder="e.g. 1 / B" />
        </div>
        <div class="dialog-actions">
          <button type="button" class="btn btn-ghost" id="student-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);

    const cancelBtn = dialog.querySelector('#student-cancel-btn');
    cancelBtn.addEventListener('click', () => dialog.close());

    const form = dialog.querySelector('#student-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = dialog.querySelector('#student-name').value.trim();
      const usn = dialog.querySelector('#student-usn').value.trim();
      const sem = dialog.querySelector('#student-sem').value.trim();
      const data = { name, usn, sem };
      store.set('apexlogic.student', data);
      dialog.close();
      if (typeof onSave === 'function') onSave(data);
    });
  }

  const current = store.get('apexlogic.student', { name: '', usn: '', sem: '' });
  dialog.querySelector('#student-name').value = current.name || '';
  dialog.querySelector('#student-usn').value = current.usn || '';
  dialog.querySelector('#student-sem').value = current.sem || '';

  dialog.showModal();
}

function updateStudentChip(chipEl) {
  if (!chipEl) return;
  const data = store.get('apexlogic.student', null);
  chipEl.textContent = ''; // Avoid innerHTML for student data
  if (data && (data.name || data.usn)) {
    const text = [data.name, data.usn].filter(Boolean).join(' · ');
    chipEl.textContent = text;
  } else {
    chipEl.textContent = 'Add student details';
  }
}

// --- Global Header Renderer ---
const EXPERIMENT_TITLES = [
  { id: '01', title: 'Universal Gate Realization' },
  { id: '02', title: 'Half & Full Adder' },
  { id: '03', title: '4-to-1 Multiplexer' },
  { id: '04', title: 'BCD to 7-Segment Decoder' },
  { id: '05', title: '3-bit Ripple Counter' }
];

export function renderHeader(container, options = {}) {
  const { title = '', expId = '', mode = '', showActions = false, onReset = null } = options;

  container.className = 'app-header';
  container.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="brandmark">
        ApexLogic <span class="brand-suffix">v1</span>
      </a>
      ${title ? `<div class="header-exp-title">${title}</div>` : ''}
      <div class="header-spacer"></div>
      <div class="header-controls">
        <select class="exp-nav-select" aria-label="Experiment navigation">
          <option value="" disabled ${!expId ? 'selected' : ''}>Select experiment...</option>
          ${EXPERIMENT_TITLES.map(e => `
            <option value="${e.id}" ${e.id === expId ? 'selected' : ''}>${e.id} — ${e.title}</option>
          `).join('')}
        </select>
        <button class="student-chip" id="student-chip-btn" type="button" aria-label="Edit student details"></button>
        ${showActions ? `
          <button class="btn btn-ghost" id="reset-exp-btn" type="button">Reset</button>
          <a class="btn btn-primary" id="record-exp-btn" href="record.html?id=${expId}&mode=${mode}">Lab Record</a>
        ` : ''}
        <button class="sound-toggle-btn" id="sound-toggle-btn" type="button" title="Toggle sound" aria-label="Toggle sound">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path class="sound-waves" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Student chip setup
  const chipBtn = container.querySelector('#student-chip-btn');
  updateStudentChip(chipBtn);
  chipBtn.addEventListener('click', () => {
    openStudentDialog(() => updateStudentChip(chipBtn));
  });

  // Exp navigation select
  const navSelect = container.querySelector('.exp-nav-select');
  navSelect.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      window.location.href = `experiment.html?id=${selectedId}`;
    }
  });

  // Sound toggle
  const soundBtn = container.querySelector('#sound-toggle-btn');
  const soundWaves = soundBtn.querySelector('.sound-waves');
  const syncSoundUI = () => {
    const isSoundOn = store.get('apexlogic.sound', 'off') === 'on';
    if (isSoundOn) {
      soundBtn.classList.add('sound-on');
      soundWaves.style.display = 'block';
    } else {
      soundBtn.classList.remove('sound-on');
      soundWaves.style.display = 'none';
    }
  };
  syncSoundUI();

  soundBtn.addEventListener('click', () => {
    const current = store.get('apexlogic.sound', 'off');
    const next = current === 'on' ? 'off' : 'on';
    store.set('apexlogic.sound', next);
    syncSoundUI();
    if (next === 'on') playClick();
  });

  // Reset button action
  if (showActions && onReset) {
    const resetBtn = container.querySelector('#reset-exp-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', onReset);
    }
  }
}
