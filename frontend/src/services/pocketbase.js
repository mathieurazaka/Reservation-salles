import PocketBase from "pocketbase";

/**
 * Instance unique du SDK PocketBase, partagée dans toute l'application.
 */
export const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090"
);
pb.autoCancellation(false);

/* ------------------------------------------------------------------ */
/*  Noms des collections réelles du backend                            */
/* ------------------------------------------------------------------ */
export const COLLECTIONS = {
  USERS: "users",
  ROOMS: "salles",
  RESERVATIONS: "reservations",
};

/* ------------------------------------------------------------------ */
/*  Mapping des champs — adapté à ton schéma réel                      */
/* ------------------------------------------------------------------ */
export const ROOM_FIELDS = {
  name: "nom",
  capacity: "capacite",
  videoprojecteur: "videoprojecteur",
  ordinateur: "ordinateur",
  description: "description",
};

export const RESERVATION_FIELDS = {
  room: "salle",
  user: "utilisateur",
  start: "debut",          // datetime
  end: "fin",              // datetime
  reason: "motif",
  status: "statut",
  validation: "validation",
};

export const USER_FIELDS = {
  name: "nom",
  prenom: "prenom",
  role: "role",
  // department: "department", // décommente si tu as ce champ
};

// Valeurs du champ "statut" côté backend
export const RESERVATION_STATUS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmee",
  REFUSED: "Refusee",
};

// Traduction backend → UI
export const STATUS_TO_UI = {
  [RESERVATION_STATUS.PENDING]: "pending",
  [RESERVATION_STATUS.CONFIRMED]: "confirmed",
  [RESERVATION_STATUS.REFUSED]: "refused",
};

export const UI_TO_STATUS = {
  pending: RESERVATION_STATUS.PENDING,
  confirmed: RESERVATION_STATUS.CONFIRMED,
  refused: RESERVATION_STATUS.REFUSED,
};

export default pb;