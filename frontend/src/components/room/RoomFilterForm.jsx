import { useState } from "react";
import Card from "../common/Card";
import Chip from "../common/Chip";
import Button from "../common/Button";

const CAPACITIES = ["Toutes", "10+", "20+", "30+", "50+", "100+"];

export default function RoomFilterForm({ onSearch, isLoading }) {
  const [capacity, setCapacity] = useState("Toutes");
  const [videoprojecteur, setVideoprojecteur] = useState(false);
  const [ordinateur, setOrdinateur] = useState(false);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("11:00");

  function handleSubmit(e) {
    e.preventDefault();

    const minCapacity = capacity === "Toutes" ? null : parseInt(capacity, 10);

    onSearch({
      minCapacity,
      videoprojecteur,
      ordinateur,
      date,
      start,
      end,
    });
  }

  return (
    <Card className="max-w-xl p-6">
      <h2 className="text-[19px] font-bold">Rechercher une salle</h2>
      <p className="mb-2 mt-0.5 text-[12.5px] text-gray-500">
        Définissez vos critères pour trouver une salle disponible
      </p>

      <form onSubmit={handleSubmit}>
        {/* Capacité */}
        <div className="mb-2.5 mt-5 flex items-center gap-1.5 text-sm font-bold">
          Capacité minimale
        </div>
        <div className="flex flex-wrap gap-2">
          {CAPACITIES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={capacity === c}
              onClick={() => setCapacity(c)}
            />
          ))}
        </div>

        {/* Équipements (uniquement ceux qui existent) */}
        <div className="mb-2.5 mt-5 flex items-center gap-1.5 text-sm font-bold">
          Équipements requis
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="Vidéoprojecteur"
            selected={videoprojecteur}
            onClick={() => setVideoprojecteur(!videoprojecteur)}
          />
          <Chip
            label="Ordinateur"
            selected={ordinateur}
            onClick={() => setOrdinateur(!ordinateur)}
          />
        </div>

        {/* Date */}
        <label className="label mt-5">Date</label>
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Heures */}
        <div className="mt-4 flex gap-3.5">
          <div className="flex-1">
            <label className="label">Heure de début</label>
            <input
              type="time"
              className="input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="label">Heure de fin</label>
            <input
              type="time"
              className="input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="btn btn-primary mt-6 w-full"
          disabled={isLoading}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          {isLoading ? "Recherche..." : "Rechercher les salles disponibles"}
        </Button>
      </form>
    </Card>
  );
}