package com.kiograco.enderecocerto.service;

import com.kiograco.enderecocerto.client.ViaCepApiResponse;
import com.kiograco.enderecocerto.client.ViaCepClient;
import com.kiograco.enderecocerto.dto.CepResponse;
import com.kiograco.enderecocerto.exception.CepInvalidoException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Cacheia o resultado por CEP em memoria pra nao bater na API do ViaCEP
 * de novo pro mesmo CEP dentro do TTL configurado.
 */
@Service
public class CepService {

    private final ViaCepClient viaCepClient;
    private final Duration cacheTtl;
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public CepService(
            ViaCepClient viaCepClient, @Value("${viacep.cache-ttl-minutes}") long cacheTtlMinutes
    ) {
        this.viaCepClient = viaCepClient;
        this.cacheTtl = Duration.ofMinutes(cacheTtlMinutes);
    }

    public CepResponse consultarCep(String cepBruto) {
        String cep = apenasDigitos(cepBruto);
        validarFormatoCep(cep);

        CacheEntry emCache = cache.get(cep);
        if (emCache != null && !emCache.expirou()) {
            return emCache.resposta();
        }

        ViaCepApiResponse apiResponse = viaCepClient.buscarPorCep(cep);
        CepResponse resposta = new CepResponse(
                cep,
                apiResponse.logradouro(),
                apiResponse.bairro(),
                apiResponse.localidade(),
                apiResponse.uf()
        );

        cache.put(cep, new CacheEntry(resposta, Instant.now().plus(cacheTtl)));
        return resposta;
    }

    private void validarFormatoCep(String cep) {
        if (cep == null || !cep.matches("\\d{8}")) {
            throw new CepInvalidoException("CEP invalido: deve conter 8 digitos");
        }
    }

    private String apenasDigitos(String cep) {
        return cep == null ? null : cep.replaceAll("\\D", "");
    }

    private record CacheEntry(CepResponse resposta, Instant expiraEm) {
        boolean expirou() {
            return Instant.now().isAfter(expiraEm);
        }
    }
}
