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
  const [message, setMessage] = useState('')
  const [trasitionLogin, setTransitionLogin] = useTransition()
  

  const CdlgRegister = () => {
    setDlgRegister(false);
  };


  const IniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/login`, {
        username: inpUser.trim(),
        password: inpPass.trim(),
      });

      // Si es exitoso, notifica al usuario y deja el acceso
      if (response.status === 200) {
        setMessage('Inicio de sesión exitoso. Conectando...');
        // No es necesaria redirección; el AP otorga acceso automáticamente.
        setTimeout(() => {
          window.location.reload(); // Refresca para liberar el portal
        }, 2000);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error al iniciar sesión.');
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
