package tn.devtec.stages.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.ConventionStage;

public interface ConventionStageRepository extends JpaRepository<ConventionStage, Long> {

    // Multiplicity 0..1: does this application already have a convention?
    boolean existsByCandidature(Candidature candidature);

    // Numbering: all the conventions of one session, e.g. numero ending with "-1-2027"
    // → SELECT … WHERE numero LIKE '%-1-2027'
    List<ConventionStage> findByNumeroEndingWith(String suffixe);
}