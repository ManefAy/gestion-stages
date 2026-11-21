package tn.devtec.stages.service;

import java.time.LocalDate;
import java.util.List;

// What the mentor types in the project editor (same structure as the React form)
public record ProjetDonnees(
        String titre,
        LocalDate dateDebut,
        LocalDate dateFin,
        List<String> objectifs,             // one objective per item (stored as lines in MySQL)
        List<String> niveaux,               // ["Licence", "Ingénieur"]
        List<CompetencePoids> competences,  // [{ libelle, poids }]
        List<String> taches) {              // ["Créer des maquettes", ...]
}