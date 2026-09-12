package com.instragram.project.exception;

/**
 * Thrown when the request's values sent are invalid <br>
 * Example: Email with no @ is invalid, throws BadRequestException <br>
 * 400 - Client Error - Bad Request
 *
 * @see GlobalExceptionHandler#handleBadRequest(BadRequestException)
 */
public class BadRequestException extends BaseException {

    public BadRequestException(String messageKey, Object... args) {
        super(messageKey, args);
    }

    public BadRequestException(String messageKey, Throwable cause, Object... args) {
        super(messageKey, cause, args);
    }
}
