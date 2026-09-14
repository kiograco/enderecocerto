package com.kiograco.enderecocerto.service;

import com.kiograco.enderecocerto.dto.CriarUsuarioRequest;
import com.kiograco.enderecocerto.dto.UsuarioResponse;
import com.kiograco.enderecocerto.entity.TipoUsuario;
import com.kiograco.enderecocerto.entity.Usuario;
import com.kiograco.enderecocerto.exception.CpfDuplicadoException;
import com.kiograco.enderecocerto.exception.CpfInvalidoException;
import com.kiograco.enderecocerto.exception.UsuarioNaoEncontradoException;
import com.kiograco.enderecocerto.repository.UsuarioRepository;
import com.kiograco.enderecocerto.validation.ValidadorCpf;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponse criarUsuario(CriarUsuarioRequest request) {
        String cpf = apenasDigitos(request.cpf());
        validarFormatoCpf(cpf);
        if (cpfJaCadastrado(cpf)) {
            throw new CpfDuplicadoException("CPF ja cadastrado");
        }

        // Cadastro publico sempre cria usuario COMUM; ADMIN nao e algo que
        // o proprio requisitante pode se auto-conceder.
        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .cpf(cpf)
                .dataNascimento(request.dataNascimento())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .tipo(TipoUsuario.COMUM)
                .build();

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.from(salvo);
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuario nao encontrado"));
        return UsuarioResponse.from(usuario);
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::from).toList();
    }

    private void validarFormatoCpf(String cpf) {
        if (!ValidadorCpf.isValido(cpf)) {
            throw new CpfInvalidoException("CPF invalido");
        }
    }

    private boolean cpfJaCadastrado(String cpf) {
        return usuarioRepository.existsByCpf(cpf);
    }

    private String apenasDigitos(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }
}
