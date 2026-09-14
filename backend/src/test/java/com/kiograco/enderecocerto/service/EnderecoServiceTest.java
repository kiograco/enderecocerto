package com.kiograco.enderecocerto.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kiograco.enderecocerto.dto.EnderecoRequest;
import com.kiograco.enderecocerto.dto.EnderecoResponse;
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

    @Test
    void criarEndereco_marcandoComoPrincipal_desmarcaPrincipalAnterior() {
        Long usuarioId = 1L;
        Usuario usuario = usuarioComId(usuarioId);
        Endereco principalAtual = enderecoComId(10L, usuario, true);

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(enderecoRepository.findByUsuarioIdAndPrincipalTrue(usuarioId)).thenReturn(Optional.of(principalAtual));
        when(enderecoRepository.save(any(Endereco.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        EnderecoRequest request = new EnderecoRequest(
                "01001000", "200", null, "Praca da Se", "Se", "Sao Paulo", "SP", true
        );
        EnderecoResponse response = enderecoService.criarEndereco(usuarioId, request);

        assertThat(principalAtual.isPrincipal()).isFalse();
        assertThat(response.principal()).isTrue();
    }

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
