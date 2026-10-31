// MentorProjets.jsx — use case "gérer projets" (actor: Mentor)
import { useState } from "react";
import { Plus, Save, Trash2, X, FolderKanban } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Field from "../components/Field";
import ConfirmDialog from "../components/ConfirmDialog";
import { PROJETS, NIVEAUX, COMPETENCES, dureeEnMois } from "../data/projets";
import { useAuth } from "../hooks/useAuth";

const FORM_VIDE = {
  titre: "",
  dateDebut: "",
  dateFin: "",
  objectifs: "", // textarea: one objective per line
  niveaux: [],
  competences: [], // [{ libelle, poids }]
  taches: [], // [{ id, libelle }]
};

// Converts a project (data format) → form format (objectifs: array → text)
function projetVersForm(p) {
  return {
    titre: p.titre,
    dateDebut: p.dateDebut,
    dateFin: p.dateFin,
    objectifs: p.objectifs.join("\n"), // one line per objective
    niveaux: p.niveaux,
    competences: p.competences,
    taches: p.taches,
  };
}

export default function MentorProjets() {
  // The logged-in mentor (his name links him to his projects: Mentor 1 — 0..* ProjetStage)
  const { user } = useAuth();
  const MENTOR_CONNECTE = user.nom;
  // ---------- 1) STATE ----------
  // Mentor 1 — 0..* ProjetStage: only HIS projects
  const [projets, setProjets] = useState(() =>
    PROJETS.filter((p) => p.mentor === MENTOR_CONNECTE),
  );

  const [formOuvert, setFormOuvert] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [aSupprimer, setASupprimer] = useState(null);

  // Small "temporary" inputs used to ADD items to the lists
  const [nouvelleComp, setNouvelleComp] = useState("");
  const [nouvelleTache, setNouvelleTache] = useState("");

  // ---------- 2) DERIVED DATA ----------
  const enModification = editingId !== null;

  // ★ Skills NOT yet in the project → the only ones we can still add (no duplicates)
  const competencesDisponibles = COMPETENCES.filter(
    (c) => !form.competences.some((fc) => fc.libelle === c),
  );

  // Duration shown only when both dates are valid
  const datesValides =
    form.dateDebut && form.dateFin && form.dateFin > form.dateDebut;
  const duree = datesValides ? dureeEnMois(form.dateDebut, form.dateFin) : null;

  // ---------- 3) HANDLERS ----------

  // Same generic handler as Step 5 (titre, dates, objectifs)
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function ouvrirCreation() {
    setEditingId(null);
    setForm(FORM_VIDE);
    setErrors({});
    setMessage("");
    setFormOuvert(true);
  }

  function ouvrirModification(p) {
    setEditingId(p.id);
    setForm(projetVersForm(p));
    setErrors({});
    setMessage("");
    setFormOuvert(true);
  }

  // --- Niveaux (checkboxes) ---
  function toggleNiveau(n) {
    const niveaux = form.niveaux.includes(n)
      ? form.niveaux.filter((x) => x !== n)
      : [...form.niveaux, n];
    setForm({ ...form, niveaux });
  }

  // --- Compétences + poids (association class CompetenceProjet) ---
  function ajouterCompetence() {
    if (nouvelleComp === "") return;
    setForm({
      ...form,
      competences: [...form.competences, { libelle: nouvelleComp, poids: 1 }],
    });
    setNouvelleComp(""); // reset the select
  }

  // ★ NESTED immutable update: copy at EVERY level we change
  //   new form → new competences array → new object for the changed skill
  function changerPoids(libelle, poids) {
    setForm({
      ...form,
      competences: form.competences.map(
        (c) => (c.libelle === libelle ? { ...c, poids: Number(poids) } : c), // select gives a string → Number()
      ),
    });
  }

  function retirerCompetence(libelle) {
    setForm({
      ...form,
      competences: form.competences.filter((c) => c.libelle !== libelle),
    });
  }

  // --- Tâches (composition) ---
  function ajouterTache() {
    const libelle = nouvelleTache.trim();
    if (libelle === "") return;
    setForm({
      ...form,
      taches: [...form.taches, { id: `t${Date.now()}`, libelle }],
    });
    setNouvelleTache("");
  }

  function retirerTache(id) {
    setForm({ ...form, taches: form.taches.filter((t) => t.id !== id) });
  }

  function validate() {
    const e = {};
    if (form.titre.trim() === "") e.titre = "Le titre est obligatoire.";
    if (form.dateDebut === "")
      e.dateDebut = "La date de début est obligatoire.";
    if (form.dateFin === "") e.dateFin = "La date de fin est obligatoire.";
    // 'YYYY-MM-DD' strings can be compared directly
    else if (form.dateDebut && form.dateFin <= form.dateDebut) {
      e.dateFin = "La date de fin doit être après la date de début.";
    }
    if (form.objectifs.trim() === "")
      e.objectifs = "Ajoutez au moins un objectif.";
    // Multiplicity 1..* towards NiveauEtudes
    if (form.niveaux.length === 0) e.niveaux = "Choisissez au moins un niveau.";
    // Business choice: without skills, the automatic sorting can't compute a score
    if (form.competences.length === 0)
      e.competences = "Ajoutez au moins une compétence requise.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    // Form format → data format (objectifs: text → array, empty lines removed)
    const donnees = {
      titre: form.titre.trim(),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      objectifs: form.objectifs
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== ""),
      niveaux: form.niveaux,
      competences: form.competences,
      taches: form.taches,
      mentor: MENTOR_CONNECTE,
    };

    if (!enModification) {
      const nouveau = { id: Date.now(), ...donnees };
      setProjets([...projets, nouveau]);
      setEditingId(nouveau.id); // the form stays open, now in "edit" mode
      setMessage("Projet créé.");
    } else {
      setProjets(
        projets.map((p) => (p.id === editingId ? { ...p, ...donnees } : p)),
      );
      setMessage("Projet enregistré.");
    }
  }

  function confirmerSuppression() {
    // Composition ◆: deleting the project removes its tasks too (they live inside it)
    setProjets(projets.filter((p) => p.id !== aSupprimer.id));
    if (editingId === aSupprimer.id) {
      setFormOuvert(false);
      setEditingId(null);
    }
    setMessage(`Projet « ${aSupprimer.titre} » supprimé.`);
    setASupprimer(null);
  }

  // The project object being edited (for the delete button)
  const projetEdite = projets.find((p) => p.id === editingId);

  // ---------- 4) DISPLAY ----------
  return (
    <>
      <PageHeader
        title="Mes projets de stage"
        subtitle="Définissez les objectifs, les compétences requises et les tâches de chaque projet."
        actions={
          <Button icon={Plus} onClick={ouvrirCreation}>
            Nouveau projet
          </Button>
        }
      />

      {message && (
        <div className="alert-success" role="status">
          {message}
          <button
            type="button"
            className="icon-btn"
            aria-label="Fermer le message"
            onClick={() => setMessage("")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="split">
        {/* ===== LEFT: the mentor's projects ===== */}
        <nav className="select-list split-side" aria-label="Mes projets">
          {projets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`select-item ${p.id === editingId && formOuvert ? "is-selected" : ""}`}
              onClick={() => ouvrirModification(p)}
              aria-current={
                p.id === editingId && formOuvert ? "true" : undefined
              }
            >
              <strong>{p.titre}</strong>
              <span>
                {dureeEnMois(p.dateDebut, p.dateFin)} mois · {p.taches.length}{" "}
                tâche(s) · {p.competences.length} compétence(s)
              </span>
            </button>
          ))}
          {projets.length === 0 && (
            <p className="text-muted">Aucun projet pour le moment.</p>
          )}
        </nav>

        {/* ===== RIGHT: editor, or empty state ===== */}
        {!formOuvert ? (
          <div className="card split-main empty-panel">
            <FolderKanban size={40} aria-hidden="true" />
            <p>Sélectionnez un projet à gauche ou créez-en un nouveau.</p>
            <Button icon={Plus} onClick={ouvrirCreation}>
              Nouveau projet
            </Button>
          </div>
        ) : (
          <form
            className="card panel split-main"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="panel-head">
              <h2>
                {enModification ? "Modifier le projet" : "Nouveau projet"}
              </h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Fermer l'éditeur"
                onClick={() => setFormOuvert(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* --- Section 1: general information --- */}
            <Field label="Titre du projet" id="p-titre" error={errors.titre}>
              <input
                id="p-titre"
                name="titre"
                className="input"
                value={form.titre}
                onChange={handleChange}
                aria-invalid={errors.titre ? "true" : "false"}
              />
            </Field>

            <div className="form-grid">
              <Field
                label="Date de début"
                id="p-debut"
                error={errors.dateDebut}
              >
                <input
                  id="p-debut"
                  name="dateDebut"
                  type="date"
                  className="input"
                  value={form.dateDebut}
                  onChange={handleChange}
                  aria-invalid={errors.dateDebut ? "true" : "false"}
                />
              </Field>
              <Field
                label="Date de fin"
                id="p-fin"
                error={errors.dateFin}
                hint={duree ? `Durée : ${duree} mois` : undefined}
              >
                <input
                  id="p-fin"
                  name="dateFin"
                  type="date"
                  className="input"
                  value={form.dateFin}
                  onChange={handleChange}
                  aria-invalid={errors.dateFin ? "true" : "false"}
                />
              </Field>
            </div>

            <Field
              label="Objectifs"
              id="p-obj"
              error={errors.objectifs}
              hint="Un objectif par ligne."
            >
              <textarea
                id="p-obj"
                name="objectifs"
                rows={4}
                className="input"
                value={form.objectifs}
                onChange={handleChange}
                aria-invalid={errors.objectifs ? "true" : "false"}
              />
            </Field>

            {/* --- Section 2: levels --- */}
            <fieldset className="group form-section">
              <legend>
                <h3>Niveaux d'études souhaités</h3>
              </legend>
              <div className="choices">
                {NIVEAUX.map((n) => (
                  <label key={n} className="choice">
                    <input
                      type="checkbox"
                      checked={form.niveaux.includes(n)}
                      onChange={() => toggleNiveau(n)}
                    />
                    {n}
                  </label>
                ))}
              </div>
              {errors.niveaux && (
                <span className="field-error" role="alert">
                  {errors.niveaux}
                </span>
              )}
            </fieldset>

            {/* --- Section 3: skills + weight --- */}
            <section className="form-section" aria-labelledby="titre-comp">
              <div className="form-section-head">
                <h3 id="titre-comp">Compétences requises</h3>
                <span className="field-hint">
                  Le poids (1 à 5) sert au calcul du score des candidatures.
                </span>
              </div>

              {form.competences.length > 0 && (
                <div className="table-card table-scroll">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Compétence</th>
                        <th scope="col">Poids</th>
                        <th scope="col">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.competences.map((c) => (
                        <tr key={c.libelle}>
                          <td>{c.libelle}</td>
                          <td>
                            <label
                              htmlFor={`poids-${c.libelle}`}
                              className="sr-only"
                            >
                              Poids de {c.libelle}
                            </label>
                            <select
                              id={`poids-${c.libelle}`}
                              className="input"
                              value={c.poids}
                              onChange={(e) =>
                                changerPoids(c.libelle, e.target.value)
                              }
                            >
                              {[1, 2, 3, 4, 5].map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div className="cell-actions">
                              <Button
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                                aria-label={`Retirer ${c.libelle}`}
                                onClick={() => retirerCompetence(c.libelle)}
                              >
                                Retirer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add a skill: the select only contains skills not already added */}
              {competencesDisponibles.length > 0 && (
                <div className="inline-add">
                  <label htmlFor="add-comp" className="sr-only">
                    Compétence à ajouter
                  </label>
                  <select
                    id="add-comp"
                    className="input"
                    value={nouvelleComp}
                    onChange={(e) => setNouvelleComp(e.target.value)}
                  >
                    <option value="">Choisir une compétence…</option>
                    {competencesDisponibles.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    icon={Plus}
                    onClick={ajouterCompetence}
                    disabled={nouvelleComp === ""}
                  >
                    Ajouter
                  </Button>
                </div>
              )}
              {errors.competences && (
                <span className="field-error" role="alert">
                  {errors.competences}
                </span>
              )}
            </section>

            {/* --- Section 4: tasks (composition) --- */}
            <section className="form-section" aria-labelledby="titre-taches">
              <h3 id="titre-taches">Tâches du projet ({form.taches.length})</h3>

              {form.taches.length > 0 && (
                <ol className="task-list">
                  {form.taches.map((t) => (
                    <li key={t.id}>
                      {t.libelle}
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Supprimer la tâche ${t.libelle}`}
                        onClick={() => retirerTache(t.id)}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              <div className="inline-add">
                <label htmlFor="add-tache" className="sr-only">
                  Nouvelle tâche
                </label>
                <input
                  id="add-tache"
                  className="input"
                  placeholder="Ajouter une tâche…"
                  value={nouvelleTache}
                  onChange={(e) => setNouvelleTache(e.target.value)}
                  // ★ Enter inside a form normally SUBMITS it. Here we want "add the task" instead.
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      ajouterTache();
                    }
                  }}
                />
                <Button variant="secondary" icon={Plus} onClick={ajouterTache}>
                  Ajouter
                </Button>
              </div>
            </section>

            {/* --- Footer actions --- */}
            <div
              className="form-section"
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {enModification ? (
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setASupprimer(projetEdite)}
                >
                  Supprimer le projet
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" icon={Save}>
                {enModification ? "Enregistrer" : "Créer le projet"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <ConfirmDialog
        open={aSupprimer !== null}
        title="Supprimer ce projet ?"
        message={
          aSupprimer
            ? `« ${aSupprimer.titre} » et ses ${aSupprimer.taches.length} tâche(s) seront supprimés définitivement.`
            : ""
        }
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </>
  );
}
