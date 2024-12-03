import bcrypt from 'bcrypt';
import pool from '../db.js';

export const seedDatabase = async (req, res) => {
  try {
    await pool.query('DELETE FROM users');

    const users = [
      { name: 'Juan Pérez', email: 'juan@example.com', password: 'password123' },
      { name: 'Ana Gómez', email: 'ana@example.com', password: '1234password' },
      { name: 'Luis Martínez', email: 'luis@example.com', password: 'password456' },
      { name: 'Carlos Sánchez', email: 'carlos@example.com', password: 'mysecret789' },
      { name: 'María López', email: 'maria@example.com', password: 'maria123' },
      { name: 'Pedro Rodríguez', email: 'pedro@example.com', password: 'pedro1234' },
      { name: 'Laura Fernández', email: 'laura@example.com', password: 'laura5678' },
      { name: 'David García', email: 'david@example.com', password: 'davidqwerty' },
      { name: 'Marta Ruiz', email: 'marta@example.com', password: 'marta2020' },
      { name: 'Sergio González', email: 'sergio@example.com', password: 'sergio2020' },
      { name: 'Paula Jiménez', email: 'paula@example.com', password: 'paulaabcd' },
      { name: 'Javier Fernández', email: 'javier@example.com', password: 'javier1357' },
      { name: 'Raquel García', email: 'raquel@example.com', password: 'raquel987' },
      { name: 'Felipe Pérez', email: 'felipe@example.com', password: 'felipe098' },
      { name: 'Elena Sánchez', email: 'elena@example.com', password: 'elenaqwert' },
    ];

    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      await pool.query(query, [user.name, user.email, hashedPassword]);
    }

    res.status(200).send('Datos de seed insertados correctamente');
  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
    res.status(500).send('Error al ejecutar el seed');
  }
};
