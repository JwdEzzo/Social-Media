package com.instragram.project.exception;

/**
 * The BaseException class serves as a foundational exception type for the application. <br>
 * It extends {@link RuntimeException} and carries the message that is returned to the client. <BR>
 * All custom exceptions extends BaseException.
 */
public class BaseException extends RuntimeException {

	public BaseException(String message) {
		super(message);
	}

	public BaseException(String message, Throwable cause) {
		super(message, cause);
	}
}
