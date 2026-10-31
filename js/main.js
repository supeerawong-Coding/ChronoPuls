/* ChronoPulse — เชื่อมต่อ UI กับตรรกะนาฬิกา */

import { $, $$, clamp, formatStopwatch, formatFullTime, formatDuration, storage } from './utils.js';
import { initTheme } from './theme.js';
import { Ring } from './ring.js';
import { Stopwatch } from './stopwatch.js';
import { Timer } from './timer.js';
import * as audio from './audio.js';

const TIMER_SECONDS_KEY = 'chronopulse:timer-seconds';
const DEFAULT_TIMER_SECONDS = 300;
const IDLE_TITLE = 'ChronoPulse — นาฬิกาจับเวลา & นับถอยหลัง';

const STATUS_TEXT = {
  stopwatch: { ready: 'พร้อม', running: 'กำลังจับเวลา', paused: 'หยุดชั่วคราว' },
  timer: {
    idle: 'พร้อม',
    running: 'กำลังนับถอยหลัง',
    paused: 'หยุดชั่วคราว',
    finished: 'หมดเวลา!',
  },
};

const CAPTION_TEXT = {
  stopwatch: {
    ready: 'กดปุ่มเริ่ม หรือกด Space เพื่อเริ่ม',
    running: 'กด L เพื่อบันทึกรอบ · Space เพื่อหยุด',
    paused: 'กด Space เพื่อทำต่อ',
  },
  timer: {
    idle: 'ตั้งเวลาด้านล่างแล้วกดเริ่ม',
    running: 'Space เพื่อหยุด · +1 นาที เพื่อเพิ่มเวลา',
    paused: 'กด Space เพื่อทำต่อ',
    finished: 'เลือกเวลาใหม่เพื่อเริ่มอีกครั้ง',
  },
};

/* ---------- อ้างอิงอิลิเมนต์ ---------- */
const els = {
  tabsWrap: $('.mode-tabs'),
  tabs: $$('.mode-tab'),
  statusPill: $('#status-pill'),
  statusText: $('#status-text'),
  time: $('#time-display'),
  timeMain: $('#time-main'),
  timeFraction: $('#time-fraction'),
  caption: $('#time-caption'),
  swControls: $('#controls-stopwatch'),
  swToggle: $('#sw-toggle'),
  swToggleLabel: $('#sw-toggle-label'),
  swReset: $('#sw-reset'),
  swLap: $('#sw-lap'),
  tmControls: $('#controls-timer'),
  tmToggle: $('#tm-toggle'),
  tmToggleLabel: $('#tm-toggle-label'),
  tmReset: $('#tm-reset'),
  tmAdd: $('#tm-add'),
  setup: $('#timer-setup'),
  presets: $$('#timer-presets .chip'),
  inputHours: $('#input-hours'),
  inputMinutes: $('#input-minutes'),
  inputSeconds: $('#input-seconds'),
  laps: $('#laps'),
  lapsCount: $('#laps-count'),
  lapList: $('#lap-list'),
  lapsClear: $('#laps-clear'),
  lapsCopy: $('#laps-copy'),
  soundToggle: $('#sound-toggle'),
};

const ring = new Ring($('#ring'), $('#ring-progress'));
const stopwatch = new Stopwatch();
const timer = new Timer();

let mode = null; // 'stopwatch' | 'timer'
let rafId = null;
let lastTitle = '';

/* ---------- แสดงผล ---------- */
function setStatus(state, text) {
  if (els.statusPill.dataset.state !== state) els.statusPill.dataset.state = state;
  if (els.statusText.textContent !== text) els.statusText.textContent = text;
}

function updateTitle(display, running) {
  const next = running ? `${display} • ChronoPulse` : IDLE_TITLE;
  if (next !== lastTitle) {
    document.title = next;
    lastTitle = next;
  }
}

