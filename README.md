# Arrakis-DUNE Drone Survey Archive (Web & API README)

## เกี่ยวกับโปรเจกต์

DUNE Drone Monitoring System เป็นเว็บไซต์สำหรับดูข้อมูลและติดตามการทำงานของโดรน โดยผู้ใช้สามารถดูข้อมูลพื้นฐานของโดรน ตรวจสอบสถานะ บันทึกค่าอุณหภูมิ และดูประวัติการบันทึกอุณหภูมิย้อนหลังได้

โปรเจกต์แบ่งออกเป็น 2 ส่วน ได้แก่

- API Server ทำหน้าที่รับคำขอจากเว็บไซต์ ติดต่อกับ Drone Config Server และ Drone Log Server เพื่อดึงข้อมูลและบันทึกข้อมูลอุณหภูมิ
- Web Frontend เป็นส่วนของเว็บไซต์ที่ผู้ใช้สามารถเข้ามาดูข้อมูลโดรน กรอกค่าอุณหภูมิ และดูประวัติการบันทึกได้

## การใช้งานเว็บไซต์

เว็บไซต์แบ่งการทำงานออกเป็น 3 ส่วน

1. View Config แสดงข้อมูลพื้นฐานของโดรน เช่น Drone ID, Drone Name, Light และ Country รวมถึงสถานะของโดรน
2. Temperature Log Form ใช้กรอกค่าอุณหภูมิของโดรน แล้วกด Submit เพื่อบันทึกข้อมูล
3. View Logs แสดงประวัติการบันทึกอุณหภูมิ โดยเรียงจากรายการล่าสุดไปเก่าที่สุด และแสดงข้อมูลไม่เกิน 12 รายการต่อหน้า

## หมายเหตุ

- ต้องเปิด API Server และ Web Server พร้อมกันขณะใช้งานเว็บไซต์
- ตรวจสอบค่าในไฟล์ .env ให้ถูกต้องก่อนเริ่มเซิร์ฟเวอร์
- หากมีการแก้ไขค่าในไฟล์ .env ควรเริ่มเซิร์ฟเวอร์ใหม่เพื่อให้ระบบอ่านค่าที่เปลี่ยนแปลง
- ไฟล์ .env ใช้เก็บ URL และ API Token สำหรับเชื่อมต่อกับเซิร์ฟเวอร์จริง จึงไม่ให้นำไฟล์ขึ้น GitHub
- ในโฟลเดอร์จะมีไฟล์ .env.example เป็นตัวอย่างสำหรับตั้งค่าแทนการเผยแพร่ข้อมูลจริงเท่านั้นค่ะ

## URL สำหรับเข้าใช้งาน web และ api

- Website: https://arrakis-dune-drone-survey-archive-1.onrender.com
- API Server: https://arrakis-dune-drone-survey-archive.onrender.com/

หมายเหตุ: หมายเหตุ: เนื่องจาก Render Free จะหยุดการทำงานของ Web Service เมื่อไม่มีการใช้งานเป็นระยะเวลาหนึ่ง เมื่อมีการเรียกใช้งานอีกครั้ง เซิร์ฟเวอร์อาจใช้เวลาประมาณ 30–60 วินาทีในการเริ่มทำงาน และโหลดข้อมูลจาก API Server ค่ะ

## ติดตั้ง tools ก่อนรันบน VS Code

- Node.js เวอร์ชัน 18 ขึ้นไป
- npm ซึ่งติดตั้งมาพร้อมกับ Node.js

- ตรวจสอบเวอร์ชันได้ด้วยคำสั่ง

node -v
npm -v


## วิธีติดตั้งและเริ่มรัน บน VS code

ระบบประกอบด้วย API Server และ Web Server ซึ่งต้องเปิดใช้งานพร้อมกัน โดยให้เปิด Terminal แยกกัน 2 terminal

## DRONE API SERVER
### 1. ตั้งค่าและเปิด API Server

- เปิด Terminal แล้วเข้าไปยังโฟลเดอร์ api 

cd api

- ติดตั้งแพ็กเกจที่จำเป็นด้วยคำสั่ง

npm install


- สร้างไฟล์ .env จากไฟล์ตัวอย่าง หากใช้ PowerShell บน Windows ให้ใช้คำสั่ง

Copy-Item .env.example .env

*กรณีต้องการเปลี่ยน DRONE_ID* เปิดไฟล์ web/.env และกำหนดค่าตาม API ของตนเองที่ได้รับจาก server อาจารย์ 

CONFIG_URL=URL ของ Drone Config Server

LOG_URL=URL ของ Drone Log Server

LOG_API_TOKEN=API TOKEN ที่อาจารย์กำหนด

PORT=3000


- เมื่อกำหนดค่าเรียบร้อยแล้ว ให้เริ่ม API Server ด้วยคำสั่ง

npm start

- หากเริ่มทำงานสำเร็จ จะเห็นข้อความ

API listening on :3000

- API Server จะเปิดให้ใช้งานที่ http://localhost:3000


## DRONE WEB SERVER
### 2. ตั้งค่าและเปิดเว็บไซต์

- เปิด Terminal อีกหน้าต่างหนึ่งแล้วเข้าไปยังโฟลเดอร์ web

cd web

- ติดตั้งแพ็กเกจที่จำเป็น

npm install

- สร้างไฟล์ .env จากไฟล์ตัวอย่าง

Copy-Item .env.example .env

- เปิดไฟล์ web/.env และกำหนดค่า drone ตัวเอง

DRONE_ID=67010553

API_URL=http://localhost:3000

PORT=8080

โดย DRONE_ID คือหมายเลขประจำตัวโดรนที่ต้องการใช้งาน และ API_URL คือ URL ของ API Server

- จากนั้นเริ่มเว็บไซต์ด้วยคำสั่ง

npm start

- เมื่อเริ่มทำงานสำเร็จ จะเห็นข้อความ

Frontend running

- เปิดเว็บไซต์ผ่านเบราว์เซอร์ได้ที่

http://localhost:8080

### API Endpoints

GET	/configs/:droneId	ดึงข้อมูลพื้นฐานของโดรน
GET	/status/:droneId	ตรวจสอบสถานะของโดรน
GET	/logs/:droneId?page=1	ดึงประวัติอุณหภูมิของโดรน
POST	/logs	บันทึกข้อมูลอุณหภูมิ

หมายเหตุ: การเรียกใช้งาน API จากเว็บไซต์จะเรียกผ่าน API Server ของโปรเจกต์นี้ไม่ได้เรียก Drone Config Server หรือ Drone Log Server โดยตรงตามที่อาจารย์ได้กำหนดไว้ค่ะ
