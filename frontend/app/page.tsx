"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/auth-context"

export default function Page() {
  const { usuario, pronto } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!pronto) return
    if (usuario) {
      router.replace(usuario.tipo === "ADMIN" ? "/usuarios" : `/usuarios/${usuario.id}`)
    } else {
      router.replace("/login")
    }
  }, [usuario, pronto, router])

  return null
}
