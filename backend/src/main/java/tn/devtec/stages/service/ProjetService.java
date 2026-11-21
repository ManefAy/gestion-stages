package tn.devtec.stages.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tn.devtec.stages.entity.Competence;
import tn.devtec.stages.entity.CompetenceProjet;
import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.NiveauEtudes;
import tn.devtec.stages.entity.ProjetStage;
import tn.devtec.stages.exception.RegleMetierException;
import tn.devtec.stages.exception.RessourceIntrouvableException;
import tn.devtec.stages.repository.CandidatureRepository;
import tn.devtec.stages.repository.CompetenceRepository;
import tn.devtec.stages.repository.MentorRepository;
import tn.devtec.stages.repository.NiveauEtudesRepository;
import tn.devtec.stages.repository.ProjetStageRepository;

// Business rules of the use case "gérer projets" (actor: Mentor)
// + the public catalogue (read only)
@Service
@RequiredArgsConstructor
public class ProjetService {

    private final ProjetStageRepository projetRepository;
    private final MentorRepository mentorRepository;
    private final NiveauEtudesRepository niveauRepository;
    private final CompetenceRepository competenceRepository;
    private final CandidatureRepository candidatureRepository;

    // ==================== Read ====================

    // Public catalogue + RH filter "by project"
    @Transactional(readOnly = true)
    public List<ProjetStage> listerTous() {
        return projetRepository.findAll();
    }

    // "gérer projets": a mentor only sees HIS projects
    // (in Step 7, mentorId will come from the login token, not from the request)
    @Transactional(readOnly = true)
    public List<ProjetStage> listerParMentor(Long mentorId) {
        return projetRepository.findByMentor(trouverMentor(mentorId));
    }

    // ==================== Create / Update / Delete ====================

    @Transactional
    public ProjetStage creer(Long mentorId, ProjetDonnees d) {
        valider(d);
        ProjetStage p = new ProjetStage(d.titre().trim(), d.dateDebut(), d.dateFin(),
                joindreObjectifs(d.objectifs()), trouverMentor(mentorId));
        appliquerNiveaux(p, d.niveaux());
        appliquerCompetences(p, d.competences());
        appliquerTaches(p, d.taches());
        return projetRepository.save(p); // cascade → tasks + CompetenceProjet saved too
    }

    @Transactional
    public ProjetStage modifier(Long projetId, Long mentorId, ProjetDonnees d) {
        ProjetStage p = trouverProjetDuMentor(projetId, mentorId);
        valider(d);
        p.setTitre(d.titre().trim());
        p.setDateDebut(d.dateDebut());
        p.setDateFin(d.dateFin());
        p.setObjectifs(joindreObjectifs(d.objectifs()));
        appliquerNiveaux(p, d.niveaux());
        appliquerCompetences(p, d.competences());
        appliquerTaches(p, d.taches());
        return p; // dirty checking + cascade
    }

    @Transactional
    public void supprimer(Long projetId, Long mentorId) {
        ProjetStage p = trouverProjetDuMentor(projetId, mentorId);

        // Candidature 0..* —— 1 ProjetStage: each application needs its project
        // → a project that already received applications can't disappear
        if (candidatureRepository.existsByProjet(p)) {
            throw new RegleMetierException("Ce projet a déjà reçu des candidatures : il ne peut plus être supprimé.");
        }
        // Composition ◆: cascade + orphanRemoval delete the tasks and the weights with it
        projetRepository.delete(p);
    }

    // ==================== Validation (business rules) ====================

