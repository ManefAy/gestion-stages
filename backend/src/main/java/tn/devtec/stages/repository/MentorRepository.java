package tn.devtec.stages.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Compte;
import tn.devtec.stages.entity.Mentor;

public interface MentorRepository extends JpaRepository<Mentor, Long> {

    // The logged-in mentor (to show only HIS projects)
    Optional<Mentor> findByCompte(Compte compte);

    // {XOR}: is this account already used by a mentor?
    boolean existsByCompte(Compte compte);
}