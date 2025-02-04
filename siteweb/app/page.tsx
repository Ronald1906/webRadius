"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const LoginForm = () => {
  const [inpUser, setInpUser] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

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

  // ✅ Generar la URL con los parámetros obtenidos
  const generateUrl = () => {
    if (!params.serverIp) {
      alert("Falta el parámetro 'ga_srvr' en la URL.");
      return;
    }

    const url = new URL(`http://${params.serverIp}:880/cgi-bin/hotspot_login.cgi`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    setGeneratedUrl(url.toString()); // Guarda la URL generada
    console.log("URL generada:", url.toString());
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <form onSubmit={(e) => { e.preventDefault(); generateUrl(); }} className="space-y-4">
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
          Generar URL
        </button>
      </form>

      {generatedUrl && (
        <div className="mt-4 p-2 bg-gray-200 rounded-md">
          <p className="text-sm">URL Generada:</p>
          <p className="text-blue-600 break-all">{generatedUrl}</p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
