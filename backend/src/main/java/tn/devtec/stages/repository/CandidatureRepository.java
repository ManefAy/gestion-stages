package tn.devtec.stages.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.ProjetStage;
import tn.devtec.stages.entity.StatutCandidature;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    // Tabs "En attente / Acceptées / Refusées" + conventions for accepted ones
    List<Candidature> findByStatut(StatutCandidature statut);

    // Filter "by project" on the RH page
    List<Candidature> findByProjet(ProjetStage projet);
}