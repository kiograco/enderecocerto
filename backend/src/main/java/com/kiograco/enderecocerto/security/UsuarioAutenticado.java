package com.kiograco.enderecocerto.security;

import com.kiograco.enderecocerto.entity.TipoUsuario;

/**
 * Dados do usuario extraidos do JWT e colocados no SecurityContext.
 * E o unico lugar confiavel de onde "quem esta logado" deve vir --
 * nunca um usuarioId que tenha chegado no corpo da requisicao.
 */
public record UsuarioAutenticado(Long id, String cpf, TipoUsuario tipo) {

    public boolean isAdmin() {
        return tipo == TipoUsuario.ADMIN;
    }
}
