/* ChronoPulse — ฟังก์ชันช่วยเหลือทั่วไป */

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const pad = (value, length = 2) =>
  String(Math.max(0, Math.floor(value))).padStart(length, '0');

/** ฟอร์แมตเวลาจับเวลา -> { main: "MM:SS" หรือ "HH:MM:SS", fraction: ".CS" } */
export function formatStopwatch(ms) {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const centis = Math.floor((total % 1000) / 10);
  const main =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  return { main, fraction: `.${pad(centis)}` };
}

/** ฟอร์แมตเวลาแบบเต็ม (ใช้กับรอบ) เช่น 00:12.34 หรือ 01:02:03.45 */
export function formatFullTime(ms) {
  const { main, fraction } = formatStopwatch(ms);
  return main + fraction;
}

/** ฟอร์แมตเวลานับถอยหลัง (ปัดขึ้นเป็นวินาทีเสมอ เพื่อให้แสดง 00:00 ตอนจบ) */
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** อ่าน/เขียน localStorage แบบปลอดภัย (รองรับกรณีเบราว์เซอร์บล็อก) */
export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ไม่สามารถบันทึกได้ — ข้ามไป */
    }
  },
};

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
