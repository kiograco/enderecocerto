"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Search, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useUsuarios } from "../usuario-queries"

export function ListaUsuarios() {
  const { data: usuarios, isLoading, isError, error } = useUsuarios()
  const [busca, setBusca] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (isError) toast.error(getApiErrorMessage(error, "Não foi possível carregar os usuários"))
  }, [isError, error])

  const filtrados = useMemo(() => {
    if (!usuarios) return []
    const termo = busca.toLowerCase()
    return usuarios.filter((u) => u.nome.toLowerCase().includes(termo) || u.cpf.includes(busca.replace(/\D/g, "")))
  }, [usuarios, busca])

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Badge variant="secondary" className="mb-3">
            <Sparkles data-icon="inline-start" /> Painel administrativo
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Pessoas cadastradas</h1>
          <p className="mt-2 text-muted-foreground">Gerencie usuários e seus endereços em um só lugar.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" /> {usuarios?.length ?? 0} usuários cadastrados
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              aria-label="Buscar usuários"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[76px] rounded-2xl" />)}

        {!isLoading &&
          filtrados.map((u) => (
            <button
              key={u.id}
              onClick={() => router.push(`/usuarios/${u.id}`)}
              className="flex items-center justify-between rounded-2xl border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {u.nome
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.nome}</p>
                  <p className="text-sm text-muted-foreground">{formatarCpf(u.cpf)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {u.tipo === "ADMIN" && <Badge variant="outline">Admin</Badge>}
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          ))}

        {!isLoading && filtrados.length === 0 && (
          <Empty className="rounded-2xl border bg-card py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>Nenhum usuário encontrado</EmptyTitle>
              <EmptyDescription>Tente buscar por outro nome ou CPF.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  )
}

function formatarCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}
