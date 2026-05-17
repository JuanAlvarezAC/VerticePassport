import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useFotoPerfil } from "../hooks/useFotoPerfil";


const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function GestionarAsistencia() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [perfil, setPerfil] = useState(null);

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const matricula = usuario?.matricula;
    const fotoAvatar = useFotoPerfil(perfil, matricula);


    // ── Estado ───────────────────────────────────────────────
    const [rolActivo, setRolActivo] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [actSeleccionada, setActSeleccionada] = useState(null);
    const [inscritos, setInscritos] = useState([]);
    const [asistencias, setAsistencias] = useState({}); // { matricula: true/false }
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Verificar acceso y cargar actividades ─────────────────
    useEffect(() => {
        if (!matricula) { navigate("/"); return; }

        const init = async () => {
            try {
                const rolRes = await fetch(`${API}/usuarios/${matricula}/rol-activo`);
                const rolData = await rolRes.json();
                setRolActivo(rolData);

                // Si es miembro, redirigir
                if (!rolData.esAdmin) { navigate("/activities"); return; }

                const actRes = await fetch(`${API}/usuarios/${matricula}/actividades-a-gestionar`);
                const actData = await actRes.json();
                setActividades(actData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [matricula]);

    // ── Cargar inscritos al seleccionar actividad ─────────────
    const seleccionarActividad = async (act) => {
        setActSeleccionada(act);
        setMensaje(null);
        setInscritos([]);
        setAsistencias({});

        try {
            const res = await fetch(`${API}/actividad/${act.id_actividad}/inscritos`);
            const data = await res.json();
            // ← filtra desincritos (asistio = 2)
            setInscritos(data.filter(i => i.asistio !== 2));

            // Inicializar asistencias con el valor actual de la BD
            const init = {};
            // ✅ Cambia esto
            data.forEach(i => { init[i.matricula] = i.asistio === 1; });
            setAsistencias(init);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Toggle asistencia individual ──────────────────────────
    const toggleAsistencia = (matriculaAlumno) => {
        setAsistencias(prev => ({
            ...prev,
            [matriculaAlumno]: !prev[matriculaAlumno]
        }));
    };

    // ── Guardar todos los cambios ─────────────────────────────
    const guardarAsistencias = async () => {
        setGuardando(true);
        setMensaje(null);

        try {
            const promesas = inscritos.map(alumno =>
                fetch(`${API}/asistencias`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // ✅ Cambia esto en guardarAsistencias
                    body: JSON.stringify({
                        matricula: alumno.matricula,
                        id_actividad: actSeleccionada.id_actividad,
                        asistio: asistencias[alumno.matricula] ? 1 : 0  // 1=asistió, 0=inscrito (no asistió)
                    })
                })
            );

            await Promise.all(promesas);
            setMensaje({ tipo: "ok", texto: "✅ Asistencias guardadas correctamente" });
        } catch (err) {
            setMensaje({ tipo: "error", texto: "❌ Error al guardar, intenta de nuevo" });
        } finally {
            setGuardando(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────
    const formatFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric"
    });

    const asistieronCount = Object.values(asistencias).filter(Boolean).length;

    // ── Render ────────────────────────────────────────────────
    if (loading) return (
        <div className="app" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>Cargando...</p>
        </div>
    );

    return (
        <div className="app">
            <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

            {/* Header */}
            <div className="header detail-header">
                <Link to="/admin" className="back">←</Link>
                <h1>Gestionar asistencia</h1>
                <img src={fotoAvatar} alt="avatar" className="avatar small-avatar" />
            </div>

            {/* Rol badge */}
            {rolActivo && (
                <div style={{ margin: "0 16px 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "4px 12px",
                        borderRadius: "20px"
                    }}>
                        {rolActivo.rol}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--subtext)" }}>
                        {rolActivo.nombre_semestre}
                    </span>
                </div>
            )}

            {/* ── Vista: lista de actividades ── */}
            {!actSeleccionada && (
                <div className="container">
                    {actividades.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--subtext)", marginTop: "2rem" }}>
                            No tienes actividades asignadas este semestre.
                        </p>
                    ) : (
                        actividades.map(act => (
                            <div
                                className="card activity"
                                key={act.id_actividad}
                                onClick={() => seleccionarActividad(act)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="card-header">
                                    <h3>{act.nombre_act}</h3>
                                    <span style={{
                                        fontSize: "11px",
                                        background: "var(--primary-light)",
                                        color: "var(--primary)",
                                        padding: "3px 10px",
                                        borderRadius: "20px",
                                        fontWeight: "600"
                                    }}>
                                        {act.nombre_tipo}
                                    </span>
                                </div>
                                <p className="date">
                                    📅 {formatFecha(act.fecha)} · {act.hora_inicio?.slice(0, 5)} - {act.hora_fin?.slice(0, 5)}
                                </p>
                                <p className="date">📍 {act.lugar}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── Vista: lista de inscritos ── */}
            {actSeleccionada && (
                <div className="container">
                    {/* Botón volver */}
                    <button
                        onClick={() => { setActSeleccionada(null); setMensaje(null); }}
                        style={{
                            background: "none", border: "none",
                            color: "var(--primary)", fontWeight: "700",
                            fontSize: "14px", cursor: "pointer",
                            padding: "8px 16px 4px", display: "flex",
                            alignItems: "center", gap: "6px"
                        }}
                    >
                        ← Volver a actividades
                    </button>

                    {/* Info actividad */}
                    <div className="card" style={{ margin: "8px 16px" }}>
                        <h3 style={{ margin: "0 0 6px" }}>{actSeleccionada.nombre_act}</h3>
                        <p className="date" style={{ margin: "3px 0" }}>
                            📅 {formatFecha(actSeleccionada.fecha)}
                        </p>
                        <p className="date" style={{ margin: "3px 0" }}>
                            📍 {actSeleccionada.lugar}
                        </p>
                        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--subtext)" }}>
                            <strong style={{ color: "var(--primary)" }}>{asistieronCount}</strong> de{" "}
                            <strong>{inscritos.length}</strong> inscritos marcados como asistieron
                        </p>
                    </div>

                    {/* Mensaje éxito/error */}
                    {mensaje && (
                        <div style={{
                            margin: "0 16px 8px",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            background: mensaje.tipo === "ok" ? "#e8f5e9" : "#fce4ec",
                            color: mensaje.tipo === "ok" ? "#2e7d32" : "#c62828",
                            fontSize: "14px",
                            fontWeight: "600"
                        }}>
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Lista de inscritos */}
                    {inscritos.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--subtext)", marginTop: "1rem" }}>
                            No hay inscritos en esta actividad.
                        </p>
                    ) : (
                        inscritos.map(alumno => (
                            <div
                                key={alumno.matricula}
                                className="card"
                                style={{
                                    margin: "8px 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "14px 16px",
                                    borderLeft: asistencias[alumno.matricula]
                                        ? "4px solid var(--primary)"
                                        : "4px solid #eee"
                                }}
                            >
                                <div>
                                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>
                                        {alumno.nombre_completo}
                                    </p>
                                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--subtext)" }}>
                                        {alumno.matricula}
                                    </p>
                                </div>

                                {/* Toggle */}
                                <button
                                    onClick={() => toggleAsistencia(alumno.matricula)}
                                    style={{
                                        width: "48px",
                                        height: "28px",
                                        borderRadius: "14px",
                                        border: "none",
                                        cursor: "pointer",
                                        background: asistencias[alumno.matricula] ? "var(--primary)" : "#ddd",
                                        position: "relative",
                                        transition: "background 0.25s ease",
                                        flexShrink: 0
                                    }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        top: "3px",
                                        left: asistencias[alumno.matricula] ? "23px" : "3px",
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        background: "white",
                                        transition: "left 0.25s ease",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                                    }} />
                                </button>
                            </div>
                        ))
                    )}

                    {/* Botón guardar */}
                    {inscritos.length > 0 && (
                        <button
                            className="button primary"
                            onClick={guardarAsistencias}
                            disabled={guardando}
                            style={{ opacity: guardando ? 0.7 : 1, marginBottom: "90px" }}
                        >
                            {guardando ? "Guardando..." : "Guardar asistencias"}
                        </button>
                    )}
                </div>
            )}

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