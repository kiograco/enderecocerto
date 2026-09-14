package com.kiograco.enderecocerto.service;

import com.kiograco.enderecocerto.dto.LoginRequest;
import com.kiograco.enderecocerto.dto.LoginResponse;
import com.kiograco.enderecocerto.entity.Usuario;
import com.kiograco.enderecocerto.exception.CredenciaisInvalidasException;
import com.kiograco.enderecocerto.repository.UsuarioRepository;
import com.kiograco.enderecocerto.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private static final String MENSAGEM_CREDENCIAIS_INVALIDAS = "CPF ou senha invalidos";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse autenticar(LoginRequest request) {
        String cpf = apenasDigitos(request.cpf());
        Usuario usuario = usuarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new CredenciaisInvalidasException(MENSAGEM_CREDENCIAIS_INVALIDAS));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new CredenciaisInvalidasException(MENSAGEM_CREDENCIAIS_INVALIDAS);
        }

        String token = jwtService.gerarToken(usuario);
        return new LoginResponse(token, usuario.getId(), usuario.getTipo());
    }

    private String apenasDigitos(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }
}
