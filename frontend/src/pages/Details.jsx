import { Link, NavLink, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ConfirmModal from "../components/ConfirmModal";
import Sidebar from "../components/Sidebar/Sidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Details() {

    const [menuOpen, setMenuOpen] = useState(false);
    const { id } = useParams();
    const [actividad, setActividad] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ CAMBIADO — reemplaza [inscrito] por [estatus]
    const [estatus, setEstatus] = useState(null);
    // Agrega el hook junto a los otros useState
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const matricula = usuario?.matricula;

    // ✅ CAMBIADO — ahora también fetchea el estatus
    useEffect(() => {
        fetch(`${API}/actividad/${id}`)
            .then(res => res.json())
            .then(data => {
                console.log("Actividad:", data);
                setActividad(data);
                return fetch(`${API}/asistencias/${matricula}/${id}/estatus`);
            })
            .then(res => res.json())
            .then(data => setEstatus(data.estatus))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleConfirm = async () => {
        try {
            const res = await fetch(`${API}/asistencias`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // ✅ Cambia asistio: 1 por asistio: 0
                body: JSON.stringify({
                    matricula: matricula,
                    id_actividad: actividad.id_actividad,
                    asistio: 0,  // ← inscrito, no asistió aún
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setEstatus("Inscrito"); // ✅ CAMBIADO
                setShowModal(false);
            } else {
                alert("Error al inscribirse: " + (data.error || "intenta de nuevo"));
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
    };

    // ✅ AGREGADO — handler desinscribirse
    const handleDesinscribirse = async () => {
        try {
            const res = await fetch(`${API}/asistencias`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matricula, id_actividad: id, asistio: 2 })
            });
            await res.json(); // ← sin guardar en variable si no la usas
            setEstatus("Disponible");
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando...</p>;
    if (!actividad) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Actividad no encontrada.</p>;

    const fecha = new Date(actividad.fecha).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    return (
        <div className="app">
            <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

            {/* Header */}
            <div className="header detail-header">
                <button
                    className="back"
                    onClick={() => navigate(-1)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                    ←
                </button>
                <h1>Detalles de la actividad</h1>
            </div>

            {/* Imagen */}
            <div className="image-section">
                <img
                    src={actividad.imagen || `https://picsum.photos/400/300?random=${actividad.id_actividad}`}
                    alt="actividad"
                />
                <div className="badge">{actividad.nombre_evento}</div>
                <div className="points overlay">⭐ +{actividad.puntos_fijos} pts</div>
            </div>

            {/* Info */}
            <div className="card detail">
                <div className="row">
                    <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                        </svg> Fecha
                    </strong>
                    <span>{fecha}</span>
                </div>

                <div className="row">
                    <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                        </svg> Horario
                    </strong>
                    <span>{actividad.hora_inicio?.slice(0, 5)} - {actividad.hora_fin?.slice(0, 5)}</span>
                </div>

                <div className="row">
                    <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                        </svg> Lugar
                    </strong>
                    <span>{actividad.lugar}</span>
                </div>

                <div className="row">
                    <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                        </svg> Organizador
                    </strong>
                    <span>{actividad.rol_responsable}</span>
                </div>

                <div className="row">
                    <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                        </svg> Cupo máx.
                    </strong>
                    <span>{actividad.cupo_max ?? "Sin límite"}</span>
                </div>
            </div>

            {/* Extra */}
            <div className="extra">
                <div>
                    <p className="label">Tipo de actividad</p>
                    <strong>{actividad.nombre_tipo}</strong>
                </div>
                <div>
                    <p className="label">Semestre</p>
                    <strong>{actividad.nombre_semestre}</strong>
                </div>
                <div>
                    <p className="label">Nivel</p>
                    <strong>{actividad.nivel}</strong>
                </div>
            </div>

            {/* Descripción */}
            <div className="card requirements">
                <h3>Descripción</h3>
                <p>{actividad.descripcion || "Sin descripción disponible."}</p>
            </div>

            {/* ✅ CAMBIADO — botones con lógica de estatus */}
            {estatus === "Completada" ? (
                <button className="button completada" disabled>✓ Completada</button>
            ) : estatus === "Inscrito" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 16px" }}>
                    <button className="button inscrita" disabled>✓ Inscrito</button>
                    <button className="button desinscribirse" onClick={handleDesinscribirse}>
                        Desinscribirse
                    </button>
                </div>
            ) : estatus === "Cerrada" ? (
                <button className="button no-asistio" disabled><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
                </svg> Cerrada</button>
            ) : (
                <button className="button primary" onClick={() => setShowModal(true)}>
                    Inscribirse
                </button>
            )}

            <ConfirmModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirm}
                actividad={actividad}
            />

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