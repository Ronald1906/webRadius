"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const Login = () => {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cedRef = useRef<HTMLInputElement>(null);

  // ✅ Obtener la URL del servidor RADIUS con los parámetros actuales
  const generateUrl = () => {
    const ga_srvr = searchParams.get("ga_srvr");
    if (!ga_srvr) {
      setError("No se encontró el parámetro 'ga_srvr' en la URL.");
      return;
    }

    const generatedUrl = new URL(`http://${ga_srvr}:880/cgi-bin/hotspot_login.cgi`);
    
    // ✅ Recorrer todos los parámetros de la URL y agregarlos a la nueva URL
    searchParams.forEach((value, key) => {
      generatedUrl.searchParams.set(key, value || "");
    });

    setUrl(generatedUrl.toString());
    console.log("URL generada:", generatedUrl.toString());
  };

  // ✅ Generar la URL cuando los parámetros de la URL cambien
  useEffect(() => {
    generateUrl();
  }, [searchParams]);

  return (
    <div className="container mx-auto flex flex-col gap-2 items-center p-2">
      <form method="post" action={url || "#"} className="flex flex-col gap-1 max-w-60 pb-2">
        <label htmlFor="ced">Ingresa tu número de cédula:</label>
        <input
          ref={cedRef}
          name="ga_user"
          placeholder="07xxxxxxx"
          className="border p-2"
          type="text"
          required
          minLength={10}
        />
        <input name="ga_pass" className="border hidden" type="hidden" value={cedRef.current?.value || ""} />

        {error && <span className="text-xs text-red-500">{error}</span>}

        <button type="submit" className="bg-green-300 hover:brightness-110 px-4 py-2 rounded-2xl">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Login;
