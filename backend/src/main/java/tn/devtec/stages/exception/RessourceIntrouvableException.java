package tn.devtec.stages.exception;

// "The thing you asked for doesn't exist" → will become HTTP 404 (Step 5)
// RuntimeException (unchecked): no need to declare "throws" everywhere,
// AND @Transactional automatically cancels (rollback) on a RuntimeException
public class RessourceIntrouvableException extends RuntimeException {

    public RessourceIntrouvableException(String message) {
        super(message);
    }
}