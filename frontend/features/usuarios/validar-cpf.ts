// Mesma regra do backend (ValidadorCpf.java): digitos verificadores reais,
// nao so contagem de 11 digitos. Duplicada de proposito -- e client-side,
// so pra dar feedback rapido antes de bater na API; quem garante a regra e
// sempre o backend.
export function cpfValido(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, "")
  if (digitos.length !== 11 || todosDigitosIguais(digitos)) {
    return false
  }

  const numeros = digitos.split("").map(Number)
  const primeiroDv = calcularDigitoVerificador(numeros, 9, 10)
  if (primeiroDv !== numeros[9]) {
    return false
  }

  const segundoDv = calcularDigitoVerificador(numeros, 10, 11)
  return segundoDv === numeros[10]
}

function calcularDigitoVerificador(numeros: number[], quantidadeDigitos: number, pesoInicial: number): number {
  let soma = 0
  for (let i = 0; i < quantidadeDigitos; i++) {
    soma += numeros[i] * (pesoInicial - i)
  }
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

function todosDigitosIguais(digitos: string): boolean {
  return new Set(digitos.split("")).size === 1
}
