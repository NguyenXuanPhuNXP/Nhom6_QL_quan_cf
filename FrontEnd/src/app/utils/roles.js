export const normalizeRole = (role = '') =>
  String(role)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const isManager = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'quan ly';
};
