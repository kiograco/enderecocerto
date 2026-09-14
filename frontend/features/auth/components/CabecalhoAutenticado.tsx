"use client"

import { useRouter } from "next/navigation"
import { LogOut, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "../auth-context"

export function CabecalhoAutenticado() {
  const { usuario, sair } = useAuth()
  const router = useRouter()

  function handleLogout() {
    sair()
    toast("Sessão encerrada com segurança.")
    router.replace("/login")
  }

  return (
    <header className="border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <button
          onClick={() => router.push(usuario?.tipo === "ADMIN" ? "/usuarios" : `/usuarios/${usuario?.id}`)}
          aria-label="Ir para o início"
          className="flex items-center gap-2"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MapPin className="size-5" />
          </div>
          <span className="font-semibold tracking-tight">
            Endereco<span className="text-primary">Certo</span>
          </span>
        </button>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
