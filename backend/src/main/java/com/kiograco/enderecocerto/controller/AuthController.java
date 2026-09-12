package com.kiograco.enderecocerto.controller;

import com.kiograco.enderecocerto.dto.LoginRequest;
import com.kiograco.enderecocerto.dto.LoginResponse;
import com.kiograco.enderecocerto.service.AutenticacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AutenticacaoService autenticacaoService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return autenticacaoService.autenticar(request);
    }
}
