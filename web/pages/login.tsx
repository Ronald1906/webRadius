"use client";

import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { Image } from 'primereact/image'

export default function Login() {
    const searchParams = useSearchParams();
    const [formAction, setFormAction] = useState<string | null>(null);
    const [inpCedula, setInpCedula] = useState('');
    const [inpNombres, setInpNombres] = useState('')
    const [inpApellidos, setInpApellidos] = useState('')
    const [inpNacimiento, setInpNacimiento] = useState('')
    const [dlgInformativo, setDlgInformativo] = useState(true)
    const [slcGenero, setSlcGenero] = useState('')
    const [inpCorreo, setInpCorreo] = useState('')
    const [dlgRegistro, setDlgRegistro] = useState(false)

    const DrpGenero = [
        { value: 'FEMENINO' },
        { value: 'MASCULINO' }
    ]


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


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // 📌 Bloquear la recarga de la página

        if (!formAction) {
            return;
        }

        try {
            // ✅ Validar si el usuario tiene conexión activa
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
            finalUrl.searchParams.set("ga_user", inpCedula);
            finalUrl.searchParams.set("ga_pass", inpCedula);

            // ✅ Redirigir al usuario a la URL de autenticación
            window.location.replace(finalUrl.toString());
        } catch (error) {
            console.error("❌ Error al validar conexión:", error);
            alert("⚠️ No se pudo validar la conexión. Inténtelo más tarde.");
        }
    };


    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        // 📌 Validar que todos los campos requeridos están llenos
        if (!inpCedula || !inpNombres || !inpApellidos || !slcGenero || !inpNacimiento) {
            alert("⚠️ Todos los campos son obligatorios, excepto el correo.");
            return;
        }

        try {
            // ✅ Enviar la solicitud al endpoint correcto
            const response = await fetch("/api/auth/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: inpCedula.trim(),
                    nombres: inpNombres.toUpperCase().trim(),
                    apellidos: inpApellidos.toUpperCase().trim(),
                    genero: slcGenero,
                    nacimiento: inpNacimiento,
                    correo: inpCorreo ? inpCorreo.trim() : undefined, // No enviar si está vacío
                }),
            });

            // 📌 Manejar respuestas del servidor
            const data = await response.json();

            if (!response.ok) {
                alert(`❌ Error: ${data.error || "No se pudo registrar el usuario."}`);
                return;
            }

            alert("✅ Usuario registrado correctamente.");
        } catch (error) {
            console.error("❌ Error al registrar usuario:", error);
            alert("⚠️ No se pudo registrar el usuario. Inténtelo más tarde.");
        }
    };

    const CdlgRegistro = () => {
        setDlgRegistro(false)
        setInpCedula('')
        setInpNombres('')
        setInpApellidos('')
        setInpCorreo('')
        setInpNacimiento('')
        setSlcGenero('')
    }




    return (
        <div className="screen">
            <div className="containerCentered">
                <Image src="./logov2.png" />
                {/* FORMULARIOS CONDICIONALES */}
                <div className="formWrapper">
                    <div className="form" >
                        <h2>Iniciar Sesión</h2>
                        <form className="form-container" onSubmit={handleSubmit}>
                            <InputText type="text" placeholder="Cédula"
                                value={inpCedula}
                                required
                                onChange={(e) => setInpCedula(e.target.value)}
                            />
                            <Button label="Ingresar" type="submit" className="w-full py-2 border-round-md" severity="info" />
                        </form>
                    </div>
                </div>

                {/* BOTÓN PARA CAMBIAR ENTRE LOGIN Y REGISTRO */}
                <div className="toggleSection">
                    <p>
                        ¿Es tu primera vez en la red pública del GAD Provincial de Santo Domingo?{" "}
                        <span className="link" onClick={() => setDlgRegistro(true)}>Registrate</span> para obtener acceso.
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

            <Dialog visible={dlgRegistro} onHide={CdlgRegistro}
                className="dlgInformativo"
            >
                <div className="containerdlgReg">
                    <Image src="./logov2.png" />
                    <div className="formWrapper">
                        <div className="form">
                            <h2>Registro</h2>
                            <div className="form-container">
                                <span>Ingrese su cédula</span>
                                <InputText
                                    placeholder="Ejm: 2312... ..."
                                    value={inpCedula}
                                    required
                                    onChange={(e) => setInpCedula(e.target.value)}
                                />

                                <span>Ingrese sus nombres</span>
                                <InputText
                                    placeholder="Ingrese ...."
                                    value={inpNombres}
                                    required
                                    onChange={(e) => setInpNombres(e.target.value)}
                                />

                                <span>Ingrese sus apellidos</span>
                                <InputText
                                    placeholder="Ingrese ..."
                                    value={inpApellidos}
                                    required
                                    onChange={(e) => setInpApellidos(e.target.value)}
                                />

                                <span>Ingrese su fecha de nacimiento</span>
                                <InputText
                                    placeholder="Ingrese ..."
                                    value={inpNacimiento}
                                    required
                                    type="date"
                                    onChange={(e) => setInpNacimiento(e.target.value)}
                                />

                                <span>Ingrese el genero</span>
                                <Dropdown
                                    placeholder="Seleccione ..."
                                    options={DrpGenero}
                                    optionLabel="value"
                                    optionValue="value"
                                    className="drp"
                                    value={slcGenero}
                                    onChange={(e) => setSlcGenero(e.target.value)}
                                />

                                <span>Ingrese un correo (opcional)</span>
                                <InputText
                                    placeholder="Ingrese ..."
                                    value={inpCorreo}
                                    required
                                    type="email"
                                    onChange={(e) => setInpCorreo(e.target.value)}
                                />


                                <Button label="Registrarse" className="w-full py-2 border-round-md" severity="info" onClick={handleRegister} />
                            </div>

                        </div>
                    </div>
                    <div className="toggleSection">
                        <p>
                            ¿Ya tienes una cuenta? Inicia sesión para acceder a la red pública del GAD Provincial de Santo Domingo.{" "}
                            <span className="link" onClick={() => CdlgRegistro}>Ingresar</span>
                        </p>
                    </div>
                </div>
            </Dialog>


        </div>
    );
}
