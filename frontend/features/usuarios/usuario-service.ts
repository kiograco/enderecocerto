import { apiClient } from "@/lib/api-client"
import type { CriarUsuarioRequest, Usuario } from "./types"

export async function criarUsuario(request: CriarUsuarioRequest): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>("/usuarios", request)
  return data
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`)
  return data
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await apiClient.get<Usuario[]>("/usuarios")
  return data
}
