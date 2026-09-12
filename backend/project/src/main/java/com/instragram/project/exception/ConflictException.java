package com.instragram.project.exception;

import java.util.List;

import com.instragram.project.utils.FieldViolation;

/**
 * Throw when a request collides with more than one existing resource at once <br>
 * A sign-up whose username and email are both taken reports both, instead of only
 * whichever happened to be checked first. <br>
 * The inherited {@code messageKey} is the summary shown at the top level; the per-field
 * detail lives in {@link #getViolations()}. <br>
 * 409 - Conflict
 */
public class ConflictException extends BaseException {

    private final List<FieldViolation> violations;

    public ConflictException(String summaryKey, List<FieldViolation> violations) {
        super(summaryKey);
        this.violations = List.copyOf(violations);
    }

    public List<FieldViolation> getViolations() {
        return violations;
    }
}
