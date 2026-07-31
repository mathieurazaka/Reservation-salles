import { useCallback, useEffect, useState } from "react";
import {
  pb,
  COLLECTIONS,
  RESERVATION_FIELDS,
  RESERVATION_STATUS,
  STATUS_TO_UI,
  ROOM_FIELDS,
} from "../services/pocketbase";
import { useAuth } from "./useAuth";

const LOGISTICS_ROLES = ["logistics", "admin"];

function toNotification(record) {
  const room = record.expand?.[RESERVATION_FIELDS.room];
  return {
    id: record.id,
    roomName: room?.[ROOM_FIELDS.name] || "Salle",
    date: record[RESERVATION_FIELDS.date],
    status: STATUS_TO_UI[record[RESERVATION_FIELDS.status]] || "pending",
  };
}

/**
 * - Rôles logistique/admin : notifiés des NOUVELLES demandes en attente.
 * - Rôles enseignant/association : notifiés des changements de statut
 *   (validée / refusée) sur LEURS propres demandes.
 * Utilise pb.collection(...).subscribe('*', ...) pour le temps réel :
 * https://pocketbase.io/docs/api-realtime/
 */
export function useNotifications() {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);
  const isLogistics = LOGISTICS_ROLES.includes(role);

  const loadInitial = useCallback(async () => {
    if (!user) return;
    try {
      const role = (user.role || role || "").toLowerCase();

      // ----- LOGISTIQUE : uniquement associations en attente -----
      if (role === "logistique" || role === "logistics") {
        const list = await pb.collection(COLLECTIONS.RESERVATIONS).getList(1, 20, {
          filter: `${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.PENDING}"`,
          sort: `-${RESERVATION_FIELDS.start}`,
          expand: `${RESERVATION_FIELDS.room},${RESERVATION_FIELDS.user}`,
        });

        const onlyAssociations = list.items.filter((r) => {
          const rRole = (r.expand?.[RESERVATION_FIELDS.user]?.role || "").toLowerCase();
          return rRole === "association";
        });

        setItems(onlyAssociations.map(toNotification));
        return;
      }

      // ----- ADMIN : uniquement enseignants en attente -----
      if (role === "admin") {
        const list = await pb.collection(COLLECTIONS.RESERVATIONS).getList(1, 20, {
          filter: `${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.PENDING}"`,
          sort: `-${RESERVATION_FIELDS.start}`,
          expand: `${RESERVATION_FIELDS.room},${RESERVATION_FIELDS.user}`,
        });

        const onlyTeachers = list.items.filter((r) => {
          const rRole = (r.expand?.[RESERVATION_FIELDS.user]?.role || "").toLowerCase();
          return rRole === "enseignant" || rRole === "teacher";
        });

        setItems(onlyTeachers.map(toNotification));
        return;
      }

      // ----- ENSEIGNANT / ASSOCIATION : leurs propres changements de statut -----
      const list = await pb.collection(COLLECTIONS.RESERVATIONS).getList(1, 8, {
        filter: `${RESERVATION_FIELDS.user} = "${user.id}" && (${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.CONFIRMED}" || ${RESERVATION_FIELDS.status} = "${RESERVATION_STATUS.REFUSED}")`,
        sort: `-updated`,
        expand: RESERVATION_FIELDS.room,
      });
      setItems(list.items.map(toNotification));
    } catch {
      setItems([]);
    }
  }, [user, role, isLogistics]);

  useEffect(() => {
    loadInitial();
    if (!user) return undefined;

    let unsubscribe;
    pb.collection(COLLECTIONS.RESERVATIONS)
      .subscribe("*", (e) => {
        const rec = e.record;
        const concernsMe = isLogistics
          ? rec[RESERVATION_FIELDS.status] === RESERVATION_STATUS.PENDING
          : rec[RESERVATION_FIELDS.user] === user.id;
        if (concernsMe) loadInitial();
      })
      .then((fn) => {
        unsubscribe = fn;
      })
      .catch(() => {});

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isLogistics, loadInitial]);

  return { items, count: items.length };
}
