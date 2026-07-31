import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import KpiCard from "../../components/common/KpiCard";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useReservations } from "../../hooks/useReservations";
import { formatDayMonth, formatTimeRange } from "../../utils/date";

export default function Dashboard() {
  const { user } = useAuth();
  const { reservations, isLoading, fetchMine } = useReservations();
  const [stats, setStats] = useState({ active: 0, pending: 0, confirmed: 0, hours: 0 });

  useEffect(() => {
    fetchMine().then((list) => {
      const pending = list.filter((r) => r.status === "pending").length;
      const confirmed = list.filter((r) => r.status === "confirmed").length;
      setStats({
        active: list.length,
        pending,
        confirmed,
        hours: list.reduce((acc, r) => acc + hoursBetween(r.start, r.end), 0),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Topbar title="Tableau de bord" />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-bold">Bonjour, {user?.prenom || "Utilisateur"} </h2>
            <p className="text-[12.5px] text-gray-500">{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <Link to="/app/rooms/search">
            <Button>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Réserver une salle
            </Button>
          </Link>
        </div>

        <div className="mb-4.5 mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon="📘" value={stats.active} label="Réservations actives · ce mois" />
          <KpiCard icon="⏱" iconColor="amber" value={stats.pending} label="En attente · validation requise" />
          <KpiCard icon="✓" iconColor="green" value={stats.confirmed} label="Confirmées" />
          <KpiCard icon="🕐" iconColor="blue" value={`${stats.hours}h`} label="Heures réservées · ce mois" />
        </div>

        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Mes réservations</h3>
            <span className="text-xs text-gray-500">{reservations.length} réservations</span>
          </div>

          {isLoading && <p className="py-6 text-center text-sm text-gray-400">Chargement...</p>}

          {!isLoading && reservations.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">Aucune réservation pour le moment.</p>
          )}

          <table className="w-full">
            <tbody>
              {reservations.map((r) => {
                const { day, month } = formatDayMonth(r.date);
                return (
                <tr key={r.id} className="border-b border-gray-100 last:border-0">
                  <td className="w-16 py-3.5">
                    <div className="inline-flex flex-col items-center rounded-lg bg-brand-100 px-2.5 py-1 text-[13px] font-bold leading-tight text-brand-700">
                      {day}
                      <span className="text-[10px] font-medium text-brand-500">{month}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[13.5px]">
                    <b>{r.room?.name || "Salle"}</b>
                    <br />
                    <span className="text-xs text-gray-500">
                      {formatTimeRange(r.start, r.end)} · {r.reason}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          <Link
            to="/app/rooms/search"
            className="mt-3.5 inline-block text-[13px] font-bold text-brand-600"
          >
            Nouvelle réservation ›
          </Link>
        </Card>
      </div>
    </>
  );
}

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh + em / 60 - (sh + sm / 60));
}
