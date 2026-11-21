package tn.devtec.stages.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Association class "CompetenceProjet" of the diagram (poids)
// poids depends on BOTH the skill and the project → it lives on the link
@Entity
@Table(
        name = "competence_projet",
        // The same skill can't be added twice to the same project
        uniqueConstraints = @UniqueConstraint(columnNames = { "projet_id", "competence_id" })
)
@Getter
@Setter
@NoArgsConstructor
public class CompetenceProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Side 1: the project
    @ManyToOne(optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private ProjetStage projet;

    // Side 2: the skill
    @ManyToOne(optional = false)
    @JoinColumn(name = "competence_id", nullable = false)
    private Competence competence;

    // The attribute of the association class, between 1 and 5 (same as the React select)
    // @Min/@Max are checked by Hibernate Validator before saving
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private int poids;

    public CompetenceProjet(ProjetStage projet, Competence competence, int poids) {
        this.projet = projet;
        this.competence = competence;
        this.poids = poids;
    }
}