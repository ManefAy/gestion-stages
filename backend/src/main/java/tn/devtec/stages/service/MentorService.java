package tn.devtec.stages.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tn.devtec.stages.entity.Compte;
import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.ProjetStage;
import tn.devtec.stages.entity.StatutCandidature;
import tn.devtec.stages.exception.RegleMetierException;
import tn.devtec.stages.exception.RessourceIntrouvableException;
import tn.devtec.stages.repository.CandidatureRepository;
import tn.devtec.stages.repository.CompteRepository;
import tn.devtec.stages.repository.MentorRepository;
import tn.devtec.stages.repository.ProjetStageRepository;

// Business rules of the use case "gérer mentors" (actor: Service RH)
@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorRepository mentorRepository;
    private final ProjetStageRepository projetRepository;
    private final CandidatureRepository candidatureRepository;
    private final CompteRepository compteRepository;

    // A mentor + what the RH card shows: his projects and his number of interns
    public record MentorResume(Mentor mentor, List<String> projets, long nbStagiaires) {
    }

    @Transactional(readOnly = true)
    public List<MentorResume> lister() {
        return mentorRepository.findAll().stream()
                .map(this::resume)
                .toList();
    }

    @Transactional
    public MentorResume creer(MentorDonnees d) {
        // A new mentor has NO account yet: the admin creates it ("gérer comptes")
        Mentor m = new Mentor(d.nom().trim(), d.specialite().trim(),
                d.email(), d.telephone(), d.adresse());
        return resume(mentorRepository.save(m));
    }

    @Transactional
    public MentorResume modifier(Long id, MentorDonnees d) {
        Mentor m = trouver(id);
        m.setNom(d.nom().trim());
        m.setSpecialite(d.specialite().trim());
        m.setEmail(d.email());
        m.setTelephone(d.telephone());
        m.setAdresse(d.adresse());
        return resume(m); // dirty checking
    }

    @Transactional
    public void supprimer(Long id) {
        Mentor m = trouver(id);

        // ★ Rule from the multiplicity "Mentor 1 —— 0..* ProjetStage":
        //   every project needs EXACTLY one mentor → removing him would leave projects without one
        long nbProjets = projetRepository.countByMentor(m);
        if (nbProjets > 0) {
            throw new RegleMetierException("Ce mentor encadre " + nbProjets
                    + " projet(s) : réaffectez-les avant de le supprimer.");
        }

        // {totalité}: an account can't stay without a holder → delete it with the mentor
        Compte compte = m.getCompte();
        mentorRepository.delete(m);      // first the mentor (he holds the foreign key compte_id)
        if (compte != null) {
            compteRepository.delete(compte);
        }
    }

    // ==================== Helpers ====================

    private MentorResume resume(Mentor m) {
        List<String> titres = projetRepository.findByMentor(m).stream()
                .map(ProjetStage::getTitre)
                .toList();
        long nbStagiaires = candidatureRepository.countByStatutAndProjet_Mentor(StatutCandidature.ACCEPTEE, m);
        return new MentorResume(m, titres, nbStagiaires);
    }

    private Mentor trouver(Long id) {
        return mentorRepository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Mentor introuvable : " + id));
    }
}