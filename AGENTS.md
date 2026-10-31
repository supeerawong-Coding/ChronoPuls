# AGENTS.md — ข้อกำหนดสำหรับผู้ช่วยพัฒนา (Agents) และผู้ร่วมงาน

> โปรเจกต์: **ChronoPuls** — เว็บนาฬิกาจับเวลา (Stopwatch) & นับถอยหลัง (Timer)
> ประเภท: Static Website (HTML/CSS/JavaScript ES Modules) **ไม่มี build step ไม่มี framework**
> Deploy: GitHub Pages อัตโนมัติเมื่อ push ไปยังสาขา `main`

---

## 1. ภาพรวมโครงสร้างโปรเจกต์

| ไฟล์/โฟลเดอร์ | หน้าที่ |
|---|---|
| `index.html` | โครงหน้าเว็บทั้งหมด (แท็บโหมด, หน้าปัด, ปุ่มควบคุม, การ์ดรอบ) |
| `css/styles.css` | สไตล์ทั้งหมด + ธีมมืด/สว่าง ผ่าน `html[data-theme]` |
| `js/main.js` | จุดเริ่มต้น — เชื่อม UI เข้ากับตรรกะนาฬิกา |
| `js/stopwatch.js` | ตรรกะจับเวลา + บันทึกรอบ (ไม่แตะ DOM) |
| `js/timer.js` | ตรรกะนับถอยหลัง (ไม่แตะ DOM) |
| `js/ring.js` | ควบคุม Circular Progress Ring |
| `js/theme.js` | ธีมมืด/สว่าง + บันทึกลง localStorage |
| `js/audio.js` | เสียงแจ้งเตือนตอนจบนับถอยหลัง (Web Audio API) |
| `js/utils.js` | ฟังก์ชันช่วยเหลือ (ฟอร์แมตเวลา, storage, selector) |
| `.github/workflows/deploy.yml` | Deploy ขึ้น GitHub Pages อัตโนมัติ |
| `assets/favicon.svg` | ไอคอนเว็บ |

**หลักการออกแบบโค้ด**

- ใช้ ES Modules (`import`/`export`) เท่านั้น และใช้ path **แบบสัมพัทธ์** เสมอ (`./js/main.js`) เพื่อให้ใช้งานใต้ subpath ของ GitHub Pages ได้ (`https://<user>.github.io/ChronoPuls/`)
- ไม่เพิ่ม framework, bundler, หรือ package manager โดยไม่ได้รับอนุญาตจากผู้เป็นเจ้าของโปรเจกต์
- ตรรกะเวลาต้องแยกจาก DOM (อยู่ใน `stopwatch.js` / `timer.js`) และห้ามใช้ `setInterval` นับเวลา — ให้อ้างอิง timestamp (`Date.now()` / `performance.now()`) เพื่อความแม่นยำเมื่อแท็บถูกซ่อน
- ธีม/สี ให้เปลี่ยนผ่าน CSS variables ใน `styles.css` เท่านั้น
- ข้อความ UI ทั้งหมดเป็น **ภาษาไทย**
- รองรับมือถือและเคารพ `prefers-reduced-motion`

---

## 2. เงื่อนไขการใช้งาน Git (บังคับใช้ทุกครั้ง)

### 2.1 สาขา (Branching)

- `main` = สาขาหลักและสาขา production **การ push ขึ้น `main` = ขึ้นเว็บจริงทันที** ผ่าน GitHub Pages
- งานที่ต้องแก้ไขจริงจัง ให้สร้างสาขาใหม่จาก `main` ก่อนเสมอ โดยใช้นามสกุล:
  - `feature/<คำอธิบายสั้น>` — เพิ่มฟีเจอร์ใหม่ เช่น `feature/countdown-presets`
  - `fix/<คำอธิบายสั้น>` — แก้บั๊ก เช่น `fix/timer-drift`
  - `docs/<คำอธิบายสั้น>` — แก้เอกสาร
  - `chore/<คำอธิบายสั้น>` — งานบำรุงรักษา (config, workflow, จัดระเบียบไฟล์)
