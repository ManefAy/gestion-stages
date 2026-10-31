// candidatures.js — FAKE applications + the /score calculation

// Class Candidature (nomCandidate, email, dateCandidature, statut, /score)
// + associations: NiveauEtudes (1), Compétence (1..*), ProjetStage (1)
// emailEnvoye: has the acceptance email been sent? (from the case study)
export const CANDIDATURES = [
  {
    id: 1,
    nomCandidate: "Sirine Ben Salah",
    email: "sirine.bs@exemple.com",
    dateCandidature: "2026-10-12",
    statut: "ACCEPTEE",
    emailEnvoye: true,
    niveau: "Ingénieur",
    projetId: 1,
    competences: ["Développement mobile", "Design UI/UX", "API REST"],
  },
  {
    id: 2,
    nomCandidate: "Rania Chaabane",
    email: "rania.ch@exemple.com",
    dateCandidature: "2026-10-15",
    statut: "EN_ATTENTE",
    emailEnvoye: false,
    niveau: "Licence",
    projetId: 1,
    competences: ["Développement mobile", "Design UI/UX"],
  },
  {
    id: 3,
    nomCandidate: "Salma Hammami",
    email: "salma.h@exemple.com",
    dateCandidature: "2026-10-18",
    statut: "REFUSEE",
    emailEnvoye: false,
    niveau: "Mastère",
    projetId: 1,
    competences: ["Design UI/UX"],
  },
  {
    id: 4,
    nomCandidate: "Mohamed Ali Fakhfakh",
    email: "ma.fakhfakh@exemple.com",
    dateCandidature: "2026-10-11",
    statut: "ACCEPTEE",
    emailEnvoye: false,
    niveau: "Mastère",
    projetId: 2,
    competences: ["Python", "Oracle", "Data visualisation"],
  },
  {
    id: 5,
    nomCandidate: "Omar Bouzid",
    email: "omar.b@exemple.com",
    dateCandidature: "2026-10-20",
    statut: "EN_ATTENTE",
    emailEnvoye: false,
    niveau: "Ingénieur",
    projetId: 2,
    competences: ["Python"],
  },
  {
    id: 6,
    nomCandidate: "Wassim Elloumi",
    email: "w.elloumi@exemple.com",
    dateCandidature: "2026-10-14",
    statut: "ACCEPTEE",
    emailEnvoye: false,
    niveau: "Licence",
    projetId: 3,
    competences: ["Java", "Spring Boot"],
  },
  {
    id: 7,
    nomCandidate: "Ines Zouari",
    email: "ines.z@exemple.com",
    dateCandidature: "2026-10-22",
    statut: "EN_ATTENTE",
    emailEnvoye: false,
    niveau: "Mastère",
    projetId: 3,
    competences: ["Java", "MySQL"],
  },
  {
    id: 8,
    nomCandidate: "Aziz Sellami",
    email: "aziz.s@exemple.com",
    dateCandidature: "2026-10-25",
    statut: "EN_ATTENTE",
    emailEnvoye: false,
    niveau: "Mastère",
    projetId: 4,
    competences: ["Design UI/UX", "API REST"],
  },
];

// ---------- /score : derived attribute ----------
// PURE function: same inputs → same output, it changes nothing outside.
// Returns the score AND the details, so the RH can see WHY a candidate got it.
export function calculerScore(candidature, projet) {
  // 1) Is the candidate's level accepted by the project?
  const niveauOk = projet.niveaux.includes(candidature.niveau);

  // 2) For each required skill: does the candidate have it?
  const details = projet.competences.map((c) => ({
    libelle: c.libelle,
    poids: c.poids,
    possedee: candidature.competences.includes(c.libelle),
  }));

  // 3) Points: sum of all weights, and sum of the weights the candidate has
  //    reduce = "go through the array and accumulate a total"
  const total = details.reduce((somme, d) => somme + d.poids, 0);
  const obtenu = details.reduce(
    (somme, d) => (d.possedee ? somme + d.poids : somme),
    0,
  );

  // 4) Final score in % (0 if the level doesn't match)
  const score = niveauOk && total > 0 ? Math.round((obtenu / total) * 100) : 0;

  return { score, niveauOk, details, obtenu, total };
}
