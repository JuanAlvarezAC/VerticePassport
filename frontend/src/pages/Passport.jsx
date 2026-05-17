import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Passport() {
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Estado de datos ──────────────────────────────────────────
  const [perfil, setPerfil] = useState(null);
  const [puntos, setPuntos] = useState(null);
  const [generacion, setGeneracion] = useState(null);
  const [estatusActs, setEstatusActs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Matrícula desde localStorage (guardada en el login) ──────
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const matricula = usuario?.matricula;

  const fotoAvatar = useFotoPerfil(perfil, matricula);

  useEffect(() => {
    if (!matricula) {
      setError("No hay sesión activa.");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [perfilRes, puntosRes, estatusRes, todasRes, genRes] = await Promise.all([
          fetch(`${API}/usuarios/${matricula}/perfil`),
          fetch(`${API}/usuarios/${matricula}/puntos`),
          fetch(`${API}/usuarios/${matricula}/estatus-actividades`),
          fetch(`${API}/actividad/calendario`),
          fetch(`${API}/usuarios/${matricula}/generacion`),
        ]);

        if (!perfilRes.ok) throw new Error("Error al cargar perfil");
        if (!puntosRes.ok) throw new Error("Error al cargar puntos");
        if (!estatusRes.ok) throw new Error("Error al cargar actividades");

        const [perfilData, puntosData, estatusData, todasData, genData] = await Promise.all([
          perfilRes.json(), puntosRes.json(), estatusRes.json(), todasRes.json(), genRes.json(),
        ]);

        setPerfil(perfilData);
        setPuntos(puntosData);
        setEstatusActs(estatusData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [matricula]);

  // ── Semestre calculado desde anio_entrada ───────────────────
  const calcularSemestre = (anio_entrada) => {
    if (!anio_entrada) return null;
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1; // 1-12
    const semestreActual = mesActual <= 6 ? 1 : 2;
    const semestre = ((anioActual - anio_entrada) * 2) + semestreActual;
    return Math.max(1, semestre);
  };

  // ── Cálculos derivados ───────────────────────────────────────
  // Passport.jsx — busca estas líneas y cambia "Asistió" → "Ya asistió"
  const completadas = estatusActs.filter(a => a.estatus === "Completada").length;


  // Requisitos — ajusta los campos según lo que devuelva tu vista vw_perfil_usuario
  const requisitos = perfil ? [
    { label: "Materias Vértice", actual: perfil.materias_vertice_completadas ?? 0, meta: perfil.materias_vertice_requeridas ?? 5 },
    { label: "Talleres", actual: perfil.talleres_completados ?? 0, meta: perfil.talleres_requeridos ?? 8 },
    { label: "Actividades", actual: completadas, meta: perfil.actividades_requeridas ?? 48 },
    { label: "Seminarios", actual: perfil.seminarios_completados ?? 0, meta: perfil.seminarios_requeridos ?? 3 },
  ] : [];

  // ── Render helpers ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="app" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Cargando pasaporte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const nombreCompleto = perfil
    ? `${perfil.nombre} ${perfil.apellidos}`
    : "—";

  return (
    <div className="app">
      {/* SIDEBAR */}
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      {/* Header */}
      <div className="header">
        <span className="menu" onClick={() => setMenuOpen(true)}>☰</span>
        <h1>Pasaporte</h1>
        <img
          src={fotoAvatar}
          alt="avatar"
          className="avatar small-avatar"
        />
      </div>

      {/* Profile */}
      <div className="card passport profile-section">
        <img
          src={fotoAvatar}
          alt="avatar"
          className="avatar"
        />
        <div className="profile-info">
          <div className="card-header">
            <h3>{nombreCompleto}</h3>

            <span className="points">⭐{puntos?.puntos_acumulados ?? 0} pts</span>
          </div>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#888" }}>
            ID: # {matricula}
          </p>
          <p>{perfil?.anio_entrada ? `${calcularSemestre(perfil.anio_entrada)}to Semestre` : "—"}</p>
          <p>{perfil?.nombre_carrera ?? "—"}</p>
        </div>
      </div>

      {/* Actividades asistidas */}
      <div className="card passport">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "2rem" }}>🎉</span>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>¡Has asistido a</p>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#e91e8c" }}>
              {completadas} actividades!
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>Felicidades, sigue así.</p>
            <Link to="/historial" style={{ fontSize: "13px", color: "var(--primary)", textDecoration: "none", marginTop: "8px", display: "inline-block" }}>
            Ver historial completo →
          </Link>
          </div>
        </div>
      </div>

      {/* Requisitos de graduación */}
      <div className="card passport">
        <h3>Requisitos de graduación</h3>
        <div className="progress-bars">
          {requisitos.map(({ label, actual, meta }) => (
            <div key={label}>
              <p>{label}</p>
              <span>{actual}/{meta}</span>
              <div className="bar">
                <div style={{ width: `${Math.min((actual / meta) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="card passport">
        <button className="button primary" onClick={() => alert("Funcionalidad en desarrollo")}>
          Descargar certificado
        </button>
        <button className="button" onClick={() => alert("Funcionalidad en desarrollo")}>
          Compartir en redes sociales
        </button>
      </div>

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