package tn.devtec.stages.entity;

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

// Class "Mentor" of the diagram (nom, specialite)
// + personal information required by the case study (email, téléphone, adresse)
@Entity
@Table(name = "mentor")
@Getter
@Setter
@NoArgsConstructor
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String specialite;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(length = 150)
    private String adresse;

    // Mentor 0..1 —— 1 Compte
    // ⚠️ nullable here (unlike AgentRH): in our interface the RH can add a mentor
    // BEFORE the admin creates his account ("Compte à créer").
    // The diagram's "1" is reached once the admin has created the account.
    @OneToOne
    @JoinColumn(name = "compte_id", unique = true)
    private Compte compte;

    public Mentor(String nom, String specialite, String email, String telephone, String adresse) {
        this.nom = nom;
        this.specialite = specialite;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;
    }
}