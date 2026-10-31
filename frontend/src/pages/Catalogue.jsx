// Catalogue.jsx — use case "soumettre candidature" (actor: Candidat)
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Code2, Search, Send, CheckCircle2 } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import Field from "../components/Field";
import Button from "../components/Button";
import {
  PROJETS,
  NIVEAUX,
  COMPETENCES,
  SESSION,
  formatDate,
  sessionOuverte,
} from "../data/projets";
import "../components/ui.css";
import "./catalogue.css";

export default function Catalogue() {
  // ---------- 1) STATE ----------
  // Filters of the catalogue
  const [niveauFiltre, setNiveauFiltre] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  // The chosen project (we store its id, not the whole object)
  const [selectedId, setSelectedId] = useState(null);

  // Fields of the Candidature (class diagram)
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [niveau, setNiveau] = useState("");
  const [competences, setCompetences] = useState([]); // array of skill labels

  const [errors, setErrors] = useState({});
  const [envoye, setEnvoye] = useState(false); // true after a successful submit

  // useRef = a "pointer" to a real HTML element, here the form zone
  const formRef = useRef(null);

  // ---------- 2) DERIVED DATA (computed at each render, never stored) ----------
  const q = recherche.trim().toLowerCase();

  const projetsFiltres = PROJETS.filter((p) => {
    // Keep the project if it matches the level filter...
    const okNiveau =
      niveauFiltre === "Tous" || p.niveaux.includes(niveauFiltre);
    // ...AND the search text (in the title or in one of its skills)
    const okRecherche =
      q === "" ||
      p.titre.toLowerCase().includes(q) ||
      p.competences.some((c) => c.libelle.toLowerCase().includes(q));
    return okNiveau && okRecherche;
  });

  // The selected project object (or undefined if none)
  const projetChoisi = PROJETS.find((p) => p.id === selectedId);

  const ouverte = sessionOuverte();

  // ---------- 3) EVENT HANDLERS ----------

  function choisirProjet(id) {
    setSelectedId(id);
    setEnvoye(false);
    // Scroll to the form. If the user prefers less motion, jump instantly.
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  // Add the skill if absent, remove it if present
  function toggleCompetence(libelle) {
    setCompetences(
      (prev) =>
        prev.includes(libelle)
          ? prev.filter((c) => c !== libelle) // remove
          : [...prev, libelle], // add (new array, never .push on state!)
    );
  }

  function validate() {
    const e = {};
    if (!projetChoisi) e.projet = "Choisissez un projet dans le catalogue.";
    if (nom.trim() === "") e.nom = "Le nom est obligatoire.";
    // Simple email check: something@something.something
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Entrez un email valide.";
    if (niveau === "") {
      e.niveau = "Choisissez votre niveau d'études.";
    } else if (projetChoisi && !projetChoisi.niveaux.includes(niveau)) {
      e.niveau = `Ce projet est ouvert aux niveaux : ${projetChoisi.niveaux.join(", ")}.`;
    }
    // Multiplicity 1..* in the class diagram → at least one skill
    if (competences.length === 0)
      e.competences = "Cochez au moins une compétence.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    // The object we would send to the backend = one "Candidature"
    const candidature = {
      nomCandidate: nom.trim(),
      email: email.trim(),
      dateCandidature: new Date().toISOString().slice(0, 10),
      statut: "EN_ATTENTE", // StatutCandidature: always "en attente" at the start
      niveau, // association → NiveauEtudes
      competences, // association → Compétence (1..*)
      projetId: projetChoisi.id, // association → ProjetStage
      // no "score": it's derived (/score), calculated by the system later
    };
    console.log("Candidature envoyée :", candidature); // open the console (F12) to see it

    setEnvoye(true);
    // Empty the form for a possible next application
    setNom("");
    setEmail("");
    setNiveau("");
    setCompetences([]);
    setErrors({});
  }

  // ---------- 4) DISPLAY ----------
  return (
    <div>
      {/* Top bar */}
      <header className="public-header">
        <div className="public-header-inner">
          <div className="sidebar-brand">
            <span className="sidebar-logo">
              <Code2 size={20} aria-hidden="true" />
            </span>
            DevTec · Stages
          </div>
          <Link to="/login" className="btn btn-secondary">
            Espace employés
          </Link>
        </div>
      </header>

      {/* Hero with the deadline */}
      <section className="catalogue-hero">
        <div className="catalogue-container">
          <div>
            <p className="login-eyebrow">
              Session {SESSION.mois === 1 ? "janvier" : "juin"} {SESSION.annee}
            </p>
            <h1>Catalogue des stages DevTec</h1>
            <p>
              Choisissez un projet adapté à votre niveau d'études et à vos
              compétences, puis déposez votre candidature avant la date limite.
            </p>
          </div>
          <div className="deadline-box">
            <span>Date limite de candidature</span>
            <strong>{formatDate(SESSION.dateLimite)}</strong>
          </div>
        </div>
      </section>

      <main className="catalogue-container content">
        {/* ===== CATALOGUE ===== */}
        <section aria-labelledby="titre-projets">
          <div className="section-head">
            <h2 id="titre-projets">
              Projets proposés ({projetsFiltres.length})
            </h2>

            <div className="filters">
              <label htmlFor="filtre-niveau" className="sr-only">
                Filtrer par niveau
              </label>
              <select
                id="filtre-niveau"
                className="input"
                value={niveauFiltre}
                onChange={(e) => setNiveauFiltre(e.target.value)}
              >
                <option value="Tous">Tous les niveaux</option>
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <label htmlFor="filtre-recherche" className="sr-only">
                Rechercher
              </label>
              <input
                id="filtre-recherche"
                className="input"
                type="search"
                placeholder="Titre ou compétence…"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>

          {/* Conditional display: grid if results, message otherwise */}
          {projetsFiltres.length > 0 ? (
            <div className="project-grid">
              {projetsFiltres.map((p) => (
                <ProjectCard
                  key={p.id} // React needs a unique key per item
                  projet={p}
                  selected={p.id === selectedId}
                  onSelect={() => choisirProjet(p.id)} // the card calls this when clicked
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={24} aria-hidden="true" />
              <p>Aucun projet ne correspond à votre recherche.</p>
            </div>
          )}
        </section>

        {/* ===== APPLICATION FORM ===== */}
        <section
          className="apply-zone"
          ref={formRef}
          aria-labelledby="titre-form"
        >
          {!ouverte ? (
            // Session closed → no form (method estOuverte() returned false)
            <div className="card apply-form">
              <h2 id="titre-form">Candidatures closes</h2>
              <p>
                La date limite du {formatDate(SESSION.dateLimite)} est dépassée.
              </p>
            </div>
          ) : envoye ? (
            // Success message (role="status" → announced by screen readers)
            <div className="success-box apply-form" role="status">
              <CheckCircle2 size={32} aria-hidden="true" />
              <h2 id="titre-form">Candidature envoyée</h2>
              <p>
                Vous recevrez un email après la date limite si votre candidature
                est retenue.
              </p>
              <Button variant="secondary" onClick={() => setEnvoye(false)}>
                Déposer une autre candidature
              </Button>
            </div>
          ) : (
            <form
              className="card apply-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div>
                <h2 id="titre-form">Soumettre ma candidature</h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Projet choisi :{" "}
                  <strong style={{ color: "var(--color-foreground)" }}>
                    {projetChoisi ? projetChoisi.titre : "aucun"}
                  </strong>
                </p>
                {errors.projet && (
                  <p className="field-error" role="alert">
                    {errors.projet}
                  </p>
                )}
              </div>

              <div className="form-grid">
                <Field label="Nom et prénom" id="nom" error={errors.nom}>
                  <input
                    id="nom"
                    className="input"
                    type="text"
                    autoComplete="name"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    aria-invalid={errors.nom ? "true" : "false"}
                  />
                </Field>
                <Field label="Email" id="email" error={errors.email}>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </Field>
              </div>

              {/* Radio group: only ONE level can be chosen (same "name") */}
              <fieldset className="group">
                <legend>Niveau d'études</legend>
                <div className="choices">
                  {NIVEAUX.map((n) => (
                    <label key={n} className="choice">
                      <input
                        type="radio"
                        name="niveau"
                        value={n}
                        checked={niveau === n}
                        onChange={() => setNiveau(n)}
                      />
                      {n}
                    </label>
                  ))}
                </div>
                {errors.niveau && (
                  <span className="field-error" role="alert">
                    {errors.niveau}
                  </span>
                )}
              </fieldset>

              {/* Checkbox group: SEVERAL skills can be chosen */}
              <fieldset className="group">
                <legend>Mes compétences</legend>
                <span className="field-hint">
                  Elles servent au tri automatique des candidatures.
                </span>
                <div className="choices">
                  {COMPETENCES.map((c) => (
                    <label key={c} className="choice">
                      <input
                        type="checkbox"
                        checked={competences.includes(c)}
                        onChange={() => toggleCompetence(c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
                {errors.competences && (
                  <span className="field-error" role="alert">
                    {errors.competences}
                  </span>
                )}
              </fieldset>

              <div className="form-actions">
                <Button type="submit" icon={Send}>
                  Envoyer ma candidature
                </Button>
              </div>
            </form>
          )}

          {/* Side panel: explains the process from the case study */}
          <aside className="card side-panel">
            <h3>Comment ça marche ?</h3>
            <ol>
              <li>
                Vous déposez votre candidature avant le{" "}
                {formatDate(SESSION.dateLimite)}.
              </li>
              <li>
                Les candidatures sont triées selon le niveau d'études et les
                compétences requises.
              </li>
              <li>Les candidats retenus reçoivent un email d'acceptation.</li>
              <li>
                La convention de stage est signée le premier jour du stage.
              </li>
            </ol>
          </aside>
        </section>
      </main>
    </div>
  );
}
