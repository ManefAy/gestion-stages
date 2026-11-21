package tn.devtec.stages.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Class "Compte" of the diagram (login, mdp)
@Entity                      // this class is a table
@Table(name = "compte")      // name of the table in MySQL
@Getter
@Setter
@NoArgsConstructor           // empty constructor required by JPA
public class Compte {

    // Primary key, auto-increment in MySQL (1, 2, 3...)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unique = true → MySQL refuses two accounts with the same login
    @Column(nullable = false, unique = true, length = 50)
    private String login;

    // ⚠️ For now in clear text. In Step 7 it will be HASHED with BCrypt.
    @Column(nullable = false)
    private String mdp;

    // STRING → MySQL stores the text "MENTOR" (not a number), see the quick check
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;

    // false = account disabled by the admin (can't log in)
    @Column(nullable = false)
    private boolean actif = true;

    // Convenience constructor to create an account in one line
    public Compte(String login, String mdp, Role role) {
        this.login = login;
        this.mdp = mdp;
        this.role = role;
    }
}