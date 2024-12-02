// Usa import para cargar los módulos (cuando se usa ESM)
import express from 'express'; // Importa Express
import { PORT } from './config.js'; // Importa configuraciones, por ejemplo, el puerto
import userRoutes from './routes/users.routes.js'; // Importa las rutas de usuario
import dbRoutes from './routes/db.routes.js'; // Importa las rutas de la base de datos

const app = express(); // Crea una instancia de la aplicación Express

// Usa las rutas en el servidor
app.use(userRoutes); // Rutas de usuario
app.use('/api', dbRoutes); // Rutas de la base de datos

// Levanta el servidor en el puerto configurado
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Mensaje cuando el servidor esté corriendo
});
