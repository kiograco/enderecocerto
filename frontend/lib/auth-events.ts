// Ponte entre o interceptor do Axios (fora da arvore React) e o AuthProvider:
// o interceptor avisa aqui quando uma resposta 401 chega pra uma requisicao
// que ja tinha token (ou seja, a sessao expirou/ficou invalida), e o
// AuthProvider registra um listener pra limpar o estado e redirecionar.
type Listener = () => void

let listener: Listener | null = null

export function registrarListenerSessaoExpirada(fn: Listener | null): void {
  listener = fn
}

export function notificarSessaoExpirada(): void {
  listener?.()
}