- การแก้ไขเล็กน้อยที่ตรวจแล้ว (1–2 ไฟล์, ไม่เสี่ยงพัง) อาจ commit ลง `main` ตรง ๆ ได้ แต่ต้องตรวจ diff แล้วเท่านั้น
- ชื่อสาขาเป็น **ตัวพิมพ์เล็ก + ขีดกลาง** ห้ามมีช่องว่างหรืออักขระพิเศษ

### 2.2 ก่อนเริ่มงานและก่อน push

- ก่อนเริ่มงาน: ดึงล่าสุดก่อนเสมอ
  ```bash
  git pull --rebase origin main
  ```
- ก่อน push: ตรวจสถานะและ diff ให้ครบ
  ```bash
  git status
  git diff --staged
  ```
- ถ้าเกิด conflict ให้แก้ทีละไฟล์อย่างระวัง — **ห้าม resolve แบบสุ่มหรือเลือกทั้งสองฝั่งมั่ว ๆ** ถ้าไม่แน่ใจ ให้หยุดและถามผู้เป็นเจ้าของโปรเจกต์

### 2.3 ข้อความ Commit (Conventional Commits)

รูปแบบ: `type(scope): คำอธิบายสั้นเป็นภาษาอังกฤษ`

- `type` ที่ใช้ได้: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `chore`, `test`
- `scope` ใส่เฉพาะส่วนที่เกี่ยวข้อง เช่น `(timer)`, `(stopwatch)`, `(theme)`, `(ui)`
- หัวข้อเป็น **imperative สั้น ๆ** เช่น `add lap badges`, `fix timer drift when tab hidden`
- ส่วน `body` (ถ้ามี) เขียนอธิบายเป็นภาษาไทยได้

ตัวอย่าง:

```
feat(timer): add +1 minute button while running
fix(stopwatch): keep accuracy after tab becomes hidden
docs(readme): add GitHub Pages deployment steps
chore(ci): add GitHub Pages deploy workflow
```

### 2.4 การ stage และขนาดของ commit

- **stage เป็นรายไฟล์** (`git add <path>`) และตรวจ `git status` ก่อน commit เสมอ — หลีกเลี่ยง `git add .` โดยไม่ได้ตรวจ
- แต่ละ commit ต้องเป็น **หนึ่งความเปลี่ยนแปลงที่สมบูรณ์** — ห้ามรวมฟีเจอร์ใหม่กับการแก้บั๊กใน commit เดียว
- ห้าม commit โค้ดที่ทำให้เว็บเปิดไม่ขึ้นหรือมี syntax error
- ห้ามทิ้งไฟล์ชั่วคราว, `console.log` ดีบั๊ก, หรือคอมเมนต์โค้ดเก่าที่ถูกปิดทิ้งไว้

### 2.5 สิ่งที่ห้าม commit

- ความลับทุกชนิด: token, password, `.env`, private key
- `node_modules/`, `.DS_Store`, `Thumbs.db`, `.idea/`, `*.swp`
- ไฟล์ใหญ่ผิดปกติ (> 5 MB) — ถ้าจำเป็นต้องมีไฟล์ใหญ่ ให้ปรึกษาเจ้าของโปรเจกต์ก่อน (อาจต้องใช้ Git LFS)
- ไฟล์ build output หรือ dependency ที่ generate ขึ้นเอง

### 2.6 การแก้ไข/เขียนทับประวัติ (History)

- **ห้าม `git push --force` หรือ `git push -f` ไปยัง `main` หรือสาขาที่ผู้อื่นใช้งาน** เด็ดขาด
- ห้ามใช้ `git rebase` บน commit ที่ push ไปแล้ว
- `git commit --amend` ใช้ได้เฉพาะ commit **ที่ยังไม่ได้ push** เท่านั้น
- ต้องการยกเลิกการเปลี่ยนแปลงที่ push ไปแล้ว ให้ใช้ `git revert <commit>` เสมอ
- ห้าม `git reset --hard` โดยไม่ได้รับอนุญาตจากผู้เป็นเจ้าของโปรเจกต์

### 2.7 Merge / Pull Request

