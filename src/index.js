
import express from 'express'; 
import { PORT } from './config.js'; 
import userRoutes from './routes/users.routes.js'; 
import dbRoutes from './routes/db.routes.js'; 

const app = express(); 

app.use(express.json()); // Middleware para analizar los cuerpos JSON de los POST

app.use(userRoutes); // Rutas de usuario
app.use('/api', dbRoutes); // Rutas de la base de datos


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); 
});
