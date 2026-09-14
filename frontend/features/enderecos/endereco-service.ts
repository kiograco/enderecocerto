import { apiClient } from "@/lib/api-client"
import type { Endereco, EnderecoRequest } from "./types"

export async function listarEnderecosDoUsuario(usuarioId: number): Promise<Endereco[]> {
  const { data } = await apiClient.get<Endereco[]>(`/usuarios/${usuarioId}/enderecos`)
  return data
}

export async function criarEndereco(usuarioId: number, request: EnderecoRequest): Promise<Endereco> {
  const { data } = await apiClient.post<Endereco>(`/usuarios/${usuarioId}/enderecos`, request)
  return data
}

export async function atualizarEndereco(
  usuarioId: number,
  enderecoId: number,
  request: EnderecoRequest
): Promise<Endereco> {
  const { data } = await apiClient.put<Endereco>(`/usuarios/${usuarioId}/enderecos/${enderecoId}`, request)
  return data
}

export async function excluirEndereco(usuarioId: number, enderecoId: number): Promise<void> {
  await apiClient.delete(`/usuarios/${usuarioId}/enderecos/${enderecoId}`)
}
