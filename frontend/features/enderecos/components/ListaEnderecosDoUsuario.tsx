"use client"

import { useEffect, useState } from "react"
import { Home, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { excluirEndereco, listarEnderecosDoUsuario, atualizarEndereco } from "../endereco-service"
import type { Endereco } from "../types"
import { EnderecoCard } from "./EnderecoCard"
import { FormularioEndereco } from "./FormularioEndereco"

type Modo = { tipo: "lista" } | { tipo: "novo" } | { tipo: "editar"; endereco: Endereco }

export function ListaEnderecosDoUsuario({ usuarioId }: { usuarioId: number }) {
  const [enderecos, setEnderecos] = useState<Endereco[] | null>(null)
  const [modo, setModo] = useState<Modo>({ tipo: "lista" })
  const [enderecoParaExcluir, setEnderecoParaExcluir] = useState<Endereco | null>(null)

  async function recarregar() {
    try {
      setEnderecos(await listarEnderecosDoUsuario(usuarioId))
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível carregar os endereços"))
    }
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId])

  async function handleTornarPrincipal(endereco: Endereco) {
    try {
      await atualizarEndereco(usuarioId, endereco.id, { ...endereco, principal: true })
      toast.success("Endereço principal atualizado.")
      recarregar()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o endereço principal"))
    }
  }

  async function handleExcluir() {
    if (!enderecoParaExcluir) return
    try {
      await excluirEndereco(usuarioId, enderecoParaExcluir.id)
      toast.success("Endereço excluído.")
      setEnderecoParaExcluir(null)
      recarregar()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir o endereço"))
    }
  }

  if (modo.tipo === "novo" || modo.tipo === "editar") {
    return (
      <FormularioEndereco
        usuarioId={usuarioId}
        enderecoExistente={modo.tipo === "editar" ? modo.endereco : null}
        marcarComoPrincipalPorPadrao={(enderecos?.length ?? 0) === 0}
        onCancelar={() => setModo({ tipo: "lista" })}
        onSalvar={() => {
          setModo({ tipo: "lista" })
          recarregar()
        }}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Endereços salvos</h2>
          {enderecos && enderecos.length > 0 && (
            <Button onClick={() => setModo({ tipo: "novo" })}>
              <Plus data-icon="inline-start" /> Novo endereço
            </Button>
          )}
        </div>

        {enderecos === null && (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        )}

        {enderecos !== null && enderecos.length === 0 && (
          <Empty className="rounded-2xl border bg-card py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Home />
              </EmptyMedia>
              <EmptyTitle>Este usuário ainda não tem endereços</EmptyTitle>
              <EmptyDescription>Adicione o primeiro endereço para começar.</EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setModo({ tipo: "novo" })}>
              <Plus data-icon="inline-start" /> Adicionar endereço
            </Button>
          </Empty>
        )}

        {enderecos !== null && enderecos.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {enderecos.map((endereco) => (
              <EnderecoCard
                key={endereco.id}
                endereco={endereco}
                onEditar={() => setModo({ tipo: "editar", endereco })}
                onTornarPrincipal={() => handleTornarPrincipal(endereco)}
                onExcluir={() => setEnderecoParaExcluir(endereco)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={enderecoParaExcluir !== null} onOpenChange={(open) => !open && setEnderecoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este endereço?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O endereço será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir}>Excluir endereço</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
