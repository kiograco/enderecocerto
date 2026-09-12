package com.kiograco.enderecocerto.controller;

import com.kiograco.enderecocerto.dto.CriarUsuarioRequest;
import com.kiograco.enderecocerto.dto.UsuarioResponse;
import com.kiograco.enderecocerto.security.AutorizacaoService;
import com.kiograco.enderecocerto.security.UsuarioAutenticado;
import com.kiograco.enderecocerto.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AutorizacaoService autorizacaoService;

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody CriarUsuarioRequest request) {
        UsuarioResponse response = usuarioService.criarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public UsuarioResponse buscarPorId(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado logado
    ) {
        autorizacaoService.garantirAcessoAoRecurso(logado, id);
        return usuarioService.buscarPorId(id);
    }
}
