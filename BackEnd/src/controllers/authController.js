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
                a.status,
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
if (account.status === 'Locked') {
    return res.status(403).json({
        message: 'Tài khoản đã bị khóa'
    });
}
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

        if (!username || !password || !confirmPassword || !full_name) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ các trường bắt buộc'
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
                message: 'Tên đăng nhập đã tồn tại'
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
            `INSERT INTO account (username, password, role_id, employee_id, status)
             VALUES (?, ?, ?, ?, 'Active')`,
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
        console.error("Register Error STACK:", error);
        return res.status(500).json({
            message: 'Lỗi server: ' + error.message,
            stack: error.stack
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


exports.updateAccount = async (req, res) => {

    try {

        const accountId = req.params.id;

        const {
            username,
            role_id,
            password
        } = req.body;

        // Kiểm tra tài khoản tồn tại

        const [accounts] = await db.execute(
            `
            SELECT *
            FROM account
            WHERE account_id = ?
            `,
            [accountId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({
                message: 'Tài khoản không tồn tại'
            });
        }

        // Kiểm tra username trùng

        if (username) {

            const [existUsername] =
                await db.execute(
                    `
                    SELECT account_id
                    FROM account
                    WHERE username = ?
                    AND account_id <> ?
                    `,
                    [username, accountId]
                );

            if (existUsername.length > 0) {
                return res.status(400).json({
                    message: 'Username đã tồn tại'
                });
            }
        }

        // Kiểm tra role

        if (role_id) {

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
        }

        let sql = `
            UPDATE account
            SET
                username = ?,
                role_id = ?
        `;

        const params = [
            username || accounts[0].username,
            role_id || accounts[0].role_id
        ];

        // Nếu đổi mật khẩu

        if (password) {

            const hashedPassword =
                await bcrypt.hash(password, 10);

            sql += `,
                password = ?
            `;

            params.push(hashedPassword);
        }

        sql += `
            WHERE account_id = ?
        `;

        params.push(accountId);

        await db.execute(sql, params);

        return res.status(200).json({
            message: 'Cập nhật tài khoản thành công'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};

exports.changeStatus = async (req, res) => {

    try {

        const accountId = req.params.id;
        const { status } = req.body;

        // Chỉ cho phép 2 trạng thái
        const validStatus = ['Active', 'Locked'];

        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Kiểm tra tài khoản tồn tại

        const [accounts] = await db.execute(
            `
            SELECT account_id
            FROM account
            WHERE account_id = ?
            `,
            [accountId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({
                message: 'Tài khoản không tồn tại'
            });
        }

        // Cập nhật trạng thái

        await db.execute(
            `
            UPDATE account
            SET status = ?
            WHERE account_id = ?
            `,
            [status, accountId]
        );

        return res.status(200).json({
            message:
                status === 'Locked'
                    ? 'Khóa tài khoản thành công'
                    : 'Mở khóa tài khoản thành công'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};

exports.getAllEmployees = async (req, res) => {

    try {

        const [rows] = await db.execute(`
            SELECT
                e.employee_id,
                e.full_name,
                e.gender,
                e.phone,
                e.address,
                e.salary_rate,
                e.created_at,
                p.position_name
            FROM employee e
            JOIN positions p
                ON e.position_id = p.position_id
            ORDER BY e.employee_id DESC
        `);

        return res.status(200).json(rows);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};
exports.getEmployeeById = async (req, res) => {

    try {

        const employeeId = req.params.id;

        const [rows] = await db.execute(
            `
            SELECT
                e.*,
                p.position_name
            FROM employee e
            JOIN positions p
                ON e.position_id = p.position_id
            WHERE e.employee_id = ?
            `,
            [employeeId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }

        return res.status(200).json(rows[0]);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};
exports.createEmployee = async (req, res) => {

    try {

        const {
            full_name,
            gender,
            phone,
            address,
            position_id,
            salary_rate
        } = req.body;

        if (
            !full_name ||
            !gender ||
            !position_id
        ) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu bắt buộc'
            });
        }

        const [phoneExist] =
            await db.execute(
                `
                SELECT employee_id
                FROM employee
                WHERE phone = ?
                `,
                [phone]
            );

        if (phoneExist.length > 0) {
            return res.status(400).json({
                message: 'Số điện thoại đã tồn tại'
            });
        }

        const [result] = await db.execute(
            `
            INSERT INTO employee
            (
                full_name,
                gender,
                phone,
                address,
                position_id,
                salary_rate
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                full_name,
                gender,
                phone,
                address,
                position_id,
                salary_rate || 0
            ]
        );

        return res.status(201).json({
            message: 'Thêm nhân viên thành công',
            employee_id: result.insertId
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};
exports.updateEmployee = async (req, res) => {

    try {

        const employeeId = req.params.id;

        const {
            full_name,
            gender,
            phone,
            address,
            position_id,
            salary_rate
        } = req.body;

        const [employees] =
            await db.execute(
                `
                SELECT *
                FROM employee
                WHERE employee_id = ?
                `,
                [employeeId]
            );

        if (employees.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }

        await db.execute(
            `
            UPDATE employee
            SET
                full_name = ?,
                gender = ?,
                phone = ?,
                address = ?,
                position_id = ?,
                salary_rate = ?
            WHERE employee_id = ?
            `,
            [
                full_name,
                gender,
                phone,
                address,
                position_id,
                salary_rate,
                employeeId
            ]
        );

        return res.status(200).json({
            message: 'Cập nhật nhân viên thành công'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Lỗi server'
        });

    }
};
exports.deleteEmployee = async (req, res) => {

    try {

        const employeeId = req.params.id;

        const [employees] =
            await db.execute(
                `
                SELECT employee_id
                FROM employee
                WHERE employee_id = ?
                `,
                [employeeId]
            );

        if (employees.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }

        await db.execute(
            `
            DELETE FROM employee
            WHERE employee_id = ?
            `,
            [employeeId]
        );

        return res.status(200).json({
            message: 'Xóa nhân viên thành công'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Không thể xóa nhân viên'
        });

    }
};