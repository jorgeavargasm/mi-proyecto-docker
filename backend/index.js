const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'root',
    database: 'usuarios_db'
  });

  connection.connect(err => {
    if (err) {
      console.error('Error al conectar con MySQL:', err);
      setTimeout(handleDisconnect, 2000); // Reintenta en 2 segundos
    } else {
      console.log('✅ Conectado a MySQL');
    }
  });

  connection.on('error', err => {
    console.error('⚠️ Error en conexión MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
      handleDisconnect(); // Vuelve a conectar
    } else {
      throw err;
    }
  });
}

// Inicia conexión con reconexión automática

setTimeout(() => {

    handleDisconnect();

}, 3000); // Esperar 5 segundos

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  connection.query(
    'SELECT * FROM usuarios WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        res.json({ success: true, message: 'Login correcto' });
      } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`🚀 API escuchando en http://localhost:${port}`);
});
