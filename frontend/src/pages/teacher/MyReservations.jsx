import { useEffect } from "react";
import Topbar from "../../components/layout/Topbar";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import { useReservations } from "../../hooks/useReservations";
import { formatDateLong, formatTimeRange } from "../../utils/date";

export default function MyReservations() {
  const { reservations, isLoading, error, fetchMine } = useReservations();

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Topbar title="Mes réservations" />
      <div className="p-6">
        <h2 className="mb-1 text-[19px] font-bold">Mes réservations</h2>
        <p className="mb-5 text-[12.5px] text-gray-500">
          {reservations.length} réservation{reservations.length > 1 ? "s" : ""} au total
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        {isLoading && <p className="py-6 text-center text-sm text-gray-400">Chargement...</p>}

        {!isLoading && reservations.length === 0 && !error && (
          <p className="py-10 text-center text-sm text-gray-400">
            Vous n'avez encore aucune réservation.
          </p>
        )}

        <div className="space-y-3">
          {reservations.map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-[15px] font-bold">{r.room?.name || "Salle"}</div>
                <div className="text-xs text-gray-500">
                  {formatDateLong(r.date)} · {formatTimeRange(r.start, r.end)}
                </div>
                {r.reason && <div className="mt-1 text-[13px] text-gray-700">{r.reason}</div>}
              </div>
              <StatusBadge status={r.status} />
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
