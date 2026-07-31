import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { pb, COLLECTIONS, RESERVATION_FIELDS, RESERVATION_STATUS } from "../../services/pocketbase";

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [stats, setStats] = useState({ rooms: null, reservationsThisMonth: null, confirmedRate: null });
  const [infoMessage, setInfoMessage] = useState(null);

  /**
   * Mini-statistiques du panneau gauche, calculées depuis PocketBase.
   * Nécessite que les règles "List/Search" des collections `salles` et
   * `reservations` autorisent la lecture publique (règle vide `""`), sinon
   * l'appel échoue silencieusement ici et les valeurs par défaut restent
   * affichées — ce qui est volontaire pour ne jamais bloquer l'écran de
   * connexion.
   */
  useEffect(() => {
    (async () => {
      try {
        const rooms = await pb.collection(COLLECTIONS.ROOMS).getList(1, 1);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .slice(0, 10);
        const reservations = await pb.collection(COLLECTIONS.RESERVATIONS).getFullList({
          filter: `${RESERVATION_FIELDS.start} >= "${monthStart}"`,
        });
        const confirmed = reservations.filter(
          (r) => r[RESERVATION_FIELDS.status] === RESERVATION_STATUS.CONFIRMED
        ).length;
        const rate = reservations.length ? Math.round((confirmed / reservations.length) * 100) : null;
        setStats({
          rooms: rooms.totalItems,
          reservationsThisMonth: reservations.length,
          confirmedRate: rate,
        });
      } catch {
        // Lecture publique non autorisée ou backend injoignable : on garde
        // les valeurs par défaut ci-dessous, sans bloquer la connexion.
      }
    })();
  }, []);

  /**
   * Interception native de la soumission du formulaire :
   * - preventDefault() empêche le rechargement de page par défaut du navigateur
   * - les identifiants sont envoyés à PocketBase via pb.collection('users').authWithPassword()
   *   (appelé dans useAuth().login)
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError(null);
    try {
      const user = await login(email, password);
      const redirectTo = location.state?.from || "/app/dashboard";
      navigate(user?.role === "admin" ? "/app/admin" : redirectTo, { replace: true });
    } catch (err) {
      setLocalError(err?.message || "Connexion impossible. Vérifiez vos identifiants.");
    }
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    setLocalError(null);
    setInfoMessage("Pour réinitialiser votre mot de passe, contactez la DSI.");
  }

  function handleContactDSI(e) {
    e.preventDefault();
    setInfoMessage("Contactez la DSI à l'adresse : dsi@universite.mg");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Panneau gauche */}
      <div
        className="flex flex-1 flex-col justify-between p-8 text-white md:p-12"
        style={{
          background: "radial-gradient(circle at 30% 20%, #6d5be0, #241a5c 70%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="3" width="16" height="18" rx="2" />
            </svg>
          </div>
          <span className="text-base font-bold">UniSalle</span>
        </div>

        <div className="my-10">
          <h1 className="text-3xl font-extrabold leading-tight md:text-[30px]">
            Réservez vos salles
            <br />
            en quelques clics
          </h1>
          <p className="mt-3.5 max-w-sm text-[13.5px] leading-relaxed text-indigo-100">
            Gérez facilement vos réservations d'espaces pédagogiques, amphithéâtres et
            salles de réunion.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[130px] rounded-lg bg-white/10 px-4.5 px-[18px] py-3.5">
              <b className="block text-[22px] font-extrabold">
                {stats.rooms ?? "—"}
              </b>
              <span className="text-[11.5px] text-indigo-200">Salles disponibles</span>
            </div>
            <div className="min-w-[130px] rounded-lg bg-white/10 px-4.5 px-[18px] py-3.5">
              <b className="block text-[22px] font-extrabold">
                {stats.reservationsThisMonth ?? "—"}
              </b>
              <span className="text-[11.5px] text-indigo-200">Réservations / mois</span>
            </div>
            <div className="min-w-[130px] rounded-lg bg-white/10 px-4.5 px-[18px] py-3.5">
              <b className="block text-[22px] font-extrabold">
                {stats.confirmedRate !== null ? `${stats.confirmedRate}%` : "—"}
              </b>
              <span className="text-[11.5px] text-indigo-200">Taux de confirmation</span>
            </div>
          </div>
          <p className="mt-6 text-[11px] text-indigo-300">© 2026 Université — Tous droits réservés</p>
        </div>
      </div>

      {/* Panneau droit : formulaire */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8 md:p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-[21px] font-extrabold">Connexion</h2>
          <p className="mb-5.5 mb-6 mt-1 text-[12.5px] text-gray-500">
            Accédez à votre espace de réservation
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="label">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              className="input mb-4"
              placeholder="prenom.nom@etablissement.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="label mb-0">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Mot de passe oublié ?
              </button>

              {/* Message d'info */}
              {infoMessage && (
                <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {infoMessage}
                </p>
              )}
            </div>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {(localError || error) && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                {localError || error}
              </p>
            )}

            <button type="submit" className="btn btn-primary mt-5 w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-brand-600 hover:underline"
            >
              S&apos;inscrire
            </button>
          </p>
          
          <p className="mt-5 text-center text-xs text-gray-500">
            Problème de connexion ? Contactez la{" "}
            <button
              type="button"
              onClick={handleContactDSI}
              className="font-semibold text-brand-600 hover:underline"
            >
              DSI
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
