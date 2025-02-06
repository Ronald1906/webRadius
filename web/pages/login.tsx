"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Dialog } from 'primereact/dialog'
import { Image } from 'primereact/image'

export default function Login() {
    const searchParams = useSearchParams();
    const [formAction, setFormAction] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [inpCedula, setInpCedula] = useState('');
    const [inpNombres, setInpNombres] = useState('')
    const [inpApellidos, setInpApellidos] = useState('')
    const [inpNacimiento, setInpNacimiento] = useState('')
    const [dlgInformativo, setDlgInformativo] = useState(true)


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

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!formAction) return;

    //     // ✅ Agregar usuario y contraseña a la URL antes de enviar
    //     const finalUrl = new URL(formAction);
    //     finalUrl.searchParams.set('ga_user', inpCedula);
    //     finalUrl.searchParams.set('ga_pass', inpCedula);

    //     // ✅ Redirigir al usuario a la URL de autenticación
    //     window.location.replace(finalUrl.toString());
    // };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formAction) return;

        try {
            // ✅ Primero validar si el usuario tiene conexión activa
            const validateResponse = await fetch("/api/auth/user/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: inpCedula }),
            });

            const validateData = await validateResponse.json();

            if (validateResponse.status !== 200) {
                // ❌ Si la validación falla, mostrar alerta con el error
                alert(`Error: ${validateData.error}`);
                return;
            }

            // ✅ Si la validación fue exitosa, construir la URL y redirigir
            const finalUrl = new URL(formAction);
            finalUrl.searchParams.set('ga_user', inpCedula);
            finalUrl.searchParams.set('ga_pass', inpCedula);

            console.log("🚀 URL generada:", finalUrl.toString());

            // ✅ Redirigir al usuario a la URL de autenticación
            window.location.replace(finalUrl.toString());

        } catch (error) {
            console.error("❌ Error al validar conexión:", error);
            alert("⚠️ No se pudo validar la conexión. Inténtelo más tarde.");
        }
    };



    return (
        <div className="screen">
            <div className="containerCentered">
                <Image src="./logov2.png" />
                {/* FORMULARIOS CONDICIONALES */}
                <div className="formWrapper">
                    {isRegistering ? (
                        <div className="form">
                            <h2>Registro</h2>
                            <span>Ingrese su cédula</span>
                            <InputText
                                placeholder="Ejm: 2312... ..."
                                value={inpCedula}
                                onChange={(e) => setInpCedula(e.target.value)}
                            />

                            <span>Ingrese sus nombres</span>
                            <InputText
                                placeholder="Ingrese ...."
                                value={inpNombres}
                                onChange={(e) => setInpNombres(e.target.value)}
                            />

                            <InputText
                                placeholder="Ingrese sus apellidos"
                                value={inpApellidos}
                                onChange={(e) => setInpApellidos(e.target.value)}
                            />

                            <InputText
                                placeholder="Ingrese su fecha de nacimiento"
                                value={inpNacimiento}
                                type="date"
                                onChange={(e) => setInpNacimiento(e.target.value)}
                            />

                            <Button label="Registrarse" className="w-full py-2 border-round-md" severity="info" />
                        </div>
                    ) : (
                        <div className="form" >
                            <h2>Iniciar Sesión</h2>
                            <form className="form-container" onSubmit={handleSubmit}>
                                <InputText type="text" placeholder="Cédula"
                                    value={inpCedula}
                                    required
                                    onChange={(e) => setInpCedula(e.target.value)}
                                />
                                <Button label="Ingresar" className="w-full py-2 border-round-md" severity="info" />
                            </form>
                        </div>
                    )}
                </div>

                {/* BOTÓN PARA CAMBIAR ENTRE LOGIN Y REGISTRO */}
                <div className="toggleSection">
                    <p>
                        {isRegistering ? (
                            <>
                                ¿Ya tienes una cuenta? Inicia sesión para acceder a la red pública del GAD Provincial de Santo Domingo.{" "}
                                <span className="link" onClick={() => setIsRegistering(false)}>Ingresar</span>
                            </>
                        ) : (
                            <>
                                ¿Es tu primera vez en la red pública del GAD Provincial de Santo Domingo?{" "}
                                <span className="link" onClick={() => setIsRegistering(true)}>Registrarse</span> para obtener acceso.
                            </>
                        )}
                    </p>
                </div>
            </div>
            <Dialog visible={dlgInformativo} onHide={() => setDlgInformativo(false)}
                className="dlgInformativo" headerClassName="dlgheader"
            >
                <div className="container-informativo">
                    <Image src="./artes/1.jpeg" className="" />
                </div>

            </Dialog>
        </div>
    );
}
