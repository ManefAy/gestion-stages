package tn.devtec.stages.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.Competence;
import tn.devtec.stages.entity.NiveauEtudes;
import tn.devtec.stages.entity.ProjetStage;

// Unit tests of the /score calculation — no Spring, no MySQL, only objects in memory
class ScoreCalculatorTest {

    // Shared objects (in memory, never saved)
    private final NiveauEtudes licence = new NiveauEtudes("Licence");
    private final NiveauEtudes mastere = new NiveauEtudes("Mastère");
    private final NiveauEtudes ingenieur = new NiveauEtudes("Ingénieur");
    private final Competence mobile = new Competence("Développement mobile");
    private final Competence design = new Competence("Design UI/UX");
    private final Competence api = new Competence("API REST");

    // The "Application mobile" project: Licence + Ingénieur, Mobile(3) UI/UX(2) API(1) = 6 points
    private ProjetStage projetMobile() {
        ProjetStage p = new ProjetStage("Application mobile",
                LocalDate.of(2027, 2, 1), LocalDate.of(2027, 4, 30), "Objectifs", null);
        p.getNiveaux().add(licence);
        p.getNiveaux().add(ingenieur);
        p.ajouterCompetence(mobile, 3);
        p.ajouterCompetence(design, 2);
        p.ajouterCompetence(api, 1);
        return p;
    }

    // Creates an application with a level and some skills
    private Candidature candidature(NiveauEtudes niveau, Competence... competences) {
        Candidature c = new Candidature("Test", "test@exemple.com", LocalDate.now(), projetMobile(), niveau);
        for (Competence comp : competences) {
            c.getCompetences().add(comp);
        }
        return c;
    }

    @Test
    void rania_deuxCompetencesSurTrois_obtient83() {
        ResultatScore r = ScoreCalculator.calculer(candidature(licence, mobile, design));

        assertEquals(5, r.obtenu());   // 3 + 2
        assertEquals(6, r.total());    // 3 + 2 + 1
        assertEquals(83, r.score());   // round(5 / 6 × 100)
    }

    @Test
    void sirine_toutesLesCompetences_obtient100() {
        ResultatScore r = ScoreCalculator.calculer(candidature(ingenieur, mobile, design, api));

        assertEquals(100, r.score());
    }

    @Test
    void salma_niveauNonAccepte_obtient0() {
        ResultatScore r = ScoreCalculator.calculer(candidature(mastere, design));

        assertFalse(r.niveauOk());     // Mastère is not accepted by this project
        assertEquals(0, r.score());    // → 0, even though she has a skill
    }
}