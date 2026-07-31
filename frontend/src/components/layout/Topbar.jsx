import NotificationsBell from "./NotificationsBell";

export default function Topbar({ title }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-[17px] font-bold">{title}</h1>
      <NotificationsBell />
    </div>
  );
}
