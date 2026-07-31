export default function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${selected ? "chip-selected" : ""}`}
    >
      {label}
    </button>
  );
}
