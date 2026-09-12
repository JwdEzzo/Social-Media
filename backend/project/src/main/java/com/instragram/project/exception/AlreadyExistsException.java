package com.instragram.project.exception;

/**
 * Throw when a requested resource already exists in the db <br>
 * 409 - Coflict
 */
public class AlreadyExistsException extends BaseException {

    public AlreadyExistsException(String messageKey, Object... args) {
        super(messageKey, args);
    }

    /**
     * Re-declares {@link BaseException}'s cause-carrying constructor so callers can reach it.
     * Constructors are not inherited, so without this the {@code Throwable} would be swallowed
     * into {@code args} as an ordinary {@code Object} — losing the stack trace and shifting
     * every {@code {0}}, {@code {1}} placeholder in the resolved message by one position.
     */
    public AlreadyExistsException(String messageKey, Throwable cause, Object... args) {
        super(messageKey, cause, args);
    }
}
