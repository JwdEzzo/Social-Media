package com.instragram.project.utils;

import java.sql.SQLException;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Reads the SQLState out of a {@link DataIntegrityViolationException}. <br>
 * SQLStates are SQL-standard codes, which keeps callers independent of the
 * constraint names Hibernate generates under {@code ddl-auto=update}. <br>
 * {@code 23505} unique violation <br>
 * {@code 23503} foreign key violation
 */
public final class SqlErrors {

	private static final String UNIQUE_VIOLATION = "23505";
	private static final String FOREIGN_KEY_VIOLATION = "23503";

	private SqlErrors() {
	}

	public static boolean isUniqueViolation(DataIntegrityViolationException e) {
		return UNIQUE_VIOLATION.equals(sqlState(e));
	}

	public static boolean isForeignKeyViolation(DataIntegrityViolationException e) {
		return FOREIGN_KEY_VIOLATION.equals(sqlState(e));
	}

	/**
	 * The SQLState of the driver's {@link SQLException} under the Spring and
	 * Hibernate wrappers, or {@code null} when the cause is not a SQLException.
	 */
	public static String sqlState(DataIntegrityViolationException e) {
		return NestedExceptionUtils.getMostSpecificCause(e) instanceof SQLException sql ? sql.getSQLState() : null;
	}
}
