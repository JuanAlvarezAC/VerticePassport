const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ConfirmModal({ show, onClose, onConfirm, actividad }) {
  if (!show || !actividad) return null;

  const fecha = new Date(actividad.fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>¿Confirmar inscripción?</h2>
        <p>Vas a inscribirte en:</p>

        <div className="modal-card">
          <p><strong>Actividad:</strong> {actividad.nombre_evento}</p>
          <p><strong>Fecha:</strong> {fecha}</p>
          <p><strong>Hora:</strong> {actividad.hora_inicio?.slice(0, 5)} - {actividad.hora_fin?.slice(0, 5)}</p>
          <p><strong>Lugar:</strong> {actividad.lugar}</p>
          <p><strong>Puntos:</strong> ⭐ +{actividad.puntos_fijos}</p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}