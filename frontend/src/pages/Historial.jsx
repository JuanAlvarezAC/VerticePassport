import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useFotoPerfil } from "../hooks/useFotoPerfil";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Historial() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [perfil, setPerfil] = useState(null);
    const [puntosTotales, setPuntosTotales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("Todas");

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const matricula = usuario?.matricula;
    const fotoAvatar = useFotoPerfil(perfil, matricula);
    const navigate = useNavigate();

    useEffect(() => {
        if (!matricula) { navigate("/"); return; }

        Promise.all([
            fetch(`${API}/usuarios/${matricula}/historial`).then(r => r.json()),
            fetch(`${API}/usuarios/${matricula}/perfil`).then(r => r.json()),
            fetch(`${API}/usuarios/${matricula}/puntos`).then(r => r.json()),
        ]).then(([historialData, perfilData, puntosData]) => {
            setHistorial(historialData);
            setPerfil(perfilData);
            setPuntosTotales(puntosData.puntos_acumulados ?? 0);
        }).catch(err => console.error(err))
          .finally(() => setLoading(false));
    }, [matricula]);

    const tipos = ["Todas", ...new Set(historial.map(h => h.nombre_tipo))];

    const historialFiltrado = filtro === "Todas"
        ? historial
        : historial.filter(h => h.nombre_tipo === filtro);

    return (
        <div className="app">
            <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

            {/* Header */}
            <div className="header">
                <span className="menu" onClick={() => setMenuOpen(true)}>☰</span>
                <h1>Mi historial</h1>
                <img src={fotoAvatar} alt="avatar" className="avatar small-avatar" />
            </div>

            {/* Resumen rápido */}
            <div style={{
                display: "flex",
                gap: "12px",
                margin: "0 16px 4px",
            }}>
                <div className="card" style={{ flex: 1, margin: 0, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textTransform: "uppercase" }}>Actividades</p>
                    <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "var(--primary)" }}>
                        {historial.length}
                    </p>
                </div>
                <div className="card" style={{ flex: 1, margin: 0, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textTransform: "uppercase" }}>Puntos totales</p>
                    <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "700", color: "var(--gold)" }}>
                        ⭐ {puntosTotales}
                    </p>
                </div>
            </div>

            {/* Tabs por tipo */}
            <div className="tabs">
                {tipos.map(tipo => (
                    <button
                        key={tipo}
                        className={`tab ${filtro === tipo ? "active" : ""}`}
                        onClick={() => setFiltro(tipo)}
                    >
                        {tipo}
                    </button>
                ))}
            </div>

            {/* Lista — mismo estilo que Activities */}
            <div className="container">
                {loading && (
                    <p style={{ textAlign: "center", marginTop: "2rem", color: "#aaa" }}>
                        Cargando historial...
                    </p>
                )}

                {!loading && historialFiltrado.length === 0 && (
                    <p style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
                        No hay actividades en esta categoría.
                    </p>
                )}

                {historialFiltrado.map((item) => (
                    <div className="card activity" key={item.id_asistencia}>
                        <div className="card-header">
                            <h3>{item.nombre_act}</h3>
                            <span className="points">⭐+{item.puntos_otorgados} pts</span>
                        </div>

                        <p className="date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                            </svg>
                            {new Date(item.fecha).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                            })}
                        </p>

                        <Link to={`/details/${item.id_asistencia}`} className="link-detalles">
                            Ver detalles →
                        </Link>

                        <button className="button completada" disabled>✓ Completada</button>
                    </div>
                ))}
            </div>

            {/* Bottom nav */}
            <div className="bottom-nav">
                <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
                    </svg>
                </NavLink>

                <NavLink to="/activities" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list-ul" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                    </svg>
                </NavLink>

                <NavLink to="/calendar" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM1 14V4h14v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1m7-6.507c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132" />
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