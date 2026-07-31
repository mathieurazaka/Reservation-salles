import { useNavigate } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import RoomFilterForm from "../../components/room/RoomFilterForm";
import { useRooms } from "../../hooks/useRooms";

export default function RoomSearch() {
  const navigate = useNavigate();
  const { search, isLoading, error } = useRooms();

  async function handleSearch(criteria) {
    try {
      const results = await search(criteria);
      // On transmet les résultats + le créneau à l'écran des résultats via router state
      navigate("/app/rooms/results", { state: { results, criteria } });
    } catch {
      // L'erreur est déjà stockée dans `error` par useRooms et affichée ci-dessous ;
      // on reste volontairement sur cet écran pour laisser la personne corriger sa recherche.
    }
  }

  return (
    <>
      <Topbar title="Rechercher une salle" />
      <div className="p-6">
        {error && (
          <div className="mb-4 max-w-xl rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
            {error}
          </div>
        )}
        <RoomFilterForm onSearch={handleSearch} isLoading={isLoading} />
      </div>
    </>
  );
}
