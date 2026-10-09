package com.instragram.project.utils;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The error body for every failed request, rendered centrally by
 * {@code GlobalExceptionHandler} - controllers never build one.
 *
 * Successful responses are not wrapped: they carry their payload directly, because the status
 * line already reports success and an envelope would only add a level for clients to unwrap.
 * What HTTP cannot express on its own is per-field detail, which is why {@code errors} exists
 * and why this type is still worth having on the failure path.
 *
 * {@code boolean} success - always false <br>
 * {@code int} status - mirrors the HTTP status <br>
 * {@code String} message - omitted when the detail is entirely per-field <br>
 * {@code Map<String, List<String>>} errors - keyed by field; {@code _form} for the rest <br>
 * {@code T} data - unused on this path, kept so the type stays generic
 */
@Getter
@Setter
@NoArgsConstructor
public class ApiResponse<T>
{
	private boolean success;
	private int status;
	private T data;

	/**
	 * {@code NON_EMPTY} so a response that reports itself entirely through {@code errors} can
	 * leave this null and have the key drop out, rather than serializing {@code "message": null}.
	 */
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private String message;

	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private Map<String, List<String>> errors;

	public static <T> ApiResponse<T> error(int status, String message)
	{
		ApiResponse<T> res = new ApiResponse<>();
		res.success = false;
		res.status = status;
		res.message = message;
		return res;
	}

	/**
	 * An error carrying per-field detail. Used by both failed bean validation (400) and
	 * sign-up conflicts (409) so the client parses field errors the same way either way.
	 */
	public static <T> ApiResponse<T> withErrors(int status, String message, Map<String, List<String>> errors) {
		ApiResponse<T> res = error(status, message);
		res.errors = errors;
		return res;
	}

	public static <T> ApiResponse<T> validationError(String message, Map<String, List<String>> errors) {
		return withErrors(400, message, errors);
	}
}