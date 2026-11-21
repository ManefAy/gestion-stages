package tn.devtec.stages.config;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tn.devtec.stages.entity.AgentRH;
import tn.devtec.stages.entity.Candidature;
import tn.devtec.stages.entity.Competence;
import tn.devtec.stages.entity.Compte;
import tn.devtec.stages.entity.ConventionStage;
import tn.devtec.stages.entity.Mentor;
import tn.devtec.stages.entity.NiveauEtudes;
import tn.devtec.stages.entity.ProjetStage;
import tn.devtec.stages.entity.Role;
import tn.devtec.stages.entity.StatutCandidature;
import tn.devtec.stages.repository.AgentRHRepository;
import tn.devtec.stages.repository.CandidatureRepository;
import tn.devtec.stages.repository.CompetenceRepository;
import tn.devtec.stages.repository.CompteRepository;
import tn.devtec.stages.repository.ConventionStageRepository;
import tn.devtec.stages.repository.MentorRepository;
import tn.devtec.stages.repository.NiveauEtudesRepository;
import tn.devtec.stages.repository.ProjetStageRepository;

// Inserts the demo data (same as the React app) the FIRST time the app starts
@Component                  // Spring creates this object automatically at startup
@RequiredArgsConstructor    // Lombok: constructor with all the final fields → injection
@Slf4j                      // Lombok: gives a "log" object to write in the console
public class DataInitializer implements CommandLineRunner {

    // ---------- Injected by Spring (never "new") ----------
    private final CompteRepository compteRepository;
    private final AgentRHRepository agentRHRepository;
    private final MentorRepository mentorRepository;
    private final CompetenceRepository competenceRepository;
    private final NiveauEtudesRepository niveauRepository;
    private final ProjetStageRepository projetRepository;
    private final CandidatureRepository candidatureRepository;
    private final ConventionStageRepository conventionRepository;

    // Lookup tables to find an object by its name while creating the data
    private final Map<String, Competence> competences = new HashMap<>();
    private final Map<String, NiveauEtudes> niveaux = new HashMap<>();

    // @Transactional: everything succeeds or NOTHING is saved (no half-filled database)
    @Override
    @Transactional
    public void run(String... args) {
        // ddl-auto=update KEEPS the data between restarts:
        // if accounts already exist, the data is already there → do nothing (no duplicates)
        if (compteRepository.count() > 0) {
            log.info("Données de démonstration déjà présentes : rien à insérer.");
            return;
        }

        creerReferentiel();
        Map<String, Mentor> mentors = creerComptesEtPersonnes();
        Map<Integer, ProjetStage> projets = creerProjets(mentors);
        Map<Integer, Candidature> candidatures = creerCandidatures(projets);
        creerConventions(candidatures);

        log.info("Données de démonstration insérées.");
    }

    // ---------- 1) Reference data: levels + skills ----------
    private void creerReferentiel() {
        for (String n : List.of("Licence", "Mastère", "Ingénieur")) {
            niveaux.put(n, niveauRepository.save(new NiveauEtudes(n)));
        }
        for (String c : List.of("Développement mobile", "Design UI/UX", "API REST",
                "Python", "Oracle", "Data visualisation", "Java", "Spring Boot", "MySQL")) {
            competences.put(c, competenceRepository.save(new Competence(c)));
        }
    }

    // ---------- 2) Accounts, RH agents, mentors (comptes.js + mentors.js) ----------
    private Map<String, Mentor> creerComptesEtPersonnes() {
        // ⚠️ Clear passwords for now — hashed with BCrypt in Step 7
        compteRepository.save(new Compte("admin", "admin123", Role.ADMIN));

        Compte cTrabelsi = compteRepository.save(new Compte("a.trabelsi", "rh123", Role.RH));
        Compte cBelhaj = new Compte("n.belhaj", "rh456", Role.RH);
        cBelhaj.setActif(false);                       // disabled account (to test the login)
        cBelhaj = compteRepository.save(cBelhaj);

        agentRHRepository.save(new AgentRH("Amira Trabelsi", cTrabelsi));
        agentRHRepository.save(new AgentRH("Nour Belhaj", cBelhaj));

        // Mentors: the first 3 have an account, Hamza doesn't ("Compte à créer")
        Map<String, Mentor> mentors = new HashMap<>();
        mentors.put("Ahmed Karray", creerMentor("Ahmed Karray", "Développement mobile",
                "a.karray@devtec.tn", "+216 74 000 101", "Route de Tunis, Sfax", "a.karray", "mentor123"));
        mentors.put("Mariem Jlassi", creerMentor("Mariem Jlassi", "Data & BI",
                "m.jlassi@devtec.tn", "+216 74 000 102", "Sakiet Ezzit, Sfax", "m.jlassi", "mentor456"));
        mentors.put("Youssef Ghorbel", creerMentor("Youssef Ghorbel", "Back-end Java",
                "y.ghorbel@devtec.tn", "+216 74 000 103", "Route de Gremda, Sfax", "y.ghorbel", "mentor789"));
        mentors.put("Hamza Masmoudi", creerMentor("Hamza Masmoudi", "DevOps & Cloud",
                "h.masmoudi@devtec.tn", "+216 74 000 104", "Sfax Ville", null, null));
        return mentors;
    }

