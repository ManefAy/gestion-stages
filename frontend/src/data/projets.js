// projets.js — FAKE data that follows the teacher's class diagram

// Current session (catalogue published in January or June)
export const SESSION = {
  mois: 1,
  annee: 2027,
  dateLimite: "2026-11-30", // deadline for applications (format YYYY-MM-DD)
};

// Class NiveauEtudes
export const NIVEAUX = ["Licence", "Mastère", "Ingénieur"];

// Class Compétence (libellé)
export const COMPETENCES = [
  "Développement mobile",
  "Design UI/UX",
  "API REST",
  "Python",
  "Oracle",
  "Data visualisation",
  "Java",
  "Spring Boot",
  "MySQL",
];

// Class ProjetStage
// competences: association with Compétence + association class CompetenceProjet (poids)
// taches: composition ◆ — tasks only exist inside their project
export const PROJETS = [
  {
    id: 1,
    titre: "Développement d'une application mobile",
    dateDebut: "2027-02-01",
    dateFin: "2027-04-30",
    objectifs: [
      "Créer une application mobile conviviale.",
      "Implémenter des fonctionnalités clés (connexion sécurisée, notifications).",
      "Assurer la compatibilité iOS et Android.",
    ],
    mentor: "Ahmed Karray",
    niveaux: ["Licence", "Ingénieur"],
    competences: [
      { libelle: "Développement mobile", poids: 3 },
      { libelle: "Design UI/UX", poids: 2 },
      { libelle: "API REST", poids: 1 },
    ],
    taches: [
      { id: "t1", libelle: "Créer des maquettes" },
      { id: "t2", libelle: "Valider le design avec les parties prenantes" },
      { id: "t3", libelle: "Implémenter les écrans principaux" },
      { id: "t4", libelle: "Configurer l'API pour les données utilisateur" },
      { id: "t5", libelle: "Mettre en place les notifications" },
      { id: "t6", libelle: "Effectuer des tests unitaires" },
    ],
  },
  {
    id: 2,
    titre: "Tableau de bord analytique",
    dateDebut: "2027-02-01",
    dateFin: "2027-05-31",
    objectifs: [
      "Centraliser les indicateurs clés.",
      "Visualiser les données en temps réel.",
    ],
    mentor: "Mariem Jlassi",
    niveaux: ["Mastère", "Ingénieur"],
    competences: [
      { libelle: "Python", poids: 3 },
      { libelle: "Oracle", poids: 2 },
      { libelle: "Data visualisation", poids: 2 },
    ],
    taches: [
      { id: "t7", libelle: "Définir les indicateurs" },
      { id: "t8", libelle: "Écrire les requêtes Oracle" },
      { id: "t9", libelle: "Créer les graphiques" },
    ],
  },
  {
    id: 3,
    titre: "Plateforme de gestion des tickets",
    dateDebut: "2027-02-01",
    dateFin: "2027-04-30",
    objectifs: [
      "Gérer les demandes de support.",
      "Suivre le traitement des tickets.",
    ],
    mentor: "Youssef Ghorbel",
    niveaux: ["Licence", "Mastère"],
    competences: [
      { libelle: "Java", poids: 3 },
      { libelle: "Spring Boot", poids: 2 },
      { libelle: "MySQL", poids: 1 },
    ],
    taches: [
      { id: "t10", libelle: "Analyser les besoins" },
      { id: "t11", libelle: "Concevoir la base MySQL" },
      { id: "t12", libelle: "Développer l'API Spring Boot" },
    ],
  },
  {
    id: 4,
    titre: "Refonte du portail client",
    dateDebut: "2027-02-01",
    dateFin: "2027-05-31",
    objectifs: [
      "Moderniser l'interface du portail.",
      "Améliorer l'expérience des clients.",
    ],
    mentor: "Ahmed Karray",
    niveaux: ["Mastère", "Ingénieur"],
    competences: [
      { libelle: "Design UI/UX", poids: 3 },
      { libelle: "API REST", poids: 2 },
    ],
    taches: [
      { id: "t13", libelle: "Auditer l'interface actuelle" },
      { id: "t14", libelle: "Proposer de nouvelles maquettes" },
    ],
  },
];

// ---------- Helper functions ----------

// Number of months between two dates, e.g. Feb 1 → Apr 30 = 3 months
export function dureeEnMois(dateDebut, dateFin) {
  const d = new Date(dateDebut);
  const f = new Date(dateFin);
  return (
    (f.getFullYear() - d.getFullYear()) * 12 + (f.getMonth() - d.getMonth()) + 1
  );
}

// '2026-11-30' → '30 novembre 2026'
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Is the session still open? (method estOuverte() of Session)
export function sessionOuverte() {
  const aujourdhui = new Date().toISOString().slice(0, 10); // today as 'YYYY-MM-DD'
  return aujourdhui <= SESSION.dateLimite; // strings in this format compare correctly
}
