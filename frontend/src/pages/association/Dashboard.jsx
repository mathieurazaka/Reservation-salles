// Le rôle "association" suit exactement le même parcours de réservation que
// le rôle "enseignant" (recherche, résultats, formulaire). On réexporte donc
// le tableau de bord partagé afin d'éviter la duplication de code, tout en
// conservant un fichier dédié dans pages/association comme demandé par
// l'arborescence du projet.
export { default } from "../teacher/Dashboard";