    private void valider(ProjetDonnees d) {
        if (d.dateDebut() == null || d.dateFin() == null) {
            throw new RegleMetierException("Les dates de début et de fin sont obligatoires.");
        }
        if (!d.dateFin().isAfter(d.dateDebut())) {
            throw new RegleMetierException("La date de fin doit être après la date de début.");
        }
        if (d.objectifs() == null || d.objectifs().stream().allMatch(String::isBlank)) {
            throw new RegleMetierException("Ajoutez au moins un objectif.");
        }
        // Multiplicity 1..* towards NiveauEtudes
        if (d.niveaux() == null || d.niveaux().isEmpty()) {
            throw new RegleMetierException("Choisissez au moins un niveau d'études.");
        }
        // Without skills, the automatic sorting can't compute a score
        if (d.competences() == null || d.competences().isEmpty()) {
            throw new RegleMetierException("Ajoutez au moins une compétence requise.");
        }
        Set<String> dejaVues = new HashSet<>();
        for (CompetencePoids cp : d.competences()) {
            if (cp.poids() < 1 || cp.poids() > 5) {
                throw new RegleMetierException("Le poids de « " + cp.libelle() + " » doit être entre 1 et 5.");
            }
            // Set.add() returns false if the value was ALREADY in the set → a duplicate
            if (!dejaVues.add(cp.libelle())) {
                throw new RegleMetierException("La compétence « " + cp.libelle() + " » est en double.");
            }
        }
    }

    // ==================== Apply the form to the entity ====================

    // ManyToMany: replace the set of levels
    private void appliquerNiveaux(ProjetStage p, List<String> niveaux) {
        p.getNiveaux().clear();
        for (String libelle : niveaux) {
            NiveauEtudes n = niveauRepository.findByNiveau(libelle)
                    .orElseThrow(() -> new RessourceIntrouvableException("Niveau inconnu : " + libelle));
            p.getNiveaux().add(n);
        }
    }

    // Association class: UPDATE IN PLACE (see the trap explained above)
    private void appliquerCompetences(ProjetStage p, List<CompetencePoids> nouvelles) {
        // libelle → poids, to look up the new weights quickly
        Map<String, Integer> poidsParLibelle = nouvelles.stream()
                .collect(Collectors.toMap(CompetencePoids::libelle, CompetencePoids::poids));

        // 1) Remove the skills that are no longer wanted (orphanRemoval → DELETE)
        p.getCompetences().removeIf(cp -> !poidsParLibelle.containsKey(cp.getCompetence().getLibelle()));

        // 2) Update the weight of the skills that stay
        for (CompetenceProjet cp : p.getCompetences()) {
            cp.setPoids(poidsParLibelle.get(cp.getCompetence().getLibelle()));
        }

        // 3) Add only the NEW skills
        Set<String> dejaPresentes = p.getCompetences().stream()
                .map(cp -> cp.getCompetence().getLibelle())
                .collect(Collectors.toSet());
        for (CompetencePoids cp : nouvelles) {
            if (!dejaPresentes.contains(cp.libelle())) {
                Competence c = competenceRepository.findByLibelle(cp.libelle())
                        .orElseThrow(() -> new RessourceIntrouvableException("Compétence inconnue : " + cp.libelle()));
                p.ajouterCompetence(c, cp.poids());
            }
        }
    }

    // Composition: replace the tasks (no unique constraint → clear + add is safe here)
    private void appliquerTaches(ProjetStage p, List<String> taches) {
        p.getTaches().clear(); // orphanRemoval → the old tasks are deleted
        if (taches != null) {
            for (String libelle : taches) {
                if (libelle != null && !libelle.isBlank()) {
                    p.ajouterTache(libelle.trim());
                }
            }
        }
    }

    // ["Objectif 1", " ", "Objectif 2"] → "Objectif 1\nObjectif 2" (empty lines removed)
    private String joindreObjectifs(List<String> objectifs) {
        return objectifs.stream()
                .map(String::trim)
                .filter(l -> !l.isEmpty())
                .collect(Collectors.joining("\n"));
    }

    // ==================== Helpers ====================

    private Mentor trouverMentor(Long mentorId) {
        return mentorRepository.findById(mentorId)
                .orElseThrow(() -> new RessourceIntrouvableException("Mentor introuvable : " + mentorId));
    }

    // A mentor can only modify or delete HIS OWN projects
    private ProjetStage trouverProjetDuMentor(Long projetId, Long mentorId) {
        ProjetStage p = projetRepository.findById(projetId)
                .orElseThrow(() -> new RessourceIntrouvableException("Projet introuvable : " + projetId));
        if (!p.getMentor().getId().equals(mentorId)) {
            throw new RegleMetierException("Ce projet n'appartient pas à ce mentor.");
        }
        return p;
    }
}