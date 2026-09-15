package com.kiograco.enderecocerto.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.kiograco.enderecocerto.dto.EnderecoRequest;
import com.kiograco.enderecocerto.dto.EnderecoResponse;
import com.kiograco.enderecocerto.entity.Endereco;
import com.kiograco.enderecocerto.entity.TipoUsuario;
import com.kiograco.enderecocerto.entity.Usuario;
import com.kiograco.enderecocerto.repository.EnderecoRepository;
import com.kiograco.enderecocerto.repository.UsuarioRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Sobe um Postgres real (Testcontainers) e roda as migrations reais do Flyway -- ao contrario
 * de EnderecoServiceTest (repositorio mockado), este teste bate no indice unico parcial
 * uq_enderecos_usuario_principal de verdade. Com mock, trocar o endereco principal "passava"
 * mesmo quando a ordem de flush do Hibernate violava essa constraint em producao (o INSERT/UPDATE
 * do novo principal saindo antes do UPDATE que desmarca o antigo), erro que o Spring Security
 * mascarava como 401 no forward pro /error em vez do 500 real.
 */
@SpringBootTest(properties = {
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
@Testcontainers
@Transactional
class EnderecoServicePrincipalIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private EnderecoService enderecoService;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void atualizarEndereco_trocandoPrincipalParaOutroEndereco_desmarcaOAntigo() {
        Usuario usuario = criarUsuario("52998224725");
        Endereco principalAtual = criarEndereco(usuario, true);
        Endereco outroEndereco = criarEndereco(usuario, false);

        enderecoService.atualizarEndereco(usuario.getId(), outroEndereco.getId(), requestPrincipal());
        enderecoRepository.flush();

        assertThat(enderecoRepository.findById(principalAtual.getId()).orElseThrow().isPrincipal()).isFalse();
        assertThat(enderecoRepository.findById(outroEndereco.getId()).orElseThrow().isPrincipal()).isTrue();
    }

    @Test
    void criarEndereco_comoPrincipalQuandoJaExisteOutro_desmarcaOAntigo() {
        Usuario usuario = criarUsuario("11144477735");
        Endereco principalAtual = criarEndereco(usuario, true);

        EnderecoResponse response = enderecoService.criarEndereco(usuario.getId(), requestPrincipal());
        enderecoRepository.flush();

        assertThat(enderecoRepository.findById(principalAtual.getId()).orElseThrow().isPrincipal()).isFalse();
        assertThat(enderecoRepository.findById(response.id()).orElseThrow().isPrincipal()).isTrue();
    }

    private EnderecoRequest requestPrincipal() {
        return new EnderecoRequest("01001000", "200", null, "Praca da Se", "Se", "Sao Paulo", "SP", true);
    }

    private Usuario criarUsuario(String cpf) {
        Usuario usuario = Usuario.builder()
                .nome("Fulano de Tal")
                .cpf(cpf)
                .dataNascimento(LocalDate.of(1990, 1, 1))
                .senhaHash("hash")
                .tipo(TipoUsuario.COMUM)
                .build();
        return usuarioRepository.save(usuario);
    }

    private Endereco criarEndereco(Usuario usuario, boolean principal) {
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
        return enderecoRepository.saveAndFlush(endereco);
    }
}
