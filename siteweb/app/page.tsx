"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const LoginForm = () => {
  const [inpUser, setInpUser] = useState("");
  const searchParams = useSearchParams();

  const [params, setParams] = useState({
    apMac: "",
    nasId: "",
    serverIp: "",
    clientMac: "",
  });

  // ✅ Obtener parámetros de la URL en `useEffect`
  useEffect(() => {
    setParams({
      apMac: searchParams.get("ga_ap_mac") || "",
      nasId: searchParams.get("ga_nas_id") || "",
      serverIp: searchParams.get("ga_srvr") || "",
      clientMac: searchParams.get("ga_cmac") || "",
    });
  }, [searchParams]);

  // ✅ Función para generar y redirigir a la URL
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inpUser.trim()) {
      alert("Ingrese un usuario válido");
      return;
    }

    if (!params.serverIp) {
      alert("Falta el parámetro 'ga_srvr' en la URL.");
      return;
    }

    // ✅ Construcción de la URL
    const url = new URL(`http://${params.serverIp}:880/cgi-bin/hotspot_login.cgi`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    console.log("Redirigiendo a:", url.toString());

    // ✅ Redirigir al usuario a la URL generada
    window.location.href = url.toString();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Cédula:</label>
          <input
            type="text"
            value={inpUser}
            onChange={(e) => setInpUser(e.target.value)}
            className="w-full border p-2 rounded-md"
            required
            minLength={10}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
