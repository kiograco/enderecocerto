"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/auth-context"

export default function Page() {
  const { usuario } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (usuario) {
      router.replace(usuario.tipo === "ADMIN" ? "/usuarios" : `/usuarios/${usuario.id}`)
    } else {
      router.replace("/login")
    }
  }, [usuario, router])

  return null
}
