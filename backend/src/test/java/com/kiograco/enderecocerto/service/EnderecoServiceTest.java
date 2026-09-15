package com.kiograco.enderecocerto.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kiograco.enderecocerto.entity.Endereco;
import com.kiograco.enderecocerto.entity.TipoUsuario;
import com.kiograco.enderecocerto.entity.Usuario;
import com.kiograco.enderecocerto.repository.EnderecoRepository;
import com.kiograco.enderecocerto.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EnderecoServiceTest {

    @Mock
    private EnderecoRepository enderecoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private EnderecoService enderecoService;

    // A troca de endereco principal (desmarcar o antigo + marcar o novo) e coberta por
    // EnderecoServicePrincipalIntegrationTest, contra Postgres de verdade -- com repositorio
    // mockado esse fluxo sempre "passa" mesmo quebrando o indice unico parcial do banco
    // (um so principal por usuario), porque o mock nunca aplica a constraint real.

    @Test
    void excluirEndereco_quandoEraPrincipal_promoveEnderecoMaisAntigoRestante() {
        Long usuarioId = 1L;
        Usuario usuario = usuarioComId(usuarioId);
        Endereco enderecoExcluido = enderecoComId(10L, usuario, true);
        Endereco maisAntigoRestante = enderecoComId(5L, usuario, false);

        when(enderecoRepository.findById(10L)).thenReturn(Optional.of(enderecoExcluido));
        when(enderecoRepository.findFirstByUsuarioIdOrderByIdAsc(usuarioId))
                .thenReturn(Optional.of(maisAntigoRestante));

        enderecoService.excluirEndereco(usuarioId, 10L);

        verify(enderecoRepository).delete(enderecoExcluido);
        assertThat(maisAntigoRestante.isPrincipal()).isTrue();
        verify(enderecoRepository).save(maisAntigoRestante);
    }

    @Test
    void excluirEndereco_quandoEraPrincipalENaoSobraNenhumEndereco_naoQuebra() {
        Long usuarioId = 1L;
        Usuario usuario = usuarioComId(usuarioId);
        Endereco enderecoExcluido = enderecoComId(10L, usuario, true);

        when(enderecoRepository.findById(10L)).thenReturn(Optional.of(enderecoExcluido));
        when(enderecoRepository.findFirstByUsuarioIdOrderByIdAsc(usuarioId)).thenReturn(Optional.empty());

        enderecoService.excluirEndereco(usuarioId, 10L);

        verify(enderecoRepository).delete(enderecoExcluido);
        verify(enderecoRepository, never()).save(any(Endereco.class));
    }

    private Usuario usuarioComId(Long id) {
        Usuario usuario = Usuario.builder()
                .nome("Fulano de Tal")
                .cpf("52998224725")
                .dataNascimento(LocalDate.of(1990, 1, 1))
                .senhaHash("hash")
                .tipo(TipoUsuario.COMUM)
                .build();
        usuario.setId(id);
        return usuario;
    }

    private Endereco enderecoComId(Long id, Usuario usuario, boolean principal) {
        Endereco endereco = Endereco.builder()
                .usuario(usuario)
                .cep("01001000")
                .numero("100")
                .logradouro("Rua X")
                .bairro("Centro")
                .cidade("Sao Paulo")
                .estado("SP")
                .principal(principal)
                .build();
        endereco.setId(id);
        return endereco;
    }
}
