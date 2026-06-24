-- Create Database
CREATE DATABASE IF NOT EXISTS quanlycaphe;
USE quanlycaphe;

-- Role table
CREATE TABLE IF NOT EXISTS role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Position table
CREATE TABLE IF NOT EXISTS `position` (
    position_id INT PRIMARY KEY AUTO_INCREMENT,
    position_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee table
CREATE TABLE IF NOT EXISTS employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20),
    address VARCHAR(255),
    position_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES `position`(position_id) ON DELETE SET NULL
);

-- Account table
CREATE TABLE IF NOT EXISTS account (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    employee_id INT NOT NULL UNIQUE,
    role_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT
);

-- Shift table
CREATE TABLE IF NOT EXISTS shift (
    shift_id INT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule table
CREATE TABLE IF NOT EXISTS schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,
    work_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shift(shift_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_schedule (employee_id, shift_id, work_date)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    schedule_id INT,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,
    total_hours DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'Dung_gio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id) ON DELETE SET NULL
);

-- Leave Request table
CREATE TABLE IF NOT EXISTS leave_request (
    leave_request_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- Notification table
CREATE TABLE IF NOT EXISTS notification (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- Insert default roles
INSERT IGNORE INTO role (role_id, role_name, description) VALUES
(1, 'Admin', 'Administrator with full access'),
(2, 'Quản lý', 'Manager with staff management access'),
(3, 'Nhân viên', 'Staff with basic access');

-- Insert default position
INSERT IGNORE INTO `position` (position_id, position_name) VALUES
(1, 'Quản lý'),
(2, 'Nhân viên'),
(3, 'Thực tập');

-- Insert default employee (admin)
INSERT IGNORE INTO employee (employee_id, full_name, gender, phone, address, position_id) VALUES
(1, 'Admin User', 'Male', '0123456789', '123 Admin Street', 1);

-- Insert default account (admin) - password: 123456 (bcrypt hashed)
INSERT IGNORE INTO account (account_id, username, password, employee_id, role_id, status) VALUES
(1, 'admin', '$2b$10$BqAoDt13AGZHN1MxSo5ZA.7xbl8fBMU8JREjbCiZP9thI4p6brPFq', 1, 1, 'Active');

-- Insert sample shifts
INSERT IGNORE INTO shift (shift_id, shift_name, start_time, end_time) VALUES
(1, 'Sáng', '06:00:00', '14:00:00'),
(2, 'Chiều', '14:00:00', '22:00:00'),
(3, 'Tối', '22:00:00', '06:00:00');
