/* ChronoPulse — จัดการธีมมืด/สว่าง (บันทึกลง localStorage) */

import { $, storage } from './utils.js';

const THEME_KEY = 'chronopulse:theme';

function syncMetaColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#070a12' : '#eef1f8');
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  storage.set(THEME_KEY, theme);
  syncMetaColor(theme);

  const toggle = $('#theme-toggle');
  if (toggle) {
    toggle.setAttribute(
      'title',
      theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'
    );
  }
}

export function initTheme() {
  const saved = storage.get(THEME_KEY, null);
  const prefersLight =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial =
    saved === 'light' || saved === 'dark'
      ? saved
      : prefersLight
        ? 'light'
        : 'dark';

  applyTheme(initial);

  $('#theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}
