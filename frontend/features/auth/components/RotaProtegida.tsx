"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth-context"

/**
 * Protege uma pagina client-side, ja que o token vive so em memoria (sem
 * cookie, sem localStorage) -- nao ha como um middleware de servidor checar
 * sessao. A protecao real de dado continua sendo no backend; isso aqui e so
 * pra nao mostrar UI vazia/quebrada e mandar quem nao devia ver de volta pro
 * login.
 */
export function RotaProtegida({
  apenasAdmin = false,
  children,
}: {
  apenasAdmin?: boolean
  children: React.ReactNode
}) {
  const { usuario } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!usuario) {
      router.replace("/login")
      return
    }
    if (apenasAdmin && usuario.tipo !== "ADMIN") {
      router.replace(`/usuarios/${usuario.id}`)
    }
  }, [usuario, apenasAdmin, router])

  if (!usuario || (apenasAdmin && usuario.tipo !== "ADMIN")) {
    return null
  }

  return <>{children}</>
}
