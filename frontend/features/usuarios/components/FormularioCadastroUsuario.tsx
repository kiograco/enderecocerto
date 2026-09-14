"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CpfInput } from "@/components/cpf-input"
import { getApiErrorMessage } from "@/lib/api-error"
import { criarUsuario } from "../usuario-service"
import { cpfValido } from "../validar-cpf"

export function FormularioCadastroUsuario() {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [enviando, setEnviando] = useState(false)
  const router = useRouter()

  const cpfDigitado = cpf.replace(/\D/g, "").length === 11
  const cpfEhValido = cpfDigitado && cpfValido(cpf)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!cpfEhValido) {
      toast.error("CPF invalido")
      return
    }
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem")
      return
    }

    setEnviando(true)
    try {
      await criarUsuario({ nome, cpf: cpf.replace(/\D/g, ""), dataNascimento, senha })
      toast.success("Conta criada! Faça login para continuar.")
      router.replace("/login")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível criar sua conta"))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-8">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mb-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para login
        </button>
        <Card className="shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Crie sua conta</CardTitle>
            <CardDescription>Leva menos de dois minutos para começar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como podemos chamar você?"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cadastro-cpf">CPF</Label>
                <div className="relative">
                  <CpfInput id="cadastro-cpf" value={cpf} onChange={setCpf} />
                  {cpfEhValido && <CheckCircle2 className="absolute right-3 top-2.5 size-5 text-primary" />}
                </div>
                {cpfDigitado && !cpfEhValido && <span className="text-xs text-destructive">CPF invalido</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="data-nascimento">Data de nascimento</Label>
                <Input
                  id="data-nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Crie uma senha forte"
                  minLength={6}
                  required
                />
                <span className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</span>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmar-senha">Confirme sua senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita sua senha"
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={enviando}>
                {enviando ? "Criando conta..." : "Criar minha conta"} <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
