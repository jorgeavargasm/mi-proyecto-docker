const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const Redis = require('ioredis');
const redis = new Redis({
  host: 'redis', // este es el nombre del servicio del contenedor
  port: 6379
});


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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login correcto
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const redisKey = `user:${username}`;

  try {
    // Revisa si existe en Redis
    const cachedUser = await redis.get(redisKey);

    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      if (user.password === password) {
        return res.json({ success: true, message: 'Login correcto (desde Redis)' });
      } else {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas (Redis)' });
      }
    }

    // Si no está en Redis, consultar MySQL
    connection.query(
      'SELECT * FROM usuarios WHERE username = ? AND password = ?',
      [username, password],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
          // Guarda en Redis por 10 minutos (600 segundos)
          await redis.set(redisKey, JSON.stringify(results[0]), 'EX', 600);
          res.json({ success: true, message: 'Login correcto (desde MySQL)' });
        } else {
          res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor con Redis/MySQL' });
  }
});


app.get('/', (req, res) => {
  res.send('👋 Bienvenido a la API de usuarios');
});

// Opciones de configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuarios',
      version: '1.0.0',
      description: 'Documentación de la API de login de usuarios'
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'], // O el archivo donde están tus rutas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`🚀 API escuchando en http://localhost:${port}`);

  /*redis.on('connect', () => {
    console.log('🔌 Conectando a Redis...');
  });*/
  
  redis.on('ready', () => {
    console.log('✅ Conectado a Redis');
  });
  
  redis.on('error', (err) => {
    console.error('❌ Error en la conexión con Redis:', err);
  });
  
});
