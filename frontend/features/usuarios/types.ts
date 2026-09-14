import type { TipoUsuario } from "@/features/auth/types"

export type Usuario = {
  id: number
  nome: string
  cpf: string
  dataNascimento: string
  tipo: TipoUsuario
}

export type CriarUsuarioRequest = {
  nome: string
  cpf: string
  dataNascimento: string
  senha: string
}
