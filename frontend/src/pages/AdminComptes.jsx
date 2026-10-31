// AdminComptes.jsx — use case "gérer comptes" (actor: Administrateur)
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Field from "../components/Field";
import ConfirmDialog from "../components/ConfirmDialog";
import { COMPTES, ROLE_LABELS, initiales } from "../data/comptes";

// Empty form, used when creating a new account
const FORM_VIDE = {
  role: "mentor",
  nom: "",
  specialite: "",
  login: "",
  mdp: "",
  actif: true,
};

export default function AdminComptes() {
  // ---------- 1) STATE ----------
  // The list of accounts. We start from the fake data, WITHOUT the admin account
  // (the admin manages RH and Mentor accounts, not himself).
  // Function form: the filter runs only once, at the first render (React tip from the skill).
  const [comptes, setComptes] = useState(() =>
    COMPTES.filter((c) => c.role !== "admin"),
  );

  const [recherche, setRecherche] = useState("");
  const [roleFiltre, setRoleFiltre] = useState("tous");

  const [formOuvert, setFormOuvert] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating, a number = editing
  const [form, setForm] = useState(FORM_VIDE); // ALL the fields in one object
  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState(""); // success message
  const [aSupprimer, setASupprimer] = useState(null); // account waiting for confirmation

  // ---------- 2) DERIVED DATA ----------
  const q = recherche.trim().toLowerCase();
  const comptesFiltres = comptes.filter((c) => {
    const okRole = roleFiltre === "tous" || c.role === roleFiltre;
    const okTexte = c.nom.toLowerCase().includes(q) || c.login.includes(q);
    return okRole && okTexte;
  });

  const enModification = editingId !== null; // easier to read than "editingId !== null" everywhere

  // ---------- 3) HANDLERS ----------

  // ONE function for every field: it uses the input's "name" attribute
  // to know which property of "form" to update.
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form, // copy all the other fields
      [name]: type === "checkbox" ? checked : value, // replace only this one
    });
  }

  function ouvrirCreation() {
    setEditingId(null);
    setForm(FORM_VIDE);
    setErrors({});
    setMessage("");
    setFormOuvert(true);
  }

  function ouvrirModification(compte) {
    setEditingId(compte.id);
    // Fill the form with the account's values. Password stays empty:
    // we never show an existing password, the admin can only set a new one.
    setForm({
      role: compte.role,
      nom: compte.nom,
      specialite: compte.specialite || "",
      login: compte.login,
      mdp: "",
      actif: compte.actif,
    });
    setErrors({});
    setMessage("");
    setFormOuvert(true);
  }

  function validate() {
    const e = {};
    if (form.nom.trim() === "") e.nom = "Le nom est obligatoire.";
    if (form.role === "mentor" && form.specialite.trim() === "") {
      e.specialite = "La spécialité est obligatoire pour un mentor.";
    }
    if (!/^[a-z0-9.-]{3,}$/.test(form.login)) {
      e.login = "Au moins 3 caractères : minuscules, chiffres, point ou tiret.";
    } else if (
      comptes.some((c) => c.login === form.login && c.id !== editingId)
    ) {
      // Unique login (but the account we're editing can keep its own)
      e.login = "Ce login est déjà utilisé.";
    }
    // Password: required when creating, optional when editing (empty = unchanged)
    if (!enModification && form.mdp.length < 6) {
      e.mdp = "Au moins 6 caractères.";
    } else if (enModification && form.mdp !== "" && form.mdp.length < 6) {
      e.mdp = "Au moins 6 caractères (ou laissez vide pour ne pas changer).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    // Clean values shared by create and edit
    const donnees = {
      role: form.role,
      nom: form.nom.trim(),
      login: form.login,
      actif: form.actif,
      // a specialty only makes sense for a mentor
      specialite: form.role === "mentor" ? form.specialite.trim() : undefined,
    };

    if (!enModification) {
      // CREATE → new array = old array + new object (never comptes.push!)
      const nouveau = { id: Date.now(), ...donnees, mdp: form.mdp };
      setComptes([...comptes, nouveau]);
      setMessage(`Compte « ${nouveau.login} » créé.`);
    } else {
      // UPDATE → map: replace only the account with the same id
      setComptes(
        comptes.map((c) =>
          c.id === editingId
            ? { ...c, ...donnees, mdp: form.mdp || c.mdp } // keep the old password if empty
            : c,
        ),
      );
      setMessage(`Compte « ${form.login} » modifié.`);
    }
    setFormOuvert(false);
  }

  function confirmerSuppression() {
    // DELETE → filter: keep every account EXCEPT this one
    setComptes(comptes.filter((c) => c.id !== aSupprimer.id));
    if (editingId === aSupprimer.id) setFormOuvert(false); // its form was open → close it
    setMessage(`Compte « ${aSupprimer.login} » supprimé.`);
    setASupprimer(null); // closes the dialog
  }

  // ---------- 4) DISPLAY ----------
  return (
    <>
      <PageHeader
        title="Gérer les comptes"
        subtitle="Chaque compte appartient à un seul titulaire : un agent RH ou un mentor."
        actions={
          <Button icon={Plus} onClick={ouvrirCreation}>
            Créer un compte
          </Button>
        }
      />

      {/* Success message with a close button */}
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
        {/* ===== LIST (Read) ===== */}
        <section
          className="table-card split-main"
          aria-label="Liste des comptes"
        >
          <div className="toolbar">
            <label htmlFor="recherche" className="sr-only">
              Rechercher un compte
            </label>
            <input
              id="recherche"
              className="input"
              type="search"
              placeholder="Rechercher par nom ou login…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <label htmlFor="filtre-role" className="sr-only">
              Filtrer par rôle
            </label>
            <select
              id="filtre-role"
              className="input"
              value={roleFiltre}
              onChange={(e) => setRoleFiltre(e.target.value)}
            >
              <option value="tous">Tous les rôles</option>
              <option value="rh">Agent RH</option>
              <option value="mentor">Mentor</option>
            </select>
            <span className="text-muted">
              {comptesFiltres.length} compte(s)
            </span>
          </div>

          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Titulaire</th>
                  <th scope="col">Login</th>
                  <th scope="col">Rôle</th>
                  <th scope="col">État</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comptesFiltres.map((c) => (
                  <tr
                    key={c.id}
                    className={
                      c.id === editingId && formOuvert ? "is-selected" : ""
                    }
                  >
                    <td>
                      <div className="person">
                        <span className="avatar" aria-hidden="true">
                          {initiales(c.nom)}
                        </span>
                        <div>
                          {c.nom}
                          {c.specialite && (
                            <div
                              className="text-muted"
                              style={{ fontSize: 13, fontWeight: 400 }}
                            >
                              {c.specialite}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{c.login}</td>
                    <td>
                      <Badge tone={c.role === "mentor" ? "info" : "neutral"}>
                        {ROLE_LABELS[c.role]}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={c.actif ? "success" : "danger"}>
                        {c.actif ? "Actif" : "Désactivé"}
                      </Badge>
                    </td>
                    <td>
                      <div className="cell-actions">
                        {/* aria-label gives the full context: "Modifier Ahmed Karray" */}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Pencil}
                          aria-label={`Modifier ${c.nom}`}
                          onClick={() => ouvrirModification(c)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          aria-label={`Supprimer ${c.nom}`}
                          onClick={() => setASupprimer(c)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty state inside the table */}
                {comptesFiltres.length === 0 && (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      Aucun compte trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== FORM (Create / Update) — only if open ===== */}
        {formOuvert && (
          <form
            className="card panel split-side"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="panel-head">
              <h2>
                {enModification ? "Modifier le compte" : "Nouveau compte"}
              </h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Fermer le formulaire"
                onClick={() => setFormOuvert(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* {XOR}: exactly ONE holder type → radio buttons */}
            <fieldset className="group">
              <legend>Titulaire du compte</legend>
              <div className="choices">
                <label className="choice">
                  <input
                    type="radio"
                    name="role"
                    value="rh"
                    checked={form.role === "rh"}
                    onChange={handleChange}
                    disabled={enModification}
                  />
                  Agent RH
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    name="role"
                    value="mentor"
                    checked={form.role === "mentor"}
                    onChange={handleChange}
                    disabled={enModification}
                  />
                  Mentor
                </label>
              </div>
              {enModification && (
                <span className="field-hint">
                  Le titulaire d'un compte ne peut pas changer.
                </span>
              )}
            </fieldset>

            <Field label="Nom et prénom" id="f-nom" error={errors.nom}>
              <input
                id="f-nom"
                name="nom"
                className="input"
                value={form.nom}
                onChange={handleChange}
                aria-invalid={errors.nom ? "true" : "false"}
              />
            </Field>

            {/* Only for a mentor (attribute "specialite" of class Mentor) */}
            {form.role === "mentor" && (
              <Field
                label="Spécialité"
                id="f-spe"
                error={errors.specialite}
                hint="Ex. Développement mobile"
              >
                <input
                  id="f-spe"
                  name="specialite"
                  className="input"
                  value={form.specialite}
                  onChange={handleChange}
                  aria-invalid={errors.specialite ? "true" : "false"}
                />
              </Field>
            )}

            <Field
              label="Login"
              id="f-login"
              error={errors.login}
              hint="Ex. s.ben-salah"
            >
              <input
                id="f-login"
                name="login"
                className="input"
                autoComplete="off"
                value={form.login}
                onChange={handleChange}
                aria-invalid={errors.login ? "true" : "false"}
              />
            </Field>

            <Field
              label={
                enModification
                  ? "Nouveau mot de passe"
                  : "Mot de passe provisoire"
              }
              id="f-mdp"
              error={errors.mdp}
              hint={
                enModification
                  ? "Laissez vide pour garder le mot de passe actuel."
                  : "Au moins 6 caractères."
              }
            >
              <input
                id="f-mdp"
                name="mdp"
                type="password"
                className="input"
                autoComplete="new-password"
                value={form.mdp}
                onChange={handleChange}
                aria-invalid={errors.mdp ? "true" : "false"}
              />
            </Field>

            <label className="choice">
              <input
                type="checkbox"
                name="actif"
                checked={form.actif}
                onChange={handleChange}
              />
              Compte actif
            </label>

            <Button type="submit" icon={Save}>
              {enModification ? "Enregistrer" : "Créer le compte"}
            </Button>
          </form>
        )}
      </div>

      {/* Confirmation before delete. "open" is true when an account is waiting. */}
      <ConfirmDialog
        open={aSupprimer !== null}
        title="Supprimer ce compte ?"
        message={
          aSupprimer
            ? `Le compte « ${aSupprimer.login} » (${aSupprimer.nom}) sera supprimé définitivement.`
            : ""
        }
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </>
  );
}
