package com.instragram.project.utils;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * {@code boolean} success <br>
 * {@code String} message <br>
 * {@code T} data <br>
 * {@code int} status <br>
 * {@code LocalDateTime} timestamp <br>
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

	public static <T> ApiResponse<T> success(T data, String message)
	{
		ApiResponse<T> res = new ApiResponse<>();
		res.success = true;
		res.data = data;
		res.message = message;
		res.status = 200;
		return res;
	}

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

	/**
	 * An error whose detail is per-field, with no message <br>
	 * The caller is advised to fix on each field.
	 */
	public static <T> ApiResponse<T> withErrors(int status, Map<String, List<String>> errors) {
		return withErrors(status, null, errors);
	}

	public static <T> ApiResponse<T> validationError(String message, Map<String, List<String>> errors) {
		return withErrors(400, message, errors);
	}
}