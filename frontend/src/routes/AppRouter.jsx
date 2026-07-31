import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/auth/Login";
import TeacherDashboard from "../pages/teacher/Dashboard";
import AssociationDashboard from "../pages/association/Dashboard";
import RoomSearch from "../pages/teacher/RoomSearch";
import RoomResults from "../pages/teacher/RoomResults";
import ReservationForm from "../pages/teacher/ReservationForm";
import MyReservations from "../pages/teacher/MyReservations";
import Validation from "../pages/logistics/Validation";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ReservationsAgenda from "../pages/admin/ReservationsAgenda";
import TeacherValidation from "../pages/admin/TeacherValidation";
import RoomManage from "../pages/logistics/RoomManage";
import Register from "../pages/auth/Register";

/** Bloque l'accès aux routes /app/* tant que l'utilisateur n'est pas authentifié */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/** Route à laquelle le tableau de bord s'adapte selon le rôle connecté */
function RoleDashboard() {
  const { role } = useAuth();
  if (role === "association") return <AssociationDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <TeacherDashboard />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/app"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<RoleDashboard />} />
        <Route path="rooms/search" element={<RoomSearch />} />
        <Route path="rooms/results" element={<RoomResults />} />
        <Route path="rooms/:roomId/reserve" element={<ReservationForm />} />
        <Route path="rooms/manage" element={<RoomManage />} />
        <Route path="reservations" element={<MyReservations />} />
        <Route path="logistics" element={<Validation />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/validation" element={<TeacherValidation />} />
        <Route path="agenda" element={<ReservationsAgenda />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
