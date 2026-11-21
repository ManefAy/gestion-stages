package tn.devtec.stages.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Class "ProjetStage" of the diagram (titre, dateDebut, dateFin, objectifs)
@Entity
@Table(name = "projet_stage")
@Getter
@Setter
@NoArgsConstructor
public class ProjetStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titre;

    // LocalDate (date without time) → MySQL type DATE
    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    // One objective per line (same format as the React textarea)
    // TEXT = long text in MySQL (VARCHAR is limited)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String objectifs;

    // ---------- Mentor 1 —— 0..* ProjetStage ----------
    // optional = false → every project MUST have a mentor (the "1")
    @ManyToOne(optional = false)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Mentor mentor;

    // ---------- ProjetStage 0..* —— 1..* NiveauEtudes ----------
    // Join table: projet_niveau(projet_id, niveau_id)
    // (the "1..*" = at least one level is checked in the service, Step 4)
    @ManyToMany
    @JoinTable(
            name = "projet_niveau",
            joinColumns = @JoinColumn(name = "projet_id"),         // column pointing to THIS class
            inverseJoinColumns = @JoinColumn(name = "niveau_id")   // column pointing to the OTHER class
    )
    private Set<NiveauEtudes> niveaux = new HashSet<>();

    // ---------- Compétence via association class CompetenceProjet (poids) ----------
    // The weights belong to the project's definition → cascade + orphanRemoval
    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompetenceProjet> competences = new ArrayList<>();

    // ---------- Composition ◆ ProjetStage —— 0..* Tâche ----------
    // cascade ALL + orphanRemoval = a task lives and dies with its project
    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tache> taches = new ArrayList<>();

    public ProjetStage(String titre, LocalDate dateDebut, LocalDate dateFin, String objectifs, Mentor mentor) {
        this.titre = titre;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.objectifs = objectifs;
        this.mentor = mentor;
    }

    // ---------- Helper methods: keep BOTH sides of the relationship in sync ----------
    // In a two-way relationship, Java doesn't link the two sides for us:
    // adding the task to the list is not enough, the task must also know its project
    // (it's the TASK that holds the foreign key projet_id).

    public void ajouterTache(String libelle) {
        Tache tache = new Tache(libelle, this); // the task knows its project
        this.taches.add(tache);                 // the project knows its task
    }

    public void ajouterCompetence(Competence competence, int poids) {
        CompetenceProjet cp = new CompetenceProjet(this, competence, poids);
        this.competences.add(cp);
    }
}