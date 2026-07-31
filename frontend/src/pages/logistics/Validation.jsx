import { useEffect, useState } from "react";
import Topbar from "../../components/layout/Topbar";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useReservations } from "../../hooks/useReservations";
import { formatDateLong, formatTimeRange } from "../../utils/date";

export default function Validation() {
  const { reservations, isLoading, fetchPendingAssociations, setStatus } = useReservations();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingAssociations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  async function handleDecision(id, status) {
    setBusyId(id);
    setError(null);
    try {
      await setStatus(id, status);
      await fetchPendingAssociations(); // recharge la liste
    } catch (err) {
      // Même en cas d'erreur, on recharge pour voir l'état réel
      try {
        await fetchPendingAssociations();
      } catch (_) {}
      setError(err?.message || "Échec de la mise à jour.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Topbar title="Interface logistique" />
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[19px] font-bold">Interface logistique</h2>
            <p className="text-[12.5px] text-gray-500">
              Validation des demandes de réservation
            </p>
          </div>
          <span className="badge badge-amber px-3.5 py-1.5 text-[12.5px]">
            {reservations.length} en attente
          </span>
        </div>

        {/* Bandeau d'erreur */}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="py-6 text-center text-sm text-gray-400">Chargement...</p>
        )}

        {!isLoading && reservations.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            Aucune demande en attente.
          </p>
        )}

        <div className="space-y-3">
          {reservations.map((req) => (
            <Card
              key={req.id}
              className="flex items-start justify-between gap-4 p-[18px]"
            >
              <div className="flex gap-3.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-bold">
                    {req.room?.name || "Salle"}
                  </div>
                  <div className="mb-1.5 text-xs text-gray-500">
                    {formatDateLong(req.date)} · {formatTimeRange(req.start, req.end)}
                  </div>
                  <div className="mb-2 text-[13px]">
                    {req.user?.name || "Utilisateur inconnu"}
                  </div>
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-[11.5px] text-gray-700">
                    {req.reason}
                  </span>
                </div>
              </div>

              <div className="flex flex-shrink-0 gap-2.5">
                <Button
                  className="btn btn-red-outline"
                  disabled={busyId === req.id}
                  onClick={() => handleDecision(req.id, "refused")}
                >
                  Refuser
                </Button>
                <Button
                  className="btn btn-green"
                  disabled={busyId === req.id}
                  onClick={() => handleDecision(req.id, "confirmed")}
                >
                  Valider
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}