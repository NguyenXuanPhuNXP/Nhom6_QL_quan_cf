# JWT Authentication - Tóm tắt toàn bộ thiết lập

## 📋 Danh sách thay đổi

### Backend

#### 1. **Cấu hình môi trường** 
- File: [BackEnd/.env](BackEnd/.env)
  - `JWT_SECRET`: Khóa bí mật JWT (đổi thành giá trị mạnh trong production)
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Cấu hình MySQL
  - `PORT`: 3000

#### 2. **Dependencies** 
- File: [BackEnd/package.json](BackEnd/package.json)
  - Thêm: `bcryptjs`, `dotenv`, `jsonwebtoken`, `mysql2`

#### 3. **Entry Point**
- File: [BackEnd/server.js](BackEnd/server.js)
  - Load `.env` qua `dotenv.config()`
  - Import app từ `src/app.js`
  - Khởi động server với PORT từ `.env`

#### 4. **App Setup**
- File: [BackEnd/src/app.js](BackEnd/src/app.js)
  - Express middleware: `express.json()`
  - Routes: `/api/auth`, `/api/protected`
  - Export app (không khởi động listener)

#### 5. **Database Config**
- File: [BackEnd/src/config/db.js](BackEnd/src/config/db.js)
  - Sử dụng biến environment
  - Pool connection tối ưu
  - Test connection onload

#### 6. **JWT Middleware**
- File: [BackEnd/src/middleware/auth.js](BackEnd/src/middleware/auth.js)
  - Đọc `Authorization: Bearer <token>` từ header
  - Verify token bằng `JWT_SECRET`
  - Gắn `req.user` = decoded payload
  - Trả 401 nếu token lỗi

#### 7. **Auth Controller**
- File: [BackEnd/src/controllers/authController.js](BackEnd/src/controllers/authController.js)
  - `login`: Verify password, trả JWT token
  - `register`: Hash password, tạo user mới

#### 8. **Routes**
- File: [BackEnd/src/routes/authRoutes.js](BackEnd/src/routes/authRoutes.js)
  - `POST /api/auth/register`: Đăng ký user
  - `POST /api/auth/login`: Đăng nhập, nhận token
  
- File: [BackEnd/src/routes/protectedRoutes.js](BackEnd/src/routes/protectedRoutes.js)
  - `GET /api/protected/profile`: Route mẫu bảo vệ (cần token)

#### 9. **Database Schema**
- File: [BackEnd/schema.sql](BackEnd/schema.sql)
  - Bảng `users` (username, password hashed, role)
  - Bảng `employee`, `positions`, `role`
  - Bảng `shift`, `schedule`, `attendance`, `leave_request`, ...
  - Bảng `user_tokens` cho refresh token (tùy chọn)
  - Dữ liệu mặc định: admin, positions, shifts

---

### Frontend

#### 1. **Axios HTTP Client**
- File: [FrontEnd/src/app/services/http.js](FrontEnd/src/app/services/http.js)
  - `baseURL`: `http://localhost:3000`
  - Interceptor: Tự động gắn `Authorization: Bearer <token>` từ localStorage

#### 2. **Auth Context & Hook**
- File: [FrontEnd/src/app/hooks/useAuth.jsx](FrontEnd/src/app/hooks/useAuth.jsx)
  - State: `user`, `token`
  - Persist vào localStorage
  - Method: `login(userData, token)`, `logout()`

#### 3. **Login Page**
- File: [FrontEnd/src/app/pages/LoginPage.jsx](FrontEnd/src/app/pages/LoginPage.jsx)
  - Gọi `authAPI.login(username, password)` từ backend
  - Lưu token + user qua `useAuth().login()`
  - Navigate to `/dashboard` nếu thành công

#### 4. **Auth API**
- File: [FrontEnd/src/app/services/api.js](FrontEnd/src/app/services/api.js)
  - `authAPI.login()`: Gọi `POST /api/auth/login` qua `http` client
  - Trả về `{ token, user }`

#### 5. **Environment Config**
- File: [FrontEnd/.env](FrontEnd/.env)
  - `VITE_API_URL=http://localhost:3000`

#### 6. **Dependencies**
- File: [FrontEnd/package.json](FrontEnd/package.json)
  - Thêm: `axios`

---

## 🚀 Cách chạy

### 1. Cài Node.js
- Tải từ `https://nodejs.org` (LTS)
- Cài đặt, chọn "Add to PATH"
- Verify: `node -v` và `npm -v`

### 2. Setup Database
```bash
mysql -u root -p
source BackEnd/schema.sql
```

### 3. Backend
```powershell
cd BackEnd
npm install
npm run dev
```
→ Server ở `http://localhost:3000`

### 4. Frontend
```powershell
cd FrontEnd
npm install
npm run dev
```
→ App ở `http://localhost:5173` (Vite default)

---

## ✅ Kiểm tra

### Postman - Register
```
POST http://localhost:3000/api/auth/register
Body (JSON):
{
  "username": "testuser",
  "password": "test123",
  "role": "user"
}
```
Response: `201 Created`

### Postman - Login
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}
```
Response: `200 OK` + `token`

### Postman - Protected Route
```
GET http://localhost:3000/api/protected/profile
Headers:
Authorization: Bearer <token>
```
Response: `200 OK` + user info

---

## 🔒 Bảo mật - TODO

- [ ] Thay `JWT_SECRET` giá trị mạnh trong `.env`
- [ ] Thêm Refresh Token (bảng `user_tokens`)
- [ ] Rate limiting trên `/api/auth/login` (brute force)
- [ ] HTTPS trong production
- [ ] CORS config (hiện mở hết)
- [ ] Input validation & sanitization
- [ ] Role-based access control (RBAC)

---

## 📚 Tệp quan trọng

| File | Mục đích |
|------|---------|
| `BackEnd/.env` | Biến môi trường |
| `BackEnd/schema.sql` | SQL schema & data |
| `BackEnd/src/middleware/auth.js` | JWT verify |
| `BackEnd/src/controllers/authController.js` | Login/Register logic |
| `FrontEnd/src/app/hooks/useAuth.jsx` | Auth context |
| `FrontEnd/src/app/services/http.js` | Axios + token |

---

## 📝 Ghi chú

✅ JWT token hiện thời hạn 1 ngày (`expiresIn: '1d'`)  
✅ Password hashed bằng bcryptjs (10 rounds)  
✅ Token tự động gắn vào request header (Axios interceptor)  
✅ Login & protected route đã test sơ bộ  

---

Hỏi bất kỳ lúc nào nếu cần hướng dẫn thêm! 🎯
