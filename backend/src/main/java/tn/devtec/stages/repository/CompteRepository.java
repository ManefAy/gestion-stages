package tn.devtec.stages.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.devtec.stages.entity.Compte;

// JpaRepository<Compte, Long> → CRUD for the entity Compte, whose @Id is a Long
public interface CompteRepository extends JpaRepository<Compte, Long> {

    // Login (Step 7): find the account by its login
    Optional<Compte> findByLogin(String login);

    // Rule "unique login" when the admin creates an account (Step 4)
    boolean existsByLogin(String login);
    
    // SELECT COUNT(*) > 0 … WHERE login = ? AND id <> ?
    boolean existsByLoginAndIdNot(String login, Long id);
}