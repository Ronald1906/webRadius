'use client';
import React, { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const [inpUser, setInpUser] = useState('');
  const searchParams = useSearchParams();

  const apMac = searchParams.get('ga_ap_mac');
  const nasId = searchParams.get('ga_nas_id');
  const serverIp = searchParams.get('ga_srvr');
  const clientMac = searchParams.get('ga_cmac');

  const IniciarSesion = async (e: FormEvent) => {
    e.preventDefault();
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
        window.location.href = 'http://google.com';  // Redirigir al usuario tras el login
      }
    } catch (error) {
      alert('Error en el inicio de sesión.');
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>
      <form onSubmit={IniciarSesion}>
        <input type="text" placeholder="Usuario" value={inpUser} onChange={(e) => setInpUser(e.target.value)} />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}
