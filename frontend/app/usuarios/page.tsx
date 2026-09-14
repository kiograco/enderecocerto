"use client"

import { CabecalhoAutenticado } from "@/features/auth/components/CabecalhoAutenticado"
import { RotaProtegida } from "@/features/auth/components/RotaProtegida"
import { ListaUsuarios } from "@/features/usuarios/components/ListaUsuarios"

export default function UsuariosPage() {
  return (
    <RotaProtegida apenasAdmin>
      <div className="min-h-screen bg-muted/20">
        <CabecalhoAutenticado />
        <main className="mx-auto max-w-6xl px-5 py-8">
          <ListaUsuarios />
        </main>
      </div>
    </RotaProtegida>
  )
}
