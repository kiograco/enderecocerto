package com.kiograco.enderecocerto.exception;

import java.time.OffsetDateTime;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CpfInvalidoException.class)
    public ResponseEntity<ApiErrorResponse> handleCpfInvalido(CpfInvalidoException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(CpfDuplicadoException.class)
    public ResponseEntity<ApiErrorResponse> handleCpfDuplicado(CpfDuplicadoException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ApiErrorResponse> handleCredenciaisInvalidas(CredenciaisInvalidasException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ApiErrorResponse> handleAcessoNegado(AcessoNegadoException ex) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> handleUsuarioNaoEncontrado(UsuarioNaoEncontradoException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, mensagem);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String mensagem) {
        ApiErrorResponse body = new ApiErrorResponse(
                OffsetDateTime.now(), status.value(), status.getReasonPhrase(), mensagem
        );
        return ResponseEntity.status(status).body(body);
    }
}
