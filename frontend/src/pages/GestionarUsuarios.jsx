import { NavLink, Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const camposVacios = {
  matricula: "",
  nombre: "",
  apellidos: "",
  correo: "",
  contrasena: "",
  anio_entrada: "",
  id_carrera: "",
  id_rol: "",
  id_semestre: "",
};

export default function GestionarUsuarios() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState(camposVacios);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [exito, setExito] = useState(false);
  const [errores, setErrores] = useState({});
  const [carreras, setCarreras] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [editandoMatricula, setEditandoMatricula] = useState(null);
  const [vista, setVista] = useState("lista");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Filtros
  const [buscarNombre, setBuscarNombre] = useState("");
  const [buscarMatricula, setBuscarMatricula] = useState("");

  const { matricula: paramMatricula } = useParams();
  const esEdicion = vista === "editar";

  useEffect(() => {
    cargarCatalogos();
    cargarUsuarios();
    if (paramMatricula) {
      setEditandoMatricula(paramMatricula);
      setVista("editar");
    }
  }, []);

  useEffect(() => {
    if (editandoMatricula) {
      cargarUsuario(editandoMatricula);
    }
  }, [editandoMatricula]);

  const cargarCatalogos = async () => {
    try {
      const [carrerasRes, semestresRes, rolesRes] = await Promise.all([
        fetch(`${API}/carreras`),
        fetch(`${API}/semestres`),
        fetch(`${API}/roles`),
      ]);
      if (carrerasRes.ok) setCarreras(await carrerasRes.json());
      if (semestresRes.ok) setSemestres(await semestresRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  };

  const cargarUsuario = async (mat) => {
    setLoadingDatos(true);
    try {
      // Cargamos datos del perfil
      const res = await fetch(`${API}/usuarios/${mat}/perfil`);
      const data = await res.json();

      // También cargamos el rol activo del usuario para pre-llenar los selects
      const rolRes = await fetch(`${API}/usuarios/${mat}/rol-activo`);
      const rolData = await rolRes.json();

      setForm({
        matricula: data.matricula ?? "",
        nombre: data.nombre ?? "",
        apellidos: data.apellidos ?? "",
        correo: data.correo ?? "",
        contrasena: "",
        anio_entrada: data.anio_entrada ?? "",
        id_carrera: data.id_carrera ?? "",
        id_rol: rolData.id_rol ?? "",
        id_semestre: data.id_semestre ?? "",
      });
    } catch (err) {
      console.error("Error cargando usuario:", err);
    } finally {
      setLoadingDatos(false);
    }
  };

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const validar = () => {
    const e = {};
    if (!esEdicion && !form.matricula.trim()) e.matricula = "Requerido";
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.apellidos.trim()) e.apellidos = "Requerido";
    if (!form.correo.trim()) e.correo = "Requerido";
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = "Correo inválido";
    if (!esEdicion) {
      if (!form.contrasena) e.contrasena = "Requerido";
      else if (form.contrasena.length < 6) e.contrasena = "Mínimo 6 caracteres";
    } else if (form.contrasena && form.contrasena.length < 6) {
      e.contrasena = "Mínimo 6 caracteres";
    }
    if (!form.anio_entrada) e.anio_entrada = "Requerido";
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
      const url = esEdicion
        ? `${API}/usuarios/${editandoMatricula}`
        : `${API}/usuarios`;
      const method = esEdicion ? "PUT" : "POST";

      const body = {
        ...form,
        anio_entrada: Number(form.anio_entrada),
        id_carrera: form.id_carrera ? Number(form.id_carrera) : null,
        id_rol: form.id_rol ? Number(form.id_rol) : null,
        id_semestre: form.id_semestre ? Number(form.id_semestre) : null,
      };
      if (esEdicion && !form.contrasena) delete body.contrasena;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data = { error: text }; }

      if (data.ok || res.ok) {
        setExito(true);
        setTimeout(() => {
          setExito(false);
          setVista("lista");
          setEditandoMatricula(null);
          setForm(camposVacios);
          cargarUsuarios();
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

  const iniciarEdicion = (usuario) => {
    setEditandoMatricula(usuario.matricula);
    setVista("editar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarUsuario = async (matricula) => {
    if (!confirm(`¿Eliminar al usuario ${matricula}?`)) return;
    try {
      const res = await fetch(`${API}/usuarios/${matricula}`, { method: "DELETE" });
      if (res.ok) {
        setUsuarios((prev) => prev.filter((u) => u.matricula !== matricula));
      } else {
        alert("No se pudo eliminar el usuario.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const cancelar = () => {
    setVista("lista");
    setEditandoMatricula(null);
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

  // Filtrado
  const usuariosFiltrados = usuarios
    .filter((u) => {
      const nombreCompleto = `${u.nombre} ${u.apellidos}`.toLowerCase();
      const matchNombre = nombreCompleto.includes(buscarNombre.toLowerCase());
      const matchMat = buscarMatricula
        ? String(u.matricula).includes(buscarMatricula)
        : true;
      return matchNombre && matchMat;
    })
    .sort((a, b) => String(a.matricula).localeCompare(String(b.matricula)));

  if (loadingDatos)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando...</p>;

  return (
    <div className="app">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      {/* HEADER */}
      <div className="header detail-header">
        <Link to="/admin" className="back">←</Link>
        <h1>Gestionar usuarios</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={`tab ${vista === "lista" ? "active" : ""}`}
          onClick={() => { setVista("lista"); setEditandoMatricula(null); setForm(camposVacios); }}
        >
          Todos
        </button>
        <button
          className={`tab ${vista === "crear" ? "active" : ""}`}
          onClick={() => { setVista("crear"); setEditandoMatricula(null); setForm(camposVacios); }}
        >
          + Nuevo
        </button>
        {esEdicion && (
          <button className="tab active">Editando</button>
        )}
      </div>

      {/* FILTROS — solo en lista */}
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
            value={buscarMatricula}
            onChange={(e) => setBuscarMatricula(e.target.value)}
            placeholder="Matrícula"
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
            {loadingUsuarios && (
              <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando usuarios...</p>
            )}

            {!loadingUsuarios && usuariosFiltrados.length === 0 && (
              <p style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
                {buscarNombre || buscarMatricula
                  ? "No se encontraron usuarios con ese criterio."
                  : "No hay usuarios registrados."}
              </p>
            )}

            {usuariosFiltrados.map((u) => (
              <div className="card" key={u.matricula} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #e91e8c22, #e91e8c44)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", fontWeight: 700, color: "#e91e8c", flexShrink: 0,
                  }}>
                    {(u.nombre?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text, #111)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.nombre} {u.apellidos}
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>
                      {u.correo}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: "11px", color: "#bbb", margin: "0 0 10px", fontWeight: 500 }}>
                  Matrícula: {u.matricula}
                </p>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="button primary"
                    style={{ flex: 1 }}
                    onClick={() => iniciarEdicion(u)}
                  >
                    Editar
                  </button>
                  <button
                    className="button"
                    style={{ flex: 1 }}
                    onClick={() => eliminarUsuario(u.matricula)}
                  >
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
            {/* Datos personales */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: 0 }}>Datos personales</h3>

              <div>
                <label style={labelStyle}>Matrícula *</label>
                <input
                  name="matricula"
                  value={form.matricula}
                  onChange={handleChange}
                  placeholder="Ej. 00123456"
                  style={inputStyle("matricula")}
                  disabled={esEdicion}
                />
                {errorMsg("matricula")}
              </div>

              <div>
                <label style={labelStyle}>Nombre(s) *</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. María"
                  style={inputStyle("nombre")}
                />
                {errorMsg("nombre")}
              </div>

              <div>
                <label style={labelStyle}>Apellidos *</label>
                <input
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Ej. García López"
                  style={inputStyle("apellidos")}
                />
                {errorMsg("apellidos")}
              </div>

              <div>
                <label style={labelStyle}>Correo institucional *</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="alumno@universidad.mx"
                  style={inputStyle("correo")}
                />
                {errorMsg("correo")}
              </div>

              <div>
                <label style={labelStyle}>
                  {esEdicion ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    placeholder={esEdicion ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                    style={{ ...inputStyle("contrasena"), paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena((p) => !p)}
                    style={{
                      position: "absolute", right: "12px", top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: "#888",
                      fontSize: "16px", padding: 0,
                    }}
                  >
                    {mostrarContrasena ? "🙈" : "👁️"}
                  </button>
                </div>
                {errorMsg("contrasena")}
              </div>
            </div>

            {/* Datos académicos */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: 0 }}>Datos académicos</h3>

              <div>
                <label style={labelStyle}>Año de entrada *</label>
                <input
                  type="number"
                  name="anio_entrada"
                  value={form.anio_entrada}
                  onChange={handleChange}
                  placeholder={`Ej. ${new Date().getFullYear()}`}
                  min="2000"
                  max={new Date().getFullYear()}
                  style={inputStyle("anio_entrada")}
                />
                {errorMsg("anio_entrada")}
              </div>

              <div>
                <label style={labelStyle}>Carrera</label>
                {carreras.length > 0 ? (
                  <select
                    name="id_carrera"
                    value={form.id_carrera}
                    onChange={handleChange}
                    style={inputStyle("id_carrera")}
                  >
                    <option value="">Seleccionar carrera</option>
                    {carreras.map((c) => (
                      <option key={c.id_carrera} value={c.id_carrera}>
                        {c.nombre_carrera}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="id_carrera"
                    value={form.id_carrera}
                    onChange={handleChange}
                    placeholder="ID de carrera"
                    type="number"
                    style={inputStyle("id_carrera")}
                  />
                )}
              </div>

              {/* Semestre */}
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

              {/* Rol */}
              <div>
                <label style={labelStyle}>Rol en el semestre</label>
                {roles.length > 0 ? (
                  <select
                    name="id_rol"
                    value={form.id_rol}
                    onChange={handleChange}
                    style={inputStyle("id_rol")}
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((r) => (
                      <option key={r.id_rol} value={r.id_rol}>
                        {r.nombre} — {r.nivel}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="id_rol"
                    value={form.id_rol}
                    onChange={handleChange}
                    placeholder="ID del rol"
                    type="number"
                    style={inputStyle("id_rol")}
                  />
                )}
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "0 0 8px" }}>
              <button
                className="button primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : esEdicion ? "Guardar cambios" : "Registrar usuario"}
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
              {esEdicion ? "¡Usuario actualizado!" : "¡Usuario registrado!"}
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