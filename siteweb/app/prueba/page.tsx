'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        setIp(data.ip);
      } catch (error) {
        console.error('Error obteniendo la IP:', error);
      }
    };

    fetchIp();
  }, []);

  return (
    <div>
      <h1>Tu IP Pública</h1>
      <p>{ip ? `IP: ${ip}` : 'Obteniendo IP...'}</p>
    </div>
  );
}
