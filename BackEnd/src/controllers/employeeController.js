const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.employee_id, e.full_name, e.gender, e.phone, e.address, e.position_id, p.position_name, e.salary_rate, e.created_at
       FROM employee e
       LEFT JOIN positions p ON e.position_id = p.position_id
       ORDER BY e.employee_id`);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.execute(
      `SELECT e.employee_id, e.full_name, e.gender, e.phone, e.address, e.position_id, p.position_name, e.salary_rate, e.created_at
       FROM employee e
       LEFT JOIN positions p ON e.position_id = p.position_id
       WHERE e.employee_id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const { full_name, gender, phone, address, position_id, salary_rate } = req.body;
    
    if (!full_name) return res.status(400).json({ message: 'full_name là bắt buộc' });
    if (!position_id) return res.status(400).json({ message: 'position_id là bắt buộc' });

    // Validate position exists
    const [positions] = await db.execute('SELECT position_id FROM positions WHERE position_id = ?', [position_id]);
    if (positions.length === 0) return res.status(400).json({ message: 'Vị trí không tồn tại' });

    const [result] = await db.execute(
      `INSERT INTO employee (full_name, gender, phone, address, position_id, salary_rate, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [full_name, gender || null, phone || null, address || null, position_id, salary_rate || null]
    );

    const newId = result.insertId;
    const [rows] = await db.execute(
      `SELECT e.employee_id, e.full_name, e.gender, e.phone, e.address, e.position_id, p.position_name, e.salary_rate, e.created_at
       FROM employee e
       LEFT JOIN positions p ON e.position_id = p.position_id
       WHERE e.employee_id = ?`,
      [newId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { full_name, gender, phone, address, position_id, salary_rate } = req.body;

    const [exists] = await db.execute(
      `SELECT e.*, p.position_name FROM employee e LEFT JOIN positions p ON e.position_id = p.position_id WHERE e.employee_id = ?`, 
      [id]
    );
    if (exists.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

    const emp = exists[0];
    const newPositionId = position_id || emp.position_id;
    
    // Validate position if provided
    if (position_id) {
      const [positions] = await db.execute('SELECT position_id FROM positions WHERE position_id = ?', [position_id]);
      if (positions.length === 0) return res.status(400).json({ message: 'Vị trí không tồn tại' });
    }

    await db.execute(
      `UPDATE employee SET full_name = ?, gender = ?, phone = ?, address = ?, position_id = ?, salary_rate = ? WHERE employee_id = ?`,
      [full_name || emp.full_name, gender !== undefined ? gender : emp.gender, phone || emp.phone, address || emp.address, newPositionId, salary_rate !== undefined ? salary_rate : emp.salary_rate, id]
    );

    const [rows] = await db.execute(
      `SELECT e.employee_id, e.full_name, e.gender, e.phone, e.address, e.position_id, p.position_name, e.salary_rate, e.created_at
       FROM employee e
       LEFT JOIN positions p ON e.position_id = p.position_id
       WHERE e.employee_id = ?`,
      [id]
    );
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const [exists] = await db.execute('SELECT employee_id FROM employee WHERE employee_id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

    await db.execute('DELETE FROM employee WHERE employee_id = ?', [id]);
    return res.status(200).json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
