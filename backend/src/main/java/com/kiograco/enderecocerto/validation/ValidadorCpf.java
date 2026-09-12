package com.kiograco.enderecocerto.validation;

/**
 * Valida CPF pelo algoritmo real dos digitos verificadores, nao so o
 * formato (11 digitos). Rejeita sequencias com todos os digitos iguais,
 * que passariam na conta mas nunca sao CPFs reais (ex: 111.111.111-11).
 */
public final class ValidadorCpf {

    private ValidadorCpf() {
    }

    public static boolean isValido(String cpf) {
        if (cpf == null) {
            return false;
        }
        String digitos = cpf.replaceAll("\\D", "");
        if (digitos.length() != 11 || todosDigitosIguais(digitos)) {
            return false;
        }

        int[] numeros = digitos.chars().map(c -> c - '0').toArray();
        int primeiroDv = calcularDigitoVerificador(numeros, 9, 10);
        if (primeiroDv != numeros[9]) {
            return false;
        }

        int segundoDv = calcularDigitoVerificador(numeros, 10, 11);
        return segundoDv == numeros[10];
    }

    private static int calcularDigitoVerificador(int[] numeros, int quantidadeDigitos, int pesoInicial) {
        int soma = 0;
        for (int i = 0; i < quantidadeDigitos; i++) {
            soma += numeros[i] * (pesoInicial - i);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static boolean todosDigitosIguais(String digitos) {
        return digitos.chars().distinct().count() == 1;
    }
}
