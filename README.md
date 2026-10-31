# ⏱ ChronoPulse

เว็บนาฬิกา **จับเวลา (Stopwatch)** และ **นับถอยหลัง (Timer)** แบบครบวงจร ดีไซน์ทันสมัย พร้อม **Circular Progress Ring** ที่ล้อมรอบตัวเลข, โหมดมืด/สว่าง, และการบันทึกรอบ (Lap Time)

> static website ล้วน ๆ ไม่มี build step ไม่มี framework — เปิดใช้งานได้ทันทีและ deploy ขึ้น GitHub Pages ได้ในคลิกเดียว

---

## ✨ ฟีเจอร์

- 🏁 **โหมดจับเวลา (Stopwatch)**
  - ความแม่นยำระดับ 1/100 วินาที แสดงผลลื่น 60fps ด้วย `requestAnimationFrame`
  - **บันทึกรอบ (Lap)** พร้อมแยกเวลาต่อรอบและเวลารวม แสดง Badge **เร็วที่สุด / ช้าที่สุด** อัตโนมัติ
  - ปุ่ม **คัดลอก** รายการรอบ และ **ล้าง** รายการ
  - วงแหวนกวาดครบรอบทุก ๆ 1 นาที เหมือนเข็มวินาทีบนหน้าปัด
- ⏳ **โหมดนับถอยหลัง (Timer)**
  - Preset สำเร็จรูป: 1 / 3 / 5 / 10 / 15 / 30 นาที หรือตั้งเอง (ชั่วโมง : นาที : วินาที)
  - ปุ่ม **+1 นาที** ระหว่างทำงาน
  - วงแหวนลดลงตามเวลาที่เหลือ และเปลี่ยนเป็นสีสีอำพัน→แดงเมื่อใกล้หมดเวลา
  - ครบแล้วมี **เสียงแจ้งเตือน 3 ครั้ง** (Web Audio API, ปิดได้) + สถานะ "หมดเวลา!"
  - เวลาเดินตรงแม้สลับแท็บ เพราะอ้างอิง timestamp ไม่ใช่ตัวนับ
- 🔵 **Circular Progress Ring** — วงกลมก้าวหน้าล้อมรอบตัวเลข พร้อม gradient เรืองแสงตามสถานะ
- 🌗 **โหมดมืด/สว่าง** — สลับได้จากปุ่มมุมขวาบน จำค่าไว้ในเครื่อง และเคารพค่าเริ่มต้นของระบบ (prefers-color-scheme)
- ⌨️ **คีย์ลัด** — `Space` เริ่ม/หยุด · `R` รีเซ็ต · `L` บันทึกรอบ
- 📱 Responsive ใช้งานได้ดีทั้งมือถือและเดสก์ท็อป · เคารพ `prefers-reduced-motion`
- 🔒 ทำงาน offline ในเบราว์เซอร์ ไม่ส่งข้อมูลใด ๆ ออกไปนอกเครื่อง

---

## 🛠 เทคโนโลยี

| ส่วน | สิ่งที่ใช้ |
|---|---|
| โครงหน้าเว็บ | HTML5 |
| สไตล์ & ธีม | CSS ล้วน (Custom Properties + `data-theme`) |
| ตรรกะ | JavaScript ES Modules ไม่มี dependency |
| ตัวเลข | `requestAnimationFrame` + timestamp (`performance.now()` / `Date.now()`) |
| เสียงแจ้งเตือน | Web Audio API |
| ฟอนต์ | Inter · IBM Plex Sans Thai · JetBrains Mono (Google Fonts, มี fallback เป็น system font) |

---

## 🚀 เริ่มต้นใช้งาน

เนื่องจากโปรเจกต์ใช้ ES Modules ต้องเปิดผ่าน local server (เปิดไฟล์ตรง ๆ ด้วย `file://` แล้วเบราว์เซอร์จะบล็อก):

```bash
# clone แล้วเข้าโฟลเดอร์
git clone <-url-of-this-repo>.git
cd ChronoPuls

# รันด้วย Python
python -m http.server 8080

# หรือใช้ Node
npx serve .
```

แล้วเปิด <http://localhost:8080>

> เคล็ดลับ: ใช้ VS Code + extension "Live Server" ก็ได้เช่นกัน

---

## ⌨️ คีย์ลัด

| คีย์ | ฟังก์ชัน |
|---|---|
| `Space` | เริ่ม / หยุด / ทำต่อ (ตามโหมดที่เลือกอยู่) |
| `R` | รีเซ็ต |
| `L` | บันทึกรอบ (โหมดจับเวลา) |
| `←` `→` | สลับแท็บ เมื่อโฟกัสอยู่ที่แถบเลือกโหมด |

---

