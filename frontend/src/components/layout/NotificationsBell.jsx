import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";

const STATUS_LABEL = {
  pending: "nouvelle demande en attente",
  confirmed: "réservation validée",
  refused: "réservation refusée",
};

export default function NotificationsBell() {
  const { items, count } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-gray-200"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3 text-sm font-bold">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-gray-400">Rien de nouveau.</p>
            )}
            {items.map((n) => (
              <div key={n.id} className="border-b border-gray-50 px-4 py-3 text-[13px] last:border-0">
                <b>{n.roomName}</b> — {STATUS_LABEL[n.status] || n.status}
                <div className="text-[11px] text-gray-400">{n.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
