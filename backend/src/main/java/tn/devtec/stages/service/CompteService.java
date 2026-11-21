package tn.devtec.stages.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tn.devtec.stages.entity.AgentRH;
import tn.devtec.stages.entity.Compte;
import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.Role;
import tn.devtec.stages.exception.RegleMetierException;
import tn.devtec.stages.exception.RessourceIntrouvableException;
import tn.devtec.stages.repository.AgentRHRepository;
import tn.devtec.stages.repository.CompteRepository;
import tn.devtec.stages.repository.MentorRepository;

// Business rules of the use case "gérer comptes" (actor: Administrateur)
@Service
@RequiredArgsConstructor
public class CompteService {

    private final CompteRepository compteRepository;
    private final AgentRHRepository agentRHRepository;
    private final MentorRepository mentorRepository;

    // An account + the name of its holder (what the admin table shows)
    public record CompteAvecTitulaire(Compte compte, String nom, String specialite) {
    }

    // ==================== Read ====================

    // All RH and Mentor accounts (the admin doesn't manage his own account here)
    @Transactional(readOnly = true)
    public List<CompteAvecTitulaire> lister() {
        return compteRepository.findAll().stream()
                .filter(c -> c.getRole() != Role.ADMIN)
                .map(this::avecTitulaire)   // same as c -> avecTitulaire(c)
                .toList();
    }

    // ==================== Create ====================

    @Transactional
    public CompteAvecTitulaire creer(CompteDonnees d) {
        // Only RH and MENTOR accounts are created here
        if (d.role() == Role.ADMIN) {
            throw new RegleMetierException("Un compte administrateur ne peut pas être créé ici.");
        }
        // Unique login (business rule: needs the database to decide)
        if (compteRepository.existsByLogin(d.login())) {
            throw new RegleMetierException("Ce login est déjà utilisé.");
        }
        if (d.mdp() == null || d.mdp().isBlank()) {
            throw new RegleMetierException("Le mot de passe est obligatoire à la création.");
        }

        Compte compte = new Compte(d.login(), d.mdp(), d.role());
        compte.setActif(d.actif());
        compte = compteRepository.save(compte);

        // {XOR, totalité}: the new account gets EXACTLY ONE holder
        if (d.role() == Role.RH) {
            agentRHRepository.save(new AgentRH(d.nom().trim(), compte));

        } else if (d.mentorExistantId() != null) {
            // Link to an existing mentor who doesn't have an account yet ("Compte à créer")
            Mentor m = mentorRepository.findById(d.mentorExistantId())
                    .orElseThrow(() -> new RessourceIntrouvableException("Mentor introuvable : " + d.mentorExistantId()));
            if (m.getCompte() != null) {
                throw new RegleMetierException("Ce mentor a déjà un compte."); // multiplicity 0..1
            }
            m.setCompte(compte); // dirty checking → saved at the end of the transaction

        } else {
            // New mentor created together with his account
            if (d.specialite() == null || d.specialite().isBlank()) {
                throw new RegleMetierException("La spécialité est obligatoire pour un mentor.");
            }
            Mentor m = new Mentor(d.nom().trim(), d.specialite().trim(), null, null, null);
            m.setCompte(compte);
            mentorRepository.save(m);
        }
        return avecTitulaire(compte);
    }

    // ==================== Update ====================

    @Transactional
    public CompteAvecTitulaire modifier(Long id, CompteDonnees d) {
        Compte c = trouver(id);

        if (c.getRole() == Role.ADMIN) {
            throw new RegleMetierException("Le compte administrateur ne se modifie pas ici.");
        }
        // {XOR}: an account belongs to ONE holder for its whole life
        if (d.role() != c.getRole()) {
            throw new RegleMetierException("Le titulaire d'un compte ne peut pas changer.");
        }
        // Unique login, but the account can keep its own
        if (compteRepository.existsByLoginAndIdNot(d.login(), id)) {
            throw new RegleMetierException("Ce login est déjà utilisé.");
        }

        c.setLogin(d.login());
        c.setActif(d.actif());
        // Empty password = keep the current one (same behavior as the React form)
        if (d.mdp() != null && !d.mdp().isBlank()) {
            c.setMdp(d.mdp());
        }

        // Update the holder's name (and specialty for a mentor)
        if (c.getRole() == Role.RH) {
            agentRHRepository.findByCompte(c).ifPresent(a -> a.setNom(d.nom().trim()));
        } else {
            mentorRepository.findByCompte(c).ifPresent(m -> {
                m.setNom(d.nom().trim());
                if (d.specialite() != null && !d.specialite().isBlank()) {
                    m.setSpecialite(d.specialite().trim());
                }
            });
        }
        return avecTitulaire(c); // all changes saved by dirty checking
    }

    // ==================== Delete ====================

    @Transactional
    public void supprimer(Long id) {
        Compte c = trouver(id);
        if (c.getRole() == Role.ADMIN) {
            throw new RegleMetierException("Le compte administrateur ne peut pas être supprimé.");
        }

        if (c.getRole() == Role.RH) {
            // AgentRH 0..1 —— 1 Compte: an agent can't exist WITHOUT his account → the agent goes too
            agentRHRepository.findByCompte(c).ifPresent(agentRHRepository::delete);
        } else {
            // The mentor STAYS (he may supervise projects): he just goes back to "Compte à créer"
            mentorRepository.findByCompte(c).ifPresent(m -> m.setCompte(null));
        }
        compteRepository.delete(c);
    }

    // ==================== Helpers ====================

    // Finds the holder of an account to show his name in the table
    private CompteAvecTitulaire avecTitulaire(Compte c) {
        if (c.getRole() == Role.RH) {
            return agentRHRepository.findByCompte(c)
                    .map(a -> new CompteAvecTitulaire(c, a.getNom(), null))
                    .orElse(new CompteAvecTitulaire(c, "(sans titulaire)", null));
        }
        return mentorRepository.findByCompte(c)
                .map(m -> new CompteAvecTitulaire(c, m.getNom(), m.getSpecialite()))
                .orElse(new CompteAvecTitulaire(c, "(sans titulaire)", null));
    }

    private Compte trouver(Long id) {
        return compteRepository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Compte introuvable : " + id));
    }
}