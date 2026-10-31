// conventions.js — FAKE data + numbering logic for ConventionStage
import { SESSION } from "./projets";

// Fixed information printed on every convention (Annexe 2)
export const ENTREPRISE = {
  nom: "DevTec",
  adresse: "123 Rue de l'Innovation, 3000 Sfax",
};
export const CONDITIONS = {
  horaires: "Du lundi au vendredi, de 9h à 17h",
  lieu: "Locaux de DevTec, Sfax",
};

// Class ConventionStage (numero, dateCreation)
// candidatureId: association Candidature 1 — 0..1 ConventionStage
// signatures: who has signed (on the first day of the internship)
export const CONVENTIONS = [
  {
    id: 1,
    numero: "01-1-2027",
    dateCreation: "2026-10-30",
    candidatureId: 1,
    signatures: { directeur: true, mentor: true, stagiaire: false },
  },
];

// Next number for the CURRENT session, e.g. '02-1-2027'
// Format required by the case study: sequential number - month - year
export function prochainNumero(conventions) {
  const suffixe = `-${SESSION.mois}-${SESSION.annee}`; // '-1-2027'

  // 1) Keep only this session's numbers and take their first part: '01-1-2027' → 1
  const numeros = conventions
    .filter((c) => c.numero.endsWith(suffixe))
    .map((c) => Number(c.numero.split("-")[0]));

  // 2) The biggest one (0 if this session has no convention yet)
  const max = numeros.length > 0 ? Math.max(...numeros) : 0;

  // 3) +1, written on 2 digits: 2 → '02'
  return String(max + 1).padStart(2, "0") + suffixe;
}

// Signature labels, in the order they appear on the document
export const SIGNATAIRES = [
  { cle: "directeur", label: "Directeur général" },
  { cle: "mentor", label: "Mentor" },
  { cle: "stagiaire", label: "Stagiaire" },
];

// { directeur: true, mentor: false, ... } → number of signatures + badge text/color
export function etatSignatures(signatures) {
  const n = Object.values(signatures).filter((v) => v === true).length;
  if (n === 3) return { n, texte: "Signée (3/3)", tone: "success" };
  if (n === 0) return { n, texte: "À signer", tone: "danger" };
  return { n, texte: `En cours (${n}/3)`, tone: "warning" };
}
