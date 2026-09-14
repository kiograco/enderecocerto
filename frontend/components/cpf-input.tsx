"use client"

import { Input } from "@/components/ui/input"

function aplicarMascaraCpf(valor: string): string {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export function CpfInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (valor: string) => void
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(aplicarMascaraCpf(e.target.value))}
      placeholder="000.000.000-00"
      inputMode="numeric"
      autoComplete="off"
    />
  )
}
