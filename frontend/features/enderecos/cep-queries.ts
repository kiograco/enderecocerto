import { useQuery } from "@tanstack/react-query"
import { consultarCep } from "./cep-service"

/**
 * `cepDebounced` deve ser os digitos ja com debounce aplicado (useDebouncedValue).
 * `enabled` so dispara a busca quando o CEP estiver completo -- o proprio
 * React Query cuida de cachear/deduplicar, complementando o cache do backend.
 */
export function useCep(cepDebounced: string) {
  return useQuery({
    queryKey: ["cep", cepDebounced],
    queryFn: () => consultarCep(cepDebounced),
    enabled: cepDebounced.length === 8,
    retry: false,
    staleTime: Infinity,
  })
}
