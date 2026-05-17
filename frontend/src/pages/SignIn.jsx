// Importamos link para navegar entre páginas y useState para manejar el estado de los inputs
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate para redirigir al usuario después del login

export default function SignIn() {
  // Estado para manejar el correo y contraseña ingresados por el usuario
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  // Importamos useNavigate para poder redirigir al usuario después de un login exitoso
  const navigate = useNavigate();

  // Función para manejar el login cuando el usuario hace clic en el botón de continuar
  const handleLogin = () => {
    // Hacemos una solicitud POST al backend con el correo y contraseña ingresados por el usuario
    fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo,
        contrasena
      })
    })
      .then(res => res.json())
      .then(async data => {

        if (data.success) {

          const user = data.user;

          // CONSULTAR SI ES ADMIN
          const rolRes = await fetch(
            `http://localhost:3000/api/usuarios/${user.matricula}/rol-activo`
          );

          const rolData = await rolRes.json();

          // COMBINAR DATOS
          const fullUser = {
            ...user,
            esAdmin: rolData.esAdmin,
            rol: rolData.rol
          };

          // GUARDAR EN LOCALSTORAGE
          localStorage.setItem("usuario", JSON.stringify(fullUser));

          // REDIRIGIR
          navigate("/home");

        } else {
          alert(data.message);
        }

      }) // Agregamos un catch para manejar cualquier error que pueda ocurrir durante la solicitud
      .catch(err => {
        console.log(err);
        alert("Error en servidor");
      });
  };

  // Estructura del componente con inputs para correo y contraseña, botones para iniciar sesión y opciones de login social
  return (
    <div className="container">

      <h1 className="logo">
        <span className="pink">Vertice</span>
        <span className="gold">Passport</span>
      </h1>

      <h2>Iniciar sesión</h2>

      <p className="desc">
        Ingresa tu correo y contraseña para iniciar sesión
      </p>

      <div className="input-group">
        <span className="icon">

          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
          </svg>

        </span>
        <input // El input de correo tiene el tipo "email" para validar que el usuario ingrese un correo válido
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>

      <div className="input-group">
        <span className="icon">

          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-lock" viewBox="0 0 16 16">
            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 5.996V14H3s-1 0-1-1 1-4 6-4q.845.002 1.544.107a4.5 4.5 0 0 0-.803.918A11 11 0 0 0 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664zM9 13a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1" />
          </svg>

        </span>
        <input // El input de contraseña tiene el tipo "password" para ocultar lo que el usuario escribe
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
      </div>

      <p className="forgot">
        ¿Olvidaste tu contraseña?
      </p>
      <button className="main-btn" onClick={handleLogin}>
        Continuar
      </button>


      <div className="divider">
        <hr />
        <span>ó</span>
        <hr />
      </div>

      <div className="social-btns">
        <span className="social-icon">

          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
            <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
          </svg>
        </span>
        <button className="social google">Continuar con Google</button>
      </div>

      <div className="social-btns">
        <span className="social-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-apple" viewBox="0 0 16 16">
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
          </svg>
        </span>
        <button className="social apple">Continuar con Apple</button>
      </div>


      <p className="signup">
        ¿No tienes una cuenta? <span className="pink">Crear una cuenta</span>
      </p>
      <p className="footer">
        Al hacer clic en continuar, acepta nuestros Términos de servicio y Política de privacidad.
      </p>

    </div>
  );
}