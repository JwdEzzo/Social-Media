package com.instragram.project.utils;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Used when the user violates one or more fields in a request body. <br>
 * Generates the error message for all violated fields. <br>
 * {@code String} field <br>
 * {@code String} messageKey <br>
 * {@code Object[]} args
 */
@NoArgsConstructor
@Setter
@Getter
public class FieldViolation {
    private String field;
    private String messageKey;
    private Object[] args;

    /**
     * Declared by hand rather than with {@code @AllArgsConstructor} so {@code args} stays varargs.
     */
    public FieldViolation(String field, String messageKey, Object... args) {
        this.field = field;
        this.messageKey = messageKey;
        this.args = args;
    }
}
