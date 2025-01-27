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

    try {
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
        window.location.href = `http://${serverIp}:3990/logout`;  // Redirigir al portal de éxito
      }
    } catch (error) {
      alert('Error en el inicio de sesión.');
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
