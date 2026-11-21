package tn.devtec.stages.exception;

// "This action breaks a business rule" → will become HTTP 400 (Step 5)
// e.g. "Ce projet n'accepte pas le niveau Mastère", "Date limite dépassée"...
public class RegleMetierException extends RuntimeException {

    public RegleMetierException(String message) {
        super(message);
    }
}