    // Creates a mentor, with an account if a login is given
    private Mentor creerMentor(String nom, String specialite, String email, String tel,
                               String adresse, String login, String mdp) {
        Mentor m = new Mentor(nom, specialite, email, tel, adresse);
        if (login != null) {
            m.setCompte(compteRepository.save(new Compte(login, mdp, Role.MENTOR)));
        }
        return mentorRepository.save(m);
    }

    // ---------- 3) Projects with levels, weighted skills and tasks (projets.js) ----------
    private Map<Integer, ProjetStage> creerProjets(Map<String, Mentor> mentors) {
        Map<Integer, ProjetStage> projets = new HashMap<>();

        ProjetStage p1 = new ProjetStage("Développement d'une application mobile",
                LocalDate.of(2027, 2, 1), LocalDate.of(2027, 4, 30),
                "Créer une application mobile conviviale.\n"
                        + "Implémenter des fonctionnalités clés (connexion sécurisée, notifications).\n"
                        + "Assurer la compatibilité iOS et Android.",
                mentors.get("Ahmed Karray"));
        p1.getNiveaux().add(niveaux.get("Licence"));
        p1.getNiveaux().add(niveaux.get("Ingénieur"));
        p1.ajouterCompetence(competences.get("Développement mobile"), 3);
        p1.ajouterCompetence(competences.get("Design UI/UX"), 2);
        p1.ajouterCompetence(competences.get("API REST"), 1);
        p1.ajouterTache("Créer des maquettes");
        p1.ajouterTache("Valider le design avec les parties prenantes");
        p1.ajouterTache("Implémenter les écrans principaux");
        p1.ajouterTache("Configurer l'API pour les données utilisateur");
        p1.ajouterTache("Mettre en place les notifications");
        p1.ajouterTache("Effectuer des tests unitaires");
        // ONE save → cascade also inserts the tasks and the CompetenceProjet rows
        projets.put(1, projetRepository.save(p1));

        ProjetStage p2 = new ProjetStage("Tableau de bord analytique",
                LocalDate.of(2027, 2, 1), LocalDate.of(2027, 5, 31),
                "Centraliser les indicateurs clés.\nVisualiser les données en temps réel.",
                mentors.get("Mariem Jlassi"));
        p2.getNiveaux().add(niveaux.get("Mastère"));
        p2.getNiveaux().add(niveaux.get("Ingénieur"));
        p2.ajouterCompetence(competences.get("Python"), 3);
        p2.ajouterCompetence(competences.get("Oracle"), 2);
        p2.ajouterCompetence(competences.get("Data visualisation"), 2);
        p2.ajouterTache("Définir les indicateurs");
        p2.ajouterTache("Écrire les requêtes Oracle");
        p2.ajouterTache("Créer les graphiques");
        projets.put(2, projetRepository.save(p2));

        ProjetStage p3 = new ProjetStage("Plateforme de gestion des tickets",
                LocalDate.of(2027, 2, 1), LocalDate.of(2027, 4, 30),
                "Gérer les demandes de support.\nSuivre le traitement des tickets.",
                mentors.get("Youssef Ghorbel"));
        p3.getNiveaux().add(niveaux.get("Licence"));
        p3.getNiveaux().add(niveaux.get("Mastère"));
        p3.ajouterCompetence(competences.get("Java"), 3);
        p3.ajouterCompetence(competences.get("Spring Boot"), 2);
        p3.ajouterCompetence(competences.get("MySQL"), 1);
        p3.ajouterTache("Analyser les besoins");
        p3.ajouterTache("Concevoir la base MySQL");
        p3.ajouterTache("Développer l'API Spring Boot");
        projets.put(3, projetRepository.save(p3));

        ProjetStage p4 = new ProjetStage("Refonte du portail client",
                LocalDate.of(2027, 2, 1), LocalDate.of(2027, 5, 31),
                "Moderniser l'interface du portail.\nAméliorer l'expérience des clients.",
                mentors.get("Ahmed Karray"));
        p4.getNiveaux().add(niveaux.get("Mastère"));
        p4.getNiveaux().add(niveaux.get("Ingénieur"));
        p4.ajouterCompetence(competences.get("Design UI/UX"), 3);
        p4.ajouterCompetence(competences.get("API REST"), 2);
        p4.ajouterTache("Auditer l'interface actuelle");
        p4.ajouterTache("Proposer de nouvelles maquettes");
        projets.put(4, projetRepository.save(p4));

        return projets;
    }

