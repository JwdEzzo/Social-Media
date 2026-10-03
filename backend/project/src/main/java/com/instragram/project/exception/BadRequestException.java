package com.instragram.project.exception;

/**
 * Thrown when the request's values sent are invalid <br>
 * Example: Email with no @ is invalid, throws BadRequestException <br>
 * 400 - Client Error - Bad Request
 *
 * @see GlobalExceptionHandler#handleBadRequest(BadRequestException)
 */
public class BadRequestException extends BaseException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
