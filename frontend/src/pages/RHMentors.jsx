// RHMentors.jsx — use case "gérer mentors" (actor: Service RH)
import { useState } from "react";
import { Plus, Save, Trash2, X, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Field from "../components/Field";
import ConfirmDialog from "../components/ConfirmDialog";
import { useFormulaire } from "../hooks/useFormulaire";
import { MENTORS } from "../data/mentors";
import { PROJETS } from "../data/projets";
import { CANDIDATURES } from "../data/candidatures";
import { initiales } from "../data/comptes";
import "./rh.css";

const FORM_VIDE = {
  nom: "",
  specialite: "",
  email: "",
  telephone: "",
  adresse: "",
};

// Projects supervised by a mentor (association Mentor 1 — 0..* ProjetStage)
function projetsDe(nomMentor) {
  return PROJETS.filter((p) => p.mentor === nomMentor);
}

// Accepted interns on the mentor's projects
function nbStagiairesDe(nomMentor) {
  const ids = projetsDe(nomMentor).map((p) => p.id);
  return CANDIDATURES.filter(
    (c) => c.statut === "ACCEPTEE" && ids.includes(c.projetId),
  ).length;
}

export default function RHMentors() {
  // ---------- 1) STATE ----------
  const [mentors, setMentors] = useState(MENTORS);
  const [recherche, setRecherche] = useState("");
  const [message, setMessage] = useState("");
  const [aSupprimer, setASupprimer] = useState(null);

  // ★ All the form state in one line, thanks to our custom hook
  const f = useFormulaire(FORM_VIDE);

  // ---------- 2) DERIVED DATA ----------
  const q = recherche.trim().toLowerCase();
  const mentorsFiltres = mentors.filter(
    (m) =>
      m.nom.toLowerCase().includes(q) || m.specialite.toLowerCase().includes(q),
  );

  const mentorEdite = mentors.find((m) => m.id === f.editingId);
  // Business rule from the multiplicity "1": a mentor with projects can't be deleted
  const nbProjetsEdite = mentorEdite ? projetsDe(mentorEdite.nom).length : 0;

  // ---------- 3) HANDLERS ----------
  function ouvrir(m) {
    setMessage("");
    f.ouvrirModification(m.id, {
      nom: m.nom,
      specialite: m.specialite,
      email: m.email,
      telephone: m.telephone,
      adresse: m.adresse,
    });
  }

  function validate() {
    const e = {};
    const { form } = f;
    if (form.nom.trim() === "") e.nom = "Le nom est obligatoire.";
    if (form.specialite.trim() === "")
      e.specialite = "La spécialité est obligatoire.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Entrez un email valide.";
    // Optional "+", then 8 to 15 digits or spaces, e.g. "+216 74 000 101"
    if (!/^\+?[0-9 ]{8,15}$/.test(form.telephone))
      e.telephone = "Ex. +216 74 000 101";
    f.setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    // Clean the text values: trim every field
    const donnees = {
      nom: f.form.nom.trim(),
      specialite: f.form.specialite.trim(),
      email: f.form.email.trim(),
      telephone: f.form.telephone.trim(),
      adresse: f.form.adresse.trim(),
    };

    if (!f.enModification) {
      // A new mentor has no account yet: the ADMIN creates it (gérer comptes)
      const nouveau = { id: Date.now(), ...donnees, login: null };
      setMentors([...mentors, nouveau]);
      f.setEditingId(nouveau.id); // stay open in edit mode
      setMessage(
        `Mentor « ${nouveau.nom} » ajouté. Demandez à l'administrateur de créer son compte.`,
      );
    } else {
      setMentors(
        mentors.map((m) => (m.id === f.editingId ? { ...m, ...donnees } : m)),
      );
      setMessage("Informations enregistrées.");
    }
  }

  function confirmerSuppression() {
    setMentors(mentors.filter((m) => m.id !== aSupprimer.id));
    f.fermer();
    setMessage(`Mentor « ${aSupprimer.nom} » supprimé.`);
    setASupprimer(null);
  }

  // ---------- 4) DISPLAY ----------
  return (
    <>
      <PageHeader
        title="Gérer les mentors"
        subtitle="Informations personnelles des mentors et projets qu'ils encadrent."
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setMessage("");
              f.ouvrirCreation();
            }}
          >
            Ajouter un mentor
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
        {/* ===== CARDS ===== */}
        <section
          className="table-card split-main"
          aria-label="Liste des mentors"
        >
          <div className="toolbar">
            <label htmlFor="recherche-mentor" className="sr-only">
              Rechercher un mentor
            </label>
            <input
              id="recherche-mentor"
              className="input"
              type="search"
              placeholder="Rechercher par nom ou spécialité…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <span className="text-muted">
              {mentorsFiltres.length} mentor(s)
            </span>
          </div>

          <div className="mentor-grid">
            {mentorsFiltres.map((m) => {
              const selected = f.ouvert && m.id === f.editingId;
              return (
                // The whole card is ONE button → keyboard and screen-reader friendly
                <button
                  key={m.id}
                  type="button"
                  className={`select-item ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => ouvrir(m)}
                >
                  <span className="mentor-card-top">
                    <span className="avatar" aria-hidden="true">
                      {initiales(m.nom)}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <strong>{m.nom}</strong>
                      <span>{m.specialite}</span>
                    </span>
                  </span>
                  <span className="mentor-stats">
                    <span>
                      <b>{projetsDe(m.nom).length}</b> projet(s)
                    </span>
                    <span>
                      <b>{nbStagiairesDe(m.nom)}</b> stagiaire(s)
                    </span>
                  </span>
                  {m.login ? (
                    <Badge tone="success">Compte : {m.login}</Badge>
                  ) : (
                    <Badge tone="warning">Compte à créer</Badge>
                  )}
                </button>
              );
            })}
          </div>
          {mentorsFiltres.length === 0 && (
            <p className="table-empty">Aucun mentor trouvé.</p>
          )}
        </section>

        {/* ===== FORM ===== */}
        {f.ouvert && (
          <form
            className="card panel split-side"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="panel-head">
              <h2>{f.enModification ? "Fiche du mentor" : "Nouveau mentor"}</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Fermer le formulaire"
                onClick={f.fermer}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <Field label="Nom et prénom" id="m-nom" error={f.errors.nom}>
              <input
                id="m-nom"
                name="nom"
                className="input"
                value={f.form.nom}
                onChange={f.handleChange}
                aria-invalid={f.errors.nom ? "true" : "false"}
              />
            </Field>
            <Field label="Spécialité" id="m-spe" error={f.errors.specialite}>
              <input
                id="m-spe"
                name="specialite"
                className="input"
                value={f.form.specialite}
                onChange={f.handleChange}
                aria-invalid={f.errors.specialite ? "true" : "false"}
              />
            </Field>
            <Field label="Email" id="m-email" error={f.errors.email}>
              <input
                id="m-email"
                name="email"
                type="email"
                className="input"
                value={f.form.email}
                onChange={f.handleChange}
                aria-invalid={f.errors.email ? "true" : "false"}
              />
            </Field>
            <Field label="Téléphone" id="m-tel" error={f.errors.telephone}>
              <input
                id="m-tel"
                name="telephone"
                type="tel"
                className="input"
                value={f.form.telephone}
                onChange={f.handleChange}
                aria-invalid={f.errors.telephone ? "true" : "false"}
              />
            </Field>
            <Field label="Adresse" id="m-adr" hint="Facultatif">
              <input
                id="m-adr"
                name="adresse"
                className="input"
                value={f.form.adresse}
                onChange={f.handleChange}
              />
            </Field>

            {/* Projects supervised (read only here: the mentor manages them himself) */}
            {mentorEdite && (
              <div className="form-section">
                <h3>Projets encadrés ({nbProjetsEdite})</h3>
                {nbProjetsEdite === 0 ? (
                  <p className="text-muted" style={{ margin: 0 }}>
                    Aucun projet.
                  </p>
                ) : (
                  <ul className="task-list">
                    {projetsDe(mentorEdite.nom).map((p) => (
                      <li key={p.id} style={{ padding: 12 }}>
                        {p.titre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Explain WHY delete is blocked, right next to the button */}
            {f.enModification && nbProjetsEdite > 0 && (
              <div className="note" style={{ margin: 0 }}>
                <Info size={18} aria-hidden="true" />
                <span>
                  Ce mentor encadre {nbProjetsEdite} projet(s). Chaque projet
                  doit avoir un mentor : réaffectez-les avant de le supprimer.
                </span>
              </div>
            )}

            <div className="panel-actions">
              {f.enModification && (
                <Button
                  variant="danger"
                  icon={Trash2}
                  disabled={nbProjetsEdite > 0}
                  onClick={() => setASupprimer(mentorEdite)}
                >
                  Supprimer
                </Button>
              )}
              <Button type="submit" icon={Save}>
                {f.enModification ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <ConfirmDialog
        open={aSupprimer !== null}
        title="Supprimer ce mentor ?"
        message={
          aSupprimer
            ? `« ${aSupprimer.nom} » sera supprimé définitivement.`
            : ""
        }
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </>
  );
}
