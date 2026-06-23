# Hướng dẫn cài đặt Database QuanLyCaPhe

## 1. Yêu cầu
- MySQL Server đã cài đặt và chạy
- Bạn có quyền truy cập MySQL (user: `root`)

---

## 2. Các bước thực hiện

### Bước 1: Mở MySQL command line
```bash
mysql -u root -p
```
Nhập mật khẩu MySQL (mặc định thường để trống hoặc `root`).

### Bước 2: Chạy SQL script
Chạy toàn bộ script trong file `BackEnd/schema.sql`:

```bash
source C:/Users/PC/Nhom6_QL_quan_cf/BackEnd/schema.sql
```

hoặc dùng Workbench:
1. File → Open SQL Script
2. Chọn `BackEnd/schema.sql`
3. Click **Execute** (hoặc Ctrl+Enter)

### Bước 3: Kiểm tra database
```sql
USE QuanLyCaPhe;
SHOW TABLES;
```

Bạn sẽ thấy các bảng:
- `role`, `positions`, `employee`, `users`, `shift`
- `schedule`, `attendance`, `leave_request`, `notification`, `payroll`
- `shift_swap`, `user_tokens`

---

## 3. Tài khoản mặc định (Test)

| Trường | Giá trị |
|--------|--------|
| Username | `admin` |
| Password | `admin123` |
| Role | `admin` |

---

## 4. Cập nhật `.env` nếu cần

File `BackEnd/.env` nên có:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=QuanLyCaPhe
JWT_SECRET=your_secret_key_here
PORT=3000
```

Thay `123456` bằng mật khẩu MySQL của bạn nếu khác.

---

## 5. Chạy backend

```powershell
cd BackEnd
npm install
npm run dev
```

Server chạy ở `http://localhost:3000`.

---

## 6. Kiểm tra thử (Postman/Curl)

Đăng nhập với tài khoản admin:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Kết quả mong đợi:
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

## 7. Thêm user mới

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"test123",
    "role":"user"
  }'
```

---

## Ghi chú quan trọng

- ✅ Bảng `users` dùng cho JWT authentication
- ✅ Bảng `employee` lưu thông tin nhân viên
- ✅ Bảng `user_tokens` cho refresh token (tùy chọn, nếu muốn thêm vào sau)
- ✅ Các password đã hashed bằng `bcryptjs` trước khi lưu
- ✅ Có indexes trên các trường thường xuyên query để tối ưu hiệu năng

---

## Lỗi thường gặp

**Lỗi: "Can't connect to MySQL server"**
→ Kiểm tra MySQL server có chạy không: `net start MySQL80` (hoặc phiên bản tương ứng)

**Lỗi: "Access denied"**
→ Sửa password trong `.env` phù hợp với mật khẩu MySQL của bạn

**Lỗi: "Database QuanLyCaPhe does not exist"**
→ Chạy lại `schema.sql` trong MySQL

