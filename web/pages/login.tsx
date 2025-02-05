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

    const handleSubmit = (e: React.FormEvent) => {
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
