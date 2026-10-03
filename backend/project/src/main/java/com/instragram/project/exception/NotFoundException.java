package com.instragram.project.exception;

/**
 * Thrown when a requested resource cannot be located in the db <br>
 * It is translated to an HTTP {@code 404 Not Found} response by
 * {@code GlobalExceptionHandler}, which returns getMessage() to the client.
 *
 * @see GlobalExceptionHandler#handleNotFound(NotFoundException)
 */
public class NotFoundException extends BaseException {

    public NotFoundException(String message) {
        super(message);
    }

    /**
     * Re-declares {@link BaseException}'s cause-carrying constructor so callers can reach it.
     * Constructors are not inherited, so without this the {@code Throwable} could not be
     * passed through — losing the stack trace.
     */
    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
