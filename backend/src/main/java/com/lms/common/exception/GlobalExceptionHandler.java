package com.lms.common.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<?> handleForbidden(ForbiddenException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<?> handleConflict(ConflictException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException ex, WebRequest request) {
        // A unique/foreign-key constraint was hit (duplicate slug/email, delete blocked
        // by dependent rows, enrollment race). Report as a conflict, not a 500, and don't
        // leak the underlying SQL to the client.
        log.warn("Data integrity violation on {}: {}", request.getDescription(false), ex.getMostSpecificCause().getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "The request conflicts with existing data. Please check for duplicates and try again.",
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        // Wrong email/password (BadCredentialsException) and other auth failures.
        // Return a generic 401 — do NOT echo ex.getMessage() ("Bad credentials"),
        // and do NOT reveal whether the account exists or is disabled.
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid email or password",
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Access Denied",
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            // Field-level errors carry a field name; class-level (global) constraints
            // are plain ObjectErrors — keying them by object name avoids a ClassCastException.
            String key = (error instanceof FieldError fieldError)
                    ? fieldError.getField()
                    : error.getObjectName();
            errors.put(key, error.getDefaultMessage());
        });

        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                request.getDescription(false),
                errors
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request) {
        // Log the real cause server-side, but never leak internal exception text
        // (e.g. JWT library errors, stack details) to the client.
        log.error("Unhandled exception on {}", request.getDescription(false), ex);
        ErrorResponse errorResponse = new ErrorResponse(
                OffsetDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please try again later.",
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private OffsetDateTime timestamp;
        private int status;
        private String message;
        private String path;
        private Map<String, String> validationErrors;

        public ErrorResponse(OffsetDateTime timestamp, int status, String message, String path) {
            this.timestamp = timestamp;
            this.status = status;
            this.message = message;
            this.path = path;
        }
    }
}
