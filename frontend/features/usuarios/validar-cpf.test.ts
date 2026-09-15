import { describe, expect, it } from "vitest"
import { cpfValido } from "./validar-cpf"

describe("cpfValido", () => {
  it.each(["52998224725", "529.982.247-25", "11144477735", "12345678909"])(
    "aceita CPF com digitos verificadores corretos: %s",
    (cpf) => {
      expect(cpfValido(cpf)).toBe(true)
    }
  )

  it.each(["52998224700", "11144477700", "123456789", "123456789012", "abcdefghijk"])(
    "rejeita CPF com digito verificador ou tamanho invalido: %s",
    (cpf) => {
      expect(cpfValido(cpf)).toBe(false)
    }
  )

  it.each(["00000000000", "11111111111", "22222222222", "99999999999"])(
    "rejeita sequencias com todos os digitos iguais: %s",
    (cpf) => {
      expect(cpfValido(cpf)).toBe(false)
    }
  )

  it.each(["", "   "])("rejeita CPF vazio ou em branco: %s", (cpf) => {
    expect(cpfValido(cpf)).toBe(false)
  })
})
