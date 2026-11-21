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

// Class "AgentRH" of the diagram (nom)
@Entity
@Table(name = "agent_rh")
@Getter
@Setter
@NoArgsConstructor
public class AgentRH {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    // AgentRH 0..1 —— 1 Compte
    // @JoinColumn = the foreign key column "compte_id" is in THIS table (agent_rh)
    @OneToOne(optional = false)
    @JoinColumn(name = "compte_id", nullable = false, unique = true)
    private Compte compte;

    public AgentRH(String nom, Compte compte) {
        this.nom = nom;
        this.compte = compte;
    }
}