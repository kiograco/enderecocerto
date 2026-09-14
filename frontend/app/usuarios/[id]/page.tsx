"use client"

import { use } from "react"
import { CabecalhoAutenticado } from "@/features/auth/components/CabecalhoAutenticado"
import { RotaProtegida } from "@/features/auth/components/RotaProtegida"
import { DetalheUsuario } from "@/features/usuarios/components/DetalheUsuario"

export default function UsuarioDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <RotaProtegida>
      <div className="min-h-screen bg-muted/20">
        <CabecalhoAutenticado />
        <main className="mx-auto max-w-6xl px-5 py-8">
          <DetalheUsuario usuarioId={Number(id)} />
        </main>
      </div>
    </RotaProtegida>
  )
}
