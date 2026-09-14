"use client"

import { Check, MapPin, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Endereco } from "../types"

export function EnderecoCard({
  endereco,
  onEditar,
  onTornarPrincipal,
  onExcluir,
}: {
  endereco: Endereco
  onEditar: () => void
  onTornarPrincipal: () => void
  onExcluir: () => void
}) {
  return (
    <Card className={endereco.principal ? "border-primary/60 bg-primary/[0.04] shadow-md shadow-primary/5" : ""}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              {endereco.logradouro}, {endereco.numero}
            </CardTitle>
            {endereco.principal && (
              <Badge>
                <Check data-icon="inline-start" /> Principal
              </Badge>
            )}
          </div>
          <CardDescription className="mt-2">
            {endereco.complemento ? `${endereco.complemento} · ` : ""}
            {endereco.bairro}
            <br />
            {endereco.cidade}/{endereco.estado}
            <br />
            CEP {formatarCep(endereco.cep)}
          </CardDescription>
        </div>
        <MapPin className="size-5 text-primary" />
      </CardHeader>
      <CardContent className="flex gap-2 pt-0">
        <Button size="sm" variant="outline" onClick={onEditar}>
          <Pencil data-icon="inline-start" /> Editar
        </Button>
        {!endereco.principal && (
          <Button size="sm" variant="ghost" onClick={onTornarPrincipal}>
            Tornar principal
          </Button>
        )}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={onExcluir} aria-label="Excluir endereço">
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  )
}

function formatarCep(cep: string): string {
  return cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep
}
