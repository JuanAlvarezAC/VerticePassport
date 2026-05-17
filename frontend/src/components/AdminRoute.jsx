import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // no logueado
    if (!usuario) {
        return <Navigate to="/" />;
    }

    // no admin
    if (!usuario.esAdmin) {
        return <Navigate to="/home" />;
    }

    return children;
}