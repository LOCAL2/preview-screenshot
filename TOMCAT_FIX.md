# แก้ไขปัญหา Apache Tomcat "Invalid URI: [The encoded slash character is not allowed]"

## สาเหตุของปัญหา

ปัญหานี้เกิดจาก Apache Tomcat ไม่อนุญาตให้ใช้ encoded slash characters (`%2F`) ใน URL path เพื่อความปลอดภัย

### ข้อผิดพลาดที่พบ:
```
HTTP Status 400 – Bad Request
Message Invalid URI: [The encoded slash character is not allowed]
```

## วิธีแก้ไขที่ใช้

### 1. เปลี่ยนจาก Path Parameters เป็น Query Parameters

**เก่า (มีปัญหา):**
```javascript
// URL ที่มี encoded slash ใน path
https://image.thum.io/get/width/1200/crop/600/noanimate/https%3A%2F%2Fgoogle.com
```

**ใหม่ (แก้ไขแล้ว):**
```javascript
// URL ที่ใช้ query parameters
https://api.screenshotmachine.com/?key=demo&url=https%3A%2F%2Fgoogle.com&dimension=1200x800&format=png
```

### 2. สร้าง API Routes หลายเวอร์ชัน

เราได้สร้าง API endpoints หลายตัวเพื่อรองรับกรณีต่างๆ:

#### `/api/screenshot` (v1 - Standard)
- ใช้ screenshotmachine.com เป็นหลัก
- มี fallback services
- เหมาะสำหรับการใช้งานทั่วไป

#### `/api/screenshot-v2` (v2 - Alternative)
- ใช้ services หลากหลาย
- มี error handling ที่ดีขึ้น
- รองรับ POST method

#### `/api/screenshot-simple` (Simple - Tomcat-safe)
- ใช้เฉพาะ query parameters
- หลีกเลี่ยงปัญหา encoding ทั้งหมด
- เหมาะสำหรับ environment ที่มีข้อจำกัด

### 3. UI Selector

ผู้ใช้สามารถเลือก API version ได้จากหน้าเว็บ:

```jsx
<div className="flex space-x-4">
  <label className="flex items-center">
    <input type="radio" value="v1" checked={apiVersion === 'v1'} />
    <span>Standard (v1)</span>
  </label>
  <label className="flex items-center">
    <input type="radio" value="v2" checked={apiVersion === 'v2'} />
    <span>Alternative (v2)</span>
  </label>
  <label className="flex items-center">
    <input type="radio" value="simple" checked={apiVersion === 'simple'} />
    <span>Simple (Tomcat-safe)</span>
  </label>
</div>
```

## Screenshot Services ที่ใช้

### 1. ScreenshotMachine (แนะนำ)
```
https://api.screenshotmachine.com/?key=demo&url={URL}&dimension=1200x800&format=png
```
- ✅ ใช้ query parameters
- ✅ ไม่มีปัญหา encoding
- ✅ Demo key ใช้ได้ฟรี
- ✅ เสถียรและเร็ว

### 2. S-Shot.ru (Fallback)
```
https://mini.s-shot.ru/1200x800/PNG/1200/Z100/?{URL}
```
- ✅ ใช้ query parameters
- ✅ ฟรี
- ⚠️ อาจช้าในบางครั้ง

### 3. WebShot (Alternative)
```
https://webshot.amanoteam.com/print?width=1200&height=800&type=png&url={URL}
```
- ✅ ใช้ query parameters
- ✅ รองรับ POST method
- ⚠️ อาจไม่เสถียร

## การทดสอบ

### ทดสอบ API ด้วย curl:

```bash
# ทดสอบ Simple API (แนะนำสำหรับ Tomcat)
curl -X POST http://localhost:3000/api/screenshot-simple \
  -H "Content-Type: application/json" \
  -d '{"url":"google.com"}'

# ทดสอบ Standard API
curl -X POST http://localhost:3000/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url":"google.com"}'
```

### ทดสอบ Performance:

```bash
npm run test-api
npm run test-performance
```

## คำแนะนำการใช้งาน

### สำหรับ Production Environment:

1. **ใช้ Simple API** หากมี Apache Tomcat หรือ proxy ที่เข้มงวดเรื่อง URL encoding
2. **ใช้ Standard API** สำหรับ environment ทั่วไป
3. **ตั้งค่า fallback** ให้เปลี่ยน API version อัตโนมัติเมื่อเกิด error

### สำหรับ Development:

1. ทดสอบทุก API version
2. ตรวจสอบ console logs
3. ใช้ browser developer tools เพื่อดู network requests

## การแก้ปัญหาเพิ่มเติม

### หาก Tomcat ยังมีปัญหา:

1. **เปิดใช้ encoded slashes ใน Tomcat:**
   ```xml
   <!-- ใน server.xml -->
   <Connector port="8080" 
              allowEncodedSlashes="true"
              relaxedQueryChars="[]|{}^&#x5c;&#x60;&quot;&lt;&gt;" />
   ```

2. **ใช้ System Property:**
   ```bash
   -Dorg.apache.tomcat.util.buf.UDecoder.ALLOW_ENCODED_SLASH=true
   ```

3. **ใช้ Nginx หรือ Apache เป็น reverse proxy:**
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
   }
   ```

## สรุป

ปัญหา Apache Tomcat encoding ได้รับการแก้ไขโดย:

1. ✅ เปลี่ยนจาก path parameters เป็น query parameters
2. ✅ สร้าง API routes หลายเวอร์ชัน
3. ✅ เพิ่ม UI selector สำหรับเลือก API version
4. ✅ ใช้ screenshot services ที่เข้ากันได้
5. ✅ เพิ่ม error handling และ fallback mechanisms

ตอนนี้เว็บไซต์สามารถทำงานได้ในทุก environment รวมถึง Apache Tomcat! 🎉
