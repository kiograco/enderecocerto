package com.kiograco.enderecocerto.client;

import com.kiograco.enderecocerto.exception.CepNaoEncontradoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Isola toda a comunicacao com a API do ViaCEP -- se o contrato externo
 * mudar ou o servico cair, o dano fica contido nesta classe.
 */
@Component
public class ViaCepClient {

    private final RestClient restClient;

    public ViaCepClient(@Value("${viacep.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public ViaCepApiResponse buscarPorCep(String cep) {
        ViaCepApiResponse resposta;
        try {
            resposta = restClient.get()
                    .uri("/{cep}/json/", cep)
                    .retrieve()
                    .body(ViaCepApiResponse.class);
        } catch (RestClientException ex) {
            throw new CepNaoEncontradoException("Nao foi possivel consultar o CEP no momento");
        }

        if (resposta == null || Boolean.TRUE.equals(resposta.erro())) {
            throw new CepNaoEncontradoException("CEP nao encontrado: " + cep);
        }
        return resposta;
    }
}
