-- ==========================================
-- DATABASE: QUAN LY NHAN SU VA CA LAM CAFE
-- OPTIMIZED FOR JWT AUTHENTICATION
-- ==========================================

CREATE DATABASE IF NOT EXISTS QuanLyCaPhe;
USE QuanLyCaPhe;

-- 1. ROLE
CREATE TABLE IF NOT EXISTS role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. POSITION
CREATE TABLE IF NOT EXISTS positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    position_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMPLOYEE
CREATE TABLE IF NOT EXISTS employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('Nam','Nu','Khac') NOT NULL,
    phone VARCHAR(15) UNIQUE,
    address TEXT,
    position_id INT NOT NULL,
    salary_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES positions(position_id)
);

-- 4. USERS (For JWT Authentication)
-- This table is directly used by authController.js
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    employee_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- 5. SHIFT
CREATE TABLE IF NOT EXISTS shift (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    shift_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    salary_multiplier DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. SCHEDULE
CREATE TABLE IF NOT EXISTS schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,
    work_date DATE NOT NULL,
    status ENUM('Da_phan_cong', 'Da_doi_ca', 'Huy') DEFAULT 'Da_phan_cong',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shift(shift_id),
    UNIQUE KEY uq_employee_shift_date (employee_id, shift_id, work_date)
);

-- 7. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    schedule_id INT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME NULL,
    total_hours DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('Dung_gio', 'Di_muon', 'Ve_som', 'Nghi_lam') DEFAULT 'Dung_gio',
    work_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id) ON DELETE SET NULL,
    INDEX idx_employee_date (employee_id, work_date)
);

-- 8. LEAVE REQUEST
CREATE TABLE IF NOT EXISTS leave_request (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Cho_duyet', 'Da_duyet', 'Tu_choi') DEFAULT 'Cho_duyet',
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employee(employee_id) ON DELETE SET NULL
);

-- 9. NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    INDEX idx_employee_read (employee_id, is_read)
);

-- 10. PAYROLL
CREATE TABLE IF NOT EXISTS payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    salary_rate_at_time DECIMAL(10,2) NOT NULL,
    total_hours DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    penalty DECIMAL(10,2) DEFAULT 0,
    total_salary DECIMAL(12,2) DEFAULT 0,
    status ENUM('Chua_thanh_toan', 'Da_thanh_toan') DEFAULT 'Chua_thanh_toan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_employee_payroll_month (employee_id, month, year)
);

-- 11. SHIFT SWAP
CREATE TABLE IF NOT EXISTS shift_swap (
    swap_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    receiver_id INT NOT NULL,
    schedule_id INT NOT NULL,
    target_schedule_id INT NULL,
    reason TEXT,
    status ENUM('Cho_duyet', 'Da_duyet', 'Tu_choi') DEFAULT 'Cho_duyet',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (target_schedule_id) REFERENCES schedule(schedule_id) ON DELETE CASCADE
);

-- 12. REFRESH TOKENS (For JWT token management)
CREATE TABLE IF NOT EXISTS user_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    device_info VARCHAR(255),
    is_revoked BOOLEAN DEFAULT FALSE,
    expired_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_revoked (user_id, is_revoked)
);

-- ==========================================
-- INSERT DEFAULT DATA
-- ==========================================

-- Insert default roles
INSERT IGNORE INTO role (role_name) VALUES ('admin');
INSERT IGNORE INTO role (role_name) VALUES ('manager');
INSERT IGNORE INTO role (role_name) VALUES ('user');

-- Insert default positions
INSERT IGNORE INTO positions (position_name) VALUES ('Quản lý');
INSERT IGNORE INTO positions (position_name) VALUES ('Nhân viên phục vụ');
INSERT IGNORE INTO positions (position_name) VALUES ('Barista');
INSERT IGNORE INTO positions (position_name) VALUES ('Kế toán');

-- Insert default shifts
INSERT IGNORE INTO shift (shift_name, start_time, end_time, salary_multiplier) VALUES 
('Sáng', '06:00:00', '12:00:00', 1.00),
('Chiều', '12:00:00', '18:00:00', 1.00),
('Tối', '18:00:00', '23:00:00', 1.20);

-- Insert test employee
INSERT IGNORE INTO employee (full_name, gender, phone, address, position_id, salary_rate) 
VALUES ('Nguyễn Văn A', 'Nam', '0123456789', '123 Đường ABC', 1, 10000000);

-- Insert test user (Username: admin, Password: admin123)
INSERT IGNORE INTO users (username, password, role, employee_id, is_active) 
VALUES ('admin', '$2a$10$Y0UtT8/CfMqBzR3M4WE9eut3d7z7hGV3K9Qk/5c8V6L8c5K8c3e0S', 'admin', 1, TRUE);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
