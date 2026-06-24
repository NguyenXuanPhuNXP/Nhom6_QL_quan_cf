# Nhom6_QL_quan_cf

Hệ thống quản lý nhân sự và ca làm cho quán cafe

## Cài đặt

### Yêu cầu

- Node.js 18+
- MySQL 8.0+

### 1. Cài đặt Backend

```bash
cd BackEnd
npm install
```

### 2. Cài đặt Frontend

```bash
cd FrontEnd
npm install
```

### 3. Cấu hình Database

Tạo file `.env` trong thư mục `BackEnd/src/` với nội dung:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cafe_management
PORT=3000
JWT_SECRET=your_secret_key
```

### 4. Tạo Database

```sql
CREATE DATABASE cafe_management;
```

Import file SQL trong thư mục database (nếu có).

## Khởi chạy

### Chạy Backend (Terminal 1)

```bash
cd BackEnd
npm start
```

Server sẽ chạy tại http://localhost:3000

### Chạy Frontend (Terminal 2)

```bash
cd FrontEnd
npm run dev
```

App sẽ chạy tại http://localhost:5173

## Sử dụng

1. Mở trình duyệt và truy cập http://localhost:5173
2. Đăng ký tài khoản mới (nếu chưa có)
3. Đăng nhập để sử dụng hệ thống

## Tài khoản mẫu

Nếu có dữ liệu mẫu, bạn có thể sử dụng:

- Quản lý: admin / admin123
- Nhân viên: employee123

## Các tính năng

- Đăng nhập/Đăng ký
- Quản lý nhân viên
- Quản lý lịch làm việc
- Chấm công (Check-in/Check-out)
- Quản lý đơn nghỉ phép
- Thông báo
- Quản lý tài khoản
- Xem lịch cá nhân
