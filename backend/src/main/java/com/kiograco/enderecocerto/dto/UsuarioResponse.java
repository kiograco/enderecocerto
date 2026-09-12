package com.kiograco.enderecocerto.dto;

import com.kiograco.enderecocerto.entity.TipoUsuario;
import com.kiograco.enderecocerto.entity.Usuario;
import java.time.LocalDate;

public record UsuarioResponse(
        Long id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        TipoUsuario tipo
) {

    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getCpf(),
                usuario.getDataNascimento(),
                usuario.getTipo()
        );
    }
}
