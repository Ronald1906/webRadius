require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const radius = require('radius');
const dgram = require('dgram');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
const allowedOrigins = ['http://localhost:3000']; // Cambia por tus dominios permitidos
app.use(cors({ origin: allowedOrigins }));

// Middleware
app.use(express.json());

// Función para notificar al servidor RADIUS
const notifyRadius = (username) => {
  const packet = radius.encode({
    code: 'Access-Accept',
    secret: process.env.RADIUS_SECRET,
    attributes: [['User-Name', username]],
  });

  const client = dgram.createSocket('udp4');
  client.send(packet, 0, packet.length, process.env.RADIUS_PORT, process.env.RADIUS_SERVER, (err) => {
    if (err) {
      console.error('Error al notificar a RADIUS:', err);
    } else {
      console.log(`Notificación enviada a RADIUS para el usuario: ${username}`);
    }
    client.close();
  });
};

// Ruta: Registrar Usuario
app.post('/register', async (req, res) => {
  const { cedula, nombres, apellidos, genero, edad } = req.body;

  if (!cedula || !nombres || !apellidos || !genero || !edad) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(cedula, 10);

    // Registra en las tablas `persona` y `radcheck`
    await prisma.persona.create({
      data: {
        cedula,
        nombres,
        apellidos,
        genero,
        edad,
        radcheck: {
          create: {
            username: cedula,
            password: hashedPassword,
            attribute: 'Cleartext-Password',
            op: ':=',
            value: hashedPassword, // Por compatibilidad
          },
        },
      },
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta: Inicio de Sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  try {
    const user = await prisma.radcheck.findUnique({
      where: { username },
      include: { persona: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Notificar a RADIUS
    notifyRadius(username);

    res.status(200).json({ message: 'Inicio de sesión exitoso', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
