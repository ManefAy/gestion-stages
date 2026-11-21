package tn.devtec.stages.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Class "Tâche" of the diagram (libelle) — part of a ProjetStage (composition ◆)
@Entity
@Table(name = "tache")
@Getter
@Setter
@NoArgsConstructor
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String libelle;

    // The OWNING side of the relationship: the foreign key projet_id is in THIS table
    // nullable = false → a task without a project is impossible (composition)
    @ManyToOne(optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private ProjetStage projet;

    public Tache(String libelle, ProjetStage projet) {
        this.libelle = libelle;
        this.projet = projet;
    }
}