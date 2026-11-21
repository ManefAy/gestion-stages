package tn.devtec.stages.entity;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Class "Candidature" of the diagram (nomCandidate, email, dateCandidature, statut, /score)
@Entity
@Table(name = "candidature")
@Getter
@Setter
@NoArgsConstructor
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nomCandidate;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private LocalDate dateCandidature;

    // Every new application starts "en attente"
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;

    // Has the acceptance email been sent? (case study: "envoie un email d'acceptation")
    @Column(nullable = false)
    private boolean emailEnvoye = false;

    // /score → NOT stored: derived attribute, calculated in the service (Step 4)

    // ---------- Candidature 0..* —— 1 ProjetStage ----------
    // NO cascade: deleting an application must NEVER delete the project
    @ManyToOne(optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private ProjetStage projet;

    // ---------- Candidature 0..* —— 1 NiveauEtudes ----------
    @ManyToOne(optional = false)
    @JoinColumn(name = "niveau_id", nullable = false)
    private NiveauEtudes niveau;

    // ---------- Candidature 0..* —— 1..* Compétence ----------
    // Join table candidature_competence (no attribute on the link → plain @ManyToMany)
    @ManyToMany
    @JoinTable(
            name = "candidature_competence",
            joinColumns = @JoinColumn(name = "candidature_id"),
            inverseJoinColumns = @JoinColumn(name = "competence_id")
    )
    private Set<Competence> competences = new HashSet<>();

    public Candidature(String nomCandidate, String email, LocalDate dateCandidature,
                       ProjetStage projet, NiveauEtudes niveau) {
        this.nomCandidate = nomCandidate;
        this.email = email;
        this.dateCandidature = dateCandidature;
        this.projet = projet;
        this.niveau = niveau;
    }
}