const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT position_id, position_name FROM positions ORDER BY position_id');
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.execute('SELECT position_id, position_name FROM positions WHERE position_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy vị trí' });
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const { position_name } = req.body;
    if (!position_name) return res.status(400).json({ message: 'position_name là bắt buộc' });

    const [result] = await db.execute(
      'INSERT INTO positions (position_name) VALUES (?)',
      [position_name]
    );
    const newId = result.insertId;
    const [rows] = await db.execute('SELECT position_id, position_name FROM positions WHERE position_id = ?', [newId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { position_name } = req.body;

    const [exists] = await db.execute('SELECT position_id FROM positions WHERE position_id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ message: 'Không tìm thấy vị trí' });

    await db.execute('UPDATE positions SET position_name = ? WHERE position_id = ?', [position_name || exists[0].position_name, id]);
    const [rows] = await db.execute('SELECT position_id, position_name FROM positions WHERE position_id = ?', [id]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const [exists] = await db.execute('SELECT position_id FROM positions WHERE position_id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ message: 'Không tìm thấy vị trí' });

    await db.execute('DELETE FROM positions WHERE position_id = ?', [id]);
    return res.status(200).json({ message: 'Xóa vị trí thành công' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
