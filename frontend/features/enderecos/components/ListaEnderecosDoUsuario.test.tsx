import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "@/lib/test-utils"
import type { Endereco } from "../types"
import { ListaEnderecosDoUsuario } from "./ListaEnderecosDoUsuario"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("../endereco-service", () => ({
  listarEnderecosDoUsuario: vi.fn(),
  criarEndereco: vi.fn(),
  atualizarEndereco: vi.fn(),
  excluirEndereco: vi.fn(),
}))

// Isola a logica do container: EnderecoCard e FormularioEndereco tem seus
// proprios testes/comportamento e nao precisam re-renderizar de verdade aqui.
vi.mock("./EnderecoCard", () => ({
  EnderecoCard: ({
    endereco,
    onTornarPrincipal,
    onExcluir,
  }: {
    endereco: Endereco
    onTornarPrincipal: () => void
    onExcluir: () => void
  }) => (
    <div>
      <span>{endereco.logradouro}</span>
      <button onClick={onTornarPrincipal}>{`Tornar principal ${endereco.id}`}</button>
      <button onClick={onExcluir}>{`Excluir ${endereco.id}`}</button>
    </div>
  ),
}))

vi.mock("./FormularioEndereco", () => ({
  FormularioEndereco: () => <div>formulario-endereco-stub</div>,
}))

import { atualizarEndereco, excluirEndereco, listarEnderecosDoUsuario } from "../endereco-service"

const enderecoPrincipal: Endereco = {
  id: 1,
  usuarioId: 10,
  cep: "01001000",
  numero: "100",
  complemento: null,
  logradouro: "Praca da Se",
  bairro: "Se",
  cidade: "Sao Paulo",
  estado: "SP",
  principal: true,
}

const enderecoSecundario: Endereco = {
  ...enderecoPrincipal,
  id: 2,
  principal: false,
  logradouro: "Av Paulista",
}

describe("ListaEnderecosDoUsuario", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza os enderecos retornados pela query", async () => {
    vi.mocked(listarEnderecosDoUsuario).mockResolvedValue([enderecoPrincipal, enderecoSecundario])

    renderWithProviders(<ListaEnderecosDoUsuario usuarioId={10} />)

    expect(await screen.findByText("Praca da Se")).toBeInTheDocument()
    expect(screen.getByText("Av Paulista")).toBeInTheDocument()
    expect(listarEnderecosDoUsuario).toHaveBeenCalledWith(10)
  })

  it("marca outro endereco como principal e atualiza a lista", async () => {
    vi.mocked(listarEnderecosDoUsuario).mockResolvedValue([enderecoPrincipal, enderecoSecundario])
    vi.mocked(atualizarEndereco).mockResolvedValue({ ...enderecoSecundario, principal: true })
    const user = userEvent.setup()

    renderWithProviders(<ListaEnderecosDoUsuario usuarioId={10} />)
    await screen.findByText("Av Paulista")

    await user.click(screen.getByRole("button", { name: "Tornar principal 2" }))

    await waitFor(() =>
      expect(atualizarEndereco).toHaveBeenCalledWith(
        10,
        2,
        expect.objectContaining({ principal: true })
      )
    )
    expect(toast.success).toHaveBeenCalledWith("Endereço principal atualizado.")
  })

  it("abre a confirmacao e exclui o endereco so depois de confirmar", async () => {
    vi.mocked(listarEnderecosDoUsuario).mockResolvedValue([enderecoPrincipal])
    vi.mocked(excluirEndereco).mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<ListaEnderecosDoUsuario usuarioId={10} />)
    await screen.findByText("Praca da Se")

    await user.click(screen.getByRole("button", { name: "Excluir 1" }))
    expect(excluirEndereco).not.toHaveBeenCalled()

    const confirmar = await screen.findByRole("button", { name: "Excluir endereço" })
    await user.click(confirmar)

    await waitFor(() => expect(excluirEndereco).toHaveBeenCalledWith(10, 1))
    expect(toast.success).toHaveBeenCalledWith("Endereço excluído.")
  })

  it("mostra estado vazio quando o usuario nao tem enderecos", async () => {
    vi.mocked(listarEnderecosDoUsuario).mockResolvedValue([])

    renderWithProviders(<ListaEnderecosDoUsuario usuarioId={10} />)

    expect(await screen.findByText("Este usuário ainda não tem endereços")).toBeInTheDocument()
  })
})
