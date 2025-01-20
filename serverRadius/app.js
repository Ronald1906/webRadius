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

app.post('/login', async (req, res) => {
  const { username, password, apMac, nasId, serverIp, clientMac } = req.body;

  if (!username || !password || !clientMac || !apMac || !serverIp) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
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

    const secret = process.env.RADIUS_SECRET

    if (!secret) {
      return res.status(403).json({ error: 'Punto de acceso no autorizado' });
    }

    notifyRadius(username, apMac, nasId, clientMac, serverIp, secret);

    res.status(200).json({ message: 'Acceso concedido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
