import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "@/lib/test-utils"
import type { Cep, Endereco } from "../types"
import { FormularioEndereco } from "./FormularioEndereco"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("../cep-service", () => ({
  consultarCep: vi.fn(),
}))

vi.mock("../endereco-service", () => ({
  listarEnderecosDoUsuario: vi.fn(),
  criarEndereco: vi.fn(),
  atualizarEndereco: vi.fn(),
  excluirEndereco: vi.fn(),
}))

import { consultarCep } from "../cep-service"
import { atualizarEndereco, criarEndereco } from "../endereco-service"

const cepEncontrado: Cep = {
  cep: "01001000",
  logradouro: "Praca da Se",
  bairro: "Se",
  cidade: "Sao Paulo",
  estado: "SP",
}

describe("FormularioEndereco", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("preenche os campos automaticamente ao digitar um CEP valido e cria o endereco ao submeter", async () => {
    vi.mocked(consultarCep).mockResolvedValue(cepEncontrado)
    vi.mocked(criarEndereco).mockResolvedValue({
      id: 99,
      usuarioId: 10,
      cep: cepEncontrado.cep,
      numero: "100",
      complemento: null,
      logradouro: cepEncontrado.logradouro,
      bairro: cepEncontrado.bairro,
      cidade: cepEncontrado.cidade,
      estado: cepEncontrado.estado,
      principal: false,
    })
    const onSalvar = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <FormularioEndereco
        usuarioId={10}
        enderecoExistente={null}
        marcarComoPrincipalPorPadrao={false}
        onSalvar={onSalvar}
        onCancelar={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText("CEP"), "01001000")

    await waitFor(() => expect(screen.getByLabelText("Logradouro")).toHaveValue("Praca da Se"), {
      timeout: 2000,
    })
    expect(toast.success).toHaveBeenCalledWith("Endereço encontrado pelo CEP!")

    await user.type(screen.getByLabelText("Número"), "100")
    await user.click(screen.getByRole("button", { name: "Salvar endereço" }))

    await waitFor(() =>
      expect(criarEndereco).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ cep: "01001000", numero: "100", logradouro: "Praca da Se" })
      )
    )
    expect(onSalvar).toHaveBeenCalled()
  })

  it("mostra erro e nao preenche os campos quando o CEP nao e encontrado", async () => {
    vi.mocked(consultarCep).mockRejectedValue(new Error("nao encontrado"))
    const user = userEvent.setup()

    renderWithProviders(
      <FormularioEndereco
        usuarioId={10}
        enderecoExistente={null}
        marcarComoPrincipalPorPadrao={false}
        onSalvar={vi.fn()}
        onCancelar={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText("CEP"), "99999999")

    await waitFor(() => expect(toast.error).toHaveBeenCalled(), { timeout: 2000 })
    expect(screen.getByLabelText("Logradouro")).toHaveValue("")
  })

  it("usa atualizarEndereco em vez de criarEndereco quando ja existe um endereco", async () => {
    const enderecoExistente: Endereco = {
      id: 5,
      usuarioId: 10,
      cep: "01001000",
      numero: "50",
      complemento: null,
      logradouro: "Praca da Se",
      bairro: "Se",
      cidade: "Sao Paulo",
      estado: "SP",
      principal: false,
    }
    vi.mocked(consultarCep).mockResolvedValue(cepEncontrado)
    vi.mocked(atualizarEndereco).mockResolvedValue({ ...enderecoExistente, numero: "60" })
    const onSalvar = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <FormularioEndereco
        usuarioId={10}
        enderecoExistente={enderecoExistente}
        marcarComoPrincipalPorPadrao={false}
        onSalvar={onSalvar}
        onCancelar={vi.fn()}
      />
    )

    await waitFor(() => expect(screen.getByLabelText("Logradouro")).toHaveValue("Praca da Se"), {
      timeout: 2000,
    })

    const numeroInput = screen.getByLabelText("Número")
    await user.clear(numeroInput)
    await user.type(numeroInput, "60")

    await user.click(screen.getByRole("button", { name: "Salvar endereço" }))

    await waitFor(() =>
      expect(atualizarEndereco).toHaveBeenCalledWith(10, 5, expect.objectContaining({ numero: "60" }))
    )
    expect(criarEndereco).not.toHaveBeenCalled()
    expect(onSalvar).toHaveBeenCalled()
  })
})
