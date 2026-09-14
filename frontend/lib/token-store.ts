// Guarda o JWT em memoria (nunca em localStorage, pra evitar exfiltracao via XSS).
// Modulo simples fora da arvore React porque o interceptor do Axios roda fora
// do ciclo de render -- o AuthProvider mantem seu proprio estado React em
// paralelo pra re-renderizar a UI, e escreve aqui toda vez que o token muda.
let tokenAtual: string | null = null

export function getToken(): string | null {
  return tokenAtual
}

export function setToken(token: string | null): void {
  tokenAtual = token
}