- ก่อน merge กลับ `main` ต้อง:
  1. ตรวจ `git diff main...<branch>` ครบทุกไฟล์
  2. ทดสอบเว็บบนเครื่อง (ดู §4)
  3. เขียนสรุปสิ่งที่เปลี่ยน + วิธีทดสอบใน PR/คำอธิบาย commit
- ห้าม merge งานของผู้อื่นหรือ revert การเปลี่ยนแปลงที่ผู้เป็นเจ้าของทำไว้ โดยไม่สอบถามก่อน

### 2.8 การ deploy และ release

- Push ขึ้น `main` → GitHub Actions (`.github/workflows/deploy.yml`) deploy ขึ้น GitHub Pages อัตโนมัติ
- ห้ามแก้ไข workflow หรือเปลี่ยนวิธี deploy โดยไม่แจ้งให้ทราบล่วงหน้า
- ถ้าต้องทำ release ให้ใช้ tag รูปแบบ `vX.Y.Z` (Semantic Versioning)
- ถ้า GitHub Actions fail ให้อ่าน log แล้วแก้สาเหตุก่อน commit ถัดไป ห้ามข้ามงานที่พัง

### 2.9 การทำงานร่วมกับไฟล์ของผู้เป็นเจ้าของโปรเจกต์

- ห้ามลบ ย้าย หรือเขียนทับไฟล์ที่ผู้ใช้สร้างไว้ โดยไม่ยืนยันก่อน
- ถ้าต้อง refactor ไฟล์ใหญ่ ให้แจ้งเหตุผลและแผนก่อนลงมือ
- เคารพการตัดสินใจเดิมของโค้ด (ชื่อตัวแปร, รูปแบบ, ภาษาข้อความ UI) ให้สอดคล้องกันตลอด

---

## 3. การทดสอบก่อนส่งงาน (บังคับ)

static site เปิดด้วย `file://` ไม่ได้ (ES Modules ถูกบล็อก) ต้องรันผ่าน local server:

```bash
# ทางเลือกใดก็ได้
python -m http.server 8080
npx serve .
```

ตรวจอย่างน้อย:

1. เปิด `http://localhost:8080` แล้วเว็บโหลดโดยไม่มี error ใน Console
2. โหมดจับเวลา: เริ่ม/หยุด/ทำต่อ/รีเซ็ต + บันทึกรอบ + ปุ่มล้าง/คัดลอก
3. โหมดนับถอยหลัง: เลือก preset, ตั้งเวลาเอง, +1 นาที, ครบแล้วมีเสียง + สถานะ "หมดเวลา!"
4. สลับธีมมืด/สว่าง แล้ว reload ยังจำค่าได้
5. ทดสอบคีย์ลัด `Space`, `R`, `L`
6. ทดสอบความกว้างหน้าจอ ~375px (มือถือ)
7. เปลี่ยนแท็บไปสัก 30 วินาทีแล้วกลับมา ตัวเลขเวลาต้องถูกต้อง (ไม่เพี้ยน)

---

## 4. คำสั่ง Git ที่ใช้บ่อยในโปรเจกต์นี้

```bash
git status                       # ดูสถานะ
git switch -c feature/<name>     # สร้างสาขาใหม่
git switch main                  # กลับสาขาหลัก
git pull --rebase origin main    # ดึงล่าสุดแบบ rebase
git add <file>                   # stage เป็นรายไฟล์
git commit -m "feat(scope): message"
git push -u origin <branch>      # push สาขา
git log --oneline -10            # ดูประวัติ commit
git revert <commit>              # ยกเลิก commit แบบปลอดภัย
```

---

## 5. ข้อควรระวังเพิ่มเติม

- ห้ามเพิ่ม dependency จาก CDN ที่จำเป็นต่อการทำงานหลักของเว็บ (font ภายนอก อนุญาตได้ แต่ต้องมี fallback เป็น system font)
- ห้ามส่งข้อมูลของผู้ใช้ไปยังเซิร์ฟเวอร์ภายนอก — เว็บนี้ทำงาน offline ในเบราว์เซอร์ทั้งหมด
- ข้อมูลที่อนุญาตให้บันทึกใน `localStorage`: ธีม (`chronopulse:theme`), เสียง (`chronopulse:sound`), เวลานับถอยหลังล่าสุด (`chronopulse:timer-seconds`)
