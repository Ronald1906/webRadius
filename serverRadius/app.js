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

// Función para notificar al servidor RADIUS
const notifyRadius = (username, apMac, nasId, clientMac, serverIp, secret) => {
  const packet = radius.encode({
    code: 'Access-Accept',
    secret: secret,
    attributes: [
      ['User-Name', username],
      ['Called-Station-Id', apMac],  // MAC del AP
      ['Calling-Station-Id', clientMac], // MAC del usuario
      ['NAS-Identifier', nasId], // Identificador del AP
      ['Framed-IP-Address', serverIp], // IP del servidor RADIUS
    ],
  });

  const client = dgram.createSocket('udp4');
  client.send(packet, 0, packet.length, process.env.RADIUS_PORT, serverIp, (err) => {
    if (err) {
      console.error('Error notificando a RADIUS:', err);
    } else {
      console.log(`Acceso concedido para ${username} en AP ${apMac}`);
    }
    client.close();
  });
};

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password, apMac, nasId, serverIp, clientMac } = req.body;

  if (!username || !password || !clientMac || !apMac || !serverIp) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    const user = await prisma.radcheck.findUnique({
      where: { username },
      include: {
        persona: true,  // Incluye los datos de la relación con persona
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.value);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const secret = process.env.RADIUS_SECRET;
    if (!secret) {
      return res.status(403).json({ error: 'Punto de acceso no autorizado' });
    }

    notifyRadius(username, apMac, nasId, clientMac, serverIp, secret);

    res.status(200).json({
      message: 'Acceso concedido',
      nombres: user.persona?.nombres,
      apellidos: user.persona?.apellidos,
    });
  } catch (err) {
    console.error(err);
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
    // Verificar si la persona ya existe
    const existingPerson = await prisma.persona.findUnique({
      where: { cedula },
    });

    if (existingPerson) {
      return res.status(400).json({ error: 'La persona ya está registrada.' });
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
        persona: {
          create: {
            cedula,
            nombres,
            apellidos,
            genero,
            edad: Number(edad),
          },
        },
      },
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error('Error al registrar:', err);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
