package tn.devtec.stages.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.Competence;
import tn.devtec.stages.entity.ProjetStage;

// /score: derived attribute of Candidature
// PURE calculation: no database, no Spring → easy to unit-test (see 4.7)
public final class ScoreCalculator {

    // Private constructor: this class only has static methods, nobody should do "new ScoreCalculator()"
    private ScoreCalculator() {
    }

    public static ResultatScore calculer(Candidature candidature) {
        ProjetStage projet = candidature.getProjet();

        // 1) Is the candidate's level accepted by the project?
        //    We compare the NAMES ("Licence"), not the objects (see the note below)
        String niveauCandidat = candidature.getNiveau().getNiveau();
        boolean niveauOk = projet.getNiveaux().stream()
                .anyMatch(n -> n.getNiveau().equals(niveauCandidat));

        // The candidate's skills as a Set of names → fast "contains"
        Set<String> competencesCandidat = candidature.getCompetences().stream()
                .map(Competence::getLibelle)          // same as c -> c.getLibelle()
                .collect(Collectors.toSet());

        // 2) For each skill REQUIRED by the project: does the candidate have it?
        List<DetailCompetence> details = projet.getCompetences().stream()
                .map(cp -> new DetailCompetence(
                        cp.getCompetence().getLibelle(),
                        cp.getPoids(),
                        competencesCandidat.contains(cp.getCompetence().getLibelle())))
                .toList();

        // 3) Points: total of the weights, and weights of the skills the candidate has
        int total = details.stream().mapToInt(DetailCompetence::poids).sum();
        int obtenu = details.stream()
                .filter(DetailCompetence::possedee)   // keep only the skills he has
                .mapToInt(DetailCompetence::poids)
                .sum();

        // 4) Score in % (0 if the level doesn't match, or if the project has no skills)
        //    100.0 (a double) → real division; with 100 (int), 5 * 100 / 6 would still work,
        //    but obtenu / total alone would give 0 (integer division!)
        int score = (niveauOk && total > 0)
                ? (int) Math.round(obtenu * 100.0 / total)
                : 0;

        return new ResultatScore(score, niveauOk, details, obtenu, total);
    }
}