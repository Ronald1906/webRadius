"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Login() {
    const searchParams = useSearchParams();
    const [inpCedula, setInpCedula] = useState('');
    const [formAction, setFormAction] = useState<string | null>(null);

    useEffect(() => {
        const ga_srvr = searchParams.get("ga_srvr");
        if (!ga_srvr) return;

        const url = new URL(`http://${ga_srvr}:880/cgi-bin/hotspot_login.cgi`);

        // ✅ Agregar los parámetros actuales de la URL
        searchParams.forEach((value, key) => {
            url.searchParams.set(key, value || '');
        });

        setFormAction(url.toString()); // ✅ Actualizar la URL del formulario
    }, [searchParams]);

    const handleSubmis = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formAction) return;

        // ✅ Agregar usuario y contraseña a la URL antes de enviar
        const finalUrl = new URL(formAction);
        finalUrl.searchParams.set('ga_user', inpCedula);
        finalUrl.searchParams.set('ga_pass', inpCedula);

        console.log("🚀 URL generada:", finalUrl.toString());

        // ✅ Redirigir al usuario a la URL de autenticación
        window.location.replace(finalUrl.toString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formAction) return;

        // ✅ Crear la URL con los parámetros
        const finalUrl = new URL(formAction);
        finalUrl.searchParams.set('ga_user', inpCedula);
        finalUrl.searchParams.set('ga_pass', inpCedula);

        console.log("🚀 Enviando datos a:", finalUrl.toString());

        try {
            // ✅ Hacer la petición con fetch
            const response = await fetch(finalUrl.toString(), {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Algunos servidores requieren esto
            });

            const textResponse = await response.text(); // Captura la respuesta

            if (response.ok) {
                console.log("✅ Acceso concedido, redirigiendo...");
                window.location.href = "http://www.google.com"; // Puedes cambiarlo por la URL que necesites
            } else {
                console.error("⚠️ Error de autenticación:", textResponse);
                alert(`⚠️ Acceso denegado: ${textResponse}`);
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            alert("⚠️ No se pudo conectar con el servidor. Inténtelo más tarde.");
        }
    };


    return (
        <div className="bodyLogin">
            <div className="container">
                <h2>Inicio de Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ingrese la cédula"
                        value={inpCedula}
                        onChange={(e) => setInpCedula(e.target.value)}
                    />
                    <button type="submit">Ingresar</button>
                </form>
            </div>
        </div>
    );
}
