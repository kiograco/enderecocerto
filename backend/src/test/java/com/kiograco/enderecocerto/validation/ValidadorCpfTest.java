package com.kiograco.enderecocerto.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class ValidadorCpfTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "52998224725",
            "529.982.247-25",
            "11144477735",
            "12345678909"
    })
    void deveAceitarCpfComDigitosVerificadoresCorretos(String cpf) {
        assertThat(ValidadorCpf.isValido(cpf)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "52998224700",
            "11144477700",
            "123456789",
            "123456789012",
            "abcdefghijk"
    })
    void deveRejeitarCpfComDigitoVerificadorOuTamanhoInvalido(String cpf) {
        assertThat(ValidadorCpf.isValido(cpf)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "00000000000",
            "11111111111",
            "22222222222",
            "99999999999"
    })
    void deveRejeitarSequenciasComTodosOsDigitosIguais(String cpf) {
        assertThat(ValidadorCpf.isValido(cpf)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void deveRejeitarCpfVazioOuEmBranco(String cpf) {
        assertThat(ValidadorCpf.isValido(cpf)).isFalse();
    }

    @Test
    void deveRejeitarCpfNulo() {
        assertThat(ValidadorCpf.isValido(null)).isFalse();
    }
}
