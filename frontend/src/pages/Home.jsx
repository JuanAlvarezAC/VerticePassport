import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useFotoPerfil } from "../hooks/useFotoPerfil";


const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [puntos, setPuntos] = useState(null);
  const [proximaInscrita, setProximaInscrita] = useState(null);
  const [destacada, setDestacada] = useState(null);
  const [completadas, setCompletadas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generacion, setGeneracion] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const matricula = usuario?.matricula;
  const fotoAvatar = useFotoPerfil(perfil, matricula);


  useEffect(() => {
    if (!matricula) return;

    const fetchData = async () => {
      try {
        const [perfilRes, puntosRes, estatusRes, todasRes, generacionRes] = await Promise.all([
          fetch(`${API}/usuarios/${matricula}/perfil`),
          fetch(`${API}/usuarios/${matricula}/puntos`),
          fetch(`${API}/usuarios/${matricula}/estatus-actividades`),
          fetch(`${API}/actividad/calendario`),
          fetch(`${API}/usuarios/${matricula}/generacion`),
        ]);

        const [perfilData, puntosData, estatusData, todasData, generacionData] = await Promise.all([
          perfilRes.json(),
          puntosRes.json(),
          estatusRes.json(),
          todasRes.json(),
          generacionRes.json(),
        ]);

        setPerfil(perfilData);
        setPuntos(puntosData);
        setGeneracion(generacionData);

        // Completadas
        const numCompletadas = estatusData.filter(a => a.estatus === "Completada").length;
        setCompletadas(numCompletadas);

        // Próxima actividad inscrita (más cercana a hoy)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const inscritasIds = new Set(
          estatusData
            .filter(a => a.estatus === "Inscrito")
            .map(a => Number(a.id_actividad))
        );

        const inscritasFuturas = todasData
          .filter(a => inscritasIds.has(Number(a.id_actividad)) && new Date(a.fecha) >= hoy)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setProximaInscrita(inscritasFuturas[0] || null);

        // Actividad destacada: disponible, no inscrita, futura
        const completadasInscritasIds = new Set(
          estatusData.map(a => Number(a.id_actividad))
        );

        const disponibles = todasData
          .filter(a => !completadasInscritasIds.has(Number(a.id_actividad)) && new Date(a.fecha) >= hoy)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setDestacada(disponibles[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matricula]);

  // Fecha de hoy bonita
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Primer nombre
  const primerNombre = perfil?.nombre?.split(" ")[0] || "Estudiante";

  // Semestre
  const calcularSemestre = (anio_entrada) => {
    if (!anio_entrada) return null;
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const semestreActual = mesActual <= 6 ? 1 : 2;
    return Math.max(1, ((hoy.getFullYear() - anio_entrada) * 2) + semestreActual);
  };

  return (
    <div className="app">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      {/* Header */}
      <div className="header">
        <span className="menu" onClick={() => setMenuOpen(true)}>☰</span>
        <h1>Inicio</h1>
        <img
          src={fotoAvatar}
          alt="avatar"
          className="avatar small-avatar"
        />
      </div>

      {/* ── Hero saludo ── */}
      <div className="home-hero">
        <div className="home-hero-top">
            <img
              src={fotoAvatar}
              alt="avatar"
              className="home-hero-avatar"
            />
          <div className="home-hero-text">
            <p>¡Hola de nuevo,</p>
            <h2>{loading ? "..." : primerNombre}! 👋</h2>
            {generacion && (
              <span style={{ fontSize: "12px", opacity: 0.8 }}>Generación {generacion?.generacion}</span>
            )}
          </div>
        </div>
        <h3 className="home-hero-date">
          {fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}
        </h3>
      </div>

      {/* ── Stats rápidas ── */}
      <div className="home-stats">
        <div className="home-stat">
          <div className="home-stat-value">
            {loading ? "—" : (puntos?.puntos_acumulados ?? 0)}
          </div>
          <div className="home-stat-label">puntos</div>
        </div>
        <div className="home-stat">
          <div className="home-stat-value">
            {loading ? "—" : completadas}
          </div>
          <div className="home-stat-label">actividades</div>
        </div>
        <div className="home-stat">
          <div className="home-stat-value">
            {loading ? "—" : (perfil?.anio_entrada ? `${calcularSemestre(perfil.anio_entrada)}°` : "—")}
          </div>
          <div className="home-stat-label">semestre</div>
        </div>
      </div>

      {/* ── Próxima actividad ── */}
      <p className="home-section-title">
        Tu próxima actividad
        <Link to="/calendar">Ver calendario →</Link>
      </p>

      {loading ? (
        <div className="home-no-next">Cargando...</div>
      ) : proximaInscrita ? (
        <Link to={`/details/${proximaInscrita.id_actividad}`} style={{ textDecoration: "none" }}>
          <div className="card home-next">
            <div className="home-next-date">
              <span className="home-next-date-day">
                {new Date(proximaInscrita.fecha).getDate()}
              </span>
              <span className="home-next-date-month">
                {new Date(proximaInscrita.fecha).toLocaleDateString("es-MX", { month: "short" })}
              </span>
            </div>
            <div className="home-next-info">
              <h4>{proximaInscrita.nombre_evento}</h4>
              <p>📍 {proximaInscrita.lugar}</p>
              <p>🕐 {proximaInscrita.hora_inicio?.slice(0, 5)} – {proximaInscrita.hora_fin?.slice(0, 5)}</p>
            </div>
            <span className="home-next-pts">⭐ +{proximaInscrita.puntos_fijos}</span>
          </div>
        </Link>
      ) : (
        <div className="home-no-next">
          No tienes actividades próximas inscritas.<br />
          <Link to="/activities" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Explorar actividades →
          </Link>
        </div>
      )}

      {/* ── Accesos rápidos ── */}
      <p className="home-section-title">Ir a</p>

      <div className="home-quick-grid">
        <Link to="/activities" className="home-quick-card">
          <div className="home-quick-icon" style={{ background: "#fce4ef" }}>🎯</div>
          <div>
            <h4>Actividades</h4>
            <p>Explora e inscríbete</p>
          </div>
        </Link>

        <Link to="/calendar" className="home-quick-card">
          <div className="home-quick-icon" style={{ background: "#e0f2fe" }}>📅</div>
          <div>
            <h4>Calendario</h4>
            <p>Tus inscripciones</p>
          </div>
        </Link>

        <Link to="/passport" className="home-quick-card">
          <div className="home-quick-icon" style={{ background: "#fef9c3" }}>🪪</div>
          <div>
            <h4>Pasaporte</h4>
            <p>Tu progreso</p>
          </div>
        </Link>

        <Link to="/help" className="home-quick-card">
          <div className="home-quick-icon" style={{ background: "#f0fdf4" }}>❓</div>
          <div>
            <h4>Ayuda</h4>
            <p>Cómo usar la app</p>
          </div>
        </Link>
      </div>

      {/* ── Actividad destacada ── */}
      {!loading && destacada && (
        <>
          <p className="home-section-title">
            Te puede interesar
            <Link to="/activities">Ver todas →</Link>
          </p>

          <div className="card home-featured">
            {destacada.imagen ? (
              <img
                src={destacada.imagen}
                alt={destacada.nombre_evento}
                className="home-featured-img"
              />
            ) : (
              <div className="home-featured-img-placeholder">🎉</div>
            )}
            <div className="home-featured-body">
              <h4>{destacada.nombre_evento}</h4>
              <div className="home-featured-meta">
                <span>
                  📅 {new Date(destacada.fecha).toLocaleDateString("es-MX", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}
                </span>
                <span className="points">⭐ +{destacada.puntos_fijos} pts</span>
              </div>
              <Link to={`/details/${destacada.id_actividad}`} className="button primary">
                Ver detalles
              </Link>
            </div>
          </div>
        </>
      )}

      <div style={{ height: 16 }} />

      {/* ── Bottom nav ── */}
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