/**
 * The formal version of the map above. Narrowing on `status` picks a branch.
 * Exported for reference; importing it is optional.
 */
export type AppRequestError =
  | { status: number; data: unknown }
  | { status: "FETCH_ERROR"; error: string }
  | { status: "TIMEOUT_ERROR"; error: string }
  | {
      status: "PARSING_ERROR";
      originalStatus: number;
      data: string;
      error: string;
    }
  | { status: "CUSTOM_ERROR"; error: string }
  | { name?: string; message?: string; stack?: string; code?: string };

/**
 * ============================================================================
 *  A MAP OF EVERY ERROR SHAPE THIS APP CAN RECEIVE
 * ============================================================================
 *
 * Reference only - nothing has to import this file.
 *
 * ---------------------------------------------------------------------------
 *  THE ONE CHECK THAT SPLITS EVERYTHING: typeof error.status
 * ---------------------------------------------------------------------------
 *
 *   typeof error.status === "number"   ->  the backend answered.
 *                                          error.data is your ApiResponse.
 *
 *   typeof error.status === "string"   ->  the backend never answered, or its
 *                                          answer could not be read.
 *                                          There is no ApiResponse. Usually no
 *                                          error.data at all.
 *
 * Everything below is just the detail of those two cases.
 *
 *
 * ===========================================================================
 *  FAMILY 1 - THE BACKEND ANSWERED  (status is a number)
 * ===========================================================================
 *
 * Every one of these comes from GlobalExceptionHandler. They always carry
 * `success: false`, a numeric `status`, and `data: null`.
 *
 * Two keys are OPTIONAL, because @JsonInclude(NON_EMPTY) drops them when empty:
 *   - `message`  omitted if null
 *   - `errors`   omitted if there is no per-field detail
 *
 *
 * --- 1a. Message only (the common case) ------------------------------------
 *
 *   {
 *     "success": false,
 *     "status": 401,
 *     "data": null,
 *     "message": "The credentials provided are not valid."
 *   }
 *
 *   Thrown by:
 *     400  BadRequestException              resubmitting your current email/username
 *     400  HttpMessageNotReadable           malformed JSON body
 *     400  MissingServletRequestParameter   a required query param was absent
 *     400  MethodArgumentTypeMismatch       /users/id/abc where a number is required
 *     401  UnauthorizedException            bad login  (+ WWW-Authenticate header)
 *     401  AccessDenied, not logged in      @PreAuthorize denied an anonymous caller
 *     403  ForbiddenException               acting on another account
 *     403  AccessDenied, logged in          @PreAuthorize denied a real caller
 *     404  NotFoundException                no such user/post/comment
 *     404  NoResourceFoundException         URL matches no controller
 *     405  HttpRequestMethodNotSupported    POST to a GET-only endpoint
 *     409  AlreadyExistsException           ONE thing taken (username or email)
 *     500  Exception (catch-all)            anything unplanned
 *
 *
 * --- 1b. Message + per-field detail ----------------------------------------
 *
 *   {
 *     "success": false,
 *     "status": 400,
 *     "data": null,
 *     "message": "Validation failed for one or more fields.",
 *     "errors": {
 *       "username": ["must be at least 6 characters"],
 *       "password": ["must not be blank"],
 *       "_form":    ["passwords do not match"]      <- not tied to one field
 *     }
 *   }
 *
 *   Only two handlers produce `errors`:
 *     400  MethodArgumentNotValidException  failed @Valid bean validation
 *     409  ConflictException                username AND email both taken
 *
 *   A field maps to an ARRAY, because one field can fail several rules at once.
 *   The `_form` key is the bucket for violations that belong to no single field.
 *
 *
 * ===========================================================================
 *  FAMILY 2 - NO USABLE ANSWER  (status is a string)
 * ===========================================================================
 *
 * These are produced by RTK Query itself, not by your backend. Your envelope
 * is nowhere in them, so reading `error.data.message` gives `undefined`.
 *
 *
 * --- 2a. FETCH_ERROR - the request never arrived ---------------------------
 *
 *   { "status": "FETCH_ERROR", "error": "TypeError: Failed to fetch" }
 *
 *   Spring Boot not running, restarted mid-click, laptop woke from sleep,
 *   CORS preflight rejected, DNS failed. No `data` key whatsoever.
 *   THIS IS THE COMMON ONE IN DEVELOPMENT.
 *
 *
 * --- 2b. TIMEOUT_ERROR - gave up waiting -----------------------------------
 *
 *   { "status": "TIMEOUT_ERROR", "error": "AbortError: signal is aborted" }
 *
 *   Only when an endpoint sets `timeout`. No `data` key.
 *
 *
 * --- 2c. PARSING_ERROR - answered, but not with JSON -----------------------
 *
 *   {
 *     "status": "PARSING_ERROR",
 *     "originalStatus": 200,
 *     "data": "<!DOCTYPE html><html>...",     <- a STRING, not an object
 *     "error": "SyntaxError: Unexpected token <"
 *   }
 *
 *   Note the trap: `data` EXISTS here but is a string. That is why a bare
 *   `error.data.message` is unsafe even when `data` is present.
 *
 *
 * --- 2d. CUSTOM_ERROR ------------------------------------------------------
 *
 *   { "status": "CUSTOM_ERROR", "error": "..." }
 *
 *   Only if a baseQuery hands one back deliberately. baseQueryWithReauth
 *   does not, so this should never appear today.
 *
 *
 * ===========================================================================
 *  FAMILY 3 - THE ODD ONE OUT: SerializedError
 * ===========================================================================
 *
 *   { "name": "TypeError", "message": "...", "stack": "...", "code": "..." }
 *
 *   Not an HTTP failure at all - a JS exception thrown inside the request
 *   pipeline (a `transformResponse` that threw, for instance). No `status`,
 *   no `data`. A hook's `error` is typed `FetchBaseQueryError | SerializedError`
 *   because of this case.
 *
 *
 * ===========================================================================
 *  TWO THINGS THAT WOULD ADD SHAPES LATER
 * ===========================================================================
 *
 * 1. Spring's DEFAULT error body - not reachable today:
 *
 *      { "timestamp": "...", "status": 401, "error": "Unauthorized",
 *        "path": "/api/instagram/users" }
 *
 *    @RestControllerAdvice only catches what is thrown INSIDE the dispatcher.
 *    Right now SecurityConfig is `anyRequest().permitAll()` and all access
 *    control runs through @PreAuthorize, which IS inside the dispatcher - so
 *    every denial reaches GlobalExceptionHandler and gets the envelope.
 *    Harden that to `anyRequest().authenticated()` and denials move to the
 *    filter chain, skip the advice, and start arriving in the shape above.
 *    The fix then is an authenticationEntryPoint that writes an ApiResponse.
 *
 * 2. Spring MVC exceptions with no handler of their own (415 unsupported
 *    media type, for one) fall through to the `Exception` catch-all, so they
 *    arrive as a generic 500 rather than their natural 4xx.
 *
 *
 * ===========================================================================
 *  READING ONE SAFELY - the order that matters
 * ===========================================================================
 *
 *   1. status is a string?            -> Family 2. Show a connection message.
 *   2. data is not a plain object?    -> PARSING_ERROR. Show a generic message.
 *   3. data.message exists?           -> show it. This is the normal path.
 *   4. data.errors exists?            -> optional: route each onto its input.
 *   5. otherwise                      -> a hardcoded fallback.
 *
 * Checking in that order is what stops `undefined` reaching the screen.
 */
