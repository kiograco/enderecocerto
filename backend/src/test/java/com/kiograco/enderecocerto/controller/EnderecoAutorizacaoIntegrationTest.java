package com.kiograco.enderecocerto.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kiograco.enderecocerto.entity.TipoUsuario;
import com.kiograco.enderecocerto.entity.Usuario;
import com.kiograco.enderecocerto.repository.UsuarioRepository;
import com.kiograco.enderecocerto.security.JwtService;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cobre a regra de autorizacao ponta a ponta (filtro JWT real + AutorizacaoService):
 * usuario comum tentando acessar recurso de outro usuario tem que receber 403,
 * nunca 200 com dado vazio.
 *
 * @Transactional faz cada teste rodar e dar rollback isolado -- sem isso, o
 * mesmo contexto Spring (e banco H2) e reaproveitado entre os metodos e o CPF
 * unico de um teste colide com o do outro.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EnderecoAutorizacaoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    void usuarioComumAcessandoProprioRecurso_recebeOk() throws Exception {
        Usuario usuario = criarUsuario("52998224725");
        String token = jwtService.gerarToken(usuario);

        mockMvc.perform(get("/usuarios/{id}/enderecos", usuario.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void usuarioComumAcessandoRecursoDeOutroUsuario_recebeForbidden() throws Exception {
        Usuario usuarioLogado = criarUsuario("52998224725");
        Usuario outroUsuario = criarUsuario("11144477735");
        String token = jwtService.gerarToken(usuarioLogado);

        mockMvc.perform(get("/usuarios/{id}/enderecos", outroUsuario.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    private Usuario criarUsuario(String cpf) {
        Usuario usuario = Usuario.builder()
                .nome("Fulano de Tal")
                .cpf(cpf)
                .dataNascimento(LocalDate.of(1990, 1, 1))
                .senhaHash(passwordEncoder.encode("senha123"))
                .tipo(TipoUsuario.COMUM)
                .build();
        return usuarioRepository.save(usuario);
    }
}
