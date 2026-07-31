import { useCallback, useState } from "react";
import {
  pb,
  COLLECTIONS,
  ROOM_FIELDS,
  RESERVATION_FIELDS,
  RESERVATION_STATUS,
} from "../services/pocketbase";

/** Traduit un enregistrement PocketBase brut vers la forme utilisée par l'UI. */
function normalizeRoom(record, available = true) {
  const equipments = [];
  if (record[ROOM_FIELDS.videoprojecteur]) equipments.push("Vidéoprojecteur");
  if (record[ROOM_FIELDS.ordinateur]) equipments.push("Ordinateur");

  return {
    id: record.id,
    name: record[ROOM_FIELDS.name],
    capacity: record[ROOM_FIELDS.capacity],
    description: record[ROOM_FIELDS.description] || "",
    equipments,
    available,
    _raw: record,
  };
}

/**
 * Recherche des salles disponibles selon capacité / équipements / créneau.
 * La disponibilité exclut les salles ayant déjà une réservation qui chevauche le créneau.
 */
export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(
    async ({ minCapacity, videoprojecteur, ordinateur, date, start, end }) => {
      setIsLoading(true);
      setError(null);

      try {
        // --- 1. Filtre sur la collection salles ---
        const filterParts = [];

        if (minCapacity) {
          filterParts.push(`${ROOM_FIELDS.capacity} >= ${Number(minCapacity)}`);
        }
        if (videoprojecteur) {
          filterParts.push(`${ROOM_FIELDS.videoprojecteur} = true`);
        }
        if (ordinateur) {
          filterParts.push(`${ROOM_FIELDS.ordinateur} = true`);
        }

        const list = await pb.collection(COLLECTIONS.ROOMS).getFullList({
          filter: filterParts.length > 0 ? filterParts.join(" && ") : "",
          sort: ROOM_FIELDS.name,
        });

        // --- 2. Vérification de disponibilité (chevauchement) ---
        const withAvailability = await Promise.all(
          list.map(async (room) => {
            // Si pas de date/heure → on considère la salle disponible
            if (!date || !start || !end) {
              return normalizeRoom(room, true);
            }

            // On construit les dates complètes
            const startDateTime = `${date} ${start}:00`;
            const endDateTime = `${date} ${end}:00`;

            // Filtre de chevauchement
            const overlapFilter = [
              `${RESERVATION_FIELDS.room} = "${room.id}"`,
              // On ignore les réservations refusées
              `${RESERVATION_FIELDS.status} != "${RESERVATION_STATUS.REFUSED}"`,
              // Chevauchement classique : debut < fin_demandée ET fin > debut_demandée
              `${RESERVATION_FIELDS.start} < "${endDateTime}"`,
              `${RESERVATION_FIELDS.end} > "${startDateTime}"`,
            ].join(" && ");

            const conflicts = await pb
              .collection(COLLECTIONS.RESERVATIONS)
              .getFullList({ filter: overlapFilter });

            return normalizeRoom(room, conflicts.length === 0);
          })
        );

        setRooms(withAvailability);
        return withAvailability;
      } catch (err) {
        const message =
          err?.data?.message ||
          err?.message ||
          "Impossible de charger les salles. Vérifiez la collection 'salles' et ses règles d'accès.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { rooms, isLoading, error, search };
}