"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CpfInput } from "@/components/cpf-input"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAuth } from "../auth-context"

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="size-5" />
      </div>
      <span className="font-semibold tracking-tight">
        Endereco<span className="text-primary">Certo</span>
      </span>
    </div>
  )
}

export function FormularioLogin() {
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [enviando, setEnviando] = useState(false)
  const { entrar } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      const usuarioAutenticado = await entrar({ cpf, senha })
      toast.success("Login realizado com sucesso!")
      router.replace(usuarioAutenticado.tipo === "ADMIN" ? "/usuarios" : `/usuarios/${usuarioAutenticado.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "CPF ou senha invalidos"))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div className="max-w-md">
          <Logo />
          <p className="mt-16 text-sm font-medium text-primary">A organização começa pelo endereço certo.</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Seus endereços, <span className="text-primary">sempre no lugar.</span>
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            Cadastre, organize e encontre seus endereços com simplicidade.
          </p>
        </div>
        <Card className="w-full max-w-md shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle>Boas-vindas de volta</CardTitle>
            <CardDescription>Entre na sua conta para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-cpf">CPF</Label>
                <CpfInput id="login-cpf" value={cpf} onChange={setCpf} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="login-senha">Senha</Label>
                <Input
                  id="login-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={enviando}>
                {enviando ? "Entrando..." : "Entrar"} <ArrowRight data-icon="inline-end" />
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/cadastro")}>
                Ainda não tenho uma conta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
