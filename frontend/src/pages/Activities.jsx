import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useFotoPerfil } from "../hooks/useFotoPerfil";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Activities() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [actividades, setActividades] = useState([]);
  const [tabActivo, setTabActivo] = useState("Todas");
  const tabs = ["Todas", "Disponible", "Inscrito", "Completada", "Cerrada"];
  const [loading, setLoading] = useState(true);
  const [estatusMap, setEstatusMap] = useState({});
  const [perfil, setPerfil] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const matricula = usuario?.matricula;
  const fotoAvatar = useFotoPerfil(perfil, matricula);


  useEffect(() => {
    fetch(`${API}/actividad/calendario`)
      .then(res => res.json())
      .then(async (data) => {
        setActividades(data);

        const estatusEntries = await Promise.all(
          data.map(async (act) => {
            try {
              const res = await fetch(`${API}/asistencias/${matricula}/${act.id_actividad}/estatus`);
              const json = await res.json();
              return [act.id_actividad, json.estatus];
            } catch {
              return [act.id_actividad, "Sin registro"];
            }
          })
        );

        setEstatusMap(Object.fromEntries(estatusEntries));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);



  const actividadesFiltradas = tabActivo === "Todas"
    ? actividades
    : actividades.filter(a => (estatusMap[a.id_actividad] ?? "Cerrada") === tabActivo);

  const handleDesinscribirse = async (id_actividad) => {
    try {
      await fetch(`${API}/asistencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, id_actividad, asistio: 2 }) // ← 2 en lugar de false
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ AGREGADO AQUÍ — orden y sort
  const orden = { "Disponible": 0, "Inscrito": 1, "Completada": 2, "Cerrada": 3 };

  const actividadesOrdenadas = [...actividadesFiltradas].sort((a, b) => {
    const estatusA = estatusMap[a.id_actividad] ?? "Cerrada";
    const estatusB = estatusMap[b.id_actividad] ?? "Cerrada";
    return (orden[estatusA] ?? 3) - (orden[estatusB] ?? 3);
  });
  // ✅ FIN AGREGADO

  return (
    <div className="app">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      <div className="header">
        <span className="menu" onClick={() => setMenuOpen(true)}>☰</span>
        <h1>Actividades</h1>
        <img src={fotoAvatar} alt="avatar" className="avatar small-avatar" />
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${tabActivo === tab ? "active" : ""}`}
            onClick={() => setTabActivo(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="container">
        {loading && <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando actividades...</p>}

        {!loading && actividadesOrdenadas.length === 0 && ( // ✅ CAMBIADO
          <p style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
            No hay actividades disponibles.
          </p>
        )}

        {actividadesOrdenadas.map((act) => { // ✅ CAMBIADO
          const estatus = estatusMap[act.id_actividad];
          const inscrito = estatus === "Inscrito";
          const completada = estatus === "Completada";
          const cerrada = estatus === "Cerrada";
          const disponible = estatus === "Disponible";

          return (
            <div className="card activity" key={act.id_actividad}>
              <div className="card-header">
                <h3>{act.nombre_evento}</h3>
                <span className="points">⭐+{act.puntos_fijos} pts</span>
              </div>

              <p className="date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                </svg>
                {new Date(act.fecha).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </p>
              {/* ✅ AGREGADO — ver detalles pequeño */}
              <Link to={`/details/${act.id_actividad}`} className="link-detalles">
                Ver detalles →
              </Link>

              {completada ? (
                <button className="button completada" disabled>✓ Completada</button>
              ) : inscrito ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button className="button inscrita" disabled>✓ Inscrito</button>


                </div>
              ) : cerrada ? (
                <button className="button no-asistio" disabled><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
                </svg> Cerrada</button>
              ) : (
                <Link to={`/details/${act.id_actividad}`} className="button primary">
                  Disponible
                </Link>
              )}
            </div>
          );
        })}
      </div>

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