## 📁 โครงสร้างไฟล์

```
ChronoPuls/
├── index.html                  # โครงหน้าเว็บ
├── css/
│   └── styles.css              # สไตล์ + ธีมมืด/สว่าง
├── js/
│   ├── main.js                 # จุดเริ่มต้น — เชื่อม UI เข้ากับตรรกะ
│   ├── stopwatch.js            # ตรรกะจับเวลา + บันทึกรอบ
│   ├── timer.js                # ตรรกะนับถอยหลัง
│   ├── ring.js                 # ควบคุม Circular Progress Ring
│   ├── theme.js                # ธีมมืด/สว่าง
│   ├── audio.js                # เสียงแจ้งเตือน
│   └── utils.js                # ฟังก์ชันช่วยเหลือ
├── assets/
│   └── favicon.svg             # ไอคอนเว็บ
├── .github/workflows/deploy.yml# Deploy ขึ้น GitHub Pages อัตโนมัติ
├── AGENTS.md                   # ข้อกำหนดการพัฒนา + กฎการใช้งาน Git
└── README.md                   # ไฟล์นี้
```

---

## 🌐 Deploy ขึ้น GitHub

### วิธีที่ 1: GitHub Actions (แนะนำ — deploy อัตโนมัติทุกครั้งที่ push)

โปรเจกต์มี workflow เตรียมไว้แล้วที่ `.github/workflows/deploy.yml`

1. สร้าง repository ใหม่บน GitHub (เช่น ชื่อ `ChronoPuls`)
2. Push โค้ดขึ้นสาขา `main`:

   ```bash
   git add .
   git commit -m "feat: initial release of ChronoPulse timer & stopwatch"
   git branch -M main
   git remote add origin https://github.com/<username>/ChronoPuls.git
   git push -u origin main
   ```

3. เข้า GitHub → **Settings → Pages → Build and deployment → Source** เลือก **GitHub Actions**
4. รอ workflow รันเสร็จ (สถานะ Actions เป็นสีเขียว) แล้วเปิดเว็บได้ที่:

   ```
   https://<username>.github.io/ChronoPuls/
   ```

   ครั้งถัดไปแค่ `git push` ขึ้น `main` เว็บจะอัปเดตอัตโนมัติ

> 💡 ถ้าใช้ GitHub CLI สร้าง repo พร้อม push ได้ในคำสั่งเดียว:
>
> ```bash
> gh repo create ChronoPuls --public --source=. --push
> gh api repos/<username>/ChronoPuls/pages -X POST -f build_type=workflow
> ```

### วิธีที่ 2: Deploy จาก Branch (ไม่ใช้ Actions)

1. Push โค้ดขึ้นสาขา `main` ตามข้อ 1–2 ด้านบน
2. **Settings → Pages → Build and deployment → Source** เลือก **Deploy from a branch**
3. เลือกสาขา `main` / โฟลเดอร์ `/ (root)` แล้วกด Save

> ทั้งสองวิธีใช้ path แบบสัมพัทธ์ (`./css/...`, `./js/...`) จึงทำงานได้ถูกต้องภายใต้ subpath ของ GitHub Pages

---

## 🎨 ปรับแต่งธีม/สี

สีทั้งหมดควบคุมด้วย CSS variables ใน `css/styles.css` ที่หัวไฟล์:

```css
html[data-theme='dark']  { --grad-a: #6c8cff; --grad-b: #22d3ee; /* ... */ }
html[data-theme='light'] { --grad-a: #4f63f7; --grad-b: #06b6d4; /* ... */ }
```

แก้ค่า `--grad-a` / `--grad-b` เพื่อเปลี่ยนสี gradient ของปุ่มหลักและวงแหวน และแก้ `--text`, `--muted`, `--surface` เพื่อปรับโทนสีพื้นหลัง

---

## 💾 ข้อมูลที่บันทึกในเครื่อง

เว็บนี้ไม่มีเซิร์ฟเวอร์ บันทึกเฉพาะค่าเหล่านี้ใน `localStorage`:

| คีย์ | ข้อมูล |
|---|---|
| `chronopulse:theme` | ธีมมืด/สว่าง ที่เลือกไว้ |
| `chronopulse:sound` | เปิด/ปิดเสียงแจ้งเตือน |
| `chronopulse:timer-seconds` | เวลานับถอยหลังล่าสุด |

---

## 📖 เอกสารสำหรับผู้พัฒนา

ดู **[AGENTS.md](./AGENTS.md)** สำหรับข้อกำหนดการพัฒนาและ**เงื่อนไขการใช้งาน Git** เช่น การตั้งชื่อสาขา, Conventional Commits, ห้าม force push, และขั้นตอนทดสอบก่อนส่งงาน
