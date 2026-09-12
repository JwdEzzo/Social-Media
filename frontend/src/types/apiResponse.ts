/**
 * Per-field detail carried by validation (400) and conflict (409) responses.
 * Keyed by field name; `_form` holds violations that belong to no single field.
 */
export type FieldErrors = Record<string, string[]>;

/** Mirrors `ApiResponse.success(data, message)`. */
export interface ApiSuccessResponse<T> {
  success: true;
  status: number;
  data: T;
  message?: string;
  errors?: never;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  data: null;
  message?: string;
  errors?: FieldErrors;
}

/**
 * Discriminated on `success`, so a check on that field narrows `data` to `T`
 * without a cast:
 *
 * ```ts
 * const { data: body } = await api.get<ApiResponse<GetUserResponseDto>>(`/users/${id}`);
 * if (body.success) body.data.username; // GetUserResponseDto
 * else body.errors?.username;           // string[] | undefined
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
