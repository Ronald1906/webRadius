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
const allowedOrigins = ['http://192.168.1.50:5001']; // Cambia por tus dominios permitidos
app.use(cors({ origin: allowedOrigins }));

// Middleware
app.use(express.json());

// Función para notificar al servidor RADIUS
const notifyRadius = (username, secret, clientIp) => {
  const packet = radius.encode({
    code: 'Access-Accept',
    secret: secret, // Secret del punto de acceso (registrado en clients.conf)
    attributes: [
      ['User-Name', username],
      ['NAS-IP-Address', clientIp], // Opcional: IP del NAS que origina la solicitud
    ],
  });

  const client = dgram.createSocket('udp4');
  client.send(packet, 0, packet.length, process.env.RADIUS_PORT, process.env.RADIUS_SERVER, (err) => {
    if (err) {
      console.error('Error al notificar al servidor RADIUS:', err);
    } else {
      console.log(`Notificación enviada a RADIUS para el usuario: ${username}`);
    }
    client.close();
  });
};

app.post('/login', async (req, res) => {
  const { username, password, ssid, apMac, nasId, serverIp, clientMac } = req.body;
  console.log(req.body)

  if (!username || !password || !clientMac || !apMac) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // Validar usuario
    const user = await prisma.radcheck.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.value);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Notificar al servidor RADIUS
    const secret = 'radius'
    if (!secret) {
      return res.status(403).json({ error: 'Punto de acceso no autorizado' });
    }

    const packet = radius.encode({
      code: 'Access-Accept',
      secret,
      attributes: [
        ['User-Name', username],
        ['Called-Station-Id', apMac],
        ['Calling-Station-Id', clientMac],
        ['NAS-Identifier', nasId],
        ['Framed-IP-Address', serverIp],
      ],
    });

    const client = dgram.createSocket('udp4');
    client.send(packet, 0, packet.length, process.env.RADIUS_PORT, serverIp, (err) => {
      if (err) {
        console.error('Error al notificar al servidor RADIUS:', err);
        res.status(500).json({ error: 'Error al notificar al servidor RADIUS' });
      } else {
        console.log(`Notificación enviada para ${username}`);
        res.status(200).json({ message: 'Acceso otorgado' });
      }
      client.close();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});


// Ruta: Registrar Usuario
app.post('/register', async (req, res) => {
  const { cedula, nombres, apellidos, genero, edad } = req.body;

  if (!cedula || !nombres || !apellidos || !genero || !edad) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    await prisma.persona.create({
      data: {
        cedula: cedula,
        nombres: nombres,
        apellidos: apellidos,
        genero: genero,
        edad: edad,
        radcheck: {
          create: {
            attribute: 'Cleartext-Password',
            op: ':=',
            value: await bcrypt.hash(cedula, 10), // Contraseña encriptada
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

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
