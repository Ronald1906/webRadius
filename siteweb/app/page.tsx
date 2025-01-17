'use client';

import React, { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const searchParams = useSearchParams();

  const ssid = searchParams.get('ga_ssid');
  const apMac = searchParams.get('ga_ap_mac');
  const nasId = searchParams.get('ga_nas_id');
  const serverIp = searchParams.get('ga_srvr');
  const clientMac = searchParams.get('ga_cmac');

  const [inpUser, setInpUser] = useState('');
  const [inpPass, setInpPass] = useState('');
  const [message, setMessage] = useState('');

  const IniciarSesion = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/login`, {
        username: inpUser.trim(),
        password: inpUser.trim(),
        ssid,
        apMac,
        nasId,
        serverIp,
        clientMac,
      });

      if (response.status === 200) {
        setMessage('Inicio de sesión exitoso. Conectando...');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error al iniciar sesión.');
    }
  };

  return (
    <div>
      <h1>Inicio de Sesión</h1>
      <form onSubmit={IniciarSesion}>
        <label>Usuario:</label>
        <input
          type="text"
          value={inpUser}
          onChange={(e) => setInpUser(e.target.value)}
        />
        <label>Contraseña:</label>
        <input
          type="password"
          value={inpPass}
          onChange={(e) => setInpPass(e.target.value)}
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
