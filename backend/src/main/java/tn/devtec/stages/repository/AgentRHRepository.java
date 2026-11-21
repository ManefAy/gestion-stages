package tn.devtec.stages.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.AgentRH;
import tn.devtec.stages.entity.Compte;

public interface AgentRHRepository extends JpaRepository<AgentRH, Long> {

    // Who holds this account? (display the user's name after login)
    Optional<AgentRH> findByCompte(Compte compte);

    // {XOR}: is this account already used by an agent?
    boolean existsByCompte(Compte compte);
}