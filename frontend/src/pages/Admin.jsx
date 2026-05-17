import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";

export default function Admin() {
  const [menuOpen, setMenuOpen] = useState(false);

  const opciones = [
    {
      to: "/admin/gestionar-actividades",
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
          <path d="M6.5 7a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm-2 2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"/>
        </svg>
      ),
      titulo: "Gestionar actividades",
      descripcion: "Ver, crear, editar, eliminar y cerrar actividades.",
    },
    {
      to: "/admin/gestionar-usuarios",
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
        </svg>
      ),
      titulo: "Gestionar usuarios",
      descripcion: "Buscar, ver perfiles, roles, materias, historial y puntos.",
    },
    {
      to: "/admin/gestionar-asistencia",
      icono: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
          <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
        </svg>
      ),
      titulo: "Control de asistencia",
      descripcion: "Ver inscritos, marcar asistencia y cambiar estatus.",
    },
  ];

  return (
    <div className="app">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      {/* Header */}
      <div className="header detail-header">
        <button
          className="back"
          onClick={() => setMenuOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", padding: 0 }}
        >
          ☰
        </button>
        <h1>Panel de administración</h1>
      </div>

      <div className="container" style={{ paddingBottom: "100px" }}>
        <p style={{ color: "#888", fontSize: "14px", margin: "0 0 16px" }}>
          ¿Qué deseas hacer?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {opciones.map((op) => (
            <Link key={op.to} to={op.to} style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  margin: 0,
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "rgba(233,30,140,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e91e8c",
                  flexShrink: 0,
                }}>
                  {op.icono}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "var(--text, #111)" }}>
                    {op.titulo}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#888" }}>
                    {op.descripcion}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ccc" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
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