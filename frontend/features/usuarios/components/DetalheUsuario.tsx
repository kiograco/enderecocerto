"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ListaEnderecosDoUsuario } from "@/features/enderecos/components/ListaEnderecosDoUsuario"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAuth } from "@/features/auth/auth-context"
import { useUsuario } from "../usuario-queries"

export function DetalheUsuario({ usuarioId }: { usuarioId: number }) {
  const { data: usuario, isError, error } = useUsuario(usuarioId)
  const { usuario: logado } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isError) {
      toast.error(getApiErrorMessage(error, "Não foi possível carregar este usuário"))
      router.replace(logado?.tipo === "ADMIN" ? "/usuarios" : `/usuarios/${logado?.id}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError])

  return (
    <>
      {logado?.tipo === "ADMIN" && (
        <button
          onClick={() => router.push("/usuarios")}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para usuários
        </button>
      )}

      {!usuario && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24" />
        </div>
      )}

      {usuario && (
        <>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-primary">Perfil do usuário</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{usuario.nome}</h1>
              <p className="mt-2 text-muted-foreground">
                CPF {formatarCpf(usuario.cpf)} · Nascido em {formatarData(usuario.dataNascimento)}
              </p>
            </div>
          </div>
          <div className="my-8 border-t" />
          <ListaEnderecosDoUsuario usuarioId={usuario.id} />
        </>
      )}
    </>
  )
}

function formatarCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-")
  return `${dia}/${mes}/${ano}`
}
