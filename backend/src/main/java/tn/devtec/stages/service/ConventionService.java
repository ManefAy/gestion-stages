package tn.devtec.stages.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tn.devtec.stages.config.SessionStage;
import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.ConventionStage;
import tn.devtec.stages.entity.StatutCandidature;
import tn.devtec.stages.exception.RegleMetierException;
import tn.devtec.stages.exception.RessourceIntrouvableException;
import tn.devtec.stages.repository.CandidatureRepository;
import tn.devtec.stages.repository.ConventionStageRepository;

// Business rules of the use case "gérer conventions" (RH)
@Service
@RequiredArgsConstructor
public class ConventionService {

    private final ConventionStageRepository conventionRepository;
    private final CandidatureRepository candidatureRepository;
    private final SessionStage session;

    // The 3 people who sign on the first day
    public enum Signataire {
        DIRECTEUR, MENTOR, STAGIAIRE
    }

    // All conventions, sorted by number ("01-1-2027" < "02-1-2027": padded → text order works)
    @Transactional(readOnly = true)
    public List<ConventionStage> lister() {
        return conventionRepository.findAll(Sort.by("numero"));
    }

    // Next number of the CURRENT session, e.g. "02-1-2027"
    // Format required by the case study: sequential number - month - year
    public String prochainNumero() {
        String suffixe = session.suffixeConvention(); // "-1-2027"

        // "01-1-2027" → split("-") → ["01", "1", "2027"] → [0] → "01" → 1
        int max = conventionRepository.findByNumeroEndingWith(suffixe).stream()
                .mapToInt(c -> Integer.parseInt(c.getNumero().split("-")[0]))
                .max()          // an OptionalInt: may be empty if no convention yet
                .orElse(0);

        // %02d = integer on 2 digits with a leading zero: 2 → "02"
        return String.format("%02d", max + 1) + suffixe;
    }

    // "Générer les conventions": one per ACCEPTED application that doesn't have one yet
    @Transactional
    public List<ConventionStage> genererPourAcceptees() {
        List<Candidature> sansConvention = candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE).stream()
                .filter(c -> !conventionRepository.existsByCandidature(c)) // multiplicity 0..1
                .toList();

        List<ConventionStage> creees = new ArrayList<>();
        for (Candidature c : sansConvention) {
            // ★ Remember the React bug we avoided (Step 9): each number must see the previous ones.
            //   Here it works because with GenerationType.IDENTITY, save() sends the INSERT
            //   to MySQL immediately (MySQL creates the id) → the next prochainNumero()
            //   query already finds the convention we just saved.
            ConventionStage conv = new ConventionStage(prochainNumero(), LocalDate.now(), c);
            creees.add(conventionRepository.save(conv));
        }
        return creees;
    }

    // Check / uncheck one signature
    @Transactional
    public ConventionStage basculerSignature(Long id, Signataire signataire) {
        ConventionStage conv = trouver(id);

        // "Arrow" switch (Java 14+): no "break" needed
        switch (signataire) {
            case DIRECTEUR -> conv.setSigneDirecteur(!conv.isSigneDirecteur());
            case MENTOR -> conv.setSigneMentor(!conv.isSigneMentor());
            case STAGIAIRE -> conv.setSigneStagiaire(!conv.isSigneStagiaire());
        }
        return conv; // dirty checking: saved at the end of the transaction
    }

    // Cancel (delete) a convention — impossible once it's fully signed (it's official)
    @Transactional
    public void annuler(Long id) {
        ConventionStage conv = trouver(id);
        if (nombreSignatures(conv) == 3) {
            throw new RegleMetierException("Convention entièrement signée : elle ne peut plus être annulée.");
        }
        conventionRepository.delete(conv);
    }

    // 0 to 3 (used here and later in the DTO for "En cours (2/3)")
    public static int nombreSignatures(ConventionStage c) {
        int n = 0;
        if (c.isSigneDirecteur()) n++;
        if (c.isSigneMentor()) n++;
        if (c.isSigneStagiaire()) n++;
        return n;
    }

    private ConventionStage trouver(Long id) {
        return conventionRepository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Convention introuvable : " + id));
    }
}