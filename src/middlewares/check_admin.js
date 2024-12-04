// middlewares/check_admin.js
const checkAdmin = (req, res, next) => {
    const { user } = req;
  
    if (!user) {
      return res.status(401).json({ error: 'No autorizado, no se encuentra autenticado' });
    }
  
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'No tiene permiso para acceder a esta ruta' });
    }
  
    next();
  };
  
  export default checkAdmin;
  