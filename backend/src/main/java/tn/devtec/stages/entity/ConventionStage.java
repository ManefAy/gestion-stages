package tn.devtec.stages.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Class "ConventionStage" of the diagram (numero, dateCreation)
// + the 3 signatures given on the first day of the internship (case study)
@Entity
@Table(name = "convention_stage")
@Getter
@Setter
@NoArgsConstructor
public class ConventionStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique identifier required by the case study: "03-6-2026" (numéro-mois-année)
    // The surrogate key "id" stays the primary key; "numero" is a UNIQUE business identifier
    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false)
    private LocalDate dateCreation;

    @Column(nullable = false)
    private boolean signeDirecteur = false;

    @Column(nullable = false)
    private boolean signeMentor = false;

    @Column(nullable = false)
    private boolean signeStagiaire = false;

    // ---------- Candidature 1 —— 0..1 ConventionStage ----------
    // unique = true → one application can have AT MOST one convention (the "0..1")
    // nullable = false → a convention ALWAYS belongs to one application (the "1")
    // No mentor name stored: we navigate convention → candidature → projet → mentor
    @OneToOne(optional = false)
    @JoinColumn(name = "candidature_id", nullable = false, unique = true)
    private Candidature candidature;

    public ConventionStage(String numero, LocalDate dateCreation, Candidature candidature) {
        this.numero = numero;
        this.dateCreation = dateCreation;
        this.candidature = candidature;
    }
}