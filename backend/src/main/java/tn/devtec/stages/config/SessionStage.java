package tn.devtec.stages.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

// The current session, read from application.properties
// (catalogue published in January or June, with a deadline for applications)
@Component
public class SessionStage {

    // @Value("${key}") = Spring copies the property's value into the field at startup
    @Value("${stages.session.mois}")
    private int mois;

    @Value("${stages.session.annee}")
    private int annee;

    // Read as text, converted to a date in getDateLimite()
    @Value("${stages.session.date-limite}")
    private String dateLimite;

    public int getMois() {
        return mois;
    }

    public int getAnnee() {
        return annee;
    }

    public LocalDate getDateLimite() {
        return LocalDate.parse(dateLimite); // "2026-11-30" → LocalDate
    }

    // Method estOuverte() of the Session: today <= deadline ?
    public boolean estOuverte() {
        return !LocalDate.now().isAfter(getDateLimite());
    }

    // End of the convention numbers of this session: "-1-2027"
    public String suffixeConvention() {
        return "-" + mois + "-" + annee;
    }
}