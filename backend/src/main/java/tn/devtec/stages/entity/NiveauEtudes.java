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

// Class "NiveauEtudes" of the diagram (niveau)
// A CLASS (not an enum) in the teacher's diagram: projects and applications link to it
@Entity
@Table(name = "niveau_etudes")
@Getter
@Setter
@NoArgsConstructor
public class NiveauEtudes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "Licence", "Mastère", "Ingénieur"
    @Column(nullable = false, unique = true, length = 30)
    private String niveau;

    public NiveauEtudes(String niveau) {
        this.niveau = niveau;
    }
}