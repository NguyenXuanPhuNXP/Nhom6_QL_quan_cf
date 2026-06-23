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
            process.env.JWT_SECRET || 'my_super_secret_key',
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

exports.register = async (req, res) => {
    try {
        const { username, password, confirmPassword, full_name, phone, address, email } = req.body;

        // Validation
        if (!username || !password || !full_name) {
            return res.status(400).json({
                message: 'Username, password, và full_name là bắt buộc'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Mật khẩu xác nhận không khớp'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Check username exists
        const [existUsername] = await db.execute(
            'SELECT account_id FROM account WHERE username = ?',
            [username]
        );

        if (existUsername.length > 0) {
            return res.status(400).json({
                message: 'Username đã tồn tại'
            });
        }

        // Get default position
        let [positions] = await db.execute(
            'SELECT position_id FROM positions LIMIT 1'
        );
        let positionId = 1;
        if (positions.length > 0) {
            positionId = positions[0].position_id;
        } else {
            // Auto-create default position if table is empty
            const [newPos] = await db.execute(
                'INSERT INTO positions (position_name) VALUES (?)',
                ['Nhân viên mới']
            );
            positionId = newPos.insertId;
        }

        // Create employee with default gender 'Nam'
        const [employeeResult] = await db.execute(
            `INSERT INTO employee (full_name, gender, phone, address, position_id, created_at)
             VALUES (?, 'Nam', ?, ?, ?, NOW())`,
            [full_name, phone || null, address || null, positionId]
        );

        const employeeId = employeeResult.insertId;

        // Get default role for new registrations
        let [roles] = await db.execute(
            'SELECT role_id, role_name FROM role WHERE role_name = ? OR role_name = ?',
            ['Staff', 'Nhân viên']
        );
        
        let roleId;
        let roleName;

        if (roles.length > 0) {
            roleId = roles[0].role_id;
            roleName = roles[0].role_name;
        } else {
            // Fallback to any role that is not Admin
            [roles] = await db.execute('SELECT role_id, role_name FROM role WHERE role_name != ? LIMIT 1', ['Admin']);
            if (roles.length > 0) {
                roleId = roles[0].role_id;
                roleName = roles[0].role_name;
            } else {
                // Absolute fallback: create 'Staff' role
                const [newRole] = await db.execute(
                    'INSERT INTO role (role_name) VALUES (?)',
                    ['Staff']
                );
                roleId = newRole.insertId;
                roleName = 'Staff';
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create account
        const [accountResult] = await db.execute(
            `INSERT INTO account (username, password, role_id, employee_id)
             VALUES (?, ?, ?, ?)`,
            [username, hashedPassword, roleId, employeeId]
        );

        const accountId = accountResult.insertId;

        // Generate token
        const token = jwt.sign(
            {
                account_id: accountId,
                employee_id: employeeId,
                username: username,
                role_id: roleId,
                role_name: roleName
            },
            process.env.JWT_SECRET || 'my_super_secret_key',
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                account_id: accountId,
                employee_id: employeeId,
                full_name: full_name,
                username: username,
                role_id: roleId,
                role_name: roleName
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: 'Lỗi server: ' + error.message
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