/* ChronoPulse — วงแหวนก้าวหน้า (Circular Progress Ring) */

import { clamp } from './utils.js';

export class Ring {
  /**
   * @param {HTMLElement} root อิลิเมนต์หลักของหน้าปัด (ใช้ data-state)
   * @param {SVGCircleElement} circle เส้นวงกลมที่แสดงความคืบหน้า
   */
  constructor(root, circle) {
    this.root = root;
    this.circle = circle;

    const radius = Number.parseFloat(circle.getAttribute('r')) || 160;
    this.circumference = 2 * Math.PI * radius;
    this.circle.style.strokeDasharray = `${this.circumference}`;
    this._low = null;
    this.setProgress(0);
  }

  /** ตั้งค่าความคืบหน้า 0..1 */
  setProgress(ratio) {
    const progress = clamp(ratio, 0, 1);
    this.circle.style.strokeDashoffset = `${this.circumference * (1 - progress)}`;
  }

  /** สถานะ: ready | running | paused | finished */
  setState(state) {
    if (this.root.dataset.state !== state) {
      this.root.dataset.state = state;
    }
  }

  /** เปิดโหมดสีเตือนเมื่อเวลาใกล้หมด */
  setLow(low) {
    if (this._low !== low) {
      this._low = low;
      this.root.classList.toggle('is-low', low);
    }
  }
}
