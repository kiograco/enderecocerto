package com.kiograco.enderecocerto.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "CPF e obrigatorio") String cpf,
        @NotBlank(message = "Senha e obrigatoria") String senha
) {
}
