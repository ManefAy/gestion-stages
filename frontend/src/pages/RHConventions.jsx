// RHConventions.jsx — use case "gérer conventions" (actor: Service RH)
import { useState } from "react";
import { FilePlus2, Printer, Trash2, X, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import ConventionDocument from "../components/ConventionDocument";
import {
  CONVENTIONS,
  SIGNATAIRES,
  prochainNumero,
  etatSignatures,
} from "../data/conventions";
import { CANDIDATURES } from "../data/candidatures";
import { PROJETS, SESSION } from "../data/projets";
import "./rh.css";

export default function RHConventions() {
  // ---------- 1) STATE ----------
  const [conventions, setConventions] = useState(CONVENTIONS);
  const [selectedId, setSelectedId] = useState(CONVENTIONS[0]?.id ?? null); // ?. and ?? : safe if the list is empty
  const [message, setMessage] = useState("");
  const [aSupprimer, setASupprimer] = useState(null);

  // ---------- 2) DERIVED DATA ----------

  // ★ "JOIN" like in SQL: each convention + its candidature + its project
  //   SELECT ... FROM convention JOIN candidature ... JOIN projet ...
  const lignes = conventions
    .map((conv) => {
      const candidature = CANDIDATURES.find((c) => c.id === conv.candidatureId);
      const projet = PROJETS.find((p) => p.id === candidature.projetId);
      return {
        ...conv,
        candidature,
        projet,
        etat: etatSignatures(conv.signatures),
      };
    })
    // '01-1-2027' < '02-1-2027' : padded numbers sort correctly as text
    .sort((a, b) => a.numero.localeCompare(b.numero));

  // Accepted applications that don't have a convention yet (multiplicity 0..1)
  const sansConvention = CANDIDATURES.filter(
    (c) =>
      c.statut === "ACCEPTEE" &&
      !conventions.some((conv) => conv.candidatureId === c.id),
  );

  const selection = lignes.find((l) => l.id === selectedId);

  // ---------- 3) HANDLERS ----------

  function genererConventions() {
    const aujourdhui = new Date().toISOString().slice(0, 10);

    // ★ We build the new list step by step: each new number is computed
    //   from the list that ALREADY contains the previous new conventions.
    //   (With the old "conventions" each time, they would all get the same number!)
    let liste = [...conventions];
    for (const cand of sansConvention) {
      const nouvelle = {
        id: Date.now() + cand.id, // unique even inside the same millisecond
        numero: prochainNumero(liste),
        dateCreation: aujourdhui,
        candidatureId: cand.id,
        signatures: { directeur: false, mentor: false, stagiaire: false },
      };
      liste = [...liste, nouvelle];
    }

    setConventions(liste);
    setSelectedId(liste[liste.length - 1].id); // show the last one created
    setMessage(`${sansConvention.length} convention(s) générée(s).`);
  }

  // Nested immutable update (like changerPoids in Step 6):
  // new list → new convention → new signatures object
  function toggleSignature(id, cle) {
    setConventions(
      conventions.map((c) =>
        c.id === id
          ? { ...c, signatures: { ...c.signatures, [cle]: !c.signatures[cle] } }
          : c,
      ),
    );
  }

  function confirmerSuppression() {
    setConventions(conventions.filter((c) => c.id !== aSupprimer.id));
    setSelectedId(null);
    setMessage(`Convention ${aSupprimer.numero} annulée.`);
    setASupprimer(null);
  }

  // ---------- 4) DISPLAY ----------
  return (
    <>
      <PageHeader
        title="Gérer les conventions"
        subtitle={`Numérotation : numéro séquentiel – mois – année (session ${SESSION.mois}-${SESSION.annee}).`}
        actions={
          <Button
            icon={FilePlus2}
            onClick={genererConventions}
            disabled={sansConvention.length === 0}
          >
            Générer les conventions ({sansConvention.length})
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
        {/* ===== TABLE ===== */}
        <section
          className="table-card split-main"
          aria-label="Liste des conventions"
        >
          <div className="table-scroll">
            <table className="table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th scope="col">N° convention</th>
                  <th scope="col">Stagiaire</th>
                  <th scope="col">Mentor</th>
                  <th scope="col">Signatures</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr
                    key={l.id}
                    className={l.id === selectedId ? "is-selected" : ""}
                  >
                    <td>
                      <button
                        type="button"
                        className="link-btn"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                        onClick={() => setSelectedId(l.id)}
                      >
                        {l.numero}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {l.candidature.nomCandidate}
                      </div>
                      <div className="text-muted small">{l.projet.titre}</div>
                    </td>
                    <td>{l.projet.mentor}</td>
                    <td>
                      <Badge tone={l.etat.tone}>{l.etat.texte}</Badge>
                    </td>
                  </tr>
                ))}
                {lignes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Aucune convention pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== PREVIEW + SIGNATURES ===== */}
        {selection ? (
          <aside
            className="card panel split-side"
            aria-label="Aperçu de la convention"
          >
            <div className="panel-head">
              <h2>Convention {selection.numero}</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Fermer l'aperçu"
                onClick={() => setSelectedId(null)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <ConventionDocument convention={selection} />

            {/* The 3 signatures are given on the first day of the internship */}
            <fieldset className="group">
              <legend>Signatures (premier jour du stage)</legend>
              <div className="choices">
                {SIGNATAIRES.map((s) => (
                  <label key={s.cle} className="choice">
                    <input
                      type="checkbox"
                      checked={selection.signatures[s.cle]}
                      onChange={() => toggleSignature(selection.id, s.cle)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="note" style={{ margin: 0 }}>
              <Info size={18} aria-hidden="true" />
              <span>
                Imprimez la convention en deux exemplaires (nombre de copies :
                2).
              </span>
            </div>

            <div className="panel-actions">
              {/* A fully signed convention is official: it can no longer be cancelled */}
              <Button
                variant="danger"
                icon={Trash2}
                disabled={selection.etat.n === 3}
                onClick={() => setASupprimer(selection)}
              >
                Annuler
              </Button>
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Imprimer
              </Button>
            </div>
          </aside>
        ) : (
          <div className="card split-side empty-panel">
            <p>Sélectionnez une convention pour voir son aperçu.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={aSupprimer !== null}
        title="Annuler cette convention ?"
        message={
          aSupprimer
            ? `La convention ${aSupprimer.numero} de ${aSupprimer.candidature.nomCandidate} sera supprimée.`
            : ""
        }
        confirmLabel="Annuler la convention"
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </>
  );
}