function renderStopwatch() {
  const ms = stopwatch.total;
  const { main, fraction } = formatStopwatch(ms);

  els.timeMain.textContent = main;
  els.timeFraction.textContent = fraction;
  els.time.classList.toggle('is-long', main.length >= 8);

  // วงแหวนกวาดครบรอบทุก ๆ 1 นาที เหมือนเข็มวินาที
  ring.setProgress((ms % 60000) / 60000);
  ring.setLow(false);

  const state = stopwatch.isRunning ? 'running' : ms > 0 ? 'paused' : 'ready';
  ring.setState(state);
  setStatus(state, STATUS_TEXT.stopwatch[state]);
  els.caption.textContent = CAPTION_TEXT.stopwatch[state];

  els.swToggle.dataset.state = stopwatch.isRunning ? 'running' : 'idle';
  els.swToggleLabel.textContent = stopwatch.isRunning ? 'หยุด' : ms > 0 ? 'ทำต่อ' : 'เริ่ม';
  els.swLap.disabled = !stopwatch.isRunning;
  els.swReset.disabled = ms === 0 && stopwatch.laps.length === 0;
  els.setup.hidden = true; // แผงตั้งเวลาเป็นของโหมดนับถอยหลังเท่านั้น

  updateTitle(`${main}${fraction}`, stopwatch.isRunning);
}

function renderTimer() {
  const ms = timer.current;
  const state = timer.state; // idle | running | paused | finished
  const visual = state === 'idle' ? 'ready' : state;
  const mainText = formatDuration(ms);

  els.timeMain.textContent = mainText;
  els.time.classList.toggle('is-long', mainText.length >= 8);
  ring.setProgress(timer.progress);
  ring.setState(visual);
  ring.setLow(state === 'running' && timer.duration > 0 && timer.progress <= 0.12);
  setStatus(visual, STATUS_TEXT.timer[state]);
  els.caption.textContent = CAPTION_TEXT.timer[state];

  els.setup.hidden = !(mode === 'timer' && (state === 'idle' || state === 'finished'));
  els.tmToggle.dataset.state = state === 'running' ? 'running' : 'idle';
  els.tmToggleLabel.textContent =
    state === 'running' ? 'หยุด' : state === 'paused' ? 'ทำต่อ' : 'เริ่ม';
  els.tmToggle.disabled = timer.duration <= 0;
  els.tmReset.disabled = state === 'idle';
  els.tmAdd.hidden = !(state === 'running' || state === 'paused');

  updateTitle(formatDuration(ms), state === 'running');
}

function render() {
  if (mode === 'stopwatch') renderStopwatch();
  else if (mode === 'timer') renderTimer();
}

/* ---------- ลูปอัปเดตด้วย requestAnimationFrame ---------- */
function loop() {
  rafId = requestAnimationFrame(loop);
  render();
}

