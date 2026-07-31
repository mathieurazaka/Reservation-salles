import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

// Chaque page place elle-même son <Topbar title="..."/> en haut de son contenu
// (voir src/pages/**), ce qui évite de faire remonter le titre via des props
// de layout et garde chaque écran autonome.
export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
