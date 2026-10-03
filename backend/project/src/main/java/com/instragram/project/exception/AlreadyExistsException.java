package com.instragram.project.exception;

/**
 * Throw when a requested resource already exists in the db <br>
 * 409 - Coflict
 */
public class AlreadyExistsException extends BaseException {

    public AlreadyExistsException(String message) {
        super(message);
    }

    /**
     * Re-declares {@link BaseException}'s cause-carrying constructor so callers can reach it.
     * Constructors are not inherited, so without this the {@code Throwable} could not be
     * passed through — losing the stack trace.
     */
    public AlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
