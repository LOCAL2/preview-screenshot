# Website Screenshot Preview

เว็บแอปพลิเคชัน Next.js ที่ให้ผู้ใช้กรอก URL เว็บไซต์ แล้วแสดง screenshot preview โดยใช้ API ฟรีที่ไม่ต้องใช้ API key

## ฟีเจอร์

- 🖼️ สร้าง screenshot ของเว็บไซต์จาก URL
- 🚀 ใช้ API ฟรีที่ไม่ต้องใช้ API key
- 📱 Responsive design ด้วย Tailwind CSS
- 📋 ประวัติ URL ที่เคยใช้งาน
- 💾 ดาวน์โหลด screenshot
- ⚡ Loading state และ error handling

## เทคโนโลยีที่ใช้

- **Next.js 15** - React framework
- **Tailwind CSS 4** - CSS framework
- **React 19** - JavaScript library
- **Free Screenshot APIs** - สำหรับสร้าง screenshot

## การติดตั้งและรัน

1. Clone repository:
```bash
git clone <repository-url>
cd preview-screenshort
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. รันเซิร์ฟเวอร์ development:
```bash
npm run dev
```

4. เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## การใช้งาน

1. กรอก URL ของเว็บไซต์ที่ต้องการสร้าง screenshot
2. กดปุ่ม "Generate Screenshot"
3. รอสักครู่เพื่อให้ระบบสร้าง screenshot
4. ดู preview และสามารถดาวน์โหลดได้

## API Endpoints

### POST /api/screenshot

สร้าง screenshot จาก URL

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "screenshot": "https://screenshot-url.com/image.png",
  "originalUrl": "https://example.com",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Screenshot APIs ที่ใช้

เว็บแอปนี้ใช้ API ฟรีหลายตัวเป็น fallback:

1. **screenshotapi.net** - Free tier
2. **thumbnail.ws** - Free API
3. **htmlcsstoimage.com** - Demo version

## การ Deploy

### Vercel (แนะนำ)

1. Push โค้ดไปยัง GitHub
2. เชื่อมต่อ repository กับ Vercel
3. Deploy อัตโนมัติ

### อื่นๆ

สามารถ deploy ได้บนแพลตฟอร์มใดก็ได้ที่รองรับ Next.js เช่น:
- Netlify
- Railway
- Render
- DigitalOcean App Platform
# preview-screenshot
# preview-screenshot
