package com.kiograco.enderecocerto.controller;

import com.kiograco.enderecocerto.dto.CepResponse;
import com.kiograco.enderecocerto.service.CepService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ceps")
@RequiredArgsConstructor
public class CepController {

    private final CepService cepService;

    @GetMapping("/{cep}")
    public CepResponse consultar(@PathVariable String cep) {
        return cepService.consultarCep(cep);
    }
}
