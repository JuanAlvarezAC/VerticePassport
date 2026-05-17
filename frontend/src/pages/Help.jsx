import { NavLink } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";


export default function Help() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="app">
            <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

            {/* Header */}
            <div className="header">
                <span className="menu" onClick={() => setMenuOpen(true)}>☰</span>
                <h1>Ayuda</h1>
            </div>

            {/* Hero */}
            <div className="help-hero">
                <div className="help-hero-icon">🎓</div>
                <h2>Bienvenido a Vértice Passport</h2>
                <p>Aquí encontrarás todo lo que necesitas saber para usar la aplicación y aprovechar al máximo tu experiencia.</p>
            </div>

            {/* ── CÓMO REGISTRARSE ── */}
            <p className="help-section-title">Cómo empezar</p>

            <div className="card help-item">
                <div className="help-item-icon">🔐</div>
                <div className="help-item-body">
                    <h4>Iniciar sesión</h4>
                    <ul className="help-steps">
                        <li>
                            <span className="help-step-num">1</span>
                            Ingresa tu correo institucional y contraseña en la pantalla de inicio.
                        </li>
                        <li>
                            <span className="help-step-num">2</span>
                            También puedes continuar con tu cuenta de Google o Apple.
                        </li>
                        <li>
                            <span className="help-step-num">3</span>
                            Si olvidaste tu contraseña, toca "¿Olvidaste tu contraseña?" para recuperarla.
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── SECCIONES ── */}
            <p className="help-section-title">Secciones de la app</p>

            <div className="card help-item">
                <div className="help-item-icon">🏠</div>
                <div className="help-item-body">
                    <h4>Actividades</h4>
                    <p>Explora todas las actividades disponibles filtradas por tipo. Puedes ver los detalles de cada una e inscribirte directamente desde aquí.</p>
                </div>
            </div>

            <div className="card help-item">
                <div className="help-item-icon">📅</div>
                <div className="help-item-body">
                    <h4>Calendario</h4>
                    <p>Visualiza tus actividades inscritas y próximas en un calendario mensual. Cada color representa un estado diferente:</p>
                    <div className="help-status-row">
                        <span className="help-badge blue">🔵 Inscrita</span>
                        <span className="help-badge green">🟢 Completada</span>
                        <span className="help-badge pink">🔴 Próximamente</span>
                    </div>
                </div>
            </div>

            <div className="card help-item">
                <div className="help-item-icon">🪪</div>
                <div className="help-item-body">
                    <h4>Pasaporte</h4>
                    <p>Consulta tu progreso de graduación, actividades completadas, puntos acumulados y requisitos pendientes como talleres, seminarios y materias Vértice.</p>
                </div>
            </div>

            {/* ── ESTADOS DE ACTIVIDADES ── */}
            <p className="help-section-title">Estados de una actividad</p>

            <div className="card help-item">
                <div className="help-item-icon">📌</div>
                <div className="help-item-body">
                    <h4>¿Qué significa cada estado?</h4>
                    <div className="help-status-row" style={{ marginBottom: 8 }}>
                        <span className="help-badge pink">Disponible</span>
                        <span className="help-badge blue">Inscrito</span>
                        <span className="help-badge green">Completada</span>
                        <span className="help-badge gray">🔒 Cerrada</span>
                    </div>
                    <p>
                        <strong>Disponible:</strong> puedes inscribirte.<br />
                        <strong>Inscrito:</strong> ya estás registrado. Puedes desinscribirte desde los detalles.<br />
                        <strong>Completada:</strong> asististe y se registraron tus puntos.<br />
                        <strong>Cerrada:</strong> el cupo se agotó o la fecha ya pasó.
                    </p>
                </div>
            </div>

            {/* ── PUNTOS ── */}
            <p className="help-section-title">Puntos y recompensas</p>

            <div className="card help-item">
                <div className="help-item-icon">⭐</div>
                <div className="help-item-body">
                    <h4>¿Cómo gano puntos?</h4>
                    <p>Cada actividad tiene un valor en puntos que se acredita automáticamente cuando se confirma tu asistencia. Consulta tus puntos acumulados en la sección <strong>Pasaporte</strong>.</p>
                </div>
            </div>

            {/* ── SIDEBAR ── */}
            <p className="help-section-title">Menú lateral</p>

            <div className="card help-item">
                <div className="help-item-icon">☰</div>
                <div className="help-item-body">
                    <h4>¿Para qué sirve el menú?</h4>
                    <p>Toca el ícono <strong>☰</strong> en la esquina superior izquierda para abrir el menú lateral. Desde ahí puedes navegar entre secciones, ver tu perfil y cerrar sesión.</p>
                </div>
            </div>

            {/* ── CONTACTO ── */}
            <p className="help-section-title">¿Necesitas más ayuda?</p>

            <div className="card help-contact">
                <p>Si tienes dudas o encuentras algún problema, escríbenos y te ayudamos.</p>
                <a
                    href="mailto:soporte@vertice.edu.mx"
                    className="button primary"
                    style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                    </svg>
                    Contactar soporte
                </a>
            </div>

            <p className="help-version">Vértice Passport v1.0</p>

            {/* Bottom nav */}
            <div className="bottom-nav">
                <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
                    </svg>
                </NavLink>

                <NavLink to="/activities" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list-ul" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2" /> </svg>
                </NavLink>

                <NavLink to="/calendar" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-heart" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM1 14V4h14v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1m7-6.507c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132" />
                    </svg>
                </NavLink>

                <NavLink to="/passport" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0m-.5 4a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z" />
                        <path d="M3.232 1.776A1.5 1.5 0 0 0 2 3.252v10.95c0 .445.191.838.49 1.11.367.422.908.688 1.51.688h8a2 2 0 0 0 2-2V4a2 2 0 0 0-1-1.732v-.47A1.5 1.5 0 0 0 11.232.321l-8 1.454ZM4 3h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1" />
                    </svg>
                </NavLink>
            </div>
        </div>
    );
}