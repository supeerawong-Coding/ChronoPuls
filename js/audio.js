/* ChronoPulse — เสียงแจ้งเตือนเมื่อจบรอบ (Web Audio API) */

import { storage } from './utils.js';

const SOUND_KEY = 'chronopulse:sound';
let context = null;

export function isSoundOn() {
  return storage.get(SOUND_KEY, true) !== false;
}

export function setSoundOn(enabled) {
  storage.set(SOUND_KEY, Boolean(enabled));
}

function ensureContext() {
  if (!context) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      context = new Ctx();
    } catch {
      return null;
    }
  }
  if (context.state === 'suspended') {
    context.resume().catch(() => {});
  }
  return context;
}

/** เรียกตอนผู้ใช้โต้ตอบครั้งแรก เพื่อปลดล็อกเสียงในเบราว์เซอร์ */
export function primeAudio() {
  ensureContext();
}

function tone(ctx, at, frequency, duration, gainValue) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(gainValue, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}

/** ดัง 3 ครั้งเมื่อนับถอยหลังครบ */
export function playFinish() {
  if (!isSoundOn()) return;
  const ctx = ensureContext();
  if (!ctx) return;

  const start = ctx.currentTime + 0.03;
  const beeps = [0, 0.3, 0.6];
  beeps.forEach((offset, index) => {
    const frequency = index === beeps.length - 1 ? 1046.5 : 880;
    tone(ctx, start + offset, frequency, 0.24, 0.16);
  });
}
