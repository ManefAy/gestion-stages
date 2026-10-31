// comptes.js — FAKE accounts, only for testing the interface
// ⚠️ In the real project, passwords are checked by the backend
//    (and stored hashed in the database), never written in the frontend.

// Each Compte belongs to ONE holder: an AgentRH or a Mentor ({XOR, totalité})
// The admin account is outside the class diagram: it's the system manager.
export const COMPTES = [
  {
    id: 1,
    login: "admin",
    mdp: "admin123",
    role: "admin",
    nom: "Administrateur",
    actif: true,
  },
  {
    id: 2,
    login: "a.trabelsi",
    mdp: "rh123",
    role: "rh",
    nom: "Amira Trabelsi",
    actif: true,
  },
  {
    id: 3,
    login: "n.belhaj",
    mdp: "rh456",
    role: "rh",
    nom: "Nour Belhaj",
    actif: false,
  },
  {
    id: 4,
    login: "a.karray",
    mdp: "mentor123",
    role: "mentor",
    nom: "Ahmed Karray",
    specialite: "Développement mobile",
    actif: true,
  },
  {
    id: 5,
    login: "m.jlassi",
    mdp: "mentor456",
    role: "mentor",
    nom: "Mariem Jlassi",
    specialite: "Data & BI",
    actif: true,
  },
  {
    id: 6,
    login: "y.ghorbel",
    mdp: "mentor789",
    role: "mentor",
    nom: "Youssef Ghorbel",
    specialite: "Back-end Java",
    actif: true,
  },
];

// Where each role goes after login (its first use case)
export const HOME_BY_ROLE = {
  admin: "/admin/comptes",
  rh: "/rh/stagiaires",
  mentor: "/mentor/projets",
};

// Role → French label
export const ROLE_LABELS = {
  admin: "Administrateur",
  rh: "Agent RH",
  mentor: "Mentor",
};

// 'Amira Trabelsi' → 'AT' (for the avatars)
export function initiales(nom) {
  return nom
    .split(" ")
    .map((mot) => mot[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
