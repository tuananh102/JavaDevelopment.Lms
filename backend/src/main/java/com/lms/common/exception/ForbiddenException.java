package com.lms.common.exception;

/**
 * Thrown when the authenticated user is not allowed to perform an action on a
 * resource they can otherwise see (ownership/authorization failure). Mapped to
 * HTTP 403 by {@link GlobalExceptionHandler}.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
