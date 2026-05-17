import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "../pages/SignIn";
import Activities from "../pages/Activities";
import Passport from "../pages/Passport";
import Home from "../pages/Home";
import Details from "../pages/Details";
import ProtectedRoute from "../components/ProtectedRoute";
import Calendar from "../pages/Calendar";
import GestionarAsistencia from "../pages/GestionarAsistencia";
import Help from "../pages/Help";
import Historial from "../pages/Historial";
import GestionarActividades from "../pages/GestionarActividades";
import GestionarUsuarios from "../pages/GestionarUsuarios";  // renombrado
import Admin from "../pages/Admin";
import AdminRoute from "../components/AdminRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
        <Route path="/details/:id" element={<ProtectedRoute><Details /></ProtectedRoute>} />
        <Route path="/passport" element={<ProtectedRoute><Passport /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/gestionar-asistencia" element={<AdminRoute><GestionarAsistencia /></AdminRoute>} />  {/* ← fix */}

        {/* Actividades */}
        <Route path="/admin/crear-actividad" element={<AdminRoute><GestionarActividades /></AdminRoute>} />
        <Route path="/admin/gestionar-actividades" element={<AdminRoute><GestionarActividades /></AdminRoute>} />
        <Route path="/admin/editar-actividad/:id" element={<AdminRoute><GestionarActividades /></AdminRoute>} />

        {/* Usuarios */}
        {/* Usuarios */}
        <Route path="/admin/gestionar-usuarios" element={<AdminRoute><GestionarUsuarios /></AdminRoute>} />
        <Route path="/admin/registrar-usuario" element={<AdminRoute><GestionarUsuarios /></AdminRoute>} />
        <Route path="/admin/editar-usuario/:matricula" element={<AdminRoute><GestionarUsuarios /></AdminRoute>}/>
        <Route path="/admin/editar-usuario/:matricula" element={<AdminRoute><GestionarUsuarios /></AdminRoute>} />  {/* ← nuevo */}
      </Routes>
    </BrowserRouter>
  );
}