function ensureLoop() {
  const active =
    (mode === 'stopwatch' && stopwatch.isRunning) || (mode === 'timer' && timer.isRunning);
  if (active && rafId === null) {
    rafId = requestAnimationFrame(loop);
  } else if (!active && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/* ---------- สลับโหมด ---------- */
function setMode(nextMode) {
  if (nextMode === mode) return;

  // ไม่ให้สองโหมดทำงานพร้อมกัน: โหมดที่กำลังวิ่งจะถูกหยุดชั่วคราว
  if (nextMode === 'timer' && stopwatch.isRunning) stopwatch.pause();
  if (nextMode === 'stopwatch' && timer.isRunning) timer.pause();

  mode = nextMode;
  els.tabsWrap.style.setProperty('--active', mode === 'stopwatch' ? '0' : '1');

  for (const tab of els.tabs) {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }

  els.swControls.hidden = mode !== 'stopwatch';
  els.tmControls.hidden = mode !== 'timer';
  els.timeFraction.hidden = mode !== 'stopwatch';

  renderLaps();
  render();
  ensureLoop();
}

/* ---------- การกระทำ: จับเวลา ---------- */
function toggleStopwatch() {
  audio.primeAudio();
  stopwatch.toggle();
  renderStopwatch();
  ensureLoop();
}

function resetStopwatch() {
  stopwatch.reset();
  renderLaps();
  renderStopwatch();
  ensureLoop();
}

function lapStopwatch() {
  if (!stopwatch.lap()) return;
  renderLaps();
  renderStopwatch();
}

/* ---------- การกระทำ: นับถอยหลัง ---------- */
function toggleTimer() {
  audio.primeAudio();
  if (timer.isRunning) timer.pause();
  else timer.start();
  renderTimer();
  ensureLoop();
}

function resetTimer() {
  timer.reset();
  renderTimer();
  ensureLoop();
}

function addOneMinute() {
  timer.add(60000);
  renderTimer();
  ensureLoop();
}

/* ---------- ตั้งค่าเวลา ---------- */
function readInputs() {
  const hours = clamp(parseInt(els.inputHours.value, 10) || 0, 0, 99);
  const minutes = clamp(parseInt(els.inputMinutes.value, 10) || 0, 0, 59);
  const seconds = clamp(parseInt(els.inputSeconds.value, 10) || 0, 0, 59);
  return hours * 3600 + minutes * 60 + seconds;
}

function setInputs(totalSeconds) {
  els.inputHours.value = String(Math.floor(totalSeconds / 3600));
  els.inputMinutes.value = String(Math.floor((totalSeconds % 3600) / 60));
  els.inputSeconds.value = String(totalSeconds % 60);
}

function syncPresetChips(totalSeconds) {
  for (const chip of els.presets) {
    chip.classList.toggle('is-active', Number(chip.dataset.seconds) === totalSeconds);
  }
}

function applyDuration(totalSeconds, { syncInputs = true } = {}) {
  timer.configure(totalSeconds * 1000);
  storage.set(TIMER_SECONDS_KEY, totalSeconds);
  if (syncInputs) setInputs(totalSeconds);
  syncPresetChips(totalSeconds);
  renderTimer();
}

/* ---------- รายการรอบ ---------- */
function makeBadge(text, kind) {
  const badge = document.createElement('em');
  badge.className = `lap-badge ${kind}`;
  badge.textContent = text;
  return badge;
}

function renderLaps() {
  const laps = stopwatch.laps;
  els.laps.hidden = !(mode === 'stopwatch' && laps.length > 0);
  els.lapsCount.textContent = String(laps.length);

  if (laps.length === 0) {
    els.lapList.replaceChildren();
    return;
  }

  let best = null;
  let worst = null;
  if (laps.length >= 2) {
    best = laps.reduce((a, b) => (b.split < a.split ? b : a));
    worst = laps.reduce((a, b) => (b.split > a.split ? b : a));
    if (best.split === worst.split) {
      best = null;
      worst = null;
    }
  }

  const fragment = document.createDocumentFragment();
  for (let i = laps.length - 1; i >= 0; i -= 1) {
    const lap = laps[i];

    const row = document.createElement('li');
    row.className = 'lap-row';

    const index = document.createElement('span');
    index.className = 'lap-index';
    index.textContent = `รอบที่ ${lap.index}`;

    const split = document.createElement('span');
    split.className = 'lap-split';
    split.append(`+${formatFullTime(lap.split)}`);
    if (best && lap === best) split.append(makeBadge('เร็วที่สุด', 'best'));
    if (worst && lap === worst) split.append(makeBadge('ช้าที่สุด', 'worst'));

    const total = document.createElement('span');
    total.className = 'lap-total';
    total.textContent = formatFullTime(lap.total);

    row.append(index, split, total);
    fragment.append(row);
  }

  els.lapList.replaceChildren(fragment);
}

function flashLabel(button, message) {
  const original = button.textContent;
  button.textContent = message;
  button.disabled = true;
  window.setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1600);
}

/* ---------- ผูกอีเวนต์ ---------- */
for (const tab of els.tabs) {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
}

els.tabsWrap.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  setMode(mode === 'stopwatch' ? 'timer' : 'stopwatch');
  const activeTab = els.tabs.find((tab) => tab.dataset.mode === mode);
  activeTab?.focus();
});

