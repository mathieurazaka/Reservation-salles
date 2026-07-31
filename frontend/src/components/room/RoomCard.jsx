import { useNavigate, useLocation } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const criteria = state?.criteria || {};

  function handleReserve() {
    navigate(`/app/rooms/${room.id}/reserve`, {
      state: { room, criteria },
    });
  }

  return (
    <Card className={`flex items-start justify-between gap-4 p-4.5 p-[18px] ${!room.available ? "opacity-60" : ""}`}>
      <div className="flex gap-3.5">
        <div className="flex h-10.5 w-10.5 h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="18" rx="2" />
          </svg>
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2 text-[15px] font-bold">
            {room.name}
            {!room.available && <StatusBadge status="unavailable" />}
          </div>
          <div className="mb-1.5 text-xs text-gray-500">
            {room.building} {room.floor ? `· ${room.floor}` : ""}
          </div>
          <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-gray-700">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {room.capacity} places
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(room.equipments || []).map((eq) => (
              <span
                key={eq}
                className="rounded-md bg-brand-100 px-2.5 py-1 text-[11.5px] font-semibold text-brand-700"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      </div>

      {room.available ? (
        <Button type="button" className="btn btn-primary" onClick={handleReserve}>
          Réserver
        </Button>
      ) : (
        <Button variant="outline" disabled className="cursor-not-allowed bg-gray-100 text-gray-400">
          Indisponible
        </Button>
      )}
    </Card>
  );
}
