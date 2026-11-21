package tn.devtec.stages.entity;

// The 3 roles of the system = the 3 actors that need an account
// (the Candidat has no account: "soumettre candidature" has no «include» s'authentifier)
public enum Role {
    ADMIN,
    RH,
    MENTOR
}