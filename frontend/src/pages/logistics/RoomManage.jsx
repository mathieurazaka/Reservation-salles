import { useEffect, useState } from "react";
import Topbar from "../../components/layout/Topbar";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { pb, COLLECTIONS, ROOM_FIELDS } from "../../services/pocketbase";

export default function RoomManage() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    capacite: "",
    videoprojecteur: false,
    ordinateur: false,
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const list = await pb.collection(COLLECTIONS.ROOMS).getFullList({
      sort: ROOM_FIELDS.name,
    });
    setRooms(list);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        [ROOM_FIELDS.name]: form.nom,
        [ROOM_FIELDS.capacity]: Number(form.capacite),
        [ROOM_FIELDS.videoprojecteur]: form.videoprojecteur,
        [ROOM_FIELDS.ordinateur]: form.ordinateur,
        [ROOM_FIELDS.description]: form.description,
      };

      if (editingId) {
        await pb.collection(COLLECTIONS.ROOMS).update(editingId, data);
      } else {
        await pb.collection(COLLECTIONS.ROOMS).create(data);
      }

      setForm({
        nom: "",
        capacite: "",
        videoprojecteur: false,
        ordinateur: false,
        description: "",
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(room) {
    setEditingId(room.id);
    setForm({
      nom: room[ROOM_FIELDS.name] || "",
      capacite: room[ROOM_FIELDS.capacity] || "",
      videoprojecteur: !!room[ROOM_FIELDS.videoprojecteur],
      ordinateur: !!room[ROOM_FIELDS.ordinateur],
      description: room[ROOM_FIELDS.description] || "",
    });
  }

  return (
    <>
      <Topbar title="Gestion des salles" />
      <div className="p-6">
        <h2 className="mb-4 text-[19px] font-bold">
          {editingId ? "Modifier une salle" : "Ajouter une salle"}
        </h2>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <Card className="mb-6 max-w-xl p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Nom</label>
              <input
                className="input"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Capacité</label>
              <input
                type="number"
                className="input"
                value={form.capacite}
                onChange={(e) => setForm({ ...form, capacite: e.target.value })}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.videoprojecteur}
                onChange={(e) =>
                  setForm({ ...form, videoprojecteur: e.target.checked })
                }
              />
              Vidéoprojecteur
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ordinateur}
                onChange={(e) =>
                  setForm({ ...form, ordinateur: e.target.checked })
                }
              />
              Ordinateur
            </label>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="btn btn-primary" disabled={loading}>
                {editingId ? "Enregistrer" : "Ajouter"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      nom: "",
                      capacite: "",
                      videoprojecteur: false,
                      ordinateur: false,
                      description: "",
                    });
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </Card>

        <h3 className="mb-3 text-[15px] font-bold">Salles existantes</h3>
        <div className="space-y-2">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <div className="font-bold">{room[ROOM_FIELDS.name]}</div>
                <div className="text-sm text-gray-500">
                  {room[ROOM_FIELDS.capacity]} places
                  {room[ROOM_FIELDS.videoprojecteur] ? " · Vidéoprojecteur" : ""}
                  {room[ROOM_FIELDS.ordinateur] ? " · Ordinateur" : ""}
                </div>
              </div>
              <Button
                className="btn btn-outline"
                onClick={() => startEdit(room)}
              >
                Modifier
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}