package tn.devtec.stages.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.Role;
import tn.devtec.stages.exception.RegleMetierException;
import tn.devtec.stages.repository.MentorRepository;

// Integration tests: the REAL services + the REAL MySQL database (with the demo data)
@SpringBootTest     // starts the whole application
@Transactional      // ★ every test is rolled back at the end → the demo data stays intact
class RegleMetierServicesTest {

    @Autowired
    private MentorService mentorService;

    @Autowired
    private CompteService compteService;

    @Autowired
    private MentorRepository mentorRepository;

    // Finds a demo mentor by name
    private Mentor mentor(String nom) {
        return mentorRepository.findAll().stream()
                .filter(m -> m.getNom().equals(nom))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void supprimerUnMentorQuiEncadreDesProjets_estRefuse() {
        Long idAhmed = mentor("Ahmed Karray").getId(); // he supervises 2 projects

        RegleMetierException e = assertThrows(RegleMetierException.class,
                () -> mentorService.supprimer(idAhmed));

        assertEquals("Ce mentor encadre 2 projet(s) : réaffectez-les avant de le supprimer.", e.getMessage());
    }

    @Test
    void supprimerUnMentorSansProjet_fonctionne() {
        Long idHamza = mentor("Hamza Masmoudi").getId(); // 0 projects

        mentorService.supprimer(idHamza);

        assertFalse(mentorRepository.existsById(idHamza));
        // ...and thanks to @Transactional, Hamza is back after the test!
    }

    @Test
    void creerUnCompteAvecUnLoginDejaUtilise_estRefuse() {
        CompteDonnees donnees = new CompteDonnees(Role.RH, "Test", null, "a.karray", "secret1", true, null);

        assertThrows(RegleMetierException.class, () -> compteService.creer(donnees));
    }
}