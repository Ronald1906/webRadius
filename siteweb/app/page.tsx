'use client';
import React, { FormEvent, useState, useTransition } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button'
import { Image } from 'primereact/image'
import axios from 'axios';

export default function Home() {
  const [dlgInfo, setDlgInfo] = useState(false);
  const [dlgRegister, setDlgRegister] = useState(false);
  const [inpUser, setInpUser] = useState('');
  const [inpPass, setInpPass] = useState('');

  const [trasitionLogin, setTransitionLogin] = useTransition()
  const [transitionRegister, setTransitionRegister] = useTransition()

  const CdlgRegister = () => {
    setDlgRegister(false);
  };

  const IniciarSesion = async (e: FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      // Realiza la solicitud al backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/login`, {
        username: inpUser.trim(),
        password: inpPass.trim(),
      });

      // Si la solicitud es exitosa, muestra el mensaje del backend
      if (response.status === 200) {
        alert(`Éxito: ${response.data.message}`);
        console.log("Usuario:", response.data.user); // Muestra los datos del usuario en consola
      }
    } catch (error: any) {
      // Manejo de errores
      if (error.response) {
        // Error retornado por el servidor
        alert(`Error: ${error.response.data.error}`);
      } else if (error.request) {
        // No se recibió respuesta del servidor
        alert("Error: No se pudo conectar con el servidor.");
      } else {
        // Error desconocido
        alert(`Error desconocido: ${error.message}`);
      }
      console.error(error);
    }
  };


  return (
    <>
      <div className="bodyLogin">
        {/* Imagen grande */}
        <div className="bodyLargeImage">
          {/* <Image src="/path/to/your/large-image.jpg" alt="Large View" width={500} height={500} /> */}
        </div>

        {/* Contenedor del formulario */}
        <div className="bodyForm">
          {/* Imagen encima del formulario (visible solo en pantallas pequeñas) */}
          <div className="image_form">
            {/* <Image src='https://gptsachila.gob.ec/images/tic_logos/logo_encabezado.png' alt="Form Image" width={100} height={100} /> */}
            <Image
              src='https://gptsachila.gob.ec/images/tic_logos/logo_encabezado.png'
              alt='logo_gadpsdt'
            />
          </div>

          <div className="container_form">
            <h2 style={{ textAlign: 'center', color: '#002b5c' }}>Inicio de Sesión</h2>
            <div className="formLogin">
              <form onSubmit={IniciarSesion}>
                <label>Ingres su cédula</label>
                <InputText
                  type="text"
                  placeholder="Ingrese ..."
                  value={inpUser}
                  onChange={(e) => setInpUser(e.target.value)}
                />
                <Button type='submit' label='Iniciar Sesión' severity='success' className='py-2' disabled={trasitionLogin} />
                <Button type='button' label='Registrarse' severity='info' className='py-2' />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogo para visualizar información */}
      <Dialog visible={dlgInfo} onHide={() => setDlgInfo(false)}>
        <p>Información importante</p>
      </Dialog>

      {/* Dialogo para registrar el usuario */}
      <Dialog visible={dlgRegister} onHide={CdlgRegister}>
        <p>Formulario de Registro</p>
      </Dialog>
    </>
  );
}
