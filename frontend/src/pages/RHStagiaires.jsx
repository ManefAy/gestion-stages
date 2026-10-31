// RHStagiaires.jsx — use case "gérer stagiaires" (actor: Service RH)
// Sorts the applications by /score, accepts or refuses them, sends the acceptance emails.
import { useState } from "react";
import { Mail, Check, X, Info, CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { CANDIDATURES, calculerScore } from "../data/candidatures";
import { PROJETS, SESSION, formatDate, sessionOuverte } from "../data/projets";
import "./rh.css";

// The 4 filter tabs: value → label
const ONGLETS = [
  { value: "TOUS", label: "Toutes" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "ACCEPTEE", label: "Acceptées" },
  { value: "REFUSEE", label: "Refusées" },
];

export default function RHStagiaires() {
  // ---------- 1) STATE ----------
  const [candidatures, setCandidatures] = useState(CANDIDATURES);
  const [statutFiltre, setStatutFiltre] = useState("TOUS");
  const [projetFiltre, setProjetFiltre] = useState("tous");
  const [selectedId, setSelectedId] = useState(null); // application shown in the details panel
  const [message, setMessage] = useState("");

  // ---------- 2) DERIVED DATA ----------

  // a) Add the project and the score to EVERY application
  //    (map creates a NEW array of NEW objects → the state is not modified)
  const toutes = candidatures.map((c) => {
    const projet = PROJETS.find((p) => p.id === c.projetId);
    return { ...c, projet, ...calculerScore(c, projet) };
  });

  // b) Keep only those matching the filters, then rank by score (highest first)
  //    ⚠️ sort() MODIFIES the array it's called on. Here it's safe because
  //       "filter" already returned a new array. Never call sort() directly on state!
  const lignes = toutes
    .filter((l) => statutFiltre === "TOUS" || l.statut === statutFiltre)
    .filter(
      (l) => projetFiltre === "tous" || l.projetId === Number(projetFiltre),
    )
    .sort((a, b) => b.score - a.score); // b - a = descending order

  // c) Numbers shown on the tabs
  function compter(statut) {
    return statut === "TOUS"
      ? candidatures.length
      : candidatures.filter((c) => c.statut === statut).length;
  }

  // d) Accepted applications whose email has not been sent yet
  const emailsAEnvoyer = candidatures.filter(
    (c) => c.statut === "ACCEPTEE" && !c.emailEnvoye,
  ).length;

  // e) The application shown in the details panel (with its score)
  const selection = toutes.find((l) => l.id === selectedId);

  const ouverte = sessionOuverte();

  // ---------- 3) HANDLERS ----------

  // Change the status of ONE application (immutable update with map)
  function changerStatut(id, statut) {
    setCandidatures(
      candidatures.map((c) =>
        c.id === id
          ? { ...c, statut, emailEnvoye: false } // new status → the email must be sent again
          : c,
      ),
    );
    const nom = candidatures.find((c) => c.id === id).nomCandidate;
    setMessage(
      `${nom} : candidature ${statut === "ACCEPTEE" ? "acceptée" : "refusée"}.`,
    );
  }

  // Simulates sending the emails: we just mark them as sent
  function envoyerEmails() {
    setCandidatures(
      candidatures.map((c) =>
        c.statut === "ACCEPTEE" ? { ...c, emailEnvoye: true } : c,
      ),
    );
    setMessage(`${emailsAEnvoyer} email(s) d'acceptation envoyé(s).`);
  }

  // ---------- 4) DISPLAY ----------
  return (
    <>
      <PageHeader
        title="Gérer les stagiaires"
        subtitle={`Session ${SESSION.mois === 1 ? "janvier" : "juin"} ${SESSION.annee} · date limite : ${formatDate(SESSION.dateLimite)}`}
        actions={
          <Button
            icon={Mail}
            onClick={envoyerEmails}
            disabled={emailsAEnvoyer === 0}
          >
            Envoyer les emails d'acceptation ({emailsAEnvoyer})
          </Button>
        }
      />

      <div className="note" role="note">
        <Info size={18} aria-hidden="true" />
        <span>
          Tri automatique : le score compare les compétences du candidat aux
          compétences pondérées du projet. Un niveau d'études non accepté par le
          projet donne 0.
          {ouverte &&
            " Les candidatures sont encore ouvertes : le classement peut changer."}
        </span>
      </div>

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
        {/* ===== TABLE ===== */}
        <section
          className="table-card split-main"
          aria-label="Candidatures classées par score"
        >
          <div className="toolbar">
            {/* Toggle buttons: aria-pressed tells which filter is active */}
            <div
              className="filter-tabs"
              role="group"
              aria-label="Filtrer par statut"
            >
              {ONGLETS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className="filter-tab"
                  aria-pressed={statutFiltre === o.value}
                  onClick={() => setStatutFiltre(o.value)}
                >
                  {o.label}
                  <span className="count">{compter(o.value)}</span>
                </button>
              ))}
            </div>

            <label htmlFor="filtre-projet" className="sr-only">
              Filtrer par projet
            </label>
            <select
              id="filtre-projet"
              className="input"
              value={projetFiltre}
              onChange={(e) => setProjetFiltre(e.target.value)}
            >
              <option value="tous">Tous les projets</option>
              {PROJETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titre}
                </option>
              ))}
            </select>
          </div>

          <div className="table-scroll">
            <table className="table" style={{ minWidth: 860 }}>
              <thead>
                <tr>
                  <th scope="col">Rang</th>
                  <th scope="col">Candidat</th>
                  <th scope="col">Projet</th>
                  <th scope="col">Niveau</th>
                  <th scope="col">Score</th>
                  <th scope="col">Statut</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, index) => (
                  <tr
                    key={l.id}
                    className={l.id === selectedId ? "is-selected" : ""}
                  >
                    {/* index starts at 0 → rank = index + 1 */}
                    <td className="rank">#{index + 1}</td>
                    <td>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => setSelectedId(l.id)}
                      >
                        {l.nomCandidate}
                      </button>
                      <div className="text-muted small">{l.email}</div>
                    </td>
                    <td>{l.projet.titre}</td>
                    <td>
                      {l.niveau}
                      {!l.niveauOk && (
                        <div
                          className="small"
                          style={{ color: "var(--color-danger)" }}
                        >
                          Non accepté
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="score">
                        <div className="score-bar" aria-hidden="true">
                          {/* inline style: the width depends on the data */}
                          <div
                            className={`score-fill ${l.score < 50 ? "low" : ""}`}
                            style={{ width: `${l.score}%` }}
                          />
                        </div>
                        <strong>{l.score}%</strong>
                      </div>
                    </td>
                    <td>
                      <Badge status={l.statut} />
                      {l.statut === "ACCEPTEE" && (
                        <div className="text-muted small">
                          {l.emailEnvoye ? "Email envoyé" : "Email à envoyer"}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="cell-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Check}
                          aria-label={`Accepter ${l.nomCandidate}`}
                          disabled={l.statut === "ACCEPTEE"}
                          onClick={() => changerStatut(l.id, "ACCEPTEE")}
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={X}
                          aria-label={`Refuser ${l.nomCandidate}`}
                          disabled={l.statut === "REFUSEE"}
                          onClick={() => changerStatut(l.id, "REFUSEE")}
                        >
                          Refuser
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      Aucune candidature pour ces filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== DETAILS PANEL: explains the score ===== */}
        {selection && (
          <aside
            className="card panel split-side"
            aria-label="Détails de la candidature"
          >
            <div className="panel-head">
              <h2>{selection.nomCandidate}</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Fermer les détails"
                onClick={() => setSelectedId(null)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* dl = description list: perfect for "label: value" pairs */}
            <dl className="detail-list">
              <dt>Email</dt>
              <dd>{selection.email}</dd>
              <dt>Déposée le</dt>
              <dd>{formatDate(selection.dateCandidature)}</dd>
              <dt>Projet</dt>
              <dd>{selection.projet.titre}</dd>
              <dt>Niveau</dt>
              <dd>
                {selection.niveau}{" "}
                {selection.niveauOk
                  ? "(accepté)"
                  : `(projet : ${selection.projet.niveaux.join(", ")})`}
              </dd>
              <dt>Statut</dt>
              <dd>
                <Badge status={selection.statut} />
              </dd>
            </dl>

            <div className="form-section">
              <h3>Calcul du score</h3>
              <ul className="check-list">
                {selection.details.map((d) => (
                  <li key={d.libelle} className={d.possedee ? "ok" : "missing"}>
                    {d.possedee ? (
                      <CheckCircle2 size={18} aria-hidden="true" />
                    ) : (
                      <XCircle size={18} aria-hidden="true" />
                    )}
                    {/* the text says it too, for screen readers and color-blind users */}
                    {d.libelle} — {d.possedee ? "possédée" : "manquante"}
                    <span className="poids">poids {d.poids}</span>
                  </li>
                ))}
              </ul>
              <p style={{ margin: 0 }}>
                {selection.niveauOk ? (
                  <>
                    {selection.obtenu} / {selection.total} points →{" "}
                    <strong>{selection.score}%</strong>
                  </>
                ) : (
                  <>
                    Niveau non accepté → <strong>0%</strong>
                  </>
                )}
              </p>
            </div>

            <div className="panel-actions">
              <Button
                variant="secondary"
                icon={Check}
                disabled={selection.statut === "ACCEPTEE"}
                onClick={() => changerStatut(selection.id, "ACCEPTEE")}
              >
                Accepter
              </Button>
              <Button
                variant="danger"
                icon={X}
                disabled={selection.statut === "REFUSEE"}
                onClick={() => changerStatut(selection.id, "REFUSEE")}
              >
                Refuser
              </Button>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
