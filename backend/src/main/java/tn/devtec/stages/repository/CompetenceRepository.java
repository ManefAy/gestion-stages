package tn.devtec.stages.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Competence;

public interface CompetenceRepository extends JpaRepository<Competence, Long> {

    Optional<Competence> findByLibelle(String libelle);
}