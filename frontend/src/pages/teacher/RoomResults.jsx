import { useLocation, useNavigate } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import RoomCard from "../../components/room/RoomCard";

export default function RoomResults() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const results = state?.results || [];
  const criteria = state?.criteria || {};

  function handleReserve(room) {
    navigate(`/app/rooms/reserve/${room.id}`, {
      state: { room, criteria },
    });
  }

  return (
    <>
      <Topbar title="Résultats de recherche" />
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-2.5 flex items-center gap-1.5 text-[12.5px] text-gray-500"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Salles disponibles
        </button>

        <h2 className="text-[19px] font-bold">Salles disponibles</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">
          {criteria.date} · {criteria.start} – {criteria.end}
        </p>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[13.5px]">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l3 3 5-6" />
          </svg>
          <b className="font-bold">{results.length} salle(s)</b>&nbsp;correspondent à vos critères
        </div>

        {results.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Aucune salle ne correspond à ces critères. Modifiez votre recherche.
          </p>
        ) : (
          <div className="space-y-3">
            {results.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
