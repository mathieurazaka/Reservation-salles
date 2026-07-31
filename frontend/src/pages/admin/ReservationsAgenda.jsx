import { useEffect, useState } from "react";
import Topbar from "../../components/layout/Topbar";
import Card from "../../components/common/Card";
import {
  pb,
  COLLECTIONS,
  RESERVATION_FIELDS,
  RESERVATION_STATUS,
  STATUS_TO_UI,
  ROOM_FIELDS,
  USER_FIELDS,
} from "../../services/pocketbase";

export default function ReservationsAgenda() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDay(date);
  }, [date]);

  async function loadDay(selectedDate) {
    setIsLoading(true);
    setError(null);
    try {
      const dayStart = `${selectedDate} 00:00:00`;
      const dayEnd = `${selectedDate} 23:59:59`;

      const list = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
        filter: `${RESERVATION_FIELDS.start} >= "${dayStart}" && ${RESERVATION_FIELDS.start} <= "${dayEnd}"`,
        sort: RESERVATION_FIELDS.start,
        expand: `${RESERVATION_FIELDS.room},${RESERVATION_FIELDS.user}`,
      });

      const normalized = list.map((record) => {
        const start = record[RESERVATION_FIELDS.start]
          ? new Date(record[RESERVATION_FIELDS.start])
          : null;
        const end = record[RESERVATION_FIELDS.end]
          ? new Date(record[RESERVATION_FIELDS.end])
          : null;
        const room = record.expand?.[RESERVATION_FIELDS.room];
        const user = record.expand?.[RESERVATION_FIELDS.user];

        return {
          id: record.id,
          start: start ? start.toTimeString().slice(0, 5) : "",
          end: end ? end.toTimeString().slice(0, 5) : "",
          status: STATUS_TO_UI[record[RESERVATION_FIELDS.status]] || "pending",
          statusLabel: record[RESERVATION_FIELDS.status],
          reason: record[RESERVATION_FIELDS.reason] || "",
          roomName: room?.[ROOM_FIELDS.name] || "Salle",
          userName:
            user?.[USER_FIELDS.name] ||
            user?.name ||
            user?.email ||
            "Utilisateur",
        };
      });

      setItems(normalized);
    } catch (err) {
      setError(err?.message || "Impossible de charger les réservations.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  const statusClass = {
    pending: "badge-amber",
    confirmed: "badge-green",
    refused: "badge-red",
  };

  return (
    <>
      <Topbar title="Agenda des réservations" />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[19px] font-bold">Agenda</h2>
            <p className="text-[12.5px] text-gray-500">
              Toutes les réservations d’une journée
            </p>
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input w-auto"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="py-8 text-center text-sm text-gray-400">Chargement...</p>
        )}

        {!isLoading && items.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-400">
            Aucune réservation pour cette date.
          </Card>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-28 text-sm font-bold text-brand-700">
                  {item.start} – {item.end}
                </div>
                <div>
                  <div className="text-[15px] font-bold">{item.roomName}</div>
                  <div className="text-[13px] text-gray-600">
                    {item.userName}
                    {item.reason ? ` — ${item.reason}` : ""}
                  </div>
                </div>
              </div>

              <span className={`badge ${statusClass[item.status] || "badge-gray"}`}>
                {item.statusLabel}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}