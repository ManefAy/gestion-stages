package tn.devtec.stages.service;

import java.util.List;

// The result of the /score calculation, with everything needed to EXPLAIN it to the RH
// (same fields as the object returned by calculerScore() in React)
public record ResultatScore(
        int score,
        boolean niveauOk,
        List<DetailCompetence> details,
        int obtenu,
        int total) {
}