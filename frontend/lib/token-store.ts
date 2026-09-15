// Guarda o JWT em memoria e no localStorage. Modulo simples fora da arvore
// React porque o interceptor do Axios roda fora do ciclo de render -- o
// AuthProvider mantem seu proprio estado React em paralelo pra re-renderizar
// a UI, e escreve aqui toda vez que o token muda. Persistimos no
// localStorage pra sobreviver a um refresh de pagina; a troca aceita o risco
// de exfiltracao via XSS em favor de nao derrubar a sessao do usuario.
const CHAVE_STORAGE = "enderecocerto:token"

function lerTokenPersistido(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(CHAVE_STORAGE)
  } catch {
    return null
  }
}

let tokenAtual: string | null = lerTokenPersistido()

export function getToken(): string | null {
  return tokenAtual
}

export function setToken(token: string | null): void {
  tokenAtual = token
  if (typeof window === "undefined") return
  try {
    if (token) {
      window.localStorage.setItem(CHAVE_STORAGE, token)
    } else {
      window.localStorage.removeItem(CHAVE_STORAGE)
    }
  } catch {
    // localStorage indisponivel (modo privado, cota etc.) -- sessao dura so a aba atual
  }
}
