package com.kiograco.enderecocerto.service;

import com.kiograco.enderecocerto.dto.EnderecoRequest;
import com.kiograco.enderecocerto.dto.EnderecoResponse;
import com.kiograco.enderecocerto.entity.Endereco;
import com.kiograco.enderecocerto.entity.Usuario;
import com.kiograco.enderecocerto.exception.EnderecoNaoEncontradoException;
import com.kiograco.enderecocerto.exception.UsuarioNaoEncontradoException;
import com.kiograco.enderecocerto.repository.EnderecoRepository;
import com.kiograco.enderecocerto.repository.UsuarioRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<EnderecoResponse> listarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioIdOrderByIdAsc(usuarioId).stream()
                .map(EnderecoResponse::from)
                .toList();
    }

    @Transactional
    public EnderecoResponse criarEndereco(Long usuarioId, EnderecoRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (request.principal()) {
            desmarcarPrincipalAtual(usuarioId);
        }

        Endereco endereco = Endereco.builder()
                .usuario(usuario)
                .cep(apenasDigitos(request.cep()))
                .numero(request.numero())
                .complemento(request.complemento())
                .logradouro(request.logradouro())
                .bairro(request.bairro())
                .cidade(request.cidade())
                .estado(request.estado())
                .principal(request.principal())
                .build();

        return EnderecoResponse.from(enderecoRepository.save(endereco));
    }

    @Transactional
    public EnderecoResponse atualizarEndereco(Long usuarioId, Long enderecoId, EnderecoRequest request) {
        Endereco endereco = buscarEnderecoDoUsuario(usuarioId, enderecoId);
        if (request.principal() && !endereco.isPrincipal()) {
            desmarcarPrincipalAtual(usuarioId);
        }

        endereco.setCep(apenasDigitos(request.cep()));
        endereco.setNumero(request.numero());
        endereco.setComplemento(request.complemento());
        endereco.setLogradouro(request.logradouro());
        endereco.setBairro(request.bairro());
        endereco.setCidade(request.cidade());
        endereco.setEstado(request.estado());
        endereco.setPrincipal(request.principal());

        return EnderecoResponse.from(enderecoRepository.save(endereco));
    }

    @Transactional
    public void excluirEndereco(Long usuarioId, Long enderecoId) {
        Endereco endereco = buscarEnderecoDoUsuario(usuarioId, enderecoId);
        boolean eraPrincipal = endereco.isPrincipal();

        enderecoRepository.delete(endereco);

        if (eraPrincipal) {
            promoverNovoPrincipalAposExclusao(usuarioId);
        }
    }

    // Desmarca o principal atual do usuario, se houver, pra abrir espaco pro novo --
    // as duas escritas acontecem na mesma transacao do metodo chamador.
    private void desmarcarPrincipalAtual(Long usuarioId) {
        enderecoRepository.findByUsuarioIdAndPrincipalTrue(usuarioId)
                .ifPresent(atual -> {
                    atual.setPrincipal(false);
                    enderecoRepository.save(atual);
                });
    }

    // Promove o endereco mais antigo do usuario a principal; se nao sobrar
    // nenhum, tudo bem ficar sem principal.
    private void promoverNovoPrincipalAposExclusao(Long usuarioId) {
        enderecoRepository.findFirstByUsuarioIdOrderByIdAsc(usuarioId)
                .ifPresent(candidato -> {
                    candidato.setPrincipal(true);
                    enderecoRepository.save(candidato);
                });
    }

    private Endereco buscarEnderecoDoUsuario(Long usuarioId, Long enderecoId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new EnderecoNaoEncontradoException("Endereco nao encontrado"));
        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new EnderecoNaoEncontradoException("Endereco nao encontrado");
        }
        return endereco;
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuario nao encontrado"));
    }

    private String apenasDigitos(String cep) {
        return cep == null ? null : cep.replaceAll("\\D", "");
    }
}
