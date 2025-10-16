package com.instragram.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

      @ExceptionHandler(ResourceNotFoundException.class)
      public ResponseEntity<ErrorResponse> handleResourceNotFound(
                  ResourceNotFoundException ex,
                  HttpServletRequest request) {

            ErrorResponse error = new ErrorResponse(
                        null, HttpStatus.NOT_FOUND.value(),
                        "Not Found",
                        ex.getMessage(),
                        request.getRequestURI());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
      }

      @ExceptionHandler(AccessDeniedException.class)
      public ResponseEntity<ErrorResponse> handleAccessDenied(
                  AccessDeniedException ex,
                  HttpServletRequest request) {

            ErrorResponse error = new ErrorResponse(
                        null, HttpStatus.FORBIDDEN.value(),
                        "Access Denied",
                        "You don't have permission to access this resource",
                        request.getRequestURI());

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
      }

      @ExceptionHandler(BadCredentialsException.class)
      public ResponseEntity<ErrorResponse> handleBadCredentials(
                  BadCredentialsException ex,
                  HttpServletRequest request) {

            ErrorResponse error = new ErrorResponse(
                        null, HttpStatus.UNAUTHORIZED.value(),
                        "Authentication Failed",
                        "Invalid credentials provided",
                        request.getRequestURI());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
      }

      @ExceptionHandler(MethodArgumentNotValidException.class)
      public ResponseEntity<ErrorResponse> handleValidationException(
                  MethodArgumentNotValidException ex,
                  HttpServletRequest request) {

            ErrorResponse error = new ErrorResponse(
                        null, HttpStatus.BAD_REQUEST.value(),
                        "Validation Error",
                        "Invalid input data provided",
                        request.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
      }

      @ExceptionHandler(ConstraintViolationException.class)
      public ResponseEntity<ErrorResponse> handleConstraintViolation(
                  ConstraintViolationException ex,
                  HttpServletRequest request) {

            ErrorResponse error = new ErrorResponse(
                        null, HttpStatus.BAD_REQUEST.value(),
                        "Validation Error",
                        ex.getMessage(),
                        request.getRequestURI());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
      }

      @ExceptionHandler(Exception.class)
      public ResponseEntity<ErrorResponse> handleGenericException(
                  Exception ex,
                  HttpServletRequest request) {

            ErrorResponse error = new ErrorResponse(
                        null, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Internal Server Error",
                        "An unexpected error occurred",
                        request.getRequestURI());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
      }
}