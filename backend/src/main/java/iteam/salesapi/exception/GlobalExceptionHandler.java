package iteam.salesapi.exception;

import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================================================
    // RESOURCE NOT FOUND
    // ==================================================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(
            ResourceNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(

                        new ErrorResponse(

                                LocalDateTime.now(),

                                HttpStatus.NOT_FOUND.value(),

                                ex.getMessage()
                        )
                );
    }

    // ==================================================
    // BAD REQUEST
    // ==================================================

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(
            BadRequestException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(

                        new ErrorResponse(

                                LocalDateTime.now(),

                                HttpStatus.BAD_REQUEST.value(),

                                ex.getMessage()
                        )
                );
    }

    // ==================================================
    // FORBIDDEN / UNAUTHORIZED
    // ==================================================

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(
            UnauthorizedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(

                        new ErrorResponse(

                                LocalDateTime.now(),

                                HttpStatus.FORBIDDEN.value(),

                                ex.getMessage()
                        )
                );
    }

    // ==================================================
    // VALIDATION DTO
    // ==================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        Map<String, String> errors =
                new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->

                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .badRequest()
                .body(errors);
    }

    // ==================================================
    // GENERIC ERROR
    // ==================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(
            Exception ex
    ) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(

                        new ErrorResponse(

                                LocalDateTime.now(),

                                HttpStatus.INTERNAL_SERVER_ERROR.value(),

                                ex.getMessage()
                        )
                );
    }
}