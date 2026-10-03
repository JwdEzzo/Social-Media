package com.instragram.project.utils;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Used when the user violates one or more fields in a request body. <br>
 * Carries the error message for a single violated field. <br>
 * {@code String} field <br>
 * {@code String} message
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class FieldViolation {
    private String field;
    private String message;
}
