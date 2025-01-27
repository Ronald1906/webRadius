'use client';
import React, { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const [inpUser, setInpUser] = useState('');
  const searchParams = useSearchParams();

  // Obtener parámetros de la URL de redirección del AP
  const apMac = searchParams.get('ga_ap_mac');
  const nasId = searchParams.get('ga_nas_id');
  const serverIp = searchParams.get('ga_srvr');
  const clientMac = searchParams.get('ga_cmac');

  const IniciarSesion = async (e: FormEvent) => {
    e.preventDefault();

    if (!inpUser.trim()) {
      alert('Ingrese un usuario válido');
      return;
    }

    if (!apMac || !nasId || !serverIp || !clientMac) {
      alert('Faltan parámetros necesarios en la URL.');
      return;
    }

    try {
      // Enviar los datos al backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/login`, {
        username: inpUser.trim(),
        password: inpUser.trim(),
        apMac,
        nasId,
        serverIp,
        clientMac,
      });

      if (response.status === 200) {
        alert('Inicio de sesión exitoso. Redirigiendo...');
        // Redirigir al portal de éxito o permitir acceso
        window.location.href = `http://${serverIp}:3990/logout`; // Cambia esto si el servidor requiere otra ruta
      }
    } catch (error: any) {
      // Manejar errores del backend
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Error desconocido al iniciar sesión.');
      }
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>
      <form onSubmit={IniciarSesion}>
        <input
          type="text"
          placeholder="Usuario"
          value={inpUser}
          onChange={(e) => setInpUser(e.target.value)}
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}
