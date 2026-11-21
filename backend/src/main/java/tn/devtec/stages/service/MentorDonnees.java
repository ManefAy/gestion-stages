package tn.devtec.stages.service;

// What the RH types in the mentor form (personal information required by the case study)
public record MentorDonnees(
        String nom,
        String specialite,
        String email,
        String telephone,
        String adresse) {
}