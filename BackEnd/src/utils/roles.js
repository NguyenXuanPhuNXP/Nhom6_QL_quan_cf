const normalizeRole = (role = '') =>
    String(role)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const isManagerRole = (role) => {
    const normalized = normalizeRole(role);
    return normalized === 'admin' || normalized === 'quan ly';
};

module.exports = { normalizeRole, isManagerRole };
