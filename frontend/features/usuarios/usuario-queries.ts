import { useMutation, useQuery } from "@tanstack/react-query"
import { buscarUsuarioPorId, criarUsuario, listarUsuarios } from "./usuario-service"
import type { CriarUsuarioRequest } from "./types"

export function useUsuarios() {
  return useQuery({ queryKey: ["usuarios"], queryFn: listarUsuarios })
}

export function useUsuario(id: number) {
  return useQuery({ queryKey: ["usuarios", id], queryFn: () => buscarUsuarioPorId(id) })
}

export function useCriarUsuario() {
  return useMutation({
    mutationFn: (request: CriarUsuarioRequest) => criarUsuario(request),
  })
}
