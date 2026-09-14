export type TipoUsuario = "ADMIN" | "COMUM"

export type LoginRequest = {
  cpf: string
  senha: string
}

export type LoginResponse = {
  token: string
  usuarioId: number
  tipo: TipoUsuario
}

export type UsuarioAutenticado = {
  id: number
  tipo: TipoUsuario
}
