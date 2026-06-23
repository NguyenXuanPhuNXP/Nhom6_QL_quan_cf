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