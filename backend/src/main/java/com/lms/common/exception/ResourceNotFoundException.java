package com.lms.common.exception;

/**
 * Thrown when a requested resource does not exist (or must be treated as
 * non-existent for the current user). Mapped to HTTP 404 by
 * {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
