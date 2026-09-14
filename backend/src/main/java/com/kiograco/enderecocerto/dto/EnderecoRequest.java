package com.kiograco.enderecocerto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(
        @NotBlank(message = "CEP e obrigatorio")
        String cep,

        @NotBlank(message = "Numero e obrigatorio")
        String numero,

        String complemento,

        @NotBlank(message = "Logradouro e obrigatorio")
        String logradouro,

        @NotBlank(message = "Bairro e obrigatorio")
        String bairro,

        @NotBlank(message = "Cidade e obrigatoria")
        String cidade,

        @NotBlank(message = "Estado e obrigatorio")
        @Size(min = 2, max = 2, message = "Estado deve ser a sigla da UF (2 letras)")
        String estado,

        boolean principal
) {
}
