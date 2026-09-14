package com.kiograco.enderecocerto.client;

/**
 * Espelha o payload cru da API do ViaCEP (https://viacep.com.br/ws/{cep}/json/).
 * "erro" so vem presente (true) quando o CEP e bem formado mas nao existe.
 */
public record ViaCepApiResponse(
        String cep,
        String logradouro,
        String bairro,
        String localidade,
        String uf,
        Boolean erro
) {
}
