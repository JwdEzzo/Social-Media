package com.instragram.project.exception;

/**
 * The caller is authenticated, but acts on a resource they do not own. <br>
 * Editing another user's comment, deleting another user's account, reading another user's notifications. <br>
 * Answers {@code 403}, not {@code 401}: the principal is already established, so re-sending
 * credentials would not change the outcome.
 * <p>
 * Prefer this over {@code org.springframework.security.access.AccessDeniedException} for checks
 * made inside a service. Spring's type is translated by the filter chain, which
 * {@code GlobalExceptionHandler} pre-empts; this one is handled like every other application error.
 */
public class ForbiddenException extends BaseException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}
