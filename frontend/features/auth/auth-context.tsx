"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { registrarListenerSessaoExpirada } from "@/lib/auth-events"
import { getToken, setToken as salvarTokenParaRequisicoes } from "@/lib/token-store"
import { login as loginRequest } from "./auth-service"
import type { LoginRequest, TipoUsuario, UsuarioAutenticado } from "./types"

type AuthContextValue = {
  usuario: UsuarioAutenticado | null
  pronto: boolean
  entrar: (request: LoginRequest) => Promise<UsuarioAutenticado>
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type PayloadToken = { sub: string; tipo: TipoUsuario; exp: number }

function usuarioDoToken(token: string): UsuarioAutenticado | null {
  try {
    const payloadBase64 = token.split(".")[1]
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))) as PayloadToken
    if (!payload.exp || payload.exp * 1000 <= Date.now()) return null
    return { id: Number(payload.sub), tipo: payload.tipo }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null)
  const [pronto, setPronto] = useState(false)
  const router = useRouter()

  // Reidrata a sessao a partir do token persistido (localStorage) quando a
  // pagina e recarregada -- sem isso, o usuario era deslogado a cada F5.
  useEffect(() => {
    const token = getToken()
    const usuarioReidratado = token ? usuarioDoToken(token) : null
    if (usuarioReidratado) {
      setUsuario(usuarioReidratado)
    } else if (token) {
      salvarTokenParaRequisicoes(null)
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    registrarListenerSessaoExpirada(() => {
      setUsuario(null)
      toast.error("Sua sessão expirou. Faça login novamente.")
      router.replace("/login")
    })
    return () => registrarListenerSessaoExpirada(null)
  }, [router])

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

  const value = useMemo(() => ({ usuario, pronto, entrar, sair }), [usuario, pronto, entrar, sair])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider")
  }
  return context
}
