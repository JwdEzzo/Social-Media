/**
 * Per-field detail carried by validation (400) and conflict (409) responses.
 * Keyed by field name; `_form` holds violations that belong to no single field.
 */
export type FieldErrors = Record<string, string[]>;

/**
 * The body of any failed request, as `GlobalExceptionHandler` renders it. Reach it through
 * a hook's `error.data`, or the `error` of a `catch` around `.unwrap()`.
 *
 * There is deliberately no success counterpart: successful responses are not enveloped, so
 * an endpoint's result type is its payload (`LoginResponse`, `PagedModel<GetUserResponseDto>`)
 * and needs no `transformResponse`.
 *
 * Note that a failure is not guaranteed to take this shape - a backend that never answered
 * yields `{ status: "FETCH_ERROR" }` with no `data` at all, so guard before reading `message`.
 */
export interface ApiErrorResponse {
  success: false;
  status: number;
  data: null;
  message?: string;
  errors?: FieldErrors;
}

/** Page metadata as `org.springframework.data.web.PagedModel` serializes it. */
export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Mirrors `PagedModel<T>`, which paginated endpoints return as their whole body.
 * Use it directly as an endpoint's result type:
 *
 * ```ts
 * getUsers: builder.query<PagedModel<GetUserResponseDto>, PageArgs>({ ... })
 * ```
 */
export interface PagedModel<T> {
  content: T[];
  page: PageMetadata;
}
