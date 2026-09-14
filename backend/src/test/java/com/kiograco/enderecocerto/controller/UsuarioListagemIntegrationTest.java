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
 * GET /usuarios e restrito a admin -- comum tem que receber 403, nunca a lista.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UsuarioListagemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    void adminListandoUsuarios_recebeOk() throws Exception {
        Usuario admin = criarUsuario("52998224725", TipoUsuario.ADMIN);
        String token = jwtService.gerarToken(admin);

        mockMvc.perform(get("/usuarios").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void usuarioComumListandoUsuarios_recebeForbidden() throws Exception {
        Usuario comum = criarUsuario("52998224725", TipoUsuario.COMUM);
        String token = jwtService.gerarToken(comum);

        mockMvc.perform(get("/usuarios").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    private Usuario criarUsuario(String cpf, TipoUsuario tipo) {
        Usuario usuario = Usuario.builder()
                .nome("Fulano de Tal")
                .cpf(cpf)
                .dataNascimento(LocalDate.of(1990, 1, 1))
                .senhaHash(passwordEncoder.encode("senha123"))
                .tipo(tipo)
                .build();
        return usuarioRepository.save(usuario);
    }
}
