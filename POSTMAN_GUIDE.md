# Hướng dẫn Import & Sử dụng Postman Collection

## 1. Import Collection vào Postman

### Cách 1: Import từ file
1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn tab **File**
4. Upload file `BackEnd/postman_collection.json`
5. Click **Import**

### Cách 2: Import từ link (nếu push lên GitHub)
1. Click **Import**
2. Chọn tab **Link**
3. Paste URL của raw file `postman_collection.json`
4. Click **Import**

---

## 2. Thiết lập Environment Variables

Để dùng `{{base_url}}` và `{{jwt_token}}` trong requests:

1. Vào tab **Environments** (bên trái)
2. Click **Create New** → **Environment**
3. Đặt tên: `JWT Auth - Local`
4. Thêm variables:
   - **base_url**: `http://localhost:3000`
   - **jwt_token**: `` (để trống)
5. Click **Save**

6. Quay lại collection, chọn environment:
   - Tab Environment (trên cùng) → Chọn `JWT Auth - Local`

---

## 3. Quy trình kiểm tra

### Step 1: Register User
1. Chọn request **Auth → Register**
2. Sửa body nếu cần (thay `testuser`, `test123`)
3. Click **Send**
4. Kiểm tra Response: `201 Created`

### Step 2: Login (lấy Token)
1. Chọn request **Auth → Login Admin** (hoặc Login Test User)
2. Click **Send**
3. Trong Response, copy giá trị `token`
4. Gắn token vào variable:
   - Tab **Environments** → `JWT Auth - Local`
   - Paste token vào `jwt_token`
   - Click **Save**

### Step 3: Access Protected Route
1. Chọn request **Protected Routes → Get Profile**
2. Kiểm tra header `Authorization: Bearer {{jwt_token}}` đã có chưa
3. Click **Send**
4. Response: `200 OK` + user info

---

## 4. Mẹo nâng cao

### Tự động lưu token sau khi login
1. Chọn request **Auth → Login Admin**
2. Tab **Tests**
3. Dán code:
```javascript
var jsonData = pm.response.json();
pm.environment.set("jwt_token", jsonData.token);
```
4. Save
5. Lần tới login, token tự động lưu vào variable

### Tạo request mới từ template
1. Collection → **New Request**
2. Thêm URL: `{{base_url}}/api/your-endpoint`
3. Tab **Headers** → Thêm:
   - `Authorization`: `Bearer {{jwt_token}}`
   - `Content-Type`: `application/json`

---

## 5. Các request trong Collection

| Request | Method | Endpoint | Mục đích |
|---------|--------|----------|---------|
| Register | POST | `/api/auth/register` | Tạo user mới |
| Login Admin | POST | `/api/auth/login` | Đăng nhập admin |
| Login Test User | POST | `/api/auth/login` | Đăng nhập test user |
| Get Profile | GET | `/api/protected/profile` | Test route bảo vệ |

---

## 6. Lỗi thường gặp

**"error": "Cannot GET /api/auth/register"**
→ Backend chưa chạy, chạy `npm run dev` trong BackEnd

**"status": 401, "message": "Token không hợp lệ"**
→ Token sai hoặc hết hạn, login lại

**"status": 400, "message": "Username đã tồn tại"**
→ Username đã dùng, dùng username khác hoặc delete user từ database

---

## 7. Thêm request mới vào Collection

Nếu tôi thêm endpoint mới (ví dụ `GET /api/protected/employees`):

1. Click **Add Request** vào collection
2. Method: `GET`
3. URL: `{{base_url}}/api/protected/employees`
4. Headers:
   - `Authorization`: `Bearer {{jwt_token}}`
5. Click **Send**

---

## 📝 File Collection

File: `BackEnd/postman_collection.json`

Nó chứa:
- 3 requests Auth (Register, Login Admin, Login Test User)
- 1 Protected Route (Get Profile)
- 2 Environment Variables (base_url, jwt_token)

Có thể mở file bằng text editor để thêm requests mới nếu cần.

---

Xong! 🎉 Bây giờ bạn có thể test JWT auth đầy đủ mà không cần setup manual.
