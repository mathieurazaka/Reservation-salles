const MONTHS_SHORT = [
  "jan", "fév", "mar", "avr", "mai", "juin",
  "juil", "août", "sep", "oct", "nov", "déc",
];

/**
 * "2026-06-24" -> { day: "24", month: "juin" }
 * Renvoyé sous forme d'objet (et non de JSX) pour rester un fichier .js
 * pur ; c'est le composant appelant qui décide de l'affichage sur deux lignes.
 */
export function formatDayMonth(isoDate) {
  if (!isoDate) return { day: "--", month: "" };
  const d = new Date(isoDate);
  return { day: String(d.getDate()), month: MONTHS_SHORT[d.getMonth()] };
}

/** "2026-06-24" -> "24 juin 2026" */
export function formatDateLong(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** "09:00", "11:00" -> "09:00 – 11:00" */
export function formatTimeRange(start, end) {
  if (!start || !end) return "";
  return `${start} – ${end}`;
}