els.swToggle.addEventListener('click', toggleStopwatch);
els.swReset.addEventListener('click', resetStopwatch);
els.swLap.addEventListener('click', lapStopwatch);

els.tmToggle.addEventListener('click', toggleTimer);
els.tmReset.addEventListener('click', resetTimer);
els.tmAdd.addEventListener('click', addOneMinute);

for (const chip of els.presets) {
  chip.addEventListener('click', () => applyDuration(Number(chip.dataset.seconds)));
}

const onDurationInput = () => applyDuration(readInputs(), { syncInputs: false });
els.inputHours.addEventListener('input', onDurationInput);
els.inputMinutes.addEventListener('input', onDurationInput);
els.inputSeconds.addEventListener('input', onDurationInput);

// ตอนออกจากช่อง (blur) ให้ปรับค่าให้ตรง min/max ที่กำหนด
const onDurationChange = () => applyDuration(readInputs());
els.inputHours.addEventListener('change', onDurationChange);
els.inputMinutes.addEventListener('change', onDurationChange);
els.inputSeconds.addEventListener('change', onDurationChange);

els.lapsClear.addEventListener('click', () => {
  stopwatch.clearLaps();
  renderLaps();
  renderStopwatch();
});

els.lapsCopy.addEventListener('click', async () => {
  if (stopwatch.laps.length === 0) return;
  const lines = stopwatch.laps.map(
    (lap) =>
      `รอบที่ ${lap.index} | +${formatFullTime(lap.split)} | รวม ${formatFullTime(lap.total)}`
  );
  const text = `ChronoPulse — รอบที่บันทึก\n${lines.join('\n')}`;
  try {
    await navigator.clipboard.writeText(text);
    flashLabel(els.lapsCopy, 'คัดลอกแล้ว');
  } catch {
    flashLabel(els.lapsCopy, 'คัดลอกไม่สำเร็จ');
  }
});

els.soundToggle.addEventListener('click', () => {
  audio.setSoundOn(!audio.isSoundOn());
  syncSoundButton();
  if (audio.isSoundOn()) audio.primeAudio();
});

function syncSoundButton() {
  const on = audio.isSoundOn();
  els.soundToggle.setAttribute('aria-pressed', String(on));
  els.soundToggle.setAttribute('title', on ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน');
}

/* ---------- คีย์ลัด ---------- */
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

  const target = event.target;
  const isTyping =
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'));
  if (isTyping) return;

  if (event.code === 'Space') {
    // ปล่อยให้ปุ่มที่กำลังโฟกัสทำงานเองเมื่อกด Space
    if (target instanceof HTMLElement && target.closest('button, a')) return;
    event.preventDefault();
    if (mode === 'stopwatch') toggleStopwatch();
    else toggleTimer();
    return;
  }

  const key = event.key.toLowerCase();
  if (key === 'r') {
    if (mode === 'stopwatch') resetStopwatch();
    else resetTimer();
  } else if (key === 'l' && mode === 'stopwatch') {
    lapStopwatch();
  }
});

/* ---------- กลับมาที่แท็บ ให้แสดงเวลาล่าสุดทันที ---------- */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) render();
});

/* ---------- เริ่มต้น ---------- */
timer.onFinish = () => {
  audio.playFinish();
  renderTimer();
  ensureLoop();
};

initTheme();
syncSoundButton();

const savedSeconds = storage.get(TIMER_SECONDS_KEY, DEFAULT_TIMER_SECONDS);
const initialSeconds =
  typeof savedSeconds === 'number' && savedSeconds > 0
    ? Math.min(savedSeconds, 99 * 3600 + 59 * 60 + 59)
    : DEFAULT_TIMER_SECONDS;

setInputs(initialSeconds);
applyDuration(initialSeconds);

setMode('stopwatch');
