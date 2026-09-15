"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { getApiErrorMessage } from "@/lib/api-error"
import { consultarCep } from "../cep-service"
import { criarEndereco, atualizarEndereco } from "../endereco-service"
import type { Endereco } from "../types"

function aplicarMascaraCep(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8)
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos
}

export function FormularioEndereco({
  usuarioId,
  enderecoExistente,
  marcarComoPrincipalPorPadrao,
  onSalvar,
  onCancelar,
}: {
  usuarioId: number
  enderecoExistente: Endereco | null
  marcarComoPrincipalPorPadrao: boolean
  onSalvar: (endereco: Endereco) => void
  onCancelar: () => void
}) {
  const [cep, setCep] = useState(enderecoExistente ? formatarCepExibicao(enderecoExistente.cep) : "")
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [cepEncontrado, setCepEncontrado] = useState(Boolean(enderecoExistente))
  const [logradouro, setLogradouro] = useState(enderecoExistente?.logradouro ?? "")
  const [numero, setNumero] = useState(enderecoExistente?.numero ?? "")
  const [complemento, setComplemento] = useState(enderecoExistente?.complemento ?? "")
  const [bairro, setBairro] = useState(enderecoExistente?.bairro ?? "")
  const [cidade, setCidade] = useState(enderecoExistente?.cidade ?? "")
  const [estado, setEstado] = useState(enderecoExistente?.estado ?? "")
  const [principal, setPrincipal] = useState(enderecoExistente?.principal ?? marcarComoPrincipalPorPadrao)
  const [salvando, setSalvando] = useState(false)

  // Busca automatica com debounce quando o CEP fica completo (8 digitos) --
  // atende "ao perder o foco (ou debounce)" do roteiro sem depender de blur.
  useEffect(() => {
    const digitos = cep.replace(/\D/g, "")
    if (digitos.length !== 8) return

    const timer = setTimeout(async () => {
      setBuscandoCep(true)
      try {
        const resultado = await consultarCep(digitos)
        setLogradouro(resultado.logradouro)
        setBairro(resultado.bairro)
        setCidade(resultado.cidade)
        setEstado(resultado.estado)
        setCepEncontrado(true)
        toast.success("Endereço encontrado pelo CEP!")
      } catch (error) {
        setCepEncontrado(false)
        toast.error(getApiErrorMessage(error, "CEP não encontrado"))
      } finally {
        setBuscandoCep(false)
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      const request = {
        cep: cep.replace(/\D/g, ""),
        numero,
        complemento: complemento || null,
        logradouro,
        bairro,
        cidade,
        estado,
        principal,
      }
      const endereco = enderecoExistente
        ? await atualizarEndereco(usuarioId, enderecoExistente.id, request)
        : await criarEndereco(usuarioId, request)
      toast.success(enderecoExistente ? "Endereço atualizado." : "Endereço adicionado.")
      onSalvar(endereco)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar o endereço"))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={onCancelar}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para endereços
      </button>
      <div>
        <p className="text-sm font-medium text-primary">{enderecoExistente ? "Editar endereço" : "Novo endereço"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Onde fica esse endereço?</h1>
        <p className="mt-2 text-muted-foreground">Comece pelo CEP e deixe o EnderecoCerto preencher o resto.</p>
      </div>
      <Card className="mt-8">
        <CardContent className="p-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => {
                    setCep(aplicarMascaraCep(e.target.value))
                    setCepEncontrado(false)
                  }}
                  placeholder="00000-000"
                  className="text-lg"
                  inputMode="numeric"
                  required
                />
                {buscandoCep && <Skeleton className="absolute right-3 top-2.5 size-5 rounded-full" />}
                {!buscandoCep && cepEncontrado && (
                  <CheckCircle2 className="absolute right-3 top-2.5 size-5 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">Digite os 8 números para buscar automaticamente.</span>
            </div>

            {buscandoCep ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-5 sm:grid-cols-2"
              >
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Rua, avenida..."
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={complemento ?? ""}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apto, bloco... (opcional)"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <Input
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    maxLength={2}
                    required
                  />
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="principal">Endereço principal</Label>
                <p className="text-xs text-muted-foreground">Substitui o principal atual, se houver.</p>
              </div>
              <Switch id="principal" checked={principal} onCheckedChange={setPrincipal} />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="sm:w-auto" onClick={onCancelar}>
                Cancelar
              </Button>
              <Button type="submit" className="sm:w-auto" disabled={buscandoCep || salvando}>
                {salvando ? "Salvando..." : "Salvar endereço"} <Check data-icon="inline-end" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function formatarCepExibicao(cep: string): string {
  return cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep
}
