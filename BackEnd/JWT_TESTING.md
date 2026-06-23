# Hướng dẫn kiểm thử JWT (Backend)

Yêu cầu: server chạy ở `http://localhost:3000` và bạn đã thiết lập `JWT_SECRET` trong `BackEnd/.env`.

1) Đăng ký user (register)

Curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","role":"user"}'
```

Kết quả mẫu: HTTP 201 và body chứa `user`.


2) Đăng nhập (login)

Curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

Kết quả mẫu: HTTP 200 và body:
```json
{
  "message": "Đăng nhập thành công",
  "token": "<JWT_TOKEN>",
  "user": { "id": 1, "username": "testuser", "role": "user" }
}
```

Lưu token để gọi các route bảo vệ.

3) Gọi route bảo vệ (ví dụ `/api/protected/profile`)

Curl:

```bash
curl -X GET http://localhost:3000/api/protected/profile \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Kết quả: HTTP 200 và body chứa `user` (decoded từ token).


4) Test bằng Postman

- POST `http://localhost:3000/api/auth/register` (Body -> raw JSON)
- POST `http://localhost:3000/api/auth/login` (Body -> raw JSON) -> lưu `token` từ response
- GET `http://localhost:3000/api/protected/profile` -> trong tab `Authorization` chọn `Bearer Token` và dán token, hoặc thêm header `Authorization: Bearer <token>`.


5) Ghi chú bảo mật

- Đặt giá trị `JWT_SECRET` mạnh và không commit `.env` vào Git.
- Trong production, sử dụng HTTPS.
- Token hiện có thời hạn 1 ngày (`expiresIn: '1d'`) — điều chỉnh theo nhu cầu.
