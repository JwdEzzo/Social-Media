package com.instragram.project.exception;

/**
 * The BaseException class serves as a foundational exception type for the application, and handles errors with localized messages. <br>
 * It extends {@link RuntimeException} and includes a message key and optional arguments for dynamic message formatting. <BR>
 * All custom exceptions extends BaseException.
 */
public class BaseException extends RuntimeException {
	private final String messageKey;
	private final Object[] args;

	public BaseException(String messageKey, Object... args) {
		super(messageKey);
		this.messageKey = messageKey;
		this.args = args;
	}

	public BaseException(String messageKey, Throwable cause, Object... args) {
		super(messageKey, cause);
		this.messageKey = messageKey;
		this.args = args;
	}

	public String getMessageKey() {
		return messageKey;
	}

	public Object[] getArgs() {
		return args;
	}
}
