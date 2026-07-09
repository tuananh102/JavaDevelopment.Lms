package com.lms.common.exception;

/**
 * Thrown when a request conflicts with the current state of a resource
 * (duplicate key, already-enrolled, delete blocked by dependent rows). Mapped
 * to HTTP 409 by {@link GlobalExceptionHandler}.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
