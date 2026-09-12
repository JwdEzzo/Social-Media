package com.instragram.project.exception;

/**
 * Thrown when a requested resource cannot be located in the db
 * This exception carries a message key rather than a literal message so that {@code GlobalExceptionHandler} can resolve a locale-specific message via
 * {@code MessageSource} before returning the error to the client. <br>
 * It is translated to an HTTP {@code 404 Not Found} response.
 * getMessageKey() returns the key used to look up the localized error message. <br>
 * getArgs() returns the arguments to substitute into the resolved message template
 *
 * @see GlobalExceptionHandler#handleNotFound(NotFoundException)
 */
public class NotFoundException extends BaseException {

    public NotFoundException(String messageKey, Object... args) {
        super(messageKey, args);
    }

    /**
     * Re-declares {@link BaseException}'s cause-carrying constructor so callers can reach it.
     * Constructors are not inherited, so without this the {@code Throwable} would be swallowed
     * into {@code args} as an ordinary {@code Object} — losing the stack trace and shifting
     * every {@code {0}}, {@code {1}} placeholder in the resolved message by one position.
     */
    public NotFoundException(String messageKey, Throwable cause, Object... args) {
        super(messageKey, cause, args);
    }
}
