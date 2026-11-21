package tn.devtec.stages.service;

import tn.devtec.stages.entity.Role;

// What the admin types in the "Nouveau compte / Modifier le compte" form
public record CompteDonnees(
        Role role,               // RH or MENTOR (the holder type, {XOR})
        String nom,              // name of the holder
        String specialite,       // only for a MENTOR
        String login,
        String mdp,              // required when creating, optional when editing (empty = unchanged)
        boolean actif,
        Long mentorExistantId    // optional: link the account to an EXISTING mentor ("Compte à créer")
) {
}