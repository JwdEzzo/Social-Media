package com.instragram.project.exception;

/**
 * Thrown when the request's values sent are invalid <br>
 * Example: Email with no @ is invalid, throws BadRequestException <br>
 * 400 - Client Error - Bad Request
 *
 * @see GlobalExceptionHandler#handleBadRequest(BadRequestException)
 */
public class BadRequestException extends BaseException {

	// The request field the problem is about, or null for a form-level error
	private final String field;

	public BadRequestException(String message) {
		super(message);
		this.field = null;
	}

	public BadRequestException(String message, Throwable cause) {
		super(message, cause);
		this.field = null;
	}

	// Ties the message to one input, so the form can show it under that field
	public BadRequestException(String field, String message) {
		super(message);
		this.field = field;
	}

	public String getField() {
		return field;
	}
}
