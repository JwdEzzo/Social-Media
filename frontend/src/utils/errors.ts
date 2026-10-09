import { clsx, type ClassValue } from "clsx";
import type { ApiErrorResponse, FieldErrors } from "@/types/api-response";
import { twMerge } from "tailwind-merge";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Reads the message out of a failed RTK Query request, whatever shape it arrived in. */

export function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    status?: number | string;
    data?: ApiErrorResponse | string;
  };

  // 1. No answer at all: server down, CORS rejected, DNS failed, or it timed out.
  if (err.status === "FETCH_ERROR" || err.status === "TIMEOUT_ERROR") {
    return "Cannot connect to server. Please try again later.";
  }

  // 2. Any other string status is PARSING_ERROR or CUSTOM_ERROR. PARSING_ERROR puts
  //    the raw unparsed body in `data` - usually an HTML page - so never show it.
  if (typeof err.status === "string") {
    return fallback;
  }

  // 3. A numeric status means GlobalExceptionHandler answered, so `data` is the
  //    envelope. The null check is for runtime, not types: typeof null is "object".
  if (typeof err.data === "object" && err.data !== null) {
    return err.data.message ?? fallback;
  }

  return fallback;
}

/**
 * Reads the per-field violations out of a failed request, which only a 400 validation or a
 * 409 conflict carries. Returns {} for every other failure, so callers can loop unconditionally.
 *
 * Keys are the backend's field names and `_form` for violations that belong to no single field;
 * matching them to form fields is the caller's job, since only it knows what its fields are.
 */
export function getFieldErrors(error: unknown): FieldErrors {
  const err = error as {
    status?: number | string;
    data?: ApiErrorResponse | string;
  };
  // A string status never reached the handler, so there is no envelope to read.
  if (typeof err.status !== "number") {
    return {};
  }
  if (typeof err.data !== "object" || err.data === null) {
    return {};
  }

  return err.data.errors ?? {};
}

/**
 * Shows a failed request's errors on a react-hook-form form, and returns what is left for the
 * form-level banner.
 *
 * Each violation keyed by one of `fieldNames` is set on that input. Anything else - `_form`, or
 * a field the form doesn't render - has no input to sit under, so it is returned for the banner
 * rather than dropped.
 *
 * The envelope's `message` only summarises what the field errors already say, so it is returned
 * only when nothing could be placed on a field. That includes every response without per-field
 * detail, such as a network failure or a 500, where it falls back to `fallback`.
 *
 * @returns the banner message, or null when every error is already shown under its input.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly string[],
  fallback: string,
): string | null {
  const unplaced: string[] = [];
  let placedAny = false;

  for (const [field, messages] of Object.entries(getFieldErrors(error))) {
    if (fieldNames.includes(field)) {
      setError(field as Path<T>, { message: messages.join(" ") });
      placedAny = true;
    } else {
      unplaced.push(...messages);
    }
  }

  if (unplaced.length > 0) return unplaced.join(" ");
  if (placedAny) return null;
  return getErrorMessage(error, fallback);
}
