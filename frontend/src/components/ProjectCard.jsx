// ProjectCard.jsx — one project of the catalogue
import { Clock, UserRound, Check } from "lucide-react";
import { dureeEnMois } from "../data/projets";

// projet: one object from PROJETS
// selected: true if this card is the chosen project
// onSelect: function given by the parent, called when the button is clicked
export default function ProjectCard({ projet, selected, onSelect }) {
  return (
    // The class changes when selected → blue border (see catalogue.css)
    <article className={`project-card ${selected ? "is-selected" : ""}`}>
      <div className="project-card-top">
        <h3>{projet.titre}</h3>
        {selected && <span className="badge badge-info">Sélectionné</span>}
      </div>

      {/* Meta information with icons */}
      <ul className="project-meta">
        <li>
          <Clock size={16} aria-hidden="true" />
          {dureeEnMois(projet.dateDebut, projet.dateFin)} mois
        </li>
        <li>
          <UserRound size={16} aria-hidden="true" />
          Mentor : {projet.mentor}
        </li>
      </ul>

      <p className="project-levels">
        <strong>Niveaux :</strong> {projet.niveaux.join(", ")}
      </p>

      {/* One chip per required skill. key = something unique in this list */}
      <div className="chip-list">
        {projet.competences.map((c) => (
          <span key={c.libelle} className="chip">
            {c.libelle}
          </span>
        ))}
      </div>

      <button
        type="button"
        className={`btn ${selected ? "btn-secondary" : "btn-primary"} project-card-btn`}
        onClick={onSelect}
        aria-pressed={selected} // tells screen readers this button is "on"
      >
        {selected && <Check size={18} aria-hidden="true" />}
        {selected ? "Projet choisi" : "Choisir ce projet"}
      </button>
    </article>
  );
}
