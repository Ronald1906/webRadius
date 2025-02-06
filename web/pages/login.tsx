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
    const [slcGenero, setSlcGenero] = useState('')
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

    /*const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formAction) return;

        // ✅ Agregar usuario y contraseña a la URL antes de enviar
        const finalUrl = new URL(formAction);
        finalUrl.searchParams.set('ga_user', inpCedula);
        finalUrl.searchParams.set('ga_pass', inpCedula);

        console.log("🚀 URL generada:", finalUrl.toString());

        // ✅ Redirigir al usuario a la URL de autenticación
        window.location.replace(finalUrl.toString());
    };*/

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formAction) return;

        // ✅ Crear la URL con los parámetros
        const finalUrl = new URL(formAction);
        finalUrl.searchParams.set('ga_user', inpCedula);
        finalUrl.searchParams.set('ga_pass', inpCedula);

        console.log(finalUrl)

        console.log("🚀 Enviando datos a:", finalUrl.toString());

        /*try {
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
        }*/
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
                            <input type="text" placeholder="Cédula" />
                            <input type="text" placeholder="Nombres" />
                            <input type="text" placeholder="Apellidos" />
                            <input type="date" placeholder="Fecha de Nacimiento" />
                            <select value={slcGenero} onChange={(e) => setSlcGenero(e.target.value)} className="selectInput">
                                <option value="">Selecciona tu género</option>
                                <option value="masculino">Masculino</option>
                                <option value="femenino">Femenino</option>
                            </select>
                            <Button label="Registrarse" className="w-full py-2 border-round-md" severity="info" />
                        </div>
                    ) : (
                        <div className="form">
                            <h2>Iniciar Sesión</h2>
                            <input type="text" placeholder="Cédula" />
                            <Button label="Ingresar" className="w-full py-2 border-round-md" severity="info" onClick={handleSubmit}/>
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
