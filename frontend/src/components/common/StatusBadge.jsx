const CONFIG = {
  confirmed: { label: "Confirmee", cls: "badge-green", icon: "✓" },
  pending: { label: "En attente", cls: "badge-amber", icon: "⏱" },
  refused: { label: "Refusee", cls: "badge-red", icon: "✕" },
  unavailable: { label: "Indisponible", cls: "badge-gray", icon: "" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.pending;
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}
