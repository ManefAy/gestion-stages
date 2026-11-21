package tn.devtec.stages.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Class "Compétence" of the diagram (libellé)
// Reference data: "Python", "Oracle", "API REST"...
@Entity
@Table(name = "competence")
@Getter
@Setter
@NoArgsConstructor
public class Competence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unique → the same skill can't exist twice
    @Column(nullable = false, unique = true, length = 80)
    private String libelle;

    public Competence(String libelle) {
        this.libelle = libelle;
    }
}