import { apiClient } from "@/lib/api-client"
import type { Cep } from "./types"

export async function consultarCep(cep: string): Promise<Cep> {
  const { data } = await apiClient.get<Cep>(`/ceps/${cep.replace(/\D/g, "")}`)
  return data
}
