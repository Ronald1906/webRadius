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
const allowedOrigins = ['http://192.168.4.136:5001']; // Cambia por tus dominios permitidos
app.use(cors({ origin: allowedOrigins }));

// Middleware
app.use(express.json());


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
            attribute: "Cleartext-Password",
            op: ":=",
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


// Notificar al servidor RADIUS
const notifyRadius = (username, secret, ip) => {
  const packet = radius.encode({
    code: 'Access-Accept',
    secret: secret, // Secret del punto de acceso
    attributes: [['User-Name', username]],
  });

  const client = dgram.createSocket('udp4');
  client.send(packet, 0, packet.length, process.env.RADIUS_PORT, ip, (err) => {
    if (err) {
      console.error('Error al notificar a RADIUS:', err);
    } else {
      console.log(`Notificación enviada a RADIUS para el usuario: ${username}`);
    }
    client.close();
  });
};

// Ruta: Inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  try {
    // Validar usuario en la tabla `radcheck`
    const user = await prisma.radcheck.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.value);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Obtener IP y secret del cliente (desde `clients.conf` o mapeo manual)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const clientSecret = process.env[`SECRET_${clientIp.replace(/\./g, '_')}`]; // Mapeo dinámico

    if (!clientSecret) {
      return res.status(403).json({ error: 'Punto de acceso no autorizado' });
    }

    // Notificar al servidor RADIUS
    notifyRadius(username, clientSecret, clientIp);

    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
