import { NavLink, Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const camposVacios = {
  nombre_evento: "",
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  lugar: "",
  descripcion: "",
  puntos_fijos: "",
  cupo_max: "",
  nivel: "",
  id_tipo: "",
  id_semestre: "",
  id_rol_organizador: "",
  imagen: "",
};

export default function GestionarActividades() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState(camposVacios);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [exito, setExito] = useState(false);
  const [errores, setErrores] = useState({});
  const [tipos, setTipos] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [vista, setVista] = useState("lista");
  const [buscarNombre, setBuscarNombre] = useState("");
  const [buscarId, setBuscarId] = useState("");

  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const esEdicion = vista === "editar";

  useEffect(() => {
    cargarCatalogos();
    cargarActividades();
    if (paramId) {
      setEditandoId(paramId);
      setVista("editar");
    }
  }, []);

  useEffect(() => {
    if (editandoId) {
      cargarActividad(editandoId);
    }
  }, [editandoId]);

  const cargarCatalogos = async () => {
    try {
      const [tiposRes, semestresRes] = await Promise.all([
        fetch(`${API}/tipos-actividad`),
        fetch(`${API}/semestres`),
      ]);
      if (tiposRes.ok) setTipos(await tiposRes.json());
      if (semestresRes.ok) setSemestres(await semestresRes.json());
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  };

  const cargarActividad = async (idActividad) => {
    setLoadingDatos(true);
    try {
      const res = await fetch(`${API}/actividad/${idActividad}`);
      const data = await res.json();
      setForm({
        nombre_evento: data.nombre_evento ?? data.nombre_act ?? "",
        fecha: data.fecha?.slice(0, 10) ?? "",
        hora_inicio: data.hora_inicio?.slice(0, 5) ?? "",
        hora_fin: data.hora_fin?.slice(0, 5) ?? "",
        lugar: data.lugar ?? "",
        descripcion: data.descripcion ?? "",
        puntos_fijos: data.puntos_fijos ?? "",
        cupo_max: data.cupo_max ?? "",
        id_rol_organizador: data.id_rol_organizador ?? "",
        nivel: data.nivel ?? "",
        id_tipo: data.id_tipo ?? "",
        id_semestre: data.id_semestre ?? "",
        imagen: data.imagen ?? "",
      });
    } catch (err) {
      console.error("Error cargando actividad:", err);
    } finally {
      setLoadingDatos(false);
    }
  };

  const cargarActividades = async () => {
    setLoadingActividades(true);
    try {
      const res = await fetch(`${API}/actividad`);
      const data = await res.json();
      setActividades(data);
    } catch (err) {
      console.error("Error cargando actividades:", err);
    } finally {
      setLoadingActividades(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el tipo, auto-rellenar puntos desde el catálogo
    if (name === "id_tipo") {
      const tipoSeleccionado = tipos.find((t) => String(t.id_tipo) === String(value));
      setForm((prev) => ({
        ...prev,
        id_tipo: value,
        puntos_fijos: tipoSeleccionado ? tipoSeleccionado.puntos_fijos : "",
      }));
      if (errores.id_tipo) setErrores((prev) => ({ ...prev, id_tipo: null }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre_evento.trim()) e.nombre_evento = "Requerido";
    if (!form.fecha) e.fecha = "Requerido";
    if (!form.hora_inicio) e.hora_inicio = "Requerido";
    if (!form.hora_fin) e.hora_fin = "Requerido";
    if (!form.lugar.trim()) e.lugar = "Requerido";
    if (!form.puntos_fijos) e.puntos_fijos = "Requerido";
    return e;
  };

  const handleSubmit = async () => {
    const erroresValidacion = validar();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    setLoading(true);
    try {
      const url = esEdicion ? `${API}/actividad/${editandoId}` : `${API}/actividad`;
      const method = esEdicion ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_act: form.nombre_evento,
          fecha: form.fecha,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          lugar: form.lugar,
          descripcion: form.descripcion,
          puntos_fijos: Number(form.puntos_fijos),
          cupo_max: form.cupo_max ? Number(form.cupo_max) : null,
          id_tipo: form.id_tipo || null,
          id_semestre: form.id_semestre || null,
          id_rol_organizador: form.id_rol_organizador || null,
          imagen: form.imagen,
        }),
      });
      const text = await res.text();
      console.log(text);

      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
      if (data.ok || res.ok) {
        setExito(true);
        setTimeout(() => {
          setExito(false);
          setVista("lista");
          setEditandoId(null);
          setForm(camposVacios);
          cargarActividades();
        }, 1500);
      } else {
        alert("Error: " + (data.error || "intenta de nuevo"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (act) => {
    setEditandoId(act.id_actividad);
    setVista("editar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarActividad = async (idActividad) => {
    if (!confirm("¿Eliminar esta actividad?")) return;
    try {
      const res = await fetch(`${API}/actividad/${idActividad}`, {
        method: "DELETE",
      });
      if (res.ok)
        setActividades((prev) =>
          prev.filter((a) => a.id_actividad !== idActividad)
        );
    } catch (err) {
      console.error(err);
    }
  };

  const cancelar = () => {
    setVista("lista");
    setEditandoId(null);
    setForm(camposVacios);
    setErrores({});
  };

  const inputStyle = (campo) => ({
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: `1.5px solid ${errores[campo] ? "#e91e8c" : "#e0e0e0"}`,
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    marginTop: "4px",
    background: "var(--surface, #fff)",
    color: "var(--text, #111)",
    fontFamily: "inherit",
  });

  const labelStyle = {
    fontSize: "13px",
    color: "#888",
    display: "block",
    marginBottom: "2px",
  };

  const errorMsg = (campo) =>
    errores[campo] ? (
      <p style={{ color: "#e91e8c", fontSize: "12px", margin: "2px 0 0" }}>
        {errores[campo]}
      </p>
    ) : null;

  const formatFecha = (raw) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const actividadesFiltradas = actividades
    .filter((act) => {
      const nombre = (act.nombre_act || act.nombre_evento || "").toLowerCase();
      const matchNombre = nombre.includes(buscarNombre.toLowerCase());
      const matchId = buscarId
        ? String(act.id_actividad).includes(buscarId)
        : true;
      return matchNombre && matchId;
    })
    .sort((a, b) => a.id_actividad - b.id_actividad);

  if (loadingDatos)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando...</p>
    );

  return (
    <div className="app">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      <div className="header detail-header">
        <Link to="/admin" className="back">←</Link>
        <h1>Gestionar actividades</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={`tab ${vista === "lista" ? "active" : ""}`}
          onClick={() => { setVista("lista"); setEditandoId(null); setForm(camposVacios); }}
        >
          Todas
        </button>
        <button
          className={`tab ${vista === "crear" ? "active" : ""}`}
          onClick={() => { setVista("crear"); setEditandoId(null); setForm(camposVacios); }}
        >
          + Nueva
        </button>
        {esEdicion && (
          <button className="tab active">Editando</button>
        )}
      </div>

      {/* FILTROS */}
      {vista === "lista" && (
        <div style={{ padding: "8px 16px 4px", display: "flex", gap: "8px" }}>
          <input
            value={buscarNombre}
            onChange={(e) => setBuscarNombre(e.target.value)}
            placeholder="🔍 Buscar por nombre..."
            style={{
              flex: 2,
              padding: "9px 14px",
              borderRadius: "20px",
              border: "1.5px solid #e0e0e0",
              fontSize: "13px",
              outline: "none",
              background: "var(--surface, #fff)",
              color: "var(--text, #111)",
              fontFamily: "inherit",
            }}
          />
          <input
            value={buscarId}
            onChange={(e) => setBuscarId(e.target.value)}
            placeholder="# ID"
            type="number"
            style={{
              flex: 1,
              padding: "9px 14px",
              borderRadius: "20px",
              border: "1.5px solid #e0e0e0",
              fontSize: "13px",
              outline: "none",
              background: "var(--surface, #fff)",
              color: "var(--text, #111)",
              fontFamily: "inherit",
            }}
          />
        </div>
      )}

      <div className="container" style={{ paddingBottom: "100px" }}>

        {/* ── LISTA ─────────────────────────────────────────── */}
        {vista === "lista" && (
          <>
            {loadingActividades && (
              <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando actividades...</p>
            )}

            {!loadingActividades && actividadesFiltradas.length === 0 && (
              <p style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
                {buscarNombre || buscarId
                  ? "No se encontraron actividades con ese criterio."
                  : "No hay actividades registradas."}
              </p>
            )}

            {actividadesFiltradas.map((act) => (
              <div className="card activity" key={act.id_actividad}>

                {act.imagen && (
                  <img
                    src={act.imagen}
                    alt={act.nombre_act || act.nombre_evento}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  />
                )}

                <div className="card-header">
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text, #111)" }}>
                    {act.nombre_act || act.nombre_evento || "(Sin nombre)"}
                  </h3>
                  <span className="points">⭐+{act.puntos_fijos} pts</span>
                </div>

                <p style={{ fontSize: "11px", color: "#bbb", margin: "2px 0 8px", fontWeight: 500 }}>
                  #{act.id_actividad}
                </p>

                <p className="date">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 0 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                  </svg>
                  {formatFecha(act.fecha)}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "6px 0 10px" }}>
                  {(act.hora_inicio || act.hora_fin) && (
                    <span style={pill}>
                      🕐 {act.hora_inicio?.slice(0, 5)}{act.hora_fin ? ` – ${act.hora_fin.slice(0, 5)}` : ""}
                    </span>
                  )}
                  {act.lugar && <span style={pill}>📍 {act.lugar}</span>}
                  {act.cupo_max && <span style={pill}>👥 Cupo: {act.cupo_max}</span>}
                  {act.nivel && (
                    <span style={{ ...pill, background: "#e8f4fd", color: "#1565c0" }}>
                      {act.nivel}
                    </span>
                  )}
                  {act.estado === "Cerrada" && (
                    <span style={{ ...pill, background: "#f5f5f5", color: "#999" }}>
                      🔒 Cerrada
                    </span>
                  )}
                </div>

                {act.descripcion && (
                  <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px", lineHeight: "1.5" }}>
                    {act.descripcion}
                  </p>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="button primary" style={{ flex: 1 }} onClick={() => iniciarEdicion(act)}>
                    Editar
                  </button>
                  <button className="button" style={{ flex: 1 }} onClick={() => eliminarActividad(act.id_actividad)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── FORMULARIO (crear / editar) ─────────────────────── */}
        {vista !== "lista" && (
          <>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: 0 }}>Información general</h3>

              <div>
                <label style={labelStyle}>Nombre del evento *</label>
                <input
                  name="nombre_evento"
                  value={form.nombre_evento}
                  onChange={handleChange}
                  placeholder="Ej. Taller de liderazgo"
                  style={inputStyle("nombre_evento")}
                />
                {errorMsg("nombre_evento")}
              </div>

              <div>
                <label style={labelStyle}>Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  style={inputStyle("fecha")}
                />
                {errorMsg("fecha")}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Hora inicio *</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={form.hora_inicio}
                    onChange={handleChange}
                    style={inputStyle("hora_inicio")}
                  />
                  {errorMsg("hora_inicio")}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Hora fin *</label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={form.hora_fin}
                    onChange={handleChange}
                    style={inputStyle("hora_fin")}
                  />
                  {errorMsg("hora_fin")}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Lugar *</label>
                <input
                  name="lugar"
                  value={form.lugar}
                  onChange={handleChange}
                  placeholder="Ej. Auditorio principal"
                  style={inputStyle("lugar")}
                />
                {errorMsg("lugar")}
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe la actividad..."
                  rows={3}
                  style={{ ...inputStyle("descripcion"), resize: "vertical" }}
                />
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: 0 }}>Configuración</h3>

              {/* Tipo de actividad — va primero para que auto-rellene puntos */}
              <div>
                <label style={labelStyle}>Tipo de actividad</label>
                {tipos.length > 0 ? (
                  <select
                    name="id_tipo"
                    value={form.id_tipo}
                    onChange={handleChange}
                    style={inputStyle("id_tipo")}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tipos.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>
                        {t.nombre_tipo} — {t.puntos_fijos} pts
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="id_tipo"
                    value={form.id_tipo}
                    onChange={handleChange}
                    placeholder="ID del tipo"
                    type="number"
                    style={inputStyle("id_tipo")}
                  />
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {/* Puntos — bloqueado si hay tipo seleccionado */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Puntos *</label>
                  <input
                    type="number"
                    name="puntos_fijos"
                    value={form.puntos_fijos}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    disabled={!!form.id_tipo}
                    style={{
                      ...inputStyle("puntos_fijos"),
                      background: form.id_tipo ? "var(--surface-disabled, #f5f5f5)" : undefined,
                      color: form.id_tipo ? "#aaa" : undefined,
                      cursor: form.id_tipo ? "not-allowed" : undefined,
                    }}
                  />
                  {form.id_tipo && (
                    <p style={{ fontSize: "11px", color: "#aaa", margin: "3px 0 0" }}>
                      Definido por el tipo de actividad
                    </p>
                  )}
                  {errorMsg("puntos_fijos")}
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Cupo máximo</label>
                  <input
                    type="number"
                    name="cupo_max"
                    value={form.cupo_max}
                    onChange={handleChange}
                    placeholder="Sin límite"
                    min="1"
                    style={inputStyle("cupo_max")}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Organizador</label>
                <select
                  name="id_rol_organizador"
                  value={form.id_rol_organizador}
                  onChange={handleChange}
                  style={inputStyle("id_rol_organizador")}
                >
                  <option value="">Seleccionar rol</option>
                  <option value="1">Coordinación</option>
                  <option value="2">Beca laboral</option>
                  <option value="3">Presidente</option>
                  <option value="4">Vicepresidente</option>
                  <option value="5">Impact manager</option>
                  <option value="6">Experience manager</option>
                  <option value="7">Budget manager</option>
                  <option value="8">Content manager</option>
                  <option value="9">Brand manager</option>
                  <option value="10">Miembro</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Semestre</label>
                {semestres.length > 0 ? (
                  <select
                    name="id_semestre"
                    value={form.id_semestre}
                    onChange={handleChange}
                    style={inputStyle("id_semestre")}
                  >
                    <option value="">Seleccionar semestre</option>
                    {semestres.map((s) => (
                      <option key={s.id_semestre} value={s.id_semestre}>
                        {s.nombre_semestre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="id_semestre"
                    value={form.id_semestre}
                    onChange={handleChange}
                    placeholder="ID del semestre"
                    type="number"
                    style={inputStyle("id_semestre")}
                  />
                )}
              </div>

              <div>
                <label style={labelStyle}>URL de imagen (opcional)</label>
                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={inputStyle("imagen")}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "0 0 8px" }}>
              <button
                className="button primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear actividad"}
              </button>
              <button className="button" onClick={cancelar}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL ÉXITO */}
      {exito && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999, padding: "24px",
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "320px", margin: 0, textAlign: "center" }}>
            <p style={{ fontSize: "2.5rem", margin: "0 0 8px" }}>✅</p>
            <h3 style={{ margin: "0 0 6px" }}>
              {esEdicion ? "¡Actividad actualizada!" : "¡Actividad creada!"}
            </h3>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              Volviendo a la lista...
            </p>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
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

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "12px",
  padding: "3px 10px",
  borderRadius: "20px",
  background: "#f0f0f0",
  color: "#555",
};