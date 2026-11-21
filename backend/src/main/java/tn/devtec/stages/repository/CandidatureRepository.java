package tn.devtec.stages.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.ProjetStage;
import tn.devtec.stages.entity.StatutCandidature;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    // Tabs "En attente / Acceptées / Refusées" + conventions for accepted ones
    List<Candidature> findByStatut(StatutCandidature statut);

    // Filter "by project" on the RH page
    List<Candidature> findByProjet(ProjetStage projet);

    // Number of accepted interns on a mentor's projects ("2 stagiaires" on the RH cards)
    // The underscore follows a relationship: candidature.projet.mentor
    long countByStatutAndProjet_Mentor(StatutCandidature statut, Mentor mentor);

    // Rule: a project that already received applications can't be deleted
    boolean existsByProjet(ProjetStage projet);
}