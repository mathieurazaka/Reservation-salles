import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" />
      <rect x="12" y="8" width="3" height="10" />
      <rect x="17" y="5" width="3" height="13" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
};

// Navigation par rôle : chaque rôle ne voit que les sections qui le concernent
const NAV_BY_ROLE = {
  // Enseignant
  teacher: [
    { to: "/app/dashboard", label: "Tableau de bord", icon: "dashboard" },
    { to: "/app/rooms/search", label: "Rechercher une salle", icon: "search" },
    { to: "/app/reservations", label: "Mes réservations", icon: "book" },
  ],
  enseignant: [
    { to: "/app/dashboard", label: "Tableau de bord", icon: "dashboard" },
    { to: "/app/rooms/search", label: "Rechercher une salle", icon: "search" },
    { to: "/app/reservations", label: "Mes réservations", icon: "book" },
  ],

  // Association
  association: [
    { to: "/app/dashboard", label: "Tableau de bord", icon: "dashboard" },
    { to: "/app/rooms/search", label: "Rechercher une salle", icon: "search" },
    { to: "/app/reservations", label: "Mes réservations", icon: "book" },
  ],

  // Logistique → pas de réservation, validation associations + gestion salles
  logistics: [
    { to: "/app/dashboard", label: "Tableau de bord", icon: "dashboard" },
    { to: "/app/logistics", label: "Interface logistique", icon: "clock" },
    { to: "/app/rooms/manage", label: "Gestion des salles", icon: "book" },
  ],
  logistique: [
    { to: "/app/dashboard", label: "Tableau de bord", icon: "dashboard" },
    { to: "/app/logistics", label: "Interface logistique", icon: "clock" },
    { to: "/app/rooms/manage", label: "Gestion des salles", icon: "book" },
  ],

  // Admin → validation enseignants + stats + agenda
  admin: [
    { to: "/app/dashboard", label: "Tableau de bord", icon: "dashboard" },
    { to: "/app/admin/validation", label: "Validation enseignants", icon: "clock" },
    { to: "/app/admin", label: "Administration", icon: "chart" },
    { to: "/app/agenda", label: "Agenda", icon: "calendar" },
  ],
};

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.teacher;
  const initials = (user?.nom || user?.prenom || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-gradient-to-b from-brand-900 to-brand-800 p-4 text-white">
      <div className="mb-6 flex items-center gap-2.5 px-1.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 21v-4h6v4M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01" />
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight">UniSalle</div>
          <div className="text-[11px] text-indigo-200">Gestion des salles</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
                isActive
                  ? "bg-white/15 font-semibold text-white"
                  : "text-indigo-100 hover:bg-white/5"
              }`
            }
          >
            <span className="h-[17px] w-[17px] flex-shrink-0">{ICONS[item.icon]}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-white/15 pt-3.5">
        <div className="flex h-8.5 w-8.5 h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-500 text-xs font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold">{user?.nom} {user?.prenom || user?.email}</div>
          <div className="truncate text-[11px] text-indigo-200 capitalize">{role}</div>
        </div>
        <button onClick={logout} title="Déconnexion" className="text-indigo-200 hover:text-white">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
