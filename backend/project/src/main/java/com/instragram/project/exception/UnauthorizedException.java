package com.instragram.project.exception;

/**
 * The caller has not proven who they are. <br>
 * Bad login credentials, or a missing, expired or malformed token. <br>
 * Answers {@code 401}.
 * <p>
 * Despite the HTTP status being named "Unauthorized", 401 means <b>unauthenticated</b>:
 * the server does not know who is calling, so presenting valid credentials would change
 * the outcome. Once identity is established and the caller simply is not allowed to touch
 * the resource, use {@link ForbiddenException} instead.
 */
public class UnauthorizedException extends BaseException {

    public UnauthorizedException(String messageKey, Object... args) {
        super(messageKey, args);
    }

    public UnauthorizedException(String messageKey, Throwable cause, Object... args) {
        super(messageKey, cause, args);
    }
}
