package com.kiograco.enderecocerto.controller;

import com.kiograco.enderecocerto.dto.EnderecoRequest;
import com.kiograco.enderecocerto.dto.EnderecoResponse;
import com.kiograco.enderecocerto.security.AutorizacaoService;
import com.kiograco.enderecocerto.security.UsuarioAutenticado;
import com.kiograco.enderecocerto.service.EnderecoService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios/{usuarioId}/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;
    private final AutorizacaoService autorizacaoService;

    @GetMapping
    public List<EnderecoResponse> listar(
            @PathVariable Long usuarioId, @AuthenticationPrincipal UsuarioAutenticado logado
    ) {
        autorizacaoService.garantirAcessoAoRecurso(logado, usuarioId);
        return enderecoService.listarPorUsuario(usuarioId);
    }

    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(
            @PathVariable Long usuarioId,
            @Valid @RequestBody EnderecoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado logado
    ) {
        autorizacaoService.garantirAcessoAoRecurso(logado, usuarioId);
        EnderecoResponse response = enderecoService.criarEndereco(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{enderecoId}")
    public EnderecoResponse atualizar(
            @PathVariable Long usuarioId,
            @PathVariable Long enderecoId,
            @Valid @RequestBody EnderecoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado logado
    ) {
        autorizacaoService.garantirAcessoAoRecurso(logado, usuarioId);
        return enderecoService.atualizarEndereco(usuarioId, enderecoId, request);
    }

    @DeleteMapping("/{enderecoId}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long usuarioId,
            @PathVariable Long enderecoId,
            @AuthenticationPrincipal UsuarioAutenticado logado
    ) {
        autorizacaoService.garantirAcessoAoRecurso(logado, usuarioId);
        enderecoService.excluirEndereco(usuarioId, enderecoId);
        return ResponseEntity.noContent().build();
    }
}
