package tn.devtec.stages.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.ProjetStage;

public interface ProjetStageRepository extends JpaRepository<ProjetStage, Long> {

    // "gérer projets": a mentor only sees HIS projects (Mentor 1 — 0..* ProjetStage)
    List<ProjetStage> findByMentor(Mentor mentor);

    // Rule: a mentor who still supervises projects can't be deleted
    long countByMentor(Mentor mentor);
}