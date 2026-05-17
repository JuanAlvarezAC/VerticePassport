import { slide as Menu } from "react-burger-menu";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFotoPerfil } from "../../hooks/useFotoPerfil";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Sidebar({ isOpen, setIsOpen }) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const matricula = usuario?.matricula;

    const [puntos, setPuntos] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [rolActivo, setRolActivo] = useState(null);
    const fotoAvatar = useFotoPerfil(perfil, matricula);

    useEffect(() => {
        if (!matricula) return;

        Promise.all([
            fetch(`${API}/usuarios/${matricula}/puntos`).then(r => r.json()),
            fetch(`${API}/usuarios/${matricula}/perfil`).then(r => r.json()),
            fetch(`${API}/usuarios/${matricula}/rol-activo`).then(r => r.json()),
        ]).then(([puntosData, perfilData, rolData]) => {
            setPuntos(puntosData);
            setPerfil(perfilData);
            setRolActivo(rolData);
        }).catch(err => console.error("Sidebar fetch error:", err));
    }, [matricula]);

    const nombreCompleto = perfil
        ? `${perfil.nombre} ${perfil.apellidos}`
        : usuario?.nombre ?? "—";

    return (
        <Menu
            right={false}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            customBurgerIcon={false}
        >
            <div className="sidebar-profile">
                <img
                    src={fotoAvatar}
                    alt="avatar"
                    className="sidebar-avatar"
                />
                <div>
                    <h3>{nombreCompleto}</h3>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#888" }}>
                        ID: # {matricula}
                    </p>
                    <p style={{ margin: "2px 0", fontSize: "15px", color: "var(--primary)" }}>
                        Rol: {rolActivo?.rol ?? "Miembro"}
                    </p>
                    <span className="points">
                        ⭐{puntos?.puntos_acumulados ?? "—"} pts
                    </span>
                </div>
            </div>

            <NavLink to="/activities" onClick={() => setIsOpen(false)}>Actividades</NavLink>
            <NavLink to="/calendar" onClick={() => setIsOpen(false)}>Calendario</NavLink>
            <NavLink to="/passport" onClick={() => setIsOpen(false)}>Passport</NavLink>
            <NavLink to="/help" onClick={() => setIsOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14" />
                </svg>{" "}Ayuda
            </NavLink>

            {/* Un solo link de Admin — solo visible si tiene rol de admin */}
            {rolActivo?.esAdmin && (
                <NavLink
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    style={{ color: "var(--primary)", fontWeight: "700" }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52z" />
                    </svg>{" "}Admin
                </NavLink>
            )}

            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("usuario");
                    window.location.href = "/";
                }}
            >
                Cerrar sesión
            </button>
        </Menu>
    );
}