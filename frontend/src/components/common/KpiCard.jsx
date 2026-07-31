import Card from "./Card";

const ICON_BG = {
  purple: "bg-brand-100 text-brand-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-indigo-100 text-brand-600",
};

export default function KpiCard({ icon, iconColor = "purple", value, label, trend }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ICON_BG[iconColor]}`}>
          {icon}
        </div>
        {trend ? (
          <span
            className={`badge ${
              trend.direction === "down" ? "badge-red" : "badge-green"
            }`}
          >
            {trend.label}
          </span>
        ) : null}
      </div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </Card>
  );
}
