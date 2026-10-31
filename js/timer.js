/* ChronoPulse — ตรรกะนับถอยหลัง (Timer)
   อ้างอิงเวลาด้วย timestamp (Date.now) เพื่อให้แม่นยำแม้แท็บถูกซ่อน */

export class Timer {
  constructor() {
    /** สถานะ: idle | running | paused | finished */
    this.state = 'idle';
    this.configured = 0; // เวลาที่ผู้ใช้ตั้งไว้ (ค่าที่ Reset ต้องกลับไป)
    this.duration = 0; // เวลาอ้างอิงของวงแหวน (อาจมากกว่า configured ถ้าเพิ่มเวลา)
    this.remaining = 0; // เวลาที่เหลือ (ms)
    this._endTime = 0;
    this._timeout = null;
    /** callback เมื่อนับถอยหลังครบ */
    this.onFinish = null;
  }

  get isRunning() {
    return this.state === 'running';
  }

  /** เวลาที่เหลือ ณ ตอนนี้ (ms) */
  get current() {
    if (this.state === 'running') return Math.max(0, this._endTime - Date.now());
    return Math.max(0, this.remaining);
  }

  /** ความคืบหน้าของวงแหวน 0..1 (ลดลงเรื่อย ๆ) */
  get progress() {
    return this.duration > 0 ? this.current / this.duration : 0;
  }

  /** กำหนดเวลาใหม่ (ใช้ตอนตั้งค่า/รีเซ็ต ตอนไม่ได้ทำงาน) */
  configure(ms) {
    if (this.state === 'running') return;
    const value = Math.max(0, Math.round(ms));
    this.configured = value;
    this.duration = value;
    this.remaining = value;
    this.state = 'idle';
  }

  start() {
    if (this.state === 'running') return;
    if (this.state === 'finished' || this.remaining <= 0) {
      this.remaining = this.configured;
    }
    if (this.remaining <= 0) return;

    this._clearTimeout();
    this._endTime = Date.now() + this.remaining;
    this.state = 'running';
    // ตัวสำรอง: ถ้า rAF หยุดเพราะแท็บถูกซ่อน ยังมี timer ปลุกตอนจบเสมอ
    this._timeout = window.setTimeout(() => this._finish(), this.remaining);
  }

  pause() {
    if (this.state !== 'running') return;
    this.remaining = this.current;
    this.state = 'paused';
    this._clearTimeout();
  }

  reset() {
    this._clearTimeout();
    this.duration = this.configured;
    this.remaining = this.configured;
    this.state = 'idle';
  }

  /** เพิ่มเวลา (เช่น +1 นาที) */
  add(ms) {
    if (ms <= 0) return;
    if (this.state === 'running') {
      this._endTime += ms;
      this._clearTimeout();
      this._timeout = window.setTimeout(
        () => this._finish(),
        Math.max(0, this._endTime - Date.now())
      );
    } else {
      this.remaining += ms;
      if (this.state === 'finished') this.state = 'paused';
    }
    // ปรับส่วนของวงแหวนไม่ให้เกินขอบเมื่อเพิ่มเวลา
    this.duration = Math.max(this.duration, this.current, this.remaining);
  }

  _finish() {
    this._clearTimeout();
    this.remaining = 0;
    this.state = 'finished';
    if (typeof this.onFinish === 'function') this.onFinish();
  }

  _clearTimeout() {
    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
      this._timeout = null;
    }
  }
}
