const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username và password là bắt buộc'
            });
        }

        const [accounts] = await db.execute(
            `
            SELECT
                a.account_id,
                a.username,
                a.password,
                a.employee_id,
                r.role_id,
                r.role_name,
                e.full_name,
                e.position_id
            FROM account a
            INNER JOIN role r
                ON a.role_id = r.role_id
            INNER JOIN employee e
                ON a.employee_id = e.employee_id
            WHERE a.username = ?
            `,
            [username]
        );

        if (accounts.length === 0) {
            return res.status(401).json({
                message: 'Tài khoản không tồn tại'
            });
        }

        const account = accounts[0];

        // Nếu password đã hash bằng bcrypt
        const isMatch = await bcrypt.compare(
            password,
            account.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Sai mật khẩu'
            });
        }

        const token = jwt.sign(
            {
                account_id: account.account_id,
                employee_id: account.employee_id,
                username: account.username,
                role_id: account.role_id,
                role_name: account.role_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                account_id: account.account_id,
                employee_id: account.employee_id,
                full_name: account.full_name,
                username: account.username,
                role_id: account.role_id,
                role_name: account.role_name
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};

exports.createAccount = async (req, res) => {

    try {

        const {
            username,
            password,
            role_id,
            employee_id
        } = req.body;

        if (
            !username ||
            !password ||
            !role_id ||
            !employee_id
        ) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu bắt buộc'
            });
        }

        // Kiểm tra username

        const [existUsername] =
            await db.execute(
                `
                SELECT account_id
                FROM account
                WHERE username = ?
                `,
                [username]
            );

        if (existUsername.length > 0) {
            return res.status(400).json({
                message: 'Username đã tồn tại'
            });
        }

        // Kiểm tra nhân viên tồn tại

        const [employees] =
            await db.execute(
                `
                SELECT employee_id
                FROM employee
                WHERE employee_id = ?
                `,
                [employee_id]
            );

        if (employees.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }

        // Kiểm tra đã có tài khoản chưa

        const [existAccount] =
            await db.execute(
                `
                SELECT account_id
                FROM account
                WHERE employee_id = ?
                `,
                [employee_id]
            );

        if (existAccount.length > 0) {
            return res.status(400).json({
                message: 'Nhân viên đã có tài khoản'
            });
        }

        // Kiểm tra role

        const [roles] =
            await db.execute(
                `
                SELECT role_id
                FROM role
                WHERE role_id = ?
                `,
                [role_id]
            );

        if (roles.length === 0) {
            return res.status(404).json({
                message: 'Role không tồn tại'
            });
        }

        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Tạo account

        const [result] =
            await db.execute(
                `
                INSERT INTO account
                (
                    username,
                    password,
                    role_id,
                    employee_id
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    username,
                    hashedPassword,
                    role_id,
                    employee_id
                ]
            );

        return res.status(201).json({
            message: 'Tạo tài khoản thành công',
            account_id: result.insertId
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};