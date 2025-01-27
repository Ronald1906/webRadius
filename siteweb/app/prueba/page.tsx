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

  alert(`apMac: ${apMac}, nasId: ${nasId}, serverIp: ${serverIp}, clientMac: ${clientMac}`)


  return (
    <div>
      <h2>Inicio de Sesión</h2>
      <form>
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
