package tn.devtec.stages.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tn.devtec.stages.config.SessionStage;
import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.Competence;
import tn.devtec.stages.entity.NiveauEtudes;
import tn.devtec.stages.entity.ProjetStage;
import tn.devtec.stages.entity.StatutCandidature;
import tn.devtec.stages.exception.RegleMetierException;
import tn.devtec.stages.exception.RessourceIntrouvableException;
import tn.devtec.stages.repository.CandidatureRepository;
import tn.devtec.stages.repository.CompetenceRepository;
import tn.devtec.stages.repository.ConventionStageRepository;
import tn.devtec.stages.repository.NiveauEtudesRepository;
import tn.devtec.stages.repository.ProjetStageRepository;

// Business rules of the use cases "soumettre candidature" (Candidat) and "gérer stagiaires" (RH)
@Service
@RequiredArgsConstructor
@Slf4j
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final ProjetStageRepository projetRepository;
    private final NiveauEtudesRepository niveauRepository;
    private final CompetenceRepository competenceRepository;
    private final ConventionStageRepository conventionRepository;
    private final SessionStage session;

    // An application + its score, ready to be ranked
    public record CandidatureClassee(Candidature candidature, ResultatScore resultat) {
    }

    // ==================== gérer stagiaires (RH) ====================

    // Ranked list: optional filters (null = no filter), sorted by score, highest first
    // = the "map → filter → sort" chain of RHStagiaires.jsx
    @Transactional(readOnly = true)
    public List<CandidatureClassee> listerClassees(StatutCandidature statut, Long projetId) {
        return candidatureRepository.findAll().stream()
                .filter(c -> statut == null || c.getStatut() == statut)            // enum → == is OK
                .filter(c -> projetId == null || c.getProjet().getId().equals(projetId)) // Long → equals!
                .map(c -> new CandidatureClassee(c, ScoreCalculator.calculer(c)))
                .sorted(Comparator.comparingInt(
                        (CandidatureClassee cc) -> cc.resultat().score()).reversed()) // descending
                .toList();
    }

    // Accept or refuse an application
    @Transactional
    public Candidature changerStatut(Long id, StatutCandidature nouveauStatut) {
        Candidature c = trouver(id);

        // Consistency rule (Candidature 1 — 0..1 Convention):
        // an application that already has a convention must stay ACCEPTEE
        if (nouveauStatut != StatutCandidature.ACCEPTEE && conventionRepository.existsByCandidature(c)) {
            throw new RegleMetierException(
                    "Cette candidature a déjà une convention : annulez la convention avant de la refuser.");
        }

        c.setStatut(nouveauStatut);
        c.setEmailEnvoye(false); // new status → the email must be sent again

        // ★ No save(): "c" was loaded in THIS transaction, so Hibernate watches it
        //   and writes the changes to MySQL automatically at the end (dirty checking)
        return c;
    }

    // "Envoyer les emails d'acceptation": simulated (logged in the console)
    // Returns how many emails were "sent"
    @Transactional
    public int envoyerEmailsAcceptation() {
        List<Candidature> aEnvoyer = candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE).stream()
                .filter(c -> !c.isEmailEnvoye())   // Lombok: a boolean field gets "isXxx()", not "getXxx()"
                .toList();

        for (Candidature c : aEnvoyer) {
            // A real app would use JavaMailSender here (spring-boot-starter-mail)
            log.info("Email d'acceptation envoyé à {} ({})", c.getNomCandidate(), c.getEmail());
            c.setEmailEnvoye(true); // dirty checking again
        }
        return aEnvoyer.size();
    }

    // ==================== soumettre candidature (Candidat) ====================

    // Re-checks EVERY rule, even those React already checks (never trust the client)
    @Transactional
    public Candidature soumettre(String nom, String email, Long projetId,
                                 String niveauLibelle, List<String> libellesCompetences) {
        // Rule 1: the session must still be open (method estOuverte())
        if (!session.estOuverte()) {
            throw new RegleMetierException("La date limite de candidature est dépassée.");
        }

        // Rule 2: the project and the level must exist
        ProjetStage projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RessourceIntrouvableException("Projet introuvable : " + projetId));
        NiveauEtudes niveau = niveauRepository.findByNiveau(niveauLibelle)
                .orElseThrow(() -> new RessourceIntrouvableException("Niveau inconnu : " + niveauLibelle));

        // Rule 3: the project must accept this level
        boolean niveauAccepte = projet.getNiveaux().stream()
                .anyMatch(n -> n.getId().equals(niveau.getId()));
        if (!niveauAccepte) {
            throw new RegleMetierException("Ce projet n'accepte pas le niveau " + niveauLibelle + ".");
        }

        // Rule 4: multiplicity 1..* → at least one skill
        if (libellesCompetences == null || libellesCompetences.isEmpty()) {
            throw new RegleMetierException("Au moins une compétence est obligatoire.");
        }

        // Everything is valid → create the application (statut EN_ATTENTE by default)
        Candidature c = new Candidature(nom.trim(), email.trim(), LocalDate.now(), projet, niveau);
        for (String libelle : libellesCompetences) {
            Competence comp = competenceRepository.findByLibelle(libelle)
                    .orElseThrow(() -> new RessourceIntrouvableException("Compétence inconnue : " + libelle));
            c.getCompetences().add(comp);
        }
        return candidatureRepository.save(c);
    }

    // ==================== helper ====================

    private Candidature trouver(Long id) {
        return candidatureRepository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Candidature introuvable : " + id));
    }
}