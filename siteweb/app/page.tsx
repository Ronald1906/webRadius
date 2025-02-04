"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const LoginForm = () => {
  const [ced, setCed] = useState<string>("1105008369");
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams(); // Para obtener parámetros de la URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ced.length < 10) {
      setError("La cédula debe tener al menos 10 caracteres.");
      return;
    }

    setError(null);

    const ga_srvr = searchParams.get("ga_srvr");
    if (!ga_srvr) {
      setError("Falta el parámetro 'ga_srvr' en la URL.");
      return;
    }

    const apiUrl = `http://${ga_srvr}:880/cgi-bin/hotspot_login.cgi`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ced }),
      });

      if (!response.ok) throw new Error("Error en la autenticación");

      console.log("Login exitoso");
    } catch (error) {
      console.error(error);
      setError("No se pudo iniciar sesión.");
    }
  };

  const generateUrl = () => {
    const ga_srvr = searchParams.get("ga_srvr");
    if (!ga_srvr) return null;

    const url = new URL(`http://${ga_srvr}:880/cgi-bin/hotspot_login.cgi`);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    console.log(url.toString());
    return url.toString();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Cédula:</label>
          <input
            type="text"
            value={ced}
            onChange={(e) => setCed(e.target.value)}
            className="w-full border p-2 rounded-md"
            required
            minLength={10}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Iniciar sesión
        </button>
      </form>

      <button
        onClick={generateUrl}
        className="mt-4 text-blue-500 underline"
      >
        Generar URL
      </button>
    </div>
  );
};

export default LoginForm;
