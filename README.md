# UniSalle — Gestion de réservation de salles

Application web (Vite + React + Tailwind CSS) connectée à un backend
**PocketBase** via son SDK JavaScript natif.

## Stack

- **Vite** — bundler / serveur de dev
- **React 18** — UI
- **Tailwind CSS** — styles utilitaires (palette indigo/violet reprenant le
  design des maquettes UniSalle)
- **React Router** — navigation entre écrans
- **PocketBase JS SDK** — auth, base de données, temps réel

## Démarrage

```bash
npm install
cp .env.example .env      # renseignez VITE_POCKETBASE_URL
npm run dev
```

L'application attend une instance PocketBase (locale ou distante). Sans
backend connecté, l'écran de connexion et les listes resteront vides mais
l'interface reste consultable.

## Collections PocketBase attendues

Créez ces collections dans l'admin PocketBase (`pocketbase serve`, puis
`http://127.0.0.1:8090/_/`) :

### `users` (collection auth native)
| champ      | type    |
|------------|---------|
| name       | text    |
| role       | select  → `teacher`, `association`, `logistics`, `admin` |
| department | text    |

### `rooms`
| champ       | type          |
|-------------|---------------|
| name        | text          |
| building    | text          |
| floor       | text          |
| capacity    | number        |
| equipments  | json (array de chaînes) |

### `reservations`
| champ   | type                                   |
|---------|----------------------------------------|
| room    | relation → rooms                       |
| user    | relation → users                       |
| date    | date                                   |
| start   | text (`"09:00"`)                       |
| end     | text (`"11:00"`)                       |
| reason  | text                                   |
| status  | select → `pending`, `confirmed`, `refused` |

## Où le SDK PocketBase est utilisé

- `src/services/pocketbase.js` — client unique (`pb`)
- `src/contexts/AuthContext.jsx` — `pb.collection('users').authWithPassword()`
- `src/pages/auth/Login.jsx` — **interception native du `<form onSubmit>`**
  (`event.preventDefault()`) puis appel du contexte d'auth
- `src/hooks/useRooms.js` — recherche de salles + disponibilité
- `src/hooks/useReservations.js` — création / liste / validation des
  réservations
- `src/pages/admin/AdminDashboard.jsx` — statistiques + export CSV/Excel

## Arborescence

```
src
├── App.jsx                  # Router + Provider racine
├── assets                   # images, icônes statiques
├── components
│   ├── common                # Button, Card, Chip, KpiCard, StatusBadge
│   ├── layout                 # Sidebar, Topbar
│   └── room                   # RoomCard, RoomFilterForm
├── contexts
│   └── AuthContext.jsx
├── hooks
│   ├── useAuth.js
│   ├── useRooms.js
│   └── useReservations.js
├── index.css                 # Tailwind + classes composants
├── layouts
│   ├── AuthLayout.jsx
│   └── DashboardLayout.jsx
├── main.jsx
├── pages
│   ├── admin/AdminDashboard.jsx
│   ├── association/Dashboard.jsx
│   ├── auth/Login.jsx
│   ├── logistics/Validation.jsx
│   └── teacher/
│       ├── Dashboard.jsx
│       ├── RoomSearch.jsx
│       ├── RoomResults.jsx
│       └── ReservationForm.jsx
├── routes
│   └── AppRouter.jsx
├── services
│   └── pocketbase.js
└── utils
    └── date.js
```
