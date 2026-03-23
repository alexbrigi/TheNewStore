export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acceso restringido: solo administradores' });
  }
  next();
};
