// ConventionDocument.jsx — the printable convention (Annexe 2)
// Receives a "full" convention: { numero, dateCreation, signatures, candidature, projet }
import { ENTREPRISE, CONDITIONS, SIGNATAIRES } from "../data/conventions";
import { formatDate } from "../data/projets";

export default function ConventionDocument({ convention }) {
  const { numero, dateCreation, signatures, candidature, projet } = convention; // destructuring

  return (
    <article className="convention-doc" aria-label={`Convention ${numero}`}>
      <header className="convention-title">
        <h2>Convention de stage</h2>
        <p>
          N° {numero} · établie le {formatDate(dateCreation)}
        </p>
      </header>

      <section>
        <h3>1. Informations générales</h3>
        <p>
          Entreprise : {ENTREPRISE.nom}, {ENTREPRISE.adresse}
        </p>
        <p>
          Stagiaire : {candidature.nomCandidate} ({candidature.niveau}) —{" "}
          {candidature.email}
        </p>
      </section>

      <section>
        <h3>2. Description du stage</h3>
        <p>Projet : {projet.titre}</p>
        <p>
          Du {formatDate(projet.dateDebut)} au {formatDate(projet.dateFin)}
        </p>
      </section>

      <section>
        <h3>3. Encadrement</h3>
        {/* Navigation Convention → Candidature → ProjetStage → Mentor (no duplicated data) */}
        <p>Mentor : {projet.mentor}</p>
      </section>

      <section>
        <h3>4. Conditions de travail</h3>
        <p>
          {CONDITIONS.horaires} · {CONDITIONS.lieu}
        </p>
      </section>

      <section>
        <h3>5. Signatures</h3>
        <div className="signatures">
          {SIGNATAIRES.map((s) => (
            <div
              key={s.cle}
              className={`signature ${signatures[s.cle] ? "signed" : ""}`}
            >
              <span>{s.label}</span>
              <strong>{signatures[s.cle] ? "Signé" : "En attente"}</strong>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