    // ---------- 4) Applications (candidatures.js) ----------
    private Map<Integer, Candidature> creerCandidatures(Map<Integer, ProjetStage> projets) {
        Map<Integer, Candidature> c = new HashMap<>();
        c.put(1, creerCandidature("Sirine Ben Salah", "sirine.bs@exemple.com", "2026-10-12",
                StatutCandidature.ACCEPTEE, true, "Ingénieur", projets.get(1),
                "Développement mobile", "Design UI/UX", "API REST"));
        c.put(2, creerCandidature("Rania Chaabane", "rania.ch@exemple.com", "2026-10-15",
                StatutCandidature.EN_ATTENTE, false, "Licence", projets.get(1),
                "Développement mobile", "Design UI/UX"));
        c.put(3, creerCandidature("Salma Hammami", "salma.h@exemple.com", "2026-10-18",
                StatutCandidature.REFUSEE, false, "Mastère", projets.get(1),
                "Design UI/UX"));
        c.put(4, creerCandidature("Mohamed Ali Fakhfakh", "ma.fakhfakh@exemple.com", "2026-10-11",
                StatutCandidature.ACCEPTEE, false, "Mastère", projets.get(2),
                "Python", "Oracle", "Data visualisation"));
        c.put(5, creerCandidature("Omar Bouzid", "omar.b@exemple.com", "2026-10-20",
                StatutCandidature.EN_ATTENTE, false, "Ingénieur", projets.get(2),
                "Python"));
        c.put(6, creerCandidature("Wassim Elloumi", "w.elloumi@exemple.com", "2026-10-14",
                StatutCandidature.EN_ATTENTE, false, "Licence", projets.get(3),
                "Java", "Spring Boot"));
        c.put(7, creerCandidature("Ines Zouari", "ines.z@exemple.com", "2026-10-22",
                StatutCandidature.EN_ATTENTE, false, "Mastère", projets.get(3),
                "Java", "MySQL"));
        c.put(8, creerCandidature("Aziz Sellami", "aziz.s@exemple.com", "2026-10-25",
                StatutCandidature.EN_ATTENTE, false, "Mastère", projets.get(4),
                "Design UI/UX", "API REST"));
        return c;
    }

    // "String... comps" = any number of skill names (varargs)
    private Candidature creerCandidature(String nom, String email, String date,
                                         StatutCandidature statut, boolean emailEnvoye,
                                         String niveau, ProjetStage projet, String... comps) {
        Candidature c = new Candidature(nom, email, LocalDate.parse(date), projet, niveaux.get(niveau));
        c.setStatut(statut);
        c.setEmailEnvoye(emailEnvoye);
        for (String libelle : comps) {
            c.getCompetences().add(competences.get(libelle));
        }
        return candidatureRepository.save(c);
    }

    // ---------- 5) Conventions (conventions.js) ----------
    private void creerConventions(Map<Integer, Candidature> candidatures) {
        ConventionStage conv = new ConventionStage("01-1-2027", LocalDate.of(2026, 10, 30), candidatures.get(1));
        conv.setSigneDirecteur(true);
        conv.setSigneMentor(true);
        conventionRepository.save(conv);
    }
}