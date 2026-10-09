import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ApiError } from "@/api/public/baseApi";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Worked example - a 409 from POST /api/v1/users with two conflicts:
 * ```
 * fieldNames = ["username", "email", "password"]
 *
 * // already normalized by baseQueryWithReauth, so there is no envelope to unwrap
 * error = {
 *   status: 409,
 *   message: "Registration conflict",
 *   fieldErrors: {
 *     email:    ["An account with the email 'ezzjawad@hotmail.com' already exists."],
 *     username: ["The username 'admin123' is already taken."],
 *   },
 * }
 *
 * // 1. turn fieldErrors into [key, messages] pairs to loop over
 * Object.entries(fieldErrors) = [
 *   ["email",    ["An account with the email 'ezzjawad@hotmail.com' already exists."]],
 *   ["username", ["The username 'admin123' is already taken."]],
 * ]
 *
 * // 2. pass 1 - "email" is in fieldNames, so it goes on the input
 * form.setError("email", { message: "An account with the email 'ezzjawad@hotmail.com' already exists." })
 * leftover = []
 *
 * // 3. pass 2 - "username" is in fieldNames too
 * form.setError("username", { message: "The username 'admin123' is already taken." })
 * leftover = []
 *
 * // 4. nothing left over, and fieldErrors was not empty -> no banner
 * ```
 *
 * Had the response also carried `_form: ["Registration is closed."]`, that key is in no form,
 * so it would land in `leftover` and be set on `root.server` as the banner - while `email` and
 * `username` still show under their inputs.
 *
 * A failure with no fieldErrors at all (a 500, or the server being down) skips the loop and puts
 * `message` on the banner instead.
 *
 * @param error      the rejected value from an RTK Query `.unwrap()`, already shaped as an `ApiError`.
 * @param form       the form's `useForm()` return; errors go on its fields and on `root.server`.
 * @param fieldNames the names the form actually registers; anything outside this goes to the banner.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
  fieldNames: readonly string[],
) {
  const { message = "Something went wrong.", fieldErrors = {} } =
    error as Partial<ApiError>;
  const leftover: string[] = [];

  for (const [field, msgs] of Object.entries(fieldErrors)) {
    if (fieldNames.includes(field)) {
      form.setError(field as Path<T>, { message: msgs.join(" ") });
    } else {
      leftover.push(...msgs);
    }
  }

  // Show a banner if some messages had no matching input, or if there were no field errors at all.
  if (leftover.length > 0 || Object.keys(fieldErrors).length === 0) {
    form.setError("root.server", { message: leftover.join(" ") || message });
  }
}
