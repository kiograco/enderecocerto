package com.kiograco.enderecocerto.dto;

public record CepResponse(
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String estado
) {
}
