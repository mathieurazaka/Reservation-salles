import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { pb } from "../../services/pocketbase";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nom: "",
    prenom: "",
    role: "enseignant",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      await pb.collection("users").create({
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        nom: form.nom,
        prenom: form.prenom,
        role: form.role, // enseignant | association
        emailVisibility: true,
      });

      // Connexion automatique après inscription
      await pb.collection("users").authWithPassword(form.email, form.password);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.data?.data?.email?.message ||
        err?.data?.message ||
        err?.message ||
        "Inscription impossible.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold">Créer un compte</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Inscription réservée aux enseignants et associations
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Nom</label>
            <input
              className="input"
              value={form.nom}
              onChange={(e) => update("nom", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Prénom</label>
            <input
              className="input"
              value={form.prenom}
              onChange={(e) => update("prenom", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Rôle</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            >
              <option value="enseignant">Enseignant</option>
              <option value="association">Association</option>
            </select>
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="input"
              value={form.passwordConfirm}
              onChange={(e) => update("passwordConfirm", e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary mt-2 w-full"
            disabled={loading}
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Déjà un compte ?{" "}
          <Link to="/login" className="font-semibold text-brand-600">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}