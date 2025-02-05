"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const Login = () => {
  const searchParams = useSearchParams();
  const [formAction, setFormAction] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Evita SSR

    const ga_srvr = searchParams.get("ga_srvr");
    if (!ga_srvr) {
      console.error("No se encontró el parámetro 'ga_srvr' en la URL.");
      return;
    }

    const generatedUrl = new URL(`http://${ga_srvr}:880/cgi-bin/hotspot_login.cgi`);

    // ✅ Agregar todos los parámetros de la URL a la nueva URL
    searchParams.forEach((value, key) => {
      generatedUrl.searchParams.set(key, value || "");
    });

    setFormAction(generatedUrl.toString()); // ✅ Actualiza la URL del formulario
    console.log("🚀 URL generada:", generatedUrl.toString());
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formAction) {
      alert("No se ha generado la URL de autenticación.");
      return;
    }

    // ✅ Crear un formulario manualmente para enviar los datos con POST
    const form = document.createElement("form");
    form.method = "POST";
    form.action = formAction;

    // ✅ Agregar inputs ocultos con los valores que se deben enviar
    searchParams.forEach((value, key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value || "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    // 🚀 Esperar la redirección automática, pero si no ocurre, forzarla
    setTimeout(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }, 3000); // Esperar 3 segundos para ver si la redirección ocurre automáticamente
  };

  return (
    <div className="container mx-auto flex flex-col gap-2 items-center p-2">
      {formAction ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-1 max-w-60 pb-2">
          <label htmlFor="ced">Ingresa tu número de cédula:</label>
          <input
            name="ga_user"
            placeholder="07xxxxxxx"
            className="border p-2"
            type="text"
            required
            minLength={10}
          />
          <input name="ga_pass" type="hidden" value="" />

          <button type="submit" className="bg-green-300 hover:brightness-110 px-4 py-2 rounded-2xl">
            Enviar
          </button>
        </form>
      ) : (
        <p className="text-red-500">Cargando parámetros de autenticación...</p>
      )}
    </div>
  );
};

export default Login;
