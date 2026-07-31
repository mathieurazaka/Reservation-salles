import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useReservations } from "../../hooks/useReservations";

export default function ReservationForm() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { create } = useReservations();

  const room = state?.room;
  const criteria = state?.criteria || {};

  // Prérempli avec la recherche, modifiable si besoin
  const [date, setDate] = useState(criteria.date || "");
  const [start, setStart] = useState(criteria.start || "09:00");
  const [end, setEnd] = useState(criteria.end || "11:00");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await create({ roomId, date, start, end, reason });
      navigate("/app/reservations"); // ou /app/dashboard
    } catch (err) {
      setError(err?.message || "La réservation n'a pas pu être envoyée.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Topbar title="Formulaire de réservation" />
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-2.5 flex items-center gap-1.5 text-[12.5px] text-gray-500"
        >
          ← Retour aux résultats
        </button>

        <Card className="max-w-xl p-6">
          <p className="text-[12.5px] text-gray-500">Salle sélectionnée</p>
          <h2 className="mb-5 text-[19px] font-bold">
            {room
              ? `${room.name} · ${room.capacity} places`
              : `Salle #${roomId}`}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <label className="label">Date</label>
            <input
              type="date"
              className="input mb-4"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className="flex gap-3.5">
              <div className="flex-1">
                <label className="label">Heure de début</label>
                <input
                  type="time"
                  className="input"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="label">Heure de fin</label>
                <input
                  type="time"
                  className="input"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className="label mt-4">Motif de la réservation</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Cours, réunion, examen..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Envoi..." : "Confirmer la réservation"}
              </Button>
              <Button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}