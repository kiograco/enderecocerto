import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { atualizarEndereco, criarEndereco, excluirEndereco, listarEnderecosDoUsuario } from "./endereco-service"
import type { EnderecoRequest } from "./types"

export function useEnderecosDoUsuario(usuarioId: number) {
  return useQuery({
    queryKey: ["enderecos", usuarioId],
    queryFn: () => listarEnderecosDoUsuario(usuarioId),
  })
}

export function useCriarEndereco(usuarioId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: EnderecoRequest) => criarEndereco(usuarioId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enderecos", usuarioId] }),
  })
}

export function useAtualizarEndereco(usuarioId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enderecoId, request }: { enderecoId: number; request: EnderecoRequest }) =>
      atualizarEndereco(usuarioId, enderecoId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enderecos", usuarioId] }),
  })
}

export function useExcluirEndereco(usuarioId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (enderecoId: number) => excluirEndereco(usuarioId, enderecoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enderecos", usuarioId] }),
  })
}
