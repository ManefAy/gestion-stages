package tn.devtec.stages.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.NiveauEtudes;

public interface NiveauEtudesRepository extends JpaRepository<NiveauEtudes, Long> {

    Optional<NiveauEtudes> findByNiveau(String niveau);
}