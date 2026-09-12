package com.instragram.project.exception;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.instragram.project.utils.ApiResponse;
import com.instragram.project.utils.FieldViolation;

import lombok.extern.log4j.Log4j2;

@RestControllerAdvice
@Log4j2
public class GlobalExceptionHandler {

   private final MessageSource messageSource;

   public GlobalExceptionHandler(MessageSource messageSource) {
      this.messageSource = messageSource;
   }

   /**
    * Resolves a message key for the current request's locale. <br>
    * Missing keys fall back to the key itself, because {@code LocaleConfig} sets {@code useCodeAsDefaultMessage(true)}.
    */
	private String resolve(String key, Object[] args) {
		Locale locale = LocaleContextHolder.getLocale();
		return messageSource.getMessage(key, args, locale);
	}

   /**
	 * The Client hits an endpoint to get a user. <br>
	 * User doesn't exist in the database <br>
	 * Throws a NotFoundException <br>
     * {@code 404} - client error.
	*/
	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException ex) {
		String msg = resolve(ex.getMessageKey(), ex.getArgs());
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
							 .body(ApiResponse.error(404, msg));
	}

	/**
	 * The Client hits an endpoint to create a user. <br>
	 * User already exists in the database <br>
	 * Throws a AlreadyExistsException <br>
     * {@code 409} - client error.
	 */
	@ExceptionHandler(AlreadyExistsException.class)
	public ResponseEntity<ApiResponse<Void>> handleAlreadyExists(AlreadyExistsException ex) {
		String msg = resolve(ex.getMessageKey(), ex.getArgs());
		return ResponseEntity.status(HttpStatus.CONFLICT)
							 .body(ApiResponse.error(409, msg));
	}

	/**
	 * The Client hits an endpoint whose request collides with more than one existing resource. <br>
	 * Example: User signs up with a username and an email that are both taken <br>
	 * Throws a ConflictException <br>
	 * {@code 409} - client error.
	 */
	@ExceptionHandler(ConflictException.class)
	public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex){
		// Step 1: Initialize the errors map to collect field-specific violations.
		Map<String, List<String>> errors = new LinkedHashMap<>();
	
		// Step 2: Populate the errors map with field-specific violations.
		for (FieldViolation violation : ex.getViolations()) {
			List<String> messages = errors.computeIfAbsent(violation.getField(), field -> new ArrayList<>());
			messages.add(resolve(violation.getMessageKey(), violation.getArgs()));
		}
	
		// Step 3: Log the warning and return the response.
		log.warn("Conflict [{}] on: {}", ex.getMessageKey(), errors.keySet());
	
		return ResponseEntity.status(HttpStatus.CONFLICT)
							 .body(ApiResponse.withErrors(409, errors));
	}

	/**
	 * The Client hits an endpoint with values that cannot be acted on. <br>
	 * Re-submitting the current email, username or password as a change <br>
	 * Throws a BadRequestException <br>
     * {@code 400} - client error.
	 */
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
		String msg = resolve(ex.getMessageKey(), ex.getArgs());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
							 .body(ApiResponse.error(400, msg));
	}

	/**
	 * The Client is authenticated, but acts on a resource they shouldn't <br>
	 * Editing or deleting another user's account <br>
	 * Throws a ForbiddenException <br>
     * {@code 403} - client error.
	 */
	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
		String msg = resolve(ex.getMessageKey(), ex.getArgs());
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
							 .body(ApiResponse.error(403, msg));
	}

	/**
	 * The Client has not proven who they are. <br>
	 * Signing in with a wrong username or password <br>
	 * Throws an UnauthorizedException <br>
     * {@code 401} - client error.
	 */
	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
		String msg = resolve(ex.getMessageKey(), ex.getArgs());
		return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.header(HttpHeaders.WWW_AUTHENTICATE, "Bearer")
				.body(ApiResponse.error(401, msg));
	}

	/**
	 * The Client is denied by method security, from a failed {@code @PreAuthorize} check. <br>
	 * This exception covers two different situations, so the status depends on who is calling:
	 * 1) an anonymous caller was never authenticated ({@code 401}), while a real one is authenticated but not permitted here ({@code 403}). <br>
	 * 2) any other access denial not covered by the above. <br>
	 * Caught as the parent {@code AccessDeniedException} so it also covers denials that are not
	 * the {@code AuthorizationDeniedException} subtype. <br>
	 * This reaches the advice at all, rather than Spring Security's ExceptionTranslationFilter,
	 * because method security runs inside the dispatcher - after the filter chain has already
	 * passed the request through.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		boolean anonymous = auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken;

		if (anonymous) {
			log.warn("Unauthenticated request denied: {}", ex.getMessage());
			return ResponseEntity
					.status(HttpStatus.UNAUTHORIZED)
					.header(HttpHeaders.WWW_AUTHENTICATE, "Bearer")
					.body(ApiResponse.error(401, resolve("error.authentication.required", null)));
		}

		log.warn("Access denied for '{}': {}", auth.getName(), ex.getMessage());
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
							 .body(ApiResponse.error(403, resolve("error.forbidden", null)));
	}

	/**
	 * The Client sends a body Jackson cannot parse
	 * Example: malformed JSON, a stray/missing comma, or a value of the wrong type. <br>
	 * {@code 400} - client error.
	 */
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Void>> handleUnreadableMessage(HttpMessageNotReadableException ex) {
		log.warn("Malformed request body: {}", ex.getMostSpecificCause().getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(400, resolve("error.malformed_body", null)));
	}

	/**
	 * The Client sends a well-formed body that fails {@code @Valid} bean validation <br>
	 * Example: renaming {@code password} to {@code passwor}. <br>
	 * This leaves the real field null and {@code @NotBlank} rejects it <br>
	 * Every failed field's message is collected so the caller sees all problems at once. <br>
	 * {@code 400} - client error.
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {

		Map<String, List<String>> errors = ex.getBindingResult()
											 .getFieldErrors()
											 .stream()
				.collect(Collectors.groupingBy(FieldError::getField, LinkedHashMap::new,
						Collectors.mapping(DefaultMessageSourceResolvable::getDefaultMessage,
											Collectors.toList())));

		List<String> global = ex.getBindingResult()
								.getGlobalErrors()
								.stream()
								.map(DefaultMessageSourceResolvable::getDefaultMessage)
								.toList();

		if (!global.isEmpty()) errors.put("_form", global);
		log.warn("Validation failed: {}", errors);
		
		return ResponseEntity.badRequest()
				.body(ApiResponse.validationError(resolve("error.validation", null), errors));
	}

	/**
	 * The Client omits a required query/form parameter entirely. <br>
	 * Safe to tell the user the error that occured, it helps the user to send what we need. <br>
	 * {@code 400} - client error.
	 */
	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex) {
		log.warn("Missing request parameter: {}", ex.getParameterName());
		String msg = resolve("error.param.missing", new Object[] { ex.getParameterName() });
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, msg));
	}

	/**
	 * The Client sends a parameter whose value cannot be converted to the expected type. <br>
	 * Example : {@code /users/abc} where a numeric id is required. <br>
	 * {@code 400} - client error.
	 */
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
		log.warn("Type mismatch for parameter '{}': value [{}] could not be converted to {}",
				ex.getName(), ex.getValue(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "?");
		String msg = resolve("error.param.type_mismatch", new Object[] { ex.getName() });
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(400, msg));
	}

	/**
	 * Handles the case when a URL is not found. <br>
	 * User hits a URL that does not correspond to any defined controller endpoint. <br>
	 * {@code 404} - client error.
	 */
	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiResponse<Void>> handleNoResourceFound(NoResourceFoundException ex) {
		log.warn("Resource not found: {}", ex.getMessage());
		String msg = resolve("error.resource.notfound", new Object[] { ex.getMessage() });
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(404, msg));
	}

	/**
	 * Handles the case when an HTTP method is not supported for a given endpoint. <br>
	 * {@code 405} - client error.
	 */
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
		log.warn("Http Method type not supported: {}", ex.getMethod());
		String msg = resolve("error.method.notsupported", new Object[] { ex.getMethod() });
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(ApiResponse.error(405, msg));
	}

	/**
	 * Handle any unhandled exceptions that occur during request processing. <br>
	 * Logs the exception and returns a generic 500 Internal Server Error response. <br>
	 * {@code 500} - server error.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
		log.error("Unhandled exception", ex);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(500, resolve("error.internal", null)));
	}
}
