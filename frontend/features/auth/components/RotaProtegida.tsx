"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth-context"

/**
 * Protege uma pagina client-side -- nao ha middleware de servidor checando
 * sessao aqui. A protecao real de dado continua sendo no backend; isso aqui
 * e so pra nao mostrar UI vazia/quebrada e mandar quem nao devia ver de
 * volta pro login. Espera `pronto` antes de decidir: o AuthProvider ainda
 * esta reidratando a sessao a partir do token persistido no primeiro
 * render, e `usuario` comeca null nesse meio-tempo.
 */
export function RotaProtegida({
  apenasAdmin = false,
  children,
}: {
  apenasAdmin?: boolean
  children: React.ReactNode
}) {
  const { usuario, pronto } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!pronto) return
    if (!usuario) {
      router.replace("/login")
      return
    }
    if (apenasAdmin && usuario.tipo !== "ADMIN") {
      router.replace(`/usuarios/${usuario.id}`)
    }
  }, [usuario, pronto, apenasAdmin, router])

  if (!pronto || !usuario || (apenasAdmin && usuario.tipo !== "ADMIN")) {
    return null
  }

  return <>{children}</>
}
