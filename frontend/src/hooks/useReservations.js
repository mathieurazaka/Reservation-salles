import { useCallback, useState } from "react";
import {
  pb,
  COLLECTIONS,
  RESERVATION_FIELDS,
  RESERVATION_STATUS,
  STATUS_TO_UI,
  UI_TO_STATUS,
  ROOM_FIELDS,
  USER_FIELDS,
} from "../services/pocketbase";
import { useAuth } from "./useAuth";

/** Traduit un enregistrement "reservations" brut vers la forme utilisée par l'UI. */
function normalizeReservation(record) {
  const roomExpand = record.expand?.[RESERVATION_FIELDS.room];
  const userExpand = record.expand?.[RESERVATION_FIELDS.user];

  const startDate = record[RESERVATION_FIELDS.start]
    ? new Date(record[RESERVATION_FIELDS.start])
    : null;
  const endDate = record[RESERVATION_FIELDS.end]
    ? new Date(record[RESERVATION_FIELDS.end])
    : null;

  return {
    id: record.id,
    date: startDate ? startDate.toISOString().slice(0, 10) : "",
    start: startDate ? startDate.toTimeString().slice(0, 5) : "",
    end: endDate ? endDate.toTimeString().slice(0, 5) : "",
    reason: record[RESERVATION_FIELDS.reason],
    status: STATUS_TO_UI[record[RESERVATION_FIELDS.status]] || "pending",
    room: roomExpand
      ? {
          id: roomExpand.id,
          name: roomExpand[ROOM_FIELDS.name],
          capacity: roomExpand[ROOM_FIELDS.capacity],
        }
      : null,
    user: userExpand
    ? {
        id: userExpand.id,
        name:
          [userExpand.nom, userExpand.prenom].filter(Boolean).join(" ") ||
          userExpand.name ||
          userExpand.email ||
          "Utilisateur",
        nom: userExpand.nom || "",
        prenom: userExpand.prenom || "",
      }
    : null,
    _raw: record,
  };
}

