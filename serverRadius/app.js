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

app.use(cors());
app.use(express.json());

// Función para notificar al servidor RADIUS (1812 y 1813)
const notifyRadius = (username, apMac, nasId, clientMac, serverIp, secret) => {
  const sendRadiusPacket = (port, attributes) => {
    const packet = radius.encode({
      code: 'Access-Accept',
      secret: secret,
      attributes,
    });

    const client = dgram.createSocket('udp4');
    client.send(packet, 0, packet.length, port, serverIp, (err) => {
      if (err) {
        console.error(`Error notificando a RADIUS en puerto ${port}:`, err);
      } else {
        console.log(`Notificación enviada a RADIUS en puerto ${port} para ${username}`);
      }
      client.close();
    });
  };

  const attributes = [
    ['User-Name', username],
    ['Called-Station-Id', apMac], // MAC del AP
    ['Calling-Station-Id', clientMac], // MAC del usuario
    ['NAS-Identifier', nasId], // Identificador del AP
    ['Framed-IP-Address', '0.0.0.0'], // IP del servidor RADIUS
    ['Session-Timeout', 3600], // Tiempo de sesión (1 hora)
    ['Idle-Timeout', 600], // Tiempo de inactividad (10 minutos)
  ];

  // Notificar al puerto 1812 (autenticación)
  sendRadiusPacket(1812, attributes);

  // Notificar al puerto 1813 (accounting)
  sendRadiusPacket(1813, attributes);
};

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password, apMac, nasId, serverIp, clientMac } = req.body;

  if (!username || !password || !clientMac || !apMac || !serverIp) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // Verificar al usuario en la base de datos
    const user = await prisma.radcheck.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.value);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const secret = process.env.RADIUS_SECRET;
    if (!secret) {
      return res.status(403).json({ error: 'Punto de acceso no autorizado.' });
    }

    notifyRadius(username, apMac, nasId, clientMac, serverIp, secret);

    res.status(200).json({
      message: 'Acceso concedido. Usuario autenticado.',
    });
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// Ruta para registrar un usuario
app.post('/register', async (req, res) => {
  const { cedula, nombres, apellidos, genero, edad } = req.body;

  if (!cedula || !nombres || !apellidos || !genero || !edad) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si el usuario ya existe en radcheck
    const existingUser = await prisma.radcheck.findUnique({ where: { username: cedula } });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya está registrado.' });
    }

    // Hashear la cédula para la contraseña
    const hashedPassword = await bcrypt.hash(cedula, 10);

    // Insertar usuario en radcheck
    await prisma.radcheck.create({
      data: {
        username: cedula,
        attribute: 'Cleartext-Password',
        op: ':=',
        value: hashedPassword,
        nombres,
        apellidos,
        genero,
        edad: Number(edad),
      },
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
