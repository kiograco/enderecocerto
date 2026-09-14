"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { setToken as salvarTokenParaRequisicoes } from "@/lib/token-store"
import { login as loginRequest } from "./auth-service"
import type { LoginRequest, UsuarioAutenticado } from "./types"

type AuthContextValue = {
  usuario: UsuarioAutenticado | null
  entrar: (request: LoginRequest) => Promise<UsuarioAutenticado>
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)

  const entrar = useCallback(async (request: LoginRequest) => {
    const resposta = await loginRequest(request)
    salvarTokenParaRequisicoes(resposta.token)
    const usuarioAutenticado: UsuarioAutenticado = { id: resposta.usuarioId, tipo: resposta.tipo }
    setUsuario(usuarioAutenticado)
    return usuarioAutenticado
  }, [])

  const sair = useCallback(() => {
    salvarTokenParaRequisicoes(null)
    setUsuario(null)
  }, [])

  const value = useMemo(() => ({ usuario, entrar, sair }), [usuario, entrar, sair])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider")
  }
  return context
}
