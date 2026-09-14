export type Endereco = {
  id: number
  usuarioId: number
  cep: string
  numero: string
  complemento: string | null
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  principal: boolean
}

export type EnderecoRequest = {
  cep: string
  numero: string
  complemento: string | null
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  principal: boolean
}

export type Cep = {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}
