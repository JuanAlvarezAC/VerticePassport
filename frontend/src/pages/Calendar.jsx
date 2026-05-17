import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import Sidebar from "../components/Sidebar/Sidebar";
import { useFotoPerfil } from "../hooks/useFotoPerfil";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const COLOR_INSCRITO    = "#3b82f6";
const COLOR_COMPLETADA  = "#22c55e";
const COLOR_PROXIMAMENTE = "#E60965";
const COLOR_CERRADA     = "#9ca3af"; // gris

export default function Calendar() {
    const [menuOpen, setMenuOpen]         = useState(false);
    const [inscripciones, setInscripciones] = useState([]);
    const [proximamente, setProximamente] = useState([]);
    const [cerradas, setCerradas]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [semestre, setSemestre]         = useState(null);
    const [perfil, setPerfil]             = useState(null);

    const usuario   = JSON.parse(localStorage.getItem("usuario"));
    const matricula = usuario?.matricula;
    const fotoAvatar = useFotoPerfil(perfil, matricula);

    useEffect(() => {
        if (!matricula) return;

        Promise.all([
            fetch(`${API}/usuarios/${matricula}/estatus-actividades`).then(r => r.json()),
            fetch(`${API}/actividad/calendario`).then(r => r.json()),
            fetch(`${API}/semestres/activo`).then(r => r.json()),
        ])
            .then(([estatusData, todasData, semestreData]) => {
                setSemestre(semestreData.nombre_semestre);

                const inscritosIds = new Set(
                    estatusData
                        .filter(a => a.estatus === "Inscrito" || a.estatus === "Completada")
                        .map(a => Number(a.id_actividad))
                );

                // Inscritas / Completadas
                const inscritas = todasData
                    .filter(a => inscritosIds.has(Number(a.id_actividad)))
                    .map(a => {
                        const match  = estatusData.find(e => Number(e.id_actividad) === Number(a.id_actividad));
                        const fecha  = new Date(a.fecha);
                        fecha.setHours(0, 0, 0, 0);
                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);
                        const estatus = match?.estatus ?? (fecha < hoy ? "Completada" : "Inscrito");
                        return { ...a, estatus };
                    });
                setInscripciones(inscritas);

                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                // Próximas (no inscritas, fecha futura)
                const proximas = todasData
                    .filter(a => !inscritosIds.has(Number(a.id_actividad)) && new Date(a.fecha) >= hoy)
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                    .slice(0, 3);
                setProximamente(proximas);

                // Cerradas: no inscritas, fecha pasada
                const cerradasList = todasData.filter(
                    a => !inscritosIds.has(Number(a.id_actividad)) && new Date(a.fecha) < hoy
                );
                setCerradas(cerradasList);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [matricula]);

    const eventos = [
        ...inscripciones.map(a => ({
            title: a.nombre_evento,
            date:  a.fecha?.slice(0, 10),
            backgroundColor: a.estatus === "Completada" ? COLOR_COMPLETADA : COLOR_INSCRITO,
            borderColor:     a.estatus === "Completada" ? COLOR_COMPLETADA : COLOR_INSCRITO,
        })),
        ...proximamente.map(a => ({
            title: a.nombre_evento,
            date:  a.fecha?.slice(0, 10),
            backgroundColor: COLOR_PROXIMAMENTE,
            borderColor:     COLOR_PROXIMAMENTE,
        })),
        ...cerradas.map(a => ({
            title: a.nombre_evento,
            date:  a.fecha?.slice(0, 10),
            backgroundColor: COLOR_CERRADA,
            borderColor:     COLOR_CERRADA,
        })),
    ];

    const formatFecha = (fechaStr) =>
        new Date(fechaStr).toLocaleDateString("es-MX", {
            weekday: "long",
            day:     "numeric",
            month:   "long",
        });

    return (
        <div className="app">
            <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

            <div className="header">
                <span className="menu" onClick={() => setMenuOpen(true)}>☰</span>
                <h1>Calendario</h1>
                <img src={fotoAvatar} alt="avatar" className="avatar small-avatar" />
            </div>

            {semestre && (
                <div style={{ padding: "0 16px 8px", fontSize: "13px", color: "var(--subtext)", fontWeight: "600" }}>
                    {semestre}
                </div>
            )}

            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={eventos}
                height={430}
                locale="es"
                buttonText={{ today: "Hoy" }}
            />

            {/* Leyenda de colores */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", padding: "12px 0", fontSize: "13px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_INSCRITO, display: "inline-block" }} />
                    Inscrita
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_COMPLETADA, display: "inline-block" }} />
                    Completada
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_PROXIMAMENTE, display: "inline-block" }} />
                    Próximamente
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_CERRADA, display: "inline-block" }} />
                    Cerrada
                </span>
            </div>

            <div className="activities-section">

                {loading && (
                    <p style={{ textAlign: "center", color: "#aaa" }}>Cargando...</p>
                )}

                {!loading && inscripciones.length > 0 && (
                    <>
                        <h2 className="activities-title">Tus inscripciones del semestre</h2>
                        {inscripciones.map((act) => (
                            <Link to={`/details/${act.id_actividad}`} className="activity-card" key={act.id_actividad} style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="activity-time">
                                    <strong>{act.hora_inicio?.slice(0, 5)}</strong>
                                    <span>{act.hora_fin?.slice(0, 5)}</span>
                                </div>
                                <div
                                    className="activity-bar"
                                    style={{ background: act.estatus === "Completada" ? COLOR_COMPLETADA : COLOR_INSCRITO }}
                                />
                                <div className="activity-info">
                                    <h3>{act.nombre_evento}</h3>
                                    <p>📍 {act.lugar}</p>
                                    <p style={{ fontSize: "12px", color: "#aaa" }}>{formatFecha(act.fecha)}</p>
                                </div>
                                <div className="activity-points">⭐ +{act.puntos_fijos}</div>
                            </Link>
                        ))}
                    </>
                )}

                {!loading && inscripciones.length === 0 && (
                    <p style={{ textAlign: "center", color: "#aaa", marginBottom: "20px" }}>
                        Aún no estás inscrito en ninguna actividad.
                    </p>
                )}

                {!loading && proximamente.length > 0 && (
                    <>
                        <h2 className="activities-title" style={{ marginTop: "24px" }}>
                            Próximas actividades disponibles
                        </h2>
                        {proximamente.map((act) => (
                            <Link to={`/details/${act.id_actividad}`} className="activity-card" key={act.id_actividad} style={{ opacity: 0.7, textDecoration: "none", color: "inherit" }}>
                                <div className="activity-time">
                                    <strong>{act.hora_inicio?.slice(0, 5)}</strong>
                                    <span>{act.hora_fin?.slice(0, 5)}</span>
                                </div>
                                <div className="activity-bar" style={{ background: COLOR_PROXIMAMENTE }} />
                                <div className="activity-info">
                                    <h3>{act.nombre_evento}</h3>
                                    <p>📍 {act.lugar}</p>
                                    <p style={{ fontSize: "12px", color: "#aaa" }}>{formatFecha(act.fecha)}</p>
                                </div>
                                <div className="activity-points" style={{ color: "#aaa" }}>
                                    ⭐ +{act.puntos_fijos}
                                </div>
                            </Link>
                        ))}
                    </>
                )}

            </div>

            <div className="bottom-nav">
                <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
                    </svg>
                </NavLink>
                <NavLink to="/activities" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
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