export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Mes réservations */
  const fetchMine = useCallback(async () => {
    if (!user) return [];
    setIsLoading(true);
    setError(null);
    try {
      const list = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
        filter: `${RESERVATION_FIELDS.user} = "${user.id}"`,
        sort: `-${RESERVATION_FIELDS.start}`,
        expand: RESERVATION_FIELDS.room,
      });
      const normalized = list.map(normalizeReservation);
      setReservations(normalized);
      return normalized;
    } catch (err) {
      const message =
        err?.data?.message || err?.message || "Impossible de charger vos réservations.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /** Demandes en attente (logistique) */
  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
        filter: `${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.PENDING}"`,
        sort: RESERVATION_FIELDS.start,
        expand: `${RESERVATION_FIELDS.room},${RESERVATION_FIELDS.user}`,
      });
      const normalized = list.map(normalizeReservation);
      setReservations(normalized);
      return normalized;
    } catch (err) {
      const message =
        err?.data?.message || err?.message || "Impossible de charger les demandes.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Demandes associations (pour la logistique) */
  const fetchPendingAssociations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
        filter: `${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.PENDING}"`,
        sort: RESERVATION_FIELDS.start,
        expand: `${RESERVATION_FIELDS.room},${RESERVATION_FIELDS.user}`,
      });

      // Garde seulement les demandes des associations
      const filtered = list.filter((r) => {
        const role = (r.expand?.[RESERVATION_FIELDS.user]?.role || "").toLowerCase();
        return role === "association";
      });

      const normalized = filtered.map(normalizeReservation);
      setReservations(normalized);
      return normalized;
    } catch (err) {
      const message = err?.message || "Impossible de charger les demandes.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Demandes enseignants (pour l'admin) */
  const fetchPendingTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
        filter: `${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.PENDING}"`,
        sort: RESERVATION_FIELDS.start,
        expand: `${RESERVATION_FIELDS.room},${RESERVATION_FIELDS.user}`,
      });

      const filtered = list.filter((r) => {
        const role = (r.expand?.[RESERVATION_FIELDS.user]?.role || "").toLowerCase();
        return role === "enseignant" || role === "teacher";
      });

      const normalized = filtered.map(normalizeReservation);
      setReservations(normalized);
      return normalized;
    } catch (err) {
      const message = err?.message || "Impossible de charger les demandes.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Créer une nouvelle demande de réservation */
    const create = useCallback(
      async ({ roomId, date, start, end, reason }) => {
        if (!user) throw new Error("Vous devez être connecté.");

        const role = (user.role || "").toLowerCase();

        // Le logistique ne peut pas réserver
        if (role === "logistique" || role === "logistics") {
          throw new Error("Le service logistique ne peut pas réserver de salle.");
        }

        const debut = new Date(`${date}T${start}:00`).toISOString();
        const fin = new Date(`${date}T${end}:00`).toISOString();

        const overlapFilter = [
          `${RESERVATION_FIELDS.room} = "${roomId}"`,
          `${RESERVATION_FIELDS.status} != "${RESERVATION_STATUS.REFUSED}"`,
          `${RESERVATION_FIELDS.start} < "${fin}"`,
          `${RESERVATION_FIELDS.end} > "${debut}"`,
        ].join(" && ");

        const conflicts = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
          filter: overlapFilter,
        });

        if (conflicts.length > 0) {
          throw new Error(
            "Cette salle est déjà réservée (ou en attente) sur ce créneau."
          );
        }

        // Tout le monde passe en attente (association → logistique, enseignant → admin)
        return pb.collection(COLLECTIONS.RESERVATIONS).create({
          [RESERVATION_FIELDS.room]: roomId,
          [RESERVATION_FIELDS.user]: user.id,
          [RESERVATION_FIELDS.start]: debut,
          [RESERVATION_FIELDS.end]: fin,
          [RESERVATION_FIELDS.reason]: reason,
          [RESERVATION_FIELDS.status]: RESERVATION_STATUS.PENDING,
        });
      },
      [user]
    );

  /** Valider ou refuser une demande */
    const setStatus = useCallback(async (reservationId, uiStatus) => {
      // Mapping forcé (évite les erreurs de casse / accents)
      const statusMap = {
        pending: "En attente",
        confirmed: "Confirmee",
        refused: "Refusee",
      };

      const backendStatus = statusMap[uiStatus] || uiStatus;

      console.log("Action :", uiStatus, "→", backendStatus);

      // Vérification de conflit uniquement pour CONFIRMER
      if (backendStatus === "Confirmee") {
        const current = await pb.collection(COLLECTIONS.RESERVATIONS).getOne(reservationId);

        const overlapFilter = [
          `id != "${reservationId}"`,
          `${RESERVATION_FIELDS.room} = "${current[RESERVATION_FIELDS.room]}"`,
          `${RESERVATION_FIELDS.status} = "Confirmee"`,
          `${RESERVATION_FIELDS.start} < "${current[RESERVATION_FIELDS.end]}"`,
          `${RESERVATION_FIELDS.end} > "${current[RESERVATION_FIELDS.start]}"`,
        ].join(" && ");

        const conflicts = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
          filter: overlapFilter,
          expand: RESERVATION_FIELDS.user,
        });

        if (conflicts.length > 0) {
          const occupant = conflicts[0].expand?.[RESERVATION_FIELDS.user];
          const nom =
            [occupant?.nom, occupant?.prenom].filter(Boolean).join(" ") ||
            occupant?.email ||
            "un autre utilisateur";

          throw new Error(
            `Salle déjà occupée par ${nom}. Vous devez refuser cette demande.`
          );
        }
      }

      // Mise à jour
      try {
        return await pb.collection(COLLECTIONS.RESERVATIONS).update(reservationId, {
          statut: backendStatus,
        });
      } catch (err) {
        console.error("Erreur update :", err?.data || err);
        throw new Error(
          err?.data?.data?.statut?.message ||
            err?.message ||
            "Impossible de mettre à jour la réservation."
        );
      }
    }, []);

  return {
    reservations,
    isLoading,
    error,
    fetchMine,
    fetchPending,
    fetchPendingAssociations,
    fetchPendingTeachers,
    create,
    setStatus,
  };
}