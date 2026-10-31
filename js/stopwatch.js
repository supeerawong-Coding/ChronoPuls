/* ChronoPulse — ตรรกะจับเวลา (Stopwatch) + บันทึกรอบ */

export class Stopwatch {
  constructor() {
    this.running = false;
    this.elapsed = 0; // เวลาที่สะสมจากการกดหยุดไปแล้ว (ms)
    this.startedAt = 0; // เวลาที่กดเริ่มต่อครั้งล่าสุด (performance.now)
    this.laps = []; // { index, split, total }
  }

  get isRunning() {
    return this.running;
  }

  /** เวลาทั้งหมด (ms) */
  get total() {
    return this.running ? this.elapsed + (performance.now() - this.startedAt) : this.elapsed;
  }

  start() {
    if (this.running) return;
    this.startedAt = performance.now();
    this.running = true;
  }

  pause() {
    if (!this.running) return;
    this.elapsed += performance.now() - this.startedAt;
    this.running = false;
  }

  toggle() {
    if (this.running) this.pause();
    else this.start();
  }

  reset() {
    this.pause();
    this.elapsed = 0;
    this.laps = [];
  }

  /** บันทึกหนึ่งรอบ — คืนค่ารอบที่เพิ่ม หรือ null ถ้าไม่ได้จับเวลาอยู่ */
  lap() {
    if (!this.running) return null;
    const total = this.total;
    const previous = this.laps.length ? this.laps[this.laps.length - 1].total : 0;
    const record = {
      index: this.laps.length + 1,
      split: total - previous,
      total,
    };
    this.laps.push(record);
    return record;
  }

  clearLaps() {
    this.laps = [];
  }
}
